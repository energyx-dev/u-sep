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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { EPurpose, PURPOSE_LABELS } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { cn, getPlacementDescription } from "@/lib/utils";

interface IProps<T> {
  isOpen: boolean;
  onClose: () => void;
  supplySystemId: string;
  systemObj: Partial<T>;
}

export const SupplySystemPlacementDialog = <
  T extends { id: string; name: string; purpose: EPurpose | null; type: ESupplySystemType },
>({
  isOpen,
  onClose,
  systemObj,
}: IProps<T>) => {
  const [checked, setChecked] = useState<{
    [ERemodelingType.AFTER]: { count: number; floorId: string; name: string; zoneId: string }[];
    [ERemodelingType.BEFORE]: { count: number; floorId: string; name: string; zoneId: string }[];
  }>({
    [ERemodelingType.AFTER]: [],
    [ERemodelingType.BEFORE]: [],
  });
  const [purpose, setPurpose] = useState<EPurpose | null>(systemObj.purpose || null);

  // 리모델링 전/후 데이터
  const { buildingFloors: beforeShapeInfo } = useBuildingGeometryStore(ERemodelingType.BEFORE);
  const { buildingFloors: afterShapeInfo } = useBuildingGeometryStore(ERemodelingType.AFTER);

  // setData 메소드
  const { setShapeInfo: setBeforeShapeInfo } = useDataSyncActions(ERemodelingType.BEFORE);
  const { setShapeInfo: setAfterShapeInfo } = useDataSyncActions(ERemodelingType.AFTER);

  // 공급 설비 이름
  const supplySystemName = systemObj.name;

  const beforeLength = checked[ERemodelingType.BEFORE].length;
  const afterLength = checked[ERemodelingType.AFTER].length;
  const isChecked = beforeLength > 0 || afterLength > 0;

  // 각 존 체크박스 선택 시
  const handleCheckedChange: TOnCheckedChange = ({ building, checked, floorId, name, zoneId }) => {
    if (checked) {
      setChecked((prev) => ({
        ...prev,
        [building]: [...prev[building], { count: 1, floorId, name, zoneId }],
      }));
    } else {
      setChecked((prev) => ({
        ...prev,
        [building]: prev[building].filter(
          (item) => !(item.floorId === floorId && item.zoneId === zoneId),
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
      selections: { floorId: string; zoneId: string }[],
    ) => {
      if (!selections.length) return floors;

      return floors.map((floor) => {
        const selectionsForFloor = selections.filter((s) => s.floorId === floor.floor_id);
        if (selectionsForFloor.length === 0) return floor;

        const nextZones = floor.zones.map((zone) => {
          const sel = selectionsForFloor.find((s) => s.zoneId === zone.id);

          if (sel) {
            if (purpose === EPurpose.COOLING) {
              return { ...zone, supply_system_cooling_id: systemObj.id };
            }
            if (purpose === EPurpose.HEATING) {
              return { ...zone, supply_system_heating_id: systemObj.id };
            }
            if (purpose === EPurpose.COOLING_HEATING) {
              return {
                ...zone,
                supply_system_cooling_id: systemObj.id,
                supply_system_heating_id: systemObj.id,
              };
            }
          }

          return zone;
        });

        return { ...floor, zones: nextZones };
      });
    };

    const updatedBefore = applySelections(beforeFloors, checked[ERemodelingType.BEFORE]);
    const updatedAfter = applySelections(afterFloors, checked[ERemodelingType.AFTER]);

    setBeforeShapeInfo(updatedBefore);
    setAfterShapeInfo(updatedAfter);

    toast.success(`${supplySystemName} 배치가 완료되었습니다.`);
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
            {getPlacementDescription("single", supplySystemName)}
          </DialogDescription>
        </DialogHeader>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex flex-1 gap-3 overflow-hidden">
          <div className="flex flex-col gap-2">
            <p className="text-neutral560 text-sm">위치</p>
            <div className="border-neutral160 w-[344px] flex-1 overflow-auto rounded-md border p-3">
              <ShapeTree
                depth="zone"
                onCheckedChange={handleCheckedChange}
                remodelingType={ERemodelingType.BEFORE}
                selectionType="checkbox"
              />
              <ShapeTree
                depth="zone"
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
                  <div className="space-y-4" key={`${item.floorId}-${item.zoneId}`}>
                    <p>{item.name}</p>
                    {itemIdx !== beforeLength - 1 && <Separator />}
                  </div>
                ))}
                {beforeLength > 0 && afterLength > 0 && <Separator />}
                {checked[ERemodelingType.AFTER].map((item, itemIdx) => (
                  <div className="space-y-4" key={`${item.floorId}-${item.zoneId}`}>
                    <p>{item.name}</p>
                    {itemIdx !== afterLength - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 영역 */}
        <DialogFooter className="flex justify-between gap-2 bg-white">
          <RadioGroup
            className="flex gap-2.5"
            defaultValue={systemObj.purpose || undefined}
            onValueChange={(value) => setPurpose(value as EPurpose)}
          >
            {Object.values(EPurpose).map((purpose) => (
              <div className="flex items-center gap-1" key={purpose}>
                <RadioGroupItem
                  disabled={systemObj.purpose !== purpose}
                  id={purpose}
                  value={purpose}
                />
                <Label htmlFor={purpose}>{PURPOSE_LABELS[purpose]}</Label>
              </div>
            ))}
          </RadioGroup>
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
