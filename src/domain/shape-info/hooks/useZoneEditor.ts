import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";

export const useZoneEditor = () => {
  const { setShapeInfo } = useDataSyncActions();
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore();

  const getZoneById = (id: string) => {
    for (const floor of shapeInfo!) {
      const found = floor.zones.find((zone) => zone.id === id);
      if (found) return found;
    }
    return undefined;
  };

  const updateZone = (id: string, data: Partial<TZoneGuiSchema>) => {
    const updatedList = shapeInfo?.map((floor) => ({
      ...floor,
      zones: floor.zones.map((zone) => (zone.id === id ? { ...zone, ...data } : zone)),
    }));

    setShapeInfo(updatedList!);
  };

  return { getZoneById, updateZone };
};
