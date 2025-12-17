import { Dispatch, SetStateAction } from "react";

import { postRunV3Engine } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TResultPrevDialogData } from "@/domain/result/hooks/useAnalysisButton";
import { useGenerateRequestData } from "@/domain/result/hooks/useGenerateRequestData";
import { useResultStore } from "@/domain/result/stores/result.store";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { TLightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";
import { useLightningStore } from "@/domain/systems/lightning/stores/lightning.store";
import { customNanoid } from "@/lib/utils";
import { TEngineSchema } from "@/schemas/engine.schema";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  setDialogData: Dispatch<SetStateAction<TResultPrevDialogData>>;
}

export const AnalysisConfirmDialog = ({ isOpen, onClose, setDialogData }: IProps) => {
  const {
    after: { item: afterItem },
    before: { item: beforeItem },
  } = useGenerateRequestData();
  const { setResult } = useResultStore();
  const lightnings = useLightningStore.getState().lightning;

  const handleRunEngine = async () => {
    setDialogData({ status: "loading" });

    try {
      const computeLightDensity = (zone: TZoneGuiSchema, lightnings: TLightningGuiSchema[]) => {
        if (!zone) return 0;
        if (zone.light_density && zone.light_density > 0) {
          return zone.light_density;
        }

        // 1) 존 바닥면적 계산
        const floorArea =
          zone.surfaces
            ?.filter((s) => s.type === "floor")
            .reduce((sum, s) => sum + (s.area || 0), 0) || 0;

        if (floorArea === 0) return 0; // 면적이 없으면 조명밀도는 0

        // 2) 존에 포함된 조명 정보 찾기
        // zone.lightning 배열은 { id, count, electric_consumption } 형태임
        const totalPower =
          zone.lightning?.reduce((sum, zLight) => {
            const master = lightnings.find((m) => m.id === zLight.id);
            if (!master) return sum;

            const power = (master.electric_consumption || 0) * (zLight.count || 0);
            return sum + power;
          }, 0) || 0;

        // 3) 조명밀도 계산
        return totalPower / floorArea;
      };

      const attachLightDensity = (item: TEngineSchema) => {
        return {
          ...item,
          building: {
            ...item.building,
            floors: item.building.floors.map((floor) => ({
              ...floor,
              zones: floor.zones.map((zone) => ({
                ...zone,
                light_density: computeLightDensity(zone, lightnings),
              })),
            })),
          },
        };
      };

      const payload = {
        after: {
          item: attachLightDensity(afterItem),
          name: customNanoid(16),
        },
        before: {
          item: attachLightDensity(beforeItem),
          name: customNanoid(16),
        },
      };

      const response = await postRunV3Engine(payload);

      if (response.status === 200) {
        setResult({
          ...response.data,
          after: {
            ...response.data.after,
            building: {
              ...response.data.after.building,
              address: afterItem.building.address,
              name: afterItem.building.name,
              north_axis: afterItem.building.north_axis,
              vintage: `${afterItem.building.vintage[0]}년 ${afterItem.building.vintage[1]}월 ${afterItem.building.vintage[2]}일`,
            },
          },
        });
        setDialogData({ data: response.data, status: "success" });
      } else {
        setDialogData({ status: "error" });
      }
    } catch (error) {
      console.error("Error in postRunV3Engine:", error);
      setDialogData({ status: "error" });
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="w-[412px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">분석하기</DialogTitle>
        </DialogHeader>
        <p className="text-bk7 text-sm">분석을 진행하시겠습니까?</p>
        <div className="flex items-center justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            취소
          </Button>
          <Button onClick={handleRunEngine}>분석</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
