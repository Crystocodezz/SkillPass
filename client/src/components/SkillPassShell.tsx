import { useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileBadge2,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@shared/skillpass";
import { useSkillPass } from "../contexts/SkillPassContext";

const labels: Record<Role, string> = {
  worker: "Worker",
  employer: "Employer",
  partner: "Training Partner / Admin",
};
const dashboard: Record<Role, string> = {
  worker: "/worker/dashboard",
  employer: "/employer/dashboard",
  partner: "/partner/dashboard",
};
type Item = { to: string; label: string; icon: LucideIcon };
const nav: Record<Role, Item[]> = {
  worker: [
    { to: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/worker/profile", label: "My Profile", icon: Users },
    { to: "/worker/passport", label: "Skill Passport", icon: FileBadge2 },
    { to: "/worker/verification", label: "Verification", icon: ClipboardCheck },
    {
      to: "/worker/opportunities",
      label: "Job Opportunities",
      icon: BriefcaseBusiness,
    },
    { to: "/worker/consent", label: "Data & Consent", icon: ShieldCheck },
    { to: "/worker/notifications", label: "Notifications", icon: Bell },
    { to: "/worker/settings", label: "Settings", icon: Settings },
  ],
  employer: [
    { to: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employer/workers", label: "Find Workers", icon: Search },
    { to: "/employer/jobs", label: "Job Listings", icon: BriefcaseBusiness },
    { to: "/employer/jobs/new", label: "Create Job", icon: FileText },
    {
      to: "/employer/access-requests",
      label: "Access Requests",
      icon: ShieldCheck,
    },
    { to: "/employer/notifications", label: "Notifications", icon: Bell },
    { to: "/employer/settings", label: "Settings", icon: Settings },
  ],
  partner: [
    { to: "/partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/partner/workers", label: "Workers", icon: Users },
    {
      to: "/partner/verification-requests",
      label: "Verification Requests",
      icon: ClipboardCheck,
    },
    { to: "/partner/employers", label: "Employers", icon: BriefcaseBusiness },
    { to: "/partner/jobs", label: "Job Listings", icon: FileText },
    { to: "/partner/activity", label: "Activity Logs", icon: Activity },
    { to: "/partner/settings", label: "Settings", icon: Settings },
  ],
};
export function PublicShell() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/" className="brand">
          <BrandMark />
          <span>
            Skill<span className="brand-pass">Pass</span>
          </span>
        </Link>
        <nav>
          <NavLink to="/how-it-works">How it works</NavLink>
          <Link className="btn btn-primary btn-sm" to="/demo-login">
            Open demo <span aria-hidden>→</span>
          </Link>
        </nav>
      </header>
      <Outlet />
      <footer className="public-footer">
        <BrandMark />
        <span>Portable proof for work that matters.</span>
        <span className="footer-demo">
          Fictional demo data · Not an official certification
        </span>
      </footer>
    </div>
  );
}
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M16 2.8 27 7v8.7c0 6.3-4.5 10.7-11 13.5C9.5 26.4 5 22 5 15.7V7l11-4.2Z" />
        <path d="m10.2 15.8 3.7 3.7 8-8" />
      </svg>
    </span>
  );
}
function RoleSwitcher() {
  const { actor, login, logout } = useSkillPass();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!actor) return null;
  return (
    <div className="role-switch">
      <button className="role-button" onClick={() => setOpen(!open)}>
        <span className="role-avatar">{actor.name.slice(0, 1)}</span>
        <span className="role-copy">
          <small>DEMO ROLE</small>
          <strong>{labels[actor.role]}</strong>
        </span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="role-menu">
          {(["worker", "employer", "partner"] as Role[]).map(role => (
            <button
              key={role}
              onClick={async () => {
                setOpen(false);
                try {
                  const a = await login(
                    role,
                    role === "worker" ? "worker-ravi" : undefined,
                    role === "employer" ? "employer-ches" : undefined
                  );
                  navigate(dashboard[a.role]);
                } catch {}
              }}
            >
              {labels[role]}
            </button>
          ))}
          <button
            className="signout"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut size={15} /> Exit demo
          </button>
        </div>
      )}
    </div>
  );
}
export function AppShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { actor, state, error, clearError } = useSkillPass();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = state.notifications.filter(n => !n.read).length;
  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Link className="brand" to={dashboard[role]}>
            <BrandMark />
            <span>
              Skill<span className="brand-pass">Pass</span>
            </span>
          </Link>
          <button
            className="icon-button mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="role-label">
          {labels[role]} workspace{" "}
          <span className="demo-dot" title="Demonstration mode" />
        </div>
        <nav className="side-nav">
          {nav[role].map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                end={item.to === dashboard[role]}
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `side-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.label === "Notifications" && unread > 0 && (
                  <span className="nav-count">{unread}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="side-spacer" />
        <div className="sidebar-note">
          <ShieldCheck size={17} />
          <div>
            <strong>Built around consent</strong>
            <span>Workers choose what to share.</span>
          </div>
        </div>
        <div className="side-profile">
          <span className="profile-avatar">
            {(actor?.name || "S").slice(0, 1)}
          </span>
          <div>
            <strong>{actor?.name || "SkillPass demo"}</strong>
            <span>Demo workspace</span>
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <main className="main-column">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="crumb">
            <span className="crumb-dot" /> Skills, experience & trust
          </div>
          <div className="top-actions">
            <Link
              to={
                nav[role].find(x => x.label === "Notifications")?.to ||
                dashboard[role]
              }
              className="icon-button notif-button"
              aria-label={`${unread} unread notifications`}
            >
              <Bell size={17} />
              {unread > 0 && <i />}
            </Link>
            <RoleSwitcher />
          </div>
        </header>
        <div className="demo-banner">
          <span className="demo-pill">DEMO</span>
          <span>
            Fictional records and role switching · Verification is not official.
          </span>
          <span className="persistence">{useSkillPass().persistence}</span>
        </div>
        {error && (
          <div className="global-error" role="alert">
            <span>{error}</span>
            <button onClick={clearError} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="page-wrap">{children}</div>
      </main>
    </div>
  );
}
export function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { actor, loading } = useSkillPass();
  const location = useLocation();
  if (loading)
    return (
      <div className="page-loading" role="status">
        Loading SkillPass demo…
      </div>
    );
  if (!actor)
    return (
      <Navigate
        to="/demo-login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  if (actor.role !== role)
    return <Navigate to={dashboard[actor.role]} replace />;
  return children;
}
export function NotFoundPage() {
  const navigate = useNavigate();
  const { actor } = useSkillPass();
  return (
    <div className="not-found">
      <div className="not-found-mark">
        <FileText size={24} />
      </div>
      <div className="eyebrow">404 · Page not found</div>
      <h1>This page isn’t in the SkillPass workspace.</h1>
      <p>
        Check the address or return to a page that’s available in this demo.
      </p>
      <div className="button-row">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go back
        </button>
        <Link
          className="btn btn-primary"
          to={actor ? dashboard[actor.role] : "/"}
        >
          <Home size={16} /> {actor ? "Dashboard" : "Home"}
        </Link>
      </div>
    </div>
  );
}
