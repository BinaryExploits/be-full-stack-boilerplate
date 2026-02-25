# Charts & Visualizations

This boilerplate includes powerful interactive charts powered by **Plotly.js** with 12+ chart types and WebGL support for high-performance rendering.

---

## Table of Contents

- [Overview](#overview)
- [Plotly.js Features](#plotlyjs-features)
- [Built-in Chart Examples](#built-in-chart-examples)
- [Basic Usage](#basic-usage)
- [Chart Types](#chart-types)
- [Interactivity](#interactivity)
- [Styling and Theming](#styling-and-theming)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)

---

## Overview

### What is Plotly.js?

**Plotly.js** is a high-level, declarative charting library built on top of D3.js and stack.gl. It provides:

- **12+ chart types**: Line, bar, pie, scatter, 3D, heatmap, and more
- **Interactive by default**: Zoom, pan, hover tooltips, and legends
- **WebGL rendering**: Hardware-accelerated graphics for large datasets
- **Responsive**: Automatically adapts to container size
- **Export capabilities**: Download charts as PNG, SVG, or JSON
- **Mobile-friendly**: Touch gestures for zoom and pan

### Why Plotly.js?

- **Rich visualizations**: Professional-grade charts out of the box
- **Minimal code**: Declarative API with sensible defaults
- **Performance**: WebGL support for millions of data points
- **Interactivity**: Built-in zoom, pan, hover, and click handlers
- **Flexibility**: Extensive customization options
- **Type-safe**: Full TypeScript support with `@types/plotly.js`

---

## Plotly.js Features

The boilerplate includes examples of:

### Line & Area Charts
- Single/multi-line charts
- Stacked area charts
- Time series data
- Trend lines

### Bar & Column Charts
- Grouped bar charts
- Stacked bar charts
- Horizontal bars
- Waterfall charts

### Pie, Donut & Sunburst
- Pie charts with labels
- Donut charts (pie with hole)
- Sunburst charts (hierarchical pie)

### Scatter & Bubble Charts
- 2D scatter plots
- Bubble charts (size-encoded)
- Color-coded scatter plots

### Statistical Charts
- Box plots
- Violin plots
- Histograms
- Distribution curves

### Heatmaps & Timeline
- Heatmaps with colorscales
- Annotated heatmaps
- Gantt-style timelines

### 3D Charts (WebGL)
- 3D scatter plots
- 3D surface plots
- Mesh plots
- Full rotation and zoom

### Mixed / Combo Charts
- Bar + line overlay
- Multiple y-axes
- Dual chart types

---

## Built-in Chart Examples

The boilerplate includes 30+ chart examples at `/charts`:

### Line & Area Tab

1. **User Growth Over Time** - Multi-line chart with 3 series (new, active, churned users)
2. **Revenue Breakdown** - Stacked area chart showing revenue categories

### Bar & Column Tab

3. **Monthly Active Users by Region** - Grouped bar chart comparing 4 regions
4. **Feature Usage by Plan** - Horizontal stacked bar chart

### Pie, Donut & Sunburst Tab

5. **Tenant Plan Distribution** - Donut chart showing plan tiers
6. **User Role Hierarchy** - Sunburst chart with org structure

### Scatter & Bubble Tab

7. **Session Duration vs Actions** - Color-coded scatter plot
8. **Tenant Size vs Storage** - Bubble chart with size encoding

### Statistical Tab

9. **Response Time Distribution** - Box plot across 5 services
10. **Session Length Distribution** - Histogram with bins

### Heatmap & Timeline Tab

11. **Activity Heatmap** - 7x24 grid showing event density
12. **Tenant Onboarding Timeline** - Gantt-style bar chart

### 3D & Advanced Tab

13. **User Engagement Clustering** - 3D scatter plot (WebGL)
14. **Revenue Surface** - 3D surface plot with rotation

### Mixed / Combo Tab

15. **Revenue vs User Growth** - Bar + line with dual y-axes
16. **MRR Movement** - Waterfall chart

---

## Basic Usage

### Installation

Already included in the boilerplate:

```json
{
  "dependencies": {
    "plotly.js": "^3.3.1",
    "react-plotly.js": "^2.6.0"
  },
  "devDependencies": {
    "@types/react-plotly.js": "^2.6.4"
  }
}
```

### Simple Line Chart

```typescript
import Plot from 'react-plotly.js';

function SimpleLineChart() {
  const data = [
    {
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      y: [10, 15, 13, 17, 22],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'blue' },
      name: 'Sales',
    },
  ];

  const layout = {
    title: 'Monthly Sales',
    xaxis: { title: 'Month' },
    yaxis: { title: 'Revenue ($K)' },
  };

  return <Plot data={data} layout={layout} />;
}
```

### Simple Bar Chart

```typescript
function SimpleBarChart() {
  const data = [
    {
      x: ['Product A', 'Product B', 'Product C'],
      y: [20, 35, 15],
      type: 'bar',
      marker: { color: 'green' },
    },
  ];

  const layout = {
    title: 'Product Sales',
    yaxis: { title: 'Units Sold' },
  };

  return <Plot data={data} layout={layout} />;
}
```

---

## Chart Types

### 1. Line Chart

```typescript
const data = [
  {
    x: [1, 2, 3, 4, 5],
    y: [1, 4, 9, 16, 25],
    type: 'scatter',
    mode: 'lines',
    line: { color: 'blue', width: 2 },
  },
];
```

### 2. Stacked Area Chart

```typescript
const data = [
  {
    x: ['Jan', 'Feb', 'Mar'],
    y: [10, 15, 13],
    fill: 'tonexty',
    type: 'scatter',
    name: 'Series 1',
  },
  {
    x: ['Jan', 'Feb', 'Mar'],
    y: [5, 8, 6],
    fill: 'tonexty',
    type: 'scatter',
    name: 'Series 2',
  },
];
```

### 3. Grouped Bar Chart

```typescript
const data = [
  {
    x: ['Q1', 'Q2', 'Q3', 'Q4'],
    y: [20, 30, 25, 35],
    type: 'bar',
    name: '2023',
  },
  {
    x: ['Q1', 'Q2', 'Q3', 'Q4'],
    y: [25, 35, 30, 40],
    type: 'bar',
    name: '2024',
  },
];

const layout = {
  barmode: 'group',
};
```

### 4. Pie Chart

```typescript
const data = [
  {
    values: [35, 25, 20, 15, 5],
    labels: ['Free', 'Pro', 'Enterprise', 'Trial', 'Other'],
    type: 'pie',
    hole: 0.4, // Makes it a donut chart (0 = pie, 0.4 = donut)
  },
];
```

### 5. Scatter Plot

```typescript
const data = [
  {
    x: [1, 2, 3, 4, 5],
    y: [1, 4, 2, 3, 5],
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 12,
      color: ['red', 'blue', 'green', 'orange', 'purple'],
    },
  },
];
```

### 6. Bubble Chart

```typescript
const data = [
  {
    x: [1, 2, 3, 4],
    y: [10, 11, 12, 13],
    mode: 'markers',
    marker: {
      size: [40, 60, 80, 100], // Bubble sizes
      color: [10, 20, 30, 40], // Color scale
      colorscale: 'Viridis',
      showscale: true,
    },
    type: 'scatter',
  },
];
```

### 7. Box Plot

```typescript
const data = [
  {
    y: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    type: 'box',
    name: 'Dataset 1',
  },
  {
    y: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    type: 'box',
    name: 'Dataset 2',
  },
];
```

### 8. Histogram

```typescript
const data = [
  {
    x: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5],
    type: 'histogram',
    marker: { color: 'blue' },
  },
];
```

### 9. Heatmap

```typescript
const data = [
  {
    z: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
    x: ['A', 'B', 'C'],
    y: ['X', 'Y', 'Z'],
    type: 'heatmap',
    colorscale: 'Viridis',
  },
];
```

### 10. 3D Scatter Plot (WebGL)

```typescript
const data = [
  {
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 3, 4, 5],
    z: [1, 4, 9, 16, 25],
    mode: 'markers',
    type: 'scatter3d',
    marker: {
      size: 12,
      color: [1, 2, 3, 4, 5],
      colorscale: 'Viridis',
    },
  },
];

const layout = {
  scene: {
    xaxis: { title: 'X Axis' },
    yaxis: { title: 'Y Axis' },
    zaxis: { title: 'Z Axis' },
  },
};
```

### 11. 3D Surface Plot

```typescript
const data = [
  {
    z: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
    type: 'surface',
    colorscale: 'Portland',
  },
];
```

### 12. Waterfall Chart

```typescript
const data = [
  {
    x: ['Start', 'New', 'Expansion', 'Churn', 'End'],
    y: [100, 50, 30, -20, 160],
    type: 'waterfall',
    connector: {
      line: { color: 'rgb(63, 63, 63)' },
    },
  },
];
```

---

## Interactivity

### Built-in Interactions

Plotly charts are **interactive by default**:

- **Zoom**: Click and drag to zoom into regions
- **Pan**: Shift + drag to pan
- **Hover**: Hover over data points to see tooltips
- **Legend**: Click legend items to show/hide series
- **Reset**: Double-click to reset zoom
- **Download**: Camera icon to export as PNG

### Custom Click Handlers

```typescript
function InteractiveChart() {
  const handleClick = (event) => {
    const point = event.points[0];
    console.log('Clicked:', point.x, point.y);
  };

  return (
    <Plot
      data={data}
      layout={layout}
      onClick={handleClick}
    />
  );
}
```

### Custom Hover Templates

```typescript
const data = [
  {
    x: [1, 2, 3],
    y: [10, 20, 30],
    type: 'scatter',
    mode: 'markers',
    hovertemplate: '<b>X</b>: %{x}<br><b>Y</b>: %{y}<br><extra></extra>',
  },
];
```

### Disable Specific Interactions

```typescript
const config = {
  displayModeBar: false, // Hide toolbar
  staticPlot: true, // Make chart non-interactive
  scrollZoom: false, // Disable scroll zoom
};

<Plot data={data} layout={layout} config={config} />
```

---

## Styling and Theming

### Custom Colors

```typescript
const data = [
  {
    x: ['A', 'B', 'C'],
    y: [10, 20, 30],
    type: 'bar',
    marker: {
      color: ['#3b82f6', '#10b981', '#f59e0b'], // Custom colors
    },
  },
];
```

### Dark Mode Support

```typescript
function DarkModeChart() {
  const layout = {
    title: 'Dark Mode Chart',
    paper_bgcolor: '#1f2937', // Background
    plot_bgcolor: '#111827', // Plot area
    font: { color: '#f9fafb' }, // Text color
    xaxis: {
      gridcolor: '#374151',
      zerolinecolor: '#374151',
    },
    yaxis: {
      gridcolor: '#374151',
      zerolinecolor: '#374151',
    },
  };

  return <Plot data={data} layout={layout} />;
}
```

### Responsive Charts

```typescript
const layout = {
  autosize: true,
  margin: { t: 50, r: 50, b: 50, l: 50 },
};

const config = {
  responsive: true,
};

<Plot
  data={data}
  layout={layout}
  config={config}
  style={{ width: '100%', height: '400px' }}
/>
```

### Custom Fonts

```typescript
const layout = {
  font: {
    family: 'Inter, sans-serif',
    size: 14,
    color: '#374151',
  },
  title: {
    font: {
      family: 'Inter, sans-serif',
      size: 20,
      weight: 600,
    },
  },
};
```

---

## Performance Optimization

### 1. Use WebGL for Large Datasets

For charts with 1000+ points, use WebGL mode:

```typescript
const data = [
  {
    x: largeArrayX, // 10,000+ points
    y: largeArrayY,
    type: 'scattergl', // WebGL mode
    mode: 'markers',
    marker: { size: 3 },
  },
];
```

**WebGL-enabled types**:
- `scattergl` - 2D scatter (WebGL)
- `scatter3d` - 3D scatter (WebGL by default)
- `surface` - 3D surface (WebGL by default)
- `mesh3d` - 3D mesh (WebGL by default)

### 2. Simplify Data

Reduce data points for smoother rendering:

```typescript
// Before: 10,000 points
const fullData = [...]; // 10k points

// After: Downsample to 1,000 points
const downsampledData = fullData.filter((_, i) => i % 10 === 0);
```

### 3. Lazy Loading

Load charts only when visible:

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

function ChartsPage() {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <HeavyChart />
    </Suspense>
  );
}
```

### 4. Memoize Data

Prevent unnecessary re-renders:

```typescript
import { useMemo } from 'react';

function OptimizedChart({ rawData }) {
  const data = useMemo(() => {
    return [
      {
        x: rawData.map((d) => d.x),
        y: rawData.map((d) => d.y),
        type: 'scatter',
      },
    ];
  }, [rawData]);

  return <Plot data={data} layout={layout} />;
}
```

### 5. Debounce Updates

For real-time data, debounce updates:

```typescript
import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

function RealTimeChart({ liveData }) {
  const [chartData, setChartData] = useState(liveData);

  useEffect(() => {
    const updateChart = debounce((newData) => {
      setChartData(newData);
    }, 500);

    updateChart(liveData);
  }, [liveData]);

  return <Plot data={chartData} layout={layout} />;
}
```

---

## Best Practices

### 1. Use Descriptive Titles and Labels

```typescript
const layout = {
  title: {
    text: 'Monthly Active Users by Region',
    font: { size: 20 },
  },
  xaxis: {
    title: 'Month',
  },
  yaxis: {
    title: 'Active Users',
  },
};
```

### 2. Choose Appropriate Chart Types

| Data Type | Recommended Chart |
|-----------|-------------------|
| Trends over time | Line chart |
| Comparisons | Bar chart |
| Proportions | Pie/Donut chart |
| Relationships | Scatter plot |
| Distributions | Histogram, Box plot |
| Hierarchies | Sunburst, Treemap |
| Geographic | Choropleth map |

### 3. Use Color Meaningfully

- **Consistent colors**: Same data = same color across charts
- **Accessible palettes**: Use colorblind-friendly palettes
- **Semantic colors**: Green = positive, Red = negative
- **Limit colors**: Max 5-7 distinct colors per chart

### 4. Provide Context

Add annotations for important events:

```typescript
const layout = {
  annotations: [
    {
      x: 'Feb',
      y: 150,
      text: 'Product Launch',
      showarrow: true,
      arrowhead: 2,
      ax: 0,
      ay: -40,
    },
  ],
};
```

### 5. Make Charts Responsive

```typescript
const layout = {
  autosize: true,
  margin: { t: 50, r: 50, b: 50, l: 50 },
};

<Plot
  data={data}
  layout={layout}
  useResizeHandler={true}
  style={{ width: '100%', height: '100%' }}
/>
```

### 6. Handle Empty Data

```typescript
function SafeChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return <Plot data={data} layout={layout} />;
}
```

### 7. Export Charts

Enable export functionality:

```typescript
const config = {
  toImageButtonOptions: {
    format: 'png', // 'png', 'svg', 'jpeg', 'webp'
    filename: 'chart',
    height: 600,
    width: 1000,
    scale: 2, // Higher scale = higher resolution
  },
};

<Plot data={data} layout={layout} config={config} />
```

---

## Advanced Examples

### Dual Y-Axes (Combo Chart)

```typescript
const data = [
  {
    x: ['Jan', 'Feb', 'Mar', 'Apr'],
    y: [100, 120, 140, 160],
    type: 'bar',
    name: 'Revenue',
    yaxis: 'y',
  },
  {
    x: ['Jan', 'Feb', 'Mar', 'Apr'],
    y: [1000, 1100, 1200, 1300],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Users',
    yaxis: 'y2',
  },
];

const layout = {
  title: 'Revenue vs Users',
  yaxis: {
    title: 'Revenue ($K)',
  },
  yaxis2: {
    title: 'Users',
    overlaying: 'y',
    side: 'right',
  },
};
```

### Animated Charts

```typescript
const frames = [
  {
    name: 'frame1',
    data: [{ x: [1, 2, 3], y: [1, 2, 3] }],
  },
  {
    name: 'frame2',
    data: [{ x: [1, 2, 3], y: [2, 3, 4] }],
  },
];

const layout = {
  updatemenus: [
    {
      buttons: [
        {
          args: [null, { frame: { duration: 500 } }],
          label: 'Play',
          method: 'animate',
        },
      ],
    },
  ],
};

<Plot data={data} layout={layout} frames={frames} />
```

### Custom Colorscales

```typescript
const customColorscale = [
  [0, '#3b82f6'], // Blue
  [0.5, '#ffffff'], // White
  [1, '#ef4444'], // Red
];

const data = [
  {
    z: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    type: 'heatmap',
    colorscale: customColorscale,
  },
];
```

---

## Troubleshooting

### Chart Not Rendering

**Cause**: Missing dimensions.

**Solution**: Set explicit width/height:
```typescript
<Plot
  data={data}
  layout={layout}
  style={{ width: '100%', height: '400px' }}
/>
```

### Performance Issues

**Cause**: Too many data points.

**Solution**: Use WebGL mode (`scattergl`) or downsample data.

### Chart Not Responsive

**Cause**: Missing `useResizeHandler`.

**Solution**:
```typescript
<Plot
  data={data}
  layout={{ ...layout, autosize: true }}
  useResizeHandler={true}
  style={{ width: '100%' }}
/>
```

### Type Errors

**Cause**: Missing type definitions.

**Solution**: Install types:
```bash
pnpm add -D @types/react-plotly.js @types/plotly.js
```

---

## Related Documentation

- [Data Grids →](data-grids.md)
- [Multi-Tenancy →](multi-tenancy.md)

---

## Additional Resources

- [Plotly.js Documentation](https://plotly.com/javascript/)
- [Plotly React Component](https://plotly.com/javascript/react/)
- [Plotly Chart Examples](https://plotly.com/javascript/basic-charts/)
- [WebGL in Plotly](https://plotly.com/javascript/webgl-vs-svg/)
