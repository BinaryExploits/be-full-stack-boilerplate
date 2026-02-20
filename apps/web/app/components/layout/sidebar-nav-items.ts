import type { LucideIcon } from "lucide-react";
import {
  Home,
  Database,
  Globe,
  LayoutGrid,
  BarChart3,
  Building2,
  Users,
  UserCircle,
} from "lucide-react";
import type { TranslationFunctions } from "../../../i18n/i18n-types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function getNavSections(LL: TranslationFunctions): NavSection[] {
  return [
    {
      title: LL.Sidebar.sectionMain(),
      items: [
        { label: LL.Sidebar.home(), href: "/", icon: Home },
        { label: LL.Sidebar.crudDemo(), href: "/crud-demo", icon: Database },
        {
          label: LL.Sidebar.globalCrudDemo(),
          href: "/global-crud-demo",
          icon: Globe,
        },
      ],
    },
    {
      title: LL.Sidebar.sectionData(),
      items: [
        {
          label: LL.Sidebar.grids(),
          href: "/grids",
          icon: LayoutGrid,
          children: [
            {
              label: LL.Sidebar.crudRecords(),
              href: "/grids?tab=crud-live",
              icon: LayoutGrid,
            },
            {
              label: LL.Sidebar.globalCrudRecords(),
              href: "/grids?tab=global-crud-live",
              icon: LayoutGrid,
            },
            {
              label: LL.Sidebar.editablePeople(),
              href: "/grids?tab=crud",
              icon: LayoutGrid,
            },
            {
              label: LL.Sidebar.batchOps(),
              href: "/grids?tab=global-crud",
              icon: LayoutGrid,
            },
            {
              label: LL.Sidebar.tenantsDemo(),
              href: "/grids?tab=tenants",
              icon: LayoutGrid,
            },
            {
              label: LL.Sidebar.metricsDemo(),
              href: "/grids?tab=read-only",
              icon: LayoutGrid,
            },
            {
              label: LL.Sidebar.tasksDemo(),
              href: "/grids?tab=advanced",
              icon: LayoutGrid,
            },
          ],
        },
        {
          label: LL.Sidebar.charts(),
          href: "/charts",
          icon: BarChart3,
          children: [
            {
              label: LL.Sidebar.overviewCharts(),
              href: "/charts#line-area",
              icon: BarChart3,
            },
            {
              label: LL.Sidebar.timeSeries(),
              href: "/charts#bar-column",
              icon: BarChart3,
            },
            {
              label: LL.Sidebar.distributionCharts(),
              href: "/charts#pie-donut",
              icon: BarChart3,
            },
            {
              label: LL.Sidebar.comparativeCharts(),
              href: "/charts#scatter-bubble",
              icon: BarChart3,
            },
            {
              label: LL.Sidebar.threeDAdvanced(),
              href: "/charts#3d-charts",
              icon: BarChart3,
            },
          ],
        },
      ],
    },
    {
      title: LL.Sidebar.sectionPlatform(),
      items: [
        {
          label: LL.Sidebar.tenantDashboard(),
          href: "/tenant-dashboard",
          icon: Building2,
        },
        {
          label: LL.Sidebar.tenantMembers(),
          href: "/tenant-members",
          icon: Users,
        },
      ],
    },
    {
      title: LL.Sidebar.sectionAccount(),
      items: [
        { label: LL.Sidebar.profile(), href: "/profile", icon: UserCircle },
      ],
    },
  ];
}
