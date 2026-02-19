"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ChartCard } from "../components/charts/chart-card";
import {
  userGrowthData,
  revenueBreakdownData,
  mauByRegionData,
  featureUsageData,
  tenantPlanData,
  roleHierarchyData,
  sessionScatterData,
  tenantBubbleData,
  responseTimeData,
  sessionLengthData,
  activityHeatmapData,
  ganttData,
  engagement3dData,
  revenueSurfaceData,
  comboData,
  waterfallData,
  plotlyTableData,
  plotConfig,
  baseLayout,
} from "../components/charts/chart-data";

const Plot = dynamic(() => import("../components/charts/plot-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse rounded-lg bg-slate-700 h-80 w-full" />
  ),
});

const sectionNav = [
  { id: "line-area", label: "Line & Area" },
  { id: "bar-column", label: "Bar & Column" },
  { id: "pie-donut", label: "Pie, Donut & Sunburst" },
  { id: "scatter-bubble", label: "Scatter & Bubble" },
  { id: "statistical", label: "Statistical" },
  { id: "heatmap-timeline", label: "Heatmap & Timeline" },
  { id: "3d-charts", label: "3D Charts" },
  { id: "mixed-combo", label: "Mixed / Combo" },
  { id: "plotly-table", label: "Plotly Table" },
];

