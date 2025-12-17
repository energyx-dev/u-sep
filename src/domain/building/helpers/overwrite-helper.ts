import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";

// buildingFloors의 데이터들의 floor, zone, surface의 id가 중복되고 있는지 검증하는 함수
export function validateDuplicateIdsHelper(
  beforeBuilding: TFloorGuiSchema[],
  afterBuilding: TFloorGuiSchema[],
) {
  const ids = new Set<string>();
  const duplicates = new Set<string>();

  function collectIds(building: TFloorGuiSchema[]) {
    for (const floor of building) {
      if (ids.has(floor.floor_id)) duplicates.add(floor.floor_id);
      ids.add(floor.floor_id);

      for (const zone of floor.zones) {
        if (ids.has(zone.id)) duplicates.add(zone.id);
        ids.add(zone.id);

        for (const surface of zone.surfaces) {
          if (ids.has(surface.id)) duplicates.add(surface.id);
          ids.add(surface.id);
        }
      }
    }
  }

  collectIds(beforeBuilding);
  collectIds(afterBuilding);

  if (duplicates.size > 0) {
    console.error("⚠️ 중복 ID 확인됨 - ", Array.from(duplicates));
    return {
      duplicates: Array.from(duplicates),
      success: false,
    };
  }

  console.log("✅ 중복 ID 없음 - 검증 완료");
  return { success: true };
}
