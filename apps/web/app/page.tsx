"use client";

import Link from "next/link";
import {
  LayoutGrid,
  BarChart3,
  Database,
  Users,
  Building2,
  Globe,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { TenantDashboardOnly } from "./components/tenant-dashboard-only";
import { TenantAdminOnly } from "./components/tenant-admin-only";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";

const stats = [
  { label: "Total Records", value: "1,284", icon: Database, trend: "+12%" },
  { label: "Active Tenants", value: "47", icon: Building2, trend: "+3" },
  { label: "Users", value: "312", icon: Users, trend: "+8%" },
  { label: "API Endpoints", value: "24", icon: Globe, trend: "stable" },
];

const features = [
  {
    title: "Powerful Data Grids",
    description:
      "Editable, sortable, filterable tables for all your data. CRUD operations, bulk actions, nested rows, and multi-select — powered by TanStack Table.",
    icon: LayoutGrid,
    href: "/grids",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Rich Visualizations",
    description:
      "10+ chart types powered by Plotly.js with WebGL support. Line, bar, scatter, 3D surfaces, heatmaps, and more — all interactive and responsive.",
    icon: BarChart3,
    href: "/charts",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    title: "Multi-tenant Ready",
    description:
      "CRUD operations scoped per tenant with role-based read/write control. Manage tenants, members, and permissions from a single dashboard.",
    icon: Building2,
    href: "/tenant-dashboard",
    color: "from-amber-500 to-orange-600",
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero */}
      <section className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-cyan-400">
            <span className="text-xl font-bold text-slate-900">BE</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            BE: Tech Stack
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          Full-stack boilerplate with multi-tenancy, authentication, and CRUD
          operations. Explore the data grids and charting capabilities below.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/grids">
            <Button size="lg">
              <LayoutGrid className="h-4 w-4" />
              View Grids
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/charts">
            <Button variant="secondary" size="lg">
              <BarChart3 className="h-4 w-4" />
              View Charts
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="h-5 w-5 text-slate-400" />
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </span>
              </div>
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-0.5">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </section>

      {/* Feature Highlights */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Feature Highlights
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className="group h-full hover:border-slate-600 transition-all hover:-translate-y-0.5">
                <CardHeader>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} mb-2 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access (conditional) */}
      <section className="space-y-3">
        <TenantDashboardOnly>
          <Link
            href="/tenant-dashboard"
            className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:bg-slate-800 transition-colors"
          >
            <Building2 className="h-5 w-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Tenant Dashboard</p>
              <p className="text-xs text-slate-400">
                Manage platform tenants and subscriptions
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
          </Link>
        </TenantDashboardOnly>
        <TenantAdminOnly>
          <Link
            href="/tenant-members"
            className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:bg-slate-800 transition-colors"
          >
            <Users className="h-5 w-5 text-cyan-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Manage Members</p>
              <p className="text-xs text-slate-400">
                Add, remove, and manage tenant member roles
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
          </Link>
        </TenantAdminOnly>
      </section>
    </div>
  );
}
