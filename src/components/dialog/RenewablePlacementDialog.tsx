import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { NewStepperUI } from "@/components/custom/NewStepperUI";
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
import { useRenewableStore } from "@/domain/systems/renewable/stores/renewable.store";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { cn, getPlacementDescription } from "@/lib/utils";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  renewableSystemId: string;
}

export const RenewablePlacementDialog = ({ isOpen, onClose, renewableSystemId }: IProps) => {
  // 모달 내 체크박스 및 카운트 상태 관리
  const [checked, setChecked] = useState({
    [ERemodelingType.AFTER]: { count: 0 },
    [ERemodelingType.BEFORE]: { count: 0 },
  });

  // 리모델링 전/후 데이터
  const {
    version: { name: beforeVersionName },
  } = useBeforeBuildingGeometryStore(
    useShallow((state) => ({
      ...state,
    })),
  );
  const {
    version: { name: afterVersionName },
  } = useAfterBuildingGeometryStore(
    useShallow((state) => ({
      ...state,
    })),
  );

  // 현재 리모델링 버전의 신재생 데이터
  const { photovoltaic_systems: photovoltaicSystemTemplatesBefore } = useBuildingGeometryStore(
    ERemodelingType.BEFORE,
  );
  const { photovoltaic_systems: photovoltaicSystemTemplatesAfter } = useBuildingGeometryStore(
    ERemodelingType.AFTER,
  );

  // setData 메소드
  const { setRenewableSystem: setBeforeRenewableSystem } = useDataSyncActions(
    ERemodelingType.BEFORE,
  );
  const { setRenewableSystem: setAfterRenewableSystem } = useDataSyncActions(ERemodelingType.AFTER);

  // 신재생 데이터
  const { photovoltaic_systems: masterPhotovoltaicSystemState } = useRenewableStore(
    useShallow((state) => ({
      photovoltaic_systems: state.photovoltaic_systems,
    })),
  );

  const photovoltaicSystemsName = useMemo(() => {
    return masterPhotovoltaicSystemState.find((v) => v.id === renewableSystemId)?.name;
  }, [masterPhotovoltaicSystemState, renewableSystemId]);

  const beforeCount = checked[ERemodelingType.BEFORE].count;
  const afterCount = checked[ERemodelingType.AFTER].count;

  const isChecked = beforeCount > 0 || afterCount > 0;

  // 각 버전 체크박스 선택 시
  const handleCheckedChange: TOnCheckedChange = ({ building, checked }) => {
    if (checked) {
      setChecked((prev) => ({
        ...prev,
        [building]: {
          ...prev[building],
          count: 1,
        },
      }));
    } else {
      setChecked((prev) => ({
        ...prev,
        [building]: {
          ...prev[building],
          count: 0,
        },
      }));
    }
  };

  // 적용 클릭 이벤트
  const handleApply = () => {
    const prevBefore = photovoltaicSystemTemplatesBefore ?? [];
    const prevAfter = photovoltaicSystemTemplatesAfter ?? [];

    const beforePV =
      beforeCount > 0
        ? (() => {
            const existing = prevBefore.find((v) => v.id === renewableSystemId);
            if (existing) {
              // same id exists → accumulate counts
              return prevBefore.map((v) =>
                v.id === renewableSystemId ? { count: v.count + beforeCount, id: v.id } : v,
              );
            }
            // no existing → append new
            return [...prevBefore, { count: beforeCount, id: renewableSystemId }];
          })()
        : prevBefore;

    const afterPV =
      afterCount > 0
        ? (() => {
            const existing = prevAfter.find((v) => v.id === renewableSystemId);
            if (existing) {
              return prevAfter.map((v) =>
                v.id === renewableSystemId ? { count: v.count + afterCount, id: v.id } : v,
              );
            }
            return [...prevAfter, { count: afterCount, id: renewableSystemId }];
          })()
        : prevAfter;

    setBeforeRenewableSystem({
      photovoltaic_systems: beforePV,
    });

    setAfterRenewableSystem({
      photovoltaic_systems: afterPV,
    });

    toast.success(`${photovoltaicSystemsName} 배치가 완료되었습니다.`);
    onClose();
    return;
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="flex max-h-[90dvh] max-w-[90vw] flex-col overflow-auto sm:max-w-fit"
        isClose={false}
        onEscapeKeyDown={onClose}
        onInteractOutside={onClose}
      >
        {/* 헤더 영역 */}
        <DialogHeader className="sticky top-0 z-10 bg-white">
          <DialogTitle className="text-xl font-semibold">배치하기</DialogTitle>
          <DialogDescription className={cn(isChecked ? "w-full" : "w-[344px]")}>
            {getPlacementDescription("multiple", photovoltaicSystemsName)}
          </DialogDescription>
        </DialogHeader>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex flex-1 gap-3 overflow-auto">
          <div className="space-y-2">
            <p className="text-neutral560 text-sm">위치</p>
            <div className="border-neutral160 h-[528px] w-[344px] overflow-auto rounded-md border p-3">
              <ShapeTree
                depth="version"
                onCheckedChange={handleCheckedChange}
                remodelingType={ERemodelingType.BEFORE}
                selectionType="checkbox"
              />
              <ShapeTree
                depth="version"
                onCheckedChange={handleCheckedChange}
                remodelingType={ERemodelingType.AFTER}
                selectionType="checkbox"
              />
            </div>
          </div>
          {isChecked && (
            <div className="space-y-2">
              <p className="text-neutral560 text-sm">개수</p>
              <div className="h-[528px] w-[344px] space-y-4 overflow-auto p-3">
                {beforeCount > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <p>{beforeVersionName}</p>
                    <NewStepperUI
                      min={1}
                      onValueChange={(value) =>
                        setChecked((prev) => ({
                          ...prev,
                          [ERemodelingType.BEFORE]: {
                            ...prev[ERemodelingType.BEFORE],
                            count: value,
                          },
                        }))
                      }
                      value={beforeCount}
                    />
                  </div>
                )}
                {afterCount > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <p>{afterVersionName}</p>
                    <NewStepperUI
                      min={1}
                      onValueChange={(value) =>
                        setChecked((prev) => ({
                          ...prev,
                          [ERemodelingType.AFTER]: {
                            ...prev[ERemodelingType.AFTER],
                            count: value,
                          },
                        }))
                      }
                      value={afterCount}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 영역 */}
        <DialogFooter className="sticky bottom-0 flex flex-col gap-2 bg-white">
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button onClick={onClose} variant="outline">
                취소
              </Button>
            </DialogClose>
            <Button disabled={beforeCount === 0 && afterCount === 0} onClick={handleApply}>
              적용
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
