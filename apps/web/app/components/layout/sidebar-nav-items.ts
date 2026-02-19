import type { LucideIcon } from "lucide-react";
import {
  Home,
  Database,
  Globe,
  LayoutGrid,
  BarChart3,
  Building2,
  Users,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

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

export const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "CRUD Demo", href: "/crud-demo", icon: Database },
      { label: "Global CRUD Demo", href: "/global-crud-demo", icon: Globe },
    ],
  },
  {
    title: "Data",
    items: [
      {
        label: "Grids",
        href: "/grids",
        icon: LayoutGrid,
        children: [
          { label: "CRUD Grid", href: "/grids?tab=crud", icon: LayoutGrid },
          {
            label: "Global CRUD Grid",
            href: "/grids?tab=global-crud",
            icon: LayoutGrid,
          },
          {
            label: "Tenants Grid",
            href: "/grids?tab=tenants",
            icon: LayoutGrid,
          },
          {
            label: "Read-Only Grid",
            href: "/grids?tab=read-only",
            icon: LayoutGrid,
          },
          {
            label: "Advanced Grid",
            href: "/grids?tab=advanced",
            icon: LayoutGrid,
          },
        ],
      },
      {
        label: "Charts",
        href: "/charts",
        icon: BarChart3,
        children: [
          {
            label: "Overview Charts",
            href: "/charts#line-area",
            icon: BarChart3,
          },
          { label: "Time Series", href: "/charts#bar-column", icon: BarChart3 },
          {
            label: "Distribution Charts",
            href: "/charts#pie-donut",
            icon: BarChart3,
          },
          {
            label: "Comparative Charts",
            href: "/charts#scatter-bubble",
            icon: BarChart3,
          },
          {
            label: "3D & Advanced",
            href: "/charts#3d-charts",
            icon: BarChart3,
          },
        ],
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        label: "Tenant Dashboard",
        href: "/tenant-dashboard",
        icon: Building2,
      },
      { label: "Tenant Members", href: "/tenant-members", icon: Users },
      { label: "Auth Demo", href: "/auth-demo", icon: ShieldCheck },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Profile", href: "/profile", icon: UserCircle }],
  },
];
