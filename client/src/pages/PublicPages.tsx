import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleHelp,
  FileBadge2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { seedState, type Role } from "@shared/skillpass";
import { useSkillPass } from "../contexts/SkillPassContext";

const sample = seedState().workers[0];
const roleOptions: [Role, string, string, string][] = [
  ["worker", "Worker", "Build and share your skills passport.", "worker"],
  [
    "employer",
    "Employer",
    "Find skilled people and manage openings.",
    "building",
  ],
  [
    "partner",
    "Training Partner / Admin",
    "Review skill evidence and records.",
    "partner",
  ],
];
export function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> PORTABLE SKILL & TRUST PLATFORM
          </div>
          <h1>
            Good work deserves
            <br />
            <em>to travel.</em>
          </h1>
          <p className="hero-lead">
            A practical skill record for the people who keep India moving—built
            from experience, evidence and your permission to share.
          </p>
          <div className="button-row">
            <Link className="btn btn-primary btn-lg" to="/demo-login">
              Explore the demo <ArrowRight size={17} />
            </Link>
            <Link className="text-link" to="/how-it-works">
              See how it works <ChevronRight size={17} />
            </Link>
          </div>
          <div className="hero-note">
            <ShieldCheck size={16} />
            <span>Worker-controlled sharing. No Aadhaar required.</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-grid-mark" aria-hidden="true" />
          <div className="passport-sample">
            <div className="sample-top">
              <div>
                <span className="eyebrow">SAMPLE SKILL PASSPORT</span>
                <span className="sample-code">SP · CHN · 0284</span>
              </div>
              <div className="sample-mark">
                <BrandGlyph />
              </div>
            </div>
            <div className="sample-person">
              <div className="sample-avatar">RK</div>
              <div>
                <h3>{sample.name}</h3>
                <span>
                  {sample.trade} <i /> {sample.city}
                </span>
              </div>
            </div>
            <div className="sample-rule" />
            <div className="sample-skill-head">
              <span>SKILLS ON RECORD</span>
              <span>2 of 3 verified</span>
            </div>
            <div className="sample-skill">
              <span>
                <Check size={13} /> Electrical wiring
              </span>
              <b className="status verified">Verified · demo</b>
            </div>
            <div className="sample-skill">
              <span>
                <Check size={13} /> Electrical maintenance
              </span>
              <b className="status pending">In review</b>
            </div>
            <div className="sample-skill unverified">
              <span>
                <CircleHelp size={13} /> Circuit troubleshooting
              </span>
              <b>Self-reported</b>
            </div>
            <div className="sample-bottom">
              <div>
                <small>WORK HISTORY</small>
                <strong>5 years · 2 completed records</strong>
              </div>
              <div className="sample-score">
                <span>
                  TRUST
                  <br />
                  SUMMARY
                </span>
                <b>72</b>
              </div>
            </div>
            <div className="demo-stamp">
              <BadgeCheck size={13} /> DEMONSTRATION RECORD · NOT OFFICIAL
            </div>
          </div>
          <div className="hero-caption">
            <span>01 / 03</span>
            <span>Proof that can move with you</span>
            <ArrowDownRight size={16} />
          </div>
        </div>
      </section>
      <section className="flow-band">
        <div className="flow-intro">
          <span className="eyebrow">A SIMPLE, SHARED RECORD</span>
          <h2>
            From first skill
            <br />
            to next opportunity.
          </h2>
        </div>
        <div className="flow-steps">
          {[
            "Create profile",
            "Verify skills",
            "Build work history",
            "Share passport",
            "Find opportunities",
          ].map((step, i) => (
            <div className="flow-step" key={step}>
              <span className="flow-num">0{i + 1}</span>
              <span>{step}</span>
              {i < 4 && <i className="flow-connector" />}
            </div>
          ))}
        </div>
      </section>
      <section className="benefits-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ONE PLATFORM · THREE PERSPECTIVES</span>
            <h2>Built around the work.</h2>
          </div>
          <p>
            Skills are not limited to a certificate. SkillPass gives practical
            experience a clearer way to be seen.
          </p>
        </div>
        <div className="benefit-cards">
          <Benefit
            icon={Wrench}
            number="01"
            title="For workers"
            text="Bring your skills, training and work history together. Choose exactly which parts of your passport to share."
            link="/demo-login"
          />
          <Benefit
            icon={BriefcaseBusiness}
            number="02"
            title="For employers"
            text="Search practical profiles, compare transparent job matches and request permission before viewing detail."
            link="/demo-login"
          />
          <Benefit
            icon={Users}
            number="03"
            title="For training partners"
            text="Review fictional evidence, record decisions and leave a traceable verification timeline."
            link="/demo-login"
          />
        </div>
      </section>
      <section className="trust-section">
        <div className="trust-copy">
          <span className="eyebrow">A RECORD, NOT A CLAIM</span>
          <h2>Trust is built in the open.</h2>
          <p>
            SkillPass separates self-reported skills from demo-verified skills,
            explains how scores are calculated and records who reviewed a
            request.
          </p>
          <div className="trust-list">
            <p>
              <BadgeCheck size={18} /> Every verification carries a status and
              reviewer note.
            </p>
            <p>
              <LockKeyhole size={18} /> Employers request access; workers choose
              the fields.
            </p>
            <p>
              <FileBadge2 size={18} /> A passport is a portable work record—not
              a government ID.
            </p>
          </div>
        </div>
        <div className="trust-aside">
          <div className="trust-number">
            35<span>%</span>
          </div>
          <div className="trust-rule" />
          <h3>Trade match</h3>
          <p>
            Part of a transparent rule-based score, alongside skills, experience
            and location.
          </p>
          <span className="trust-foot">
            No “advanced AI” claims. Just clear rules.
          </span>
        </div>
      </section>
      <section className="closing-cta">
        <div>
          <span className="eyebrow">SEE THE WORKFLOW FOR YOURSELF</span>
          <h2>
            Start with a skill.
            <br />
            <em>See what it can unlock.</em>
          </h2>
        </div>
        <Link className="btn btn-light btn-lg" to="/demo-login">
          Open the interactive demo <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
