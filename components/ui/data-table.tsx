import React, { useState, useMemo, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import SortIcon from "./SortIcon";
import SkeletonRow from "./SkeletonRow";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Column configuration for the generic `Table`.
 * - `key` supports dot-paths (e.g., "user.name") for nested access.
 * - `render` can be used for fully custom cell rendering.
 */
export interface TableColumn<T = any> {
    /** Header label/node shown in the table head */
    header: React.ReactNode;
    /** Data key for the column; supports dot-paths for nested fields */
    key: keyof T | string;
    /** Enable sorting for this column (only if table sorting is enabled) */
    sortable?: boolean;
    /** Custom cell renderer: render(value, row, rowIndex) => ReactNode */
    render?: (value: any, row: T, index: number) => React.ReactNode;
    /** Fixed width for the column (e.g., "200px", "20%") */
    width?: string;
    /** Text alignment for the cell and header */
    align?: "left" | "center" | "right";
    /** Additional classes for header cells */
    className?: string;
    /** Optional click handler for the column */
    onClick?: (value: any, row: T, index: number) => void;
    /** Make this column sticky (fixed position while scrolling horizontally) */
    sticky?: boolean;
}

/**
 * Props for the generic `Table` component.
 * Supports both controlled and uncontrolled sorting.
 */
export interface TableProps<T = any> {
    /** Array of data rows */
    data: T[];
    /** Column definitions */
    columns: TableColumn<T>[];

    /** Show skeleton rows while loading */
    loading?: boolean;
    /** Message to display when there's no data */
    emptyMessage?: string;

    /** Container-level additional classes */
    className?: string;
    /** Additional classes for the header row */
    headerClassName?: string;
    /** Row className string or a function per-row */
    rowClassName?: string | ((row: T, index: number) => string);
    /** Additional classes for all cells */
    cellClassName?: string;
    /** Additional classes for the <table> element */
    tableClassName?: string;

    /** Enable/disable sorting globally */
    sortable?: boolean;
    /** Initial sort key for uncontrolled sorting */
    defaultSortKey?: string;
    /** Initial sort order for uncontrolled sorting */
    defaultSortOrder?: "asc" | "desc";

    /**
     * Controlled sorting callback. If provided, the table WILL NOT sort internally
     * and will call `onSort(key, order)` instead.
     */
    onSort?: (key: string, order: "asc" | "desc") => void;
    /** Current sort key for controlled sorting */
    controlledSortKey?: string;
    /** Current sort order for controlled sorting */
    controlledSortOrder?: "asc" | "desc";

    /** Number of skeleton rows to show while loading */
    skeletonRows?: number;

    /** Visual options */
    striped?: boolean;
    hover?: boolean;
    bordered?: boolean;
    compact?: boolean;
    stickyHeader?: boolean;
    /** Constrain table body height; enables internal scroll if set */
    maxHeight?: string;
    /** Add horizontal dividers between rows */
    divider?: boolean;

    /** Optional row click handler */
    onRowClick?: (row: T, index: number) => void;
    /** Provide a stable key for each row; defaults to array index */
    rowKey?: (row: T, index: number) => React.Key;
    minTableWidth?: string;

    /** Selection props */
    enableSelection?: boolean;
    selectedRows?: Map<string, T>;
    onSelectRow?: (row: T, isSelected: boolean) => void;
    onSelectAll?: (isSelected: boolean) => void;
}

// Main Table component
const Table = <T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    emptyMessage = "No data available",
    className = "",
    headerClassName = "",
    rowClassName = "",
    cellClassName = "",
    tableClassName = "",
    sortable = false,
    defaultSortKey,
    defaultSortOrder = "asc",
    onSort,
    controlledSortKey,
    controlledSortOrder,
    skeletonRows = 5,
    striped = false,
    hover = false,
    bordered = false,
    compact = false,
    stickyHeader = false,
    maxHeight,
    divider = false,
    onRowClick,
    rowKey,
    minTableWidth,
    enableSelection = false,
    selectedRows,
    onSelectRow,
    onSelectAll,
}: TableProps<T>) => {
    /**
     * Uncontrolled sorting state.
     * - If `controlledSortKey/controlledSortOrder` are provided, we mirror them via effects.
     * - If `onSort` is provided, we DON'T sort locally; we rely on the parent to update `data`.
     */
    const [sortKey, setSortKey] = useState<string>(defaultSortKey || "");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);

    // Keep local `sortKey` in sync with controlled prop (if provided)
    useEffect(() => {
        if (controlledSortKey !== undefined) {
            setSortKey(controlledSortKey || "");
        }
    }, [controlledSortKey]);

    // Keep local `sortOrder` in sync with controlled prop (if provided)
    useEffect(() => {
        if (controlledSortOrder) {
            setSortOrder(controlledSortOrder);
        }
    }, [controlledSortOrder]);

    const isAllSelected = useMemo(() => {
        if (!enableSelection || !selectedRows || data.length === 0) return false;
        // Check if all current page rows are in the selection map
        // This requires rowKey to be defined
        if (!rowKey) return false;

        return data.every((row, index) => {
            const key = String(rowKey(row, index));
            return selectedRows.has(key);
        });
    }, [enableSelection, selectedRows, data, rowKey]);

    const isIndeterminate = useMemo(() => {
        if (!enableSelection || !selectedRows || data.length === 0) return false;
        if (!rowKey) return false;

        const selectedCount = data.filter((row, index) => {
            const key = String(rowKey(row, index));
            return selectedRows.has(key);
        }).length;

        return selectedCount > 0 && selectedCount < data.length;
    }, [enableSelection, selectedRows, data, rowKey]);

    const handleSelectAll = () => {
        onSelectAll?.(!isAllSelected);
    };

    const handleSelectRow = (row: T, index: number) => {
        if (!rowKey || !onSelectRow) return;
        const key = String(rowKey(row, index));
        const isSelected = selectedRows?.has(key) || false;
        onSelectRow(row, !isSelected);
    };

    /**
     * Handle header click to toggle sort on a specific column.
     * - Asc -> Desc -> Asc
     * - No-op if global sorting or column sorting is disabled.
     */
    const handleSort = (key: string) => {
        if (!sortable) return;

        const column = columns.find((col) => col.key === key);
        if (!column?.sortable) return;

        let newOrder: "asc" | "desc" = "asc";
        if (sortKey === key && sortOrder === "asc") {
            newOrder = "desc";
        }

        setSortKey(key);
        setSortOrder(newOrder);

        // If `onSort` is provided, parent handles the data re-ordering.
        onSort?.(key, newOrder);
    };

    /**
     * Local (uncontrolled) sorting:
     * - If `onSort` is provided, we skip local sorting and render `data` as-is.
     * - Handles strings and numbers; falls back to string comparison for other types.
     * - Null/undefined values are pushed to the bottom.
     */
    const sortedData = useMemo(() => {
        if (!sortable || !sortKey || onSort) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
                comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                comparison = aValue - bValue;
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [data, sortKey, sortOrder, sortable, onSort]);

    /**
     * Safely resolve a cell value from a row using the column key.
     * - Supports dot-paths: "user.name" -> row.user?.name
     */
    const getCellValue = (row: T, column: TableColumn<T>) => {
        return column.key
            .toString()
            .split(".")
            .reduce((obj, key) => obj?.[key], row);
    };

    /**
     * Resolve per-row classes. Accepts a static string or a function.
     */
    const getRowClassName = (row: T, index: number) => {
        if (typeof rowClassName === "function") {
            return rowClassName(row, index);
        }
        return rowClassName;
    };

    // Check if any columns have fixed widths
    const hasFixedWidths = columns.some((col) => col.width);
    // Only treat pixel-based widths as candidates for minWidth calculation
    const hasPixelWidths = columns.some(
        (col) => typeof col.width === "string" && /\d+px$/.test(col.width)
    );

    // Calculate minimum width only when pixel widths are used (so % widths don't collapse the table)
    const calculatedMinWidth = useMemo(() => {
        if (!hasPixelWidths) return undefined;

        const totalWidth = columns.reduce((sum, col) => {
            if (typeof col.width === "string" && /\d+px$/.test(col.width)) {
                const numericWidth = parseInt(col.width.replace(/[^\d]/g, ""), 10);
                return sum + (isNaN(numericWidth) ? 150 : numericWidth);
            }
            // Fallback width for columns without explicit px width
            return sum + 150;
        }, 0);

        return `${totalWidth}px`;
    }, [columns, hasPixelWidths]);

    console.log(calculatedMinWidth)

    // Container styles: border/rounding + optional max height for internal scroll
    // IMPORTANT: overflow classes must come AFTER className to override any conflicting overflow settings
    const tableContainerClasses = twMerge(
        "relative w-full rounded-md bg-card shadow-sm",
        maxHeight && "max-h-[var(--max-height)]",
        bordered && "border border-border rounded-lg",
        className, // Apply user className first
        // Override with required overflow behavior (this comes last to ensure precedence)
        "overflow-auto",
        // Ensure the container respects parent width
        "w-full max-w-full"
    );

    // Base table styles: determine layout based on column widths
    const tableClasses = twMerge(
        "text-sm text-left text-foreground",
        hasFixedWidths ? "table-fixed w-full" : "table-auto w-full",
        compact ? "text-xs" : "text-sm",
        tableClassName
    );

    // Header row styles: optional sticky for scrollable tables
    const headerClasses = twMerge(
        "bg-muted/50 text-muted-foreground border-b border-border text-xs uppercase font-medium tracking-wider",
        stickyHeader && "sticky top-0 z-10",
        headerClassName
    );

    // Shared header cell styles
    const headerCellClasses = "px-4 py-2 font-medium";

    // Row styles: striped + hover states
    const rowClasses = (index: number) =>
        twMerge(
            "transition-colors duration-150 bg-transparent border-b border-border/50 last:border-0",
            striped && index % 2 === 0 && "bg-muted/30",
            hover && "hover:bg-muted/50"
        );

    // Cell padding varies with compact mode
    const cellClasses = twMerge(
        compact ? "px-3 py-1.5" : "px-4 py-2.5",
        cellClassName,
        "truncate"
    );

    return (
        <div
            className={tableContainerClasses}
            style={{
                ...(maxHeight ? { "--max-height": maxHeight } : {}),
                // Ensure smooth scrolling on iOS and imp scrolling
                WebkitOverflowScrolling: "touch",
                // Fware acceleration for better mobile performance
                transform: "translateZ(0)",
            }}
        >
            <table
                className={tableClasses}
                style={{
                    ...(calculatedMinWidth ? { minWidth: calculatedMinWidth } : {}),
                    width: "100%",
                }}
            >
                {/* Table Header */}
                <thead className={headerClasses}>
                    <tr>
                        {enableSelection && (
                            <th className={twMerge(headerCellClasses, "w-[40px] px-2")}>
                                <Checkbox
                                    checked={isAllSelected || (isIndeterminate ? "indeterminate" : false)}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all"
                                />
                            </th>
                        )}
                        {columns?.map((column, index) => (
                            <th
                                key={index}
                                className={twMerge(
                                    headerCellClasses,
                                    column.sortable && sortable && "cursor-pointer select-none",
                                    column.align === "center" && "text-center",
                                    column.align === "right" && "text-right",
                                    column.sticky && "sticky left-0 z-20 bg-background",
                                    column.className
                                )}
                                style={column.width ? { width: column.width } : undefined}
                                onClick={() =>
                                    column.sortable && handleSort(column.key as string)
                                }
                            >
                                <div
                                    className={twMerge(
                                        "flex items-center",
                                        column.align === "center" && "justify-center",
                                        column.align === "right" && "justify-end"
                                    )}
                                >
                                    <span className="flex items-center gap-1">
                                        {column.header}
                                        {column.sortable && sortable && (
                                            <SortIcon
                                                column={column.key as string}
                                                currentSortBy={sortKey}
                                                currentSortOrder={sortOrder}
                                            />
                                        )}
                                    </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody className={!!divider ? "divide-y divide-border" : ""}>
                    {loading ? (
                        // Skeleton loading rows
                        Array.from({ length: skeletonRows })?.map((_, index) => (
                            <SkeletonRow key={index} columns={columns} />
                        ))
                    ) : sortedData?.length === 0 ? (
                        // Empty state
                        <tr>
                            <td
                                colSpan={columns.length + (enableSelection ? 1 : 0)}
                                className="px-4 py-12 text-center text-muted-foreground"
                            >
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                                        <svg
                                            className="w-6 h-6 text-muted-foreground/50"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium">
                                        {emptyMessage}
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        // Data rows
                        sortedData?.map((row, index) => (
                            <tr
                                key={rowKey ? rowKey(row, index) : index}
                                className={twMerge(
                                    rowClasses(index),
                                    getRowClassName(row, index)
                                )}
                                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                            >
                                {enableSelection && (
                                    <td className={twMerge(cellClasses, "w-[40px] px-2 text-center")} onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedRows?.has(String(rowKey ? rowKey(row, index) : index)) || false}
                                            onCheckedChange={() => handleSelectRow(row, index)}
                                            aria-label="Select row"
                                        />
                                    </td>
                                )}
                                {columns?.map((column, colIndex) => {
                                    const value = getCellValue(row, column);
                                    // Default rendering behior:
                                    // - Use custom renderer ifvided
                                    // -w primitive values as strings
                                    //  "—" for null/undefined or unsupported types
                                    const content: React.ReactNode = column.render
                                        ? column.render(value, row, index)
                                        : (value == null || (typeof value === 'string' && (value as string).trim() === ''))
                                            ? <span className="text-muted-foreground/50">—</span>
                                            : React.isValidElement(value)
                                                ? value
                                                : typeof value === "string" ||
                                                    typeof value === "number" ||
                                                    typeof value === "boolean"
                                                    ? String(value)
                                                    : <span className="text-muted-foreground/50">—</span>;
                                    return (
                                        <td
                                            key={colIndex}
                                            className={twMerge(
                                                cellClasses,
                                                column.align === "center" && "text-center",
                                                column.align === "right" && "text-right",
                                                column.sticky && "sticky left-0 z-10 bg-card",
                                                column.className
                                            )}
                                            style={column.width ? { width: column.width } : undefined}
                                            title={typeof value === "string" ? value : undefined}
                                            onClick={() =>
                                                column.onClick && column.onClick(value, row, index)
                                            }
                                        >
                                            <div
                                                className={twMerge(
                                                    "flex items-center min-w-0",
                                                    column.align === "center" && "justify-center",
                                                    column.align === "right" && "justify-end"
                                                )}
                                            >
                                                {content}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
