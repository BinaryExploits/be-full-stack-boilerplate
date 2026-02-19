"use client";

import type { Table } from "@tanstack/react-table";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Search, Columns3 } from "lucide-react";

interface DataTableToolbarProps<T> {
  table: Table<T>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  enableSearch?: boolean;
  enableColumnVisibility?: boolean;
}

export function DataTableToolbar<T>({
  table,
  globalFilter,
  setGlobalFilter,
  enableSearch = true,
  enableColumnVisibility = false,
}: DataTableToolbarProps<T>) {
  return (
    <div className="flex items-center gap-3 mb-3">
      {enableSearch && (
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="w-full rounded-lg border border-slate-600 bg-slate-800 py-1.5 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-400"
          />
        </div>
      )}

      {enableColumnVisibility && (
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
            <Columns3 className="h-3.5 w-3.5" />
            Columns
          </MenuButton>
          <MenuItems className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-xl">
            {table.getAllLeafColumns().map((column) => {
              if (column.id === "select" || column.id === "actions")
                return null;
              return (
                <MenuItem key={column.id} as="div">
                  <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-slate-500 bg-slate-700"
                    />
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </label>
                </MenuItem>
              );
            })}
          </MenuItems>
        </Menu>
      )}
    </div>
  );
}
