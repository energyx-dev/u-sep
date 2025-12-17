import { Cell, ColumnDef, flexRender } from "@tanstack/react-table";

import { EmptyText } from "@/components/custom/EmptySystems";
import { Table } from "@/components/table/Table";
import { useExcelLikeTable } from "@/hooks/useExcelLikeTable";
import { TTableError } from "@/lib/table-helper";
import { cn } from "@/lib/utils";
import { TViewMode } from "@/types/view-mode.type";

interface IProps<T extends { id?: string; name: string }> {
  // 제너릭 타입에 대응하기 위해
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: Partial<T>[];
  errors?: TTableError[];
  getPlacementButton?: ({
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
  setData: (update: Partial<T>[]) => void;
  setMode: (mode: TViewMode) => void;
}

export const SurfaceConstructionsViewTable = <T extends { id?: string; name: string }>({
  columns,
  data,
  errors,
  getPlacementButton,
  setData,
  setMode,
}: IProps<T>) => {
  const {
    activeCell,
    handleCellClick,
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

  const isEmpty = data.length === 0;

  const renderCell = ({
    cell,
    columnId,
    rowIndex,
  }: {
    cell: Cell<Partial<T>, unknown>;
    columnId: keyof T;
    rowIndex: number;
  }) => {
    // const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnId === columnId;

    const contentClass = "text-sm p-2";
    const isError = !!errors?.find(
      (error) => error.rowIndex === rowIndex && error.columnId === columnId,
    );
    const isLayersCell = columnId === "layers";

    // Always render layers cell with 선택 button, regardless of editing state
    if (isLayersCell) {
      const rawValue = cell.getValue() as unknown;
      const items: string[] = Array.isArray(rawValue)
        ? (rawValue as string[])
        : rawValue != null
          ? [String(rawValue)]
          : [];

      return (
        <div
          className={cn(
            contentClass,
            "flex items-center justify-between",
            isError && "text-destructive",
          )}
        >
          <div className="truncate">
            <div className="flex gap-1 overflow-x-scroll">
              {items.map((text, idx) => (
                <p
                  className="bg-neutral240 rounded-md px-2 py-1.5 whitespace-nowrap text-white"
                  key={idx}
                  title={text}
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // For all non-layers cells, always render as read-only
    return (
      <div className={cn(contentClass, isError && "text-destructive")}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    );
  };

  // table 최대 길이 유지하기 위한 코드
  const totalColumns = table.getVisibleFlatColumns().length;

  // getPlacementButton 는 함수가 아닌 컴포넌트
  const PlacementButton = getPlacementButton;

  return (
    <div className="relative">
      <div className="w-full">
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
                {headers.map((header) => {
                  const headerText = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <Table.Th
                      className="bg-white text-sm"
                      colSpan={header.colSpan}
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {headerText}
                    </Table.Th>
                  );
                })}
                {getPlacementButton && !isEmpty && <Table.Th className="w-12" />}
              </Table.HeaderRow>
            ))}
          </thead>
          <tbody>
            {isEmpty ? (
              <Table.BodyRow>
                <Table.Td
                  className="border-b border-gray-200 py-2.5 text-center"
                  colSpan={totalColumns}
                >
                  <EmptyText emptyText="등록된 면 구조체가 없습니다." />
                </Table.Td>
              </Table.BodyRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Table.BodyRow key={row.id}>
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

                    const cellClass = cn(
                      "cursor-cell select-none p-0 text-sm",
                      isSelected && "bg-primary-muted/20 hover:bg-primary-muted/40",
                      isActive && "outline outline-2 outline-primary outline-offset-[-2px]",
                      !isSelected && !isActive && "hover:bg-primary/5",
                      isError && "outline-destructive outline outline-1 outline-offset-[-1px]",
                    );

                    const cellPosition = { columnId: cell.column.id, rowIndex: row.index };
                    return (
                      <Table.Td
                        className={cellClass}
                        key={cell.id}
                        onDoubleClick={() => {
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
                  {PlacementButton && (
                    <PlacementButton
                      systemId={row.original.id as string}
                      systemObj={row.original}
                      type="surfaceConstruction"
                    />
                  )}
                </Table.BodyRow>
              ))
            )}
          </tbody>
        </table>
      </div>
      {errors && errors.length > 0 && (
        <p className="text-error mt-1 font-medium">{errors[0].errorMessage}</p>
      )}
    </div>
  );
};
