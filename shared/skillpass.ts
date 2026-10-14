export type Role = "worker" | "employer" | "partner";
export type VerificationStatus =
  | "Not Submitted"
  | "Pending"
  | "Verified"
  | "Rejected"
  | "Needs More Information";
export type JobStatus = "Open" | "Closed";
export type AccessStatus = "Pending" | "Approved" | "Rejected" | "Revoked";
export type ShareField =
  | "nameTrade"
  | "experience"
  | "verifiedSkills"
  | "trainingRecords"
  | "workHistory"
  | "reputation";
export const SUPPORTED_TRADES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "AC Technician",
  "Mechanic",
  "Construction Worker",
  "Delivery Worker",
  "Tailoring Professional",
  "Other",
] as const;
export const SHARE_FIELDS: ShareField[] = [
  "nameTrade",
  "experience",
  "verifiedSkills",
  "trainingRecords",
  "workHistory",
  "reputation",
];

export interface DemoActor {
  role: Role;
  workerId?: string;
  employerId?: string;
  name: string;
}
export interface Worker {
  id: string;
  name: string;
  phone: string;
  preferredLanguage: string;
  city: string;
  state: string;
  trade: string;
  yearsExperience: number;
  joinedAt: string;
  profilePhoto?: string;
  directoryExperienceBand?: string;
  directoryVerifiedSkillCount?: number;
  directoryVerificationStatus?: VerificationStatus;
  directoryCompleteness?: number;
  sharedReputation?: {
    score: number;
    components: {
      verifiedSkills: number;
      completedWork: number;
      employerFeedback: number;
      profileCompleteness: number;
    };
    provisional: boolean;
  };
}
export function publicWorkerId(workerId: string): string {
  let hash = 2166136261;
  for (const char of workerId) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `candidate-${(hash >>> 0).toString(36)}`;
}
export function publicWorkerLabel(workerId: string): string {
  return `Worker ${publicWorkerId(workerId).slice(-4).toUpperCase()}`;
}
export function resolvePublicWorkerId(
  publicId: string,
  workers: Worker[]
): string | undefined {
  return workers.find(w => publicWorkerId(w.id) === publicId)?.id;
}
export interface SkillRecord {
  id: string;
  workerId: string;
  name: string;
  status: VerificationStatus;
  evidence: string;
  notes: string;
  verifier?: string;
  verifiedAt?: string;
  createdAt: string;
}
export interface TrainingRecord {
  id: string;
  workerId: string;
  title: string;
  provider: string;
  date: string;
  status: string;
}
export interface WorkRecord {
  id: string;
  workerId: string;
  employer: string;
  title: string;
  city: string;
  date: string;
  completed: boolean;
  rating?: number;
  feedback?: string;
}
export interface Employer {
  id: string;
  name: string;
  city: string;
  contactName: string;
}
export interface Job {
  id: string;
  employerId: string;
  title: string;
  trade: string;
  city: string;
  state: string;
  minExperience: number;
  requiredSkills: string[];
  description: string;
  status: JobStatus;
  createdAt: string;
}
export interface AccessRequest {
  id: string;
  workerId: string;
  employerId: string;
  jobId?: string;
  status: AccessStatus;
  fields: ShareField[];
  decidedBy?: string;
  createdAt: string;
  updatedAt: string;
}
export interface FeedbackRecord {
  id: string;
  workerId: string;
  employerId: string;
  score: number;
  comment: string;
  date: string;
}
export interface Notification {
  id: string;
  role: Role;
  workerId?: string;
  employerId?: string;
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
}
export interface ActivityRecord {
  id: string;
  actorRole: Role;
  actorName: string;
  action: string;
  related: string;
  status: string;
  createdAt: string;
  workerId?: string;
  employerId?: string;
}
export interface SkillPassState {
  workers: Worker[];
  skills: SkillRecord[];
  training: TrainingRecord[];
  workHistory: WorkRecord[];
  employers: Employer[];
  jobs: Job[];
  accessRequests: AccessRequest[];
  feedback: FeedbackRecord[];
  notifications: Notification[];
  activity: ActivityRecord[];
}

