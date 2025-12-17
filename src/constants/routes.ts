import { ERemodelingType } from "@/enums/ERemodelingType";

export const ROUTER_URL_PARAMS = {
  floorId: "floorId",
  surfaceId: "surfaceId",
  zoneId: "zoneId",
} as const;

export const STEP_PATH = {
  BASIC_INFO: {
    label: "기본 정보",
    path: `/remodeling/basic-info`,
  },
  DAY_SCHEDULE: { label: "일간 스케줄", path: "/day-schedule" },
  FENESTRATION: { label: "개구부", path: "/fenestration" },
  LIGHTNING: { label: "조명", path: "/lightning" },
  RENEWABLE_SYSTEMS: { label: "신재생", path: "/renewable-systems" },
  RESULT: { label: "결과", path: "/result" },
  SOURCE_SUPPLY_SYSTEMS: { label: "생산/공급 설비", path: "/source-supply-systems" },
  SOURCE_SYSTEMS: { label: "생산 설비", path: "" },
  SUPPLY_SYSTEMS: { label: "공급 설비", path: "" },
  SURFACE_CONSTRUCTIONS: { label: "면 구조체", path: "/surface-constructions" },
  VENTILATION_SYSTEMS: { label: "환기 설비", path: "/ventilation-systems" },
} as const;

export const SIMULATION_BEFORE_AFTER_STEP_PATH = {
  BUILDING_OVERVIEW: {
    label: "건물 개요",
    path: (remodelingType: ERemodelingType) => `/remodeling/${remodelingType}/building-overview`,
  },
  FLOOR: {
    label: "층",
    path: (remodelingType: ERemodelingType, floorId = `:${ROUTER_URL_PARAMS.floorId}`) =>
      `/remodeling/${remodelingType}/shape-info/floors/${floorId}`,
  },
  SURFACE: {
    label: "면",
    path: (remodelingType: ERemodelingType, surfaceId = `:${ROUTER_URL_PARAMS.surfaceId}`) =>
      `/remodeling/${remodelingType}/shape-info/surfaces/${surfaceId}`,
  },
  ZONE: {
    label: "존",
    path: (remodelingType: ERemodelingType, zoneId = `:${ROUTER_URL_PARAMS.zoneId}`) =>
      `/remodeling/${remodelingType}/shape-info/zones/${zoneId}`,
  },
};

export type TStepPath = (typeof STEP_PATH)[keyof typeof STEP_PATH];
