import { flexRender } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useExcelLikeTable } from "../../hooks/useExcelLikeTable";

type TProps<T extends object> = {
  columns: unknown[];
  data: T[];
  onDataChange?: (newData: T[]) => void;
  pageSize?: number;
};

export const TestTable = <T extends object>({ columns, data, onDataChange }: TProps<T>) => {
  const {
    activeCell,
    editingCell,
    handleCellClick,
    handleCellEditComplete,
    handleKeyDown,
    handleMouseMove,
    handleMouseUp,
    isCellSelected,
    setEditingCell,
    table,
    tableRef,
  } = useExcelLikeTable({
    columns,
    data,
    onDataChange,
  });

  return (
    <div className="w-full overflow-auto rounded-md border">
      <table
        className="w-full table-fixed focus-visible:outline-none"
        onKeyDown={handleKeyDown}
        onMouseUp={handleMouseUp}
        ref={tableRef}
        tabIndex={0}
      >
        <thead>
          {table.getHeaderGroups().map(({ headers, id }) => (
            <tr key={id}>
              {headers.map((header) => (
                <th
                  className="sticky top-0 z-10 border-b-2 border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold"
                  colSpan={header.colSpan}
                  key={header.id}
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const isSelected = isCellSelected({
                  columnId: cell.column.id,
                  rowIndex: row.index,
                });
                const isActive =
                  activeCell?.rowIndex === row.index && activeCell?.columnId === cell.column.id;
                const isEditing =
                  editingCell?.rowIndex === row.index && editingCell?.columnId === cell.column.id;

                const cellClass = cn(
                  "border-b border-gray-200 cursor-cell py-2 px-4 transition-colors duration-100 select-none",
                  isSelected && "bg-primary-muted/20 hover:bg-primary-muted/40",
                  isActive && "outline outline-2 outline-primary outline-offset-[-2px]",
                  !isSelected && !isActive && "hover:bg-primary/5",
                );

                const contentClass = "text-base";
                const cellPosition = { columnId: cell.column.id, rowIndex: row.index };

                return (
                  <td
                    className={cellClass}
                    key={cell.id}
                    onBlur={handleCellEditComplete}
                    onDoubleClick={() => setEditingCell(cellPosition)}
                    onMouseDown={() => handleCellClick(cellPosition)}
                    onMouseMove={() => handleMouseMove(cellPosition)}
                  >
                    {isEditing ? (
                      <Input
                        autoFocus
                        className={cn(
                          "rounded-none border-none bg-transparent p-0 shadow-none outline-none focus-visible:ring-0",
                          contentClass,
                        )}
                        defaultValue={(cell.getValue() as string) || ""}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          handleKeyDown(e, cellPosition);
                        }}
                      />
                    ) : (
                      <div className={contentClass}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