const at = (day: number) => new Date(Date.UTC(2026, 8, day, 10)).toISOString();
const workerRows: Worker[] = [
  {
    id: "worker-ravi",
    name: "Ravi Kumar",
    phone: "+91 98765 43210",
    preferredLanguage: "Tamil",
    city: "Chennai",
    state: "Tamil Nadu",
    trade: "Electrician",
    yearsExperience: 5,
    joinedAt: at(4),
  },
  {
    id: "worker-meena",
    name: "Meena Devi",
    phone: "+91 98765 43211",
    preferredLanguage: "Tamil",
    city: "Chennai",
    state: "Tamil Nadu",
    trade: "Tailoring Professional",
    yearsExperience: 3,
    joinedAt: at(5),
  },
  {
    id: "worker-arjun",
    name: "Arjun Raj",
    phone: "+91 98765 43212",
    preferredLanguage: "Tamil",
    city: "Coimbatore",
    state: "Tamil Nadu",
    trade: "Plumber",
    yearsExperience: 6,
    joinedAt: at(7),
  },
  {
    id: "worker-karthik",
    name: "Karthik S",
    phone: "+91 98765 43213",
    preferredLanguage: "Tamil",
    city: "Chennai",
    state: "Tamil Nadu",
    trade: "AC Technician",
    yearsExperience: 4,
    joinedAt: at(8),
  },
  {
    id: "worker-priya",
    name: "Priya M",
    phone: "+91 98765 43214",
    preferredLanguage: "Tamil",
    city: "Madurai",
    state: "Tamil Nadu",
    trade: "Carpenter",
    yearsExperience: 2,
    joinedAt: at(9),
  },
  {
    id: "worker-suresh",
    name: "Suresh B",
    phone: "+91 98765 43215",
    preferredLanguage: "Kannada",
    city: "Bengaluru",
    state: "Karnataka",
    trade: "Mechanic",
    yearsExperience: 7,
    joinedAt: at(10),
  },
  {
    id: "worker-naveen",
    name: "Naveen Kumar",
    phone: "+91 98765 43216",
    preferredLanguage: "Tamil",
    city: "Salem",
    state: "Tamil Nadu",
    trade: "Construction Worker",
    yearsExperience: 5,
    joinedAt: at(12),
  },
  {
    id: "worker-farhan",
    name: "Farhan A",
    phone: "+91 98765 43217",
    preferredLanguage: "Tamil",
    city: "Chennai",
    state: "Tamil Nadu",
    trade: "Delivery Worker",
    yearsExperience: 2,
    joinedAt: at(13),
  },
];
const skillRows: SkillRecord[] = [
  [
    "worker-ravi",
    "Electrical wiring",
    "Verified",
    "Workshop wiring board and safety checklist",
    "",
  ],
  [
    "worker-ravi",
    "Electrical maintenance",
    "Pending",
    "Fictional demo workshop log",
    "Awaiting partner review",
  ],
  ["worker-ravi", "Circuit troubleshooting", "Not Submitted", "", ""],
  [
    "worker-meena",
    "Garment alterations",
    "Verified",
    "Sample stitch-work portfolio",
    "",
  ],
  [
    "worker-meena",
    "Industrial sewing machine",
    "Needs More Information",
    "Training record excerpt",
    "Please add a dated practice log",
  ],
  [
    "worker-arjun",
    "Pipe fitting",
    "Verified",
    "Mock pipe-joint assessment",
    "",
  ],
  [
    "worker-arjun",
    "Leak detection",
    "Verified",
    "Fictional site checklist",
    "",
  ],
  [
    "worker-arjun",
    "Water pump maintenance",
    "Rejected",
    "Demo evidence set",
    "Evidence did not show the stated task",
  ],
  [
    "worker-karthik",
    "Split AC servicing",
    "Pending",
    "Mock service checklist",
    "Awaiting partner review",
  ],
  ["worker-karthik", "Refrigerant handling", "Not Submitted", "", ""],
  [
    "worker-priya",
    "Cabinet assembly",
    "Needs More Information",
    "Sample joinery photos",
    "Add one more evidence item",
  ],
  ["worker-priya", "Furniture repair", "Not Submitted", "", ""],
  [
    "worker-suresh",
    "Engine diagnostics",
    "Verified",
    "Fictional workshop evaluation",
    "",
  ],
  [
    "worker-suresh",
    "Preventive maintenance",
    "Verified",
    "Sample maintenance log",
    "",
  ],
  [
    "worker-naveen",
    "Site safety",
    "Pending",
    "Fictional induction checklist",
    "Awaiting partner review",
  ],
  ["worker-naveen", "Masonry basics", "Not Submitted", "", ""],
  [
    "worker-farhan",
    "Route planning",
    "Verified",
    "Sample delivery route record",
    "",
  ],
  ["worker-farhan", "Customer handoff", "Not Submitted", "", ""],
].map(([workerId, name, status, evidence, notes], i) => ({
  id: `skill-${i + 1}`,
  workerId,
  name,
  status: status as VerificationStatus,
  evidence,
  notes,
  verifier: status === "Verified" ? "SkillPass Demo Partner" : undefined,
  verifiedAt: status === "Verified" ? at(12 + (i % 4)) : undefined,
  createdAt: at(6 + (i % 8)),
}));
const trainingRows: TrainingRecord[] = [
  {
    id: "training-1",
    workerId: "worker-ravi",
    title: "Electrical safety basics",
    provider: "Chennai Skills Centre",
    date: "2024-11",
    status: "Demo record",
  },
  {
    id: "training-2",
    workerId: "worker-meena",
    title: "Garment finishing",
    provider: "South City Training Hub",
    date: "2025-02",
    status: "Demo record",
  },
  {
    id: "training-3",
    workerId: "worker-arjun",
    title: "Plumbing practice module",
    provider: "Coimbatore Trade Centre",
    date: "2024-08",
    status: "Demo record",
  },
  {
    id: "training-4",
    workerId: "worker-karthik",
    title: "Cooling systems workshop",
    provider: "Chennai Skills Centre",
    date: "2025-01",
    status: "Demo record",
  },
  {
    id: "training-5",
    workerId: "worker-suresh",
    title: "Automotive service fundamentals",
    provider: "Bengaluru Technical Hub",
    date: "2023-09",
    status: "Demo record",
  },
];
const workRows: WorkRecord[] = [
  {
    id: "work-1",
    workerId: "worker-ravi",
    employer: "Harbor View Apartments",
    title: "Electrical maintenance support",
    city: "Chennai",
    date: "2025-12",
    completed: true,
    rating: 5,
    feedback: "Careful work and clear handover.",
  },
  {
    id: "work-2",
    workerId: "worker-ravi",
    employer: "Lakshmi Stores",
    title: "Lighting installation",
    city: "Chennai",
    date: "2025-08",
    completed: true,
    rating: 4,
    feedback: "Finished on time.",
  },
  {
    id: "work-3",
    workerId: "worker-meena",
    employer: "Threadline Studio",
    title: "Alteration orders",
    city: "Chennai",
    date: "2026-01",
    completed: true,
    rating: 5,
    feedback: "Consistent finishing quality.",
  },
  {
    id: "work-4",
    workerId: "worker-arjun",
    employer: "Coimbatore Homes",
    title: "Bathroom fixture repair",
    city: "Coimbatore",
    date: "2025-10",
    completed: true,
    rating: 4,
    feedback: "Reliable and tidy.",
  },
  {
    id: "work-5",
    workerId: "worker-karthik",
    employer: "City Cool Services",
    title: "AC service visits",
    city: "Chennai",
    date: "2025-11",
    completed: false,
  },
  {
    id: "work-6",
    workerId: "worker-suresh",
    employer: "Bengaluru Auto Works",
    title: "Workshop service technician",
    city: "Bengaluru",
    date: "2025-12",
    completed: true,
    rating: 5,
    feedback: "Strong diagnostic notes.",
  },
  {
    id: "work-7",
    workerId: "worker-naveen",
    employer: "Salem BuildCo",
    title: "Residential site support",
    city: "Salem",
    date: "2025-09",
    completed: true,
    rating: 4,
    feedback: "Safety-aware team member.",
  },
  {
    id: "work-8",
    workerId: "worker-farhan",
    employer: "Metro Parcel Hub",
    title: "Local delivery rounds",
    city: "Chennai",
    date: "2026-02",
    completed: true,
    rating: 4,
    feedback: "Dependable handoffs.",
  },
];

