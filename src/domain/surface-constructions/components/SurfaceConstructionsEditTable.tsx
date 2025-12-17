import { Cell, ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Fragment, useCallback, useState } from "react";

import { EmptyText } from "@/components/custom/EmptySystems";
import { Table } from "@/components/table/Table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ThreeStateCheckbox } from "@/components/ui/three-state-checkbox";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { SURFACE_LAYERS_COLUMN_COUNT } from "@/domain/surface-constructions/constants/constants";
import { useExcelLikeTable } from "@/hooks/useExcelLikeTable";
import { TTableError } from "@/lib/table-helper";
import { cn } from "@/lib/utils";

interface IProps<T extends { id?: string; name: string; type?: BUILDING_SURFACE_TYPE }> {
  // 제너릭 타입에 대응하기 위해
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: Partial<T>[];
  errors?: TTableError[];
  onBeforeDelete?: (deletedItems: Partial<T>[], remainingItems: Partial<T>[]) => Promise<boolean>;
  openDialog: (args: { columnId: string; row: Partial<T>; rowIndex: number }) => void;
  setData: (update: Partial<T>[]) => void;
  type: BUILDING_SURFACE_TYPE;
}

export const SurfaceConstructionsEditTable = <
  T extends { id?: string; name: string; type?: BUILDING_SURFACE_TYPE },
