import { useOverlay } from "@toss/use-overlay";
import Decimal from "decimal.js";
import { useCallback, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { STEP_PATH } from "@/constants/routes";
import { VentilationManageDialog } from "@/domain/shape-info/components/zone/VentilationManageDialog";
import { useZoneEditor } from "@/domain/shape-info/hooks/useZoneEditor";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { useVentilationSystemStore } from "@/domain/systems/ventilation/stores/ventilation.store";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { convertInstancesToTemplate, convertTemplateToInstanceMergeIds } from "@/lib/convert";

export const useVentilationManage = ({
  form,
  zoneId,
}: {
  form: UseFormReturn<TZoneGuiSchema>;
  zoneId: string;
}) => {
  const overlay = useOverlay();
  const navigate = useNavigate();
  const { getZoneById, updateZone } = useZoneEditor();

  const zoneData = getZoneById(zoneId);

  const { ventilation_systems } = useVentilationSystemStore(
    useShallow((state) => ({
      ventilation_systems: state.ventilation_systems,
    })),
  );

  const ventilation_systemsWithScaledEfficiency = ventilation_systems.map((sys) => ({
    ...sys,
    efficiency_cooling: new Decimal(sys.efficiency_cooling).times(100).toNumber(),
    efficiency_heating: new Decimal(sys.efficiency_heating).times(100).toNumber(),
  }));

  const masterVentilationSystems = ventilation_systems.filter(
    (ventilation) => ventilation.id === zoneData?.ventilation_system_id,
  );

  const masterVentilationSystemsWithScaledEfficiency = masterVentilationSystems.map((sys) => ({
    ...sys,
    efficiency_cooling: new Decimal(sys.efficiency_cooling).times(100).toNumber(),
    efficiency_heating: new Decimal(sys.efficiency_heating).times(100).toNumber(),
  }));

  // 확인 다이얼로그 훅
  const { openConfirmDialog } = useConfirmDialog();

  // 마스터 데이터와 템플릿 데이터를 병합하여 view용 데이터 생성
  const viewData = useMemo(
    () =>
      convertTemplateToInstanceMergeIds({
        masterList: ventilation_systemsWithScaledEfficiency,
        templateList: convertInstancesToTemplate({
          instanceList: masterVentilationSystemsWithScaledEfficiency ?? [],
        }),
      }),
    [ventilation_systemsWithScaledEfficiency, masterVentilationSystemsWithScaledEfficiency],
  );

  const handleGoToRenewablePage = useCallback(() => {
    navigate(STEP_PATH.VENTILATION_SYSTEMS.path);
  }, [navigate]);

  const handleOpenVentilationSelectDialog = useCallback(async () => {
    if (ventilation_systems.length === 0) {
      const isConfirmed = await openConfirmDialog({
        closeText: "취소",
        confirmText: "환기 설비 등록하기",
        description: "등록된 환기 설비가 없습니다.",
        title: "환기 설비 없음",
      });

      if (isConfirmed) {
        navigate(STEP_PATH.VENTILATION_SYSTEMS.path);
      }
      return;
    }

    overlay.open(({ close, isOpen }) => (
      <VentilationManageDialog
        data={ventilation_systemsWithScaledEfficiency}
        dialogTitle="환기 설비"
        isOpen={isOpen}
        onClose={close}
        onGoToPage={handleGoToRenewablePage}
        onSelect={(val) => {
          form.setValue("ventilation_system_id", val.id, { shouldValidate: true });
          updateZone(zoneId, { ventilation_system_id: val.id as string });
        }}
        selectedData={viewData[0] || {}}
      />
    ));
  }, [
    handleGoToRenewablePage,
    masterVentilationSystemsWithScaledEfficiency,
    navigate,
    openConfirmDialog,
    overlay,
    ventilation_systemsWithScaledEfficiency,
    viewData,
  ]);

  return { handleOpenVentilationSelectDialog, viewData };
};
