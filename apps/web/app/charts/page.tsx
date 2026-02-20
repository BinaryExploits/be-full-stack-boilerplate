"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ChartCard } from "../components/charts/chart-card";
import { useI18n } from "../hooks/useI18n";
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
    <div className="animate-pulse rounded-lg bg-gray-100 dark:bg-slate-700 h-80 w-full" />
  ),
});

export default function ChartsPage() {
  const { LL } = useI18n();

  const sectionNav = [
    { id: "line-area", label: LL.Charts.navLineArea() },
    { id: "bar-column", label: LL.Charts.navBarColumn() },
    { id: "pie-donut", label: LL.Charts.navPieDonut() },
    { id: "scatter-bubble", label: LL.Charts.navScatterBubble() },
    { id: "statistical", label: LL.Charts.navStatistical() },
    { id: "heatmap-timeline", label: LL.Charts.navHeatmapTimeline() },
    { id: "3d-charts", label: LL.Charts.nav3dCharts() },
    { id: "mixed-combo", label: LL.Charts.navMixedCombo() },
    { id: "plotly-table", label: LL.Charts.navPlotlyTable() },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {LL.Charts.title()}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {LL.Charts.description()}
        </p>
        <nav className="mt-3 flex flex-wrap gap-2">
          {sectionNav.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-gray-200 dark:border-slate-700 px-3 py-1 text-xs text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Section 1: Line & Area */}
      <LazySection id="line-area" title={LL.Charts.lineAreaCharts()}>
        <ChartCard
          title={LL.Charts.userGrowthTitle()}
          description={LL.Charts.userGrowthDesc()}
        >
          <Plot
            data={[
              {
                x: userGrowthData.labels,
                y: userGrowthData.newUsers,
                type: "scatter",
                mode: "lines+markers",
                name: LL.Charts.newUsers(),
                line: { color: "#3b82f6" },
              },
              {
                x: userGrowthData.labels,
                y: userGrowthData.activeUsers,
                type: "scatter",
                mode: "lines+markers",
                name: LL.Charts.activeUsers(),
                line: { color: "#10b981" },
              },
              {
                x: userGrowthData.labels,
                y: userGrowthData.churnedUsers,
                type: "scatter",
                mode: "lines+markers",
                name: LL.Charts.churnedUsers(),
                line: { color: "#ef4444" },
              },
            ]}
            layout={{ ...baseLayout, height: 400 }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title={LL.Charts.revenueBreakdownTitle()}
          description={LL.Charts.revenueBreakdownDesc()}
        >
          <Plot
            data={[
              {
                x: revenueBreakdownData.labels,
                y: revenueBreakdownData.subscriptions,
                type: "scatter",
                fill: "tozeroy",
                name: LL.Charts.subscriptions(),
                line: { color: "#3b82f6" },
              },
              {
                x: revenueBreakdownData.labels,
                y: revenueBreakdownData.addons,
                type: "scatter",
                fill: "tonexty",
                name: LL.Charts.addOns(),
                line: { color: "#8b5cf6" },
              },
              {
                x: revenueBreakdownData.labels,
                y: revenueBreakdownData.services,
                type: "scatter",
                fill: "tonexty",
                name: LL.Charts.services(),
                line: { color: "#10b981" },
              },
              {
                x: revenueBreakdownData.labels,
                y: revenueBreakdownData.overages,
                type: "scatter",
                fill: "tonexty",
                name: LL.Charts.overages(),
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
      <LazySection id="bar-column" title={LL.Charts.barColumnCharts()}>
        <ChartCard
          title={LL.Charts.mauByRegionTitle()}
          description={LL.Charts.mauByRegionDesc()}
        >
          <Plot
            data={[
              {
                x: mauByRegionData.labels,
                y: mauByRegionData.usEast,
                type: "bar",
                name: LL.Charts.usEast(),
                marker: { color: "#3b82f6" },
              },
              {
                x: mauByRegionData.labels,
                y: mauByRegionData.euWest,
                type: "bar",
                name: LL.Charts.euWest(),
                marker: { color: "#10b981" },
              },
              {
                x: mauByRegionData.labels,
                y: mauByRegionData.apac,
                type: "bar",
                name: LL.Charts.apac(),
                marker: { color: "#f59e0b" },
              },
              {
                x: mauByRegionData.labels,
                y: mauByRegionData.usWest,
                type: "bar",
                name: LL.Charts.usWest(),
                marker: { color: "#8b5cf6" },
              },
            ]}
            layout={{ ...baseLayout, height: 400, barmode: "group" }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title={LL.Charts.featureUsageTitle()}
          description={LL.Charts.featureUsageDesc()}
        >
          <Plot
            data={[
              {
                y: featureUsageData.plans,
                x: featureUsageData.auth,
                type: "bar",
                orientation: "h",
                name: LL.Charts.auth(),
                marker: { color: "#3b82f6" },
              },
              {
                y: featureUsageData.plans,
                x: featureUsageData.crud,
                type: "bar",
                orientation: "h",
                name: LL.Charts.crud(),
                marker: { color: "#10b981" },
              },
              {
                y: featureUsageData.plans,
                x: featureUsageData.analytics,
                type: "bar",
                orientation: "h",
                name: LL.Charts.analytics(),
                marker: { color: "#f59e0b" },
              },
              {
                y: featureUsageData.plans,
                x: featureUsageData.api,
                type: "bar",
                orientation: "h",
                name: LL.Charts.api(),
                marker: { color: "#8b5cf6" },
              },
              {
                y: featureUsageData.plans,
                x: featureUsageData.multiTenant,
                type: "bar",
                orientation: "h",
                name: LL.Charts.multiTenant(),
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
      <LazySection id="pie-donut" title={LL.Charts.pieDonutSunburst()}>
        <ChartCard
          title={LL.Charts.tenantPlanDistTitle()}
          description={LL.Charts.tenantPlanDistDesc()}
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
          title={LL.Charts.roleHierarchyTitle()}
          description={LL.Charts.roleHierarchyDesc()}
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
      <LazySection id="scatter-bubble" title={LL.Charts.scatterBubbleCharts()}>
        <ChartCard
          title={LL.Charts.sessionScatterTitle()}
          description={LL.Charts.sessionScatterDesc()}
        >
          <Plot
            data={[
              { key: "Free", name: LL.Charts.free() },
              { key: "Pro", name: LL.Charts.pro() },
              { key: "Enterprise", name: LL.Charts.enterprise() },
            ].map(({ key, name }, i) => {
              const colors = ["#64748b", "#3b82f6", "#10b981"];
              const idxs = sessionScatterData.tier
                .map((t, idx) => (t === key ? idx : -1))
                .filter((idx) => idx >= 0);
              return {
                x: idxs.map((idx) => sessionScatterData.duration[idx]),
                y: idxs.map((idx) => sessionScatterData.actions[idx]),
                type: "scatter" as const,
                mode: "markers" as const,
                name,
                marker: { color: colors[i], size: 8, opacity: 0.7 },
              };
            })}
            layout={{
              ...baseLayout,
              height: 400,
              xaxis: {
                title: LL.Charts.durationMin(),
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              yaxis: {
                title: LL.Charts.actions(),
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title={LL.Charts.tenantBubbleTitle()}
          description={LL.Charts.tenantBubbleDesc()}
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
                    title: LL.Charts.revenueUsd(),
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
                title: LL.Charts.userCount(),
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              yaxis: {
                title: LL.Charts.storageGb(),
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
      <LazySection id="statistical" title={LL.Charts.statisticalCharts()}>
        <ChartCard
          title={LL.Charts.responseTimeTitle()}
          description={LL.Charts.responseTimeDesc()}
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
                title: LL.Charts.responseTimeMs(),
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title={LL.Charts.sessionLengthTitle()}
          description={LL.Charts.sessionLengthDesc()}
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
                title: LL.Charts.sessionLengthMin(),
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              yaxis: {
                title: LL.Charts.count(),
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
      <LazySection id="heatmap-timeline" title={LL.Charts.heatmapTimeline()}>
        <ChartCard
          title={LL.Charts.activityHeatmapTitle()}
          description={LL.Charts.activityHeatmapDesc()}
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
          title={LL.Charts.ganttTitle()}
          description={LL.Charts.ganttDesc()}
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
      <LazySection
        id="3d-charts"
        title={LL.Charts.threeDChartsWebGL()}
        fullWidth
      >
        <ChartCard
          title={LL.Charts.engagement3dTitle()}
          description={LL.Charts.engagement3dDesc()}
          className="lg:col-span-2"
        >
          <Plot
            data={[
              { key: "Low", name: LL.Charts.low() },
              { key: "Medium", name: LL.Charts.medium() },
              { key: "High", name: LL.Charts.high() },
            ].map(({ key, name }, i) => {
              const colors = ["#64748b", "#3b82f6", "#10b981"];
              const idxs = engagement3dData.cluster
                .map((c, idx) => (c === key ? idx : -1))
                .filter((idx) => idx >= 0);
              return {
                x: idxs.map((idx) => engagement3dData.sessions[idx]),
                y: idxs.map((idx) => engagement3dData.avgDuration[idx]),
                z: idxs.map((idx) => engagement3dData.revenue[idx]),
                type: "scatter3d" as const,
                mode: "markers" as const,
                name,
                marker: { color: colors[i], size: 4, opacity: 0.8 },
              };
            })}
            layout={{
              ...baseLayout,
              height: 500,
              scene: {
                xaxis: { title: LL.Charts.sessions(), color: "#94a3b8" },
                yaxis: { title: LL.Charts.avgDuration(), color: "#94a3b8" },
                zaxis: { title: LL.Charts.revenueUsd(), color: "#94a3b8" },
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title={LL.Charts.surfaceTitle()}
          description={LL.Charts.surfaceDesc()}
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
                xaxis: { title: LL.Charts.month(), color: "#94a3b8" },
                yaxis: { title: LL.Charts.region(), color: "#94a3b8" },
                zaxis: { title: LL.Charts.revenueK(), color: "#94a3b8" },
              },
            }}
            config={plotConfig}
            className="w-full"
          />
        </ChartCard>
      </LazySection>

      {/* Section 8: Mixed / Combo */}
      <LazySection id="mixed-combo" title={LL.Charts.mixedComboCharts()}>
        <ChartCard
          title={LL.Charts.comboTitle()}
          description={LL.Charts.comboDesc()}
        >
          <Plot
            data={[
              {
                x: comboData.labels,
                y: comboData.revenue,
                type: "bar",
                name: LL.Charts.revenueK(),
                marker: { color: "#3b82f6" },
              },
              {
                x: comboData.labels,
                y: comboData.userCount,
                type: "scatter",
                mode: "lines+markers",
                name: LL.Charts.userCount(),
                yaxis: "y2",
                line: { color: "#10b981" },
              },
            ]}
            layout={{
              ...baseLayout,
              height: 400,
              yaxis: {
                title: LL.Charts.revenueK(),
                color: "#94a3b8",
                gridcolor: "#1e293b",
              },
              yaxis2: {
                title: LL.Charts.userCount(),
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
          title={LL.Charts.waterfallTitle()}
          description={LL.Charts.waterfallDesc()}
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
                title: LL.Charts.mrrUsd(),
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
      <LazySection id="plotly-table" title={LL.Charts.plotlyTable()} fullWidth>
        <ChartCard
          title={LL.Charts.plotlyTableTitle()}
          description={LL.Charts.plotlyTableDesc()}
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
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div
        className={`grid gap-6 ${fullWidth ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}
      >
        {visible ? (
          children
        ) : (
          <div className="animate-pulse rounded-xl bg-white dark:bg-slate-800 h-96 col-span-full" />
        )}
      </div>
    </section>
  );
}
