import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { HeadingWithRequired } from "@/components/custom/HeadingWithRequired";
import { ShapePropertiesPanel } from "@/domain/shape-info/components/ShapePropertiesPanel";
import { BUILDING_HIERARCHY_TYPE } from "@/domain/shape-info/constants/shape.enums";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";

const ZonePage = () => {
  const { zoneId } = useParams();
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore();

  const selectedShape: null | { floor: TFloorGuiSchema; zone: TZoneGuiSchema } = useMemo(() => {
    const floor = shapeInfo.find((e) => e.zones.some((e) => e.id === zoneId));
    if (!floor) return null;

    const zone = floor.zones.find((e) => e.id === zoneId);

    if (!zone) return null;

    return {
      floor,
      zone,
    };
  }, [shapeInfo, zoneId]);

  if (!selectedShape) return null;

  return (
    <div className="container-page">
      <div className="mb-10">
        <HeadingWithRequired heading={selectedShape.zone.name} />
      </div>

      <ShapePropertiesPanel
        selectedShape={{
          floorId: selectedShape.floor.floor_id,
          type: BUILDING_HIERARCHY_TYPE.zone,
          zoneId: selectedShape.zone.id,
        }}
      />
    </div>
  );
};

export default ZonePage;
