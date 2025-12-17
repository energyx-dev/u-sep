import { TDebugErrorSet } from "@/domain/result/helpers/debug.core";

export type TDebugErrorSetWithCount = TDebugErrorSet & {
  totalCount: number;
};

// 디버깅 결과에서 에러가 있는지 확인
export const getExistDebugError = (
  debugResult: null | TDebugErrorSet,
): null | TDebugErrorSetWithCount => {
  if (!debugResult) return null;

  const {
    after: { renewableSys: afterPhotovoltaicSysInfo, shapeInfo: afterShapeInfo },
    before: { renewableSys: beforePhotovoltaicSysInfo, shapeInfo: beforeShapeInfo },
    common: { buildingInfo, sourceSystem, supplySystem, ventilationSystem },
  } = debugResult;

  const totalCount =
    afterPhotovoltaicSysInfo.length +
    beforePhotovoltaicSysInfo.length +
    afterShapeInfo.length +
    beforeShapeInfo.length +
    buildingInfo.length +
    sourceSystem.length +
    supplySystem.length +
    ventilationSystem.length;

  return {
    totalCount,
    ...debugResult,
  };
};
