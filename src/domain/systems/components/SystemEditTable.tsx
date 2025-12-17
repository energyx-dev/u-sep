import { Cell, ColumnDef, flexRender } from "@tanstack/react-table";

import GroupSelectUI from "@/components/custom/select/GroupSelectUI";
import { TGroupSelectOption, TSelectOption } from "@/components/custom/select/select.types";
import SelectUI from "@/components/custom/select/SelectUI";
import { Table } from "@/components/table/Table";
import { Input } from "@/components/ui/input";
import { useActionEditTable } from "@/hooks/useActionEditTable";
import { TEditingValue, useExcelLikeTable } from "@/hooks/useExcelLikeTable";
import { TTableError } from "@/lib/table-helper";
import { cn } from "@/lib/utils";

interface IProps<T extends { id?: string; name?: string }> {
  // 제너릭 타입에 대응하기 위해
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: Partial<T>[];
  errors?: TTableError[];
  setData: (update: Partial<T>[]) => void;
  showActionButtons?: boolean; // 행 추가, 복사, 삭제 기능 있는 table
  showRequiredIndicator?: boolean; // 필수 입력 항목 표시
  tableClassName?: string;
  wrapperClassName?: string;
}

export const SystemEditTable = <T extends { id?: string; name?: string }>({
  columns,
  data,
  errors,
  setData,
  showActionButtons = true,
  showRequiredIndicator = true,
  tableClassName,
  wrapperClassName,
}: IProps<T>) => {
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
    data,
    onDataChange: setData,
  });

  const { AddRowButton, CopyOrRemoveActionButton, RowSelectCheckbox } = useActionEditTable({
    data,
    setData,
  });

  const paddingClass = showActionButtons ? "px-8" : undefined;

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

    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnId === columnId;
    const disabled = meta?.disabled?.(cell.row.original);

    const contentClass = "text-2xs p-2";
    const isError = !!errors?.find(
      (error) => error.rowIndex === rowIndex && error.columnId === columnId,
    );

    if (!isEditing) {
      return (
        <div className={cn(contentClass, isError && "text-destructive")}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            handleCellEdit({
              columnId: editingCell.columnId,
              rowIndex: editingCell.rowIndex,
              value,
            });
            handleCellEditComplete();
          }}
          options={_selectOptions}
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
          "h-full rounded-none border-none bg-transparent p-2 shadow-none outline-none focus-visible:ring-0",
          contentClass,
        )}
        defaultValue={(cell.getValue() as string) || ""}
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
            // 빈 문자열이거나 숫자만 포함된 경우에만 업데이트
            if (value === "" || /^\d*\.?\d*$/.test(value)) {
              handleCellEditChange(Number(value));
            }
            return;
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
        type={cell.column.columnDef.meta?.inputType || "text"}
      />
    );
  };

  return (
    <div className={cn("relative", wrapperClassName)}>
      {showActionButtons && CopyOrRemoveActionButton}
      <div className={cn("w-full overflow-auto", paddingClass, tableClassName)}>
        {showRequiredIndicator && (
          <p className="text-2xs text-bk7 mb-1 font-medium">
            <span className="text-destructive">{"*"}</span>
            {`표시는 필수 입력 항목입니다.`}
          </p>
        )}
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
                {showActionButtons && <th className="left-0 z-20 w-0" />}
                {headers.map((header) => {
                  const isRequired = header.column.columnDef.meta?.isRequired;
                  const headerText = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <Table.Th
                      colSpan={header.colSpan}
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      <>
                        {headerText}
                        {isRequired && <span className="text-destructive">{"*"}</span>}
                      </>
                    </Table.Th>
                  );
                })}
              </Table.HeaderRow>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <Table.BodyRow className="group" key={row.id}>
                  {showActionButtons && (
                    <td className={"relative"}>
                      <div className="absolute top-1/2 -left-6 flex h-6 w-6 -translate-y-1/2 items-center justify-center">
                        {RowSelectCheckbox({ rowIndex: row.index })}
                      </div>
                    </td>
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
                      activeCell?.rowIndex === row.index && activeCell?.columnId === cell.column.id;

                    const isError = !!errors?.find(
                      (error) => error.rowIndex === row.index && error.columnId === cell.column.id,
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
                        onDoubleClick={() => handleCellEditStart(cellPosition)}
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
              );
            })}
          </tbody>
        </table>
      </div>
      {showActionButtons && <div className="px-8">{AddRowButton}</div>}
      {errors && errors.length > 0 && (
        <p className={cn("text-error mt-1", paddingClass)}>{errors[0].errorMessage}</p>
      )}
    </div>
  );
};
