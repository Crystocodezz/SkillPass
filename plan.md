# SkillPass — Implementation Plan

## Product and scope

Build the approved SkillPass workforce trust platform for India's blue-collar and gig workers. It includes public product education and demo entry plus functional Worker, Employer, and Training Partner/Admin workspaces. The end-to-end demo centers on an electrician in Chennai: profile and skills → verification request and review → updated passport → employer job and data-derived matching → requested access → selected-field approval → revocation and activity history. All records and external-verification claims remain explicitly fictional/demo.

## Implementation approach

- Continue in the initialized managed `web-db-user` project: React 19, TypeScript, Tailwind 4, Vite, Express, tRPC 11, Drizzle ORM, and managed MySQL. The Supabase connectors are disabled, so use the already-configured managed database rather than silently enabling an external service.
- The starter currently uses Wouter. Replace its routing with React Router, as explicitly requested, and keep route declarations centralized and complete, including validated dynamic worker/job routes and useful 404 handling.
- Persist the complete typed demonstration state in an additive, versioned Drizzle/MySQL state row. The payload contains separately identified worker profiles, skills, verification, training, work history, employers, jobs, access requests/permissions, feedback, notifications and activity with explicit record IDs and relationships. Seed only when no demo row exists; never reset existing data. Keep a browser-local demo fallback if the backend cannot be reached and label persistence mode accurately. Validate new record IDs for format/uniqueness, training/work/feedback month dates as `YYYY-MM`, supported demo training status, and job state/skill requirements before persistence; assign job creation timestamps server-side and preserve them on edits. This compact evaluator-demo schema is not a claim of normalized production storage; normalize it and add production-grade database policies before launch.
- Provide demo-role selection (Worker, Employer, Training Partner/Admin) with an unmistakable demo notice. Role-bearing requests are checked server-side and the server returns role-filtered views; demo role selection is intentionally open to evaluators and is not real identity authentication. Employer directory projections use stable opaque candidate handles instead of name-derived IDs; the server rejects unknown/raw IDs and resolves only issued handles for permitted workflow actions. These handles are a UI privacy measure, not a cryptographic identity boundary. A new employer access request is always stored as Pending with no fields; only a worker-matched decision marker on `access.resolve` can grant selected fields. Legacy approvals without that worker decision marker are treated as pending and grant no records. Worker projections omit employer contact names. Protected routes preserve their destination through role selection; a failed data load clears the active demo session and cached projection. Do not claim production-ready identity, deployment security, external verification, email/SMS or integrations. Protected sharing goes through application access checks and selected permission records, never an unrestricted public worker URL.
- Derive dashboards, matching, reputation and timeline views from underlying records. Keep matching and scoring calculations in shared, typed domain helpers with explanations. Make consent revocation immediately affect employer-visible passport fields.
- Add reusable app shell, navigation, forms, tables, status badges, timelines, empty/error states, confirmation feedback, print view, QR preview, and responsive layouts. Use existing components where suitable; avoid unnecessary dependencies and decorative-only controls.

## Project structure

- `client/src/App.tsx`: React Router routes, shared providers and not-found fallback.
- `client/src/pages/`: public pages and role-specific dashboard, profile, passport, verification, directory, jobs, consent, notification, management, settings and record-detail pages.
- `client/src/components/`: app shell/sidebar, role switcher, responsive navigation, data cards/tables, status badges, dialogs and reusable empty/error states.
- `client/src/lib/` and `shared/skillpass.ts`: tRPC client, typed product model, fictional seed data, matching/reputation helpers and workflow reducers.
- `client/src/contexts/`: role-aware state loading, demo login, persistence status and actions.
- `client/src/index.css`: SkillPass palette, typography, spacing and shared responsive design tokens.
- `server/skillpassApi.ts`: signed demo-role sessions, role-checked actions, database persistence and role-filtered response views; preserve existing OAuth and health infrastructure.
- `drizzle/schema.ts` and additive migration: versioned demo-state persistence; retain the existing users/auth table.
- `public/manus-routes.json`: all supported page routes, kept aligned with React Router.
- Root `plan.md`, `TODO.md`, and `app.config.ts`: approved design/acceptance record and required platform project branding metadata.

## Design system

- **Design movement:** contemporary civic-tech/workforce operations, closer to a dependable field-services console than a consumer fintech dashboard.
- **Core principles:** legibility first; evidence over claims; permissions visible at the point of sharing; compact but calm operational hierarchy.
- **Color philosophy:** deep navy communicates steadiness; a restrained teal is the ownable signal for verified/active states; warm off-white and white surfaces keep dense data humane; amber/red are reserved for pending/attention/error.
- **Layout paradigm:** a persistent, compact left rail for role workflows with a top utility row and a wide content canvas organized as stacked operational sections, not oversized centered statistic tiles. Collapse navigation on narrow screens.
- **Signature elements:** SkillPass shield/linked-check wordmark; verification history rendered as an evidence timeline; consistent consent-scope chips beside every shared field.
- **Interaction philosophy:** actions name their consequences; approve/reject/revoke operations give clear feedback; tables and cards remain usable with keyboard and touch; no control is decorative.
- **Animation:** minimal 120–180 ms opacity/position transitions for navigation, disclosure and status feedback; respect reduced-motion; no looping or attention-grabbing motion.
- **Typography system:** Inter for interface and data; use a restrained display weight/scale for page headings and tabular numerals for scores; accessible line-height and minimum readable sizes.
- **Brand essence:** portable, evidence-backed work identity for skilled workers, without gatekeeping; **credible, practical, respectful**.
- **Brand voice:** plain language that names proof and permission. Example: “Your experience, in one portable record.” / “Choose exactly what this employer can see.”
- **Wordmark & logo:** custom compact shield made from two linked check/route strokes beside a carefully tracked SkillPass wordmark; never imply government issuance.
- **Signature brand color:** deep teal, paired with navy, used sparingly for verified proof and primary confirmation.

## Important limits and serving

The managed MySQL database is shared with the published application; schema changes are additive and testing did not reset or delete records. Supabase is not enabled. Role-switch demo sessions are deliberately selectable by evaluators and do not provide real identity authentication; any demo verification is not an official credential. Employer-facing candidate handles mask names in normal app views but do not constitute cryptographic anonymization. The single JSON state record is an evaluator-demo persistence layer, not a normalized production data model or a substitute for database row-level security. Training/work/feedback dates intentionally accept only `YYYY-MM` within 1900–2100, and new training entries use the `Demo record` status; broader date/status choices would require an intentional product change. No email/SMS delivery, external certificate checks, secure unrestricted public QR sharing, or production security audit will be claimed. Keep browser URLs relative, preserve hosted runtime defaults, and provide Preview unless publication is separately requested.
