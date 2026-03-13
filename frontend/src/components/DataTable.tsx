import React from "react";

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
}

export function DataTable<T>({ title, data, columns }: DataTableProps<T>) {
  return (
    <div className="card p-5 overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <table className="min-w-full text-sm text-left text-slate-200">
        <thead className="text-xs uppercase text-slate-400 border-b border-slate-700">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="py-2" style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-800/60">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="py-2">
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

