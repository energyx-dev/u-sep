import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { TableForm } from "@/components/layout/TableFormLayout";
import { ViewAndSelectTable } from "@/components/table/ViewAndSelectTable";
import { STEP_PATH } from "@/constants/routes";
import { LightningConfirmDialog } from "@/domain/shape-info/components/zone/LightningConfirmDialog";
import { LightningDensityManageDialog } from "@/domain/shape-info/components/zone/LightningDensityManageDialog";
import { LightningSelectDialog } from "@/domain/shape-info/components/zone/LightningSelectDialog";
import { useZoneEditor } from "@/domain/shape-info/hooks/useZoneEditor";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { LIGHTNING_DENSITY_COLUMNS } from "@/domain/systems/lightning/constants/lightning-density.column";
import { LIGHTNING_COLUMNS } from "@/domain/systems/lightning/constants/lightning.column";
import { TLightningDensityGuiSchema } from "@/domain/systems/lightning/schemas/lightning-density.schema";
import { TLightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";
import { useLightningDensityStore } from "@/domain/systems/lightning/stores/lightning-density.store";
import { useLightningStore } from "@/domain/systems/lightning/stores/lightning.store";
import { convertTemplateToInstanceMergeIds, TTemplateToInstanceMergeIds } from "@/lib/convert";
import { cn } from "@/lib/utils";

type TProps = {
  form: UseFormReturn<TZoneGuiSchema>;
  zoneId: string;
};

const columnHelper = createColumnHelper<TTemplateToInstanceMergeIds<TLightningGuiSchema>>();

export const LightningForm = ({ form, zoneId }: TProps) => {
  const navigate = useNavigate();
  const { getZoneById, updateZone } = useZoneEditor();
  const zoneData = getZoneById(zoneId);

  const { lightning: masterLightnings } = useLightningStore(
    useShallow((state) => ({
      lightning: state.lightning,
    })),
  );
  const { density: masterLightningDensity } = useLightningDensityStore(
    useShallow((state) => ({
      density: state.density,
    })),
  );

  const [dialogType, setDialogType] = useState<
    | "confirm-empty"
    | "confirm-only-density"
    | "confirm-only-lightning"
    | "confirm-select"
    | "density"
    | "lightning"
    | null
  >(null);
  const [confirmOptions, setConfirmOptions] = useState<null | {
    closeText: string;
    description: string;
    firstActionText: string;
    onClose: () => void;
    onFirstAction: () => void;
    onSecondAction?: () => void;
    secondActionText?: string;
    title: string;
  }>(null);

  const templateListWithCount = useMemo(
    () =>
      (zoneData?.lightning ?? []).map(({ count, id }) => ({
        count: typeof count === "number" && count > 0 ? count : 1,
        id,
      })),
    [zoneData?.lightning],
  );

  const lightningViewData = useMemo(
    () =>
      convertTemplateToInstanceMergeIds({
        masterList: masterLightnings,
        templateList: templateListWithCount,
      }),
    [masterLightnings, templateListWithCount],
  );

  const lightningDensityViewData = useMemo(() => {
    if (!zoneData?.density) return [];

    return zoneData.density.map((saved) => {
      const master = masterLightningDensity.find((m) => m.id === saved.id);

      if (!master) {
        return saved;
      }
      return {
        ...saved,
        ...master,
      };
    });
  }, [masterLightningDensity, zoneData?.density]);

  const VIEW_COLUMNS = useMemo(() => {
    return [
      ...LIGHTNING_COLUMNS,
      columnHelper.accessor((row) => row.count, {
        header: "개수",
        id: "count",
        size: 100,
      }),
    ];
  }, []);

  const computeDensityFromItems = (
    items: TTemplateToInstanceMergeIds<TLightningGuiSchema>[],
    surfaces?: TSurfaceGuiSchema[],
  ) => {
    if (!surfaces) return undefined;

    const totalElectricConsumption = items.reduce(
      (acc, curr) => acc + curr.electric_consumption * (curr.count || 0),
      0,
    );

    const totalFloorArea = surfaces.reduce(
      (acc, curr) => acc + (curr.type === "floor" ? curr.area || 0 : 0),
      0,
    );

    return totalFloorArea > 0 ? totalElectricConsumption / totalFloorArea : undefined;
  };

  const lightDensity = useMemo(
    () => computeDensityFromItems(lightningViewData, zoneData?.surfaces),
    [zoneData?.surfaces, lightningViewData],
  );

  const handleGoToLightningPage = useCallback(() => {
    navigate(STEP_PATH.LIGHTNING.path);
  }, [navigate]);

  const handleApply = useCallback(
    (selectedItems: TTemplateToInstanceMergeIds<TLightningGuiSchema>[]) => {
      form.setValue(
        "lightning",
        selectedItems.map(({ count, ...rest }) => ({
          ...rest,
          count,
        })),
        { shouldValidate: true },
      );
      form.setValue("density", []);
      form.setValue("light_density", selectedItems.length > 0 ? 0 : undefined, {
        shouldValidate: true,
      });
      updateZone(zoneId, {
        density: [],
        light_density: selectedItems.length > 0 ? 0 : undefined,
        lightning: selectedItems.map(({ count, ...rest }) => ({
          ...rest,
          count,
        })),
      });
    },
    [zoneId, updateZone, form],
  );

  const handleSelectDensity = useCallback(
    (val?: TLightningDensityGuiSchema) => {
      form.setValue("density", val ? [val] : [], { shouldValidate: true });
      form.setValue("light_density", val?.density, { shouldValidate: true });
      updateZone(zoneId, { density: val ? [val] : [], light_density: val?.density, lightning: [] });
    },
    [form, zoneId],
  );

  const handleOpenManageDialog = useCallback(() => {
    // 조명 설비/밀도 둘 다 없는 경우
    if (masterLightnings.length === 0 && masterLightningDensity.length === 0) {
      setConfirmOptions({
        closeText: "취소",
        description: "등록된 조명 설비/밀도가 없습니다.",
        firstActionText: "조명 설비/밀도 등록하기",
        onClose: () => setDialogType(null),
        onFirstAction: () => navigate(STEP_PATH.LIGHTNING.path),
        title: "조명 설비/밀도 없음",
      });
      setDialogType("confirm-empty");
      return;
    }

    // 조명 설비는 존재하고 조명 밀도는 없는 경우
    if (masterLightnings.length > 0 && masterLightningDensity.length === 0) {
      setConfirmOptions({
        closeText: "취소",
        description: "조명 등록 방식을 선택해 주세요.",
        firstActionText: "밀도 등록하기",
        onClose: () => setDialogType(null),
        onFirstAction: () => navigate(STEP_PATH.LIGHTNING.path),
        onSecondAction: () => setDialogType("lightning"),
        secondActionText: "설비 선택",
        title: "조명 등록",
      });
      setDialogType("confirm-only-lightning");
      return;
    }

    // 조명 설비는 없고 조명 밀도는 존재하는 경우
    if (masterLightnings.length === 0 && masterLightningDensity.length > 0) {
      setConfirmOptions({
        closeText: "취소",
        description: "조명 등록 방식을 선택해 주세요.",
        firstActionText: "설비 등록하기",
        onClose: () => setDialogType(null),
        onFirstAction: () => navigate(STEP_PATH.LIGHTNING.path),
        onSecondAction: () => setDialogType("density"),
        secondActionText: "밀도 선택",
        title: "조명 등록",
      });
      setDialogType("confirm-only-density");
      return;
    }

    // 조명 설비/밀도 둘 다 존재하는 경우
    setConfirmOptions({
      closeText: "취소",
      description: "조명 등록 방식을 선택해 주세요.",
      firstActionText: "설비 선택",
      onClose: () => setDialogType(null),
      onFirstAction: () => setDialogType("lightning"),
      onSecondAction: () => setDialogType("density"),
      secondActionText: "밀도 선택",
      title: "조명 등록",
    });
    setDialogType("confirm-select");
  }, [masterLightnings, masterLightningDensity, navigate]);

  return (
    <>
      <div className="flex items-center gap-3">
        <TableForm.Header isRequired onClickManage={handleOpenManageDialog} title="조명" />
        {form.formState.errors.lightning && (
          <span className="text-error">{form.formState.errors.lightning.message}</span>
        )}
      </div>
      {lightningViewData.length > 0 ? (
        <div>
          <ViewAndSelectTable columns={VIEW_COLUMNS} data={lightningViewData} type="read-only" />
          <div className="border-neutral160 text-neutral640 flex items-center justify-between border-b px-3 py-2 text-sm">
            <span className="font-semibold">조명 밀도 자동 계산(W/m²)</span>
            <span className={cn("font-medium", !lightDensity && "text-neutral240")}>
              {lightDensity?.toLocaleString() || "바닥 면의 면적을 입력하면 자동 계산됩니다."}
            </span>
          </div>
        </div>
      ) : lightningDensityViewData.length > 0 ? (
        <ViewAndSelectTable
          columns={LIGHTNING_DENSITY_COLUMNS}
          data={lightningDensityViewData}
          type="read-only"
        />
      ) : null}

      {confirmOptions && (
        <LightningConfirmDialog
          confirmOptions={confirmOptions}
          dialogType={dialogType}
          setConfirmOptions={setConfirmOptions}
        />
      )}
      <LightningSelectDialog
        columns={LIGHTNING_COLUMNS}
        dialogTitle="조명"
        isOpen={dialogType === "lightning"}
        masterList={masterLightnings}
        onApply={handleApply}
        onClose={() => setDialogType(null)}
        onGoToPage={handleGoToLightningPage}
        viewList={lightningViewData}
      />
      <LightningDensityManageDialog
        data={masterLightningDensity}
        dialogTitle="조명"
        isOpen={dialogType === "density"}
        onClose={() => setDialogType(null)}
        onGoToPage={handleGoToLightningPage}
        onSelect={handleSelectDensity}
        selectedData={lightningDensityViewData[0]}
      />
    </>
  );
};
