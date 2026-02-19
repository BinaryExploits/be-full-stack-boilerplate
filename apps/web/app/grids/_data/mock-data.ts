/* ------------------------------------------------------------------ */
/* People — for CRUD Grid (modeled after User + TenantMembership)     */
/* ------------------------------------------------------------------ */
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export const people: Person[] = [
  {
    id: "p1",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2025-01-15",
  },
  {
    id: "p2",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@example.com",
    role: "User",
    status: "Active",
    createdAt: "2025-02-01",
  },
  {
    id: "p3",
    firstName: "Carol",
    lastName: "Williams",
    email: "carol@example.com",
    role: "Editor",
    status: "Inactive",
    createdAt: "2025-02-14",
  },
  {
    id: "p4",
    firstName: "David",
    lastName: "Brown",
    email: "david@example.com",
    role: "User",
    status: "Active",
    createdAt: "2025-03-02",
  },
  {
    id: "p5",
    firstName: "Eve",
    lastName: "Davis",
    email: "eve@example.com",
    role: "Admin",
    status: "Suspended",
    createdAt: "2025-03-10",
  },
  {
    id: "p6",
    firstName: "Frank",
    lastName: "Garcia",
    email: "frank@example.com",
    role: "User",
    status: "Active",
    createdAt: "2025-03-20",
  },
  {
    id: "p7",
    firstName: "Grace",
    lastName: "Martinez",
    email: "grace@example.com",
    role: "Editor",
    status: "Active",
    createdAt: "2025-04-01",
  },
  {
    id: "p8",
    firstName: "Henry",
    lastName: "Anderson",
    email: "henry@example.com",
    role: "User",
    status: "Active",
    createdAt: "2025-04-15",
  },
  {
    id: "p9",
    firstName: "Iris",
    lastName: "Thomas",
    email: "iris@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2025-05-01",
  },
  {
    id: "p10",
    firstName: "Jack",
    lastName: "Taylor",
    email: "jack@example.com",
    role: "User",
    status: "Inactive",
    createdAt: "2025-05-10",
  },
  {
    id: "p11",
    firstName: "Karen",
    lastName: "Moore",
    email: "karen@example.com",
    role: "Editor",
    status: "Active",
    createdAt: "2025-05-20",
  },
  {
    id: "p12",
    firstName: "Leo",
    lastName: "Jackson",
    email: "leo@example.com",
    role: "User",
    status: "Active",
    createdAt: "2025-06-05",
  },
  {
    id: "p13",
    firstName: "Mia",
    lastName: "White",
    email: "mia@example.com",
    role: "User",
    status: "Active",
    createdAt: "2025-06-15",
  },
  {
    id: "p14",
    firstName: "Noah",
    lastName: "Harris",
    email: "noah@example.com",
    role: "Admin",
    status: "Suspended",
    createdAt: "2025-07-01",
  },
  {
    id: "p15",
    firstName: "Olivia",
    lastName: "Clark",
    email: "olivia@example.com",
    role: "User",
    status: "Active",
    createdAt: "2025-07-12",
  },
];

/* ------------------------------------------------------------------ */
/* Records — for Global CRUD Grid (50 rows)                           */
/* ------------------------------------------------------------------ */
function generateRecords(count: number): Person[] {
  const firstNames = [
    "Alex",
    "Sam",
    "Jordan",
    "Taylor",
    "Morgan",
    "Casey",
    "Riley",
    "Avery",
    "Quinn",
    "Drew",
  ];
  const lastNames = [
    "Lee",
    "Kim",
    "Patel",
    "Singh",
    "Chen",
    "Wang",
    "Lopez",
    "Nguyen",
    "Ali",
    "Tanaka",
  ];
  const roles = ["Admin", "User", "Editor", "Viewer"];
  const statuses = ["Active", "Inactive", "Suspended"];

  return Array.from({ length: count }, (_, i) => ({
    id: `r${i + 1}`,
    firstName: firstNames[i % firstNames.length]!,
    lastName: lastNames[i % lastNames.length]!,
    email: `${firstNames[i % firstNames.length]!.toLowerCase()}.${lastNames[i % lastNames.length]!.toLowerCase()}${i}@example.com`,
    role: roles[i % roles.length]!,
    status: statuses[i % statuses.length]!,
    createdAt: new Date(2025, Math.floor(i / 5), (i % 28) + 1)
      .toISOString()
      .split("T")[0]!,
  }));
}

export const records: Person[] = generateRecords(50);

/* ------------------------------------------------------------------ */
/* Tenants — for Tenants Grid (modeled after Tenant model)            */
/* ------------------------------------------------------------------ */
export interface TenantRow {
  id: string;
  tenantName: string;
  plan: "Free" | "Pro" | "Enterprise";
  usersCount: number;
  storageUsed: string;
  status: string;
  region: string;
  createdAt: string;
}