export function seedState(): SkillPassState {
  return {
    workers: structuredClone(workerRows),
    skills: structuredClone(skillRows),
    training: structuredClone(trainingRows),
    workHistory: structuredClone(workRows),
    employers: [
      {
        id: "employer-ches",
        name: "Chennai Electrical Services",
        city: "Chennai",
        contactName: "Anand R.",
      },
      {
        id: "employer-coimbatore",
        name: "Coimbatore Home Care",
        city: "Coimbatore",
        contactName: "Divya K.",
      },
      {
        id: "employer-bengaluru",
        name: "Bengaluru Works Co.",
        city: "Bengaluru",
        contactName: "Ramesh P.",
      },
    ],
    jobs: [
      {
        id: "job-1",
        employerId: "employer-ches",
        title: "Residential Electrician",
        trade: "Electrician",
        city: "Chennai",
        state: "Tamil Nadu",
        minExperience: 3,
        requiredSkills: ["Electrical wiring", "Electrical maintenance"],
        description:
          "Install and maintain electrical fixtures across residential sites. Safety-first work and clear job notes required.",
        status: "Open",
        createdAt: at(14),
      },
      {
        id: "job-2",
        employerId: "employer-coimbatore",
        title: "Plumbing Technician",
        trade: "Plumber",
        city: "Coimbatore",
        state: "Tamil Nadu",
        minExperience: 2,
        requiredSkills: ["Pipe fitting", "Leak detection"],
        description:
          "Support repair visits and planned fixture work for local homes.",
        status: "Open",
        createdAt: at(13),
      },
      {
        id: "job-3",
        employerId: "employer-bengaluru",
        title: "Workshop Mechanic",
        trade: "Mechanic",
        city: "Bengaluru",
        state: "Karnataka",
        minExperience: 4,
        requiredSkills: ["Engine diagnostics", "Preventive maintenance"],
        description:
          "Carry out routine vehicle inspections and record repair findings.",
        status: "Open",
        createdAt: at(11),
      },
    ],
    accessRequests: [
      {
        id: "access-1",
        workerId: "worker-ravi",
        employerId: "employer-ches",
        jobId: "job-1",
        status: "Pending",
        fields: [],
        createdAt: at(16),
        updatedAt: at(16),
      },
    ],
    feedback: [
      {
        id: "feedback-1",
        workerId: "worker-ravi",
        employerId: "employer-ches",
        score: 5,
        comment: "Careful work and clear handover.",
        date: "2025-12",
      },
      {
        id: "feedback-2",
        workerId: "worker-ravi",
        employerId: "employer-ches",
        score: 4,
        comment: "Finished on time.",
        date: "2025-08",
      },
    ],
    notifications: [
      {
        id: "notification-1",
        role: "worker",
        workerId: "worker-ravi",
        title: "Access request received",
        detail:
          "Chennai Electrical Services requested access to your Skill Passport.",
        createdAt: at(16),
        read: false,
      },
      {
        id: "notification-2",
        role: "worker",
        workerId: "worker-ravi",
        title: "Skill verification pending",
        detail: "Electrical maintenance is awaiting demo partner review.",
        createdAt: at(12),
        read: false,
      },
      {
        id: "notification-3",
        role: "partner",
        title: "New verification request",
        detail: "Ravi Kumar submitted Electrical maintenance for review.",
        createdAt: at(12),
        read: false,
      },
      {
        id: "notification-4",
        role: "employer",
        employerId: "employer-ches",
        title: "Candidate access pending",
        detail:
          "Your request for Ravi Kumar’s detailed passport is awaiting a response.",
        createdAt: at(16),
        read: false,
      },
    ],
    activity: [
      {
        id: "activity-1",
        actorRole: "partner",
        actorName: "SkillPass Demo Partner",
        action: "Verified skill",
        related: "Electrical wiring · Ravi Kumar",
        status: "Verified",
        createdAt: at(12),
        workerId: "worker-ravi",
      },
      {
        id: "activity-2",
        actorRole: "employer",
        actorName: "Chennai Electrical Services",
        action: "Requested passport access",
        related: "Ravi Kumar",
        status: "Pending",
        createdAt: at(16),
        workerId: "worker-ravi",
        employerId: "employer-ches",
      },
    ],
  };
}

