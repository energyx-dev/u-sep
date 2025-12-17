export enum BOUNDARY_CONDITION_TYPE {
  adiabatic = "adiabatic",
  ground = "ground",
  outdoors = "outdoors",
  zone = "zone",
}

export enum BUILDING_SURFACE_TYPE {
  ceiling = "ceiling",
  floor = "floor",
  wall = "wall",
}

export enum CONSTRUCTION_ID_TYPE {
  open = "open",
  unknown = "unknown",
}

export const BOUNDARY_CONDITION_LABELS: Record<BOUNDARY_CONDITION_TYPE, string> = {
  [BOUNDARY_CONDITION_TYPE.adiabatic]: "단열",
  [BOUNDARY_CONDITION_TYPE.ground]: "지반 접촉면",
  [BOUNDARY_CONDITION_TYPE.outdoors]: "외기와 접함",
  [BOUNDARY_CONDITION_TYPE.zone]: "다른 존과 접함",
};

export const CONSTRUCTION_ID_LABELS: Record<CONSTRUCTION_ID_TYPE, string> = {
  [CONSTRUCTION_ID_TYPE.unknown]: "미지정",
  //
  [CONSTRUCTION_ID_TYPE.open]: "개방",
};

export const SURFACE_TYPE_LABELS: Record<BUILDING_SURFACE_TYPE, string> = {
  [BUILDING_SURFACE_TYPE.ceiling]: "천장",
  [BUILDING_SURFACE_TYPE.floor]: "바닥",
  [BUILDING_SURFACE_TYPE.wall]: "벽",
};