export const tenants: TenantRow[] = [
  {
    id: "t1",
    tenantName: "Acme Corp",
    plan: "Enterprise",
    usersCount: 245,
    storageUsed: "48.2 GB",
    status: "Active",
    region: "US-East",
    createdAt: "2024-01-10",
  },
  {
    id: "t2",
    tenantName: "Globex Inc",
    plan: "Pro",
    usersCount: 82,
    storageUsed: "12.7 GB",
    status: "Active",
    region: "EU-West",
    createdAt: "2024-02-15",
  },
  {
    id: "t3",
    tenantName: "Initech",
    plan: "Free",
    usersCount: 5,
    storageUsed: "0.3 GB",
    status: "Active",
    region: "US-West",
    createdAt: "2024-03-20",
  },
  {
    id: "t4",
    tenantName: "Hooli",
    plan: "Enterprise",
    usersCount: 520,
    storageUsed: "124.8 GB",
    status: "Active",
    region: "US-East",
    createdAt: "2024-04-05",
  },
  {
    id: "t5",
    tenantName: "Pied Piper",
    plan: "Pro",
    usersCount: 34,
    storageUsed: "8.1 GB",
    status: "Trial",
    region: "US-West",
    createdAt: "2024-05-12",
  },
  {
    id: "t6",
    tenantName: "Umbrella Co",
    plan: "Enterprise",
    usersCount: 189,
    storageUsed: "67.3 GB",
    status: "Active",
    region: "APAC",
    createdAt: "2024-06-01",
  },
  {
    id: "t7",
    tenantName: "Wayne Ent.",
    plan: "Pro",
    usersCount: 67,
    storageUsed: "15.9 GB",
    status: "Active",
    region: "EU-West",
    createdAt: "2024-06-20",
  },
  {
    id: "t8",
    tenantName: "Stark Ind.",
    plan: "Enterprise",
    usersCount: 310,
    storageUsed: "89.4 GB",
    status: "Active",
    region: "US-East",
    createdAt: "2024-07-10",
  },
  {
    id: "t9",
    tenantName: "Cyberdyne",
    plan: "Free",
    usersCount: 3,
    storageUsed: "0.1 GB",
    status: "Suspended",
    region: "US-West",
    createdAt: "2024-08-01",
  },
  {
    id: "t10",
    tenantName: "Oscorp",
    plan: "Pro",
    usersCount: 41,
    storageUsed: "9.6 GB",
    status: "Active",
    region: "US-East",
    createdAt: "2024-08-15",
  },
  {
    id: "t11",
    tenantName: "LexCorp",
    plan: "Enterprise",
    usersCount: 178,
    storageUsed: "52.1 GB",
    status: "Active",
    region: "EU-West",
    createdAt: "2024-09-01",
  },
  {
    id: "t12",
    tenantName: "Wonka Inc",
    plan: "Free",
    usersCount: 8,
    storageUsed: "0.5 GB",
    status: "Active",
    region: "EU-West",
    createdAt: "2024-09-20",
  },
  {
    id: "t13",
    tenantName: "Massive Dyn.",
    plan: "Pro",
    usersCount: 56,
    storageUsed: "11.2 GB",
    status: "Active",
    region: "US-East",
    createdAt: "2024-10-05",
  },
  {
    id: "t14",
    tenantName: "Delos Inc",
    plan: "Enterprise",
    usersCount: 420,
    storageUsed: "110.3 GB",
    status: "Active",
    region: "APAC",
    createdAt: "2024-10-20",
  },
  {
    id: "t15",
    tenantName: "Weyland-Yut.",
    plan: "Pro",
    usersCount: 73,
    storageUsed: "18.7 GB",
    status: "Trial",
    region: "APAC",
    createdAt: "2024-11-01",
  },
  {
    id: "t16",
    tenantName: "Buy N Large",
    plan: "Free",
    usersCount: 2,
    storageUsed: "0.05 GB",
    status: "Active",
    region: "US-West",
    createdAt: "2024-11-15",
  },
  {
    id: "t17",
    tenantName: "InGen",
    plan: "Pro",
    usersCount: 29,
    storageUsed: "6.4 GB",
    status: "Active",
    region: "US-East",
    createdAt: "2024-12-01",
  },
  {
    id: "t18",
    tenantName: "Tyrell Corp",
    plan: "Enterprise",
    usersCount: 156,
    storageUsed: "43.9 GB",
    status: "Active",
    region: "APAC",
    createdAt: "2024-12-15",
  },
  {
    id: "t19",
    tenantName: "Soylent Co",
    plan: "Free",
    usersCount: 6,
    storageUsed: "0.2 GB",
    status: "Inactive",
    region: "EU-West",
    createdAt: "2025-01-05",
  },
  {
    id: "t20",
    tenantName: "Aperture Sci",
    plan: "Pro",
    usersCount: 48,
    storageUsed: "10.8 GB",
    status: "Active",
    region: "US-West",
    createdAt: "2025-01-20",
  },
];

