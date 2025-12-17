import { TThreeStateCheckboxValue } from "@/components/ui/three-state-checkbox";
import {
  ICopyRemodelingTreeState,
  TCopyRemodelingTreeActionKeys,
} from "@/domain/building/hooks/useCopyRemodelingTree";
import { TCopyRemodelingData } from "@/domain/building/types/copy.types";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import {
  getAllFloorIds,
  getAllSurfaceIds,
  getAllZoneIds,
} from "@/domain/shape-info/utils/shape-info.utils";
import { TPhotovoltaicSystemEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";

export type TCopyPhotovoltaicSystem = TCopyFlag & TPhotovoltaicSystemEngineAndGuiSchema;

export type TCopyShapeInfo = TCopyFloor[];

type TCopyFlag = {
  isCopied?: boolean;
};

type TCopyFloor = Omit<TFloorGuiSchema, "zones"> &
  TCopyFlag & {
    zones: TCopyZone[];
  };

type TCopySurface = TCopyFlag & TSurfaceGuiSchema;

type TCopyZone = Omit<TZoneGuiSchema, "surfaces"> &
  TCopyFlag & {
    surfaces: TCopySurface[];
  };

type TRemodelingData = {
  photovoltaicSystems: TPhotovoltaicSystemEngineAndGuiSchema[];
  shapeInfo: TFloorGuiSchema[];
};

export const getCopyShapeInfo = ({
  addDataIds,
  originRemodelingData,
  targetRemodelingData,
}: {
  addDataIds: ICopyRemodelingTreeState;
  originRemodelingData: TRemodelingData;
  targetRemodelingData: TRemodelingData;
}): TCopyRemodelingData => {
  // baseShapeInfo으로부터 addShapeSets에 해당하는 shape에 { isCopied : true }를 넣어서 addShapeInfo 생성
  const addRemodelingData: TCopyRemodelingData = {
    photovoltaicSystems: [],
    shapeInfo: [],
  };

  const extractSelectedShapeData = (
    shapeInfo: TFloorGuiSchema[],
    addDataIds: ICopyRemodelingTreeState,
  ): TCopyFloor[] => {
    return shapeInfo
      .filter((floor) => addDataIds.floors.has(floor.floor_id))
      .map((floor) => ({
        ...floor,
        isCopied: true,
        zones: floor.zones
          .filter((zone) => addDataIds.zones.has(zone.id))
          .map((zone) => ({
            ...zone,
            isCopied: true,
            surfaces: zone.surfaces
              .filter((surface) => addDataIds.surfaces.has(surface.id))
              .map((surface) => ({ ...surface, isCopied: true })),
          })),
      }));
  };

  addRemodelingData.shapeInfo = extractSelectedShapeData(
    originRemodelingData.shapeInfo,
    addDataIds,
  );

  const mergedShapeInfo: TCopyShapeInfo = [];
  const processedFloorNumbers = new Set<number>();

  // targetShapeInfo에 병합, 병합 할때는 floor 일 경우 floor number 정렬 기준으로 병합
  // 기존의 targetShapeInfo의 isCopied는 모두 false이고, 새로 추가되는 addShapeInfo가 병합되는 형태 (다만 floor의 경우만 정렬 고려)
  targetRemodelingData.shapeInfo.forEach((floor) => {
    const mergedFloor: TCopyFloor = {
      ...floor,
      isCopied: false,
      zones: floor.zones.map((zone) => ({
        ...zone,
        isCopied: false,
        surfaces: zone.surfaces.map((surface) => ({
          ...surface,
          isCopied: false,
        })),
      })),
    };

    const addFloor = addRemodelingData.shapeInfo.find(
      (e) => e.floor_number === mergedFloor.floor_number,
    );

    if (addFloor) {
      mergedFloor.zones.push(...addFloor.zones);

      // 추가된 데이터 set에 추가
      processedFloorNumbers.add(addFloor.floor_number);
    }

    mergedShapeInfo.push(mergedFloor);
  });

  const remainingAddShapeInfo = addRemodelingData.shapeInfo.filter(
    (floor) => !processedFloorNumbers.has(floor.floor_number),
  );

  // 나머지 적용
  mergedShapeInfo.push(...remainingAddShapeInfo);

  // mergedShapeInfo floor number 로 정렬
  mergedShapeInfo.sort((a, b) => b.floor_number - a.floor_number);

  // 태양광 병합
  targetRemodelingData.photovoltaicSystems.forEach((photovoltaicSystem) => {
    addRemodelingData.photovoltaicSystems.push({ ...photovoltaicSystem, isCopied: false });
  });

  originRemodelingData.photovoltaicSystems.forEach((photovoltaicSystem) => {
    if (addDataIds.photovoltaicSystems.has(photovoltaicSystem.id)) {
      addRemodelingData.photovoltaicSystems.push({ ...photovoltaicSystem, isCopied: true });
    }
  });

  return {
    photovoltaicSystems: addRemodelingData.photovoltaicSystems,
    shapeInfo: mergedShapeInfo,
  };
};

// 체크박스 상태 계산 함수
export const getCheckedShapeItem = ({
  itemId,
  itemType,
  originOrTargetData,
  treeItems,
}: {
  itemId: string;
  itemType: TCopyRemodelingTreeActionKeys;
  originOrTargetData: TCopyRemodelingData;
  treeItems: ICopyRemodelingTreeState;
}): TThreeStateCheckboxValue => {
  const { photovoltaicSystems, shapeInfo } = originOrTargetData;

  switch (itemType) {
    case "toggleBuilding": {
      if (treeItems.floors.size === 0) return "unchecked";

      const floorIds = getAllFloorIds(shapeInfo);
      const zoneIds = getAllZoneIds(shapeInfo);
      const surfaceIds = getAllSurfaceIds(shapeInfo);

      const isAllFloorSelected = floorIds.every((floorId) => treeItems.floors.has(floorId));
      const isAllZoneSelected = zoneIds.every((zoneId) => treeItems.zones.has(zoneId));
      const isAllSurfaceSelected = surfaceIds.every((surfaceId) =>
        treeItems.surfaces.has(surfaceId),
      );
      if (isAllFloorSelected && isAllZoneSelected && isAllSurfaceSelected) return "checked";

      return "indeterminate";
    }

    case "toggleFloor": {
      // floor id와 하위 zone id, 하위 surface id 모두 treeItems에 있는지 확인
      const isFloorSelected = treeItems.floors.has(itemId);
      if (!isFloorSelected) return "unchecked";

      const floor = shapeInfo.find((floor) => floor.floor_id === itemId);
      const isAllZoneSurfaceSelected = floor?.zones.every(
        (zone) =>
          treeItems.zones.has(zone.id) &&
          zone.surfaces.every((surface) => treeItems.surfaces.has(surface.id)),
      );

      if (isFloorSelected && isAllZoneSurfaceSelected) return "checked";
      return "indeterminate";
    }

    case "togglePhotovoltaic": {
      return treeItems.photovoltaicSystems.has(itemId) ? "checked" : "unchecked";
    }

    case "togglePhotovoltaicAll": {
      const isAllPhotovoltaicSelected = photovoltaicSystems.every((photovoltaicSystem) =>
        treeItems.photovoltaicSystems.has(photovoltaicSystem.id),
      );

      return isAllPhotovoltaicSelected ? "checked" : "unchecked";
    }

    case "toggleSurface": {
      return treeItems.surfaces.has(itemId) ? "checked" : "unchecked";
    }

    case "toggleZone": {
      const isZoneSelected = treeItems.zones.has(itemId);
      if (!isZoneSelected) return "unchecked";

      // shapeInfo에서 itemId로 zone을 찾음
      const zone = shapeInfo.flatMap((floor) => floor.zones).find((e) => e.id === itemId);

      // zone id와 하위 surface id 모두 treeItems에 있는지 확인
      const surfaceIds = zone?.surfaces.map((surface) => surface.id);
      const isAllSurfaceSelected = surfaceIds?.every((surfaceId) =>
        treeItems.surfaces.has(surfaceId),
      );

      if (isZoneSelected && isAllSurfaceSelected) return "checked";
      return "indeterminate";
    }

    default:
      return "unchecked";
  }
};
