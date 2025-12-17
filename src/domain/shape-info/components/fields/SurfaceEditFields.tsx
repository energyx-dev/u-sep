import Decimal from "decimal.js";
import { useEffect, useRef, useState } from "react";

import { Form, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PLACEHOLDERS } from "@/constants/placeholders";
import { FormInput } from "@/domain/basic-info/components/FormInput";
import { useBuildingInfoStore } from "@/domain/basic-info/stores/building.store";
import { ShapeInfoEditSelect } from "@/domain/shape-info/components/ShapeInfoEditInput";
import { AddAdjacentZoneButton } from "@/domain/shape-info/components/surface/AddAdjacentZoneButton";
import { FenestrationManageForm } from "@/domain/shape-info/components/surface/FenestrationManageForm";
import { SurfaceConstructionManageForm } from "@/domain/shape-info/components/surface/SurfaceConstructionManageForm";
import { useShapeInfo } from "@/domain/shape-info/hooks/useShapeInfo";
import { useSurfaceEditForm } from "@/domain/shape-info/hooks/useSurfaceEditForm";
import { useSurfaceEditor } from "@/domain/shape-info/hooks/useSurfaceEditor";
import {
  BOUNDARY_CONDITION_LABELS,
  BOUNDARY_CONDITION_TYPE,
  BUILDING_SURFACE_TYPE,
  SURFACE_TYPE_LABELS,
} from "@/domain/shape-info/schemas/surface/surface.enum";
import { getSurfaceFieldValidationRule } from "@/domain/shape-info/schemas/surface/surface.validation-rules";
import { formatZoneOrSurfaceName } from "@/domain/shape-info/utils/shape-info.utils";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

const formStyles = {
  button: "h-11 justify-start pl-3 text-left text-sm font-normal",
  container: "flex flex-col gap-4",
  grid: "grid grid-cols-2 gap-4",
  input: "h-11",
  select: "h-11 w-full",
} as const;

interface IZoneEditFormProps {
  floorId?: string;
  surfaceId?: string;
  zoneId?: string;
}

