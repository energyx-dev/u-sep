import { flexRender } from "@tanstack/react-table";
import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { TTableData } from "@/domain/shape-info/components/AddShapeDialog";
import { BUILDING_HIERARCHY_TYPE } from "@/domain/shape-info/constants/shape.enums";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { isNumeric } from "@/domain/shape-info/utils/shape-info.utils";
import { useExcelLikeTable } from "@/hooks/useExcelLikeTable";
import { cn } from "@/lib/utils";

type MergeMeta = { isHidden: boolean; rowSpan: number };
type TEditableColumnKeys = BUILDING_HIERARCHY_TYPE | BUILDING_SURFACE_TYPE;
type TProps = {
  checkIsAllZero?: string[];
  columns: unknown[];
  data: TTableData[];
  editableColumns?: TEditableColumnKeys[];
  onDataChange?: (newData: TTableData[]) => void;
  pageSize?: number;
};

export const ShapeInfoTable = ({
  checkIsAllZero,
  columns,
  data,
  editableColumns,
  onDataChange,
}: TProps) => {
  const mergedData = useMemo(() => {
    const merged = data.map((row) => ({
      ...row,
      _mergeMeta: {} as Record<string, MergeMeta>,
    }));

    let startIdx = 0;
    while (startIdx < merged.length) {
      const currentValue = merged[startIdx].floorLabel;
      let endIdx = startIdx;

      while (endIdx + 1 < merged.length && merged[endIdx + 1].floorLabel === currentValue) {
        endIdx++;
      }

      const span = endIdx - startIdx + 1;
      for (let i = startIdx; i <= endIdx; i++) {
        merged[i]._mergeMeta.floorLabel = {
          isHidden: i !== startIdx,
          rowSpan: i === startIdx ? span : 0,
        };
      }

      startIdx = endIdx + 1;
    }

    return merged;
  }, [data]);

  const {
    activeCell,
    editingCell,
    editingValue,
    handleCellClick,
    handleCellEdit,
    handleCellEditChange,
    handleCellEditComplete,
    handleCellEditStart,
    handleKeyDown,
    handleMouseMove,
    handleMouseUp,
    isCellSelected,
    table,
    tableRef,
  } = useExcelLikeTable({
    columns,
    data: mergedData,
    onDataChange,
  });

  return (
    <div className="w-full overflow-y-auto px-4">
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
              {headers.map((header, i) => {
                const isLastHeader = i === headers.length - 1;
                return (
                  <th
                    className={cn(
                      "border-t border-r border-b border-gray-200 px-3 py-2 text-left font-semibold",
                      isLastHeader && "border-r-0",
                    )}
                    colSpan={header.colSpan}
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, cellIndex) => {
                const meta = row.original._mergeMeta?.[cell.column.id];
                if (meta?.isHidden) return null;

                const isSelected = isCellSelected({
                  columnId: cell.column.id,
                  rowIndex: row.index,
                });
                const isActive =
                  activeCell?.rowIndex === row.index && activeCell?.columnId === cell.column.id;

                // 수정 가능한 columns는 props로 전달받음
                const isEditing =
                  editableColumns?.includes(cell.column.id as TEditableColumnKeys) &&
                  editingCell?.rowIndex === row.index &&
                  editingCell?.columnId === cell.column.id;

                // 음수의 경우 outline을 붉은색으로 표시
                const isNegative =
                  editableColumns?.includes(cell.column.id as TEditableColumnKeys) &&
                  Number(cell.getValue()) < 0;

                // 모든 값이 0인 경우 (checkIsAllZero가 정의된 경우 - columns의 키를 확인)
                const isAllZero = checkIsAllZero?.every((key) => {
                  const value = row.original[key as keyof typeof row.original];
                  return typeof value === "number" && value === 0;
                });

                const isLastCell = cellIndex === row.getVisibleCells().length - 1;

                const cellClass = cn(
                  "border-t border-b border-gray-200 cursor-cell py-2 px-4 transition-colors duration-100 select-none",
                  !isLastCell && "border-r",
                  isSelected && "bg-primary-muted/20",
                  isActive && "outline outline-2 outline-primary outline-offset-[-2px]",
                  !isSelected && !isActive && "hover:bg-primary/5",
                  isNegative && "outline outline-destructive border-2 text-destructive",
                  isAllZero && cellIndex !== 0 ? "text-gray-200" : "text-bk7",
                );

                const contentClass = "text-base";
                const cellPosition = { columnId: cell.column.id, rowIndex: row.index };

                return (
                  <td
                    className={cellClass}
                    key={cell.id}
                    onBlur={handleCellEditComplete}
                    onDoubleClick={() => {
                      if (editableColumns?.includes(cell.column.id as TEditableColumnKeys))
                        handleCellEditStart(cellPosition);
                    }}
                    onMouseDown={() => {
                      if (editableColumns?.includes(cell.column.id as TEditableColumnKeys))
                        handleCellClick(cellPosition);
                    }}
                    onMouseMove={() => handleMouseMove(cellPosition)}
                    rowSpan={meta?.rowSpan || 1}
                  >
                    {isEditing ? (
                      <Input
                        autoFocus
                        className={cn(
                          "text-gray rounded-none border-none bg-transparent p-0 shadow-none outline-none focus-visible:ring-0",
                          contentClass,
                        )}
                        onBlur={() => {
                          if (isNumeric(editingValue)) {
                            handleCellEdit({
                              columnId: editingCell.columnId,
                              rowIndex: editingCell.rowIndex,
                              value: Number(editingValue),
                            });
                          }
                        }}
                        onChange={(e) => handleCellEditChange(Number(e.target.value))}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          handleKeyDown(e, cellPosition);
                        }}
                        type="number"
                        value={String(editingValue)}
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
