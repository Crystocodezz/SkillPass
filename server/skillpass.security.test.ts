import { describe, expect, it } from "vitest";
import {
  projectState,
  publicWorkerId,
  reduceState,
  resolvePublicWorkerId,
  seedState,
  SHARE_FIELDS,
  type DemoActor,
  type FeedbackRecord,
  type Job,
  type TrainingRecord,
  type WorkRecord,
} from "../shared/skillpass";

function demoEmployer(state = seedState()): DemoActor {
  return {
    role: "employer",
    employerId: state.employers[0]!.id,
    name: state.employers[0]!.name,
  };
}

function demoWorker(): DemoActor {
  return { role: "worker", workerId: "worker-ravi", name: "Ravi Kumar" };
}

function trainingRecord(
  overrides: Partial<TrainingRecord> = {}
): TrainingRecord {
  return {
    id: "training-new",
    workerId: "worker-ravi",
    title: "Electrical safety basics",
    provider: "Chennai Skills Centre",
    date: "2026-09",
    status: "Demo record",
    ...overrides,
  };
}

function workRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
  return {
    id: "work-new",
    workerId: "worker-ravi",
    employer: "Harbor View Apartments",
    title: "Electrical maintenance support",
    city: "Chennai",
    date: "2026-09",
    completed: true,
    ...overrides,
  };
}

function feedbackRecord(
  overrides: Partial<FeedbackRecord> = {}
): FeedbackRecord {
  return {
    id: "feedback-new",
    workerId: "worker-ravi",
    employerId: "employer-ches",
    score: 5,
    comment: "Careful work and clear handover.",
    date: "2026-09",
    ...overrides,
  };
}

function jobRecord(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-new",
    employerId: "employer-ches",
    title: "Residential electrician",
    trade: "Electrician",
    city: "Chennai",
    state: "Tamil Nadu",
    minExperience: 1,
    requiredSkills: ["Electrical wiring"],
    description: "Fictional Chennai demo role.",
    status: "Open",
    createdAt: "client-controlled-time",
    ...overrides,
  };
}

describe("SkillPass consent authorization and privacy projection", () => {
  it("does not accept an employer-supplied approval or share-field grant", () => {
    const state = seedState();
    const employer = demoEmployer(state);
    const meena = state.workers.find(worker => worker.id === "worker-meena")!;

    const updated = reduceState(state, employer, {
      type: "access.request",
      request: {
        id: "access-forged-approval",
        workerId: meena.id,
        employerId: employer.employerId!,
        status: "Approved",
        fields: SHARE_FIELDS,
        decidedBy: meena.id,
        createdAt: "attacker-controlled",
        updatedAt: "attacker-controlled",
      },
    });

    const request = updated.accessRequests.find(
      item => item.id === "access-forged-approval"
    );
    expect(request).toMatchObject({
      status: "Pending",
      fields: [],
      decidedBy: undefined,
    });
    expect(request?.createdAt).not.toBe("attacker-controlled");

    const employerView = projectState(updated, employer);
    const candidate = employerView.workers.find(
      worker => worker.id === publicWorkerId(meena.id)
    );
    expect(candidate?.name).not.toBe(meena.name);
    expect(candidate?.yearsExperience).toBe(0);
    expect(
      employerView.skills.some(
        skill => skill.workerId === publicWorkerId(meena.id)
      )
    ).toBe(false);
    expect(
      employerView.training.some(
        record => record.workerId === publicWorkerId(meena.id)
      )
    ).toBe(false);
    expect(
      employerView.workHistory.some(
        record => record.workerId === publicWorkerId(meena.id)
      )
    ).toBe(false);
    expect(
      employerView.accessRequests.find(item => item.id === request?.id)
        ?.decidedBy
    ).toBeUndefined();
  });

  it("does not treat an old approval without a worker decision as consent", () => {
    const state = seedState();
    const employer = demoEmployer(state);
    const legacyRequest = state.accessRequests.find(
      request => request.workerId === "worker-ravi"
    )!;
    legacyRequest.status = "Approved";
    legacyRequest.fields = SHARE_FIELDS;
    legacyRequest.decidedBy = undefined;

    const employerView = projectState(state, employer);
    const displayedRequest = employerView.accessRequests.find(
      request => request.id === legacyRequest.id
    );
    const candidate = employerView.workers.find(
      worker => worker.id === publicWorkerId("worker-ravi")
    );
    expect(displayedRequest).toMatchObject({ status: "Pending", fields: [] });
    expect(candidate?.name).not.toBe("Ravi Kumar");
    expect(
      employerView.skills.some(
        skill => skill.workerId === publicWorkerId("worker-ravi")
      )
    ).toBe(false);

    const workerView = projectState(state, {
      role: "worker",
      workerId: "worker-ravi",
      name: "Ravi Kumar",
    });
    expect(workerView.accessRequests[0]).toMatchObject({
      status: "Pending",
      fields: [],
    });
  });

  it("shares only worker-approved fields, hides internal decision IDs, and removes access on revocation", () => {
    let state = seedState();
    const employer = demoEmployer(state);
    const ravi = state.workers.find(worker => worker.id === "worker-ravi")!;
    const worker: DemoActor = {
      role: "worker",
      workerId: ravi.id,
      name: ravi.name,
    };
    state = reduceState(state, worker, {
      type: "access.resolve",
      requestId: "access-1",
      status: "Approved",
      fields: ["nameTrade", "verifiedSkills"],
    });

    let employerView = projectState(state, employer);
    const candidateId = publicWorkerId(ravi.id);
    const candidate = employerView.workers.find(
      item => item.id === candidateId
    );
    expect(candidate?.name).toBe(ravi.name);
    expect(candidate?.yearsExperience).toBe(0);
    expect(employerView.accessRequests[0]?.workerId).toBe(candidateId);
    expect(employerView.accessRequests[0]?.decidedBy).toBeUndefined();
    expect(
      employerView.skills.every(skill => skill.workerId === candidateId)
    ).toBe(true);
    expect(employerView.training).toHaveLength(0);
    expect(employerView.workHistory).toHaveLength(0);
    expect(employerView.feedback).toHaveLength(0);

    state = reduceState(state, worker, {
      type: "access.revoke",
      requestId: "access-1",
    });
    employerView = projectState(state, employer);
    const revokedCandidate = employerView.workers.find(
      item => item.id === candidateId
    );
    expect(revokedCandidate?.name).not.toBe(ravi.name);
    expect(revokedCandidate?.yearsExperience).toBe(0);
    expect(employerView.skills).toHaveLength(0);
  });

  it("resolves only opaque employer candidate handles, not raw internal worker IDs", () => {
    const state = seedState();
    const candidateId = publicWorkerId("worker-meena");
    expect(resolvePublicWorkerId(candidateId, state.workers)).toBe(
      "worker-meena"
    );
    expect(
      resolvePublicWorkerId("worker-meena", state.workers)
    ).toBeUndefined();
  });
});

