import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { isEqual } from "es-toolkit";
import { useCallback, useRef, useState } from "react";

import { getCellValue } from "@/lib/table.utils";
import { TViewMode } from "@/types/view-mode.type";

export type TEditingValue = boolean | null | number | string | undefined;

type TCellPosition = {
  columnId: string;
  rowIndex: number;
};

type TCellSelectionArea = {
  end: TCellPosition;
  start: TCellPosition;
};

type TParams<T extends object> = {
  columns: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  data: T[];
  isPagination?: boolean;
  mode?: TViewMode;
  onDataChange?: (newData: T[]) => void;
};

/**
 * 엑셀과 같은 기능(영역 선택, 복사/붙여넣기)을 갖춘 테이블 훅
 */
export const useExcelLikeTable = <T extends object>({
  columns,
  data,
  isPagination = false,
  mode: tableMode = "view",
  onDataChange,
}: TParams<T>) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [editingValue, setEditingValue] = useState<TEditingValue>(); // 편집 중인 셀의 값

  const [selectedArea, setSelectedArea] = useState<null | TCellSelectionArea>(null); // 선택한 셀의 영역
  const [activeCell, setActiveCell] = useState<null | TCellPosition>(null); // 활설화된 셀
  const [editingCell, setEditingCell] = useState<null | TCellPosition>(null); // 편집중인 셀
  const [isSelecting, setIsSelecting] = useState(false); // 드래그하여 영역을 선택하는 중인지 여부

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isPagination ? getPaginationRowModel() : undefined,
  });

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback(
    ({ columnId, rowIndex }: TCellPosition) => {
      if (!isSelecting || !activeCell) return;

      // 선택 영역 업데이트
      setSelectedArea((prev) => ({
        end: { columnId, rowIndex },
        start: prev?.start || activeCell,
      }));
    },
    [isSelecting, activeCell],
  );

  // 마우스 업 핸들러
  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  // 셀 편집 핸들러
  const handleCellEdit = useCallback(
    ({ columnId, rowIndex, value }: TCellPosition & { value: TEditingValue }) => {
      if (!onDataChange) return;

      const newData = [...data];
      const row = table.getRowModel().rows.find((r) => r.index === rowIndex);
      if (!row) return;

      const newRow = { ...newData[rowIndex], [columnId]: value };
      newData[rowIndex] = newRow;

      onDataChange(newData);
    },
    [data, onDataChange, table],
  );

  // 셀 클릭 핸들러
  const handleCellClick = useCallback(
    (targetCell: TCellPosition) => {
      setIsSelecting(true);
      setSelectedArea({ end: targetCell, start: targetCell });

      // 현재 편집 중인 셀과 클릭한 셀이 같다면 종료
      const isSameCell = isEqual(editingCell, targetCell);
      if (isSameCell) return;

      // 현재 편집 중인 셀이 있다면 해당 셀의 값을 저장
      if (editingCell) {
        handleCellEdit({
          columnId: editingCell.columnId,
          rowIndex: editingCell.rowIndex,
          value: editingValue,
        });
      }

      setActiveCell(targetCell);
      setEditingCell(null); // 편집 모드 종료
    },
    [editingCell, editingValue, handleCellEdit],
  );

  // 셀 편집 완료 핸들러
  const handleCellEditComplete = useCallback(() => {
    setEditingCell(null);
    tableRef.current?.focus();
  }, []);

  // 셀 편집 시작 핸들러
  const handleCellEditStart = useCallback(
    ({ columnId, rowIndex }: TCellPosition) => {
      setEditingCell({ columnId, rowIndex });

      // 초기값 설정
      const row = table.getRowModel().rows.find((r) => r.index === rowIndex);
      const cell = row?.getVisibleCells().find((c) => c.column.id === columnId);

      const originalValue = (cell?.row.original as Record<string, unknown>)[columnId];
      setEditingValue(originalValue as TEditingValue);
    },
    [table],
  );

  const handleCellDoubleClick = useCallback(
    (currentCell: TCellPosition) => {
      if (
        currentCell.columnId === editingCell?.columnId &&
        currentCell.rowIndex === editingCell.rowIndex
      )
        return;
      handleCellEditStart(currentCell);
    },
    [editingCell, handleCellEditStart],
  );

  // 셀 편집 값 변경 핸들러
  const handleCellEditChange = useCallback((value: TEditingValue) => {
    setEditingValue(value);
  }, []);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, updateCellPosition?: TCellPosition) => {
      if (!activeCell) return;

      const target = e.target as HTMLElement; // HTMLElement로 캐스팅
      const isInputHandle = target.tagName === "INPUT" && updateCellPosition;

      const allColumnIds = table.getAllColumns().map((col) => col.id);
      const currentColIdx = allColumnIds.indexOf(activeCell.columnId);
      const currentRowIdx = table
        .getRowModel()
        .rows.findIndex((row) => row.index === activeCell.rowIndex);

      if (editingCell && (e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "c")) {
        return;
      }

      // 편집 모드에서 엔터 키 처리
      if (editingCell && e.key === "Enter") {
        if (isInputHandle) {
          handleCellEdit({
            ...updateCellPosition,
            value: (e.currentTarget as HTMLInputElement).value,
          });
        }
        handleCellEditComplete();
        e.preventDefault();
        return;
      }

      // 테이블이 편집 모드이고 편집중인 셀이 없다면, 엔터 키로 활성화된 셀을 편집 모드로 전환
      if (tableMode === "edit" && !editingCell && e.key === "Enter") {
        handleCellEditStart(activeCell);
        e.preventDefault();
        return;
      }

      // 복사/붙여넣기 처리
      if (tableMode === "edit" && selectedArea) {
        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
          copySelectedArea();
          e.preventDefault();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
          pasteFromClipboard();
          e.preventDefault();
          return;
        }
      }

      // 화살표 키나 탭 키로 셀 이동
      let newRowIdx = currentRowIdx;
      let newColIdx = currentColIdx;

      switch (e.key) {
        case "ArrowDown":
          if (currentRowIdx < table.getRowModel().rows.length - 1) newRowIdx = currentRowIdx + 1;
          break;
        case "ArrowLeft":
          // 편집 중일 때 Shift + ArrowLeft는 무시
          if (e.shiftKey && editingCell) return;
          if (currentColIdx > 0) newColIdx = currentColIdx - 1;
          break;
        case "ArrowRight":
          // 편집 중일 때 Shift + ArrowRight는 무시
          if (e.shiftKey && editingCell) return;
          if (currentColIdx < allColumnIds.length - 1) newColIdx = currentColIdx + 1;
          break;
        case "ArrowUp":
          if (currentRowIdx > 0) newRowIdx = currentRowIdx - 1;
          break;
        case "Tab":
          e.preventDefault();
          if (currentColIdx < allColumnIds.length - 1) {
            newColIdx = currentColIdx + 1;
          } else if (currentRowIdx < table.getRowModel().rows.length - 1) {
            newRowIdx = currentRowIdx + 1;
            newColIdx = 0;
          }
          break;
        default:
          // 테이블이 편집 모드이고 편집중인 셀이 없다면, 편집 가능한 문자(printable characters) 입력 시 활성화된 셀을 편집 모드로 전환
          if (
            tableMode === "edit" &&
            !editingCell &&
            e.key.length === 1 &&
            !e.ctrlKey &&
            !e.metaKey
          ) {
            e.preventDefault();
            handleCellEditStart(activeCell);
            return;
          }
          return;
      }

      // 현재 위치와 새로운 위치가 다른 경우에만 이동
      if (newRowIdx !== currentRowIdx || newColIdx !== currentColIdx) {
        if (isInputHandle) {
          handleCellEdit({
            ...updateCellPosition,
            value: (e.currentTarget as HTMLInputElement).value,
          });
          handleCellEditComplete();
        }

        const newRow = table.getRowModel().rows[newRowIdx];
        if (newRow) {
          const newPosition = {
            columnId: allColumnIds[newColIdx],
            rowIndex: newRow.index,
          };
          setActiveCell(newPosition);
          setSelectedArea({ end: newPosition, start: newPosition });
          e.preventDefault();
        }
      }
    },
    [activeCell, editingCell, selectedArea, table, handleCellEditComplete],
  );

  // 선택 영역 복사
  const copySelectedArea = useCallback(() => {
    if (!selectedArea) return;

    // 선택된 영역의 경계 계산
    const tableRows = table.getRowModel().rows;

    const startRowIdx = Math.min(
      tableRows.findIndex((row) => row.index === selectedArea.start.rowIndex),
      tableRows.findIndex((row) => row.index === selectedArea.end.rowIndex),
    );

    const endRowIdx = Math.max(
      tableRows.findIndex((row) => row.index === selectedArea.start.rowIndex),
      tableRows.findIndex((row) => row.index === selectedArea.end.rowIndex),
    );

    const allColumnIds = table.getAllColumns().map((col) => col.id);

    const startColIdx = Math.min(
      allColumnIds.indexOf(selectedArea.start.columnId),
      allColumnIds.indexOf(selectedArea.end.columnId),
    );

    const endColIdx = Math.max(
      allColumnIds.indexOf(selectedArea.start.columnId),
      allColumnIds.indexOf(selectedArea.end.columnId),
    );

    // 선택된 셀들의 데이터 수집
    const selectedColumns = allColumnIds.slice(startColIdx, endColIdx + 1);

    const copyData = tableRows
      .slice(startRowIdx, endRowIdx + 1)
      .map((row) => {
        return selectedColumns
          .map((colId) => {
            const value = (row.original as Record<string, unknown>)[colId];
            return value;
          })
          .join("\t");
      })
      .join("\n");

    // 클립보드에 복사
    navigator.clipboard.writeText(copyData);
  }, [selectedArea, table]);

  // 클립보드에서 붙여넣기
  const pasteFromClipboard = useCallback(async () => {
    if (!activeCell || !onDataChange) return;

    try {
      const clipboardText = await navigator.clipboard.readText();

      // 각 행에서 \r 문자 제거 (엑셀에서 복사할 때 이슈)
      const pasteRows = clipboardText.split("\n").map((row) => row.replace(/\r/g, ""));

      // 붙여넣을 데이터 처리
      const tableRows = table.getRowModel().rows;
      const allColumnIds = table.getAllColumns().map((col) => col.id);
      const activeRowIdx = tableRows.findIndex((row) => row.index === activeCell.rowIndex);
      const activeColIdx = allColumnIds.indexOf(activeCell.columnId);
      const activeRowCells = tableRows[activeRowIdx].getVisibleCells();
      const activeRow = tableRows[activeRowIdx].original;

      if (activeRowIdx === -1 || activeColIdx === -1) return;

      // 데이터 변경 적용
      const newData = [...data];

      pasteRows.forEach((rowStr, rowOffset) => {
        const targetRowIdx = activeRowIdx + rowOffset;
        if (targetRowIdx >= tableRows.length) return;

        const rowValues = rowStr.split("\t");

        rowValues.forEach((value, colOffset) => {
          const targetColIdx = activeColIdx + colOffset;
          if (targetColIdx >= allColumnIds.length) return;

          const targetColumnId = allColumnIds[targetColIdx];
          const column = table.getColumn(targetColumnId);

          if (column) {
            // accessorKey 또는 id로 접근
            const columnId = column.id;
            const rowIndex = tableRows[targetRowIdx].index;
            const targetRow = tableRows[targetRowIdx];

            // disabled 체크
            const meta = column.columnDef.meta;
            const isDisabled = meta?.disabled?.(targetRow.original);

            if (isDisabled) return;

            if (rowIndex < newData.length) {
              const cell = activeRowCells[targetColIdx];

              // 데이터 타입에 따라 변환 (문자열, 숫자, 불리언 등)
              const newValue = getCellValue({
                cellMeta: cell.column.columnDef.meta,
                pastedRowValue: value,
                rowData: activeRow,
              });

              (newData[rowIndex] as Record<string, unknown>)[columnId] = newValue;
            }
          }
        });
      });

      onDataChange(newData);
    } catch (err) {
      console.error("클립보드 접근 오류:", err);
    }
  }, [activeCell, data, onDataChange, table]);

  // 셀이 선택 영역에 포함되어 있는지 확인
  const isCellSelected = useCallback(
    ({ columnId, rowIndex }: TCellPosition) => {
      if (!selectedArea) return false;

      const tableRows = table.getRowModel().rows;
      const allColumnIds = table.getAllColumns().map((col) => col.id);

      // 행 범위 확인
      const rowsRange = [
        tableRows.findIndex((row) => row.index === selectedArea.start.rowIndex),
        tableRows.findIndex((row) => row.index === selectedArea.end.rowIndex),
      ].sort((a, b) => a - b);

      // 열 범위 확인
      const colsRange = [
        allColumnIds.indexOf(selectedArea.start.columnId),
        allColumnIds.indexOf(selectedArea.end.columnId),
      ].sort((a, b) => a - b);

      const currentRowIdx = tableRows.findIndex((row) => row.index === rowIndex);
      const currentColIdx = allColumnIds.indexOf(columnId);

      return (
        currentRowIdx >= rowsRange[0] &&
        currentRowIdx <= rowsRange[1] &&
        currentColIdx >= colsRange[0] &&
        currentColIdx <= colsRange[1]
      );
    },
    [selectedArea, table],
  );

  const clear = () => {
    setActiveCell(null);
    setSelectedArea(null);
  };

  return {
    activeCell,
    clear,
    editingCell,
    editingValue,
    handleCellClick,
    handleCellDoubleClick,
    handleCellEdit,
    handleCellEditChange,
    handleCellEditComplete,
    handleCellEditStart,
    handleKeyDown,
    handleMouseMove,
    handleMouseUp,
    isCellSelected,
    isSelecting,
    selectedArea,
    setEditingCell,
    table,
    tableRef,
  };
};
