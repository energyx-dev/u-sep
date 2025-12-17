import { Dispatch, SetStateAction, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { FloatingWindow } from "@/components/ui/floating-window";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DebugCommonAccordion } from "@/domain/result/components/debug/DebugCommonAccordion";
import { DebugRemodelingAccordion } from "@/domain/result/components/debug/DebugRemodelingAccordion";
import { TDebugErrorSetWithCount } from "@/domain/result/helpers/debug.ui.helper";
import { TResultPrevDialogData } from "@/domain/result/hooks/useAnalysisButton";
import { ERemodelingType } from "@/enums/ERemodelingType";

interface IProps {
  debugResult: TDebugErrorSetWithCount;
  isMinimized: boolean;
  isOpen: boolean;
  onClose: () => void;
  setDialogData: Dispatch<SetStateAction<TResultPrevDialogData>>;
  setIsMinimized: (minimized: boolean) => void;
  type: "debug-optional" | "debug-required";
}

export const DebugFloatingWindow = ({
  debugResult,
  isMinimized,
  isOpen,
  onClose,
  setDialogData,
  setIsMinimized,
  type,
}: IProps) => {
  const isRequired = type === "debug-required";
  const title = isRequired ? "필수 항목" : "권장 항목";
  const description = isRequired
    ? "분석을 위해 다음 항목의 입력이 필요합니다."
    : "최적의 분석을 위해 다음 항목의 입력을 권장합니다.";

  // 공통
  const isExistCommonSourceSystem = debugResult.common.sourceSystem.length > 0;
  const isExistCommonSupplySystem = debugResult.common.supplySystem.length > 0;
  const isExistCommonVentilationSystem = debugResult.common.ventilationSystem.length > 0;
  const isExistCommonBuildingInfo = debugResult.common.buildingInfo.length > 0;
  const isExistCommon =
    isExistCommonSourceSystem ||
    isExistCommonSupplySystem ||
    isExistCommonVentilationSystem ||
    isExistCommonBuildingInfo;

  // 리모델링 전
  const isExistBeforeShapeInfo = debugResult.before.shapeInfo.length > 0;
  const isExistBeforePhotovoltaicSysInfo = debugResult.before.renewableSys.length > 0;
  const isExistBefore = isExistBeforeShapeInfo || isExistBeforePhotovoltaicSysInfo;

  // 리모델링 후
  const isExistAfterPhotovoltaicSysInfo = debugResult.after.renewableSys.length > 0;
  const isExistAfterShapeInfo = debugResult.after.shapeInfo.length > 0;
  const isExistAfter = isExistAfterPhotovoltaicSysInfo || isExistAfterShapeInfo;

  // useMemo를 사용하여 렌더링할 컴포넌트들을 메모이제이션
  const renderItems = useMemo(() => {
    const items = [];

    // 공통 섹션
    if (isExistCommon) {
      items.push({
        component: (
          <DebugCommonAccordion
            debugList={debugResult.common}
            key="common"
            type={type === "debug-required" ? "required" : "optional"}
          />
        ),
        id: "common",
      });
    }

    // 리모델링 전 섹션
    if (isExistBefore || isExistAfter) {
      items.push({
        component: (
          <DebugRemodelingAccordion
            debugListByRemodelingType={debugResult}
            key="before"
            remodelingTypeAfter={ERemodelingType.AFTER}
            remodelingTypeBefore={ERemodelingType.BEFORE}
            type={type === "debug-required" ? "required" : "optional"}
          />
        ),
        id: "before",
      });
    }
    return items;
  }, [
    isExistCommon,
    isExistBefore,
    isExistAfter,
    debugResult.common,
    debugResult.before,
    debugResult.after,
    type,
  ]);

  const isRequiredDisabled = isExistBefore && isExistAfter;

  const handleClickNext = () => {
    if (isRequired && isRequiredDisabled) return;

    // 건너뛰기
    if (!isRequired) {
      setDialogData({
        status: "save",
      });
    }
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsMinimized(false);
    onClose();
  };

  return (
    <FloatingWindow
      defaultSize={{ height: 612, width: 412 }}
      isMinimized={isMinimized}
      isOpen={isOpen}
      onToggleMinimize={handleToggleMinimize}
      title={title}
    >
      <div className="flex h-full flex-col p-6 pt-0">
        <ScrollArea className="h-full overflow-auto">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-neutral560 text-sm">{description}</p>
            </div>
            <p className="text-neutral640 text-sm font-semibold">{`총 ${debugResult.totalCount}개 항목`}</p>
            {renderItems.map((item) => (
              <div className="flex flex-col gap-4" key={item.id}>
                {item.component}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button onClick={handleClose} variant="outline">
            취소
          </Button>
          <Button disabled={isRequired ? isRequiredDisabled : false} onClick={handleClickNext}>
            {isRequired ? "다음" : "건너뛰기"}
          </Button>
        </div>
      </div>
    </FloatingWindow>
  );
};
