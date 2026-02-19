/* ================================================================== */
/* Chart datasets — typed constants for the multi-tenant SaaS domain  */
/* ================================================================== */

const months24 = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2024, i);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
});

const months12 = months24.slice(12);

/* ------------------------------------------------------------------ */
/* 1A — Multi-Series Line: User Growth Over Time                      */
/* ------------------------------------------------------------------ */
export const userGrowthData = {
  newUsers: [
    120, 145, 162, 189, 210, 235, 258, 280, 310, 342, 378, 405, 430, 462, 498,
    535, 570, 612, 650, 695, 740, 788, 830, 892,
  ],
  activeUsers: [
    850, 880, 920, 960, 1010, 1060, 1120, 1180, 1250, 1330, 1410, 1500, 1580,
    1670, 1760, 1850, 1940, 2040, 2140, 2250, 2360, 2480, 2600, 2720,
  ],
  churnedUsers: [
    15, 18, 12, 20, 14, 22, 16, 19, 25, 18, 21, 24, 17, 23, 19, 26, 20, 22, 28,
    21, 25, 19, 23, 27,
  ],
  labels: months24,
};

/* ------------------------------------------------------------------ */
/* 1B — Stacked Area: Revenue Breakdown by Category                   */
/* ------------------------------------------------------------------ */
export const revenueBreakdownData = {
  labels: months12,
  subscriptions: [42, 45, 48, 51, 55, 58, 62, 66, 70, 74, 78, 83],
  addons: [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 21],
  services: [12, 11, 14, 15, 13, 16, 18, 17, 20, 22, 21, 24],
  overages: [3, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9],
};

/* ------------------------------------------------------------------ */
/* 2A — Grouped Bar: Monthly Active Users by Region                   */
/* ------------------------------------------------------------------ */
export const mauByRegionData = {
  labels: months12,
  usEast: [320, 335, 350, 370, 388, 405, 420, 440, 460, 480, 502, 525],
  euWest: [180, 192, 205, 218, 230, 245, 258, 272, 288, 302, 318, 335],
  apac: [95, 102, 110, 120, 130, 142, 155, 168, 182, 198, 215, 232],
  usWest: [140, 148, 158, 168, 178, 190, 202, 215, 228, 242, 258, 275],
};

/* ------------------------------------------------------------------ */
/* 2B — Horizontal Stacked Bar: Feature Usage by Tenant Plan          */
/* ------------------------------------------------------------------ */
export const featureUsageData = {
  plans: ["Free", "Pro", "Enterprise"],
  auth: [85, 95, 100],
  crud: [72, 88, 96],
  analytics: [15, 65, 92],
  api: [20, 70, 98],
  multiTenant: [0, 45, 95],
};

/* ------------------------------------------------------------------ */
/* 3A — Donut: Tenant Plan Distribution                               */
/* ------------------------------------------------------------------ */
export const tenantPlanData = {
  labels: ["Free", "Pro", "Enterprise", "Enterprise+"],
  values: [124, 89, 42, 12],
};

/* ------------------------------------------------------------------ */
/* 3B — Sunburst: User Role Hierarchy                                 */
/* ------------------------------------------------------------------ */
export const roleHierarchyData = {
  labels: [
    "All Users",
    "Engineering",
    "Product",
    "Sales",
    "Support",
    "Eng - Admin",
    "Eng - Dev",
    "Eng - QA",
    "Prod - PM",
    "Prod - Designer",
    "Sales - Manager",
    "Sales - Rep",
    "Support - Lead",
    "Support - Agent",
  ],
  parents: [
    "",
    "All Users",
    "All Users",
    "All Users",
    "All Users",
    "Engineering",
    "Engineering",
    "Engineering",
    "Product",
    "Product",
    "Sales",
    "Sales",
    "Support",
    "Support",
  ],
  values: [312, 120, 45, 82, 65, 8, 95, 17, 12, 33, 15, 67, 10, 55],
};

