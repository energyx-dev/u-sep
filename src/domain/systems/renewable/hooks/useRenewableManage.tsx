import { useOverlay } from "@toss/use-overlay";
import Decimal from "decimal.js";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { MultiTemplateSelectDialog } from "@/components/dialog/MultiTemplateSelectDialog";
import { STEP_PATH } from "@/constants/routes";
import { PHOTOVOLTAIC_SYSTEM_COLUMNS } from "@/domain/systems/renewable/photovoltaic/constants/photovoltaic.column";
import { TPhotovoltaicSystemEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import { useRenewableStore } from "@/domain/systems/renewable/stores/renewable.store";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { convertTemplateToInstanceMergeIds, TTemplateToInstanceMergeIds } from "@/lib/convert";
import { useRemodelingTypeStore } from "@/store/remodeling-type.store";

/**
 * 신재생 에너지 시스템 관리를 위한 커스텀 훅
 *
 * - 태양광 시스템 템플릿과 마스터 데이터를 관리
 * - 신재생 설비 선택 다이얼로그 제어
 * - 신재생 설비 적용 및 페이지 이동 기능 제공
 *
 */
export const useRenewableManage = () => {
  const overlay = useOverlay();
  const navigate = useNavigate();

  const remodelingType = useRemodelingTypeStore(useShallow((state) => state.remodelingType));
  const { photovoltaic_systems: photovoltaicSystemTemplates } =
    useBuildingGeometryStore(remodelingType);
  const { setRenewableSystem } = useDataSyncActions(remodelingType);
  const { photovoltaic_systems: masterPhotovoltaicSystems } = useRenewableStore(
    useShallow((state) => ({
      photovoltaic_systems: state.photovoltaic_systems,
    })),
  );

  const masterPhotovoltaicSystemsWithScaledEfficiency = masterPhotovoltaicSystems.map((sys) => ({
    ...sys,
    efficiency: new Decimal(sys.efficiency).times(100).toNumber(),
  }));

  // 확인 다이얼로그 훅
  const { openConfirmDialog } = useConfirmDialog();

  // 마스터 데이터와 템플릿 데이터를 병합하여 view용 데이터 생성
  const viewData = useMemo(
    () =>
      convertTemplateToInstanceMergeIds({
        masterList: masterPhotovoltaicSystemsWithScaledEfficiency,
        templateList: photovoltaicSystemTemplates,
      }),
    [masterPhotovoltaicSystemsWithScaledEfficiency, photovoltaicSystemTemplates],
  );

  const handleGoToRenewablePage = useCallback(() => {
    navigate(STEP_PATH.RENEWABLE_SYSTEMS.path);
  }, [navigate]);

  /**
   * 선택된 신재생 설비를 적용하는 핸들러
   * @param selectedItems - 선택된 태양광 시스템 아이템 목록
   */
  const handleApply = useCallback(
    (selectedItems: TTemplateToInstanceMergeIds<TPhotovoltaicSystemEngineAndGuiSchema>[]) => {
      setRenewableSystem({
        photovoltaic_systems: selectedItems.map(({ count, id }) => ({
          count,
          id,
        })),
      });
    },
    [setRenewableSystem],
  );

  /**
   * 신재생 설비 선택 다이얼로그를 여는 핸들러
   * - 등록된 설비가 없으면 확인 다이얼로그를 통해 등록 페이지로 이동
   * - 등록된 설비가 있으면 선택 다이얼로그를 표시
   */
  const handleOpenRenewableSelectDialog = useCallback(async () => {
    // 등록된 신재생 설비가 없으면 등록 페이지로 이동
    if (masterPhotovoltaicSystems.length === 0) {
      const isConfirmed = await openConfirmDialog({
        closeText: "취소",
        confirmText: "신재생 설비 등록하기",
        description: "등록된 신재생 설비가 없습니다.",
        title: "신재생 설비 없음",
      });

      if (isConfirmed) {
        navigate(STEP_PATH.RENEWABLE_SYSTEMS.path);
      }
      return;
    }

    // 등록된 신재생 설비가 있으면 선택 다이얼로그 열기
    overlay.open(({ close, isOpen }) => (
      <MultiTemplateSelectDialog
        applyText="적용"
        cancelText="취소"
        columns={PHOTOVOLTAIC_SYSTEM_COLUMNS}
        dialogTitle="신재생"
        goToPageText="신재생 페이지"
        isOpen={isOpen}
        masterList={masterPhotovoltaicSystemsWithScaledEfficiency}
        onApply={handleApply}
        onClose={close}
        onGoToPage={handleGoToRenewablePage}
        viewList={viewData}
      />
    ));
  }, [
    handleApply,
    handleGoToRenewablePage,
    masterPhotovoltaicSystems,
    navigate,
    openConfirmDialog,
    overlay,
    viewData,
    masterPhotovoltaicSystemsWithScaledEfficiency,
  ]);

  return { handleOpenRenewableSelectDialog, viewData };
};
