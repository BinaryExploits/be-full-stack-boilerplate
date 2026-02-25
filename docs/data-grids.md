# Data Grids

This boilerplate includes powerful data grids powered by **TanStack Table v8** with features like sorting, filtering, editing, bulk operations, and more.

---

## Table of Contents

- [Overview](#overview)
- [TanStack Table Features](#tanstack-table-features)
- [Built-in Grid Examples](#built-in-grid-examples)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Styling and Theming](#styling-and-theming)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)

---

## Overview

### What is TanStack Table?

**TanStack Table** (formerly React Table) is a headless UI library for building powerful tables and data grids. It provides:

- **Headless architecture**: Full control over rendering and styling
- **TypeScript-first**: Fully type-safe APIs
- **Framework agnostic**: Works with React, Vue, Solid, Svelte
- **Feature-rich**: Sorting, filtering, pagination, grouping, selection, and more
- **Virtualization support**: Handle thousands of rows efficiently
- **Tree data support**: Nested rows and expandable sections

### Why TanStack Table?

- **Flexibility**: Complete control over UI and behavior
- **Performance**: Optimized for large datasets
- **Type Safety**: Full TypeScript support with type inference
- **Extensibility**: Plugin-based architecture
- **Modern**: Built for modern React with hooks

---

## TanStack Table Features

The boilerplate includes examples of the following features:

### 1. Sorting

- **Single column sorting**: Click column header to sort
- **Multi-column sorting**: Hold Shift and click multiple headers
- **Custom sort functions**: Define how data should be sorted

### 2. Filtering

- **Column filters**: Filter individual columns
- **Global filter**: Search across all columns
- **Custom filter functions**: Define complex filtering logic

### 3. Row Selection

- **Single row selection**: Click to select one row
- **Multi-row selection**: Checkboxes for selecting multiple rows
- **Select all**: Checkbox in header to select all rows
- **Programmatic selection**: Control selection via state

### 4. Editable Cells

- **Inline editing**: Click cell to edit
- **Validation**: Validate input before saving
- **Controlled inputs**: React-controlled form inputs

### 5. Pagination

- **Page size control**: Choose rows per page (10, 25, 50, 100)
- **Page navigation**: First, previous, next, last page buttons
- **Page info**: Display current page and total pages

### 6. Expandable Rows

- **Nested data**: Show child rows
- **Expandable sections**: Click to expand/collapse
- **Indentation**: Visual hierarchy

### 7. Bulk Operations

- **Batch actions**: Perform actions on multiple selected rows
- **Delete selected**: Remove multiple rows at once
- **Export selected**: Export selected rows to CSV/JSON

### 8. Column Visibility

- **Show/hide columns**: Toggle column visibility
- **Column reordering**: Drag and drop columns (with plugin)
- **Column pinning**: Pin columns to left/right (with plugin)

---

## Built-in Grid Examples

The boilerplate includes several grid examples at `/grids`:

### 1. Crud Records (Live)

**Route**: `/grids` → "Crud Records" tab

**Features**:
- Live data from API (Prisma)
- Tenant-scoped data
- Read-only grid
- Sorting and filtering
- Pagination

**Use Case**: Display database records in a table

### 2. Global Crud Records (Live)

**Route**: `/grids` → "Global Crud Records" tab

**Features**:
- Live data from API (Prisma)
- Shared across all tenants
- Read-only grid
- Sorting and filtering

**Use Case**: Display global/shared data

### 3. Editable People (Demo)

**Route**: `/grids` → "Editable People" tab

**Features**:
- In-memory demo data
- Inline cell editing
- Add/remove rows
- Unsaved changes indicator
- Form validation

**Use Case**: Editable data grids with validation

### 4. Batch Operations (Demo)

**Route**: `/grids` → "Batch Operations" tab

**Features**:
- Multi-row selection
- Bulk delete
- Export to JSON
- Change status in bulk
- Selected count display

**Use Case**: Perform actions on multiple rows

### 5. Tenants (Demo)

**Route**: `/grids` → "Tenants" tab

**Features**:
- Grouped rows (by plan tier)
- Expandable sub-rows
- Nested data display
- Custom cell renderers

**Use Case**: Hierarchical data with grouping

### 6. Metrics (Demo)

**Route**: `/grids` → "Metrics" tab

**Features**:
- Read-only analytics grid
- Custom cell formatting (percentages, currency)
- Color-coded values
- Trend indicators

**Use Case**: Display analytics and metrics

### 7. Tasks (Demo)

**Route**: `/grids` → "Tasks" tab

**Features**:
- Rich cell renderers (tags, avatars, priority icons)
- Status badges
- Due date highlighting
- Expandable details

**Use Case**: Project management or task tracking

---

## Basic Usage

### Simple Table Example

```typescript
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

function SimpleTable() {
  const [data] = useState<Person[]>([
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
  ]);

  const columns = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Advanced Features

### 1. Sorting

Enable sorting on columns:

```typescript
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

function SortableTable() {
  const [data] = useState([...]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
    },
    {
      accessorKey: 'age',
      header: 'Age',
      enableSorting: true,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                style={{ cursor: 'pointer' }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getIsSorted() === 'asc' ? ' 🔼' : ''}
                {header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      {/* ... body */}
    </table>
  );
}
```

### 2. Row Selection

Add checkboxes for row selection:

```typescript
import {
  useReactTable,
  getCoreRowModel,
  RowSelectionState,
} from '@tanstack/react-table';
import { useState } from 'react';

function SelectableTable() {
  const [data] = useState([...]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div>
      {selectedCount > 0 && (
        <div>
          <span>{selectedCount} selected</span>
          <button onClick={() => {
            // Handle bulk action
            const selectedRows = table.getSelectedRowModel().rows;
            console.log('Selected:', selectedRows);
          }}>
            Delete Selected
          </button>
        </div>
      )}
      <table>{/* ... */}</table>
    </div>
  );
}
```

### 3. Inline Editing

Make cells editable:

```typescript
function EditableCell({ getValue, row, column, table }) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    />
  );
}

function EditableTable() {
  const [data, setData] = useState([...]);

  const columns = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: EditableCell,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: EditableCell,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
  });

  return <table>{/* ... */}</table>;
}
```

### 4. Pagination

Add pagination controls:

```typescript
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
} from '@tanstack/react-table';
import { useState } from 'react';