/* ------------------------------------------------------------------ */
/* 4A — Scatter: Session Duration vs. Actions Taken                   */
/* ------------------------------------------------------------------ */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const scatter1Rng = seededRandom(42);
export const sessionScatterData = {
  duration: Array.from({ length: 80 }, () =>
    Math.round(scatter1Rng() * 55 + 5),
  ),
  actions: Array.from({ length: 80 }, () => Math.round(scatter1Rng() * 45 + 2)),
  tier: Array.from(
    { length: 80 },
    () => ["Free", "Pro", "Enterprise"][Math.floor(scatter1Rng() * 3)]!,
  ),
};

/* ------------------------------------------------------------------ */
/* 4B — Bubble: Tenant Size vs. Storage Used                          */
/* ------------------------------------------------------------------ */
const bubbleRng = seededRandom(99);
export const tenantBubbleData = {
  userCount: Array.from({ length: 20 }, () =>
    Math.round(bubbleRng() * 500 + 5),
  ),
  storageGb: Array.from({ length: 20 }, () =>
    Math.round(bubbleRng() * 120 + 1),
  ),
  revenue: Array.from({ length: 20 }, () =>
    Math.round(bubbleRng() * 5000 + 200),
  ),
};

/* ------------------------------------------------------------------ */
/* 5A — Box Plot: Response Time Distribution by Service               */
/* ------------------------------------------------------------------ */
const boxRng = seededRandom(7);
function genBoxData(base: number, spread: number, n: number) {
  return Array.from({ length: n }, () =>
    Math.round(base + (boxRng() - 0.5) * 2 * spread),
  );
}
export const responseTimeData = {
  authService: genBoxData(85, 40, 50),
  crudApi: genBoxData(120, 60, 50),
  searchApi: genBoxData(200, 90, 50),
  fileUpload: genBoxData(350, 150, 50),
  webhooks: genBoxData(150, 70, 50),
};

/* ------------------------------------------------------------------ */
/* 5B — Histogram: User Session Length Distribution                   */
/* ------------------------------------------------------------------ */
const histRng = seededRandom(13);
export const sessionLengthData = Array.from({ length: 500 }, () =>
  Math.round(histRng() * histRng() * 60 + 1),
);

/* ------------------------------------------------------------------ */
/* 6A — Heatmap: Activity by Hour and Day of Week                     */
/* ------------------------------------------------------------------ */
const heatRng = seededRandom(21);
export const activityHeatmapData = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  z: Array.from({ length: 7 }, (_, dayIdx) =>
    Array.from({ length: 24 }, (_, hourIdx) => {
      const isWeekday = dayIdx < 5;
      const isWorkHour = hourIdx >= 8 && hourIdx <= 18;
      const base = isWeekday && isWorkHour ? 60 : isWeekday ? 15 : 8;
      return Math.round(base + heatRng() * 40);
    }),
  ),
};

/* ------------------------------------------------------------------ */
/* 6B — Gantt (horizontal bar): Tenant Onboarding Timeline            */
/* ------------------------------------------------------------------ */
export const ganttData = {
  tenants: [
    "Acme Corp",
    "Globex Inc",
    "Hooli",
    "Pied Piper",
    "Wayne Ent.",
    "Stark Ind.",
    "Umbrella Co",
    "Oscorp",
  ],
  starts: [
    "2025-01-05",
    "2025-02-10",
    "2025-03-01",
    "2025-03-15",
    "2025-04-20",
    "2025-05-10",
    "2025-06-01",
    "2025-07-15",
  ],
  ends: [
    "2025-02-15",
    "2025-03-20",
    "2025-04-10",
    "2025-05-01",
    "2025-06-05",
    "2025-06-25",
    "2025-07-20",
    "2025-08-30",
  ],
};

