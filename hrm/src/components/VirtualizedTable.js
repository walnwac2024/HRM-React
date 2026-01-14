// hrm/src/components/VirtualizedTable.js
import React, { memo } from 'react';
import { FixedSizeList as List } from 'react-window';

/**
 * Virtualized table component for rendering large datasets efficiently
 * Only renders visible rows, dramatically improving performance
 */
const VirtualizedTable = memo(({
    data = [],
    height = 600,
    rowHeight = 60,
    columns = [],
    onRowClick,
    className = ''
}) => {
    const Row = ({ index, style }) => {
        const row = data[index];

        return (
            <div
                style={style}
                className={`flex items-center border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${className}`}
                onClick={() => onRowClick?.(row)}
            >
                {columns.map((column, colIndex) => (
                    <div
                        key={colIndex}
                        className={`px-4 py-3 ${column.className || ''}`}
                        style={{ width: column.width || 'auto', flex: column.flex || 'none' }}
                    >
                        {column.render ? column.render(row) : row[column.key]}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="virtualized-table">
            {/* Header */}
            <div className="flex bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                {columns.map((column, index) => (
                    <div
                        key={index}
                        className={`px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider ${column.headerClassName || ''}`}
                        style={{ width: column.width || 'auto', flex: column.flex || 'none' }}
                    >
                        {column.label}
                    </div>
                ))}
            </div>

            {/* Virtualized Rows */}
            <List
                height={height}
                itemCount={data.length}
                itemSize={rowHeight}
                width="100%"
                className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
            >
                {Row}
            </List>
        </div>
    );
});

VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;
