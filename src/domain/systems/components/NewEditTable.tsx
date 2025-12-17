import { Cell, ColumnDef, flexRender } from "@tanstack/react-table";
import { josa } from "es-hangul";
import { Plus } from "lucide-react";
import { useEffect } from "react";

import { EmptyText } from "@/components/custom/EmptySystems";
import GroupSelectUI from "@/components/custom/select/GroupSelectUI";
import { TGroupSelectOption, TSelectOption } from "@/components/custom/select/select.types";
import SelectUI from "@/components/custom/select/SelectUI";
import { Table } from "@/components/table/Table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkFenestrationConstructionUsage } from "@/domain/fenestrationConstruction/components/FenestrationConstructionTableSection";
import { TEditingValue, useExcelLikeTable } from "@/hooks/useExcelLikeTable";
import { useNewConfirmDialog } from "@/hooks/useNewConfirmDialog";
import { TTableError } from "@/lib/table-helper";
import { cn } from "@/lib/utils";
import { TViewMode } from "@/types/view-mode.type";

interface IProps<T extends { id?: string; name?: string }> {
  actionEditTable?: {
    CopyOrRemoveActionButton?: React.ReactNode;
    CopyOrRemoveActionCellButton: (args: { rowIndex: number }) => React.ReactNode;
    handleAddRow?: () => void;
    handleDeleteRow?: () => void;
    HeaderSelectCheckbox?: () => React.ReactNode;
    PlacementButton?: ({
      isEditMode,
      systemId,
      systemObj,
      type,
    }: {
      isEditMode?: boolean;
      systemId: string;
      systemObj: Partial<T>;
      type: string;
    }) => React.ReactNode;
    RowSelectCheckbox?: (args: { rowIndex: number }) => React.ReactNode;
  };
  addRow?: () => void;
  // 제너릭 타입에 대응하기 위해
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: Partial<T>[];
  errors?: TTableError[];
  label?: string;
  mode?: TViewMode;
  onRegisterComplete?: (fn: () => void) => void;
  openDialog?: (args: { columnId: string; row: Partial<T>; rowIndex: number }) => void;
  placementSystem?:
    | "density"
    | "fenestration"
    | "lightning"
    | "photovoltaicSystems"
    | "supplySystem"
    | "ventilationSystem";
  setData: (update: Partial<T>[]) => void;
  setMode: (mode: TViewMode) => void;
  showActionButtons?: boolean; // 행 추가, 복사, 삭제 기능 있는 table
  showRequiredIndicator?: boolean; // 필수 입력 항목 표시
  snapshotRef?: Partial<T>[];
  tableClassName?: string;
  wrapperClassName?: string;
}

