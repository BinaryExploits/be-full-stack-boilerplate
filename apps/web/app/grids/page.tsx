"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { trpc } from "@repo/trpc/client";
import { useI18n } from "../hooks/useI18n";
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
import {
  Plus,
  Trash2,
  Download,
  RefreshCw,
  ChevronRight,
  Loader2,
  AlertCircle,
  Database,
} from "lucide-react";

const TAB_KEYS = [
  "crud-live",
  "global-crud-live",
  "crud",
  "global-crud",
  "tenants",
  "read-only",
  "advanced",
] as const;
type TabKey = (typeof TAB_KEYS)[number];

export default function GridsPage() {
  const { LL } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as TabKey | null;
  const activeTab =
    tabParam && TAB_KEYS.includes(tabParam) ? tabParam : "crud-live";

  const setActiveTab = useCallback(
    (key: TabKey) => {
      router.push(`/grids?tab=${key}`, { scroll: false });
    },
    [router],
  );

  const tabLabels: Record<TabKey, string> = {
    "crud-live": LL.Grids.tabCrudRecords(),
    "global-crud-live": LL.Grids.tabGlobalCrudRecords(),
    crud: LL.Grids.tabEditablePeople(),
    "global-crud": LL.Grids.tabBatchOps(),
    tenants: LL.Grids.tabTenants(),
    "read-only": LL.Grids.tabMetrics(),
    advanced: LL.Grids.tabTasks(),
  };

  const tabDescriptions: Record<TabKey, string> = {
    "crud-live": LL.Grids.descCrudLive(),
    "global-crud-live": LL.Grids.descGlobalCrudLive(),
    crud: LL.Grids.descCrud(),
    "global-crud": LL.Grids.descGlobalCrud(),
    tenants: LL.Grids.descTenants(),
    "read-only": LL.Grids.descReadOnly(),
    advanced: LL.Grids.descAdvanced(),
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {LL.Grids.title()}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {LL.Grids.descriptionPrefix()}{" "}
          <Badge variant="warning" className="text-[10px] align-middle">
            {LL.Grids.demo()}
          </Badge>{" "}
          {LL.Grids.descriptionMiddle()}{" "}
          <Badge variant="success" className="text-[10px] align-middle">
            {LL.Grids.live()}
          </Badge>{" "}
          {LL.Grids.descriptionSuffix()}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-white dark:bg-slate-800 p-1 mb-6 overflow-x-auto">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none ${
              activeTab === key
                ? "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
        {tabDescriptions[activeTab]}
      </p>

      {/* Panels */}
      {activeTab === "crud-live" && <CrudLiveGrid />}
      {activeTab === "global-crud-live" && <GlobalCrudLiveGrid />}
      {activeTab === "crud" && <CrudGrid />}
      {activeTab === "global-crud" && <GlobalCrudGrid />}
      {activeTab === "tenants" && <TenantsGrid />}
      {activeTab === "read-only" && <ReadOnlyGrid />}
      {activeTab === "advanced" && <AdvancedGrid />}
    </div>
  );
}

/* ================================================================== */
/* Live Crud Records — fetched from API via tRPC                      */
/* ================================================================== */
interface CrudRecord {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

function CrudLiveGrid() {
  const { LL } = useI18n();
  const query = trpc.crud.findAllPrisma.useQuery(
    {},
    { refetchOnWindowFocus: false },
  );

  const data: CrudRecord[] =
    (query.data as { cruds?: CrudRecord[] } | undefined)?.cruds ?? [];

  const columns: ColumnDef<CrudRecord, unknown>[] = [
    { accessorKey: "id", header: LL.Grids.colId(), cell: ReadOnlyCell },
    {
      accessorKey: "content",
      header: LL.Grids.colContent(),
      cell: ReadOnlyCell,
    },
    {
      accessorKey: "createdAt",
      header: LL.Grids.colCreatedAt(),
      cell: DateCell,
    },
    {
      accessorKey: "updatedAt",
      header: LL.Grids.colUpdatedAt(),
      cell: DateCell,
    },
  ];

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-gray-500 dark:text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{LL.Grids.loadingCrudRecords()}</span>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-red-600 dark:text-red-400">
        <AlertCircle className="h-5 w-5" />
        <span>{LL.Grids.failedToLoad({ message: query.error.message })}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="success">
          <Database className="h-3 w-3 mr-1 inline" />
          {LL.Grids.livePrisma()}
        </Badge>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {LL.Grids.recordCount({ count: data.length })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void query.refetch()}
          className="ml-auto"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`}
          />
          {LL.Common.refresh()}
        </Button>
      </div>
      <DataTable
        data={data}
        columns={columns}
        readOnly
        enableSearch
        enablePagination
        enableColumnVisibility
        zebraStripe
      />
    </div>
  );
}

/* ================================================================== */
/* Live Global Crud Records — fetched from API via tRPC               */
/* ================================================================== */
function GlobalCrudLiveGrid() {
  const { LL } = useI18n();
  const query = trpc.globalCrud.findAllPrisma.useQuery(
    {},
    { refetchOnWindowFocus: false },
  );

  const data: CrudRecord[] =
    (query.data as { items?: CrudRecord[] } | undefined)?.items ?? [];

  const columns: ColumnDef<CrudRecord, unknown>[] = [
    { accessorKey: "id", header: LL.Grids.colId(), cell: ReadOnlyCell },
    {
      accessorKey: "content",
      header: LL.Grids.colContent(),
      cell: ReadOnlyCell,
    },
    {
      accessorKey: "createdAt",
      header: LL.Grids.colCreatedAt(),
      cell: DateCell,
    },
    {
      accessorKey: "updatedAt",
      header: LL.Grids.colUpdatedAt(),
      cell: DateCell,
    },
  ];

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-gray-500 dark:text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{LL.Grids.loadingGlobalCrudRecords()}</span>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-red-600 dark:text-red-400">
        <AlertCircle className="h-5 w-5" />
        <span>{LL.Grids.failedToLoad({ message: query.error.message })}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="success">
          <Database className="h-3 w-3 mr-1 inline" />
          {LL.Grids.livePrisma()}
        </Badge>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {LL.Grids.recordCount({ count: data.length })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void query.refetch()}
          className="ml-auto"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`}
          />
          {LL.Common.refresh()}
        </Button>
      </div>
      <DataTable
        data={data}
        columns={columns}
        readOnly
        enableSearch
        enablePagination
        enableColumnVisibility
        zebraStripe
      />
    </div>
  );
}