describe("SkillPass mutation input validation", () => {
  it("rejects blank or duplicate training IDs, invalid dates and unsupported statuses", () => {
    const state = seedState();
    for (const record of [
      trainingRecord({ id: "" }),
      trainingRecord({ id: "training-1" }),
      trainingRecord({ date: "2026-13" }),
      trainingRecord({ date: "not-a-date" }),
      trainingRecord({ status: "Verified" }),
    ]) {
      expect(() =>
        reduceState(state, demoWorker(), { type: "training.add", record })
      ).toThrow();
    }
    expect(state.training).toHaveLength(5);
  });

  it("rejects blank or duplicate work IDs, malformed dates and invalid ratings", () => {
    const state = seedState();
    for (const record of [
      workRecord({ id: "" }),
      workRecord({ id: "work-1" }),
      workRecord({ date: "2025-00" }),
      workRecord({ date: "tomorrow" }),
      workRecord({ rating: 6 }),
      workRecord({ rating: 3.5 }),
    ]) {
      expect(() =>
        reduceState(state, demoWorker(), { type: "work.add", record })
      ).toThrow();
    }
    expect(state.workHistory).toHaveLength(8);
  });

  it("rejects invalid/duplicate feedback IDs, malformed dates and fractional scores", () => {
    const state = seedState();
    const employer = demoEmployer(state);
    for (const record of [
      feedbackRecord({ id: "" }),
      feedbackRecord({ id: "feedback-1" }),
      feedbackRecord({ date: "2026-14" }),
      feedbackRecord({ date: "unknown" }),
      feedbackRecord({ score: 5.5 }),
    ]) {
      expect(() =>
        reduceState(state, employer, { type: "feedback.add", record })
      ).toThrow();
    }
    expect(state.feedback).toHaveLength(2);
  });

  it("validates job IDs, state and unique skill requirements, and owns timestamps", () => {
    const state = seedState();
    const employer = demoEmployer(state);
    for (const job of [
      jobRecord({ id: "" }),
      jobRecord({ state: "   " }),
      jobRecord({
        requiredSkills: ["Electrical wiring", " electrical wiring "],
      }),
    ]) {
      expect(() =>
        reduceState(state, employer, { type: "job.save", job })
      ).toThrow();
    }
    const created = reduceState(state, employer, {
      type: "job.save",
      job: jobRecord(),
    });
    const saved = created.jobs.find(item => item.id === "job-new");
    expect(saved?.createdAt).not.toBe("client-controlled-time");
    expect(Number.isNaN(Date.parse(saved?.createdAt ?? ""))).toBe(false);

    const existing = created.jobs.find(item => item.id === "job-1")!;
    const updated = reduceState(state, employer, {
      type: "job.save",
      job: { ...existing, title: "Updated job", createdAt: "forged-time" },
    });
    expect(updated.jobs.find(item => item.id === "job-1")?.createdAt).toBe(
      existing.createdAt
    );
  });
});
