"use client";

import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";

const RawPlot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse rounded-lg bg-slate-700 h-80 w-full" />
  ),
});

/**
 * Wrapper around react-plotly.js with relaxed types for layout/data.
 * Plotly's TS definitions are stricter than its runtime API —
 * e.g. axis `title` accepts a string at runtime but the types demand an object.
 */
export default function Plot(
  props: Omit<PlotParams, "layout" | "data"> & {
    layout?: Record<string, unknown>;
    data: Record<string, unknown>[];
  },
) {
  const height = (props.layout?.height as number) || 400;
  return (
    <RawPlot
      {...(props as any)}
      useResizeHandler
      style={{ width: "100%", height }}
    />
  );
}
