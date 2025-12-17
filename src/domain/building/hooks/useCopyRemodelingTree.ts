import { useMemo, useReducer } from "react";

import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import {
  getAllFloorIds,
  getAllSurfaceIds,
  getAllZoneIds,
  getFloorIdBySurfaceId,
  getFloorIdByZoneId,
  getSurfacesByFloorId,
  getSurfacesByZoneId,
  getZoneIdBySurfaceId,
  getZonesByFloorId,
} from "@/domain/shape-info/utils/shape-info.utils";
import { TTemplateReference } from "@/types/template.types";

// CopyRemodelingTree 상태 인터페이스
export interface ICopyRemodelingTreeState {
  floors: Set<string>;
  photovoltaicSystems: Set<string>;
  surfaces: Set<string>;
  zones: Set<string>;
}

// CopyRemodelingTree 액션 타입
export type TCopyRemodelingTreeAction =
  | { payload: boolean; type: "TOGGLE_BUILDING_ALL" }
  | { payload: boolean; type: "TOGGLE_PHOTOVOLTAIC_ALL" }
  | { payload: { checked: boolean; floorId: string }; type: "TOGGLE_FLOOR" }
  | { payload: { checked: boolean; surfaceId: string }; type: "TOGGLE_SURFACE" }
  | { payload: { checked: boolean; systemId: string }; type: "TOGGLE_PHOTOVOLTAIC" }
  | { payload: { checked: boolean; zoneId: string }; type: "TOGGLE_ZONE" };

// 초기 상태
const initialCopyRemodelingTreeState: ICopyRemodelingTreeState = {
  floors: new Set(),
  photovoltaicSystems: new Set(),
  surfaces: new Set(),
  zones: new Set(),
};

// CopyRemodelingTree 리듀서 함수
const copyRemodelingTreeReducer = (
  state: ICopyRemodelingTreeState,
  action: TCopyRemodelingTreeAction,
  shapeInfo: TFloorGuiSchema[],
  photovoltaicSystems: TTemplateReference[],
): ICopyRemodelingTreeState => {
  switch (action.type) {
    // 건물
    // 선택 시 모든 층, 존, 면 선택
    // 해제 시 모든 층, 존, 면 해제
    case "TOGGLE_BUILDING_ALL": {
      const allFloorIds = getAllFloorIds(shapeInfo);
      const allZoneIds = getAllZoneIds(shapeInfo);
      const allSurfaceIds = getAllSurfaceIds(shapeInfo);

      return {
        ...state,
        floors: action.payload ? new Set(allFloorIds) : new Set(),
        surfaces: action.payload ? new Set(allSurfaceIds) : new Set(),
        zones: action.payload ? new Set(allZoneIds) : new Set(),
      };
    }

    // 층
    // 선택 시 층, 존, 면 선택
    // 해제 시 층, 존, 면 해제
    case "TOGGLE_FLOOR": {
      const { checked, floorId } = action.payload;
      const floorZoneIds = getZonesByFloorId(shapeInfo, floorId).map((zone) => zone.id);
      const floorSurfaceIds = getSurfacesByFloorId(shapeInfo, floorId).map((surface) => surface.id);

      return {
        ...state,
        floors: checked
          ? new Set([floorId, ...state.floors])
          : new Set([...state.floors].filter((id) => id !== floorId)),
        surfaces: checked
          ? new Set([...floorSurfaceIds, ...state.surfaces])
          : new Set([...state.surfaces].filter((id) => !floorSurfaceIds.includes(id))),
        zones: checked
          ? new Set([...floorZoneIds, ...state.zones])
          : new Set([...state.zones].filter((id) => !floorZoneIds.includes(id))),
      };
    }

    // 태양광 시스템
    // 선택 시 태양광 시스템 선택
    // 해제 시 태양광 시스템 해제
    case "TOGGLE_PHOTOVOLTAIC": {
      const { checked: systemChecked, systemId } = action.payload;

      return {
        ...state,
        photovoltaicSystems: systemChecked
          ? new Set([systemId, ...state.photovoltaicSystems])
          : new Set([...state.photovoltaicSystems].filter((id) => id !== systemId)),
      };
    }

    // 태양광 시스템 전체 선택
    case "TOGGLE_PHOTOVOLTAIC_ALL": {
      const allPhotovoltaicSystemIds = photovoltaicSystems.map((system) => system.id);

      return {
        ...state,
        photovoltaicSystems: action.payload ? new Set(allPhotovoltaicSystemIds) : new Set(),
      };
    }

    // 면
    // 선택 시 면, 존 선택, 층 선택(상위 존, 층이 선택되어 있지 않으면 자동 선택)
    // 해제 시 면, 존, 층 해제
    case "TOGGLE_SURFACE": {
      const { checked: surfaceChecked, surfaceId } = action.payload;

      const zoneId = getZoneIdBySurfaceId(shapeInfo, surfaceId);
      // 면 선택 시 상위 존이 선택되어 있지 않으면 자동 선택
      const shouldSelectParentZone = surfaceChecked && zoneId && !state.zones.has(zoneId);
      const zoneState = shouldSelectParentZone ? new Set([zoneId, ...state.zones]) : state.zones;

      const floorId = getFloorIdBySurfaceId(shapeInfo, surfaceId);
      // 면 선택 시 상위 층이 선택되어 있지 않으면 자동 선택
      const shouldSelectParentFloor = surfaceChecked && floorId && !state.floors.has(floorId);
      const floorState = shouldSelectParentFloor
        ? new Set([floorId, ...state.floors])
        : state.floors;

      const surfaceState =
        surfaceChecked && !state.surfaces.has(surfaceId)
          ? new Set([surfaceId, ...state.surfaces])
          : new Set([...state.surfaces].filter((id) => id !== surfaceId));

      return {
        ...state,
        floors: floorState,
        surfaces: surfaceState,
        zones: zoneState,
      };
    }

    // 존
    // 선택 시 존, 면 선택, 층 선택(상위 층이 선택되어 있지 않으면 자동 선택)
    // 해제 시 존, 면, 층 해제
    case "TOGGLE_ZONE": {
      const { checked: zoneChecked, zoneId } = action.payload;
      const zoneSurfaceIds = getSurfacesByZoneId(shapeInfo, zoneId).map((surface) => surface.id);

      const floorId = getFloorIdByZoneId(shapeInfo, zoneId);
      // 존 선택 시 상위 층이 선택되어 있지 않으면 자동 선택
      const shouldSelectParentFloor = zoneChecked && floorId && !state.floors.has(floorId);
      const floorState = shouldSelectParentFloor
        ? new Set([floorId, ...state.floors])
        : state.floors;

      const zoneState = zoneChecked
        ? new Set([zoneId, ...state.zones])
        : new Set([...state.zones].filter((id) => id !== zoneId));

      const surfaceState = zoneChecked
        ? new Set([...state.surfaces, ...zoneSurfaceIds])
        : new Set([...state.surfaces].filter((id) => !zoneSurfaceIds.includes(id)));

      return {
        ...state,
        floors: floorState,
        surfaces: surfaceState,
        zones: zoneState,
      };
    }

    default:
      return state;
  }
};

