import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { HeadingWithRequired } from "@/components/custom/HeadingWithRequired";
import { ShapePropertiesPanel } from "@/domain/shape-info/components/ShapePropertiesPanel";
import { BUILDING_HIERARCHY_TYPE } from "@/domain/shape-info/constants/shape.enums";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";

const SurfacePage = () => {
  const { surfaceId } = useParams();
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore();

  const selectedShape: null | {
    floor: TFloorGuiSchema;
    surface: TSurfaceGuiSchema;
    zone: TZoneGuiSchema;
  } = useMemo(() => {
    const floor = shapeInfo.find((e) =>
      e.zones.some((e) => e.surfaces.some((e) => e.id === surfaceId)),
    );
    if (!floor) return null;

    const zone = floor.zones.find((e) => e.surfaces.some((e) => e.id === surfaceId));
    if (!zone) return null;

    const surface = zone.surfaces.find((e) => e.id === surfaceId);
    if (!surface) return null;

    return {
      floor,
      surface,
      zone,
    };
  }, [shapeInfo, surfaceId]);

  if (!selectedShape) return null;

  return (
    <div className="container-page">
      <div className="mb-10">
        <HeadingWithRequired heading={selectedShape.surface.name} />
      </div>
      <ShapePropertiesPanel
        selectedShape={{
          floorId: selectedShape.floor.floor_id,
          surfaceId: selectedShape.surface.id,
          type: BUILDING_HIERARCHY_TYPE.surface,
          zoneId: selectedShape.zone.id,
        }}
      />
    </div>
  );
};

export default SurfacePage;
