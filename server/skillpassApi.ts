import { randomBytes } from "node:crypto";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { skillpassAppState } from "../drizzle/schema";
import {
  makeId,
  publicWorkerId,
  projectState,
  reduceState,
  resolvePublicWorkerId,
  seedState,
  type DemoActor,
  type Role,
  type SkillPassAction,
  type SkillPassState,
} from "../shared/skillpass";
import { getDb } from "./db";
import { ENV } from "./_core/env";

const roles: Role[] = ["worker", "employer", "partner"];
const supportedActionTypes = new Set<string>([
  "profile.save",
  "skill.add",
  "skill.submit",
  "skill.review",
  "training.add",
  "work.add",
  "worker.view",
  "job.save",
  "access.request",
  "access.resolve",
  "access.revoke",
  "feedback.add",
  "notification.read",
]);
const tokenKey = new TextEncoder().encode(
  ENV.cookieSecret ||
    process.env.SKILLPASS_DEMO_SECRET ||
    randomBytes(32).toString("hex")
);
let memoryState: SkillPassState | undefined;

type Persistence = "managed database" | "session-only demo fallback";
async function loadState(): Promise<{
  state: SkillPassState;
  persistence: Persistence;
}> {
  try {
    const db = await getDb();
    if (!db)
      return {
        state: (memoryState ??= seedState()),
        persistence: "session-only demo fallback",
      };
    const rows = await db
      .select()
      .from(skillpassAppState)
      .where(eq(skillpassAppState.id, "demo"))
      .limit(1);
    if (rows[0]) {
      memoryState = rows[0].payload;
      return { state: rows[0].payload, persistence: "managed database" };
    }
    const initial = seedState();
    try {
      await db
        .insert(skillpassAppState)
        .values({ id: "demo", payload: initial });
    } catch {
      const raced = await db
        .select()
        .from(skillpassAppState)
        .where(eq(skillpassAppState.id, "demo"))
        .limit(1);
      if (raced[0]) {
        memoryState = raced[0].payload;
        return { state: raced[0].payload, persistence: "managed database" };
      }
      throw new Error("Could not initialize SkillPass demo data");
    }
    memoryState = initial;
    return { state: initial, persistence: "managed database" };
  } catch (error) {
    console.error(
      "[SkillPass] Database read unavailable; using session-only demo fallback:",
      error
    );
    return {
      state: (memoryState ??= seedState()),
      persistence: "session-only demo fallback",
    };
  }
}
async function saveState(state: SkillPassState): Promise<Persistence> {
  memoryState = state;
  try {
    const db = await getDb();
    if (!db) return "session-only demo fallback";
    await db
      .update(skillpassAppState)
      .set({ payload: state })
      .where(eq(skillpassAppState.id, "demo"));
    return "managed database";
  } catch (error) {
    console.error(
      "[SkillPass] Database write unavailable; keeping this session's demo state:",
      error
    );
    return "session-only demo fallback";
  }
}
function safeActor(payload: Record<string, unknown>): DemoActor | null {
  if (!roles.includes(payload.role as Role)) return null;
  const role = payload.role as Role;
  if (role === "worker" && typeof payload.workerId !== "string") return null;
  if (role === "employer" && typeof payload.employerId !== "string")
    return null;
  return {
    role,
    name: typeof payload.name === "string" ? payload.name : "Demo user",
    workerId:
      typeof payload.workerId === "string" ? payload.workerId : undefined,
    employerId:
      typeof payload.employerId === "string" ? payload.employerId : undefined,
  };
}
async function actorFromRequest(req: Request): Promise<DemoActor | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), tokenKey, {
      algorithms: ["HS256"],
    });
    return safeActor(payload as Record<string, unknown>);
  } catch {
    return null;
  }
}
function jsonError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}
function resolveEmployerAction(
  action: SkillPassAction,
  state: SkillPassState
): SkillPassAction {
  if (action.type === "worker.view") {
    const workerId = resolvePublicWorkerId(action.workerId, state.workers);
    if (!workerId) throw new Error("Unknown employer candidate handle.");
    return { ...action, workerId };
  }
  if (action.type === "access.request") {
    if (!action.request || typeof action.request !== "object")
      throw new Error("Passport request details are required.");
    const workerId = resolvePublicWorkerId(
      action.request.workerId,
      state.workers
    );
    if (!workerId) throw new Error("Unknown employer candidate handle.");
    return { ...action, request: { ...action.request, workerId } };
  }
  if (action.type === "feedback.add") {
    if (!action.record || typeof action.record !== "object")
      throw new Error("Feedback details are required.");
    const workerId = resolvePublicWorkerId(
      action.record.workerId,
      state.workers
    );
    if (!workerId) throw new Error("Unknown employer candidate handle.");
    return { ...action, record: { ...action.record, workerId } };
  }
  return action;
}

