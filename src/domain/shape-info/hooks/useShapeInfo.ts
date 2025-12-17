import { toast } from "sonner";

import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";

export const useShapeInfo = (remodelingType?: ERemodelingType) => {
  const { setShapeInfo } = useDataSyncActions(remodelingType);
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore(remodelingType);

  const setOverwriteFloor = (floorId: string, selectedFloors: string[]) => {
    if (!shapeInfo) return;

    const sourceFloor = shapeInfo.find((floor) => floor.floor_id === floorId);
    if (!sourceFloor) return;

    const updatedShapeInfo = shapeInfo.map((floor) => {
      if (selectedFloors.includes(floor.floor_id)) {
        return {
          ...floor,
          zones: sourceFloor.zones,
        };
      }
      return floor;
    });

    setShapeInfo(updatedShapeInfo);
    toast.success("덮어쓰기가 완료되었습니다.");
  };

  const setRemoveFloor = (floorId: string) => {
    if (!shapeInfo) return;

    // 1) 제거 대상 floor의 zone/surface id 수집
    const removedZoneIds: string[] = (() => {
      const found = shapeInfo.find((f) => f.floor_id === floorId);
      return found ? found.zones.map((z) => z.id) : [];
    })();
    const removedSurfaceIds: string[] = (() => {
      const found = shapeInfo.find((f) => f.floor_id === floorId);
      return found ? found.zones.flatMap((z) => z.surfaces.map((s) => s.id)) : [];
    })();

    // 2) floor 제거
    const withoutFloor = shapeInfo.filter((floor) => floor.floor_id !== floorId);

    // 3) 전 층 탐색: 제거된 floor 참조 정리
    const updatedShapeInfo = withoutFloor.map((floor) => ({
      ...floor,
      zones: floor.zones.map((zone) => ({
        ...zone,
        surfaces: zone.surfaces
          // 3-1) 생성면이고, 제거된 surface를 참조하던 경우 삭제
          .filter((s) => !(removedSurfaceIds.includes(s.adjacent_from!) && s.isGenerated === true))
          // 3-2) 나머지는 링크만 끊기 + 제거된 존을 가리키던 adjacent_zone_id 초기화
          .map((s) => ({
            ...s,
            adjacent_from: removedSurfaceIds.includes(s.adjacent_from!) ? "" : s.adjacent_from,
            adjacent_surface_id:
              s.adjacent_surface_id && removedSurfaceIds.includes(s.adjacent_surface_id)
                ? ""
                : s.adjacent_surface_id,
            adjacent_zone_id: removedZoneIds.includes(s.adjacent_zone_id!)
              ? ""
              : s.adjacent_zone_id,
          })),
      })),
    }));

    setShapeInfo(updatedShapeInfo);
  };

  const setCopyZone = (zoneId: string, selectedFloors: string[]) => {
    if (!shapeInfo) return;

    const sourceZone = shapeInfo.flatMap((floor) => floor.zones).find((zone) => zone.id === zoneId);
    if (!sourceZone) return;

    const updatedShapeInfo = shapeInfo.map((floor) => {
      if (selectedFloors.includes(floor.floor_id)) {
        const zoneCount = floor.zones.length;
        const newZoneId = `${floor.floor_id}_zone${zoneCount}`;
        const newZone = {
          ...sourceZone,
          id: newZoneId,
          name: `${sourceZone.name}-복사(${zoneCount + 1})`,
          surfaces: sourceZone.surfaces.map((surface, index) => ({
            ...surface,
            id: `${newZoneId}_${surface.type}${index}`,
          })),
        };
        return {
          ...floor,
          zones: [...floor.zones, newZone],
        };
      }
      return floor;
    });

    setShapeInfo(updatedShapeInfo);
    toast.success("복사가 완료되었습니다.");
  };

  const setRemoveZone = (zoneId: string) => {
    if (!shapeInfo) return;

    // 1) 제거 대상 존에서 surface id 수집
    const removedSurfaceIds: string[] = (() => {
      const found = shapeInfo.flatMap((f) => f.zones).find((z) => z.id === zoneId);
      return found ? found.surfaces.map((s) => s.id) : [];
    })();

    // 2) 존 제거
    const withoutZone = shapeInfo.map((floor) => ({
      ...floor,
      zones: floor.zones.filter((zone) => zone.id !== zoneId),
    }));

    // 3) 전 존 탐색: 제거된 존의 surface를 참조하던 링크 정리
    const updatedShapeInfo = withoutZone.map((floor) => ({
      ...floor,
      zones: floor.zones.map((zone) => ({
        ...zone,
        surfaces: zone.surfaces
          // 3-1) isGenerated가 true이고, 제거된 존의 surface를 참조하던 면은 삭제
          .filter((s) => !(removedSurfaceIds.includes(s.adjacent_from!) && s.isGenerated === true))
          // 3-2) 나머지는 링크만 끊기 + 4) 제거된 존을 가리키던 adjacent_zone_id는 초기화
          .map((s) => ({
            ...s,
            adjacent_from: removedSurfaceIds.includes(s.adjacent_from!) ? "" : s.adjacent_from,
            adjacent_surface_id:
              s.adjacent_surface_id && removedSurfaceIds.includes(s.adjacent_surface_id)
                ? ""
                : s.adjacent_surface_id,
            adjacent_zone_id: s.adjacent_zone_id === zoneId ? "" : s.adjacent_zone_id,
          })),
      })),
    }));

    setShapeInfo(updatedShapeInfo);
  };

  const setRemoveSurface = (zoneId: string, surfaceId: string) => {
    if (!shapeInfo) return;

    // 1) 대상 존에서 surfaceId 삭제
    const withoutSurface = shapeInfo.map((floor) => ({
      ...floor,
      zones: floor.zones.map((zone) =>
        zone.id === zoneId
          ? { ...zone, surfaces: zone.surfaces.filter((s) => s.id !== surfaceId) }
          : zone,
      ),
    }));

    // 2) 전 존 탐색: 제거된 surfaceId를 참조하던 adjacent_from 정리
    const updatedShapeInfo = withoutSurface.map((floor) => ({
      ...floor,
      zones: floor.zones.map((zone) => ({
        ...zone,
        surfaces: zone.surfaces
          // 1) isGenerated가 true 이고, 제거된 surfaceId를 참조하던 면은 삭제
          .filter((s) => !(s.adjacent_from === surfaceId && s.isGenerated === true))
          // 2) 나머지 중, 제거된 surfaceId를 참조하던 면은 링크만 끊기
          .map((s) => (s.adjacent_from === surfaceId ? { ...s, adjacent_from: "" } : s)),
      })),
    }));

    setShapeInfo(updatedShapeInfo);
  };

  const setRemoveAdjacentId = (surfaceId: string) => {
    if (!shapeInfo) return;

    const updatedShapeInfo = shapeInfo.map((floor) => ({
      ...floor,
      zones: floor.zones.map((zone) => ({
        ...zone,
        surfaces: zone.surfaces
          // 1) 생성면이라면 (존에 직접 연결), surfaceId를 참조하는 면은 삭제
          .filter((s) => !(s.adjacent_from === surfaceId && s.isGenerated === true))
          // 2) 면에 연결했을 경우 surfaceId를 참조하는 면은 링크 해제
          .map((s) => {
            if (s.id === surfaceId) {
              // 기준면: 인접존/인접면 초기화
              return {
                ...s,
                adjacent_surface_id: undefined,
                adjacent_zone_id: "",
              };
            }
            // 인접면 : adjacent_from, adjacent_zone_id 초기화
            return s.adjacent_from === surfaceId
              ? { ...s, adjacent_from: "", adjacent_zone_id: "" }
              : s;
          }),
      })),
    }));

    setShapeInfo(updatedShapeInfo);
  };

  return {
    setCopyZone,
    setOverwriteFloor,
    setRemoveAdjacentId,
    setRemoveFloor,
    setRemoveSurface,
    setRemoveZone,
    setShapeInfo,
    shapeInfo,
  };
};
