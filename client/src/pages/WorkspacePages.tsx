import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileBadge2,
  FileCheck2,
  FileText,
  Filter,
  MapPin,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
  X,
} from "lucide-react";
import {
  jobMatch,
  makeId,
  profileCompleteness,
  reputation,
  seedState,
  type AccessRequest,
  type Job,
  type Role,
  type ShareField,
  type SkillPassAction,
  type SkillRecord,
  type Worker,
  type VerificationStatus,
} from "@shared/skillpass";
import { useSkillPass } from "../contexts/SkillPassContext";

const trades = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "AC Technician",
  "Mechanic",
  "Construction Worker",
  "Delivery Worker",
  "Tailoring Professional",
  "Other",
];
const cities = ["Chennai", "Coimbatore", "Madurai", "Salem", "Bengaluru"];
const shareFields: { id: ShareField; label: string; description: string }[] = [
  {
    id: "nameTrade",
    label: "Name and trade",
    description: "Identify the worker and their primary trade.",
  },
  {
    id: "experience",
    label: "Experience",
    description: "Show years of work experience.",
  },
  {
    id: "verifiedSkills",
    label: "Verified skills",
    description: "Show skills reviewed in this demo.",
  },
  {
    id: "trainingRecords",
    label: "Training records",
    description: "Show selected training and certificate records.",
  },
  {
    id: "workHistory",
    label: "Selected work history",
    description: "Show completed work records and feedback.",
  },
  {
    id: "reputation",
    label: "Reputation summary",
    description: "Show a transparent, provisional score breakdown.",
  },
];
function Header({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}
function CardTitle({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-title">
      <div>
        <h2>{title}</h2>
        {detail && <span>{detail}</span>}
      </div>
      {action}
    </div>
  );
}
function Status({ value }: { value: string }) {
  const cls = value.toLowerCase().replaceAll(" ", "-").replaceAll("_", "-");
  return <span className={`status-chip status-${cls}`}>{value}</span>;
}
function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FileText size={19} />
      </div>
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Metric({
  label,
  value,
  detail,
  icon: Icon,
  to,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
  to: string;
}) {
  return (
    <Link to={to} className="metric-card">
      <div className="metric-head">
        <span>{label}</span>
        <Icon size={17} />
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Link>
  );
}
function ScoreRing({
  score,
  label = "reputation",
}: {
  score: number;
  label?: string;
}) {
  return (
    <div
      className="score-ring"
      style={{ "--score": `${score}%` } as React.CSSProperties}
    >
      <div>
        <strong>{score}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
function workerName(w?: Worker) {
  return w?.name || "New demo worker";
}
function workerById(id: string | undefined, workers: Worker[]) {
  return workers.find(w => w.id === id);
}
function toError(e: unknown) {
  return e instanceof Error
    ? e.message
    : "The change could not be saved. Please try again.";
}
function useDemoAction() {
  const { dispatch } = useSkillPass();
  return useCallback(
    async (action: SkillPassAction) => {
      try {
        return await dispatch(action);
      } catch (e) {
        return Promise.reject(new Error(toError(e)));
      }
    },
    [dispatch]
  );
}

export function WorkerDashboard() {
  const { actor, state } = useSkillPass();
  const worker = workerById(actor?.workerId, state.workers);
  const skills = state.skills.filter(s => s.workerId === actor?.workerId);
  const pending = skills.filter(s => s.status === "Pending").length;
  const complete = state.workHistory.filter(
    w => w.workerId === actor?.workerId && w.completed
  ).length;
  const score = worker ? reputation(worker, state) : null;
  const completeness = profileCompleteness(
    worker,
    skills,
    state.training,
    state.workHistory
  );
  const matches = worker
    ? state.jobs
        .filter(j => j.status === "Open")
        .map(j => ({ job: j, match: jobMatch(worker, j, state.skills) }))
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 3)
    : [];
  const recent = state.activity
    .filter(a => a.workerId === actor?.workerId)
    .slice(0, 4);
  return (
    <>
      <Header
        eyebrow="WORKER WORKSPACE"
        title={`Good morning, ${worker?.name.split(" ")[0] || "there"}.`}
        subtitle="Your work, skills and next opportunities—in one place."
        action={
          <Link className="btn btn-primary" to="/worker/passport">
            <FileBadge2 size={16} /> Open Skill Passport
          </Link>
        }
      />
      <div className="dashboard-intro">
        <div>
          <span className="demo-inline">
            <span /> LIVE DEMO PROFILE
          </span>
          <h2>{worker?.trade || "Profile not created yet"}</h2>
          <p>
            {worker
              ? `${worker.city}, ${worker.state} · ${worker.yearsExperience} years of experience`
              : "Add your trade, location and experience to start your SkillPass record."}
          </p>
        </div>
        <div className="completion-box">
          <span>PROFILE COMPLETENESS</span>
          <strong>{completeness}%</strong>
          <div className="progress-track">
            <i style={{ width: `${completeness}%` }} />
          </div>
          <Link to="/worker/profile">
            {worker ? "Complete your profile" : "Create your profile"}{" "}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <div className="metric-grid">
        <Metric
          label="Verified skills"
          value={skills.filter(s => s.status === "Verified").length}
          detail="Reviewed in demo"
          icon={BadgeCheck}
          to="/worker/verification"
        />
        <Metric
          label="Pending review"
          value={pending}
          detail="Skill requests in queue"
          icon={Clock3}
          to="/worker/verification"
        />
        <Metric
          label="Completed jobs"
          value={complete}
          detail="Work records marked complete"
          icon={BriefcaseBusiness}
          to="/worker/passport"
        />
        <Metric
          label="Reputation"
          value={score ? `${score.score}/100` : "Provisional"}
          detail={
            score?.provisional
              ? "Building from available evidence"
              : "Based on current records"
          }
          icon={Star}
          to="/worker/passport"
        />
      </div>
      <div className="dashboard-columns">
        <Card>
          <CardTitle
            title="Skill Passport status"
            detail="Updated from your profile and work records"
            action={
              <Link className="subtle-link" to="/worker/passport">
                View passport <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="passport-mini">
            <div className="mini-icon">
              <FileBadge2 size={20} />
            </div>
            <div className="mini-body">
              <strong>
                {worker
                  ? "Your passport is active"
                  : "Create your first passport"}
              </strong>
              <span>
                {worker
                  ? `${skills.length} skills · ${state.training.filter(t => t.workerId === worker.id).length} training records`
                  : "Your skill record starts with a profile."}
              </span>
            </div>
            <Status value={worker ? "Demo record" : "Not started"} />
          </div>
          <div className="skill-summary">
            {skills.slice(0, 3).map(s => (
              <div key={s.id}>
                <span>{s.name}</span>
                <Status value={s.status} />
              </div>
            ))}
          </div>
          <div className="panel-footer">
            <span>
              Last updated{" "}
              {worker
                ? new Date(
                    state.activity.find(a => a.workerId === worker.id)
                      ?.createdAt || worker.joinedAt
                  ).toLocaleDateString()
                : "—"}
            </span>
            <Link to="/worker/verification">
              Manage skills <ChevronRight size={15} />
            </Link>
          </div>
        </Card>
        <Card>
          <CardTitle
            title="Opportunities for you"
            detail="Rule-based matches · score shows the component parts"
            action={
              <Link className="subtle-link" to="/worker/opportunities">
                See all <ArrowRight size={14} />
              </Link>
            }
          />
          {matches.length ? (
            matches.slice(0, 2).map(({ job, match }) => (
              <Link
                to="/worker/opportunities"
                className="job-teaser"
                key={job.id}
              >
                <div className="job-teaser-icon">
                  <BriefcaseBusiness size={18} />
                </div>
                <div className="job-teaser-copy">
                  <strong>{job.title}</strong>
                  <span>
                    {job.city} · {job.minExperience}+ yrs ·{" "}
                    {job.requiredSkills.length} skills
                  </span>
                </div>
                <span className="match-score">
                  {match.score}
                  <small>%</small>
                </span>
              </Link>
            ))
          ) : (
            <Empty
              title="No matching jobs yet"
              text="New opportunities will appear here when job requirements match your profile."
            />
          )}
          <div className="matching-note">
            <SlidersHorizontal size={15} /> Rule-Based Job Matching{" "}
            <span>35 / 35 / 20 / 10</span>
          </div>
        </Card>
      </div>
      <div className="lower-grid">
        <Card>
          <CardTitle
            title="Recent activity"
            action={
              <Link className="subtle-link" to="/worker/notifications">
                View notifications <ArrowRight size={14} />
              </Link>
            }
          />
          {recent.length ? (
            <div className="timeline-list">
              {recent.map(a => (
                <div className="timeline-item" key={a.id}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>{a.action}</strong>
                    <p>{a.related}</p>
                    <small>
                      {new Date(a.createdAt).toLocaleDateString()} · {a.status}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="Your activity will appear here"
              text="Profile changes, verification updates and consent decisions are recorded in this timeline."
            />
          )}
        </Card>
        <Card className="reputation-panel">
          <CardTitle
            title="Reputation score"
            detail={
              score?.provisional
                ? "Provisional · evidence still building"
                : "Transparent demo calculation"
            }
          />
          {score && worker ? (
            <>
              <div className="reputation-overview">
                <ScoreRing score={score.score} />
                <p>
                  {score.provisional
                    ? "This score is provisional because there is not yet enough work or feedback evidence. New workers are not ranked as if missing records were failures."
                    : "Calculated from verified skills, completed work, feedback and profile completeness."}
                </p>
              </div>
              <div className="score-breakdown">
                {Object.entries({
                  "Verified skills · 40%": score.components.verifiedSkills,
                  "Completed work · 30%": score.components.completedWork,
                  "Employer feedback · 20%": score.components.employerFeedback,
                  "Profile completeness · 10%":
                    score.components.profileCompleteness,
                }).map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{Math.round(value)}%</b>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted-copy">
              Create your worker profile to see a provisional evidence summary.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}

export function ProfilePage() {
  const { actor, state } = useSkillPass();
  const worker = workerById(actor?.workerId, state.workers);
  const run = useDemoAction();
  const [form, setForm] = useState<Worker>(
    () =>
      worker ?? {
        id: actor?.workerId || "worker-new",
        name: "",
        phone: "",
        preferredLanguage: "Tamil",
        city: "Chennai",
        state: "Tamil Nadu",
        trade: "Electrician",
        yearsExperience: 0,
        joinedAt: new Date().toISOString(),
      }
  );
  const [skillName, setSkillName] = useState(""),
    [evidence, setEvidence] = useState(""),
    [trainingTitle, setTrainingTitle] = useState(""),
    [trainingProvider, setTrainingProvider] = useState(""),
    [workTitle, setWorkTitle] = useState(""),
    [workEmployer, setWorkEmployer] = useState(""),
    [message, setMessage] = useState(""),
    [localError, setLocalError] = useState("");
  const skills = state.skills.filter(s => s.workerId === actor?.workerId),
    training = state.training.filter(t => t.workerId === actor?.workerId),
    work = state.workHistory.filter(w => w.workerId === actor?.workerId);
  const update = (key: keyof Worker, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    const digits = form.phone.replace(/\D/g, "");
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.trade
    ) {
      setLocalError("Complete each required field before saving.");
      return;
    }
    if (
      !(
        (digits.length === 10 && /^[6-9]/.test(digits)) ||
        (digits.length === 12 &&
          digits.startsWith("91") &&
          /^91[6-9]/.test(digits))
      )
    ) {
      setLocalError(
        "Enter a valid 10-digit Indian mobile number, with or without +91."
      );
      return;
    }
    try {
      await run({
        type: "profile.save",
        worker: { ...form, name: form.name.trim(), phone: form.phone.trim() },
      });
      setMessage("Profile saved to the active demo record.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setLocalError(toError(e));
    }
  };
  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!skillName.trim()) {
      setLocalError("Enter a skill name.");
      return;
    }
    try {
      await run({
        type: "skill.add",
        skill: {
          id: makeId("skill"),
          workerId: actor?.workerId || "",
          name: skillName.trim(),
          status: "Not Submitted",
          evidence: evidence.trim(),
          notes: "",
          createdAt: new Date().toISOString(),
        },
      });
      setSkillName("");
      setEvidence("");
      setMessage("Self-reported skill added.");
    } catch (e) {
      setLocalError(toError(e));
    }
  };
  const addTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingTitle.trim() || !trainingProvider.trim()) {
      setLocalError("Training title and provider are required.");
      return;
    }
    try {
      await run({
        type: "training.add",
        record: {
          id: makeId("training"),
          workerId: actor?.workerId || "",
          title: trainingTitle.trim(),
          provider: trainingProvider.trim(),
          date: new Date().toISOString().slice(0, 7),
          status: "Demo record",
        },
      });
      setTrainingTitle("");
      setTrainingProvider("");
      setMessage("Training record added.");
    } catch (e) {
      setLocalError(toError(e));
    }
  };
  const addWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle.trim() || !workEmployer.trim()) {
      setLocalError("Role and employer are required.");
      return;
    }
    try {
      await run({
        type: "work.add",
        record: {
          id: makeId("work"),
          workerId: actor?.workerId || "",
          employer: workEmployer.trim(),
          title: workTitle.trim(),
          city: form.city,
          date: new Date().toISOString().slice(0, 7),
          completed: true,
        },
      });
      setWorkTitle("");
      setWorkEmployer("");
      setMessage("Work record added.");
    } catch (e) {
      setLocalError(toError(e));
    }
  };
  return (
    <>
      <Header
        eyebrow="WORKER WORKSPACE"
        title="My profile"
        subtitle="Keep your trade, experience and work records current."
        action={
          <Link className="btn btn-secondary" to="/worker/passport">
            <FileBadge2 size={16} /> Preview passport
          </Link>
        }
      />
      {localError && (
        <div className="inline-error" role="alert">
          <CircleAlert size={16} />
          {localError}
        </div>
      )}
      {message && (
        <div className="inline-success" role="status">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}
      <div className="profile-layout">
        <div className="profile-main">
          <Card>
            <CardTitle
              title="Personal and trade details"
              detail="Fields marked * are required"
            />
            <form className="form-grid" onSubmit={save}>
              <Field label="Full name *">
                <input
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                  required
                />
              </Field>
              <Field
                label="Phone number *"
                hint="Indian mobile number; not shared without consent."
              >
                <input
                  value={form.phone}
                  onChange={e => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  inputMode="tel"
                  required
                />
              </Field>
              <Field label="Preferred language">
                <select
                  value={form.preferredLanguage}
                  onChange={e => update("preferredLanguage", e.target.value)}
                >
                  {[
                    "Tamil",
                    "Hindi",
                    "English",
                    "Kannada",
                    "Telugu",
                    "Malayalam",
                    "Other",
                  ].map(x => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Primary trade *">
                <select
                  value={form.trade}
                  onChange={e => update("trade", e.target.value)}
                >
                  {trades.map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="City *">
                <input
                  value={form.city}
                  onChange={e => update("city", e.target.value)}
                  required
                />
              </Field>
              <Field label="State *">
                <input
                  value={form.state}
                  onChange={e => update("state", e.target.value)}
                  required
                />
              </Field>
              <Field label="Years of experience *">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={form.yearsExperience}
                  onChange={e =>
                    update("yearsExperience", Number(e.target.value))
                  }
                />
              </Field>
              <Field
                label="Optional profile photo"
                hint="Image is kept with this demo record; use a fictional photo only."
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 2_000_000) {
                      setLocalError("Choose an image under 2 MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () =>
                      setForm(x => ({
                        ...x,
                        profilePhoto: String(reader.result),
                      }));
                    reader.readAsDataURL(f);
                  }}
                />
              </Field>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">
                  Save profile <Check size={16} />
                </button>
                <span>
                  Changes update your passport and reputation breakdown.
                </span>
              </div>
            </form>
          </Card>
          <Card>
            <CardTitle
              title="Skills"
              detail="Self-reported skills are clearly separated from partner-reviewed demo status."
            />
            <form className="inline-form" onSubmit={addSkill}>
              <Field label="Add a skill">
                <input
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  placeholder="e.g. Electrical maintenance"
                />
              </Field>
              <Field label="Fictional supporting evidence">
                <input
                  value={evidence}
                  onChange={e => setEvidence(e.target.value)}
                  placeholder="e.g. Workshop practice log"
                />
              </Field>
              <button className="btn btn-secondary" type="submit">
                <Plus size={16} /> Add skill
              </button>
            </form>
            <div className="record-list">
              {skills.length ? (
                skills.map(s => (
                  <div className="record-row" key={s.id}>
                    <div className="record-icon">
                      <WrenchIcon />
                    </div>
                    <div className="record-main">
                      <strong>{s.name}</strong>
                      <span>
                        {s.evidence || "Self-reported; no evidence added yet"}
                      </span>
                    </div>
                    <Status value={s.status} />
                  </div>
                ))
              ) : (
                <Empty
                  title="No skills on this profile"
                  text="Add your first skill to begin building your passport."
                />
              )}
            </div>
          </Card>
          <div className="two-card-grid">
            <Card>
              <CardTitle
                title="Training records"
                detail={`${training.length} on this profile`}
              />
              <form className="stack-form" onSubmit={addTraining}>
                <Field label="Training / certificate title">
                  <input
                    value={trainingTitle}
                    onChange={e => setTrainingTitle(e.target.value)}
                    placeholder="Electrical safety basics"
                  />
                </Field>
                <Field label="Provider">
                  <input
                    value={trainingProvider}
                    onChange={e => setTrainingProvider(e.target.value)}
                    placeholder="Training partner name"
                  />
                </Field>
                <button className="btn btn-outline" type="submit">
                  <Plus size={15} /> Add training
                </button>
              </form>
              {training.map(t => (
                <div className="compact-record" key={t.id}>
                  <strong>{t.title}</strong>
                  <span>
                    {t.provider} · {t.date}
                  </span>
                </div>
              ))}
            </Card>
            <Card>
              <CardTitle
                title="Work history"
                detail={`${work.length} records`}
              />
              <form className="stack-form" onSubmit={addWork}>
                <Field label="Role or job title">
                  <input
                    value={workTitle}
                    onChange={e => setWorkTitle(e.target.value)}
                    placeholder="Maintenance assistant"
                  />
                </Field>
                <Field label="Employer / client">
                  <input
                    value={workEmployer}
                    onChange={e => setWorkEmployer(e.target.value)}
                    placeholder="Local business or client"
                  />
                </Field>
                <button className="btn btn-outline" type="submit">
                  <Plus size={15} /> Add work record
                </button>
              </form>
              {work.slice(0, 3).map(w => (
                <div className="compact-record" key={w.id}>
                  <strong>{w.title}</strong>
                  <span>
                    {w.employer} · {w.city} · {w.date}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>
        <aside className="profile-aside">
          <Card>
            <CardTitle title="Profile completeness" />
            <div className="completeness-large">
              {profileCompleteness(worker, skills, training, work)}
              <small>%</small>
            </div>
            <div className="progress-track">
              <i
                style={{
                  width: `${profileCompleteness(worker, skills, training, work)}%`,
                }}
              />
            </div>
            <p className="muted-copy">
              A complete profile helps employers understand your experience. You
              can choose which details to share.
            </p>
          </Card>
          <Card className="privacy-card">
            <ShieldCheck size={19} />
            <h3>Your details stay yours.</h3>
            <p>
              Phone and language are private in the demo employer view.
              Employers request access to passport fields; you choose and can
              revoke permission.
            </p>
            <Link to="/worker/consent">
              Review sharing permissions <ArrowRight size={14} />
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
function WrenchIcon() {
  return <FileCheck2 size={17} />;
}

export function PassportPage() {
  const { actor, state } = useSkillPass();
  const worker = workerById(actor?.workerId, state.workers);
  const skills = state.skills.filter(s => s.workerId === actor?.workerId);
  const train = state.training.filter(t => t.workerId === actor?.workerId);
  const work = state.workHistory.filter(w => w.workerId === actor?.workerId);
  const feedback = state.feedback.filter(f => f.workerId === actor?.workerId);
  const score = worker ? reputation(worker, state) : null;
  const timeline = state.activity
    .filter(a => a.workerId === actor?.workerId)
    .slice(0, 6);
  const qrValue = `${window.location.origin}/worker/passport?preview=demo`;
  return (
    <>
      <div className="print-hide">
        <Header
          eyebrow="WORKER WORKSPACE"
          title="Digital Skill Passport"
          subtitle="A portable work record built from your profile, verified skills and selected history."
          action={
            <div className="button-row">
              <Link className="btn btn-secondary" to="/worker/consent">
                <ShieldCheck size={15} /> Share settings
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print passport
              </button>
            </div>
          }
        />
        <div className="honesty-banner">
          <ShieldCheck size={17} />
          <div>
            <strong>
              Demo passport — not a government-issued identity document.
            </strong>
            <span>
              All verification statuses and supporting records in this
              application are fictional demonstration data.
            </span>
          </div>
        </div>
      </div>
      {worker ? (
        <div className="passport-page">
          <div className="passport-header">
            <div>
              <span className="passport-overline">
                SKILLPASS · PORTABLE WORK RECORD
              </span>
              <div className="passport-name-row">
                {worker.profilePhoto ? (
                  <img
                    className="passport-photo"
                    src={worker.profilePhoto}
                    alt="Worker profile"
                  />
                ) : (
                  <div className="passport-photo passport-initials">
                    {worker.name
                      .split(" ")
                      .map(x => x[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                )}
                <div>
                  <h2>{worker.name}</h2>
                  <p>
                    {worker.trade} <i /> {worker.city}, {worker.state}
                  </p>
                  <span className="passport-experience">
                    {worker.yearsExperience} years' experience · Profile{" "}
                    {profileCompleteness(worker, skills, train, work)}% complete
                  </span>
                </div>
              </div>
            </div>
            <div className="passport-score">
              <ScoreRing score={score?.score || 0} />
              <span>
                {score?.provisional
                  ? "PROVISIONAL SUMMARY"
                  : "REPUTATION SUMMARY"}
              </span>
            </div>
          </div>
          <div className="passport-body">
            <section className="passport-section">
              <div className="passport-section-title">
                <span>01</span>
                <h3>Skills & verification</h3>
              </div>
              {skills.length ? (
                skills.map(s => (
                  <div className="passport-row" key={s.id}>
                    <div>
                      <strong>{s.name}</strong>
                      <small>
                        {s.status === "Verified"
                          ? `Reviewed by ${s.verifier || "Demo partner"}${s.verifiedAt ? ` · ${new Date(s.verifiedAt).toLocaleDateString()}` : ""}`
                          : s.evidence || "Self-reported skill"}
                      </small>
                    </div>
                    <Status value={s.status} />
                  </div>
                ))
              ) : (
                <p className="muted-copy">No skills listed yet.</p>
              )}
            </section>
            <section className="passport-section">
              <div className="passport-section-title">
                <span>02</span>
                <h3>Training & certification records</h3>
              </div>
              {train.length ? (
                train.map(t => (
                  <div className="passport-row" key={t.id}>
                    <div>
                      <strong>{t.title}</strong>
                      <small>
                        {t.provider} · {t.date}
                      </small>
                    </div>
                    <span className="demo-record-chip">Demo record</span>
                  </div>
                ))
              ) : (
                <p className="muted-copy">
                  No training records on this profile yet.
                </p>
              )}
            </section>
            <section className="passport-section">
              <div className="passport-section-title">
                <span>03</span>
                <h3>Selected work history</h3>
              </div>
              {work.length ? (
                work.map(w => (
                  <div className="passport-row" key={w.id}>
                    <div>
                      <strong>{w.title}</strong>
                      <small>
                        {w.employer} · {w.city} · {w.date}
                      </small>
                      {w.feedback && (
                        <p className="feedback-quote">“{w.feedback}”</p>
                      )}
                    </div>
                    {w.completed && <Status value="Completed" />}
                  </div>
                ))
              ) : (
                <p className="muted-copy">No work history records yet.</p>
              )}
            </section>
            <section className="passport-section">
              <div className="passport-section-title">
                <span>04</span>
                <h3>Employer feedback</h3>
              </div>
              {feedback.length ? (
                feedback.map(f => (
                  <div className="passport-row" key={f.id}>
                    <div>
                      <strong>
                        {state.employers.find(e => e.id === f.employerId)
                          ?.name || "Demo employer"}
                      </strong>
                      <small>{f.date} · Demo feedback record</small>
                      <p className="feedback-quote">“{f.comment}”</p>
                    </div>
                    <span
                      className="stars"
                      aria-label={`${f.score} out of 5 stars`}
                    >
                      {"★".repeat(f.score)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted-copy">No employer feedback records yet.</p>
              )}
            </section>
            <section className="passport-section">
              <div className="passport-section-title">
                <span>05</span>
                <h3>Reputation score</h3>
              </div>
              {score && (
                <>
                  <p className="muted-copy">
                    A provisional demo calculation based on available records;
                    missing evidence does not mean a worker is unreliable.
                  </p>
                  <div className="score-breakdown two-col">
                    {Object.entries({
                      "Verified skills · 40%": score.components.verifiedSkills,
                      "Completed work · 30%": score.components.completedWork,
                      "Employer feedback · 20%":
                        score.components.employerFeedback,
                      "Profile completeness · 10%":
                        score.components.profileCompleteness,
                    }).map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <b>{Math.round(value)}%</b>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
            <section className="passport-section timeline-section">
              <div className="passport-section-title">
                <span>06</span>
                <h3>Verification timeline</h3>
              </div>
              {timeline.length ? (
                timeline.map(a => (
                  <div className="timeline-item" key={a.id}>
                    <span className="timeline-dot" />
                    <div>
                      <strong>{a.action}</strong>
                      <p>{a.related}</p>
                      <small>
                        {new Date(a.createdAt).toLocaleDateString()} ·{" "}
                        {a.status}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted-copy">No timeline activity yet.</p>
              )}
            </section>
          </div>
          <div className="passport-foot">
            <span>
              Created {new Date(worker.joinedAt).toLocaleDateString()} · Last
              updated{" "}
              {new Date(
                state.activity.find(a => a.workerId === worker.id)?.createdAt ||
                  worker.joinedAt
              ).toLocaleDateString()}
            </span>
            <div className="passport-qr">
              <QRCodeSVG value={qrValue} size={78} level="M" includeMargin />
              <span>
                DEMO ROUTE
                <br />
                Login required
              </span>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <Empty
            title="Create your profile to start a passport"
            text="Add your trade, experience and skills to build your portable demo record."
            action={
              <Link className="btn btn-primary" to="/worker/profile">
                Create profile
              </Link>
            }
          />
        </Card>
      )}
      <div className="print-hide passport-actions">
        <Link className="btn btn-outline" to="/worker/profile">
          Edit profile
        </Link>
        <Link className="btn btn-primary" to="/worker/consent">
          Share selected fields <ArrowRight size={16} />
        </Link>
        <p>
          QR contains only a route. It does not embed your profile, and this
          demo passport route requires a worker session.
        </p>
      </div>
    </>
  );
}

export function VerificationPage() {
  const { actor, state } = useSkillPass();
  const run = useDemoAction();
  const skills = state.skills.filter(s => s.workerId === actor?.workerId);
  const [busyId, setBusyId] = useState("");
  const submit = async (skill: SkillRecord) => {
    setBusyId(skill.id);
    try {
      await run({ type: "skill.submit", skillId: skill.id });
    } catch (e) {
      alert(toError(e));
    } finally {
      setBusyId("");
    }
  };
  return (
    <>
      <Header
        eyebrow="WORKER WORKSPACE"
        title="Skill verification"
        subtitle="Request a demo partner review for skills you have added to your profile."
      />
      <div className="honesty-banner">
        <ShieldCheck size={17} />
        <div>
          <strong>Demo Verification — Not an Official Certification</strong>
          <span>
            Evidence and status changes are simulated and do not authenticate
            real-world certificates.
          </span>
        </div>
      </div>
      <Card>
        <CardTitle
          title="Your skills"
          detail={`${skills.filter(s => s.status === "Verified").length} verified · ${skills.filter(s => s.status === "Pending").length} pending`}
        />
        {skills.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Evidence supplied</th>
                  <th>Status</th>
                  <th>Reviewed by</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {skills.map(s => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.evidence || "—"}</td>
                    <td>
                      <Status value={s.status} />
                    </td>
                    <td>
                      {s.verifier || "—"}
                      {s.notes && (
                        <small className="table-sub">{s.notes}</small>
                      )}
                    </td>
                    <td>
                      {s.status === "Verified" ? (
                        <span className="muted-copy">Recorded</span>
                      ) : s.status === "Pending" ? (
                        <span className="muted-copy">In partner queue</span>
                      ) : (
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => submit(s)}
                          disabled={busyId === s.id}
                        >
                          {busyId === s.id ? "Submitting…" : "Request review"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No skills to review"
            text="Add skills on My Profile, then submit them for demo review."
            action={
              <Link className="btn btn-primary" to="/worker/profile">
                Add a skill
              </Link>
            }
          />
        )}
      </Card>
    </>
  );
}

export function OpportunitiesPage() {
  const { actor, state } = useSkillPass();
  const worker = workerById(actor?.workerId, state.workers);
  const jobs = state.jobs
    .filter(j => j.status === "Open")
    .map(job => ({
      job,
      match: worker ? jobMatch(worker, job, state.skills) : null,
    }))
    .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
  return (
    <>
      <Header
        eyebrow="WORKER WORKSPACE"
        title="Job opportunities"
        subtitle="Rule-based matches are calculated from your current profile and each job's requirements."
      />
      <div className="matching-note prominent">
        <SlidersHorizontal size={16} />
        <div>
          <strong>Rule-Based Job Matching</strong>
          <span>
            Trade 35% · Verified skills 35% · Experience 20% · Location 10%
          </span>
        </div>
        <Link to="/worker/profile">
          Update your profile <ArrowRight size={14} />
        </Link>
      </div>
      <div className="job-list">
        {jobs.map(({ job, match }) => (
          <Card className="job-card" key={job.id}>
            <div className="job-card-head">
              <div className="job-icon">
                <BriefcaseBusiness size={18} />
              </div>
              <div>
                <h2>{job.title}</h2>
                <span>
                  {job.trade} <i /> {job.city}, {job.state}
                </span>
              </div>
              {match && (
                <div className="job-match-badge">
                  <strong>{match.score}%</strong>
                  <span>match</span>
                </div>
              )}
            </div>
            <p>{job.description}</p>
            <div className="job-pills">
              <span>
                <MapPin size={14} />
                {job.city}
              </span>
              <span>
                <BriefcaseBusiness size={14} />
                {job.minExperience}+ years
              </span>
              {job.requiredSkills.map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
            {match && (
              <div className="match-breakdown">
                {[
                  ["Trade", match.trade],
                  ["Skills", match.skills],
                  ["Experience", match.experience],
                  ["Location", match.location],
                ].map(([label, v]) => (
                  <div key={label as string}>
                    <span>{label}</span>
                    <div className="progress-track">
                      <i style={{ width: `${v}%` }} />
                    </div>
                    <b>{v}%</b>
                  </div>
                ))}
              </div>
            )}
            <div className="job-card-foot">
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              <span>{match?.explanation}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function ConsentPage({ employer = false }: { employer?: boolean }) {
  const { actor, state } = useSkillPass();
  const run = useDemoAction();
  const [selected, setSelected] = useState<Record<string, ShareField[]>>({});
  const [message, setMessage] = useState("");
  const workerId = actor?.workerId;
  const ownRequests = state.accessRequests.filter(r =>
    employer ? r.employerId === actor?.employerId : r.workerId === workerId
  );
  const pending = ownRequests.filter(r => r.status === "Pending"),
    active = ownRequests.filter(r => r.status === "Approved"),
    history = ownRequests.filter(
      r => r.status === "Rejected" || r.status === "Revoked"
    );
  const select = (id: string, field: ShareField) =>
    setSelected(s => {
      const list = s[id] || [];
      return {
        ...s,
        [id]: list.includes(field)
          ? list.filter(x => x !== field)
          : [...list, field],
      };
    });
  const resolve = async (
    req: AccessRequest,
    status: "Approved" | "Rejected"
  ) => {
    try {
      await run({
        type: "access.resolve",
        requestId: req.id,
        status,
        fields: selected[req.id] || [],
      });
      setMessage(
        status === "Approved"
          ? "Selected fields approved. The employer view now reflects your choices."
          : "Access request rejected."
      );
      setTimeout(() => setMessage(""), 3500);
    } catch (e) {
      alert(toError(e));
    }
  };
  const revoke = async (req: AccessRequest) => {
    if (
      !window.confirm(
        "Revoke this employer’s access to the selected Skill Passport fields? Their next view will no longer include them."
      )
    )
      return;
    try {
      await run({ type: "access.revoke", requestId: req.id });
      setMessage(
        "Permission revoked. Protected fields are no longer available in the employer view."
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (e) {
      alert(toError(e));
    }
  };
  if (employer)
    return (
      <>
        <Header
          eyebrow="EMPLOYER WORKSPACE"
          title="Access requests"
          subtitle="Track your requests and see which fields the worker has chosen to share."
        />
        <Card>
          <CardTitle
            title="Requests for passport access"
            detail={`${ownRequests.filter(r => r.status === "Pending").length} awaiting a response`}
          />
          {ownRequests.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Job</th>
                    <th>Requested</th>
                    <th>Status</th>
                    <th>Permitted fields</th>
                  </tr>
                </thead>
                <tbody>
                  {ownRequests.map(r => {
                    const w = workerById(r.workerId, state.workers);
                    const j = state.jobs.find(x => x.id === r.jobId);
                    return (
                      <tr key={r.id}>
                        <td>
                          <Link to={`/employer/workers/${r.workerId}`}>
                            {w?.name || "Worker profile"}
                          </Link>
                        </td>
                        <td>{j?.title || "—"}</td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Status value={r.status} />
                        </td>
                        <td>
                          {r.status === "Approved"
                            ? r.fields
                                .map(
                                  f => shareFields.find(x => x.id === f)?.label
                                )
                                .join(", ")
                            : r.status === "Revoked"
                              ? "Access removed"
                              : "Waiting for worker"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No access requests yet"
              text="Open Find Workers and request a candidate’s detailed passport when you need more information."
              action={
                <Link className="btn btn-primary" to="/employer/workers">
                  Find workers
                </Link>
              }
            />
          )}
        </Card>
        <div className="honesty-note">
          <LockIcon />
          Employer view is restricted to fields permitted in the current
          request. Revoked access is removed from the normal app view.
        </div>
      </>
    );
  return (
    <>
      <Header
        eyebrow="WORKER WORKSPACE"
        title="Data & consent"
        subtitle="You decide which parts of your passport an employer can see."
      />
      <div className="honesty-banner">
        <ShieldCheck size={17} />
        <div>
          <strong>Consent is specific and revocable.</strong>
          <span>
            Approving one employer does not make your profile public or grant
            access to every field.
          </span>
        </div>
      </div>
      {message && (
        <div className="inline-success" role="status">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}
      <div className="consent-grid">
        <div className="consent-main">
          <Card>
            <CardTitle
              title="Pending requests"
              detail="Choose fields for each employer before approving."
            />
            {pending.length ? (
              pending.map(req => (
                <div className="request-card" key={req.id}>
                  <div className="request-heading">
                    <div className="request-icon">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                      <strong>
                        {state.employers.find(e => e.id === req.employerId)
                          ?.name || "Employer"}
                      </strong>
                      <span>
                        {state.jobs.find(j => j.id === req.jobId)?.title ||
                          "Employer profile request"}{" "}
                        · {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Status value="Pending" />
                  </div>
                  <div className="field-choice-grid">
                    {shareFields.map(field => (
                      <label
                        className={`field-choice ${(selected[req.id] || []).includes(field.id) ? "checked" : ""}`}
                        key={field.id}
                      >
                        <input
                          type="checkbox"
                          checked={(selected[req.id] || []).includes(field.id)}
                          onChange={() => select(req.id, field.id)}
                        />
                        <span className="custom-check">
                          <Check size={12} />
                        </span>
                        <span>
                          <strong>{field.label}</strong>
                          <small>{field.description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => resolve(req, "Rejected")}
                    >
                      Reject request
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => resolve(req, "Approved")}
                      disabled={(selected[req.id] || []).length === 0}
                    >
                      Approve selected fields <Check size={15} />
                    </button>
                  </div>
                  {(selected[req.id] || []).length === 0 && (
                    <small className="inline-hint">
                      Select at least one field to approve.
                    </small>
                  )}
                </div>
              ))
            ) : (
              <Empty
                title="No pending access requests"
                text="When an employer requests a detailed passport, you can review and choose which fields to share."
              />
            )}
          </Card>
          <Card>
            <CardTitle
              title="Active permissions"
              detail="Revoke access at any time."
            />
            {active.length ? (
              active.map(req => (
                <div className="permission-row" key={req.id}>
                  <div>
                    <strong>
                      {state.employers.find(e => e.id === req.employerId)
                        ?.name || "Employer"}
                    </strong>
                    <span>
                      Approved {new Date(req.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="field-tags">
                      {req.fields.map(f => (
                        <span key={f}>
                          {shareFields.find(x => x.id === f)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger-outline btn-sm"
                    onClick={() => revoke(req)}
                  >
                    <X size={14} /> Revoke
                  </button>
                </div>
              ))
            ) : (
              <Empty
                title="No active permissions"
                text="Only requests you approve appear here."
              />
            )}
          </Card>
          <Card>
            <CardTitle title="Consent history" />
            {history.length ? (
              history.map(req => (
                <div className="history-row" key={req.id}>
                  <div>
                    <strong>
                      {state.employers.find(e => e.id === req.employerId)
                        ?.name || "Employer"}
                    </strong>
                    <span>
                      {req.status} ·{" "}
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Status value={req.status} />
                </div>
              ))
            ) : (
              <p className="muted-copy">
                No rejected or revoked permissions yet.
              </p>
            )}
          </Card>
        </div>
        <aside className="consent-aside">
          <Card className="privacy-card">
            <ShieldCheck size={20} />
            <h3>Access is limited by design.</h3>
            <p>
              Employers can see a minimal directory summary. Your phone,
              training details, selected work history and reputation breakdown
              stay protected unless you share them.
            </p>
            <Link to="/worker/passport">
              Preview your passport <ArrowRight size={14} />
            </Link>
          </Card>
          <Card>
            <CardTitle
              title="Shareable fields"
              detail="Choose only what is useful."
            />
            <div className="shareable-list">
              {shareFields.map(f => (
                <div key={f.id}>
                  <CheckCircle2 size={15} />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
function LockIcon() {
  return <ShieldCheck size={16} />;
}

export function EmployerDashboard() {
  const { state, matches } = useSkillPass();
  const jobs = state.jobs.filter(j => j.status === "Open");
  const pending = state.accessRequests.filter(
    r => r.status === "Pending"
  ).length;
  const candidateCount = new Set(
    matches.flatMap(m =>
      m.candidates.filter(c => c.score > 0).map(c => c.workerId)
    )
  ).size;
  const recentWorkers = Array.from(
    new Set(
      state.activity
        .filter(a => a.action === "Viewed worker profile" && a.workerId)
        .map(a => a.workerId as string)
    )
  )
    .slice(0, 4)
    .map(id => state.workers.find(w => w.id === id))
    .filter((w): w is Worker => Boolean(w));
  return (
    <>
      <Header
        eyebrow="EMPLOYER WORKSPACE"
        title="Recruit with more context."
        subtitle="Find skills, share requirements and request permission before opening private passport detail."
        action={
          <Link className="btn btn-primary" to="/employer/jobs/new">
            <Plus size={16} /> Create a job
          </Link>
        }
      />
      <div className="metric-grid">
        <Metric
          label="Open jobs"
          value={jobs.length}
          detail="Active listings"
          icon={BriefcaseBusiness}
          to="/employer/jobs"
        />
        <Metric
          label="Candidates matched"
          value={candidateCount}
          detail="From current job records"
          icon={Users}
          to="/employer/workers"
        />
        <Metric
          label="Access requests"
          value={pending}
          detail="Waiting for worker response"
          icon={ShieldCheck}
          to="/employer/access-requests"
        />
        <Metric
          label="Worker directory"
          value={state.workers.length}
          detail="Fictional demo profiles"
          icon={Search}
          to="/employer/workers"
        />
      </div>
      <div className="dashboard-columns">
        <Card>
          <CardTitle
            title="Open roles"
            detail="Matching from actual demo records"
            action={
              <Link className="subtle-link" to="/employer/jobs">
                Manage jobs <ArrowRight size={14} />
              </Link>
            }
          />
          {jobs.slice(0, 3).map(job => {
            const match = matches.find(m => m.jobId === job.id)?.candidates[0];
            return (
              <div className="employer-job-row" key={job.id}>
                <div className="job-teaser-icon">
                  <BriefcaseBusiness size={17} />
                </div>
                <div>
                  <strong>{job.title}</strong>
                  <span>
                    {job.city} · {job.minExperience}+ years ·{" "}
                    {job.requiredSkills.join(", ")}
                  </span>
                </div>
                {match && (
                  <span className="match-score">
                    {match.score}
                    <small>%</small>
                  </span>
                )}
              </div>
            );
          })}
        </Card>
        <Card>
          <CardTitle
            title="Recent recruitment activity"
            action={
              <Link className="subtle-link" to="/employer/access-requests">
                Review requests <ArrowRight size={14} />
              </Link>
            }
          />
          {state.activity.slice(0, 4).length ? (
            <div className="timeline-list">
              {state.activity.slice(0, 4).map(a => (
                <div className="timeline-item" key={a.id}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>{a.action}</strong>
                    <p>{a.related}</p>
                    <small>
                      {new Date(a.createdAt).toLocaleDateString()} · {a.status}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="Recruitment activity will appear here"
              text="Create a job or request passport access to get started."
            />
          )}
        </Card>
      </div>
      <Card className="recently-viewed-card">
        <CardTitle
          title="Recently viewed workers"
          detail="Directory visits from this employer workspace"
          action={
            <Link className="subtle-link" to="/employer/workers">
              Find more <ArrowRight size={14} />
            </Link>
          }
        />
        {recentWorkers.length ? (
          recentWorkers.map(w => (
            <Link
              className="recent-worker-link"
              to={`/employer/workers/${w.id}`}
              key={w.id}
            >
              <span className="worker-avatar">
                {w.name
                  .split(" ")
                  .map(x => x[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="recent-worker-copy">
                <strong>{w.name}</strong>
                <small>
                  {w.trade} · {w.city}
                </small>
              </span>
              <ArrowRight size={15} />
            </Link>
          ))
        ) : (
          <Empty
            title="Worker profiles you open will appear here"
            text="Recent views stay with this demo employer workspace. Private passport fields remain consent-controlled."
            action={
              <Link className="btn btn-outline" to="/employer/workers">
                Browse worker directory
              </Link>
            }
          />
        )}
      </Card>
      <div className="matching-note prominent">
        <SlidersHorizontal size={17} />
        <div>
          <strong>Rule-Based Job Matching</strong>
          <span>
            Trade compatibility 35% · Required skills 35% · Experience 20% ·
            Location 10%
          </span>
        </div>
        <Link to="/employer/workers">
          Find candidates <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}

export function WorkersPage({ admin = false }: { admin?: boolean }) {
  const { state, matches } = useSkillPass();
  const [query, setQuery] = useState(""),
    [trade, setTrade] = useState("All trades"),
    [city, setCity] = useState("All cities"),
    [minExp, setMinExp] = useState("Any experience"),
    [verifiedFilter, setVerifiedFilter] = useState("Any verified skill"),
    [statusFilter, setStatusFilter] = useState("All statuses"),
    [sort, setSort] = useState("best");
  const byWorker = new Map<
    string,
    (typeof matches)[number]["candidates"][number]
  >();
  for (const matchSet of matches) {
    for (const candidate of matchSet.candidates) {
      if (
        !byWorker.has(candidate.workerId) ||
        candidate.score > (byWorker.get(candidate.workerId)?.score ?? -1)
      )
        byWorker.set(candidate.workerId, candidate);
    }
  }
  const experienceValue = (w: Worker) =>
    w.yearsExperience ||
    (w.directoryExperienceBand === "6+ years"
      ? 6
      : w.directoryExperienceBand === "3–5 years"
        ? 3
        : 0);
  const filtered = state.workers
    .filter(w => {
      const verifiedCount =
        w.directoryVerifiedSkillCount ??
        state.skills.filter(s => s.workerId === w.id && s.status === "Verified")
          .length;
      const allWorkerSkills = state.skills.filter(s => s.workerId === w.id);
      const status =
        w.directoryVerificationStatus ??
        (allWorkerSkills.some(s => s.status === "Verified")
          ? "Verified"
          : allWorkerSkills.some(s => s.status === "Pending")
            ? "Pending"
            : allWorkerSkills.some(s => s.status === "Needs More Information")
              ? "Needs More Information"
              : allWorkerSkills.some(s => s.status === "Rejected")
                ? "Rejected"
                : "Not Submitted");
      const band =
        w.directoryExperienceBand ??
        (w.yearsExperience < 3
          ? "0–2 years"
          : w.yearsExperience < 6
            ? "3–5 years"
            : "6+ years");
      const key = `${w.name} ${w.trade} ${w.city} ${w.state}`.toLowerCase();
      return (
        (!query || key.includes(query.toLowerCase())) &&
        (trade === "All trades" || w.trade === trade) &&
        (city === "All cities" || w.city === city) &&
        (minExp === "Any experience" || band === minExp) &&
        (verifiedFilter === "Any verified skill" ||
          (verifiedFilter === "Has verified skills"
            ? verifiedCount > 0
            : verifiedCount === 0)) &&
        (statusFilter === "All statuses" || status === statusFilter)
      );
    })
    .sort((a, b) =>
      sort === "experience"
        ? experienceValue(b) - experienceValue(a)
        : sort === "completeness"
          ? (b.directoryCompleteness ??
              profileCompleteness(
                b,
                state.skills,
                state.training,
                state.workHistory
              )) -
            (a.directoryCompleteness ??
              profileCompleteness(
                a,
                state.skills,
                state.training,
                state.workHistory
              ))
          : (byWorker.get(b.id)?.score || 0) - (byWorker.get(a.id)?.score || 0)
    );
  return (
    <>
      <Header
        eyebrow={admin ? "TRAINING PARTNER · ADMIN" : "EMPLOYER WORKSPACE"}
        title={admin ? "Worker records" : "Find workers"}
        subtitle={
          admin
            ? "Search fictional profiles and see skills and work history on record."
            : "Search a demo directory. Detailed passport fields remain permission-controlled."
        }
        action={
          !admin && (
            <Link className="btn btn-primary" to="/employer/jobs/new">
              <Plus size={15} /> Create a job
            </Link>
          )
        }
      />
      <Card className="filter-panel">
        <div className="directory-tools">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search workers"
              placeholder="Search name, trade or location"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </label>
          <div className="filter-control">
            <Filter size={15} />
            <select
              aria-label="Filter by trade"
              value={trade}
              onChange={e => setTrade(e.target.value)}
            >
              <option>All trades</option>
              {trades.map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="filter-control">
            <MapPin size={15} />
            <select
              aria-label="Filter by city"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option>All cities</option>
              {cities.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="filter-control">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Filter by experience band"
              value={minExp}
              onChange={e => setMinExp(e.target.value)}
            >
              {["Any experience", "0–2 years", "3–5 years", "6+ years"].map(
                v => (
                  <option key={v}>{v}</option>
                )
              )}
            </select>
          </div>
          <div className="filter-control">
            <BadgeCheck size={15} />
            <select
              aria-label="Filter by verified skills"
              value={verifiedFilter}
              onChange={e => setVerifiedFilter(e.target.value)}
            >
              {[
                "Any verified skill",
                "Has verified skills",
                "No verified skills",
              ].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="filter-control">
            <ShieldCheck size={15} />
            <select
              aria-label="Filter by verification status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {[
                "All statuses",
                "Verified",
                "Pending",
                "Needs More Information",
                "Rejected",
                "Not Submitted",
              ].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="filter-control">
            <span className="sort-label">Sort</span>
            <select
              aria-label="Sort workers"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="best">Best match</option>
              <option value="experience">Experience</option>
              <option value="completeness">Profile completeness</option>
            </select>
          </div>
        </div>
        <div className="filter-result">
          {filtered.length} fictional profiles <span>·</span> private fields
          hidden until consent
        </div>
      </Card>
      {filtered.length ? (
        <div className="worker-list">
          {filtered.map(w => {
            const match = byWorker.get(w.id);
            const verifiedCount =
              w.directoryVerifiedSkillCount ??
              state.skills.filter(
                s => s.workerId === w.id && s.status === "Verified"
              ).length;
            const verificationStatus =
              w.directoryVerificationStatus ??
              (verifiedCount > 0
                ? "Verified"
                : state.skills.some(
                      s => s.workerId === w.id && s.status === "Pending"
                    )
                  ? "Pending"
                  : "Not Submitted");
            return (
              <Card className="worker-card" key={w.id}>
                <div className="worker-card-main">
                  <div className="worker-avatar">
                    {w.name
                      .split(" ")
                      .map(x => x[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="worker-summary">
                    <div className="worker-name-row">
                      <h2>{w.name}</h2>
                      {match && (
                        <span className="match-tag">{match.score}% match</span>
                      )}
                    </div>
                    <p>
                      {w.trade} <i /> {w.city}, {w.state}
                    </p>
                    <div className="worker-tags">
                      <span>
                        <BriefcaseBusiness size={13} />
                        {w.yearsExperience
                          ? `${w.yearsExperience} years' experience`
                          : w.directoryExperienceBand ||
                            "Experience details protected"}
                      </span>
                      <span>
                        <BadgeCheck size={13} />
                        {verifiedCount} verified skill
                        {verifiedCount === 1 ? "" : "s"}
                      </span>
                      <Status value={verificationStatus} />
                      <span>
                        <ShieldCheck size={13} />
                        Consent-led details
                      </span>
                    </div>
                  </div>
                  <Link
                    className="btn btn-outline"
                    to={
                      admin
                        ? "/partner/verification-requests"
                        : `/employer/workers/${w.id}`
                    }
                  >
                    {admin ? "Review skills" : "View profile"}
                    <ArrowRight size={15} />
                  </Link>
                </div>
                {match && (
                  <div className="worker-match">
                    <div>
                      <strong>Rule-based score: {match.score}%</strong>
                      <span>{match.explanation}</span>
                    </div>
                    <div className="match-components">
                      {[
                        ["Trade", match.trade],
                        ["Skills", match.skills],
                        ["Experience", match.experience],
                        ["Location", match.location],
                      ].map(([l, v]) => (
                        <span key={l as string}>
                          {l as string} <b>{v as number}%</b>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Empty
            title="No workers match those filters"
            text="Try a broader trade, city or experience range."
            action={
              <button
                className="btn btn-outline"
                onClick={() => {
                  setQuery("");
                  setTrade("All trades");
                  setCity("All cities");
                  setMinExp("Any experience");
                  setVerifiedFilter("Any verified skill");
                  setStatusFilter("All statuses");
                }}
              >
                Clear filters
              </button>
            }
          />
        </Card>
      )}
    </>
  );
}

export function WorkerDetailsPage() {
  const { workerId } = useParams();
  const { actor, state } = useSkillPass();
  const run = useDemoAction();
  const w = state.workers.find(x => x.id === workerId);
  const lastViewed = useRef("");
  useEffect(() => {
    if (workerId && w && lastViewed.current !== workerId) {
      lastViewed.current = workerId;
      void run({ type: "worker.view", workerId }).catch(() => {
        lastViewed.current = "";
      });
    }
  }, [workerId, w?.id, run]);
  const request = state.accessRequests.find(r => r.workerId === workerId);
  const granted = request?.status === "Approved" ? request : null;
  const skills = state.skills.filter(s => s.workerId === workerId);
  const work = state.workHistory.filter(x => x.workerId === workerId);
  const training = state.training.filter(x => x.workerId === workerId);
  const feedback = state.feedback.filter(x => x.workerId === workerId);
  const [msg, setMsg] = useState("");
  if (!workerId || !w)
    return (
      <div className="not-found">
        <div className="eyebrow">PROFILE UNAVAILABLE</div>
        <h1>This worker profile isn’t available.</h1>
        <p>
          It may be outside the current directory or sharing access has changed.
        </p>
        <Link className="btn btn-primary" to="/employer/workers">
          Return to worker directory
        </Link>
      </div>
    );
  const requestAccess = async () => {
    try {
      await run({
        type: "access.request",
        request: {
          id: makeId("access"),
          workerId,
          employerId: actor?.employerId || "",
          status: "Pending",
          fields: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      setMsg(
        "Access request sent. The worker can choose fields before approving."
      );
    } catch (e) {
      setMsg(toError(e));
    }
  };
  return (
    <>
      <Header
        eyebrow="EMPLOYER WORKSPACE"
        title={w.name}
        subtitle={`${w.trade} · ${w.city}, ${w.state}`}
        action={
          <Link className="btn btn-secondary" to="/employer/workers">
            Back to directory
          </Link>
        }
      />
      {msg && (
        <div className="inline-success" role="status">
          {msg}
        </div>
      )}
      <div className="detail-grid">
        <div>
          <Card>
            <div className="detail-person">
              <div className="worker-avatar large">
                {w.name
                  .split(" ")
                  .map(x => x[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <span className="eyebrow">DIRECTORY PROFILE · FICTIONAL</span>
                <h2>{w.name}</h2>
                <p>
                  {w.trade} <i /> {w.city}, {w.state}
                </p>
              </div>
              <span className="detail-exp">
                {w.yearsExperience
                  ? `${w.yearsExperience} yrs`
                  : "Experience details protected"}
              </span>
            </div>
            <div className="protected-panel">
              <div className="protected-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong>
                  {granted
                    ? "Selected passport fields are available"
                    : "Detailed Skill Passport is private"}
                </strong>
                <p>
                  {granted
                    ? `The worker approved: ${granted.fields.map(f => shareFields.find(x => x.id === f)?.label).join(", ") || "no fields"}.`
                    : "Request permission to view selected training, verified skills, work history and reputation details."}
                </p>
              </div>
              {!request ||
              request.status === "Rejected" ||
              request.status === "Revoked" ? (
                <button className="btn btn-primary" onClick={requestAccess}>
                  <ShieldCheck size={15} /> Request passport access
                </button>
              ) : request.status === "Pending" ? (
                <Status value="Pending" />
              ) : (
                <Status value="Approved" />
              )}
            </div>
          </Card>
          <Card>
            <CardTitle
              title="Verified skills"
              detail={
                granted?.fields.includes("verifiedSkills")
                  ? "Shared by worker"
                  : "Details require consent"
              }
            />
            {granted?.fields.includes("verifiedSkills") && skills.length ? (
              skills.map(s => (
                <div className="record-row" key={s.id}>
                  <div className="record-icon">
                    <BadgeCheck size={17} />
                  </div>
                  <div className="record-main">
                    <strong>{s.name}</strong>
                    <span>Reviewed by {s.verifier || "Demo partner"}</span>
                  </div>
                  <Status value={s.status} />
                </div>
              ))
            ) : (
              <div className="restricted-empty">
                <ShieldCheck size={18} />
                <span>Skill detail is not currently shared.</span>
              </div>
            )}
          </Card>
          <div className="two-card-grid">
            <Card>
              <CardTitle title="Training records" />
              {granted?.fields.includes("trainingRecords") &&
              training.length ? (
                training.map(t => (
                  <div className="compact-record" key={t.id}>
                    <strong>{t.title}</strong>
                    <span>
                      {t.provider} · {t.date}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted-copy">
                  No training details currently shared.
                </p>
              )}
            </Card>
            <Card>
              <CardTitle title="Work history" />
              {granted?.fields.includes("workHistory") && work.length ? (
                work.map(t => (
                  <div className="compact-record" key={t.id}>
                    <strong>{t.title}</strong>
                    <span>
                      {t.employer} · {t.city} · {t.date}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted-copy">
                  No work-history details currently shared.
                </p>
              )}
            </Card>
          </div>
        </div>
        <aside>
          <Card>
            <CardTitle title="Reputation summary" />
            {granted?.fields.includes("reputation") ? (
              <>
                <p className="muted-copy">
                  A provisional score derived from available demo records.
                </p>
                {w.sharedReputation && (
                  <>
                    <div className="reputation-overview">
                      <ScoreRing score={w.sharedReputation.score} />
                      <p>
                        {w.sharedReputation.provisional
                          ? "Provisional; available evidence is still building."
                          : "Calculated from the records and weights shown below."}
                      </p>
                    </div>
                    <div className="score-breakdown">
                      {Object.entries({
                        "Verified skills · 40%":
                          w.sharedReputation.components.verifiedSkills,
                        "Completed work · 30%":
                          w.sharedReputation.components.completedWork,
                        "Employer feedback · 20%":
                          w.sharedReputation.components.employerFeedback,
                        "Profile completeness · 10%":
                          w.sharedReputation.components.profileCompleteness,
                      }).map(([label, value]) => (
                        <div key={label}>
                          <span>{label}</span>
                          <b>{Math.round(value)}%</b>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="feedback-list">
                  {feedback.map(f => (
                    <div key={f.id}>
                      <div className="stars">
                        {"★".repeat(f.score)}
                        <span>{"★".repeat(5 - f.score)}</span>
                      </div>
                      <p>“{f.comment}”</p>
                      <small>{f.date}</small>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="restricted-empty">
                <ShieldCheck size={18} />
                <span>
                  Only visible if the worker selects Reputation summary.
                </span>
              </div>
            )}
          </Card>
          <Card className="privacy-card">
            <ShieldCheck size={20} />
            <h3>Consent controls this view.</h3>
            <p>
              Contact details are never included in this directory. If access is
              revoked, restricted fields disappear from the next employer
              response.
            </p>
            <Link to="/employer/access-requests">
              View access requests <ArrowRight size={14} />
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}

export function JobsPage({ admin = false }: { admin?: boolean }) {
  const { actor, state } = useSkillPass();
  const run = useDemoAction();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const allJobs = admin
    ? state.jobs
    : state.jobs.filter(j => j.employerId === actor?.employerId);
  const jobs = allJobs.filter(
    j =>
      (statusFilter === "All statuses" || j.status === statusFilter) &&
      `${j.title} ${j.trade} ${j.city} ${j.state} ${j.description}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  const close = async (job: Job) => {
    try {
      await run({
        type: "job.save",
        job: { ...job, status: job.status === "Open" ? "Closed" : "Open" },
      });
      setError("");
      setMsg(
        `“${job.title}” marked ${job.status === "Open" ? "closed" : "open"}.`
      );
    } catch (e) {
      setMsg("");
      setError(toError(e));
    }
  };
  return (
    <>
      <Header
        eyebrow={admin ? "TRAINING PARTNER · ADMIN" : "EMPLOYER WORKSPACE"}
        title="Job listings"
        subtitle={
          admin
            ? "Browse and check the demo job records."
            : "Create and manage your open roles."
        }
        action={
          !admin && (
            <Link className="btn btn-primary" to="/employer/jobs/new">
              <Plus size={16} /> Create job
            </Link>
          )
        }
      />
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {msg && (
        <div className="inline-success" role="status">
          {msg}
        </div>
      )}
      <Card className="filter-panel">
        <div className="directory-tools">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search job listings"
              placeholder="Search title, trade or location"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </label>
          <div className="filter-control">
            <Filter size={15} />
            <select
              aria-label="Filter job status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {["All statuses", "Open", "Closed"].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-result">{jobs.length} job listings</div>
      </Card>
      <div className="job-list">
        {jobs.length ? (
          jobs.map(job => (
            <Card className="job-card" key={job.id}>
              <div className="job-card-head">
                <div className="job-icon">
                  <BriefcaseBusiness size={18} />
                </div>
                <div>
                  <h2>{job.title}</h2>
                  <span>
                    {job.trade} <i /> {job.city}, {job.state}
                  </span>
                </div>
                <Status value={job.status} />
              </div>
              <p>{job.description}</p>
              <div className="job-pills">
                <span>
                  <BriefcaseBusiness size={14} />
                  {job.minExperience}+ years' experience
                </span>
                {job.requiredSkills.map(s => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="job-card-foot">
                <span>
                  Created {new Date(job.createdAt).toLocaleDateString()} ·{" "}
                  {state.employers.find(e => e.id === job.employerId)?.name}
                </span>
                <div>
                  {!admin && (
                    <>
                      <Link
                        className="btn btn-outline btn-xs"
                        to={`/employer/jobs/${job.id}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => close(job)}
                      >
                        {job.status === "Open" ? "Close job" : "Reopen job"}
                      </button>
                    </>
                  )}
                  <Link
                    className="subtle-link"
                    to={admin ? "/partner/workers" : "/employer/workers"}
                  >
                    View matches <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <Empty
              title={
                allJobs.length ? "No jobs match those filters" : "No jobs yet"
              }
              text={
                allJobs.length
                  ? "Try another status or search term."
                  : "Add a job to start matching candidates against real profile records."
              }
              action={
                allJobs.length ? (
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setQuery("");
                      setStatusFilter("All statuses");
                    }}
                  >
                    Clear filters
                  </button>
                ) : (
                  !admin && (
                    <Link className="btn btn-primary" to="/employer/jobs/new">
                      Create a job
                    </Link>
                  )
                )
              }
            />
          </Card>
        )}
      </div>
    </>
  );
}

export function JobEditorPage() {
  const { actor, state } = useSkillPass();
  const { jobId } = useParams();
  const job = jobId ? state.jobs.find(j => j.id === jobId) : undefined;
  const navigate = useNavigate();
  const run = useDemoAction();
  const employer = state.employers.find(e => e.id === actor?.employerId);
  const [form, setForm] = useState({
    title: job?.title || "",
    trade: job?.trade || "Electrician",
    city: job?.city || employer?.city || "Chennai",
    state: job?.state || "Tamil Nadu",
    minExperience: job?.minExperience ?? 0,
    skills: job?.requiredSkills.join(", ") || "",
    description: job?.description || "",
    status: job?.status || ("Open" as Job["status"]),
  });
  const [error, setError] = useState("");
  if (jobId && !job)
    return (
      <div className="not-found">
        <div className="eyebrow">JOB NOT FOUND</div>
        <h1>This listing isn’t available.</h1>
        <Link className="btn btn-primary" to="/employer/jobs">
          Back to jobs
        </Link>
      </div>
    );
  const update = (key: keyof typeof form, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.city.trim() ||
      !form.description.trim() ||
      !form.skills.trim()
    ) {
      setError("Enter a title, location, required skill and description.");
      return;
    }
    const record: Job = {
      id: job?.id || makeId("job"),
      employerId: actor?.employerId || "employer-ches",
      title: form.title.trim(),
      trade: form.trade,
      city: form.city.trim(),
      state: form.state.trim(),
      minExperience: Number(form.minExperience),
      requiredSkills: form.skills
        .split(",")
        .map(x => x.trim())
        .filter(Boolean),
      description: form.description.trim(),
      status: form.status,
      createdAt: job?.createdAt || new Date().toISOString(),
    };
    try {
      await run({ type: "job.save", job: record });
      navigate("/employer/jobs");
    } catch (e) {
      setError(toError(e));
    }
  };
  return (
    <>
      <Header
        eyebrow="EMPLOYER WORKSPACE"
        title={job ? "Edit job listing" : "Create a job listing"}
        subtitle="Matching updates automatically from the current worker records."
        action={
          <Link className="btn btn-secondary" to="/employer/jobs">
            Cancel
          </Link>
        }
      />
      <Card className="form-card">
        <form className="form-grid" onSubmit={submit}>
          <Field label="Job title *">
            <input
              value={form.title}
              onChange={e => update("title", e.target.value)}
              placeholder="Residential Electrician"
              required
            />
          </Field>
          <Field label="Required trade *">
            <select
              value={form.trade}
              onChange={e => update("trade", e.target.value)}
            >
              {trades.map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Work location · city *">
            <input
              value={form.city}
              onChange={e => update("city", e.target.value)}
              required
            />
          </Field>
          <Field label="State">
            <input
              value={form.state}
              onChange={e => update("state", e.target.value)}
            />
          </Field>
          <Field label="Minimum experience (years)">
            <input
              type="number"
              min="0"
              max="60"
              value={form.minExperience}
              onChange={e => update("minExperience", Number(e.target.value))}
            />
          </Field>
          <Field
            label="Required skills *"
            hint="Separate multiple skills with commas."
          >
            <input
              value={form.skills}
              onChange={e => update("skills", e.target.value)}
              placeholder="Electrical wiring, maintenance"
              required
            />
          </Field>
          <Field label="Job description *">
            <textarea
              rows={5}
              value={form.description}
              onChange={e => update("description", e.target.value)}
              placeholder="Describe the work and expectations."
              required
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={e => update("status", e.target.value)}
            >
              <option>Open</option>
              <option>Closed</option>
            </select>
          </Field>
          {error && (
            <div className="form-error span-all" role="alert">
              {error}
            </div>
          )}
          <div className="form-actions span-all">
            <button className="btn btn-primary" type="submit">
              {job ? "Save changes" : "Publish demo job"} <Check size={16} />
            </button>
            <span>
              This fictional listing appears in worker opportunities and
              rule-based matches.
            </span>
          </div>
        </form>
      </Card>
    </>
  );
}

export function AdminDashboard() {
  const { state } = useSkillPass();
  const pending = state.skills.filter(s => s.status === "Pending").length;
  const verified = state.skills.filter(s => s.status === "Verified").length;
  const open = state.jobs.filter(j => j.status === "Open").length;
  return (
    <>
      <Header
        eyebrow="TRAINING PARTNER / ADMIN"
        title="Demo operations overview"
        subtitle="A live view of fictional records and workflow activity."
        action={
          <Link className="btn btn-primary" to="/partner/verification-requests">
            <ClipboardIcon /> Review requests
          </Link>
        }
      />
      <div className="metric-grid">
        <Metric
          label="Registered workers"
          value={state.workers.length}
          detail="Fictional demo profiles"
          icon={Users}
          to="/partner/workers"
        />
        <Metric
          label="Pending verification"
          value={pending}
          detail="Awaiting partner review"
          icon={Clock3}
          to="/partner/verification-requests"
        />
        <Metric
          label="Completed verifications"
          value={verified}
          detail="Demo partner decisions"
          icon={BadgeCheck}
          to="/partner/verification-requests"
        />
        <Metric
          label="Employers / open jobs"
          value={`${state.employers.length} / ${open}`}
          detail="Current demo records"
          icon={BriefcaseBusiness}
          to="/partner/jobs"
        />
      </div>
      <div className="dashboard-columns">
        <Card>
          <CardTitle
            title="Verification queue"
            detail="Review status from worker requests"
            action={
              <Link className="subtle-link" to="/partner/verification-requests">
                Open queue <ArrowRight size={14} />
              </Link>
            }
          />
          {state.skills
            .filter(s => s.status === "Pending")
            .slice(0, 4)
            .map(s => (
              <div className="queue-row" key={s.id}>
                <div className="queue-avatar">
                  {workerById(s.workerId, state.workers)
                    ?.name.split(" ")
                    .map(x => x[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <strong>{s.name}</strong>
                  <span>
                    {workerById(s.workerId, state.workers)?.name} ·{" "}
                    {workerById(s.workerId, state.workers)?.trade}
                  </span>
                </div>
                <Status value="Pending" />
              </div>
            ))}
        </Card>
        <Card>
          <CardTitle
            title="Recent activity"
            action={
              <Link className="subtle-link" to="/partner/activity">
                Full activity log <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="timeline-list">
            {state.activity.slice(0, 5).map(a => (
              <div className="timeline-item" key={a.id}>
                <span className="timeline-dot" />
                <div>
                  <strong>{a.action}</strong>
                  <p>{a.related}</p>
                  <small>
                    {new Date(a.createdAt).toLocaleDateString()} · {a.status}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="admin-links">
        <Link to="/partner/workers">
          <Users size={17} /> Manage worker records <ArrowRight size={15} />
        </Link>
        <Link to="/partner/employers">
          <BriefcaseBusiness size={17} /> Employer directory{" "}
          <ArrowRight size={15} />
        </Link>
        <Link to="/partner/jobs">
          <FileText size={17} /> View job listings <ArrowRight size={15} />
        </Link>
      </div>
    </>
  );
}
function ClipboardIcon() {
  return <FileCheck2 size={16} />;
}

export function VerificationQueuePage() {
  const { state } = useSkillPass();
  const run = useDemoAction();
  const [filter, setFilter] = useState("Pending"),
    [query, setQuery] = useState(""),
    [notes, setNotes] = useState<Record<string, string>>({}),
    [message, setMessage] = useState("");
  const options: VerificationStatus[] = [
    "Pending",
    "Needs More Information",
    "Verified",
    "Rejected",
    "Not Submitted",
  ];
  const rows = state.skills.filter(
    s =>
      (filter === "All statuses" || s.status === filter) &&
      `${s.name} ${workerById(s.workerId, state.workers)?.name || ""} ${workerById(s.workerId, state.workers)?.trade || ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  const review = async (
    s: SkillRecord,
    status: "Verified" | "Rejected" | "Needs More Information"
  ) => {
    try {
      await run({
        type: "skill.review",
        skillId: s.id,
        status,
        notes:
          notes[s.id]?.trim() ||
          (status === "Verified"
            ? "Demo evidence reviewed; approved for this demonstration."
            : status === "Rejected"
              ? "Demo evidence did not meet the sample review criteria."
              : "Please provide one additional fictional evidence item."),
      });
      setMessage(`${s.name} updated to ${status}.`);
      setTimeout(() => setMessage(""), 3500);
    } catch (e) {
      setMessage(toError(e));
    }
  };
  return (
    <>
      <Header
        eyebrow="TRAINING PARTNER · ADMIN"
        title="Verification requests"
        subtitle="Review fictional evidence and record a clear, traceable demo decision."
      />
      <div className="honesty-banner">
        <ShieldCheck size={17} />
        <div>
          <strong>Demo Verification — Not an Official Certification</strong>
          <span>
            Actions below update this application only; they do not authenticate
            a real-world credential.
          </span>
        </div>
      </div>
      {message && (
        <div className="inline-success" role="status">
          {message}
        </div>
      )}
      <Card className="filter-panel">
        <div className="directory-tools">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search verification requests"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search worker or skill"
            />
          </label>
          <div className="filter-control">
            <Filter size={15} />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              aria-label="Filter verification status"
            >
              <option>All statuses</option>
              {options.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-result">{rows.length} records shown</div>
      </Card>
      <div className="review-list">
        {rows.length ? (
          rows.map(s => {
            const w = workerById(s.workerId, state.workers);
            return (
              <Card className="review-card" key={s.id}>
                <div className="review-head">
                  <div className="queue-avatar">
                    {w?.name
                      .split(" ")
                      .map(x => x[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <h2>{s.name}</h2>
                    <span>
                      {w?.name} · {w?.trade} · {w?.city}
                    </span>
                  </div>
                  <Status value={s.status} />
                </div>
                <div className="evidence-box">
                  <span>FICTIONAL SUPPORTING EVIDENCE</span>
                  <p>
                    {s.evidence || "No evidence supplied in this demo record."}
                  </p>
                </div>
                {s.notes && (
                  <p className="review-note">Previous note: {s.notes}</p>
                )}
                {(s.status === "Pending" ||
                  s.status === "Needs More Information") && (
                  <>
                    <Field label="Review note">
                      <textarea
                        rows={2}
                        value={notes[s.id] || ""}
                        onChange={e =>
                          setNotes(n => ({ ...n, [s.id]: e.target.value }))
                        }
                        placeholder="Record a short explanation for the worker."
                      />
                    </Field>
                    <div className="review-actions">
                      <button
                        className="btn btn-danger-outline"
                        onClick={() => review(s, "Rejected")}
                      >
                        <X size={15} /> Reject
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => review(s, "Needs More Information")}
                      >
                        <CircleAlert size={15} /> Request information
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => review(s, "Verified")}
                      >
                        <Check size={15} /> Verify (demo)
                      </button>
                    </div>
                  </>
                )}
              </Card>
            );
          })
        ) : (
          <Card>
            <Empty
              title="No requests in this view"
              text="Use the status filter to inspect other fictional skill records."
            />
          </Card>
        )}
      </div>
    </>
  );
}

export function EmployersPage() {
  const { state } = useSkillPass();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All cities");
  const cities = Array.from(new Set(state.employers.map(e => e.city))).sort();
  const employers = state.employers.filter(
    e =>
      (city === "All cities" || e.city === city) &&
      `${e.name} ${e.city} ${e.contactName}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  return (
    <>
      <Header
        eyebrow="TRAINING PARTNER · ADMIN"
        title="Employer directory"
        subtitle="Fictional employers and their current job listings."
      />
      <Card className="filter-panel">
        <div className="directory-tools">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search employers"
              placeholder="Search organization, city or contact"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </label>
          <div className="filter-control">
            <MapPin size={15} />
            <select
              aria-label="Filter employers by city"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option>All cities</option>
              {cities.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-result">{employers.length} demo employers</div>
      </Card>
      <Card>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Employer</th>
                <th>City</th>
                <th>Contact (demo)</th>
                <th>Open jobs</th>
                <th>Access requests</th>
              </tr>
            </thead>
            <tbody>
              {employers.map(e => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                  </td>
                  <td>{e.city}</td>
                  <td>{e.contactName}</td>
                  <td>
                    {
                      state.jobs.filter(
                        j => j.employerId === e.id && j.status === "Open"
                      ).length
                    }
                  </td>
                  <td>
                    {
                      state.accessRequests.filter(r => r.employerId === e.id)
                        .length
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!employers.length && (
            <Empty
              title="No employers match those filters"
              text="Try another organization name or city."
            />
          )}
        </div>
      </Card>
      <div className="honesty-note">
        <ShieldCheck size={16} /> These organizations and contacts are fictional
        demo data.
      </div>
    </>
  );
}

export function ActivityPage() {
  const { state } = useSkillPass();
  const [query, setQuery] = useState("");
  const rows = state.activity.filter(a =>
    `${a.action} ${a.related} ${a.actorName} ${a.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  return (
    <>
      <Header
        eyebrow="TRAINING PARTNER · ADMIN"
        title="Activity logs"
        subtitle="Workflow actions recorded by the SkillPass demonstration."
      />
      <Card className="filter-panel">
        <label className="search-box">
          <Search size={17} />
          <input
            placeholder="Search actions, records or demo role"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </label>
        <div className="filter-result">{rows.length} activity records</div>
      </Card>
      <Card>
        {rows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Related record</th>
                  <th>Demo actor</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(a => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.action}</strong>
                    </td>
                    <td>{a.related}</td>
                    <td>{a.actorName}</td>
                    <td>
                      <Status value={a.status} />
                    </td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No activity matches" text="Try another search term." />
        )}
      </Card>
    </>
  );
}

export function NotificationsPage() {
  const { actor, state, dispatch } = useSkillPass();
  const rows = state.notifications.filter(
    n =>
      n.role === actor?.role &&
      (actor?.role !== "worker" || n.workerId === actor.workerId) &&
      (actor?.role !== "employer" || n.employerId === actor.employerId)
  );
  const [message, setMessage] = useState("");
  const read = async (id: string) => {
    try {
      await dispatch({ type: "notification.read", notificationId: id });
    } catch (e) {
      setMessage(toError(e));
    }
  };
  return (
    <>
      <Header
        eyebrow={`${actor?.role.toUpperCase()} WORKSPACE`}
        title="Notifications"
        subtitle="In-app demo notices only. No email or SMS is sent."
        action={
          <button
            className="btn btn-outline"
            onClick={() =>
              Promise.all(rows.filter(n => !n.read).map(n => read(n.id)))
            }
          >
            Mark visible as read
          </button>
        }
      />
      {message && (
        <div className="inline-error" role="alert">
          {message}
        </div>
      )}
      <Card>
        {rows.length ? (
          rows.map(n => (
            <div
              className={`notification-row ${n.read ? "read" : "unread"}`}
              key={n.id}
            >
              <div className="notification-symbol">
                <Bell size={17} />
              </div>
              <div className="notification-copy">
                <strong>{n.title}</strong>
                <p>{n.detail}</p>
                <small>
                  {new Date(n.createdAt).toLocaleString()} · in-app demo notice
                </small>
              </div>
              {!n.read && (
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => read(n.id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        ) : (
          <Empty
            title="You’re all caught up"
            text="New in-app notices about verification, access requests and matching jobs appear here."
          />
        )}
      </Card>
    </>
  );
}

export function SettingsPage() {
  const { actor, persistence, refresh, logout } = useSkillPass();
  const navigate = useNavigate();
  const [refreshed, setRefreshed] = useState(false);
  return (
    <>
      <Header
        eyebrow={`${actor?.role.toUpperCase()} WORKSPACE`}
        title="Settings"
        subtitle="Demonstration session and data status."
      />
      <div className="settings-grid">
        <Card>
          <CardTitle
            title="Demo session"
            detail="This is a role-switchable demo session, not real account authentication."
          />
          <div className="setting-row">
            <span>Current role</span>
            <strong>
              {actor?.role === "partner"
                ? "Training Partner / Admin"
                : actor?.role}
            </strong>
          </div>
          <div className="setting-row">
            <span>Active demo identity</span>
            <strong>{actor?.name}</strong>
          </div>
          <div className="setting-row">
            <span>Persistence</span>
            <strong>{persistence}</strong>
          </div>
          <div className="settings-actions">
            <button
              className="btn btn-secondary"
              onClick={async () => {
                await refresh();
                setRefreshed(true);
                setTimeout(() => setRefreshed(false), 2500);
              }}
            >
              Refresh demo data
            </button>
            {refreshed && <span className="success-text">Refreshed</span>}
          </div>
        </Card>
        <Card>
          <CardTitle title="Honest limitations" />
          <ul className="limitation-list">
            <li>No production identity authentication or customer accounts.</li>
            <li>
              Verification is fictional and not an official certification.
            </li>
            <li>
              No email, SMS, external certificate check or external employer
              integration.
            </li>
            <li>
              QR code contains only an application route; worker demo session is
              required.
            </li>
            <li>
              Demo data may use managed persistence; do not enter real personal
              information.
            </li>
          </ul>
        </Card>
      </div>
      <div className="settings-exit">
        <div>
          <h3>Finished exploring?</h3>
          <p>Exit the demo session and return to the public SkillPass page.</p>
        </div>
        <button
          className="btn btn-danger-outline"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <X size={15} /> Exit demo
        </button>
      </div>
    </>
  );
}