>({
  columns,
  data,
  errors,
  onBeforeDelete,
  openDialog,
  setData,
  type,
}: IProps<T>) => {
  const {
    activeCell,
    editingCell,
    editingValue,
    handleCellClick,
    handleCellEdit,
    handleCellEditChange,
    handleCellEditStart,
    handleKeyDown,
    handleMouseMove,
    handleMouseUp,
    isCellSelected,
    table,
    tableRef,
  } = useExcelLikeTable({
    columns,
    data,
    onDataChange: setData,
  });

  const [checkedRowIndexList, setCheckedRowIndexList] = useState<Set<number>>(new Set());
  // const hasCheckedRowIndexList = checkedRowIndexList.size > 0;
  const isEmpty = data.length === 0;

  const handleAddRow = useCallback(() => {
    setData([...data, { type } as Partial<T>]);
  }, [data, setData, type]);

  const handleCheckboxClick = useCallback((rowIndex: number) => {
    setCheckedRowIndexList((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  }, []);

  const checkAllRows = useCallback(() => {
    const all = new Set<number>();
    data.forEach((_, idx) => all.add(idx));
    setCheckedRowIndexList(all);
  }, [data, setCheckedRowIndexList]);

  const resetCheckedRows = useCallback(() => {
    setCheckedRowIndexList(new Set());
  }, [setCheckedRowIndexList]);

  const toggleCheckAll = useCallback(() => {
    if (checkedRowIndexList.size === data.length) {
      resetCheckedRows();
    } else {
      checkAllRows();
    }
  }, [checkedRowIndexList, data.length, checkAllRows, resetCheckedRows]);

  const handleDeleteRow = useCallback(async () => {
    const itemsToDelete = data.filter((_, index) => checkedRowIndexList.has(index));
    const remainingItems = data.filter((_, index) => !checkedRowIndexList.has(index));

    if (onBeforeDelete) {
      const canDelete = await onBeforeDelete(itemsToDelete, remainingItems);
      if (!canDelete) {
        return;
      }
    }

    setData(remainingItems);
    setCheckedRowIndexList(new Set());
  }, [checkedRowIndexList, data, onBeforeDelete, setData]);

  const renderCell = ({
    cell,
    columnId,
    rowIndex,
  }: {
    cell: Cell<Partial<T>, unknown>;
    columnId: keyof T;
    rowIndex: number;
  }) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnId === columnId;

    const contentClass = "text-sm p-2";
    const isError = !!errors?.find(
      (error) => error.rowIndex === rowIndex && error.columnId === columnId,
    );
    const isMaterialCell =
      typeof columnId === "string" && columnId !== "name" && !columnId.includes("thickness");

    // Always render material cell with 선택 button, regardless of editing state
    if (isMaterialCell) {
      const value = cell.getValue() as string | undefined;
      const placeholder = cell.column.columnDef.meta?.placeholder;

      return (
        <div
          className={cn(
            contentClass,
            "flex items-center justify-between",
            isError && "text-destructive",
          )}
        >
          <div className={cn(value === undefined || value === "") && "text-neutral240"}>
            {value !== undefined && value !== "" ? value : placeholder || ""}
          </div>
          <Button
            className={cn("text-neutral560 border-neutral160 ml-2 h-6 w-6")}
            onClick={(e) => {
              e.stopPropagation();
              openDialog({
                columnId: columnId as string,
                row: data[rowIndex] as Partial<T>,
                rowIndex,
              });
            }}
            title="재료 선택"
            type="button"
            variant="outline"
          >
            {cell.getValue() ? "수정" : "선택"}
          </Button>
        </div>
      );
    }

    if (!isEditing) {
      const value = cell.getValue() as string | undefined;
      const placeholder = cell.column.columnDef.meta?.placeholder;

      return (
        <div
          className={cn(
            contentClass,
            "break-words",
            (value === undefined || value === "") && "text-neutral240",
          )}
        >
          {value !== undefined && value !== "" ? value : placeholder || ""}
        </div>
      );
    }

    return (
      <Input
        autoFocus
        className={cn(
          "h-full rounded-none border-none bg-transparent p-2 shadow-none outline-none focus-visible:ring-0",
          contentClass,
        )}
        onBlur={() => {
          handleCellEdit({
            columnId: editingCell.columnId,
            rowIndex: editingCell.rowIndex,
            value: editingValue,
          });
        }}
        onChange={(e) => {
          const value = e.target.value;
          // 숫자 입력 필드인 경우 숫자만 허용
          if (cell.column.columnDef.meta?.inputType === "number") {
            let numericString = value.replace(/[^0-9.]/g, "");

            // 소수점이 두 개 이상 입력되는 것을 방지
            const parts = numericString.split(".");
            if (parts.length > 2) {
              numericString = parts[0] + "." + parts.slice(1).join("");
            }

            // 전체 자릿수(정수부 + 소수부) 15자리 제한
            const numericOnly = numericString.replace(".", "");
            if (parts[0]) {
              if (numericOnly.length > 15) {
                return;
              }
            } else {
              if (numericOnly.length > 14) {
                return;
              }
            }

            handleCellEditChange(numericString ? Number(numericString) : undefined);
          } else {
            handleCellEditChange(value);
          }
        }}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(e.key)) {
            e.stopPropagation();
            return;
          }
          e.stopPropagation();
          handleKeyDown(e, { columnId, rowIndex });
        }}
        placeholder={
          columnId === "name"
            ? "이름"
            : typeof columnId === "string" &&
                (columnId.includes("thickness") || columnId === `thickness${1 + 1}`)
              ? "두께(mm)"
              : ""
        }
        type={cell.column.columnDef.meta?.inputType || "text"}
        value={String(editingValue ?? "")}
      />
    );
  };

  return (
    <div className="relative p-0">
      {/* 선택 삭제 버튼 컴포넌트 아래 버튼으로 대체 */}
      <div className="absolute -top-11 right-18 bg-white p-1">
        <Button
          className={"border-neutral160 text-neutral560 px-2 py-1"}
          onClick={handleDeleteRow}
          variant="monoOutline"
        >
          선택 삭제
        </Button>
      </div>
      <div className="w-full overflow-x-scroll">
        <table
          className="w-full table-fixed focus-visible:outline-none"
          onKeyDown={handleKeyDown}
          onMouseUp={handleMouseUp}
          ref={tableRef}
          tabIndex={0}
        >
          <thead>
            <Table.HeaderRow>
              {!isEmpty && (
                <Table.Th className="w-8 p-2">
                  <ThreeStateCheckbox
                    checkIconClassName="size-3"
                    className="mt-1"
                    onChange={toggleCheckAll}
                    value={
                      checkedRowIndexList.size === data.length
                        ? "checked"
                        : checkedRowIndexList.size === 0
                          ? "unchecked"
                          : "indeterminate"
                    }
                  />
                </Table.Th>
              )}
              <Table.Th className="w-[181.5px] bg-white text-sm">
                이름<span className="text-destructive text-sm"> *</span>
              </Table.Th>
              {isEmpty ? (
                <Table.Th className="w-full bg-white text-sm">
                  <span>
                    {type === BUILDING_SURFACE_TYPE.floor
                      ? "재료(순서: 외부→내부)"
                      : "재료(순서: 외부→내부)"}
                  </span>
                </Table.Th>
              ) : (
                Array.from({ length: SURFACE_LAYERS_COLUMN_COUNT }, (_, index) => (
                  <Fragment key={`layer-${index}`}>
                    <Table.Th className="w-[160px] bg-white text-sm">
                      재료 {index + 1}
                      {index === 0 && <span className="text-destructive text-sm">*</span>}
                    </Table.Th>
                    <Table.Th className="w-[90px] bg-white text-sm">
                      두께(mm)
                      {index === 0 && <span className="text-destructive text-sm">*</span>}
                    </Table.Th>
                  </Fragment>
                ))
              )}
            </Table.HeaderRow>
          </thead>
          <tbody>
            {isEmpty ? (
              <Table.BodyRow>
                <Table.Td
                  className="border-b border-gray-200 py-2.5 text-center"
                  colSpan={SURFACE_LAYERS_COLUMN_COUNT}
                >
                  <EmptyText emptyText="등록된 면 구조체가 없습니다." />
                </Table.Td>
              </Table.BodyRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Table.BodyRow className="group" key={row.id}>
                  <Table.Td className="p-2">
                    <Checkbox
                      checked={checkedRowIndexList.has(row.index)}
                      checkIconClassName="size-3"
                      className="mt-1"
                      onCheckedChange={() => handleCheckboxClick(row.index)}
                    />
                  </Table.Td>
                  {row.getVisibleCells().map((cell) => {
                    const isSelected = isCellSelected({
                      columnId: cell.column.id,
                      rowIndex: row.index,
                    });
                    const isActive =
                      activeCell?.rowIndex === row.index && activeCell?.columnId === cell.column.id;

                    const isError = !!errors?.find(
                      (error) => error.rowIndex === row.index && error.columnId === cell.column.id,
                    );

                    const isEditing =
                      editingCell?.rowIndex === row.index &&
                      editingCell?.columnId === cell.column.id;

                    const cellClass = cn(
                      "cursor-cell select-none p-0 text-sm",
                      isSelected && "bg-primary-muted/20 hover:bg-primary-muted/40",
                      isActive && "outline outline-2 outline-primary outline-offset-[-2px]",
                      !isSelected && !isActive && "hover:bg-primary/5",
                      isError && "outline-destructive outline outline-1 outline-offset-[-1px]",
                      isEditing && "p-0",
                    );

                    const cellPosition = { columnId: cell.column.id, rowIndex: row.index };
                    const isMaterialCell = cell.column.id.includes("material");
                    return (
                      <Table.Td
                        className={cellClass}
                        key={cell.id}
                        onDoubleClick={() => !isMaterialCell && handleCellEditStart(cellPosition)}
                        onMouseDown={() => handleCellClick(cellPosition)}
                        onMouseMove={() => handleMouseMove(cellPosition)}
                      >
                        {renderCell({
                          cell,
                          columnId: cell.column.id as keyof T,
                          rowIndex: row.index,
                        })}
                      </Table.Td>
                    );
                  })}
                </Table.BodyRow>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="">
        <Button
          className="flex w-full items-center justify-start gap-1 rounded-none border-b border-gray-200 px-3 py-2 text-sm text-[#767676]"
          onClick={handleAddRow}
          variant="ghost"
        >
          <Plus className="aspect-square h-3 w-3 text-current" />
          <span className="text-nutral-600 font-medium">행 추가</span>
        </Button>
      </div>
      {errors && errors.length > 0 && (
        <p className="text-error mt-1 font-medium">{errors[0].errorMessage}</p>
      )}
    </div>
  );
};