export const NewEditTable = <T extends { id?: string; name?: string }>({
  actionEditTable,
  addRow,
  columns,
  data,
  errors,
  label,
  mode,
  onRegisterComplete,
  openDialog,
  placementSystem,
  setData,
  setMode,
  showActionButtons = true,
  snapshotRef,
  tableClassName,
  wrapperClassName,
}: IProps<T>) => {
  const {
    activeCell,
    clear,
    editingCell,
    editingValue,
    handleCellClick,
    handleCellDoubleClick,
    handleCellEdit,
    handleCellEditChange,
    handleCellEditComplete,
    handleKeyDown,
    handleMouseMove,
    handleMouseUp,
    isCellSelected,
    table,
    tableRef,
  } = useExcelLikeTable({
    columns,
    data,
    mode,
    onDataChange: setData,
  });

  useEffect(() => {
    onRegisterComplete?.(() => {
      handleCellEditComplete();
      clear();
    });
  }, [onRegisterComplete, handleCellEditComplete, clear]);

  const isEmpty = data.length === 0;
  const isEditMode = mode === "edit";

  const paddingClass = showActionButtons ? "px-0" : undefined;

  const renderCell = ({
    cell,
    columnId,
    rowIndex,
  }: {
    cell: Cell<Partial<T>, unknown>;
    columnId: keyof T;
    rowIndex: number;
  }) => {
    const { meta } = cell.column.columnDef;
    const selectOptions = meta?.selectOptions;
    const groupSelectOptions = meta?.groupSelectOptions;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { openNewConfirmDialog } = useNewConfirmDialog();

    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnId === columnId;
    const disabled = meta?.disabled?.(cell.row.original);

    const contentClass = "text-sm px-3 py-2";
    const isError = !!errors?.find(
      (error) => error.rowIndex === rowIndex && error.columnId === columnId,
    );

    // 셀에 모달을 추가할 수 있는 로직 (column에 openWithDialog가 true일 때 표시)
    if (mode === "edit" && meta?.openWithDialog) {
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
          <div className={cn((value === undefined || value === "") && "text-neutral240")}>
            {value !== undefined && value !== "" ? value : mode === "edit" ? placeholder || "" : ""}
          </div>
          <Button
            className={cn("border-neutral160 text-neutral560 ml-2 h-6 w-10")}
            onClick={(e) => {
              e.stopPropagation();
              openDialog?.({
                columnId: columnId as string,
                row: cell.row.original,
                rowIndex,
              });
            }}
            title="선택"
            type="button"
            variant="outline"
          >
            {cell.getValue() ? "수정" : "선택"}
          </Button>
        </div>
      );
    }

    if (!isEditing) {
      let value = cell.getValue() as string | undefined;

      if (meta?.valueGetter) {
        const getterValue = meta.valueGetter(cell.row.original);
        if (getterValue !== undefined) {
          value = getterValue;
        }
      }

      const placeholder = meta?.placeholderGetter
        ? meta.placeholderGetter(cell.row.original)
        : meta?.placeholder;

      return (
        <div
          className={cn(
            contentClass,
            "break-words",
            (value === undefined || value === "") && "text-neutral240",
          )}
        >
          {value !== undefined && value !== "" ? value : mode === "edit" ? placeholder || "" : ""}
        </div>
      );
    }

    if (groupSelectOptions) {
      const _groupSelectOptions = (
        typeof groupSelectOptions === "function"
          ? groupSelectOptions(cell.row.original)
          : groupSelectOptions
      ) as (TGroupSelectOption<TEditingValue> | TSelectOption<TEditingValue>)[];

      return (
        <GroupSelectUI<TEditingValue>
          disabled={disabled}
          groupedOptions={_groupSelectOptions}
          onValueChange={(value) => {
            handleCellEdit({
              columnId: editingCell.columnId,
              rowIndex: editingCell.rowIndex,
              value,
            });
            handleCellEditComplete();
          }}
          selectItemProps={{
            onMouseDown: (e) => e.stopPropagation(),
          }}
          triggerClassName={contentClass}
          value={cell.row.original[columnId] as TEditingValue}
        />
      );
    }

    if (selectOptions) {
      const _selectOptions = (
        typeof selectOptions === "function" ? selectOptions(cell.row.original) : selectOptions
      ) as TSelectOption<TEditingValue>[];

      return (
        <SelectUI<TEditingValue>
          hasBorder={false}
          onValueChange={(value) => {
            // value 값이 변경되었을 때, 맵핑된 개구부가 있는지 확인하고 있으면 모달 생성 ("연결된 개구부의 구조체가 초기화됩니다. 다시 등록해야 합니다")
            (async () => {
              const usedFenestrationConstructionIds = checkFenestrationConstructionUsage([
                cell.row.original.id,
              ]);

              const originalValue = snapshotRef?.find((item) => item.id === cell.row.original.id)?.[
                columnId
              ] as boolean;

              if (usedFenestrationConstructionIds.size > 0 && originalValue !== value) {
                await openNewConfirmDialog({
                  confirmText: "확인",
                  description: "연결된 개구부의 구조체가 초기화되며, 다시 등록해야 합니다",
                  title: "개구부 구조체 초기화",
                });
              }
              return;
            })();
            handleCellEdit({
              columnId: editingCell.columnId,
              rowIndex: editingCell.rowIndex,
              value,
            });
            handleCellEditComplete();
          }}
          options={_selectOptions}
          placeholder={
            (meta?.placeholderGetter
              ? meta.placeholderGetter(cell.row.original)
              : meta?.placeholder) || ""
          }
          selectItemProps={{
            onMouseDown: (e) => e.stopPropagation(),
          }}
          triggerClassName={contentClass}
          value={cell.row.original[columnId] as TEditingValue}
        />
      );
    }

    return (
      <Input
        autoFocus
        className={cn(
          "placeholder:text-neutral240 h-full rounded-none border-none bg-white p-2 shadow-none outline-none focus-visible:ring-0",
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
          // 방향키(화살표 키)는 이벤트 전파하지 않음 (Input 내부에서만 동작토록)
          if (["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(e.key)) {
            e.stopPropagation();
            return;
          }
          e.stopPropagation();
          handleKeyDown(e, { columnId, rowIndex });
        }}
        placeholder={
          (meta?.placeholderGetter
            ? meta.placeholderGetter(cell.row.original)
            : meta?.placeholder) || ""
        }
        type={cell.column.columnDef.meta?.inputType || "text"}
        value={String(editingValue ?? "")}
      />
    );
  };

  return (
    <div className={cn("relative pl-6", wrapperClassName)}>
      <div className={cn("w-full overflow-visible px-8", paddingClass, tableClassName)}>
        <table
          className="w-full table-fixed focus-visible:outline-none"
          onKeyDown={handleKeyDown}
          onMouseUp={handleMouseUp}
          ref={tableRef}
          tabIndex={0}
        >
          <thead>
            {table.getHeaderGroups().map(({ headers, id }) => (
              <Table.HeaderRow key={id}>
                {showActionButtons && isEditMode && !isEmpty && (
                  <Table.Th className="w-8 p-2">
                    {actionEditTable?.HeaderSelectCheckbox?.()}
                  </Table.Th>
                )}
                {headers.map((header) => {
                  const isRequired = header.column.columnDef.meta?.isRequired;
                  const headerText = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <Table.Th
                      className="bg-white px-3 py-2 text-sm"
                      colSpan={header.colSpan}
                      key={header.id}
                      // style={{ width: header.getSize() }}
                    >
                      <>
                        {headerText}
                        {isEditMode && isRequired && <span className="text-destructive"> *</span>}
                      </>
                    </Table.Th>
                  );
                })}
                {showActionButtons &&
                  isEditMode &&
                  !isEmpty &&
                  actionEditTable?.CopyOrRemoveActionCellButton && <Table.Th className="w-8" />}
                {showActionButtons &&
                  !isEditMode &&
                  !isEmpty &&
                  placementSystem &&
                  actionEditTable?.PlacementButton && <Table.Th className="w-12" />}
              </Table.HeaderRow>
            ))}
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <Table.Td
                  className="border-b border-gray-200 py-2.5 text-center"
                  colSpan={columns.length}
                >
                  <EmptyText
                    emptyText={`등록된 ${josa(label ? label : "데이터", "이/가")} 없습니다.`}
                  />
                </Table.Td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                return (
                  <Table.BodyRow key={row.id}>
                    {showActionButtons && isEditMode && (
                      <Table.Td className="p-2">
                        {actionEditTable?.RowSelectCheckbox
                          ? actionEditTable.RowSelectCheckbox({ rowIndex: row.index })
                          : null}
                      </Table.Td>
                    )}
                    {row.getVisibleCells().map((cell) => {
                      // row header cell 처리 (meta.isRowHeader: true)
                      const isRowHeader = cell.column.columnDef.meta?.isRowHeader;
                      if (isRowHeader) {
                        return (
                          <Table.Th key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Table.Th>
                        );
                      }

                      const isSelected = isCellSelected({
                        columnId: cell.column.id,
                        rowIndex: row.index,
                      });
                      const isActive =
                        activeCell?.rowIndex === row.index &&
                        activeCell?.columnId === cell.column.id;

                      const isError = !!errors?.find(
                        (error) =>
                          error.rowIndex === row.index && error.columnId === cell.column.id,
                      );

                      const isEditing =
                        editingCell?.rowIndex === row.index &&
                        editingCell?.columnId === cell.column.id;

                      const disabled = cell.column.columnDef.meta?.disabled?.(cell.row.original);

                      const cellClass = cn(
                        "cursor-cell select-none p-0",
                        isSelected && "bg-primary-muted/20 hover:bg-primary-muted/40",
                        isActive && "outline outline-2 outline-primary outline-offset-[-2px]",
                        !isSelected && !isActive && "hover:bg-primary/5",
                        isError && "outline-destructive outline outline-1 outline-offset-[-1px]",
                        isEditing && "p-0",
                        disabled && "bg-bk3 pointer-events-none",
                      );

                      const cellPosition = { columnId: cell.column.id, rowIndex: row.index };

                      return (
                        <Table.Td
                          className={cellClass}
                          key={cell.id}
                          onDoubleClick={() => {
                            handleCellDoubleClick(cellPosition);
                            setMode("edit");
                          }}
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
                    {showActionButtons &&
                      isEditMode &&
                      actionEditTable?.CopyOrRemoveActionCellButton && (
                        <Table.Td className="p-0">
                          {actionEditTable.CopyOrRemoveActionCellButton({ rowIndex: row.index })}
                        </Table.Td>
                      )}
                    {showActionButtons &&
                      placementSystem &&
                      actionEditTable?.PlacementButton?.({
                        isEditMode: isEditMode,
                        systemId: row.original.id as string,
                        systemObj: row.original,
                        type: placementSystem ?? "",
                      })}
                  </Table.BodyRow>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {showActionButtons && isEditMode && (
        <div className="px-0">
          <Button
            className="flex w-full items-center justify-start gap-1 rounded-none border-b border-gray-200 px-3 py-2 text-[#767676]"
            onClick={() => {
              if (addRow) {
                addRow();
              } else {
                actionEditTable?.handleAddRow?.();
              }
              setMode("edit");
            }}
            variant="ghost"
          >
            <Plus className="aspect-square h-3 w-3 text-current" />
            <span className="text-sm font-medium">행 추가</span>
          </Button>
        </div>
      )}
      <div className="flex items-center pt-1">
        <p className={cn("text-error mt-1", paddingClass)}>
          {errors && errors.length > 0 && errors[0].errorMessage}
        </p>
      </div>
    </div>
  );
};
