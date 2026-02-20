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
import { useI18n } from "./hooks/useI18n";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export default function Home() {
  const { LL } = useI18n();

  const stats: StatItem[] = [
    {
      label: LL.Home.totalRecords(),
      value: "1,284",
      icon: Database,
      trend: "+12%",
    },
    {
      label: LL.Home.activeTenants(),
      value: "47",
      icon: Building2,
      trend: "+3",
    },
    { label: LL.Home.users(), value: "312", icon: Users, trend: "+8%" },
    {
      label: LL.Home.apiEndpoints(),
      value: "24",
      icon: Globe,
      trend: LL.Home.stable(),
    },
  ];

  const features: FeatureItem[] = [
    {
      title: LL.Home.powerfulDataGrids(),
      description: LL.Home.powerfulDataGridsDesc(),
      icon: LayoutGrid,
      href: "/grids",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: LL.Home.richVisualizations(),
      description: LL.Home.richVisualizationsDesc(),
      icon: BarChart3,
      href: "/charts",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: LL.Home.multiTenantReady(),
      description: LL.Home.multiTenantReadyDesc(),
      icon: Building2,
      href: "/tenant-dashboard",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-cyan-400">
            <span className="text-xl font-bold text-slate-900">BE</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {LL.Home.heroTitle()}
          </h1>
        </div>
        <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          {LL.Home.heroDescription()}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/grids">
            <Button size="lg">
              <LayoutGrid className="h-4 w-4" />
              {LL.Home.viewGrids()}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/charts">
            <Button variant="secondary" size="lg">
              <BarChart3 className="h-4 w-4" />
              {LL.Home.viewCharts()}
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
                <stat.icon className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </section>

      {/* Feature Highlights */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {LL.Home.featureHighlights()}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className="group h-full hover:border-gray-300 dark:hover:border-slate-600 transition-all hover:-translate-y-0.5">
                <CardHeader>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} mb-2 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="h-5 w-5 text-gray-900 dark:text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
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
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 p-4 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Building2 className="h-5 w-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {LL.Home.tenantDashboard()}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {LL.Home.tenantDashboardDesc()}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 dark:text-slate-500" />
          </Link>
        </TenantDashboardOnly>
        <TenantAdminOnly>
          <Link
            href="/tenant-members"
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 p-4 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Users className="h-5 w-5 text-cyan-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {LL.Home.manageMembersTitle()}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {LL.Home.manageMembersQuickDesc()}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 dark:text-slate-500" />
          </Link>
        </TenantAdminOnly>
      </section>
    </div>
  );
}