/* ------------------------------------------------------------------ */
/* 7A — 3D Scatter: User Engagement Clustering                        */
/* ------------------------------------------------------------------ */
const scatter3dRng = seededRandom(55);
export const engagement3dData = {
  sessions: Array.from({ length: 100 }, () =>
    Math.round(scatter3dRng() * 50 + 1),
  ),
  avgDuration: Array.from({ length: 100 }, () =>
    Math.round(scatter3dRng() * 30 + 2),
  ),
  revenue: Array.from({ length: 100 }, () =>
    Math.round(scatter3dRng() * 500 + 10),
  ),
  cluster: Array.from(
    { length: 100 },
    () => ["Low", "Medium", "High"][Math.floor(scatter3dRng() * 3)]!,
  ),
};

/* ------------------------------------------------------------------ */
/* 7B — 3D Surface: Revenue by Time x Region                          */
/* ------------------------------------------------------------------ */
const surfRng = seededRandom(33);
export const revenueSurfaceData = {
  months: months12,
  regions: ["US-East", "US-West", "EU-West", "APAC"],
  z: Array.from({ length: 4 }, (_, rIdx) =>
    Array.from({ length: 12 }, (_, mIdx) =>
      Math.round(20 + rIdx * 10 + mIdx * 3 + surfRng() * 15),
    ),
  ),
};

/* ------------------------------------------------------------------ */
/* 8A — Bar + Line Combo: Revenue vs. User Growth                     */
/* ------------------------------------------------------------------ */
export const comboData = {
  labels: months12,
  revenue: [65, 68, 72, 77, 82, 87, 93, 98, 106, 114, 120, 128],
  userCount: [
    1580, 1670, 1760, 1850, 1940, 2040, 2140, 2250, 2360, 2480, 2600, 2720,
  ],
};

/* ------------------------------------------------------------------ */
/* 8B — Waterfall: MRR Movement This Quarter                          */
/* ------------------------------------------------------------------ */
export const waterfallData = {
  labels: [
    "Starting MRR",
    "New Business",
    "Expansion",
    "Reactivation",
    "Contraction",
    "Churn",
    "Net MRR",
  ],
  values: [47800, 8200, 3400, 1200, -1800, -2600, 56200],
  measures: [
    "absolute",
    "relative",
    "relative",
    "relative",
    "relative",
    "relative",
    "total",
  ],
};

/* ------------------------------------------------------------------ */
/* 9 — Plotly Table: Top 10 Tenants                                   */
/* ------------------------------------------------------------------ */
export const plotlyTableData = {
  headers: ["Tenant", "Plan", "Users", "Storage", "MRR ($)", "Status"],
  tenants: [
    ["Hooli", "Enterprise", "520", "124.8 GB", "4,200", "Active"],
    ["Acme Corp", "Enterprise", "245", "48.2 GB", "2,800", "Active"],
    ["Stark Ind.", "Enterprise", "310", "89.4 GB", "3,500", "Active"],
    ["Delos Inc", "Enterprise", "420", "110.3 GB", "3,900", "Active"],
    ["Umbrella Co", "Enterprise", "189", "67.3 GB", "2,400", "Active"],
    ["LexCorp", "Enterprise", "178", "52.1 GB", "2,200", "Active"],
    ["Tyrell Corp", "Enterprise", "156", "43.9 GB", "1,900", "Active"],
    ["Globex Inc", "Pro", "82", "12.7 GB", "820", "Active"],
    ["Weyland-Yut.", "Pro", "73", "18.7 GB", "730", "Trial"],
    ["Wayne Ent.", "Pro", "67", "15.9 GB", "670", "Active"],
  ],
};

/* ------------------------------------------------------------------ */
/* Shared Plotly config and layout defaults                           */
/* ------------------------------------------------------------------ */
export const plotConfig = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
} as const;

export const baseLayout: Record<string, unknown> = {
  autosize: true,
  margin: { l: 50, r: 20, t: 50, b: 50 },
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  font: { color: "#94a3b8" },
  xaxis: { gridcolor: "#1e293b", zerolinecolor: "#334155", color: "#94a3b8" },
  yaxis: { gridcolor: "#1e293b", zerolinecolor: "#334155", color: "#94a3b8" },
  legend: { font: { color: "#94a3b8" } },
};