/* ------------------------------------------------------------------ */
/* Metrics — for Read-Only Grid                                       */
/* ------------------------------------------------------------------ */
export interface Metric {
  metric: string;
  value: number;
  change: number;
  period: string;
  category: string;
}

export const metrics: Metric[] = [
  {
    metric: "Page Views",
    value: 284500,
    change: 12.3,
    period: "Jan 2026",
    category: "Traffic",
  },
  {
    metric: "Unique Visitors",
    value: 45200,
    change: 8.7,
    period: "Jan 2026",
    category: "Traffic",
  },
  {
    metric: "Bounce Rate",
    value: 34.2,
    change: -2.1,
    period: "Jan 2026",
    category: "Traffic",
  },
  {
    metric: "Avg. Session",
    value: 4.5,
    change: 0.3,
    period: "Jan 2026",
    category: "Engagement",
  },
  {
    metric: "Conversion Rate",
    value: 3.8,
    change: 0.5,
    period: "Jan 2026",
    category: "Revenue",
  },
  {
    metric: "Revenue",
    value: 128400,
    change: 15.2,
    period: "Jan 2026",
    category: "Revenue",
  },
  {
    metric: "MRR",
    value: 47800,
    change: 6.1,
    period: "Jan 2026",
    category: "Revenue",
  },
  {
    metric: "Churn Rate",
    value: 2.4,
    change: -0.8,
    period: "Jan 2026",
    category: "Retention",
  },
  {
    metric: "NPS Score",
    value: 72,
    change: 4.0,
    period: "Jan 2026",
    category: "Satisfaction",
  },
  {
    metric: "Support Tickets",
    value: 342,
    change: -11.5,
    period: "Jan 2026",
    category: "Support",
  },
  {
    metric: "Avg. Resolution",
    value: 2.1,
    change: -15.0,
    period: "Jan 2026",
    category: "Support",
  },
  {
    metric: "API Calls",
    value: 1520000,
    change: 22.4,
    period: "Jan 2026",
    category: "Infrastructure",
  },
  {
    metric: "Uptime",
    value: 99.98,
    change: 0.0,
    period: "Jan 2026",
    category: "Infrastructure",
  },
  {
    metric: "Error Rate",
    value: 0.12,
    change: -0.05,
    period: "Jan 2026",
    category: "Infrastructure",
  },
  {
    metric: "P95 Latency",
    value: 142,
    change: -8.3,
    period: "Jan 2026",
    category: "Performance",
  },
  {
    metric: "New Signups",
    value: 892,
    change: 18.9,
    period: "Jan 2026",
    category: "Growth",
  },
  {
    metric: "Trial Conv.",
    value: 24.5,
    change: 3.2,
    period: "Jan 2026",
    category: "Growth",
  },
  {
    metric: "DAU/MAU",
    value: 42.1,
    change: 1.8,
    period: "Jan 2026",
    category: "Engagement",
  },
  {
    metric: "Feature Adopt.",
    value: 68.3,
    change: 5.4,
    period: "Jan 2026",
    category: "Product",
  },
  {
    metric: "ARPU",
    value: 153.2,
    change: 7.6,
    period: "Jan 2026",
    category: "Revenue",
  },
  {
    metric: "LTV",
    value: 2840,
    change: 12.1,
    period: "Jan 2026",
    category: "Revenue",
  },
  {
    metric: "CAC",
    value: 340,
    change: -4.2,
    period: "Jan 2026",
    category: "Growth",
  },
  {
    metric: "LTV/CAC",
    value: 8.35,
    change: 16.9,
    period: "Jan 2026",
    category: "Growth",
  },
  {
    metric: "Expansion Rev.",
    value: 12400,
    change: 9.8,
    period: "Jan 2026",
    category: "Revenue",
  },
  {
    metric: "Net Rev. Ret.",
    value: 112,
    change: 2.3,
    period: "Jan 2026",
    category: "Retention",
  },
];

/* ------------------------------------------------------------------ */
/* Tasks — for Advanced / Multi-Select Grid                           */
/* ------------------------------------------------------------------ */
export interface Task {
  id: string;
  name: string;
  tags: string[];
  assignedTo: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  completedAt: string | null;
}

