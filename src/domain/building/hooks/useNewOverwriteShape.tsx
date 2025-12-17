import { useCallback, useMemo, useState } from "react";

import { validateDuplicateIdsHelper } from "@/domain/building/helpers/overwrite-helper";
import { BUILDING_HIERARCHY_TYPE } from "@/domain/shape-info/constants/shape.enums";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { customNanoid } from "@/lib/utils";

export type TNewOverwriteShape = {
  id: string;
  type: "remodeling" | BUILDING_HIERARCHY_TYPE;
};

export const useNewOverwriteShape = () => {
  const [baseRemodelingType, setBaseRemodelingType] = useState<ERemodelingType>();
  const [targetRemodelingType, setTargetRemodelingType] = useState<ERemodelingType>();

  const [selectedShapeItem, setSelectedShapeItem] = useState<TNewOverwriteShape>();
  const [selectedTargetIds, setSelectedTargetIds] = useState<Set<string>>(new Set());

  const { buildingFloors: baseShapeInfo, photovoltaic_systems: basePhotovoltaicSystems } =
    useBuildingGeometryStore(baseRemodelingType);

  const { buildingFloors: beforeShapeInfo } = useBuildingGeometryStore(ERemodelingType.BEFORE);
  const { buildingFloors: afterShapeInfo } = useBuildingGeometryStore(ERemodelingType.AFTER);

  // Combine BEFORE and AFTER into a unified target list for read operations
  const targetShapeInfo: TFloorGuiSchema[] = useMemo(
    () => [...(beforeShapeInfo ?? []), ...(afterShapeInfo ?? [])],
    [beforeShapeInfo, afterShapeInfo],
  );

  const { setRenewableSystem: setBeforeRenewableSystem, setShapeInfo: setBeforeShapeInfo } =
    useDataSyncActions(ERemodelingType.BEFORE);
  const { setRenewableSystem: setAfterRenewableSystem, setShapeInfo: setAfterShapeInfo } =
    useDataSyncActions(ERemodelingType.AFTER);

  const handleChangeSelectedShapeItem = useCallback(
    (shapeItem: TNewOverwriteShape) => {
      if (shapeItem.id === selectedShapeItem?.id) return;

      setSelectedShapeItem(shapeItem);
      setSelectedTargetIds(new Set());
    },
    [selectedShapeItem?.id],
  );

  const handleChangeBaseRemodelingType = useCallback((type?: ERemodelingType) => {
    setBaseRemodelingType(type);
    setSelectedShapeItem(undefined);
    setSelectedTargetIds(new Set());
  }, []);

  const handleChangeTargetRemodelingType = useCallback((type?: ERemodelingType) => {
    setTargetRemodelingType(type);
  }, []);

  // 전역 상태 저장
  const handleSave = useCallback((): { message: string; status: "error" | "success" } => {
    if (!targetShapeInfo || !baseShapeInfo) {
      return { message: "데이터를 불러오는데 실패했습니다.", status: "error" };
    }

    if (selectedShapeItem?.type !== "remodeling" && selectedTargetIds.size === 0) {
      return { message: "형상정보를 선택해주세요.", status: "error" };
    }
    if (!selectedShapeItem?.id) {
      return { message: "형상정보를 선택해주세요.", status: "error" };
    }

    // Combine both remodeling types so all floors can be searched and updated
    const targetList = structuredClone([...(beforeShapeInfo ?? []), ...(afterShapeInfo ?? [])]);

    let newShapeInfo: TFloorGuiSchema[] | undefined;

    if (selectedShapeItem?.type === "remodeling") {
      // Copy base (BEFORE) floors into target (AFTER) with new IDs
      if (!baseShapeInfo) return { message: "Base 데이터가 없습니다.", status: "error" };

      // 1) Preserve BASE floors as-is: do NOT clear adjacency & boundary_condition here
      const baseFloorsUnchanged = structuredClone(baseShapeInfo);

      const cloneWithNewIds = (floors: TFloorGuiSchema[]): TFloorGuiSchema[] => {
        // --- Pass 1: Build GLOBAL id maps across ALL floors ---
        const newZoneIdMap = new Map<string, string>();
        const newSurfaceIdMap = new Map<string, string>();

        floors.forEach((floor) => {
          floor.zones.forEach((zone) => {
            if (!newZoneIdMap.has(zone.id)) {
              newZoneIdMap.set(zone.id, customNanoid(16));
            }
            zone.surfaces.forEach((surface) => {
              if (!newSurfaceIdMap.has(surface.id)) {
                newSurfaceIdMap.set(surface.id, customNanoid(16));
              }
            });
          });
        });

        // Helper to remap adjacency using GLOBAL maps
        const remapAdjacency = (s: TSurfaceGuiSchema): TSurfaceGuiSchema => {
          const remapped: TSurfaceGuiSchema = { ...s };
          if (s.adjacent_zone_id) {
            const nz = newZoneIdMap.get(s.adjacent_zone_id);
            if (nz) remapped.adjacent_zone_id = nz;
          }
          if (s.adjacent_surface_id) {
            const ns = newSurfaceIdMap.get(s.adjacent_surface_id);
            if (ns) remapped.adjacent_surface_id = ns;
          }
          if (s.adjacent_from) {
            const nf = newSurfaceIdMap.get(s.adjacent_from);
            if (nf) remapped.adjacent_from = nf;
          }
          return remapped;
        };

        // --- Pass 2: Rebuild floors with new ids and globally remapped adjacencies ---
        return floors.map((floor) => {
          return {
            ...floor,
            floor_id: customNanoid(16),
            zones: floor.zones.map((zone) => {
              const newZoneId = newZoneIdMap.get(zone.id)!;
              return {
                ...zone,
                id: newZoneId,
                surfaces: zone.surfaces.map((surface) => {
                  const newSurfaceId = newSurfaceIdMap.get(surface.id)!;
                  const remapped = remapAdjacency(surface);
                  return { ...remapped, id: newSurfaceId };
                }),
              };
            }),
          };
        });
      };

      // Use preserved BASE floors (no adjacency clearing) for cloning
      const clonedFloors = cloneWithNewIds(baseFloorsUnchanged);

      // Copy base (selected baseRemodelingType) into the selected targetRemodelingType
      if (targetRemodelingType === ERemodelingType.BEFORE) {
        setBeforeShapeInfo(clonedFloors);
        // 리모델링 전 신재생 설비 복사
        setBeforeRenewableSystem({
          photovoltaic_systems: basePhotovoltaicSystems,
        });
      } else if (targetRemodelingType === ERemodelingType.AFTER) {
        setAfterShapeInfo(clonedFloors);
        // 리모델링 후 신재생 설비 복사
        setAfterRenewableSystem({
          photovoltaic_systems: basePhotovoltaicSystems,
        });
      } else {
        return { message: "타겟 리모델링 타입을 선택해주세요.", status: "error" };
      }

      // Validate for duplicate IDs before returning success
      validateDuplicateIdsHelper(beforeShapeInfo, afterShapeInfo);
      return { message: "리모델링 데이터 복사가 완료되었습니다.", status: "success" };
    }

    // 층
    if (selectedShapeItem.type === BUILDING_HIERARCHY_TYPE.floor) {
      const baseFloor = baseShapeInfo?.find(({ floor_id }) => floor_id === selectedShapeItem?.id);
      // --- Preserve original base floor adjacency (no clearing) ---
      if (baseFloor) {
        // Preserve original base floor adjacency (no clearing)
        const baseFloorUnchanged = structuredClone(baseFloor);

        // Inject baseFloorUnchanged into local targetList so final sanitation writes it back
        const targetIdx = targetList.findIndex((f) => f.floor_id === baseFloorUnchanged.floor_id);
        if (targetIdx >= 0) {
          targetList[targetIdx] = structuredClone(baseFloorUnchanged);
        }

        // Collect original IDs from floors that are about to be overwritten (for cascade cleanup)
        const replacedZoneIds = new Set<string>();
        const replacedSurfaceIds = new Set<string>();
        for (const fl of targetList) {
          if (!selectedTargetIds.has(fl.floor_id)) continue;
          for (const z of fl.zones) {
            replacedZoneIds.add(z.id);
            for (const s of z.surfaces) {
              replacedSurfaceIds.add(s.id);
            }
          }
        }

        newShapeInfo = targetList.map((floor) => {
          // 1) Cascade cleanup on every floor: remove any adjacency pointing to replaced target floors
          //    Only remove any adjacency pointing to replaced target floors
          const cleanedZones = floor.zones.map((zone) => ({
            ...zone,
            surfaces: zone.surfaces.map((s) => {
              const pointsToReplacedZone =
                s.adjacent_zone_id && replacedZoneIds.has(s.adjacent_zone_id);
              const pointsToReplacedSurface =
                (s.adjacent_surface_id && replacedSurfaceIds.has(s.adjacent_surface_id)) ||
                (s.adjacent_from && replacedSurfaceIds.has(s.adjacent_from));
              if (pointsToReplacedZone || pointsToReplacedSurface) {
                return {
                  ...s,
                  adjacent_from: undefined,
                  adjacent_surface_id: undefined,
                  adjacent_zone_id: undefined,
                  boundary_condition: "",
                };
              }
              return s;
            }),
          }));

          // 2) If this floor is not selected for overwrite, keep the cleaned version
          if (!selectedTargetIds.has(floor.floor_id)) {
            return { ...floor, zones: cleanedZones };
          }

          // Per-selected-floor: generate fresh IDs so each overwritten floor gets unique mappings
          const zoneIdMap = new Map<string, string>();
          const surfaceIdMap = new Map<string, string>();
          baseFloorUnchanged.zones.forEach((z) => {
            zoneIdMap.set(z.id, customNanoid(16));
            z.surfaces.forEach((s) => {
              surfaceIdMap.set(s.id, customNanoid(16));
            });
          });

          // Helper: remap adjacency to freshly generated ids (within this floor)
          const remapAdjacencyForFloor = (s: TSurfaceGuiSchema): TSurfaceGuiSchema => {
            const remapped: TSurfaceGuiSchema = { ...s };
            if (s.adjacent_zone_id) {
              const nz = zoneIdMap.get(s.adjacent_zone_id);
              if (nz) remapped.adjacent_zone_id = nz;
            }
            if (s.adjacent_surface_id) {
              const ns = surfaceIdMap.get(s.adjacent_surface_id);
              if (ns) remapped.adjacent_surface_id = ns;
            }
            if (s.adjacent_from) {
              const nf = surfaceIdMap.get(s.adjacent_from);
              if (nf) remapped.adjacent_from = nf;
            }
            return remapped;
          };

          // Overwrite selected floor with baseFloorUnchanged contents (with new IDs),
          // preserving all adjacency/boundary values from the source
          const updatedFloor = {
            ...floor,
            ...baseFloorUnchanged,
            floor_id: floor.floor_id,
            floor_name: floor.floor_name,
            floor_number: floor.floor_number,
            zones: baseFloorUnchanged.zones.map((zone) => {
              const newZoneId = zoneIdMap.get(zone.id)!;
              const newSurfaces = zone.surfaces.map((surface) => {
                const newSurfaceId = surfaceIdMap.get(surface.id)!;
                if (surface.type === BUILDING_SURFACE_TYPE.wall) {
                  const remapped = remapAdjacencyForFloor(surface);
                  return { ...remapped, id: newSurfaceId };
                }
                const srcHasAdj = Boolean(
                  surface.adjacent_zone_id || surface.adjacent_surface_id || surface.adjacent_from,
                );
                return {
                  ...surface,
                  adjacent_from: undefined,
                  adjacent_surface_id: undefined,
                  adjacent_zone_id: undefined,
                  boundary_condition: srcHasAdj ? "" : surface.boundary_condition,
                  id: newSurfaceId,
                };
              });
              return {
                ...zone,
                id: newZoneId,
                surfaces: newSurfaces,
              };
            }),
          };
          return updatedFloor;
        });
      }
    }

    // 존
    if (selectedShapeItem?.type === BUILDING_HIERARCHY_TYPE.zone) {
      const baseZone = baseShapeInfo
        ?.flatMap((floor) => floor.zones)
        .find(({ id }) => id === selectedShapeItem?.id);

      if (baseZone) {
        const selectedZoneIds = new Set(Array.from(selectedTargetIds));

        // --- Preserve original base zone adjacency (no clearing) ---
        const baseZoneUnchanged = structuredClone(baseZone);

        newShapeInfo = targetList?.map((floor) => {
          // collect surface ids of zones selected within this floor for cascade cleanup
          const selectedZonesInThisFloor = floor.zones.filter((z) => selectedZoneIds.has(z.id));
          const selectedSurfaceIdsInThisFloor = new Set(
            selectedZonesInThisFloor.flatMap((z) => z.surfaces.map((s) => s.id)),
          );

          return {
            ...floor,
            zones: floor.zones.map((zone) => {
              const isSelected = selectedZoneIds.has(zone.id);
              if (isSelected) {
                // Overwrite with baseZoneUnchanged (preserve base data), but clear adjacency on the new target surfaces and assign fresh IDs
                const overwrittenZone = {
                  ...baseZoneUnchanged,
                  id: zone.id,
                  name: zone.name,
                  surfaces: baseZoneUnchanged.surfaces.map((s) => {
                    const srcHasAdj = Boolean(
                      s.adjacent_zone_id || s.adjacent_surface_id || s.adjacent_from,
                    );
                    return {
                      ...s,
                      adjacent_from: undefined,
                      adjacent_surface_id: undefined,
                      adjacent_zone_id: undefined,
                      boundary_condition: srcHasAdj ? "" : s.boundary_condition,
                      id: customNanoid(16),
                    };
                  }),
                };
                return overwrittenZone;
              }

              // not selected: cascade-remove any adjacency pointing into selected zones or their surfaces
              return {
                ...zone,
                surfaces: zone.surfaces.map((s) => {
                  const pointsToSelectedZone =
                    s.adjacent_zone_id && selectedZoneIds.has(s.adjacent_zone_id);
                  const pointsToSelectedSurface =
                    (s.adjacent_surface_id &&
                      selectedSurfaceIdsInThisFloor.has(s.adjacent_surface_id)) ||
                    (s.adjacent_from && selectedSurfaceIdsInThisFloor.has(s.adjacent_from));
                  if (pointsToSelectedZone || pointsToSelectedSurface) {
                    return {
                      ...s,
                      adjacent_from: undefined,
                      adjacent_surface_id: undefined,
                      adjacent_zone_id: undefined,
                      boundary_condition: "",
                    };
                  }
                  return s;
                }),
              };
            }),
          };
        });
      }
    }

    // 면
    if (selectedShapeItem?.type === BUILDING_HIERARCHY_TYPE.surface) {
      const baseSurface = baseShapeInfo
        ?.flatMap((floor) => floor.zones)
        .flatMap((zone) => zone.surfaces)
        .find(({ id }) => id === selectedShapeItem?.id);

      if (baseSurface) {
        const baseSurfaceUnchanged = structuredClone(baseSurface);
        const selectedSurfaceIds = new Set(Array.from(selectedTargetIds));

        newShapeInfo = targetList?.map((floor) => {
          return {
            ...floor,
            zones: floor.zones.map((zone) => {
              return {
                ...zone,
                surfaces: zone.surfaces.map((surface) => {
                  const isTarget = selectedSurfaceIds.has(surface.id);

                  // 1) 대상 surface(B) 쪽: baseSurface로 덮어쓰되 adjacency 초기화
                  if (isTarget) {
                    return {
                      ...baseSurfaceUnchanged,
                      adjacent_from: undefined,
                      adjacent_surface_id: undefined,
                      adjacent_zone_id: undefined,
                      boundary_condition:
                        baseSurfaceUnchanged.adjacent_zone_id ||
                        baseSurfaceUnchanged.adjacent_surface_id ||
                        baseSurfaceUnchanged.adjacent_from
                          ? ""
                          : baseSurfaceUnchanged.boundary_condition,
                      id: surface.id,
                      name: surface.name,
                    };
                  }

                  // 2) 다른 surface(A) 쪽에서 B를 향한 adjacency 끊기
                  const pointsToTarget =
                    (surface.adjacent_surface_id &&
                      selectedSurfaceIds.has(surface.adjacent_surface_id)) ||
                    (surface.adjacent_from && selectedSurfaceIds.has(surface.adjacent_from));

                  if (pointsToTarget) {
                    return {
                      ...surface,
                      adjacent_from: undefined,
                      adjacent_surface_id: undefined,
                      adjacent_zone_id: undefined,
                      boundary_condition: "",
                    };
                  }

                  return surface;
                }),
              };
            }),
          };
        });
      }
    }

    if (newShapeInfo) {
      // --- Final sanitation: remove dangling adjacency references ---
      const validZoneIds = new Set<string>();
      const validSurfaceIds = new Set<string>();

      for (const f of newShapeInfo) {
        for (const z of f.zones) {
          validZoneIds.add(z.id);
          for (const s of z.surfaces) {
            validSurfaceIds.add(s.id);
          }
        }
      }

      const sanitizedShapeInfo = newShapeInfo.map((f) => ({
        ...f,
        zones: f.zones.map((z) => ({
          ...z,
          surfaces: z.surfaces.map((s) => {
            const invalidZone = s.adjacent_zone_id && !validZoneIds.has(s.adjacent_zone_id);
            const invalidSurfaceAdj =
              s.adjacent_surface_id && !validSurfaceIds.has(s.adjacent_surface_id);
            const invalidFrom = s.adjacent_from && !validSurfaceIds.has(s.adjacent_from);

            if (invalidZone || invalidSurfaceAdj || invalidFrom) {
              return {
                ...s,
                adjacent_from: invalidFrom ? undefined : s.adjacent_from,
                adjacent_surface_id: invalidSurfaceAdj ? undefined : s.adjacent_surface_id,
                adjacent_zone_id: invalidZone ? undefined : s.adjacent_zone_id,
              };
            }
            return s;
          }),
        })),
      }));

      setBeforeShapeInfo(
        sanitizedShapeInfo.filter((f) =>
          (beforeShapeInfo ?? []).some((bf) => bf.floor_id === f.floor_id),
        ),
      );
      setAfterShapeInfo(
        sanitizedShapeInfo.filter((f) =>
          (afterShapeInfo ?? []).some((af) => af.floor_id === f.floor_id),
        ),
      );
      // Validate for duplicate IDs before returning success
      validateDuplicateIdsHelper(beforeShapeInfo, afterShapeInfo);
      return { message: "공간정보 덮어쓰기가 완료되었습니다.", status: "success" };
    }
    return { message: "공간정보 덮어쓰기가 완료되지 않았습니다.", status: "error" };
  }, [
    baseShapeInfo,
    selectedShapeItem?.id,
    selectedShapeItem?.type,
    selectedTargetIds,
    targetRemodelingType,
    beforeShapeInfo,
    afterShapeInfo,
    targetShapeInfo,
    basePhotovoltaicSystems,
    setBeforeShapeInfo,
    setAfterShapeInfo,
    setBeforeRenewableSystem,
    setAfterRenewableSystem,
  ]);

  return {
    baseRemodelingType,
    baseShapeInfo,
    handleChangeBaseRemodelingType,
    handleChangeSelectedShapeItem,
    handleChangeTargetRemodelingType,
    handleSave,
    selectedShapeItem,
    selectedTargetIds,
    setSelectedTargetIds,
    targetRemodelingType,
    targetShapeInfo,
  };
};