export function makeId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)}`;
}
export function profileCompleteness(
  worker: Worker | undefined,
  skills: SkillRecord[],
  training: TrainingRecord[],
  work: WorkRecord[]
): number {
  if (!worker) return 0;
  const checks = [
    !!worker.name,
    !!worker.phone,
    !!worker.preferredLanguage,
    !!worker.city,
    !!worker.state,
    !!worker.trade,
    worker.yearsExperience >= 0,
    skills.some(s => s.workerId === worker.id),
    training.some(t => t.workerId === worker.id),
    work.some(w => w.workerId === worker.id),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
export function reputation(worker: Worker, state: SkillPassState) {
  const skills = state.skills.filter(s => s.workerId === worker.id),
    verified = skills.filter(s => s.status === "Verified").length;
  const work = state.workHistory.filter(
    w => w.workerId === worker.id && w.completed
  ).length;
  const feedback = state.feedback.filter(f => f.workerId === worker.id);
  const components = {
    verifiedSkills: Math.min(100, (verified / 3) * 100),
    completedWork: Math.min(100, (work / 3) * 100),
    employerFeedback: feedback.length
      ? (feedback.reduce((a, f) => a + f.score, 0) / feedback.length / 5) * 100
      : 0,
    profileCompleteness: profileCompleteness(
      worker,
      skills,
      state.training,
      state.workHistory
    ),
  };
  const score = Math.round(
    components.verifiedSkills * 0.4 +
      components.completedWork * 0.3 +
      components.employerFeedback * 0.2 +
      components.profileCompleteness * 0.1
  );
  return {
    score,
    components,
    provisional: verified < 2 || work < 2 || feedback.length === 0,
  };
}
export function jobMatch(worker: Worker, job: Job, skills: SkillRecord[]) {
  const trade =
    worker.trade.toLowerCase() === job.trade.toLowerCase() ? 100 : 0;
  const owned = skills
    .filter(s => s.workerId === worker.id && s.status === "Verified")
    .map(s => s.name.toLowerCase());
  const skill = job.requiredSkills.length
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
    trade * 0.35 + skill * 0.35 + experience * 0.2 + location * 0.1
  );
  return {
    score,
    trade: Math.round(trade),
    skills: Math.round(skill),
    experience: Math.round(experience),
    location: Math.round(location),
    explanation: `${trade === 100 ? "Trade matches" : "Trade differs"}; ${Math.round(skill)}% of required skills verified; ${Math.round(experience)}% experience fit against this listing; ${location === 100 ? "same city" : location === 50 ? "same state" : "different state"}.`,
  };
}

export type SkillPassAction =
  | { type: "profile.save"; worker: Worker }
  | { type: "skill.add"; skill: SkillRecord }
  | { type: "skill.submit"; skillId: string }
  | {
      type: "skill.review";
      skillId: string;
      status: "Verified" | "Rejected" | "Needs More Information";
      notes: string;
    }
  | { type: "training.add"; record: TrainingRecord }
  | { type: "work.add"; record: WorkRecord }
  | { type: "worker.view"; workerId: string }
  | { type: "job.save"; job: Job }
  | { type: "access.request"; request: AccessRequest }
  | {
      type: "access.resolve";
      requestId: string;
      status: "Approved" | "Rejected";
      fields: ShareField[];
    }
  | { type: "access.revoke"; requestId: string }
  | { type: "feedback.add"; record: FeedbackRecord }
  | { type: "notification.read"; notificationId: string };

function event(
  state: SkillPassState,
  actor: DemoActor,
  action: string,
  related: string,
  status: string,
  workerId?: string,
  employerId?: string
) {
  state.activity.unshift({
    id: makeId("activity"),
    actorRole: actor.role,
    actorName: actor.name,
    action,
    related,
    status,
    createdAt: new Date().toISOString(),
    workerId,
    employerId,
  });
}
function notify(
  state: SkillPassState,
  role: Role,
  title: string,
  detail: string,
  workerId?: string,
  employerId?: string
) {
  state.notifications.unshift({
    id: makeId("notification"),
    role,
    title,
    detail,
    workerId,
    employerId,
    createdAt: new Date().toISOString(),
    read: false,
  });
}
function isValidRecordId(value: unknown): value is string {
  return (
    typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(value)
  );
}

function isUniqueRecordId<T extends { id: string }>(
  value: unknown,
  records: T[]
): value is string {
  return isValidRecordId(value) && !records.some(record => record.id === value);
}

function isNonEmptyText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function isValidMonthStamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  return year >= 1900 && year <= 2100;
}

export function reduceState(
  state: SkillPassState,
  actor: DemoActor,
  action: SkillPassAction
): SkillPassState {
  const next = structuredClone(state);
  const workerId = actor.workerId;
  const employerId = actor.employerId;
  switch (action.type) {
    case "profile.save": {
      const profile = action.worker;
      if (
        !profile ||
        typeof profile !== "object" ||
        actor.role !== "worker" ||
        !workerId ||
        profile.id !== workerId
      )
        throw new Error("You can only update the active demo worker profile.");
      const digits =
        typeof profile.phone === "string"
          ? profile.phone.replace(/\D/g, "")
          : "";
      if (
        !isNonEmptyText(profile.name, 120) ||
        !isNonEmptyText(profile.city, 100) ||
        !isNonEmptyText(profile.state, 100) ||
        !SUPPORTED_TRADES.includes(
          profile.trade as (typeof SUPPORTED_TRADES)[number]
        ) ||
        !/^(?:[6-9]\d{9}|91[6-9]\d{9})$/.test(digits) ||
        (profile.profilePhoto !== undefined &&
          (typeof profile.profilePhoto !== "string" ||
            profile.profilePhoto.length > 2048))
      )
        throw new Error(
          "Enter a name, valid Indian mobile number, trade and location before saving."
        );
      if (
        !Number.isFinite(profile.yearsExperience) ||
        profile.yearsExperience < 0 ||
        profile.yearsExperience > 60
      )
        throw new Error("Experience must be between 0 and 60 years.");
      const i = next.workers.findIndex(w => w.id === workerId);
      const savedProfile: Worker = {
        ...profile,
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
        preferredLanguage:
          typeof profile.preferredLanguage === "string"
            ? profile.preferredLanguage.trim().slice(0, 80)
            : "",
        joinedAt: i < 0 ? new Date().toISOString() : next.workers[i].joinedAt,
      };
      if (i < 0) next.workers.push(savedProfile);
      else next.workers[i] = savedProfile;
      event(
        next,
        actor,
        "Updated worker profile",
        savedProfile.name,
        "Saved",
        workerId
      );
      break;
    }
    case "skill.add": {
      const inputSkill = action.skill;
      if (
        !inputSkill ||
        typeof inputSkill !== "object" ||
        actor.role !== "worker" ||
        inputSkill.workerId !== workerId
      )
        throw new Error(
          "You can only add skills to the active demo worker profile."
        );
      if (
        !isUniqueRecordId(inputSkill.id, next.skills) ||
        !isNonEmptyText(inputSkill.name, 120) ||
        typeof inputSkill.evidence !== "string" ||
        inputSkill.evidence.length > 2000
      )
        throw new Error(
          "Enter a unique skill ID, skill name and valid evidence."
        );
      if (
        next.skills.some(
          s =>
            s.workerId === workerId &&
            s.name.trim().toLowerCase() === inputSkill.name.trim().toLowerCase()
        )
      )
        throw new Error("That skill is already on this profile.");
      const createdAt = new Date().toISOString();
      const skill = {
        ...inputSkill,
        name: inputSkill.name.trim(),
        status: "Not Submitted" as const,
        verifier: undefined,
        verifiedAt: undefined,
        notes: "",
        createdAt,
      };
      next.skills.unshift(skill);
      event(
        next,
        actor,
        "Added self-reported skill",
        skill.name,
        "Not Submitted",
        workerId
      );
      break;
    }
    case "skill.submit": {
      if (actor.role !== "worker")
        throw new Error(
          "Only a worker can submit a skill for demo verification."
        );
      const skill = next.skills.find(
        s => s.id === action.skillId && s.workerId === workerId
      );
      if (!skill) throw new Error("Skill record not found for this worker.");
      if (skill.status === "Pending")
        throw new Error("This skill is already awaiting review.");
      skill.status = "Pending";
      skill.notes = "Awaiting partner review";
      event(
        next,
        actor,
        "Submitted skill for demo verification",
        skill.name,
        "Pending",
        workerId
      );
      notify(
        next,
        "partner",
        "New verification request",
        `${skill.name} was submitted for demo review.`,
        workerId
      );
      break;
    }
    case "skill.review": {
      if (actor.role !== "partner")
        throw new Error(
          "Only the training partner demo role can review skills."
        );
      const skill = next.skills.find(s => s.id === action.skillId);
      if (!skill) throw new Error("Skill request not found.");
      if (
        skill.status !== "Pending" &&
        skill.status !== "Needs More Information"
      )
        throw new Error("This skill is not awaiting review.");
      if (
        !["Verified", "Rejected", "Needs More Information"].includes(
          action.status
        )
      )
        throw new Error("Choose a valid demo verification decision.");
      if (typeof action.notes !== "string" || action.notes.length > 500)
        throw new Error(
          "Verification notes must be valid text under 500 characters."
        );
      skill.status = action.status;
      skill.notes = action.notes;
      skill.verifier = actor.name;
      skill.verifiedAt =
        action.status === "Verified" ? new Date().toISOString() : undefined;
      event(
        next,
        actor,
        action.status === "Verified"
          ? "Verified skill (demo)"
          : action.status === "Rejected"
            ? "Rejected skill (demo)"
            : "Requested more information",
        `${skill.name} · ${next.workers.find(w => w.id === skill.workerId)?.name ?? "Worker"}`,
        action.status,
        skill.workerId
      );
      notify(
        next,
        "worker",
        action.status === "Verified"
          ? "Skill verified (demo)"
          : action.status === "Rejected"
            ? "Skill not verified (demo)"
            : "More information requested",
        `${skill.name}: ${action.notes}`,
        skill.workerId
      );
      break;
    }
    case "training.add": {
      const record = action.record;
      if (
        !record ||
        typeof record !== "object" ||
        actor.role !== "worker" ||
        record.workerId !== workerId
      )
        throw new Error(
          "You can only add training to the active demo worker profile."
        );
      if (
        !isUniqueRecordId(record.id, next.training) ||
        !isNonEmptyText(record.title, 160) ||
        !isNonEmptyText(record.provider, 160) ||
        !isValidMonthStamp(record.date) ||
        record.status !== "Demo record"
      )
        throw new Error(
          "Enter a unique training ID, title, provider, valid YYYY-MM date and Demo record status."
        );
      const savedRecord = {
        ...record,
        title: record.title.trim(),
        provider: record.provider.trim(),
      };
      next.training.unshift(savedRecord);
      event(
        next,
        actor,
        "Added training record",
        savedRecord.title,
        "Demo record",
        workerId
      );
      break;
    }
    case "work.add": {
      const record = action.record;
      if (
        !record ||
        typeof record !== "object" ||
        actor.role !== "worker" ||
        record.workerId !== workerId
      )
        throw new Error(
          "You can only add work history to the active demo worker profile."
        );
      if (
        !isUniqueRecordId(record.id, next.workHistory) ||
        !isNonEmptyText(record.title, 160) ||
        !isNonEmptyText(record.employer, 160) ||
        !isNonEmptyText(record.city, 100) ||
        !isValidMonthStamp(record.date) ||
        typeof record.completed !== "boolean" ||
        (record.rating !== undefined &&
          (!Number.isInteger(record.rating) ||
            record.rating < 1 ||
            record.rating > 5)) ||
        (record.feedback !== undefined &&
          (typeof record.feedback !== "string" ||
            record.feedback.trim().length > 500))
      )
        throw new Error(
          "Enter a unique work ID, valid work details, YYYY-MM date and optional 1–5 rating/feedback."
        );
      const savedRecord = {
        ...record,
        title: record.title.trim(),
        employer: record.employer.trim(),
        city: record.city.trim(),
        feedback: record.feedback?.trim() || undefined,
      };
      next.workHistory.unshift(savedRecord);
      event(
        next,
        actor,
        "Added work history",
        savedRecord.title,
        savedRecord.completed ? "Completed" : "In progress",
        workerId
      );
      break;
    }
    case "worker.view": {
      if (actor.role !== "employer" || !employerId)
        throw new Error(
          "Only the active demo employer can open worker records."
        );
      const viewed = next.workers.find(w => w.id === action.workerId);
      if (!viewed) throw new Error("Worker profile not found.");
      event(
        next,
        actor,
        "Viewed worker profile",
        `${viewed.trade} · ${viewed.city}`,
        "Viewed",
        viewed.id,
        employerId
      );
      break;
    }
    case "job.save": {
      const job = action.job;
      if (!job || typeof job !== "object")
        throw new Error("Enter complete job details before saving.");
      if (
        actor.role !== "employer" ||
        !employerId ||
        job.employerId !== employerId
      )
        throw new Error(
          "Only the active demo employer can manage its job listings."
        );
      if (
        !isValidRecordId(job.id) ||
        !isNonEmptyText(job.title, 160) ||
        !isNonEmptyText(job.state, 100) ||
        !isNonEmptyText(job.city, 100) ||
        !isNonEmptyText(job.description, 2000) ||
        !Array.isArray(job.requiredSkills) ||
        job.requiredSkills.length === 0 ||
        job.requiredSkills.length > 20 ||
        job.requiredSkills.some(skill => !isNonEmptyText(skill, 100)) ||
        new Set(job.requiredSkills.map(skill => skill.trim().toLowerCase()))
          .size !== job.requiredSkills.length ||
        !SUPPORTED_TRADES.includes(
          job.trade as (typeof SUPPORTED_TRADES)[number]
        ) ||
        !["Open", "Closed"].includes(job.status) ||
        !Number.isFinite(job.minExperience) ||
        job.minExperience < 0 ||
        job.minExperience > 60
      )
        throw new Error(
          "Enter a valid job ID, title, trade, location, state, unique skill requirements and description before saving."
        );
      const i = next.jobs.findIndex(j => j.id === job.id);
      if (i >= 0 && next.jobs[i].employerId !== employerId)
        throw new Error("You cannot change another employer’s job listing.");
      const shouldNotifyWorkers =
        i < 0 || (next.jobs[i]?.status === "Closed" && job.status === "Open");
      const savedJob: Job = {
        ...job,
        title: job.title.trim(),
        city: job.city.trim(),
        state: job.state.trim(),
        requiredSkills: job.requiredSkills.map(skill => skill.trim()),
        description: job.description.trim(),
        createdAt: i < 0 ? new Date().toISOString() : next.jobs[i].createdAt,
      };
      if (i < 0) next.jobs.unshift(savedJob);
      else next.jobs[i] = savedJob;
      event(
        next,
        actor,
        i < 0 ? "Created job listing" : "Updated job listing",
        savedJob.title,
        savedJob.status,
        undefined,
        employerId
      );
      if (savedJob.status === "Open" && shouldNotifyWorkers) {
        for (const worker of next.workers) {
          if (jobMatch(worker, savedJob, next.skills).score > 0)
            notify(
              next,
              "worker",
              "Matching job available",
              `${savedJob.title} · ${savedJob.city}`,
              worker.id
            );
        }
      }
      break;
    }
    case "access.request": {
      const inputRequest = action.request;
      if (
        !inputRequest ||
        typeof inputRequest !== "object" ||
        actor.role !== "employer" ||
        !employerId ||
        inputRequest.employerId !== employerId
      )
        throw new Error("Only the active demo employer can request access.");
      if (!isUniqueRecordId(inputRequest.id, next.accessRequests))
        throw new Error("The passport request needs a unique valid record ID.");
      if (!next.workers.some(w => w.id === inputRequest.workerId))
        throw new Error("Worker profile not found.");
      if (
        inputRequest.jobId &&
        !next.jobs.some(
          j =>
            j.id === inputRequest.jobId &&
            j.employerId === employerId &&
            j.status === "Open"
        )
      )
        throw new Error("Choose one of your own active job listings.");
      if (
        next.accessRequests.some(
          r =>
            r.workerId === inputRequest.workerId &&
            r.employerId === employerId &&
            (r.status === "Pending" ||
              (r.status === "Approved" && r.decidedBy === r.workerId))
        )
      )
        throw new Error(
          "An active or pending passport permission already exists for this worker."
        );
      const createdAt = new Date().toISOString();
      const request: AccessRequest = {
        ...action.request,
        status: "Pending",
        fields: [],
        decidedBy: undefined,
        createdAt,
        updatedAt: createdAt,
      };
      next.accessRequests.unshift(request);
      const name =
        next.workers.find(w => w.id === request.workerId)?.name ?? "Worker";
      event(
        next,
        actor,
        "Requested passport access",
        name,
        "Pending",
        request.workerId,
        employerId
      );
      notify(
        next,
        "worker",
        "Employer requested passport access",
        `${actor.name} requested selected details for your Skill Passport.`,
        request.workerId
      );
      break;
    }
    case "access.resolve": {
      if (actor.role !== "worker")
        throw new Error("Only the worker can decide on passport access.");
      const req = next.accessRequests.find(
        r => r.id === action.requestId && r.workerId === workerId
      );
      if (
        !req ||
        (req.status !== "Pending" &&
          !(req.status === "Approved" && req.decidedBy !== req.workerId))
      )
        throw new Error("Pending access request not found for this worker.");
      if (!["Approved", "Rejected"].includes(action.status))
        throw new Error("Choose approve or reject for this access request.");
      if (
        !Array.isArray(action.fields) ||
        action.fields.some(field => !SHARE_FIELDS.includes(field))
      )
        throw new Error("Choose only the available passport fields.");
      req.status = action.status;
      req.fields = action.status === "Approved" ? action.fields : [];
      req.decidedBy = workerId;
      req.updatedAt = new Date().toISOString();
      event(
        next,
        actor,
        action.status === "Approved"
          ? "Approved passport access"
          : "Rejected passport access",
        next.employers.find(e => e.id === req.employerId)?.name ?? "Employer",
        action.status,
        workerId,
        req.employerId
      );
      notify(
        next,
        "employer",
        action.status === "Approved"
          ? "Passport access approved"
          : "Passport access declined",
        `${actor.name} ${action.status.toLowerCase()} your access request.`,
        workerId,
        req.employerId
      );
      break;
    }
    case "access.revoke": {
      if (actor.role !== "worker")
        throw new Error("Only the worker can revoke passport access.");
      const req = next.accessRequests.find(
        r => r.id === action.requestId && r.workerId === workerId
      );
      if (!req || req.status !== "Approved" || req.decidedBy !== req.workerId)
        throw new Error("Active permission not found for this worker.");
      req.status = "Revoked";
      req.fields = [];
      req.updatedAt = new Date().toISOString();
      event(
        next,
        actor,
        "Revoked passport access",
        next.employers.find(e => e.id === req.employerId)?.name ?? "Employer",
        "Revoked",
        workerId,
        req.employerId
      );
      notify(
        next,
        "employer",
        "Passport access revoked",
        `${actor.name} revoked the selected passport fields.`,
        workerId,
        req.employerId
      );
      break;
    }
    case "feedback.add": {
      const record = action.record;
      if (
        !record ||
        typeof record !== "object" ||
        actor.role !== "employer" ||
        !employerId ||
        record.employerId !== employerId
      )
        throw new Error("Only the active demo employer can add feedback.");
      const feedbackWorker = next.workers.find(w => w.id === record.workerId);
      if (!feedbackWorker)
        throw new Error("Worker profile not found for this feedback record.");
      if (
        !isUniqueRecordId(record.id, next.feedback) ||
        !Number.isInteger(record.score) ||
        record.score < 1 ||
        record.score > 5 ||
        !isNonEmptyText(record.comment, 500) ||
        !isValidMonthStamp(record.date)
      )
        throw new Error(
          "Enter a unique feedback ID, a 1–5 score, a short comment and valid YYYY-MM date."
        );
      const savedFeedback = { ...record, comment: record.comment.trim() };
      next.feedback.unshift(savedFeedback);
      event(
        next,
        actor,
        "Added employer feedback",
        feedbackWorker.name,
        `${savedFeedback.score}/5`,
        savedFeedback.workerId,
        employerId
      );
      break;
    }
    case "notification.read": {
      const n = next.notifications.find(x => x.id === action.notificationId);
      if (
        !n ||
        n.role !== actor.role ||
        (actor.role === "worker" && n.workerId !== workerId) ||
        (actor.role === "employer" && n.employerId !== employerId)
      )
        throw new Error("Notification not found for this demo role.");
      n.read = true;
      break;
    }
    default:
      throw new Error("Unsupported SkillPass action.");
  }
  return next;
}

function displayedAccessRequest(request: AccessRequest): AccessRequest {
  if (request.status === "Approved" && request.decidedBy !== request.workerId)
    return {
      ...request,
      status: "Pending",
      fields: [],
      decidedBy: undefined,
    };
  return { ...request };
}

export function projectState(
  state: SkillPassState,
  actor: DemoActor
): SkillPassState {
  if (actor.role === "partner") return structuredClone(state);
  if (actor.role === "worker")
    return {
      ...state,
      workers: state.workers.filter(w => w.id === actor.workerId),
      skills: state.skills.filter(s => s.workerId === actor.workerId),
      training: state.training.filter(t => t.workerId === actor.workerId),
      workHistory: state.workHistory.filter(w => w.workerId === actor.workerId),
      feedback: state.feedback.filter(f => f.workerId === actor.workerId),
      accessRequests: state.accessRequests
        .filter(r => r.workerId === actor.workerId)
        .map(displayedAccessRequest),
      notifications: state.notifications.filter(
        n => n.role === "worker" && n.workerId === actor.workerId
      ),
      activity: state.activity.filter(a => a.workerId === actor.workerId),
      jobs: state.jobs.filter(j => j.status === "Open"),
      employers: state.employers.map(e => ({ ...e, contactName: "" })),
    };
  const requests = state.accessRequests.filter(
      r => r.employerId === actor.employerId
    ),
    grants = requests.filter(
      r => r.status === "Approved" && r.decidedBy === r.workerId
    );
  const workers = state.workers.map(w => {
    const grant = grants.find(r => r.workerId === w.id);
    const fields = grant?.fields ?? [];
    const skills = state.skills.filter(
      s => s.workerId === w.id && s.status === "Verified"
    );
    const allowed = fields.includes("verifiedSkills");
    const allSkills = state.skills.filter(s => s.workerId === w.id);
    const directoryStatus: VerificationStatus = allSkills.some(
      s => s.status === "Verified"
    )
      ? "Verified"
      : allSkills.some(s => s.status === "Pending")
        ? "Pending"
        : allSkills.some(s => s.status === "Needs More Information")
          ? "Needs More Information"
          : allSkills.some(s => s.status === "Rejected")
            ? "Rejected"
            : "Not Submitted";
    const directoryBand =
      w.yearsExperience < 3
        ? "0–2 years"
        : w.yearsExperience < 6
          ? "3–5 years"
          : "6+ years";
    return {
      ...w,
      id: publicWorkerId(w.id),
      name: fields.includes("nameTrade") ? w.name : publicWorkerLabel(w.id),
      phone: "",
      preferredLanguage: "",
      yearsExperience: fields.includes("experience") ? w.yearsExperience : 0,
      profilePhoto: undefined,
      directoryExperienceBand: directoryBand,
      directoryVerifiedSkillCount: skills.length,
      directoryVerificationStatus: directoryStatus,
      directoryCompleteness: profileCompleteness(
        w,
        state.skills,
        state.training,
        state.workHistory
      ),
      ...(fields.includes("reputation")
        ? { sharedReputation: reputation(w, state) }
        : { sharedReputation: undefined }),
      ...(allowed ? {} : { trade: w.trade }),
    };
  });
  const visibleIds = new Set(state.workers.map(w => w.id));
  return {
    workers,
    skills: state.skills
      .filter(
        s =>
          visibleIds.has(s.workerId) &&
          s.status === "Verified" &&
          grants.some(
            r =>
              r.workerId === s.workerId && r.fields.includes("verifiedSkills")
          )
      )
      .map(s => ({ ...s, workerId: publicWorkerId(s.workerId) })),
    training: state.training
      .filter(t =>
        grants.some(
          r => r.workerId === t.workerId && r.fields.includes("trainingRecords")
        )
      )
      .map(t => ({ ...t, workerId: publicWorkerId(t.workerId) })),
    workHistory: state.workHistory
      .filter(w =>
        grants.some(
          r => r.workerId === w.workerId && r.fields.includes("workHistory")
        )
      )
      .map(w => ({ ...w, workerId: publicWorkerId(w.workerId) })),
    employers: state.employers.filter(e => e.id === actor.employerId),
    jobs: state.jobs.filter(j => j.employerId === actor.employerId),
    accessRequests: requests.map(r => ({
      ...displayedAccessRequest(r),
      workerId: publicWorkerId(r.workerId),
      decidedBy: undefined,
    })),
    feedback: state.feedback
      .filter(f =>
        grants.some(
          r => r.workerId === f.workerId && r.fields.includes("reputation")
        )
      )
      .map(f => ({ ...f, workerId: publicWorkerId(f.workerId) })),
    notifications: state.notifications
      .filter(n => n.role === "employer" && n.employerId === actor.employerId)
      .map(n => ({
        ...n,
        detail: state.workers.reduce((text, w) => {
          const visible = grants.some(
            r => r.workerId === w.id && r.fields.includes("nameTrade")
          );
          const label = visible ? w.name : publicWorkerLabel(w.id);
          const legacyAlias = `Worker ${w.id.replace("worker-", "").slice(0, 4).toUpperCase()}`;
          return text.replaceAll(w.name, label).replaceAll(legacyAlias, label);
        }, n.detail),
        workerId: n.workerId ? publicWorkerId(n.workerId) : undefined,
      })),
    activity: state.activity
      .filter(a => a.employerId === actor.employerId)
      .map(a => {
        const w = state.workers.find(x => x.id === a.workerId);
        const visible =
          w &&
          grants.some(
            r => r.workerId === w.id && r.fields.includes("nameTrade")
          );
        const label = w && !visible ? publicWorkerLabel(w.id) : w?.name;
        return {
          ...a,
          actorName:
            a.actorRole === "worker" && !visible && label ? label : a.actorName,
          related:
            w && label
              ? a.related
                  .replaceAll(w.name, label)
                  .replaceAll(
                    `Worker ${w.id.replace("worker-", "").slice(0, 4).toUpperCase()}`,
                    label
                  )
              : a.related,
          workerId: a.workerId ? publicWorkerId(a.workerId) : undefined,
        };
      }),
  };
}
