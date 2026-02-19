"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/grid/data-table";
import {
  EditableCell,
  SelectCell,
  BadgeCell,
  DateCell,
  ActionCell,
  ReadOnlyCell,
  DeltaCell,
  TagsCell,
  AvatarCell,
  PriorityCell,
  RowActionsCell,
} from "../components/grid/cell-renderers";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  people as initialPeople,
  records as initialRecords,
  tenants,
  metrics,
  tasks,
  type Person,
  type TenantRow,
  type Metric,
  type Task,
} from "./_data/mock-data";
import { Plus, Trash2, Download, RefreshCw, ChevronRight } from "lucide-react";

const TAB_KEYS = [
  "crud",
  "global-crud",
  "tenants",
  "read-only",
  "advanced",
] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TAB_LABELS: Record<TabKey, string> = {
  crud: "Crud Records",
  "global-crud": "Global Crud Records",
  tenants: "Tenants",
  "read-only": "Metrics (Demo)",
  advanced: "Tasks (Demo)",
};

const TAB_DESCRIPTIONS: Record<TabKey, string> = {
  crud: "Editable grid showing Crud entity records. Uses the same shape as the app's tenant-scoped CRUD model.",
  "global-crud":
    "Bulk operations on Global Crud records. Row selection, multi-sort, and batch actions.",
  tenants:
    "Tenant management view grouped by plan tier. Uses the app's Tenant model shape.",
  "read-only":
    "Read-only analytics metrics. Demo data — numbers are illustrative, not from a live API.",
  advanced:
    "Rich cell renderers with tags, avatars, priority icons, and expandable details. Demo data.",
};

export default function GridsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as TabKey | null;
  const activeTab = tabParam && TAB_KEYS.includes(tabParam) ? tabParam : "crud";

  const setActiveTab = useCallback(
    (key: TabKey) => {
      router.push(`/grids?tab=${key}`, { scroll: false });
    },
    [router],
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Data Grids</h1>
        <p className="text-sm text-slate-400 mt-1">
          Grid scenarios powered by TanStack Table v8. Grids marked{" "}
          <Badge variant="info" className="text-[10px] align-middle">
            Demo
          </Badge>{" "}
          use illustrative dummy data.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-slate-800 p-1 mb-6 overflow-x-auto">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none ${
              activeTab === key
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-3">
        {TAB_DESCRIPTIONS[activeTab]}
      </p>

      {/* Panels */}
      {activeTab === "crud" && <CrudGrid />}
      {activeTab === "global-crud" && <GlobalCrudGrid />}
      {activeTab === "tenants" && <TenantsGrid />}
      {activeTab === "read-only" && <ReadOnlyGrid />}
      {activeTab === "advanced" && <AdvancedGrid />}
    </div>
  );
}

/* ================================================================== */
/* Scenario A — CRUD Records (Fully Editable)                         */
/* ================================================================== */
function CrudGrid() {
  const [data, setData] = useState<Person[]>(() => [...initialPeople]);
  const [modified, setModified] = useState(false);

  const handleUpdate = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      setData((prev) =>
        prev.map((row, i) =>
          i === rowIndex ? { ...row, [columnId]: value } : row,
        ),
      );
      setModified(true);
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    setData((prev) => prev.filter((r) => r.id !== id));
    setModified(true);
  }, []);

  const handleAdd = useCallback(() => {
    const newId = `p${Date.now()}`;
    setData((prev) => [
      ...prev,
      {
        id: newId,
        firstName: "",
        lastName: "",
        email: "",
        role: "User",
        status: "Active",
        createdAt: new Date().toISOString().split("T")[0]!,
      },
    ]);
    setModified(true);
  }, []);

  const columns: ColumnDef<Person, unknown>[] = [
    { accessorKey: "firstName", header: "First Name", cell: EditableCell },
    { accessorKey: "lastName", header: "Last Name", cell: EditableCell },
    { accessorKey: "email", header: "Email", cell: EditableCell },
    {
      accessorKey: "role",
      header: "Role",
      cell: SelectCell,
      meta: { selectOptions: ["Admin", "User", "Editor", "Viewer"] },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: BadgeCell,
      meta: {
        badgeVariantMap: {
          Active: "success",
          Inactive: "warning",
          Suspended: "destructive",
        },
      },
    },
    { accessorKey: "createdAt", header: "Created", cell: DateCell },
    {
      id: "actions",
      header: "",
      cell: ActionCell,
      enableSorting: false,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Badge variant="info">
          Modeled after Crud entity ({data.length} records)
        </Badge>
        <div className="flex items-center gap-2">
          {modified && <Badge variant="warning">Unsaved changes</Badge>}
          <Button variant="secondary" size="sm" onClick={handleAdd}>
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </Button>
        </div>
      </div>
      <DataTable
        data={data}
        columns={columns}
        onRowUpdate={handleUpdate}
        onRowDelete={handleDelete}
        enableSearch
        enablePagination
        enableColumnVisibility
      />
    </div>
  );
}