export const tasks: Task[] = [
  {
    id: "tk1",
    name: "Implement auth flow",
    tags: ["backend", "security"],
    assignedTo: "Alice Johnson",
    priority: "High",
    dueDate: "2026-02-20",
    completedAt: null,
  },
  {
    id: "tk2",
    name: "Design landing page",
    tags: ["design", "frontend"],
    assignedTo: "Bob Smith",
    priority: "Medium",
    dueDate: "2026-02-25",
    completedAt: null,
  },
  {
    id: "tk3",
    name: "Set up CI/CD pipeline",
    tags: ["devops", "infra"],
    assignedTo: "Carol Williams",
    priority: "High",
    dueDate: "2026-02-15",
    completedAt: "2026-02-14",
  },
  {
    id: "tk4",
    name: "Write API docs",
    tags: ["docs", "backend"],
    assignedTo: "David Brown",
    priority: "Low",
    dueDate: "2026-03-01",
    completedAt: null,
  },
  {
    id: "tk5",
    name: "Add dark mode",
    tags: ["frontend", "design"],
    assignedTo: "Eve Davis",
    priority: "Medium",
    dueDate: "2026-02-10",
    completedAt: null,
  },
  {
    id: "tk6",
    name: "Database indexing",
    tags: ["backend", "perf"],
    assignedTo: "Frank Garcia",
    priority: "High",
    dueDate: "2026-02-18",
    completedAt: null,
  },
  {
    id: "tk7",
    name: "User onboarding wizard",
    tags: ["frontend", "ux"],
    assignedTo: "Grace Martinez",
    priority: "Medium",
    dueDate: "2026-03-05",
    completedAt: null,
  },
  {
    id: "tk8",
    name: "Load testing",
    tags: ["qa", "perf"],
    assignedTo: "Henry Anderson",
    priority: "High",
    dueDate: "2026-02-28",
    completedAt: null,
  },
  {
    id: "tk9",
    name: "Billing integration",
    tags: ["backend", "payments"],
    assignedTo: "Iris Thomas",
    priority: "High",
    dueDate: "2026-02-12",
    completedAt: "2026-02-11",
  },
  {
    id: "tk10",
    name: "Mobile responsive fixes",
    tags: ["frontend", "bug"],
    assignedTo: "Jack Taylor",
    priority: "Medium",
    dueDate: "2026-02-22",
    completedAt: null,
  },
  {
    id: "tk11",
    name: "Tenant migration tool",
    tags: ["backend", "infra"],
    assignedTo: "Karen Moore",
    priority: "Low",
    dueDate: "2026-03-10",
    completedAt: null,
  },
  {
    id: "tk12",
    name: "Analytics dashboard",
    tags: ["frontend", "data"],
    assignedTo: "Leo Jackson",
    priority: "Medium",
    dueDate: "2026-03-01",
    completedAt: null,
  },
  {
    id: "tk13",
    name: "Email notification system",
    tags: ["backend", "comms"],
    assignedTo: "Mia White",
    priority: "High",
    dueDate: "2026-02-16",
    completedAt: null,
  },
  {
    id: "tk14",
    name: "Accessibility audit",
    tags: ["qa", "a11y"],
    assignedTo: "Noah Harris",
    priority: "Medium",
    dueDate: "2026-03-15",
    completedAt: null,
  },
  {
    id: "tk15",
    name: "Rate limiting middleware",
    tags: ["backend", "security"],
    assignedTo: "Olivia Clark",
    priority: "High",
    dueDate: "2026-02-08",
    completedAt: "2026-02-07",
  },
  {
    id: "tk16",
    name: "Export to CSV feature",
    tags: ["frontend", "data"],
    assignedTo: "Alice Johnson",
    priority: "Low",
    dueDate: "2026-03-20",
    completedAt: null,
  },
  {
    id: "tk17",
    name: "Search optimization",
    tags: ["backend", "perf"],
    assignedTo: "Bob Smith",
    priority: "Medium",
    dueDate: "2026-02-26",
    completedAt: null,
  },
  {
    id: "tk18",
    name: "Webhook integrations",
    tags: ["backend", "api"],
    assignedTo: "Carol Williams",
    priority: "High",
    dueDate: "2026-03-01",
    completedAt: null,
  },
  {
    id: "tk19",
    name: "Error boundary setup",
    tags: ["frontend", "reliability"],
    assignedTo: "David Brown",
    priority: "Low",
    dueDate: "2026-03-12",
    completedAt: null,
  },
  {
    id: "tk20",
    name: "Monitoring & alerting",
    tags: ["devops", "infra"],
    assignedTo: "Eve Davis",
    priority: "High",
    dueDate: "2026-02-05",
    completedAt: "2026-02-04",
  },
];
