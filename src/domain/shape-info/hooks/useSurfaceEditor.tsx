import Decimal from "decimal.js";
import { useCallback } from "react";

import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";

/**
 * 면(Surface) 편집을 위한 커스텀 훅 (전역 상태)
 *
 * 건물의 면 데이터를 조회하고 업데이트하는 기능을 제공합니다.
 * 특정 zone 내의 면을 찾거나 전체 건물에서 면을 검색할 수 있습니다.
 *
 * @example
 * ```tsx
 * const { getSurfaceById, updateSurface } = useSurfaceEditor();
 *
 * // 특정 zone 내의 면 조회
 * const surface = getSurfaceById({
 *   surfaceId: "surface-1",
 *   zoneId: "zone-1"
 * });
 *
 * // 면 데이터 업데이트
 * updateSurface({
 *   surfaceId: "surface-1",
 *   zoneId: "zone-1",
 *   data: { name: "새로운 면명" }
 * });
 * ```
 */
export const useSurfaceEditor = (remodelingType?: ERemodelingType) => {
  const { setShapeInfo } = useDataSyncActions(remodelingType);
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore(remodelingType);

  const floorNumberArray: number[] = shapeInfo.map((floor) => floor.floor_number);

  const maxFloorNumber = Math.max(...floorNumberArray);
  const minFloorNumber = Math.min(...floorNumberArray);

  /**
   * 면 ID로 면 데이터를 조회하는 함수 (전역 상태)
   *
   * zoneId가 제공되면 해당 zone 내에서만 검색하고,
   * zoneId가 없으면 전체 건물에서 면을 검색합니다.
   */
  const getSurfaceById = useCallback(
    ({
      surfaceId,
      zoneId,
    }: {
      surfaceId: string;
      zoneId?: string;
    }): TSurfaceGuiSchema | undefined => {
      if (!shapeInfo) throw new Error("전역 데이터(shapeInfo)가 존재하지 않습니다.");

      for (const floor of shapeInfo) {
        // zoneId가 주어지면 해당 zone 안에서만 탐색 (전역 fallback 없음)
        if (zoneId) {
          const zone = floor.zones.find((z) => z.id === zoneId);
          if (zone) {
            return zone.surfaces?.find((s) => s.id === surfaceId);
          }
          // 현재 floor에 zoneId에 해당하는 zone이 없으면 다음 floor로 진행
          continue;
        }

        // zoneId가 없으면 전체 건물에서 탐색
        const surface = floor.zones.flatMap((z) => z.surfaces).find((s) => s.id === surfaceId);
        if (surface) return surface;
      }
    },
    [shapeInfo],
  );

  /**
   * 면 데이터를 업데이트하는 함수 (전역 상태)
   *
   * 지정된 surfaceId를 가진 메인 면 데이터를 새로운 데이터로 업데이트합니다.
   * zoneId가 제공되면 **해당 zone 내에서만 메인 업데이트**를 수행하고,
   * zoneId가 없으면 **전체 건물에서 메인 업데이트**를 수행합니다.
   *
   * 인접 surface 동기화 규칙:
   *  - adjacentSurfaceId가 제공되면 해당 인접 면도 함께 업데이트하되,
   *    이 경우 adjacent_zone_id 필드는 변경하지 않고 기존 값을 유지합니다.
   *  - reverse-adjacent(`adjacent_surface_id === surfaceId`)도 동일 규칙으로 전역에서 동기화합니다.
   */
  const updateSurface = useCallback(
    ({
      adjacentSurfaceId,
      data,
      surfaceId,
    }: {
      adjacentSurfaceId?: string;
      data: Partial<TSurfaceGuiSchema>;
      surfaceId: string;
    }) => {
      // coolroof_reflectance 값을 100으로 나누어 비율로 저장
      if (data && typeof data.coolroof_reflectance === "number") {
        data = {
          ...data,
          coolroof_reflectance: new Decimal(data.coolroof_reflectance).div(100).toNumber(),
        };
      }

      if (!shapeInfo) throw new Error("전역 데이터(shapeInfo)가 존재하지 않습니다.");

      // 인접존을 명시적으로 해제("")하는 업데이트인지 여부 - adjacent_zone_id가 ""이면 인접존을 명시적으로 해제
      const shouldClearDirectLinks =
        Object.prototype.hasOwnProperty.call(data, "adjacent_zone_id") &&
        data.adjacent_zone_id === "";

      const updatedList = shapeInfo.map((floor) => ({
        ...floor,
        zones: floor.zones.map((zone) => ({
          ...zone,
          surfaces: zone.surfaces?.map((surface) => {
            // 메인 surface 여부: surface.id === surfaceId
            const isMain = surface.id === surfaceId;
            // 인접 surface 여부: adjacentSurfaceId가 주어지고, 해당 surface와 ID가 일치
            const isAdjacent = !!adjacentSurfaceId && surface.id === adjacentSurfaceId;
            // 인접 surface의 reverse: 현재 surface의 adjacent_surface_id가 메인 surfaceId를 가리키는 경우
            const isReverseAdjacent = surface.adjacent_surface_id === surfaceId;

            if (isMain) {
              const updated = { ...surface, ...data };
              return shouldClearDirectLinks && updated.adjacent_from === surfaceId
                ? { ...updated, adjacent_from: "" }
                : updated;
            } else if (isAdjacent || isReverseAdjacent) {
              if (shouldClearDirectLinks) {
                const updated = { ...surface };
                return shouldClearDirectLinks && updated.adjacent_from === surfaceId
                  ? { ...updated, adjacent_from: "" }
                  : updated;
              } else {
                const updated = {
                  ...surface,
                  ...data,
                  adjacent_zone_id: surface.adjacent_zone_id,
                  name: surface.name,
                };
                return shouldClearDirectLinks && updated.adjacent_from === surfaceId
                  ? { ...updated, adjacent_from: "" }
                  : updated;
              }
            }

            if (shouldClearDirectLinks && surface.adjacent_from === surfaceId) {
              return { ...surface, adjacent_from: "" };
            }

            return surface;
          }),
        })),
      }));

      setShapeInfo(updatedList);
    },
    [setShapeInfo, shapeInfo],
  );

  // 최상층에 surface id가 존재는지 체크
  const isMaxFloorBySurfaceId = (surfaceId: string) => {
    const maxFloorData = shapeInfo.find((floor) => floor.floor_number === maxFloorNumber);
    if (!maxFloorData) return false;

    const hasSurface = maxFloorData.zones
      .flatMap((z) => z.surfaces)
      .some((s) => s.id === surfaceId);
    return hasSurface;
  };

  // 최하층에 surface id가 존재하는지 체크
  const isMinFloorBySurfaceId = (surfaceId: string) => {
    const minFloorData = shapeInfo.find((floor) => floor.floor_number === minFloorNumber);
    if (!minFloorData) return false;

    const hasSurface = minFloorData.zones
      .flatMap((z) => z.surfaces)
      .some((s) => s.id === surfaceId);
    return hasSurface;
  };

  return { getSurfaceById, isMaxFloorBySurfaceId, isMinFloorBySurfaceId, updateSurface };
};