/* ================================================================== */
/* Scenario B — Global CRUD Records (Multi-record batch operations)   */
/* ================================================================== */
function GlobalCrudGrid() {
  const [data, setData] = useState<Person[]>(() => [...initialRecords]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleUpdate = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      setData((prev) =>
        prev.map((row, i) =>
          i === rowIndex ? { ...row, [columnId]: value } : row,
        ),
      );
    },
    [],
  );

  const handleBulkDelete = useCallback(() => {
    setData((prev) => prev.filter((_, i) => !selectedIds.has(String(i))));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const columns: ColumnDef<Person, unknown>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-slate-500 bg-slate-700"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-slate-500 bg-slate-700"
          aria-label={`Select row ${row.index + 1}`}
        />
      ),
      enableSorting: false,
    },
    { accessorKey: "firstName", header: "First Name", cell: EditableCell },
    { accessorKey: "lastName", header: "Last Name", cell: EditableCell },
    { accessorKey: "email", header: "Email", cell: EditableCell },
    {
      accessorKey: "role",
      header: "Role",
      cell: SelectCell,
      meta: { selectOptions: ["Admin", "User", "Editor", "Viewer"] },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: BadgeCell,
      meta: {
        badgeVariantMap: {
          Active: "success",
          Inactive: "warning",
          Suspended: "destructive",
        },
      },
    },
    { accessorKey: "createdAt", header: "Created", cell: DateCell },
  ];

  const selectedCount = Object.keys(selectedIds).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Badge variant="info">
          Modeled after GlobalCrud entity ({data.length} records)
        </Badge>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              {selectedCount} selected
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => console.log("Export selected")}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => console.log("Change status")}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Change Status
            </Button>
          </div>
        )}
      </div>
      <DataTable
        data={data}
        columns={columns}
        onRowUpdate={handleUpdate}
        enableSearch
        enablePagination
        enableColumnVisibility
        enableRowSelection
      />
    </div>
  );
}