export default function ChartsPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Charts & Visualizations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          12+ chart types powered by Plotly.js with WebGL support. All charts
          are interactive — zoom, pan, and hover for details.
        </p>
        <nav className="mt-3 flex flex-wrap gap-2">
          {sectionNav.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Section 1: Line & Area */}
      <LazySection id="line-area" title="Line & Area Charts">
        <ChartCard
          title="User Growth Over Time"
          description="24-month trend of new, active, and churned users."
        >
          <Plot
            data={[
              {
                x: userGrowthData.labels,
                y: userGrowthData.newUsers,
                type: "scatter",
                mode: "lines+markers",
                name: "New Users",
                line: { color: "#3b82f6" },
              },
              {
                x: userGrowthData.labels,
                y: userGrowthData.activeUsers,
                type: "scatter",
                mode: "lines+markers",
                name: "Active Users",
                line: { color: "#10b981" },
              },
              {
                x: userGrowthData.labels,
                y: userGrowthData.churnedUsers,
                type: "scatter",
                mode: "lines+markers",
                name: "Churned Users",
                line: { color: "#ef4444" },
              },
            ]}
            layout={{ ...baseLayout, height: 400 }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="Revenue Breakdown by Category"
          description="Stacked area showing subscription, add-on, service, and overage revenue."
        >
          <Plot
            data={[
              {
                x: revenueBreakdownData.labels,
                y: revenueBreakdownData.subscriptions,
                type: "scatter",
                fill: "tozeroy",
                name: "Subscriptions",
                line: { color: "#3b82f6" },
              },
              {
                x: revenueBreakdownData.labels,
                y: revenueBreakdownData.addons,
                type: "scatter",
                fill: "tonexty",
                name: "Add-ons",
                line: { color: "#8b5cf6" },
              },
              {
                x: revenueBreakdownData.labels,
                y: revenueBreakdownData.services,
                type: "scatter",
                fill: "tonexty",
                name: "Services",
                line: { color: "#10b981" },
              },
              {
                x: revenueBreakdownData.labels,
                y: revenueBreakdownData.overages,
                type: "scatter",
                fill: "tonexty",
                name: "Overages",
                line: { color: "#f59e0b" },
              },
            ]}
            layout={{ ...baseLayout, height: 400 }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 2: Bar & Column */}
      <LazySection id="bar-column" title="Bar & Column Charts">
        <ChartCard
          title="Monthly Active Users by Region"
          description="Grouped bar chart comparing four regions over 12 months."
        >
          <Plot
            data={[
              {
                x: mauByRegionData.labels,
                y: mauByRegionData.usEast,
                type: "bar",
                name: "US-East",
                marker: { color: "#3b82f6" },
              },
              {
                x: mauByRegionData.labels,
                y: mauByRegionData.euWest,
                type: "bar",
                name: "EU-West",
                marker: { color: "#10b981" },
              },
              {
                x: mauByRegionData.labels,
                y: mauByRegionData.apac,
                type: "bar",
                name: "APAC",
                marker: { color: "#f59e0b" },
              },
              {
                x: mauByRegionData.labels,
                y: mauByRegionData.usWest,
                type: "bar",
                name: "US-West",
                marker: { color: "#8b5cf6" },
              },
            ]}
            layout={{ ...baseLayout, height: 400, barmode: "group" }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="Feature Usage by Tenant Plan"
          description="Horizontal stacked bar showing feature adoption across plan tiers."
        >
          <Plot
            data={[
              {
                y: featureUsageData.plans,
                x: featureUsageData.auth,
                type: "bar",
                orientation: "h",
                name: "Auth",
                marker: { color: "#3b82f6" },
              },
              {
                y: featureUsageData.plans,
                x: featureUsageData.crud,
                type: "bar",
                orientation: "h",
                name: "CRUD",
                marker: { color: "#10b981" },
              },
              {
                y: featureUsageData.plans,
                x: featureUsageData.analytics,
                type: "bar",
                orientation: "h",
                name: "Analytics",
                marker: { color: "#f59e0b" },
              },
              {
                y: featureUsageData.plans,
                x: featureUsageData.api,
                type: "bar",
                orientation: "h",
                name: "API",
                marker: { color: "#8b5cf6" },
              },
              {
                y: featureUsageData.plans,
                x: featureUsageData.multiTenant,
                type: "bar",
                orientation: "h",
                name: "Multi-Tenant",
                marker: { color: "#ef4444" },
              },
            ]}
            layout={{ ...baseLayout, height: 400, barmode: "stack" }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 3: Pie, Donut & Sunburst */}
      <LazySection id="pie-donut" title="Pie, Donut & Sunburst">
        <ChartCard
          title="Tenant Plan Distribution"
          description="Donut chart showing the breakdown of tenants by plan tier."
        >
          <Plot
            data={[
              {
                labels: tenantPlanData.labels,
                values: tenantPlanData.values,
                type: "pie",
                hole: 0.5,
                marker: {
                  colors: ["#64748b", "#3b82f6", "#10b981", "#f59e0b"],
                },
                textinfo: "label+percent",
                textfont: { color: "#e2e8f0" },
              },
            ]}
            layout={{ ...baseLayout, height: 400, showlegend: true }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="User Role Hierarchy"
          description="Sunburst chart showing organizational structure: Org > Department > Role."
        >
          <Plot
            data={[
              {
                type: "sunburst",
                labels: roleHierarchyData.labels,
                parents: roleHierarchyData.parents,
                values: roleHierarchyData.values,
                branchvalues: "total",
                textfont: { color: "#e2e8f0" },
              },
            ]}
            layout={{ ...baseLayout, height: 400 }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 4: Scatter & Bubble */}
      <LazySection id="scatter-bubble" title="Scatter & Bubble Charts">
        <ChartCard
          title="Session Duration vs. Actions Taken"
          description="Color-encoded by user tier. Hover for details."
        >
          <Plot
            data={["Free", "Pro", "Enterprise"].map((tier, i) => {
              const colors = ["#64748b", "#3b82f6", "#10b981"];
              const idxs = sessionScatterData.tier
                .map((t, idx) => (t === tier ? idx : -1))
                .filter((idx) => idx >= 0);
              return {
                x: idxs.map((idx) => sessionScatterData.duration[idx]),
                y: idxs.map((idx) => sessionScatterData.actions[idx]),
                type: "scatter" as const,
                mode: "markers" as const,
                name: tier,
                marker: { color: colors[i], size: 8, opacity: 0.7 },
              };
            })}
            layout={{
              ...baseLayout,
              height: 400,
              xaxis: {
                title: "Duration (min)",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              yaxis: {
                title: "Actions",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="Tenant Size vs. Storage Used"
          description="Bubble size represents monthly revenue."
        >
          <Plot
            data={[
              {
                x: tenantBubbleData.userCount,
                y: tenantBubbleData.storageGb,
                type: "scatter",
                mode: "markers",
                marker: {
                  size: tenantBubbleData.revenue.map((r) => Math.sqrt(r) / 2),
                  color: tenantBubbleData.revenue,
                  colorscale: "Viridis",
                  showscale: true,
                  colorbar: {
                    title: "Revenue ($)",
                    tickfont: { color: "#94a3b8" },
                  },
                },
                text: tenantBubbleData.revenue.map(
                  (r) => `$${r.toLocaleString()}`,
                ),
              },
            ]}
            layout={{
              ...baseLayout,
              height: 400,
              xaxis: {
                title: "User Count",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              yaxis: {
                title: "Storage (GB)",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 5: Statistical */}
      <LazySection id="statistical" title="Statistical Charts">
        <ChartCard
          title="Response Time Distribution by Service"
          description="Box plot showing latency spread across five API services."
        >
          <Plot
            data={Object.entries(responseTimeData).map(([name, values]) => ({
              y: values,
              type: "box" as const,
              name: name.replace(/([A-Z])/g, " $1").trim(),
              marker: { color: "#3b82f6" },
            }))}
            layout={{
              ...baseLayout,
              height: 400,
              yaxis: {
                title: "Response Time (ms)",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="User Session Length Distribution"
          description="Histogram binned by minute intervals."
        >
          <Plot
            data={[
              {
                x: sessionLengthData,
                type: "histogram",
                nbinsx: 30,
                marker: {
                  color: "#3b82f6",
                  line: { color: "#1e293b", width: 1 },
                },
              },
            ]}
            layout={{
              ...baseLayout,
              height: 400,
              xaxis: {
                title: "Session Length (min)",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              yaxis: {
                title: "Count",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 6: Heatmap & Timeline */}
      <LazySection id="heatmap-timeline" title="Heatmap & Timeline">
        <ChartCard
          title="Activity by Hour and Day of Week"
          description="7x24 heatmap showing event density. Viridis colorscale."
        >
          <Plot
            data={[
              {
                z: activityHeatmapData.z,
                x: activityHeatmapData.hours,
                y: activityHeatmapData.days,
                type: "heatmap",
                colorscale: "Viridis",
                colorbar: { tickfont: { color: "#94a3b8" } },
              },
            ]}
            layout={{ ...baseLayout, height: 400 }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="Tenant Onboarding Timeline"
          description="Gantt-style horizontal bar showing onboarding start and end dates."
        >
          <Plot
            data={ganttData.tenants.map((tenant, i) => {
              const start = new Date(ganttData.starts[i]!).getTime();
              const end = new Date(ganttData.ends[i]!).getTime();
              const colors = [
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#8b5cf6",
                "#ef4444",
                "#06b6d4",
                "#d946ef",
                "#f97316",
              ];
              return {
                x: [end - start],
                y: [tenant],
                type: "bar" as const,
                orientation: "h" as const,
                base: [ganttData.starts[i]],
                marker: { color: colors[i % colors.length] },
                name: tenant,
                showlegend: false,
              };
            })}
            layout={{
              ...baseLayout,
              height: 400,
              xaxis: {
                type: "date",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              barmode: "stack",
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 7: 3D Charts (full width) */}
      <LazySection id="3d-charts" title="3D Charts (WebGL)" fullWidth>
        <ChartCard
          title="3D User Engagement Clustering"
          description="WebGL-rendered 3D scatter: sessions x avg duration x revenue, colored by cluster tier."
          className="lg:col-span-2"
        >
          <Plot
            data={["Low", "Medium", "High"].map((cluster, i) => {
              const colors = ["#64748b", "#3b82f6", "#10b981"];
              const idxs = engagement3dData.cluster
                .map((c, idx) => (c === cluster ? idx : -1))
                .filter((idx) => idx >= 0);
              return {
                x: idxs.map((idx) => engagement3dData.sessions[idx]),
                y: idxs.map((idx) => engagement3dData.avgDuration[idx]),
                z: idxs.map((idx) => engagement3dData.revenue[idx]),
                type: "scatter3d" as const,
                mode: "markers" as const,
                name: cluster,
                marker: { color: colors[i], size: 4, opacity: 0.8 },
              };
            })}
            layout={{
              ...baseLayout,
              height: 500,
              scene: {
                xaxis: { title: "Sessions", color: "#94a3b8" },
                yaxis: { title: "Avg Duration", color: "#94a3b8" },
                zaxis: { title: "Revenue ($)", color: "#94a3b8" },
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="Revenue Surface: Time x Region"
          description="Full 3D rotation — drag to explore. Portland colorscale."
          className="lg:col-span-2"
        >
          <Plot
            data={[
              {
                z: revenueSurfaceData.z,
                x: revenueSurfaceData.months,
                y: revenueSurfaceData.regions,
                type: "surface",
                colorscale: "Portland",
                colorbar: { tickfont: { color: "#94a3b8" } },
              },
            ]}
            layout={{
              ...baseLayout,
              height: 500,
              scene: {
                xaxis: { title: "Month", color: "#94a3b8" },
                yaxis: { title: "Region", color: "#94a3b8" },
                zaxis: { title: "Revenue ($K)", color: "#94a3b8" },
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 8: Mixed / Combo */}
      <LazySection id="mixed-combo" title="Mixed / Combo Charts">
        <ChartCard
          title="Revenue vs. User Growth"
          description="Bar chart (revenue) with line overlay (user count) on secondary y-axis."
        >
          <Plot
            data={[
              {
                x: comboData.labels,
                y: comboData.revenue,
                type: "bar",
                name: "Revenue ($K)",
                marker: { color: "#3b82f6" },
              },
              {
                x: comboData.labels,
                y: comboData.userCount,
                type: "scatter",
                mode: "lines+markers",
                name: "User Count",
                yaxis: "y2",
                line: { color: "#10b981" },
              },
            ]}
            layout={{
              ...baseLayout,
              height: 400,
              yaxis: {
                title: "Revenue ($K)",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              yaxis2: {
                title: "User Count",
                overlaying: "y",
                side: "right",
                color: "#10b981",
                gridcolor: "transparent",
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="MRR Movement This Quarter"
          description="Waterfall chart showing new business, expansion, churn, and net MRR."
        >
          <Plot
            data={[
              {
                x: waterfallData.labels,
                y: waterfallData.values,
                type: "waterfall",
                measure: waterfallData.measures,
                connector: { line: { color: "#475569" } },
                increasing: { marker: { color: "#10b981" } },
                decreasing: { marker: { color: "#ef4444" } },
                totals: { marker: { color: "#3b82f6" } },
                textposition: "outside",
                textfont: { color: "#94a3b8" },
              },
            ]}
            layout={{
              ...baseLayout,
              height: 400,
              yaxis: {
                title: "MRR ($)",
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 9: Plotly Table */}
      <LazySection id="plotly-table" title="Plotly Table" fullWidth>
        <ChartCard
          title="Top 10 Tenants — Plotly Table Trace"
          description="This is a Plotly trace, not TanStack Table — compare the two on the Grids page."
          className="lg:col-span-2"
        >
          <Plot
            data={[
              {
                type: "table",
                header: {
                  values: plotlyTableData.headers.map((h) => `<b>${h}</b>`),
                  align: "left",
                  fill: { color: "#1e293b" },
                  font: { color: "#e2e8f0", size: 13 },
                  height: 35,
                },
                cells: {
                  values: plotlyTableData.headers.map((_, colIdx) =>
                    plotlyTableData.tenants.map((row) => row[colIdx]),
                  ),
                  align: "left",
                  fill: {
                    color: plotlyTableData.tenants.map((_, i) =>
                      i % 2 === 0 ? "#0f172a" : "#1e293b",
                    ),
                  },
                  font: { color: "#cbd5e1", size: 12 },
                  height: 30,
                },
              },
            ]}
            layout={{ ...baseLayout, height: 400 }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>
    </div>
  );
}

/* ================================================================== */
/* LazySection — renders children only when scrolled into view         */
/* ================================================================== */
function LazySection({
  id,
  title,
  children,
  fullWidth = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} ref={ref} className="mb-10 scroll-mt-6">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div
        className={`grid gap-6 ${fullWidth ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}
      >
        {visible ? (
          children
        ) : (
          <div className="animate-pulse rounded-xl bg-slate-800 h-96 col-span-full" />
        )}
      </div>
    </section>
  );
}
