// DataTable - Reusable data table component with search, sort, and pagination
import React, { useState, useMemo, useCallback } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Column definition type
export interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    searchable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T, index: number) => React.ReactNode;
    getValue?: (row: T) => any; // For custom sorting/searching
}

// Sort configuration
export type SortDirection = 'asc' | 'desc' | null;
export interface SortConfig {
    key: string;
    direction: SortDirection;
}

// DataTable props
export interface DataTableProps<T extends { id: string }> {
    data: T[];
    columns: Column<T>[];
    // Search
    searchable?: boolean;
    searchPlaceholder?: string;
    // Selection
    selectable?: boolean;
    selectedIds?: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
    // Pagination
    paginated?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    // Actions
    onRowClick?: (row: T) => void;
    rowActions?: (row: T) => React.ReactNode;
    // Bulk Actions Slot
    bulkActionsSlot?: React.ReactNode;
    // Loading
    loading?: boolean;
    emptyMessage?: string;
    // Styling
    className?: string;
    compact?: boolean;
}

export function DataTable<T extends { id: string }>({
    data,
    columns,
    searchable = true,
    searchPlaceholder = 'Search...',
    selectable = false,
    selectedIds = new Set(),
    onSelectionChange,
    paginated = true,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50],
    onRowClick,
    rowActions,
    bulkActionsSlot,
    loading = false,
    emptyMessage = 'No data found.',
    className = '',
    compact = false,
}: DataTableProps<T>) {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Get searchable columns
    const searchableColumns = useMemo(
        () => columns.filter(col => col.searchable !== false),
        [columns]
    );

    // Filter data by search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;

        const query = searchQuery.toLowerCase();
        return data.filter(row => {
            return searchableColumns.some(col => {
                const value = col.getValue ? col.getValue(row) : (row as any)[col.key];
                if (value == null) return false;
                return String(value).toLowerCase().includes(query);
            });
        });
    }, [data, searchQuery, searchableColumns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig || !sortConfig.direction) return filteredData;

        const column = columns.find(col => col.key === sortConfig.key);
        if (!column) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = column.getValue ? column.getValue(a) : (a as any)[sortConfig.key];
            const bValue = column.getValue ? column.getValue(b) : (b as any)[sortConfig.key];

            // Handle null/undefined
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            // Compare
            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sortConfig.direction === 'desc' ? -comparison : comparison;
        });
    }, [filteredData, sortConfig, columns]);

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!paginated) return sortedData;
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize, paginated]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Reset to first page when data changes
    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    }, []);

    // Sort handler
    const handleSort = useCallback((key: string) => {
        setSortConfig(current => {
            if (!current || current.key !== key) {
                return { key, direction: 'asc' };
            }
            if (current.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return null;
        });
    }, []);

    // Selection handlers
    const allSelected = paginatedData.length > 0 && paginatedData.every(row => selectedIds.has(row.id));
    const someSelected = paginatedData.some(row => selectedIds.has(row.id)) && !allSelected;

    const handleSelectAll = useCallback((checked: boolean) => {
        if (!onSelectionChange) return;
        const newSelected = new Set(selectedIds);
        paginatedData.forEach(row => {
            if (checked) newSelected.add(row.id);
            else newSelected.delete(row.id);
        });
        onSelectionChange(newSelected);
    }, [paginatedData, selectedIds, onSelectionChange]);

    const handleToggleRow = useCallback((id: string) => {
        if (!onSelectionChange) return;
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        onSelectionChange(newSelected);
    }, [selectedIds, onSelectionChange]);

    // Render sort icon
    const renderSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ChevronUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
        }
        return <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
    };

    const cellPadding = compact ? 'px-4 py-2' : 'px-6 py-4';
    const headerPadding = compact ? 'px-4 py-2' : 'px-6 py-3';

    return (
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden ${className}`}>
            {/* Toolbar */}
            {(searchable || bulkActionsSlot) && (
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    {/* Search */}
                    {searchable && (
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedIds.size > 0 && bulkActionsSlot && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {selectedIds.size} selected
                            </span>
                            {bulkActionsSlot}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            {selectable && (
                                <th className={`${headerPadding} w-12`}>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={input => { if (input) input.indeterminate = someSelected; }}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 bg-white dark:bg-slate-700"
                                    />
                                </th>
                            )}
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`${headerPadding} ${col.width || ''} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                                >
                                    {col.sortable !== false ? (
                                        <button
                                            onClick={() => handleSort(col.key)}
                                            className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                        >
                                            {col.header}
                                            {renderSortIcon(col.key)}
                                        </button>
                                    ) : (
                                        col.header
                                    )}
                                </th>
                            ))}
                            {rowActions && (
                                <th className={`${headerPadding} text-right w-24`}>Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} className="text-center py-12">
                                    <div className="flex items-center justify-center gap-2 text-slate-400">
                                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} className="text-center py-12 text-slate-400 dark:text-slate-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => {
                                const isSelected = selectedIds.has(row.id);
                                return (
                                    <tr
                                        key={row.id}
                                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                                        className={`
                                            ${onRowClick ? 'cursor-pointer' : ''}
                                            ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}
                                            hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group
                                        `}
                                    >
                                        {selectable && (
                                            <td className={cellPadding} onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleRow(row.id)}
                                                    className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 bg-white dark:bg-slate-700"
                                                />
                                            </td>
                                        )}
                                        {columns.map(col => {
                                            const value = (row as any)[col.key];
                                            return (
                                                <td
                                                    key={col.key}
                                                    className={`${cellPadding} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} text-slate-700 dark:text-slate-300`}
                                                >
                                                    {col.render ? col.render(value, row, index) : value}
                                                </td>
                                            );
                                        })}
                                        {rowActions && (
                                            <td className={`${cellPadding} text-right`} onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    {rowActions(row)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {paginated && totalPages > 0 && (
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span>Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <span className="text-slate-400">
                            {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            First
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-slate-700 dark:text-slate-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
