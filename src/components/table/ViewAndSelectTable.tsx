import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Table } from "@/components/table/Table";
import { Checkbox } from "@/components/ui/checkbox";
import Radio from "@/components/ui/radio";
import { cn } from "@/lib/utils";

/**
 * 조회 및 선택 기능을 제공하는 테이블 컴포넌트
 *
 * 주요 기능:
 * - 읽기 전용 모드: 데이터 조회만 가능
 * - 단일 선택 모드: 라디오 버튼으로 하나의 행만 선택 가능
 * - 다중 선택 모드: 체크박스로 여러 행 선택 가능
 *
 * 특징:
 * - 제네릭 타입 지원으로 다양한 데이터 타입 처리 가능
 * - TanStack Table 기반으로 구현
 */

// 공통 테이블 속성 타입
type TBaseTableProps<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any, any>[];
  data: T[];
};

// 다중 선택 테이블 속성 타입
type TMultiSelectTableProps<T> = TBaseTableProps<T> & {
  onSelectRow: (row: T) => void;
  selectedRowIds: string[];
  type: "multi-select";
};

// 읽기 전용 테이블 속성 타입
type TReadOnlyTableProps<T> = TBaseTableProps<T> & {
  type: "read-only";
};

// 단일 선택 테이블 속성 타입
type TSingleSelectTableProps<T> = TBaseTableProps<T> & {
  onSelectRow: (row: T) => void;
  selectedRowId: string;
  type: "single-select";
};

// 통합 테이블 속성 타입 (Discriminated Union)
type TTableProps<T> =
  | TMultiSelectTableProps<T>
  | TReadOnlyTableProps<T>
  | TSingleSelectTableProps<T>;

/**
 * ViewAndSelectTable 컴포넌트
 *
 * @template T - id 속성을 가진 객체 타입
 * @param props - 테이블 설정 속성 (타입에 따라 다른 속성 제공)
 * @returns 조회 및 선택 기능이 있는 테이블 JSX 엘리먼트
 */
export const ViewAndSelectTable = <T extends { id: string }>(props: TTableProps<T>) => {
  // TanStack Table 인스턴스 생성
  const table = useReactTable({
    columns: props.columns,
    data: props.data,
    getCoreRowModel: getCoreRowModel(),
  });

  // 테이블 모드 판별
  const isReadOnly = props.type === "read-only";
  const isMultiSelect = props.type === "multi-select";
  const isSingleSelect = props.type === "single-select";

  /**
   * 특정 행의 선택 상태를 확인하는 함수
   * @param rowId - 확인할 행의 ID
   * @returns 선택 여부 (boolean)
   */
  const getRowSelectionState = (rowId: string) => {
    if (isMultiSelect) {
      return props.selectedRowIds.includes(rowId);
    }
    if (isSingleSelect) {
      return props.selectedRowId === rowId;
    }
    return false;
  };

  const handleRowClick = (row: T) => {
    if (!isReadOnly) {
      props.onSelectRow(row);
    }
  };

  /**
   * 선택 컴포넌트(체크박스/라디오버튼) 렌더링 함수
   * @param row - 행 데이터
   * @param isSelected - 선택 상태
   * @returns 선택 컴포넌트 JSX 또는 null
   */
  const renderSelectionComponent = (row: T, isSelected: boolean) => {
    if (isReadOnly) return null;

    return (
      <Table.Td className="w-[14px] max-w-[14px] border-r-0 p-0 pl-1.5">
        <div
          className={cn(
            "flex h-full w-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100",
            isSelected && "opacity-100",
          )}
        >
          {isMultiSelect ? (
            <Checkbox
              checked={isSelected}
              className="bg-white"
              onClick={(e) => {
                e.stopPropagation();
                props.onSelectRow(row);
              }}
            />
          ) : (
            <Radio
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                props.onSelectRow(row);
              }}
            />
          )}
        </div>
      </Table.Td>
    );
  };

  return (
    <table className="w-full table-fixed border-separate border-spacing-0">
      {/* 테이블 헤더 */}
      <thead>
        {table.getHeaderGroups().map(({ headers, id }) => (
          <Table.HeaderRow className="bg-white" key={id}>
            {/* 선택 컬럼 헤더 (읽기 전용이 아닐 때만 표시) */}
            {!isReadOnly && (
              <Table.Th className="sticky top-0 z-1 h-full w-[14px] max-w-[14px] border-r-0 bg-white p-0 pl-1.5" />
            )}
            {/* 데이터 컬럼 헤더들 */}
            {headers.map((header) => (
              <Table.Th
                className="sticky top-0 bg-white"
                colSpan={header.colSpan}
                key={header.id}
                style={{ width: header.getSize() }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </Table.Th>
            ))}
          </Table.HeaderRow>
        ))}
      </thead>
      {/* 테이블 바디 */}
      <tbody>
        {table.getRowModel().rows.map((row) => {
          const isSelected = getRowSelectionState(row.original.id);
          return (
            <Table.BodyRow
              className={cn(
                "bg-white",
                !isReadOnly &&
                  "group hover:bg-neutral040 cursor-pointer bg-white transition-colors",
                isSelected && "bg-neutral040",
              )}
              key={row.id}
              onClick={() => handleRowClick(row.original)}
            >
              {/* 선택 컴포넌트 렌더링 */}
              {renderSelectionComponent(row.original, isSelected)}
              {/* 데이터 셀들 렌더링 */}
              {row.getVisibleCells().map((cell) => (
                <Table.Td className="break-words" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Td>
              ))}
            </Table.BodyRow>
          );
        })}
      </tbody>
    </table>
  );
};
