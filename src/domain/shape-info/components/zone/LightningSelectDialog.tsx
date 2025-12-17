import { ColumnDef } from "@tanstack/react-table";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

import { NavigationButton } from "@/components/custom/buttons/NavigationButton";
import { NewStepperUI } from "@/components/custom/NewStepperUI";
import { ViewAndSelectTable } from "@/components/table/ViewAndSelectTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { TTemplateToInstanceMergeIds } from "@/lib/convert";

/**
 * 다중 템플릿 선택 다이얼로그 컴포넌트
 *
 * 주요 기능:
 * - 마스터 리스트에서 여러 항목을 선택할 수 있는 테이블 제공
 * - 선택된 항목들의 수량을 StepperUI로 조정 가능
 * - 선택된 항목들을 개별적으로 제거 가능
 * - 적용 시 선택된 항목들과 수량 정보를 콜백으로 전달
 *
 * @param T - id와 name 속성을 가진 객체 타입
 */
interface IProps<T extends { id: string; name: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any, any>[]; // 테이블 컬럼 정의
  dialogTitle: string; // 다이얼로그 제목
  isOpen: boolean; // 다이얼로그 열림 상태
  masterList: T[]; // 선택 가능한 전체 항목 리스트
  onApply: (selectedItems: TTemplateToInstanceMergeIds<T>[]) => void; // 적용 시 실행될 콜백
  onClose: () => void; // 다이얼로그 닫기 콜백
  onGoToPage?: () => void; // 페이지 이동 콜백
  viewList: TTemplateToInstanceMergeIds<T>[]; // 초기 선택된 항목들 (수량 정보 포함)
}

/**
 * MultiTemplateSelectDialog 컴포넌트
 *
 * @param props - 다이얼로그 설정 속성들
 * @returns 다중 템플릿 선택 다이얼로그 JSX 엘리먼트
 */
export const LightningSelectDialog = <T extends { id: string; name: string }>({
  columns,
  dialogTitle,
  isOpen,
  masterList,
  onApply,
  onClose,
  onGoToPage,
  viewList,
}: IProps<T>) => {
  // 선택된 항목들과 수량 정보를 관리하는 상태
  const [selectedItems, setSelectedItems] = useState<TTemplateToInstanceMergeIds<T>[]>(viewList);

  useEffect(() => {
    setSelectedItems(viewList);
  }, [viewList]);

  /**
   * 테이블 행 선택/해제 핸들러
   * 이미 선택된 항목은 제거하고, 새로운 항목은 수량 1로 추가
   * @param row - 선택/해제할 행 데이터
   */
  const handleSelectRow = (row: T) => {
    const exists = selectedItems.some((item) => item.id === row.id);

    // 선택 해제: 해당 항목만 제거
    if (exists) {
      setSelectedItems((prev) => prev.filter((item) => item.id !== row.id));
      return;
    }

    // 선택 추가: 기존 선택(필요 시 manual 제거)에 새 항목을 추가하고 masterList 순서로 정렬
    setSelectedItems(() => {
      const next = [
        ...selectedItems,
        { ...(row as T), count: 1 } as TTemplateToInstanceMergeIds<T>,
      ];
      const ordered = masterList.reduce<TTemplateToInstanceMergeIds<T>[]>((acc, curr) => {
        const found = next.find((it) => it.id === curr.id);
        if (found) acc.push(found);
        return acc;
      }, []);
      return ordered;
    });
  };

  const handleGoToPage = () => {
    onGoToPage?.();
  };

  /**
   * 선택된 항목의 수량 변경 핸들러
   * @param id - 수량을 변경할 항목의 ID
   * @param value - 새로운 수량 값
   */
  const handleChangeCountValue = ({ id, value }: { id: string; value: number }) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, count: value } : item)),
    );
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="flex max-h-[90dvh] max-w-[90vw] min-w-auto flex-col gap-5 overflow-auto sm:min-w-[840px]"
        isClose={false}
      >
        {/* 다이얼로그 헤더 */}
        <DialogHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl font-semibold">{dialogTitle}</DialogTitle>
            <NavigationButton onClick={handleGoToPage}>조명 페이지</NavigationButton>
          </div>
        </DialogHeader>

        {/* 선택 가능한 항목들을 보여주는 테이블 */}
        <div className="max-h-[278px] overflow-auto">
          <ViewAndSelectTable
            columns={columns}
            data={masterList}
            onSelectRow={handleSelectRow}
            selectedRowIds={selectedItems.map((item) => item.id)}
            type="multi-select"
          />
        </div>

        {/* 선택된 항목들과 수량 조정 영역 */}
        {selectedItems.length > 0 && (
          <div className="text-neutral640 flex max-h-[268px] flex-col gap-3 overflow-auto px-1">
            {selectedItems.map(({ count, id, name }, index) => {
              const isLastItem = selectedItems.length - 1 === index;
              return (
                <Fragment key={id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{name}</span>
                    <div className="flex items-center gap-2">
                      <NewStepperUI
                        min={1}
                        onValueChange={(value) => handleChangeCountValue({ id, value })}
                        value={count}
                      />
                    </div>
                  </div>
                  {!isLastItem && <Separator />}
                </Fragment>
              );
            })}
          </div>
        )}

        {/* 다이얼로그 푸터 (버튼들) */}
        <DialogFooter className="sticky bottom-0 justify-end bg-white">
          <div className="flex gap-2">
            {/* 취소 버튼 */}
            <DialogClose asChild>
              <Button
                onClick={() => {
                  setSelectedItems(viewList);
                  onClose();
                }}
                type="button"
                variant="outline"
              >
                취소
              </Button>
            </DialogClose>
            {/* 적용 버튼 */}
            <Button
              onClick={() => {
                onApply(selectedItems);
                onClose();
                toast.success("적용되었습니다.");
              }}
              type="button"
            >
              적용
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