export type TCopyRemodelingTreeActionKeys = keyof TCopyRemodelingTreeActions;
export type TCopyRemodelingTreeActions = ReturnType<typeof useCopyRemodelingTree>["actions"];

interface ICopyRemodelingTreeParams {
  photovoltaicSystems: TTemplateReference[];
  shapeInfo: TFloorGuiSchema[];
}

// CopyRemodelingTree 메인 훅
export const useCopyRemodelingTree = ({
  photovoltaicSystems,
  shapeInfo,
}: ICopyRemodelingTreeParams) => {
  const [state, dispatch] = useReducer(
    (state: ICopyRemodelingTreeState, action: TCopyRemodelingTreeAction) =>
      copyRemodelingTreeReducer(state, action, shapeInfo, photovoltaicSystems),
    initialCopyRemodelingTreeState,
  );

  const actions = useMemo(
    () => ({
      toggleBuilding: (checked: boolean) =>
        dispatch({ payload: checked, type: "TOGGLE_BUILDING_ALL" }),
      toggleFloor: (floorId: string, checked: boolean) =>
        dispatch({ payload: { checked, floorId }, type: "TOGGLE_FLOOR" }),
      togglePhotovoltaic: (systemId: string, checked: boolean) =>
        dispatch({ payload: { checked, systemId }, type: "TOGGLE_PHOTOVOLTAIC" }),
      togglePhotovoltaicAll: (checked: boolean) =>
        dispatch({ payload: checked, type: "TOGGLE_PHOTOVOLTAIC_ALL" }),
      toggleSurface: (surfaceId: string, checked: boolean) =>
        dispatch({ payload: { checked, surfaceId }, type: "TOGGLE_SURFACE" }),
      toggleZone: (zoneId: string, checked: boolean) =>
        dispatch({ payload: { checked, zoneId }, type: "TOGGLE_ZONE" }),
    }),
    [],
  );

  return { actions, state };
};