function Benefit({
  icon: Icon,
  number,
  title,
  text,
  link,
}: {
  icon: typeof Wrench;
  number: string;
  title: string;
  text: string;
  link: string;
}) {
  return (
    <article className="benefit-card">
      <div className="benefit-top">
        <span>{number}</span>
        <Icon size={20} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to={link}>
        Explore demo <ChevronRight size={15} />
      </Link>
    </article>
  );
}
function BrandGlyph() {
  return (
    <span className="sample-glyph">
      <svg viewBox="0 0 32 32">
        <path d="M16 3 27 7.2v8.3c0 6.2-4.5 10.5-11 13.5C9.5 26 5 21.7 5 15.5V7.2L16 3Z" />
        <path d="m10.3 15.9 3.8 3.8 7.8-8" />
      </svg>
    </span>
  );
}
export function HowItWorksPage() {
  const steps = [
    {
      n: "01",
      title: "Create a practical profile",
      text: "Add your trade, language, location, experience and work records. Aadhaar is never required for this demo.",
    },
    {
      n: "02",
      title: "Request skill verification",
      text: "Submit a skill with fictional supporting evidence. A training partner can approve, reject or ask for more information.",
    },
    {
      n: "03",
      title: "Build a work history",
      text: "Keep completed jobs and feedback together with training and skills—one evolving record instead of scattered paperwork.",
    },
    {
      n: "04",
      title: "Share by permission",
      text: "An employer asks for access. You choose the fields, can review the active permission and revoke it later.",
    },
    {
      n: "05",
      title: "Explore relevant work",
      text: "Rule-based matches compare trade, verified skills, experience and location. The score shows its component parts.",
    },
  ];
  return (
    <main className="public-content">
      <div className="page-hero">
        <span className="eyebrow">HOW SKILLPASS WORKS</span>
        <h1>
          One clear record.
          <br />
          <em>More ways forward.</em>
        </h1>
        <p>
          Skills, work history and permission come together—without pretending a
          demo can replace official credentials.
        </p>
      </div>
      <div className="process-list">
        {steps.map((s, i) => (
          <article className="process-row" key={s.n}>
            <div className="process-index">{s.n}</div>
            <div className="process-icon">
              {i === 0 ? (
                <Users />
              ) : i === 1 ? (
                <BadgeCheck />
              ) : i === 2 ? (
                <BriefcaseBusiness />
              ) : i === 3 ? (
                <LockKeyhole />
              ) : (
                <Sparkles />
              )}
            </div>
            <div className="process-copy">
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </div>
            <div className="process-arrow">
              <ArrowRight size={19} />
            </div>
          </article>
        ))}
      </div>
      <div className="honesty-card">
        <ShieldCheck size={21} />
        <div>
          <strong>What this demonstration means</strong>
          <p>
            All people, employers, verification records and job listings are
            fictional. “Verified” means a demo partner changed the in-app
            status; it is not an official certification or real-world identity
            check.
          </p>
        </div>
      </div>
      <div className="center-cta">
        <Link className="btn btn-primary btn-lg" to="/demo-login">
          Explore the role-based demo <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}
export function LoginPage() {
  const { login, busy, error, clearError } = useSkillPass();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<Role>("worker"),
    [workerId, setWorkerId] = useState("worker-ravi");
  const [employerId, setEmployerId] = useState("employer-ches");
  const workers = seedState().workers;
  const requestedDestination = location.state?.from;
  const destination =
    typeof requestedDestination === "string" ? requestedDestination : undefined;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const actor = await login(
        role,
        role === "worker" ? workerId : undefined,
        role === "employer" ? employerId : undefined
      );
      const rolePath =
        role === "worker"
          ? "/worker"
          : role === "employer"
            ? "/employer"
            : "/partner";
      const sameRoleDestination =
        !!destination &&
        (destination === rolePath ||
          destination.startsWith(`${rolePath}/`) ||
          destination.startsWith(`${rolePath}?`) ||
          destination.startsWith(`${rolePath}#`));
      navigate(
        sameRoleDestination
          ? destination
          : actor.role === "worker"
            ? "/worker/dashboard"
            : actor.role === "employer"
              ? "/employer/dashboard"
              : "/partner/dashboard",
        { replace: true }
      );
    } catch {}
  };
  return (
    <main className="login-layout">
      <div className="login-info">
        <span className="eyebrow">SKILLPASS · INTERACTIVE DEMO</span>
        <h1>
          Choose a perspective.
          <br />
          <em>Explore the workflow.</em>
        </h1>
        <p>
          Switch between fictional roles to see how skills, verification and
          consent fit together.
        </p>
        <div className="login-note">
          <ShieldCheck size={19} />
          <span>
            Demo only. Role selection is not real authentication, and no
            official verification takes place.
          </span>
        </div>
        <div className="login-steps">
          <div>
            <b>01</b>
            <span>Worker builds a profile</span>
          </div>
          <div>
            <b>02</b>
            <span>Partner reviews a skill</span>
          </div>
          <div>
            <b>03</b>
            <span>Employer requests access</span>
          </div>
        </div>
      </div>
      <form className="login-card" onSubmit={submit}>
        <div className="form-kicker">DEMO ACCESS</div>
        <h2>Continue as</h2>
        <p className="form-intro">No registration or real account required.</p>
        <div className="role-choice-list">
          {roleOptions.map(([value, title, desc]) => (
            <button
              key={value}
              type="button"
              className={`role-choice ${role === value ? "selected" : ""}`}
              onClick={() => {
                setRole(value);
                clearError();
              }}
            >
              <span className="role-choice-icon">
                {value === "worker" ? (
                  <Wrench size={19} />
                ) : value === "employer" ? (
                  <BriefcaseBusiness size={19} />
                ) : (
                  <ClipboardIcon />
                )}
              </span>
              <span className="role-choice-copy">
                <strong>{title}</strong>
                <small>{desc}</small>
              </span>
              <span className="radio-dot" />
            </button>
          ))}
        </div>
        {role === "worker" && (
          <label className="form-field">
            <span>Worker profile</span>
            <select
              value={workerId}
              onChange={e => setWorkerId(e.target.value)}
            >
              <option value="worker-new">
                Create a new demo worker profile
              </option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} · {w.trade}
                </option>
              ))}
            </select>
            <small>
              Pick a fictional profile or start the electrician-in-Chennai
              workflow fresh.
            </small>
          </label>
        )}
        {role === "employer" && (
          <label className="form-field">
            <span>Employer workspace</span>
            <select
              value={employerId}
              onChange={e => setEmployerId(e.target.value)}
            >
              {seedState().employers.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <button
          className="btn btn-primary btn-block btn-lg"
          type="submit"
          disabled={busy}
        >
          {busy ? (
            "Opening demo…"
          ) : (
            <>
              Enter {roleOptions.find(r => r[0] === role)?.[1]} workspace{" "}
              <ArrowRight size={17} />
            </>
          )}
        </button>
        <small className="login-footer">
          Fictional sample records · Demo verification only
        </small>
      </form>
    </main>
  );
}
function ClipboardIcon() {
  return (
    <span className="clipboard-icon">
      <Check size={15} />
    </span>
  );
}