/* ================================================================== */
/* Scenario C — Tenants Grid (Grouped / Nested, Read-Only)            */
/* ================================================================== */
function TenantsGrid() {
  const groupedByPlan = ["Enterprise", "Pro", "Free"] as const;

  const tenantColumns: ColumnDef<TenantRow, unknown>[] = [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => row.toggleExpanded()}
          className="p-1 text-slate-400 hover:text-white"
          aria-label="Expand row"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? "rotate-90" : ""}`}
          />
        </button>
      ),
      enableSorting: false,
    },
    { accessorKey: "tenantName", header: "Tenant Name", cell: ReadOnlyCell },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: BadgeCell,
      meta: {
        badgeVariantMap: {
          Free: "default",
          Pro: "info",
          Enterprise: "success",
        },
      },
    },
    {
      accessorKey: "usersCount",
      header: "Users",
      cell: (props) => (
        <span className="tabular-nums">
          {(props.getValue() as number).toLocaleString()}
        </span>
      ),
    },
    { accessorKey: "storageUsed", header: "Storage", cell: ReadOnlyCell },
    {
      accessorKey: "status",
      header: "Status",
      cell: BadgeCell,
      meta: {
        badgeVariantMap: {
          Active: "success",
          Trial: "warning",
          Suspended: "destructive",
          Inactive: "default",
        },
      },
    },
    { accessorKey: "region", header: "Region", cell: ReadOnlyCell },
    { accessorKey: "createdAt", header: "Created", cell: DateCell },
    {
      id: "actions",
      header: "",
      cell: RowActionsCell,
      enableSorting: false,
    },
  ];

  return (
    <div>
      <Badge variant="info" className="mb-3">
        Modeled after Tenant entity ({tenants.length} records)
      </Badge>
      {groupedByPlan.map((plan) => {
        const planTenants = tenants.filter((t) => t.plan === plan);
        return (
          <Disclosure key={plan} defaultOpen>
            {({ open }) => (
              <div className="mb-4">
                <DisclosureButton className="flex w-full items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
                  />
                  {plan}
                  <Badge variant="default" className="ml-2">
                    {planTenants.length}
                  </Badge>
                </DisclosureButton>
                <DisclosurePanel className="mt-1">
                  <DataTable
                    data={planTenants}
                    columns={tenantColumns}
                    readOnly
                    enableExpanding
                    renderSubRow={(tenant) => (
                      <div className="bg-slate-800/60 p-4 text-xs text-slate-300">
                        <p className="font-medium text-white mb-2">
                          Users in {tenant.tenantName}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from(
                            { length: Math.min(tenant.usersCount, 6) },
                            (_, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 rounded bg-slate-700/50 px-2 py-1"
                              >
                                <div className="h-5 w-5 rounded-full bg-slate-600" />
                                <span>User {i + 1}</span>
                              </div>
                            ),
                          )}
                          {tenant.usersCount > 6 && (
                            <span className="text-slate-500 self-center">
                              +{tenant.usersCount - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    enableSearch
                  />
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/* Scenario D — Read-Only Grid (Display / Report)                     */
/* ================================================================== */
function ReadOnlyGrid() {
  const columns: ColumnDef<Metric, unknown>[] = [
    { accessorKey: "metric", header: "Metric", cell: ReadOnlyCell },
    {
      accessorKey: "value",
      header: "Value",
      cell: (props) => {
        const v = props.getValue() as number;
        return (
          <span className="text-right tabular-nums font-medium block">
            {v.toLocaleString()}
          </span>
        );
      },
    },
    { accessorKey: "change", header: "Change", cell: DeltaCell },
    { accessorKey: "period", header: "Period", cell: ReadOnlyCell },
    {
      accessorKey: "category",
      header: "Category",
      cell: BadgeCell,
      meta: {
        badgeVariantMap: {
          Traffic: "info",
          Revenue: "success",
          Engagement: "warning",
          Retention: "default",
          Support: "destructive",
          Infrastructure: "default",
          Performance: "info",
          Growth: "success",
          Satisfaction: "warning",
          Product: "info",
        },
      },
    },
  ];

  return (
    <div>
      <Badge variant="warning" className="mb-3">
        Demo data — not from a live API
      </Badge>
      <DataTable
        data={metrics}
        columns={columns}
        readOnly
        enableSearch
        enablePagination
        zebraStripe
      />
    </div>
  );
}

/* ================================================================== */
/* Scenario E — Advanced / Multi-Select Grid                          */
/* ================================================================== */
function AdvancedGrid() {
  const today = new Date("2026-02-19");

  const columns: ColumnDef<Task, unknown>[] = [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => row.toggleExpanded()}
          className="p-1 text-slate-400 hover:text-white"
          aria-label="Expand details"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? "rotate-90" : ""}`}
          />
        </button>
      ),
      enableSorting: false,
    },
    { accessorKey: "name", header: "Task", cell: ReadOnlyCell },
    { accessorKey: "tags", header: "Tags", cell: TagsCell },
    { accessorKey: "assignedTo", header: "Assigned To", cell: AvatarCell },
    { accessorKey: "priority", header: "Priority", cell: PriorityCell },
    { accessorKey: "dueDate", header: "Due Date", cell: DateCell },
    {
      accessorKey: "completedAt",
      header: "Completed",
      cell: (props) => {
        const val = props.getValue() as string | null;
        return val ? (
          <Badge variant="success">Done</Badge>
        ) : (
          <Badge variant="default">Open</Badge>
        );
      },
    },
  ];

  return (
    <div>
      <Badge variant="warning" className="mb-3">
        Demo data — not from a live API
      </Badge>
      <DataTable
        data={tasks}
        columns={columns}
        readOnly
        enableSearch
        enablePagination
        enableExpanding
        renderSubRow={(task) => {
          const isOverdue = !task.completedAt && new Date(task.dueDate) < today;
          return (
            <div
              className={`p-4 text-sm ${isOverdue ? "bg-red-900/10 border-l-2 border-red-500" : "bg-slate-800/40"}`}
            >
              <p className="font-medium text-white mb-1">{task.name}</p>
              <p className="text-slate-400 text-xs">
                Assigned to {task.assignedTo} &middot; Priority: {task.priority}{" "}
                &middot; Due: {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && (
                  <span className="ml-2 text-red-400 font-medium">OVERDUE</span>
                )}
              </p>
              <div className="flex gap-1 mt-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="info" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
