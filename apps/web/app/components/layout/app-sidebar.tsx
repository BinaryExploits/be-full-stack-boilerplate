"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from "@headlessui/react";
import {
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { navSections, type NavItem } from "./sidebar-nav-items";
import { useAuthClient } from "../../lib/auth/auth-client";
import { Avatar } from "../ui/avatar";

const STORAGE_KEY = "sidebar-collapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;
  const user = session?.user;

  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {
      /* noop */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.includes("?")) {
      return currentUrl === href;
    }
    if (href.includes("#")) {
      return pathname === href.split("#")[0];
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isGroupActive(item: NavItem) {
    if (isActive(item.href)) return true;
    return item.children?.some((child) => isActive(child.href)) ?? false;
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 border-r border-slate-700/50">
      {/* Collapse toggle */}
      <div
        className={`hidden lg:flex items-center px-3 py-2 border-b border-slate-700/50 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </span>
        )}
        <button
          onClick={toggleCollapsed}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile close button */}
      <div className="flex items-center justify-end px-2 py-2 border-b border-slate-700/50 lg:hidden">
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav content */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) =>
                item.children ? (
                  <CollapsibleNavItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    isActive={isActive}
                    isGroupActive={isGroupActive}
                  />
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-lg px-2 py-1.5 text-sm transition-colors ${
                        collapsed ? "justify-center" : "gap-2"
                      } ${
                        isActive(item.href)
                          ? "bg-slate-700/60 font-medium text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                      aria-label={item.label}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — user info */}
      {user && (
        <div className="border-t border-slate-700/50 p-3">
          <div className="flex items-center gap-2">
            <Avatar
              src={user.image ?? undefined}
              alt={user.name ?? user.email ?? "User"}
              size="sm"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">
                  {user.name ?? "User"}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {user.email}
                </p>
              </div>
            )}
            <button
              onClick={() => void authClient?.signOut?.()}
              className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-red-400"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger — positioned below the top navbar */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-16 z-50 rounded-lg bg-slate-800 p-2 text-slate-300 shadow-lg hover:bg-slate-700 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      <Dialog
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 transition-opacity" />
        <div className="fixed inset-0 top-14 flex">
          <DialogPanel className="relative w-64 max-w-[80vw] transition-transform">
            {sidebarContent}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop sidebar — sits below the top navbar */}
      <aside
        className={`hidden lg:flex lg:shrink-0 transition-all duration-200 ${collapsed ? "w-16" : "w-64"}`}
      >
        <div
          className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] ${collapsed ? "w-16" : "w-64"} transition-all duration-200`}
        >
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}

function CollapsibleNavItem({
  item,
  collapsed,
  isActive,
  isGroupActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  isGroupActive: (item: NavItem) => boolean;
}) {
  const active = isGroupActive(item);

  if (collapsed) {
    return (
      <li>
        <Link
          href={item.href}
          className={`flex items-center justify-center rounded-lg px-2 py-1.5 transition-colors ${
            active
              ? "bg-slate-700/60 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
          aria-label={item.label}
        >
          <item.icon className="h-4 w-4" />
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Disclosure defaultOpen={active}>
        {({ open }) => (
          <Fragment>
            <div className="flex items-center">
              <Link
                href={item.href}
                className={`flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-slate-700/60 font-medium text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
              <DisclosureButton
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label={`Toggle ${item.label} submenu`}
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-90" : ""}`}
                />
              </DisclosureButton>
            </div>
            <DisclosurePanel className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-700/50 pl-2">
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block rounded-lg px-2 py-1 text-xs transition-colors ${
                    isActive(child.href)
                      ? "font-medium text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </DisclosurePanel>
          </Fragment>
        )}
      </Disclosure>
    </li>
  );
}
