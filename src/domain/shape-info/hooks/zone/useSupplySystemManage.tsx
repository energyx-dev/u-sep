import { useOverlay } from "@toss/use-overlay";
import { sortBy } from "es-toolkit";
import { useCallback, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { STEP_PATH } from "@/constants/routes";
import { SupplyManageDialog } from "@/domain/shape-info/components/zone/SupplyManageDialog";
import { TAnySupplySystemRow } from "@/domain/shape-info/components/zone/SupplySystemAddTableList";
import { useZoneEditor } from "@/domain/shape-info/hooks/useZoneEditor";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { SUPPLY_SYSTEM_LABEL } from "@/domain/systems/supply/constants/supply-system.constants";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { useSupplySystemStore } from "@/domain/systems/supply/stores/supplySystem.store";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { isAllArraysEmpty } from "@/lib/utils";

export const useSupplySystemManage = ({
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

  // 확인 다이얼로그 훅
  const { coolingSupplySystems, heatingSupplySystems } = useSupplySystemStore
    .getState()
    .getSupplySystemByPurposeStore();

  const sortedHeatingSupplySystems = useMemo(
    () =>
      sortBy(
        Object.entries(heatingSupplySystems).map(([key, data]) => {
          const type = key as ESupplySystemType;
          return {
            data,
            label: SUPPLY_SYSTEM_LABEL[type],
            type,
          };
        }),
        ["label"],
      ),
    [heatingSupplySystems],
  );

  const sortedCoolingSupplySystems = useMemo(
    () =>
      sortBy(
        Object.entries(coolingSupplySystems).map(([key, data]) => {
          const type = key as ESupplySystemType;
          return {
            data,
            label: SUPPLY_SYSTEM_LABEL[type],
            type,
          };
        }),
        ["label"],
      ),
    [coolingSupplySystems],
  );

  const isEmptyHeatingSupplySystem = isAllArraysEmpty(heatingSupplySystems);
  const isEmptyCoolingSupplySystem = isAllArraysEmpty(coolingSupplySystems);

  const viewHeatingSupplyData = useMemo(
    () => sortBy(sortedHeatingSupplySystems, ["label"]),
    [sortedHeatingSupplySystems],
  );

  const viewCoolingSupplyData = useMemo(
    () => sortBy(sortedCoolingSupplySystems, ["label"]),
    [sortedCoolingSupplySystems],
  );

  const findSupplySystemByHeatingId = useCallback(
    (heatingId?: null | string) => {
      if (!heatingId) return null;
      for (const group of viewHeatingSupplyData) {
        const found = group.data.find((item) => item.id === heatingId);
        if (found) {
          // attach the parent system type to the row, so downstream consumers get a fully-typed row
          return { ...found, type: group.type } as const;
        }
      }
      return null;
    },
    [viewHeatingSupplyData],
  );

  const findSupplySystemByCoolingId = useCallback(
    (coolingId?: null | string) => {
      if (!coolingId) return null;
      for (const group of viewCoolingSupplyData) {
        const found = group.data.find((item) => item.id === coolingId);
        if (found) {
          // attach the parent system type to the row, so downstream consumers get a fully-typed row
          return { ...found, type: group.type } as const;
        }
      }
      return null;
    },
    [viewCoolingSupplyData],
  );

  const preselectedHeatingSupplySystem = useMemo(() => {
    const found = findSupplySystemByHeatingId(zoneData?.supply_system_heating_id);
    return found ? [found] : [];
  }, [findSupplySystemByHeatingId, zoneData?.supply_system_heating_id]);

  const preselectedCoolingSupplySystem = useMemo(() => {
    const found = findSupplySystemByCoolingId(zoneData?.supply_system_cooling_id);
    return found ? [found] : [];
  }, [findSupplySystemByCoolingId, zoneData?.supply_system_cooling_id]);

  const handleGoToSupplySystemPage = useCallback(() => {
    navigate(STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path);
  }, [navigate]);

  const { openConfirmDialog } = useConfirmDialog();

  const handleOpenHeatingSupplySystemSelectDialog = useCallback(async () => {
    // 등록된 개구부가 없으면 등록 페이지로 이동
    if (isEmptyHeatingSupplySystem) {
      const isConfirmed = await openConfirmDialog({
        closeText: "취소",
        confirmText: "공급 설비 등록하기",
        description: "등록된 공급 설비가 없습니다.",
        title: "공급 설비 없음",
      });

      if (isConfirmed) {
        navigate(STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path);
      }
      return;
    }

    // 등록된 개구부가 있으면 선택 다이얼로그 열기
    overlay.open(({ close, isOpen }) => (
      <SupplyManageDialog
        data={sortedHeatingSupplySystems}
        dialogTitle="난방용 공급 설비"
        isOpen={isOpen}
        onClose={close}
        onGoToPage={handleGoToSupplySystemPage}
        onSelect={(val) => {
          form.setValue("supply_system_heating_id", val.id, { shouldValidate: true });
          updateZone(zoneId, { supply_system_heating_id: val.id as string });
        }}
        selectedData={(preselectedHeatingSupplySystem[0] ?? {}) as TAnySupplySystemRow}
      />
    ));
  }, [
    handleGoToSupplySystemPage,
    heatingSupplySystems,
    navigate,
    openConfirmDialog,
    overlay,
    viewHeatingSupplyData,
  ]);

  const handleOpenCoolingSupplySystemSelectDialog = useCallback(async () => {
    // 등록된 개구부가 없으면 등록 페이지로 이동
    if (isEmptyCoolingSupplySystem) {
      const isConfirmed = await openConfirmDialog({
        closeText: "취소",
        confirmText: "공급 설비 등록하기",
        description: "등록된 공급 설비가 없습니다.",
        title: "공급 설비 없음",
      });

      if (isConfirmed) {
        navigate(STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path);
      }
      return;
    }

    // 등록된 개구부가 있으면 선택 다이얼로그 열기
    overlay.open(({ close, isOpen }) => (
      <SupplyManageDialog
        data={sortedCoolingSupplySystems}
        dialogTitle="냉방용 공급 설비"
        isOpen={isOpen}
        onClose={close}
        onGoToPage={handleGoToSupplySystemPage}
        onSelect={(val) => {
          form.setValue("supply_system_cooling_id", val.id, { shouldValidate: true });
          updateZone(zoneId, { supply_system_cooling_id: val.id as string });
        }}
        selectedData={(preselectedCoolingSupplySystem[0] ?? {}) as TAnySupplySystemRow}
      />
    ));
  }, [
    handleGoToSupplySystemPage,
    heatingSupplySystems,
    navigate,
    openConfirmDialog,
    overlay,
    viewHeatingSupplyData,
  ]);

  return {
    handleOpenCoolingSupplySystemSelectDialog,
    handleOpenHeatingSupplySystemSelectDialog,
    viewCoolingData: preselectedCoolingSupplySystem,
    viewHeatingData: preselectedHeatingSupplySystem,
  };
};
