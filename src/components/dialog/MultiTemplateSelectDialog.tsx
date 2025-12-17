import { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Fragment, useState } from "react";
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
  applyText?: string; // 적용 버튼 텍스트 (기본값: "적용")
  cancelText?: string; // 취소 버튼 텍스트 (기본값: "취소")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any, any>[]; // 테이블 컬럼 정의
  dialogTitle: string; // 다이얼로그 제목
  goToPageText?: string; // 페이지 이동 버튼 텍스트
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
export const MultiTemplateSelectDialog = <T extends { id: string; name: string }>({
  applyText = "적용",
  cancelText = "취소",
  columns,
  dialogTitle,
  goToPageText,
  isOpen,
  masterList,
  onApply,
  onClose,
  onGoToPage,
  viewList,
}: IProps<T>) => {
  // 선택된 항목들과 수량 정보를 관리하는 상태
  const [selectedItems, setSelectedItems] = useState<TTemplateToInstanceMergeIds<T>[]>(viewList);

  /**
   * 테이블 행 선택/해제 핸들러
   * 이미 선택된 항목은 제거하고, 새로운 항목은 수량 1로 추가
   * @param row - 선택/해제할 행 데이터
   */
  const handleSelectRow = (row: T) => {
    const alreadySelectedItem = selectedItems.find((item) => item.id === row.id);

    if (alreadySelectedItem) {
      // 이미 선택된 항목 제거
      setSelectedItems((prev) => prev.filter((item) => item.id !== row.id));
    } else {
      // 새로운 항목 추가 (기본 수량: 1)
      const updateSelectedItems = [...selectedItems, { ...row, count: 1 }];

      // masterList기준으로 정렬하기
      const sortedSelectedItems = masterList.reduce<TTemplateToInstanceMergeIds<T>[]>(
        (acc, curr) => {
          const alreadySelectedItem = updateSelectedItems.find((item) => item.id === curr.id);
          if (alreadySelectedItem) {
            acc.push(alreadySelectedItem);
          }
          return acc;
        },
        [],
      );

      setSelectedItems(sortedSelectedItems);
    }
  };

  const handleGoToRenewablePage = () => {
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

  /**
   * 선택된 항목 제거 핸들러
   * @param id - 제거할 항목의 ID
   */
  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * 적용 버튼 클릭 핸들러
   * 선택된 항목들을 부모 컴포넌트로 전달하고 다이얼로그 닫기
   */
  const handleApply = () => {
    onApply(selectedItems);
    onClose();
    toast.success("적용되었습니다.");
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent
        className="flex max-h-[90dvh] max-w-[90vw] min-w-auto flex-col gap-5 overflow-auto sm:min-w-[840px]"
        isClose={false}
      >
        {/* 다이얼로그 헤더 */}
        <DialogHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl font-semibold">{dialogTitle}</DialogTitle>
            {/* 페이지로 이동 버튼 (선택적) */}
            {goToPageText && (
              <NavigationButton onClick={handleGoToRenewablePage}>{goToPageText}</NavigationButton>
            )}
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
                    {/* 선택된 항목 이름 */}
                    <span className="text-sm font-medium">{name}</span>
                    <div className="flex items-center gap-2">
                      {/* 수량 조정 스테퍼 */}
                      <NewStepperUI
                        min={1}
                        onValueChange={(value) => handleChangeCountValue({ id, value })}
                        value={count}
                      />
                      {/* 항목 제거 버튼 */}
                      <Button onClick={() => handleRemoveItem(id)} size={"sm"} variant="ghost">
                        <X className="text-neutral480" />
                      </Button>
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
              <Button onClick={onClose} type="button" variant="outline">
                {cancelText}
              </Button>
            </DialogClose>
            {/* 적용 버튼 */}
            <Button onClick={handleApply} type="button">
              {applyText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
