import { BUILDING_HIERARCHY_TYPE } from "@/domain/shape-info/constants/shape.enums";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";

export const initZone: TZoneGuiSchema = {
  density: [],
  height: undefined,
  id: "",
  infiltration: undefined,
  light_density: undefined,
  lightning: [],
  name: "존",
  profile: "",
  profile_id: undefined,
  supply_system_cooling_id: null,
  supply_system_heating_id: null,
  surfaces: [],
  ventilation_system_id: null,
};

export const initSurface: TSurfaceGuiSchema = {
  adjacent_zone_id: "",
  area: undefined,
  azimuth: undefined,
  boundary_condition: "",
  construction_id: "",
  fenestrations: [],
  id: "",
  name: "면",
  type: BUILDING_SURFACE_TYPE.wall,
};

export const isNumeric = (value: unknown): boolean =>
  typeof value === "number" ||
  (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value)));

// 음수일 때 - 대신 B를 붙여서 층수 표현
export const formatFloorNumber = (floorNumber: number): string => {
  return floorNumber < 0 ? `B${Math.abs(floorNumber)}` : `${floorNumber}`;
};

// 주어진 targetId(zoneId 또는 surfaceId)에 해당하는 "층 ▸ 존 ▸ 면" 형식으로 변환
export const formatZoneOrSurfaceName = (targetId: string, shapeInfo: TFloorGuiSchema[]): string => {
  for (const floor of shapeInfo) {
    for (const zone of floor.zones) {
      const matchedSurface = zone.surfaces.find((surface) => surface.id === targetId);
      if (matchedSurface) {
        return `${floor.floor_name + ">"}${zone.name}>${matchedSurface.name}`;
      }

      if (zone.id === targetId) {
        return `${floor.floor_name + ">"}${zone.name}`;
      }
    }
  }
  return targetId;
};

//
// 같은 레벨의 모든 id를 불러오는 함수
//
// shapeInfo -> floorId[]
export const getAllFloorIds = (shapeInfo: TFloorGuiSchema[]): string[] => {
  return shapeInfo?.map((floor) => floor.floor_id) || [];
};

// shapeInfo -> zoneId[]
export const getAllZoneIds = (shapeInfo: TFloorGuiSchema[]): string[] => {
  return shapeInfo?.flatMap((floor) => floor.zones?.map((zone) => zone.id) || []) || [];
};

// shapeInfo -> surfaceId[]
export const getAllSurfaceIds = (shapeInfo: TFloorGuiSchema[]): string[] => {
  return (
    shapeInfo?.flatMap(
      (floor) =>
        floor.zones?.flatMap((zone) => zone.surfaces?.map((surface) => surface.id) || []) || [],
    ) || []
  );
};

//
// 상위 레벨 id로 하위 레벨의 id를 모두 불러오는 함수
//
// floorId -> zoneId[]
export const getZonesByFloorId = (
  shapeInfo: TFloorGuiSchema[],
  floorId: string,
): TZoneGuiSchema[] => {
  const floor = shapeInfo?.find((f) => f.floor_id === floorId);
  return floor?.zones || [];
};

// floorId -> surfaceId[]
export const getSurfacesByFloorId = (
  shapeInfo: TFloorGuiSchema[],
  floorId: string,
): TSurfaceGuiSchema[] => {
  const floor = shapeInfo?.find((f) => f.floor_id === floorId);
  return floor?.zones?.flatMap((zone) => zone.surfaces || []) || [];
};

// zoneId -> surfaceId[]
export const getSurfacesByZoneId = (
  shapeInfo: TFloorGuiSchema[],
  zoneId: string,
): TSurfaceGuiSchema[] => {
  for (const floor of shapeInfo || []) {
    const zone = floor.zones?.find((z) => z.id === zoneId);
    if (zone) {
      return zone.surfaces || [];
    }
  }
  return [];
};

//
// 하위 레벨 id로 상위 레벨 id를 불러오는 함수
//
// surfaceId -> zoneId
export const getZoneIdBySurfaceId = (
  shapeInfo: TFloorGuiSchema[],
  surfaceId: string,
): string | undefined => {
  return findZoneContainingSurface(shapeInfo, surfaceId)?.zone.id;
};

// surfaceId -> floorId
export const getFloorIdBySurfaceId = (
  shapeInfo: TFloorGuiSchema[],
  surfaceId: string,
): string | undefined => {
  return findZoneContainingSurface(shapeInfo, surfaceId)?.floor.floor_id;
};

// zoneId -> floorId
export const getFloorIdByZoneId = (
  shapeInfo: TFloorGuiSchema[],
  zoneId: string,
): string | undefined => {
  for (const floor of shapeInfo) {
    const zone = floor.zones?.find((z) => z.id === zoneId);
    if (zone) {
      return floor.floor_id;
    }
  }
};

// 주어진 surfaceId에 해당하는 zone, floor를 찾는 함수
export const findZoneContainingSurface = (
  shapeInfo: TFloorGuiSchema[],
  surfaceId: string,
):
  | undefined
  | {
      floor: TFloorGuiSchema;
      zone: TZoneGuiSchema;
    } => {
  for (const floor of shapeInfo) {
    const zone = floor.zones?.find((z) => z.surfaces.some((s) => s.id === surfaceId));
    if (zone) {
      return { floor, zone };
    }
  }
};

// 주어진 형상 Id로 세부 정보 찾기
type TFoundShape =
  | {
      floorId: string;
      surfaceId: string;
      type: BUILDING_HIERARCHY_TYPE.surface;
      zoneId: string;
    }
  | {
      floorId: string;
      type: BUILDING_HIERARCHY_TYPE.floor;
    }
  | {
      floorId: string;
      type: BUILDING_HIERARCHY_TYPE.zone;
      zoneId: string;
    };

export const findShapeById = (
  shapeInfo: TFloorGuiSchema[],
  shapeId: string,
): TFoundShape | undefined => {
  for (const floor of shapeInfo) {
    if (floor.floor_id === shapeId) {
      return {
        floorId: floor.floor_id,
        type: BUILDING_HIERARCHY_TYPE.floor,
      };
    }

    for (const zone of floor.zones) {
      if (zone.id === shapeId) {
        return {
          floorId: floor.floor_id,
          type: BUILDING_HIERARCHY_TYPE.zone,
          zoneId: zone.id,
        };
      }

      for (const surface of zone.surfaces) {
        if (surface.id === shapeId) {
          return {
            floorId: floor.floor_id,
            surfaceId: surface.id,
            type: BUILDING_HIERARCHY_TYPE.surface,
            zoneId: zone.id,
          };
        }
      }
    }
  }
};
