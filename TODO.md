# SkillPass — Outcome Checklist

## Public product experience and design
- [x] Build a professional public landing page and How It Works content that explain SkillPass, the workforce problem, worker/employer/training-partner benefits, the workflow “Create Profile → Verify Skills → Build Work History → Share Skill Passport → Find Opportunities,” a sample skill passport, honest trust/verification, privacy/consent and demo login.
- [x] Apply one consistent professional workforce-management design across pages: deep navy primary, teal secondary, light grey/off-white backgrounds, white subtly bordered cards, Inter or similar, consistent sidebar, compact headers, structured tables, accessible contrast/readable type and subtle useful transitions. Avoid excessive gradients, neon/glow, random charts, excessive animation, unnecessary AI branding, oversized dashboard statistics, decorative nonfunctional controls and generic placeholders.

## Demo roles, routing and navigation
- [x] Provide a working demo login/role selector for Worker, Employer and Training Partner/Admin, allow evaluators to switch roles without complicated registration, display the active role, and show the relevant role dashboard/navigation. Do not portray role switching as real identity verification; protect backend operations with appropriate server-side checks when backend is configured.
- [x] Implement all public routes (Home, How It Works, Demo Login); worker routes (Dashboard, My Profile, Skill Passport, Verification, Job Opportunities, Data & Consent, Notifications, Settings); employer routes (Dashboard, Find Workers, Worker Details, Job Listings, Create Job, Access Requests, Notifications, Settings); and training partner/admin routes (Dashboard, Workers, Verification Requests, Employers, Job Listings, Activity Logs, Settings).
- [x] Every sidebar item must navigate to a valid page; every dashboard card must open its relevant page or provide a clear action; every form submission must work; browser Back/Forward, direct route opening and refresh must work; dynamic routes must validate parameters; unknown routes must show useful Not Found with working Back and Dashboard actions; do not redirect every invalid path to dashboard; use React Router consistently and role-appropriate navigation.

## Worker profile and worker dashboard
- [x] Allow worker registration and editing with full name, phone, preferred language, city, state, primary trade, years of experience, skills, training records, optional certificates, work history and optional profile photo. Validate required fields and phone with useful errors, save information, calculate/display completeness and reflect edits on the dashboard. Never require Aadhaar.
- [x] Support trades Electrician, Plumber, Carpenter, AC Technician, Mechanic, Construction Worker, Delivery Worker, Tailoring Professional and Other.
- [x] Worker dashboard displays record-derived profile summary, trade, experience, verified skills, pending verification requests, completed jobs, employer feedback, reputation score, passport status, recent activity and available matching opportunities; cards link to relevant pages. Clearly label fictional demo-derived statistics.

## Digital Skill Passport
- [x] Passport shows worker profile, trade, experience, skills with self-reported/verified distinction, training/certificate records, work history, completed jobs, employer feedback, reputation and explanation, creation date and last-updated date. Include preview, print-friendly view, share action with consent-based field selection and verification timeline.
- [x] Update the passport from profile, skill and work-history records. Clearly distinguish verified from self-reported skills and state that it is not government-issued identity documentation.

## Skill verification
- [x] Training partner dashboard supports viewing/searching pending requests and workers, opening submitted skills, reviewing fictional evidence, approving/rejecting/requesting additional information, adding notes and recording verifier/date. Support statuses Not Submitted, Pending, Verified, Rejected and Needs More Information.
- [x] Each status change updates the verification record, worker dashboard, passport, verification timeline and activity history. Prominently display the exact notice “Demo Verification — Not an Official Certification”; do not claim real-world certificate authentication.

## Employers, directory, jobs and matching
- [x] Employer dashboard includes available profiles, open jobs, matching candidates, pending access requests, recently viewed workers and recruitment activity.
- [x] Searchable worker directory filters by trade, city, experience, verified skills and verification status; supports sorting by best match, experience and profile completeness. Employers may open worker profiles and request private passport access; display only authorized information.
- [x] Employers can create, edit and close job listings with title, required trade, work location, minimum experience, required skills, description and status; validate required fields; provide active/closed listings, details and matching workers; save jobs and update dashboards immediately.
- [x] Implement transparent “Rule-Based Job Matching” from current worker and job records, with weights trade 35%, required-skill compatibility 35%, experience 20%, location 10%. Show total and component scores plus explanations; recalculate when records/requirements change; do not hardcode individual percentages or describe this as advanced AI.