export const SurfaceEditFields = ({ floorId, surfaceId, zoneId }: IZoneEditFormProps) => {
  const { updateSurface } = useSurfaceEditor();
  const { setRemoveAdjacentId } = useShapeInfo();

  const { form, handleFieldBlur } = useSurfaceEditForm(zoneId, surfaceId);

  const prevBoundaryConditionRef = useRef(form.getValues("boundary_condition"));

  // surfaceId가 변경될 때 현재 surface의 boundary_condition으로 prev를 동기화
  useEffect(() => {
    prevBoundaryConditionRef.current = form.getValues("boundary_condition");
    // 쿨루프 반사율 표시값 변환 (저장된 값이 비율 형태일 경우 100을 곱해 표시)
    const reflectance = form.getValues("coolroof_reflectance");
    if (typeof reflectance === "number" && reflectance <= 1) {
      form.setValue("coolroof_reflectance", new Decimal(reflectance).times(100).toNumber(), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
    setCoolroofStatus(() => {
      if (form.getValues("coolroof_reflectance")) return "시공";
      else if (form.getValues("coolroof_reflectance") === null) return "미시공";
      return "";
    });
  }, [surfaceId]);

  const buildingInfo = useBuildingInfoStore((state) => state.buildingInfo);
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore();

  const { openConfirmDialog } = useConfirmDialog();

  const adjacentDisplay = formatZoneOrSurfaceName(
    form.watch("adjacent_surface_id") || form.watch("adjacent_from") || "",
    shapeInfo ?? [],
  );

  const [coolroofStatus, setCoolroofStatus] = useState("");

  const { watch } = form;

  const isCoolroofSelectable = getSurfaceFieldValidationRule({
    fieldName: "coolroof_reflectance",
    surface: watch(),
  });

  const isBoundaryConditionZone = getSurfaceFieldValidationRule({
    fieldName: "adjacent_zone_id",
    surface: watch(),
  });

  const isAdjacentDisabled = !isBoundaryConditionZone;

  const showCoolroof = isAdjacentDisabled && isCoolroofSelectable;
  const showAdjacent = !isAdjacentDisabled; // 인접면이 활성화 가능한 경우에만 표시
  const isAzimuthVisible =
    watch("boundary_condition") === BOUNDARY_CONDITION_TYPE.outdoors &&
    watch("type") === BUILDING_SURFACE_TYPE.wall;

  // 경계조건 변경 시 인접존 삭제를 사용자에게 확인
  const confirmAdjacentZoneRemoval = async () => {
    return await openConfirmDialog({
      closeText: "취소",
      confirmText: "네, 해제할게요",
      description:
        "경계 조건 변경 시, 면 속성 정보의 동기화가 중단됩니다. 링크를 해제하시겠습니까?",
      title: "인접면 링크 해제",
    });
  };

  // 경계조건 유틸
  const isOutdoors = (val: string) => val === BOUNDARY_CONDITION_TYPE.outdoors;

  const revertBoundaryToPrev = (prevVal: string) => {
    form.setValue("boundary_condition", prevVal as BOUNDARY_CONDITION_TYPE, {
      shouldDirty: false,
      shouldValidate: false,
    });
  };

  const applyBoundaryUpdate = (
    boundaryCondition: BOUNDARY_CONDITION_TYPE,
    withZoneRemoval: boolean,
  ) => {
    const outdoors = isOutdoors(boundaryCondition);
    updateSurface({
      adjacentSurfaceId: withZoneRemoval ? form.getValues("adjacent_surface_id") : undefined,
      data: {
        adjacent_surface_id: undefined,
        adjacent_zone_id: withZoneRemoval ? "" : undefined,
        boundary_condition: boundaryCondition,
        // 유효성 규칙에 맞춰 필드 정리 (기존 로직 유지)
        azimuth:
          boundaryCondition !== BOUNDARY_CONDITION_TYPE.zone
            ? undefined
            : form.getValues("azimuth"),
        coolroof_reflectance: outdoors ? undefined : form.getValues("coolroof_reflectance"),
      },
      surfaceId: surfaceId!,
    });

    // 인접존 해제 시, 연결되어 있던 인접면이 생성된 면(isGenerated)이면 삭제
    if (withZoneRemoval) {
      // 기준면에서 직접 생성된 연결 면(파생 면)들을 일괄 제거
      setRemoveAdjacentId(surfaceId!);
    }

    // 폼 값도 최신 값으로 동기화
    form.setValue("boundary_condition", boundaryCondition, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("adjacent_zone_id", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("adjacent_surface_id", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!outdoors) {
      setCoolroofStatus("");
    }

    prevBoundaryConditionRef.current = boundaryCondition;
  };

  const handleBoundaryConditionChange = async (boundaryCondition: BOUNDARY_CONDITION_TYPE) => {
    if (!surfaceId) return;

    const prev = prevBoundaryConditionRef.current;
    const hasAdjacentZone = !!form.watch("adjacent_zone_id");
    const changingZoneToOther =
      prev === BOUNDARY_CONDITION_TYPE.zone && boundaryCondition !== prev && hasAdjacentZone;

    if (changingZoneToOther) {
      const isConfirmed = await confirmAdjacentZoneRemoval();
      if (!isConfirmed) {
        revertBoundaryToPrev(prev);
        return;
      }
      // 확인 시: 인접존 해제 + 경계조건 변경 적용
      applyBoundaryUpdate(boundaryCondition, true);
      return;
    }

    // 일반 변경 흐름 (확인 없이 바로 반영)
    const outdoors = isOutdoors(boundaryCondition);
    updateSurface({
      data: {
        azimuth:
          boundaryCondition !== BOUNDARY_CONDITION_TYPE.zone
            ? undefined
            : form.getValues("azimuth"),
        boundary_condition: boundaryCondition,
        coolroof_reflectance: outdoors ? undefined : form.getValues("coolroof_reflectance"),
      },
      surfaceId,
    });

    if (!outdoors) {
      setCoolroofStatus("");
    }

    prevBoundaryConditionRef.current = boundaryCondition;
  };

  const floorConditionOptions = () => {
    const currentFloor = shapeInfo.find((floor) => floor.floor_id === floorId);
    if (!currentFloor) return Object.entries(BOUNDARY_CONDITION_LABELS);

    const surfaceType = form.getValues("type");
    const lowestFloorNumber = shapeInfo.at(-1)?.floor_number;
    const highestFloorNumber = shapeInfo[0]?.floor_number;

    // 최하층 바닥면은 "다른 존과 접합" 옵션 (boundary_condition이 zone) 제거
    const isLowestFloor = currentFloor.floor_number === lowestFloorNumber;
    if (surfaceType === BUILDING_SURFACE_TYPE.floor && isLowestFloor) {
      return Object.entries(BOUNDARY_CONDITION_LABELS).filter(
        ([key]) => key !== BOUNDARY_CONDITION_TYPE.zone,
      );
    }

    // 최상층 천장면은 "다른 존과 접합" 옵션 (boundary_condition이 zone) 제거
    const isHighestFloor = currentFloor.floor_number === highestFloorNumber;
    if (surfaceType === BUILDING_SURFACE_TYPE.ceiling && isHighestFloor) {
      return Object.entries(BOUNDARY_CONDITION_LABELS).filter(
        ([key]) => key !== BOUNDARY_CONDITION_TYPE.zone,
      );
    }

    return Object.entries(BOUNDARY_CONDITION_LABELS);
  };

  return (
    <div className="flex flex-col gap-5">
      <Form {...form}>
        <div className={formStyles.container}>
          <div className={formStyles.grid}>
            <FormInput
              className={formStyles.input}
              form={form}
              isRequired
              label={`${SURFACE_TYPE_LABELS[watch("type")]} 이름`}
              name="name"
              onBlurCallback={() => handleFieldBlur("name")}
              placeholder={PLACEHOLDERS.SURFACE.NAME[form.getValues("type")]}
            />
            <FormInput
              className={formStyles.input}
              form={form}
              isRequired
              label="면적(m²)"
              name="area"
              onBlurCallback={() => handleFieldBlur("area")}
              placeholder={PLACEHOLDERS.SURFACE.AREA}
              type="number"
            />
          </div>
          <div className={formStyles.grid}>
            <ShapeInfoEditSelect
              control={form.control}
              disabled={!!form.watch("adjacent_from")}
              isRequired
              label="경계 조건"
              name="boundary_condition"
              onValueChange={(value) =>
                handleBoundaryConditionChange(value as BOUNDARY_CONDITION_TYPE)
              }
              options={floorConditionOptions().map(([key, label]) => ({
                label,
                value: key,
              }))}
              placeholder={PLACEHOLDERS.SURFACE.BOUNDARY_CONDITION}
            />
            {showCoolroof ? (
              <div className="grid grid-cols-2 gap-1">
                <div className="flex flex-col gap-1.5">
                  <FormLabel className="text-neutral560 text-sm" isRequired>
                    쿨루프 시공 여부
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (!surfaceId) return;
                      updateSurface({
                        data: {
                          coolroof_reflectance: val === "시공" ? undefined : null,
                        },
                        surfaceId,
                      });
                      setCoolroofStatus(val);
                      form.clearErrors("coolroof_reflectance");
                    }}
                    value={coolroofStatus}
                  >
                    <SelectTrigger
                      className="disabled:bg-bk3 relative h-11 w-full"
                      disabled={!isCoolroofSelectable}
                      tooltip="종류가 천장이고 경계조건이 외기일 때 입력 가능"
                    >
                      <SelectValue placeholder={PLACEHOLDERS.SURFACE.HAS_COOLROOF} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="시공">시공</SelectItem>
                      <SelectItem value="미시공">미시공</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormInput
                  className={formStyles.input}
                  disabled={coolroofStatus !== "시공"}
                  form={form}
                  isInitUndefined
                  isRequired
                  label="쿨루프 반사율(%)"
                  name="coolroof_reflectance"
                  onBlurCallback={async () => {
                    await handleFieldBlur("coolroof_reflectance");
                    const isValid = await form.trigger("coolroof_reflectance");
                    if (isValid) {
                      const value = form.getValues("coolroof_reflectance");
                      if (typeof value === "number" && Number.isFinite(value)) {
                        if (!surfaceId) return;
                        updateSurface({
                          data: {
                            coolroof_reflectance: value,
                          },
                          surfaceId,
                        });
                      }
                    }
                  }}
                  placeholder={PLACEHOLDERS.SURFACE.COOLROOF_REFLECTANCE}
                  type="number"
                />
              </div>
            ) : showAdjacent ? (
              <div className="flex gap-1">
                <div className="flex-1">
                  <FormInput
                    className={formStyles.input}
                    disabled
                    form={form}
                    isRequired
                    label="인접 관계"
                    name="adjacent_zone_id"
                    onBlurCallback={() => handleFieldBlur("adjacent_zone_id")}
                    placeholder={PLACEHOLDERS.SURFACE.ADJACENT_ZONE_ID}
                    value={adjacentDisplay}
                  />
                </div>
                {!form.getValues("adjacent_from") && (
                  <div className="flex flex-col gap-1.5">
                    <div className="h-[17px]" />
                    <AddAdjacentZoneButton
                      floorId={floorId}
                      form={form}
                      surfaceId={surfaceId}
                      zoneId={zoneId}
                    />
                  </div>
                )}
              </div>
            ) : (
              isAzimuthVisible && (
                <FormInput
                  className={formStyles.input}
                  description={
                    <span>
                      건물 방위각:{" "}
                      {buildingInfo.north_axis ? (
                        `${buildingInfo.north_axis}°`
                      ) : (
                        <span className="text-destructive font-medium">미입력</span>
                      )}
                    </span>
                  }
                  form={form}
                  isInitUndefined
                  label="벽 방향(°)"
                  name="azimuth"
                  onBlurCallback={() => handleFieldBlur("azimuth")}
                  placeholder={PLACEHOLDERS.SURFACE.AZIMUTH}
                  type="number"
                />
              )
            )}
          </div>
        </div>
      </Form>
      <Separator />
      <SurfaceConstructionManageForm surfaceId={surfaceId!} zoneId={zoneId!} />
      <Separator />
      <FenestrationManageForm surfaceId={surfaceId!} zoneId={zoneId!} />
    </div>
  );
};
