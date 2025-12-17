import { STEP_PATH } from "@/constants/routes";
import {
  TDebugErrorSetCommonItem,
  TDebugErrorSetRemodelingItem,
} from "@/domain/result/helpers/debug.core";

export const DEBUG_LABEL_BY_REMODELING: Record<keyof TDebugErrorSetRemodelingItem, string> = {
  renewableSys: "신재생",
  shapeInfo: "형상 정보",
};

export const DEBUG_LABEL_BY_COMMON: Record<keyof TDebugErrorSetCommonItem, string> = {
  buildingInfo: STEP_PATH.BASIC_INFO.label,
  sourceSystem: STEP_PATH.SOURCE_SYSTEMS.label,
  supplySystem: STEP_PATH.SUPPLY_SYSTEMS.label,
  ventilationSystem: STEP_PATH.VENTILATION_SYSTEMS.label,
};
