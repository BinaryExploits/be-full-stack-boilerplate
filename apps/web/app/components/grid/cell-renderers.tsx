"use client";

import { useState, useCallback } from "react";
import type { CellContext } from "@tanstack/react-table";
import { Badge, type BadgeVariant } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { Trash2, MoreHorizontal, Eye, Edit3, Ban } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Extended column meta for renderer dispatch                         */
/* ------------------------------------------------------------------ */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    readOnly?: boolean;
    type?:
      | "text"
      | "select"
      | "number"
      | "date"
      | "badge"
      | "avatar"
      | "priority"
      | "tags"
      | "actions";
    selectOptions?: string[];
    badgeVariantMap?: Record<string, BadgeVariant>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    deleteRow?: (rowId: string) => void;
  }
}

/* ------------------------------------------------------------------ */
/* Read-only cell                                                     */
/* ------------------------------------------------------------------ */
export function ReadOnlyCell<T>({ getValue }: CellContext<T, unknown>) {
  const val = getValue();
  return <span>{val != null ? `${val as string | number}` : ""}</span>;
}

/* ------------------------------------------------------------------ */
/* Editable text cell                                                 */
/* ------------------------------------------------------------------ */
export function EditableCell<T>({
  getValue,
  row,
  column,
  table,
}: CellContext<T, unknown>) {
  const initialValue = getValue() as string;
  const [value, setValue] = useState(initialValue);

  const onBlur = useCallback(() => {
    if (value !== initialValue) {
      table.options.meta?.updateData?.(row.index, column.id, value);
    }
  }, [value, initialValue, table, row.index, column.id]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-gray-700 dark:text-slate-200 text-sm py-0.5"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Number cell (editable)                                             */
/* ------------------------------------------------------------------ */
export function NumberCell<T>({
  getValue,
  row,
  column,
  table,
}: CellContext<T, unknown>) {
  const initialValue = getValue() as number;
  const [value, setValue] = useState(String(initialValue));
  const isReadOnly = column.columnDef.meta?.readOnly;

  if (isReadOnly) {
    return (
      <span className="text-right tabular-nums">
        {typeof initialValue === "number"
          ? initialValue.toLocaleString()
          : String(initialValue ?? "")}
      </span>
    );
  }

  const onBlur = () => {
    const numVal = Number(value);
    if (!isNaN(numVal) && numVal !== initialValue) {
      table.options.meta?.updateData?.(row.index, column.id, numVal);
    }
  };

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      type="number"
      className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-gray-700 dark:text-slate-200 text-sm py-0.5 text-right tabular-nums"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Select cell                                                        */
/* ------------------------------------------------------------------ */
export function SelectCell<T>({
  getValue,
  row,
  column,
  table,
}: CellContext<T, unknown>) {
  const value = getValue() as string;
  const options = column.columnDef.meta?.selectOptions ?? [];

  return (
    <select
      value={value}
      onChange={(e) =>
        table.options.meta?.updateData?.(row.index, column.id, e.target.value)
      }
      className="w-full bg-white text-gray-700 dark:bg-slate-800 dark:text-slate-200 text-sm rounded border border-gray-300 dark:border-slate-600 py-0.5 px-1 outline-none focus:border-blue-400"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* Badge cell                                                         */
/* ------------------------------------------------------------------ */
export function BadgeCell<T>({ getValue, column }: CellContext<T, unknown>) {
  const raw = getValue();
  const val = raw != null ? `${raw as string | number}` : "";
  const variantMap = column.columnDef.meta?.badgeVariantMap ?? {};
  const variant = variantMap[val] ?? "default";

  return <Badge variant={variant}>{val}</Badge>;
}

/* ------------------------------------------------------------------ */
/* Date display cell                                                  */
/* ------------------------------------------------------------------ */
export function DateCell<T>({ getValue }: CellContext<T, unknown>) {
  const val = getValue();
  if (!val) return <span className="text-gray-400 dark:text-slate-500">—</span>;
  const date = val instanceof Date ? val : new Date(val as string | number);
  return (
    <span className="text-sm tabular-nums text-gray-600 dark:text-slate-300">
      {date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar + name cell                                                 */
/* ------------------------------------------------------------------ */
export function AvatarCell<T>({ getValue }: CellContext<T, unknown>) {
  const raw = getValue();
  const val = raw != null ? `${raw as string}` : "";
  return (
    <div className="flex items-center gap-2">
      <Avatar alt={val} size="sm" />
      <span className="text-sm">{val}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Priority cell                                                      */
/* ------------------------------------------------------------------ */
const priorityConfig: Record<string, { icon: string; className: string }> = {
  High: { icon: "🔴", className: "text-red-400" },
  Medium: { icon: "🟡", className: "text-amber-400" },
  Low: { icon: "🟢", className: "text-emerald-400" },
};

export function PriorityCell<T>({ getValue }: CellContext<T, unknown>) {
  const raw = getValue();
  const val = raw != null ? `${raw as string}` : "";
  const cfg = priorityConfig[val];
  return (
    <span
      className={`flex items-center gap-1.5 text-sm ${cfg?.className ?? ""}`}
    >
      <span>{cfg?.icon ?? "⚪"}</span>
      {val}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tags / chips cell                                                  */
/* ------------------------------------------------------------------ */
export function TagsCell<T>({ getValue }: CellContext<T, unknown>) {
  const tags = getValue() as string[] | undefined;
  if (!tags?.length)
    return <span className="text-gray-400 dark:text-slate-500">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="info" className="text-[10px]">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Action cell (delete / row actions)                                 */
/* ------------------------------------------------------------------ */
export function ActionCell<T>({ row, table }: CellContext<T, unknown>) {
  const id = (row.original as Record<string, unknown>).id as string | undefined;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => id && table.options.meta?.deleteRow?.(id)}
        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
        aria-label="Delete row"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row action menu cell (view / edit / suspend)                       */
/* ------------------------------------------------------------------ */
export function RowActionsCell<T>({ row }: CellContext<T, unknown>) {
  const [open, setOpen] = useState(false);
  const name =
    (row.original as Record<string, unknown>).tenantName ??
    (row.original as Record<string, unknown>).name ??
    "row";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-800 shadow-xl py-1">
          <button
            onClick={() => {
              console.log("View:", name);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Eye className="h-3.5 w-3.5" /> View Details
          </button>
          <button
            onClick={() => {
              console.log("Edit:", name);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => {
              console.log("Suspend:", name);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-slate-700"
          >
            <Ban className="h-3.5 w-3.5" /> Suspend
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Delta / change cell (for read-only grid)                           */
/* ------------------------------------------------------------------ */
export function DeltaCell<T>({ getValue }: CellContext<T, unknown>) {
  const val = getValue() as number;
  if (val == null)
    return <span className="text-gray-400 dark:text-slate-500">—</span>;
  const isPositive = val > 0;
  const isZero = val === 0;
  return (
    <span
      className={`text-sm font-medium tabular-nums ${isZero ? "text-gray-400 dark:text-slate-400" : isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
    >
      {isPositive ? "↑" : isZero ? "—" : "↓"} {Math.abs(val).toFixed(1)}%
    </span>
  );
}
