import { useState } from "react";
import { toast } from "sonner";

import { ShapeTree, TOnCheckedChange } from "@/components/custom/ShapeTree";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TSurfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { cn, getPlacementDescription } from "@/lib/utils";

interface IProps<T> {
  isOpen: boolean;
  onClose: () => void;
  systemObj: Partial<T>;
}

export const SurfaceConstructionPlacementDialog = <
  T extends Omit<TSurfaceConstructionEngineAndGuiSchema, "type"> & { type: BUILDING_SURFACE_TYPE },
>({
  isOpen,
  onClose,
  systemObj,
}: IProps<T>) => {
  const [checked, setChecked] = useState<{
    [ERemodelingType.AFTER]: {
      count: number;
      floorId: string;
      name: string;
      surfaceId: string;
      zoneId: string;
    }[];
    [ERemodelingType.BEFORE]: {
      count: number;
      floorId: string;
      name: string;
      surfaceId: string;
      zoneId: string;
    }[];
  }>({
    [ERemodelingType.AFTER]: [],
    [ERemodelingType.BEFORE]: [],
  });
  // 리모델링 전/후 데이터
  const { buildingFloors: beforeShapeInfo } = useBuildingGeometryStore(ERemodelingType.BEFORE);
  const { buildingFloors: afterShapeInfo } = useBuildingGeometryStore(ERemodelingType.AFTER);

  // setData 메소드
  const { setShapeInfo: setBeforeShapeInfo } = useDataSyncActions(ERemodelingType.BEFORE);
  const { setShapeInfo: setAfterShapeInfo } = useDataSyncActions(ERemodelingType.AFTER);

  // 면 구조체 이름
  const surfaceConstructionName = systemObj.name;

  const beforeLength = checked[ERemodelingType.BEFORE].length;
  const afterLength = checked[ERemodelingType.AFTER].length;
  const isChecked = beforeLength > 0 || afterLength > 0;

  // disabled 조건 계산 (타입이 일치하지 않거나 인접존을 가지고 있다면 true 리턴, 그렇지 않다면 false 리턴)
  const computeDisabled = (surface: TSurfaceGuiSchema) => {
    const isTypeMatching =
      (surface.type === BUILDING_SURFACE_TYPE.floor &&
        systemObj.type === BUILDING_SURFACE_TYPE.floor) ||
      (surface.type === BUILDING_SURFACE_TYPE.wall &&
        systemObj.type === BUILDING_SURFACE_TYPE.wall) ||
      (surface.type === BUILDING_SURFACE_TYPE.ceiling &&
        systemObj.type === BUILDING_SURFACE_TYPE.floor);

    const hasAdjacentInfo = !!surface.adjacent_from;

    return !(isTypeMatching && !hasAdjacentInfo);
  };

  // 각 면 체크박스 선택 시
  const handleCheckedChange: TOnCheckedChange = ({
    building,
    checked,
    floorId,
    name,
    surfaceId,
    zoneId,
  }) => {
    if (checked) {
      setChecked((prev) => ({
        ...prev,
        [building]: [...prev[building], { count: 1, floorId, name, surfaceId, zoneId }],
      }));
    } else {
      setChecked((prev) => ({
        ...prev,
        [building]: prev[building].filter(
          (item) =>
            !(item.floorId === floorId && item.zoneId === zoneId && item.surfaceId === surfaceId),
        ),
      }));
    }
  };

  // 적용 클릭 이벤트
  const handleApply = () => {
    const beforeFloors = beforeShapeInfo ?? [];
    const afterFloors = afterShapeInfo ?? [];

    const applySelections = (
      floors: typeof beforeFloors,
      selections: {
        floorId: string;
        surfaceId: string;
        zoneId: string;
      }[],
    ) => {
      if (!selections.length) return floors;

      const oppositeUpdates = new Map<string, string>();

      const pass1Floors = floors.map((floor) => {
        const selectionsForFloor = selections.filter((s) => s.floorId === floor.floor_id);
        if (selectionsForFloor.length === 0) return floor;

        const nextZones = floor.zones.map((zone) => {
          const selectionsForZone = selectionsForFloor.filter((s) => s.zoneId === zone.id);
          if (selectionsForZone.length === 0) return zone;

          const updatedSurfaces = zone.surfaces.map((surface) => {
            const sel = selectionsForZone.find((s) => s.surfaceId === surface.id);

            if (!sel) return surface;

            const updatedSurface = {
              ...surface,
              construction_id: systemObj.id!,
            };

            if (surface.adjacent_surface_id) {
              oppositeUpdates.set(surface.adjacent_surface_id, systemObj.id!);
            }

            return updatedSurface;
          });

          return { ...zone, surfaces: updatedSurfaces };
        });

        return { ...floor, zones: nextZones };
      });

      const pass2Floors = pass1Floors.map((floor) => {
        const nextZones = floor.zones.map((zone) => {
          const nextSurfaces = zone.surfaces.map((surface) => {
            const overwriteId = oppositeUpdates.get(surface.id);
            if (!overwriteId) return surface;

            return {
              ...surface,
              construction_id: overwriteId,
            };
          });

          return { ...zone, surfaces: nextSurfaces };
        });

        return { ...floor, zones: nextZones };
      });

      return pass2Floors;
    };

    const updatedBefore = applySelections(beforeFloors, checked[ERemodelingType.BEFORE]);
    const updatedAfter = applySelections(afterFloors, checked[ERemodelingType.AFTER]);

    setBeforeShapeInfo(updatedBefore);
    setAfterShapeInfo(updatedAfter);

    toast.success(`${surfaceConstructionName} 배치가 완료되었습니다.`);
    onClose();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="flex h-[90dvh] max-h-[720px] max-w-[90vw] flex-col sm:max-w-fit"
        isClose={false}
        onEscapeKeyDown={onClose}
        onInteractOutside={onClose}
      >
        {/* 헤더 영역 */}
        <DialogHeader className="sticky top-0 z-10 bg-white">
          <DialogTitle className="text-xl font-semibold">배치하기</DialogTitle>
          <DialogDescription className={cn(isChecked ? "w-full" : "w-[344px]")}>
            {getPlacementDescription("single", surfaceConstructionName)}
          </DialogDescription>
        </DialogHeader>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex flex-1 gap-3 overflow-hidden">
          <div className="flex flex-col gap-2">
            <p className="text-neutral560 text-sm">위치</p>
            <div className="border-neutral160 w-[344px] flex-1 overflow-auto rounded-md border p-3">
              <ShapeTree
                depth="surface"
                getIsDisabled={computeDisabled}
                onCheckedChange={handleCheckedChange}
                remodelingType={ERemodelingType.BEFORE}
                selectionType="checkbox"
              />
              <ShapeTree
                depth="surface"
                getIsDisabled={computeDisabled}
                onCheckedChange={handleCheckedChange}
                remodelingType={ERemodelingType.AFTER}
                selectionType="checkbox"
              />
            </div>
          </div>
          {isChecked && (
            <div className="flex flex-col gap-2">
              <p className="text-neutral560 text-sm">개수</p>
              <div className="w-[344px] flex-1 space-y-4 overflow-auto p-3">
                {checked[ERemodelingType.BEFORE].map((item, itemIdx) => (
                  <div
                    className="space-y-4"
                    key={`${item.floorId}-${item.zoneId}-${item.surfaceId}`}
                  >
                    <p>{item.name}</p>
                    {itemIdx !== beforeLength - 1 && <Separator />}
                  </div>
                ))}
                {beforeLength > 0 && afterLength > 0 && <Separator />}
                {checked[ERemodelingType.AFTER].map((item, itemIdx) => (
                  <div
                    className="space-y-4"
                    key={`${item.floorId}-${item.zoneId}-${item.surfaceId}`}
                  >
                    <p>{item.name}</p>
                    {itemIdx !== afterLength - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 영역 */}
        <DialogFooter className="flex gap-2 bg-white">
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button onClick={onClose} variant="outline">
                취소
              </Button>
            </DialogClose>
            <Button disabled={beforeLength === 0 && afterLength === 0} onClick={handleApply}>
              적용
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