/* ================================================================== */
/* Demo A — Editable People (Demo)                                    */
/* ================================================================== */
function CrudGrid() {
  const { LL } = useI18n();
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
    {
      accessorKey: "firstName",
      header: LL.Grids.colFirstName(),
      cell: EditableCell,
    },
    {
      accessorKey: "lastName",
      header: LL.Grids.colLastName(),
      cell: EditableCell,
    },
    { accessorKey: "email", header: LL.Grids.colEmail(), cell: EditableCell },
    {
      accessorKey: "role",
      header: LL.Grids.colRole(),
      cell: SelectCell,
      meta: { selectOptions: ["Admin", "User", "Editor", "Viewer"] },
    },
    {
      accessorKey: "status",
      header: LL.Grids.colStatus(),
      cell: BadgeCell,
      meta: {
        badgeVariantMap: {
          Active: "success",
          Inactive: "warning",
          Suspended: "destructive",
        },
      },
    },
    { accessorKey: "createdAt", header: LL.Grids.colCreated(), cell: DateCell },
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
        <Badge variant="warning">{LL.Grids.demoInMemory()}</Badge>
        <div className="flex items-center gap-2">
          {modified && (
            <Badge variant="warning">{LL.Grids.unsavedChanges()}</Badge>
          )}
          <Button variant="secondary" size="sm" onClick={handleAdd}>
            <Plus className="h-3.5 w-3.5" />
            {LL.Grids.addRow()}
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
/* Demo B — Batch Operations (Demo)                                   */
/* ================================================================== */
function GlobalCrudGrid() {
  const { LL } = useI18n();
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
          className="rounded border-gray-300 dark:border-slate-500 bg-gray-100 dark:bg-slate-700"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300 dark:border-slate-500 bg-gray-100 dark:bg-slate-700"
          aria-label={`Select row ${row.index + 1}`}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "firstName",
      header: LL.Grids.colFirstName(),
      cell: EditableCell,
    },
    {
      accessorKey: "lastName",
      header: LL.Grids.colLastName(),
      cell: EditableCell,
    },
    { accessorKey: "email", header: LL.Grids.colEmail(), cell: EditableCell },
    {
      accessorKey: "role",
      header: LL.Grids.colRole(),
      cell: SelectCell,
      meta: { selectOptions: ["Admin", "User", "Editor", "Viewer"] },
    },
    {
      accessorKey: "status",
      header: LL.Grids.colStatus(),
      cell: BadgeCell,
      meta: {
        badgeVariantMap: {
          Active: "success",
          Inactive: "warning",
          Suspended: "destructive",
        },
      },
    },
    { accessorKey: "createdAt", header: LL.Grids.colCreated(), cell: DateCell },
  ];

  const selectedCount = Object.keys(selectedIds).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Badge variant="warning">{LL.Grids.demoInMemory()}</Badge>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-slate-300">
              {LL.Grids.selectedCount({ count: selectedCount })}
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              {LL.Grids.deleteSelected()}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => console.log("Export selected")}
            >
              <Download className="h-3.5 w-3.5" />
              {LL.Grids.export()}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => console.log("Change status")}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {LL.Grids.changeStatus()}
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
/* Demo C — Tenants (Demo)                                            */
/* ================================================================== */
function TenantsGrid() {
  const { LL } = useI18n();
  const groupedByPlan = ["Enterprise", "Pro", "Free"] as const;

  const tenantColumns: ColumnDef<TenantRow, unknown>[] = [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => row.toggleExpanded()}
          className="p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Expand row"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? "rotate-90" : ""}`}
          />
        </button>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "tenantName",
      header: LL.Grids.colTenantName(),
      cell: ReadOnlyCell,
    },
    {
      accessorKey: "plan",
      header: LL.Grids.colPlan(),
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
      header: LL.Grids.colUsers(),
      cell: (props) => (
        <span className="tabular-nums">
          {(props.getValue() as number).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "storageUsed",
      header: LL.Grids.colStorage(),
      cell: ReadOnlyCell,
    },
    {
      accessorKey: "status",
      header: LL.Grids.colStatus(),
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
    { accessorKey: "region", header: LL.Grids.colRegion(), cell: ReadOnlyCell },
    { accessorKey: "createdAt", header: LL.Grids.colCreated(), cell: DateCell },
    {
      id: "actions",
      header: "",
      cell: RowActionsCell,
      enableSorting: false,
    },
  ];

  return (
    <div>
      <Badge variant="warning" className="mb-3">
        {LL.Grids.demoDummyDataCount({ count: tenants.length })}
      </Badge>
      {groupedByPlan.map((plan) => {
        const planTenants = tenants.filter((t) => t.plan === plan);
        return (
          <Disclosure key={plan} defaultOpen>
            {({ open }) => (
              <div className="mb-4">
                <DisclosureButton className="flex w-full items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
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
                      <div className="bg-gray-50 dark:bg-slate-800/60 p-4 text-xs text-gray-600 dark:text-slate-300">
                        <p className="font-medium text-gray-900 dark:text-white mb-2">
                          {LL.Grids.usersIn({ name: tenant.tenantName })}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from(
                            { length: Math.min(tenant.usersCount, 6) },
                            (_, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 rounded bg-gray-50 dark:bg-slate-700/50 px-2 py-1"
                              >
                                <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-slate-600" />
                                <span>{LL.Grids.userN({ n: i + 1 })}</span>
                              </div>
                            ),
                          )}
                          {tenant.usersCount > 6 && (
                            <span className="text-gray-400 dark:text-slate-500 self-center">
                              {LL.Grids.moreUsers({
                                count: tenant.usersCount - 6,
                              })}
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
/* Demo D — Metrics (Demo)                                            */
/* ================================================================== */
function ReadOnlyGrid() {
  const { LL } = useI18n();
  const columns: ColumnDef<Metric, unknown>[] = [
    { accessorKey: "metric", header: LL.Grids.colMetric(), cell: ReadOnlyCell },
    {
      accessorKey: "value",
      header: LL.Grids.colValue(),
      cell: (props) => {
        const v = props.getValue() as number;
        return (
          <span className="text-right tabular-nums font-medium block">
            {v.toLocaleString()}
          </span>
        );
      },
    },
    { accessorKey: "change", header: LL.Grids.colChange(), cell: DeltaCell },
    { accessorKey: "period", header: LL.Grids.colPeriod(), cell: ReadOnlyCell },
    {
      accessorKey: "category",
      header: LL.Grids.colCategory(),
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
        {LL.Grids.demoDummyData()}
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
/* Demo E — Tasks (Demo)                                              */
/* ================================================================== */
function AdvancedGrid() {
  const { LL } = useI18n();
  const today = new Date("2026-02-19");

  const columns: ColumnDef<Task, unknown>[] = [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => row.toggleExpanded()}
          className="p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Expand details"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? "rotate-90" : ""}`}
          />
        </button>
      ),
      enableSorting: false,
    },
    { accessorKey: "name", header: LL.Grids.colTask(), cell: ReadOnlyCell },
    { accessorKey: "tags", header: LL.Grids.colTags(), cell: TagsCell },
    {
      accessorKey: "assignedTo",
      header: LL.Grids.colAssignedTo(),
      cell: AvatarCell,
    },
    {
      accessorKey: "priority",
      header: LL.Grids.colPriority(),
      cell: PriorityCell,
    },
    { accessorKey: "dueDate", header: LL.Grids.colDueDate(), cell: DateCell },
    {
      accessorKey: "completedAt",
      header: LL.Grids.colCompleted(),
      cell: (props) => {
        const val = props.getValue() as string | null;
        return val ? (
          <Badge variant="success">{LL.Grids.done()}</Badge>
        ) : (
          <Badge variant="default">{LL.Grids.open()}</Badge>
        );
      },
    },
  ];

  return (
    <div>
      <Badge variant="warning" className="mb-3">
        {LL.Grids.demoDummyData()}
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
              className={`p-4 text-sm ${isOverdue ? "bg-red-50 dark:bg-red-900/10 border-l-2 border-red-200 dark:border-red-500" : "bg-gray-50 dark:bg-slate-800/40"}`}
            >
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                {task.name}
              </p>
              <p className="text-gray-500 dark:text-slate-400 text-xs">
                {LL.Grids.assignedToLabel({ name: task.assignedTo })} &middot;{" "}
                {LL.Grids.priorityLabel({ value: task.priority })} &middot;{" "}
                {LL.Grids.dueLabel({
                  date: new Date(task.dueDate).toLocaleDateString(),
                })}
                {isOverdue && (
                  <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                    {LL.Grids.overdue()}
                  </span>
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