## Reputation
- [x] Calculate a transparent 0–100 demonstration reputation score from current records using verified skills 40%, completed work records 30%, employer feedback 20%, profile completeness 10%; show breakdown and explanation; update when relevant records change.
- [x] Mark scores provisional and show insufficient-data indicators when evidence is missing; do not automatically assign perfect scores or punish workers for being new. Never use caste, religion, gender, Aadhaar or other sensitive personal attributes in matching or scoring.

## Consent, sharing and QR
- [x] Workers can view employer access requests, approve/reject, select allowed fields (name/trade, experience, verified skills, training, selected work history, reputation summary), inspect active permissions/history and revoke access where supported.
- [x] On employer request, create a request, surface it to the worker, record approval/rejection and selected permissions, update employer permitted view and activity. Revocation must remove protected fields via normal app access paths. Do not expose private records through unrestricted public links.
- [x] Optional QR passport preview points to a valid application route, displays only authorized fields and embeds no private personal data. If secure public sharing is not implemented, label the QR preview demo-only and restrict its data.

## Notifications, activity and administration
- [x] Functional in-app notification center covers verification requested/verified/additional information, employer access requested/approved/rejected and matching jobs. Do not claim external email/SMS was sent.
- [x] Recent activity records action, related user/record, timestamp and relevant status for important transitions.
- [x] Admin/training dashboard derives totals for registered workers, pending requests, completed verifications, employers, active jobs and recent activity. Management pages cover workers, verification requests, employers, jobs and activity logs with search, filters, record details and status updates. Restrict administrative operations according to active demo role and enforce backend permissions when genuinely configured.

## Fictional records and demonstration flow
- [x] Seed at least eight fictional workers: Ravi Kumar — Electrician — Chennai — 5 years; Meena Devi — Tailoring Professional — Chennai — 3 years; Arjun Raj — Plumber — Coimbatore — 6 years; Karthik S — AC Technician — Chennai — 4 years; Priya M — Carpenter — Madurai — 2 years; Suresh B — Mechanic — Bengaluru — 7 years; Naveen Kumar — Construction Worker — Salem — 5 years; Farhan A — Delivery Worker — Chennai — 2 years. Vary each worker's skills, verification statuses, work histories, experience, profile completeness and reputation evidence. Seed at least three fictional jobs and enough data for searching, filtering, matching, verification and consent. Derive dashboard statistics from underlying records.
- [x] Demonstrate through UI: worker creates electrician profile in Chennai; adds electrical wiring and maintenance; requests verification; partner reviews and verifies one; worker dashboard, timeline and passport update; employer creates Chennai electrician job with skill/experience requirements; scores recalculate from records; employer opens a matching profile and requests detailed passport access; worker approves selected fields; employer sees only permitted information; worker revokes; protected access disappears; activity history records the actions.

## Data model, persistence and honest failure states
- [x] Use coherent IDs/relationships for users, worker profiles, skills, verification requests, training records, work history, employer profiles, jobs, matches, reputation, passport-access requests, consent permissions, notifications and activity logs.
- [x] Use Supabase only if it is actually enabled/configured; otherwise use the available managed database or an honestly labelled functional local demo. Preserve existing credentials/configuration and data; make only necessary schema changes; configure appropriate backend/row permissions if genuinely available; handle database errors correctly. No destructive resets/migrations without explicit authorization.
- [x] Clearly distinguish local demo data from persistent backend data. Never claim production-ready backend, genuine identity/certificate verification, external integrations or official certification unless actually configured and tested.
- [x] Handle missing required form values, invalid phone numbers, missing records, invalid dynamic route parameters, database failures, empty search results, failed submissions, duplicates where applicable, unauthorized access, loading states and empty states with understandable messages. Server mutation paths also reject malformed or duplicate IDs, invalid YYYY-MM dates, unsupported training statuses, incomplete job state/requirements and unsupported action types before saving. Do not show success when an operation fails or display undefined values, broken links or blank screens.
- [x] Keep remaining backend/security/integration limitations clearly documented; prioritize reliable working functionality over unnecessary visual effects.