export function registerSkillPassRoutes(app: Express) {
  app.post("/api/skillpass/session", async (req, res) => {
    const role = req.body?.role as Role;
    if (!roles.includes(role))
      return jsonError(res, 400, "Choose a valid demo role.");
    const { state } = await loadState();
    let actor: DemoActor;
    if (role === "worker") {
      const requested =
        typeof req.body?.workerId === "string"
          ? req.body.workerId
          : "worker-ravi";
      const workerId =
        requested === "worker-new" ||
        state.workers.some(w => w.id === requested)
          ? requested
          : "worker-ravi";
      const worker = state.workers.find(w => w.id === workerId);
      actor = { role, workerId, name: worker?.name ?? "New demo worker" };
    } else if (role === "employer") {
      const employerId = state.employers.some(
        e => e.id === req.body?.employerId
      )
        ? req.body.employerId
        : "employer-ches";
      actor = {
        role,
        employerId,
        name:
          state.employers.find(e => e.id === employerId)?.name ??
          "Demo employer",
      };
    } else actor = { role, name: "SkillPass Demo Partner" };
    const token = await new SignJWT({
      role: actor.role,
      workerId: actor.workerId,
      employerId: actor.employerId,
      name: actor.name,
      demo: true,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("12h")
      .sign(tokenKey);
    res.set("Cache-Control", "no-store").json({ token, actor, mode: "demo" });
  });

  app.get("/api/skillpass/state", async (req, res) => {
    const actor = await actorFromRequest(req);
    if (!actor)
      return jsonError(
        res,
        401,
        "Your demo session has expired. Choose a demo role again."
      );
    const { state, persistence } = await loadState();
    const view = projectState(state, actor);
    const matches =
      actor.role === "employer"
        ? state.jobs
            .filter(
              j => j.status === "Open" && j.employerId === actor.employerId
            )
            .map(job => ({
              jobId: job.id,
              candidates: state.workers
                .map(worker => ({
                  workerId: publicWorkerId(worker.id),
                  ...requireMatch(worker, job, state),
                }))
                .sort((a, b) => b.score - a.score),
            }))
        : undefined;
    res
      .set("Cache-Control", "no-store")
      .json({ state: view, persistence, matches });
  });

  app.post("/api/skillpass/action", async (req, res) => {
    const actor = await actorFromRequest(req);
    if (!actor)
      return jsonError(
        res,
        401,
        "Your demo session has expired. Choose a demo role again."
      );
    const action = req.body?.action as SkillPassAction | undefined;
    if (
      !action ||
      typeof action !== "object" ||
      Array.isArray(action) ||
      typeof action.type !== "string" ||
      !supportedActionTypes.has(action.type)
    )
      return jsonError(res, 400, "Choose a supported SkillPass action.");
    const { state } = await loadState();
    try {
      const normalizedAction =
        actor.role === "employer"
          ? resolveEmployerAction(action, state)
          : action;
      const updated = reduceState(state, actor, normalizedAction);
      const persistence = await saveState(updated);
      const view = projectState(updated, actor);
      const matches =
        actor.role === "employer"
          ? updated.jobs
              .filter(
                j => j.status === "Open" && j.employerId === actor.employerId
              )
              .map(job => ({
                jobId: job.id,
                candidates: updated.workers
                  .map(worker => ({
                    workerId: publicWorkerId(worker.id),
                    ...requireMatch(worker, job, updated),
                  }))
                  .sort((a, b) => b.score - a.score),
              }))
          : undefined;
      res
        .set("Cache-Control", "no-store")
        .json({ state: view, persistence, matches });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to apply this action.";
      jsonError(
        res,
        message.startsWith("Only") || message.startsWith("You can") ? 403 : 400,
        message
      );
    }
  });
}

function requireMatch(
  worker: SkillPassState["workers"][number],
  job: SkillPassState["jobs"][number],
  state: SkillPassState
) {
  const trade =
    worker.trade.toLowerCase() === job.trade.toLowerCase() ? 100 : 0;
  const owned = state.skills
    .filter(s => s.workerId === worker.id && s.status === "Verified")
    .map(s => s.name.toLowerCase());
  const skills = job.requiredSkills.length
    ? (job.requiredSkills.filter(s => owned.includes(s.toLowerCase())).length /
        job.requiredSkills.length) *
      100
    : 100;
  const experience =
    job.minExperience === 0
      ? 100
      : Math.min(100, (worker.yearsExperience / job.minExperience) * 100);
  const location =
    worker.city.toLowerCase() === job.city.toLowerCase()
      ? 100
      : worker.state.toLowerCase() === job.state.toLowerCase()
        ? 50
        : 0;
  const score = Math.round(
    trade * 0.35 + skills * 0.35 + experience * 0.2 + location * 0.1
  );
  return {
    score,
    trade: Math.round(trade),
    skills: Math.round(skills),
    experience: Math.round(experience),
    location: Math.round(location),
    explanation: `${trade === 100 ? "Trade matches" : "Trade differs"}; ${Math.round(skills)}% of required skills verified; ${Math.round(experience)}% experience fit against this listing; ${location === 100 ? "same city" : location === 50 ? "same state" : "different state"}.`,
  };
}