function PaginatedTable() {
  const [data] = useState([...]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <table>{/* ... */}</table>
      <div>
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

### 5. Custom Cell Renderers

Create rich cell components:

```typescript
function StatusCell({ getValue }) {
  const status = getValue();
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded ${colors[status]}`}>
      {status}
    </span>
  );
}

function AvatarCell({ row }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={row.original.avatar}
        alt={row.original.name}
        className="w-8 h-8 rounded-full"
      />
      <span>{row.original.name}</span>
    </div>
  );
}

const columns = [
  {
    accessorKey: 'name',
    header: 'User',
    cell: AvatarCell,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: StatusCell,
  },
];
```

### 6. Filtering

Add column and global filters:

```typescript
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';

function FilterableTable() {
  const [data] = useState([...]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search all columns..."
      />
      <table>{/* ... */}</table>
    </div>
  );
}
```

---

## Styling and Theming

### Tailwind CSS

The boilerplate uses Tailwind CSS for styling. Example styled table:

```typescript
function StyledTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Dark Mode Support

The boilerplate includes dark mode support via `next-themes`:

```typescript
<table className="dark:bg-gray-800 dark:divide-gray-700">
  <thead className="bg-gray-50 dark:bg-gray-900">
    <th className="text-gray-500 dark:text-gray-400">
      {/* ... */}
    </th>
  </thead>
  <tbody className="bg-white dark:bg-gray-800">
    <td className="text-gray-900 dark:text-gray-100">
      {/* ... */}
    </td>
  </tbody>
</table>
```

---

## Performance Optimization

### 1. Virtualization

For large datasets (1000+ rows), use virtualization:

```bash
pnpm add @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualizedTable() {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height in pixels
    overscan: 10,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = table.getRowModel().rows[virtualRow.index];
          return (
            <div
              key={row.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {/* Render row cells */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 2. Memoization

Use `useMemo` for columns:

```typescript
import { useMemo } from 'react';

function OptimizedTable() {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      // ... other columns
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    // ...
  });
}
```

### 3. Server-Side Operations

For very large datasets, implement server-side sorting/filtering/pagination:

```typescript
function ServerSideTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);

  const { data, isLoading } = trpc.data.list.useQuery({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
  });

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    pageCount: data?.pageCount ?? -1,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;

  return <table>{/* ... */}</table>;
}
```

---

## Best Practices

### 1. Define Types

Always type your data:

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
];
```

### 2. Extract Reusable Components

Create reusable table components:

```typescript
// DataTable.tsx
function DataTable<TData>({
  data,
  columns,
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <table>{/* ... */}</table>;
}

// Usage
<DataTable data={users} columns={userColumns} />
```

### 3. Use Column Helper

The column helper provides better type inference:

```typescript
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(), // Fully typed!
  }),
  columnHelper.accessor('email', {
    header: 'Email',
  }),
];
```

### 4. Handle Loading States

Show loading indicators:

```typescript
function DataTable() {
  const { data, isLoading } = trpc.data.list.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return <table>{/* ... */}</table>;
}
```

### 5. Implement Error Handling

Handle API errors gracefully:

```typescript
const { data, isLoading, error } = trpc.data.list.useQuery();

if (error) {
  return <div>Error: {error.message}</div>;
}
```

---

## Related Documentation

- [Charts & Visualizations →](charts-visualizations.md)
- [Multi-Tenancy →](multi-tenancy.md)

---

## Additional Resources

- [TanStack Table Docs](https://tanstack.com/table/latest)
- [TanStack Table Examples](https://tanstack.com/table/latest/docs/framework/react/examples)
- [React Table v8 Migration Guide](https://tanstack.com/table/latest/docs/guide/migrating)
