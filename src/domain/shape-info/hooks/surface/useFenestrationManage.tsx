import { useOverlay } from "@toss/use-overlay";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { MultiTemplateSelectDialog } from "@/components/dialog/MultiTemplateSelectDialog";
import { STEP_PATH } from "@/constants/routes";
import { useFenestrationColumn } from "@/domain/fenestration/hooks/useFenestrationColumn";
import { TFenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import { useFenestrationStore } from "@/domain/fenestration/stores/fenestration.store";
import { useSurfaceEditor } from "@/domain/shape-info/hooks/useSurfaceEditor";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { convertTemplateToInstanceMergeIds, TTemplateToInstanceMergeIds } from "@/lib/convert";

/**
 * 개구부 관리를 위한 커스텀 훅
 *
 * - 개구부 선택 다이얼로그 제어
 * - 개구부 적용 및 페이지 이동 기능 제공
 *
 */
export const useFenestrationManage = ({
  surfaceId,
  zoneId,
}: {
  surfaceId: string;
  zoneId: string;
}) => {
  const overlay = useOverlay();
  const navigate = useNavigate();
  const { getSurfaceById, updateSurface } = useSurfaceEditor();
  const { columns } = useFenestrationColumn();

  const surfaceData = getSurfaceById({ surfaceId, zoneId });

  const { fenestrations: masterFenestrations } = useFenestrationStore(
    useShallow((state) => ({
      fenestrations: state.fenestrations,
    })),
  );

  // 확인 다이얼로그 훅
  const { openConfirmDialog } = useConfirmDialog();

  const templateListWithCount = useMemo(
    () =>
      (surfaceData?.fenestrations ?? []).map(({ count, id }) => ({
        count: typeof count === "number" && count > 0 ? count : 1,
        id,
      })),
    [surfaceData?.fenestrations],
  );

  // 마스터 데이터와 템플릿 데이터를 병합하여 view용 데이터 생성
  const viewData = useMemo(
    () =>
      convertTemplateToInstanceMergeIds({
        masterList: masterFenestrations,
        templateList: templateListWithCount,
      }),
    [masterFenestrations, surfaceData?.fenestrations],
  );

  const handleGoToRenewablePage = useCallback(() => {
    navigate(STEP_PATH.FENESTRATION.path);
  }, [navigate]);

  /**
   * 선택된 개구부를 적용하는 핸들러
   * @param selectedItems - 선택된 태양광 시스템 아이템 목록
   */
  const handleApply = useCallback(
    (selectedItems: TTemplateToInstanceMergeIds<TFenestrationEngineAndGuiSchema>[]) => {
      updateSurface({
        adjacentSurfaceId: surfaceData?.adjacent_surface_id,
        data: {
          fenestrations: selectedItems.map(({ count, ...rest }) => ({
            ...rest,
            count,
          })),
        },
        surfaceId,
      });
    },
    [surfaceId, updateSurface],
  );

  /**
   * 개구부 선택 다이얼로그를 여는 핸들러
   * - 등록된 개구부가 없으면 확인 다이얼로그를 통해 등록 페이지로 이동
   * - 등록된 개구부가 있으면 선택 다이얼로그를 표시
   */
  const handleOpenFenestrationSelectDialog = useCallback(async () => {
    // 등록된 개구부가 없으면 등록 페이지로 이동
    if (masterFenestrations.length === 0) {
      const isConfirmed = await openConfirmDialog({
        closeText: "취소",
        confirmText: "개구부 등록하기",
        description: "등록된 개구부가 없습니다.",
        title: "개구부 없음",
      });

      if (isConfirmed) {
        navigate(STEP_PATH.FENESTRATION.path);
      }
      return;
    }

    // 등록된 개구부가 있으면 선택 다이얼로그 열기
    overlay.open(({ close, isOpen }) => (
      <MultiTemplateSelectDialog
        applyText="적용"
        cancelText="취소"
        columns={columns}
        dialogTitle="개구부"
        goToPageText="개구부 페이지"
        isOpen={isOpen}
        masterList={masterFenestrations}
        onApply={handleApply}
        onClose={close}
        onGoToPage={handleGoToRenewablePage}
        viewList={viewData}
      />
    ));
  }, [
    handleApply,
    handleGoToRenewablePage,
    masterFenestrations,
    navigate,
    openConfirmDialog,
    overlay,
    viewData,
  ]);

  return { handleOpenFenestrationSelectDialog, viewData };
};
