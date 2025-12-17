import { SurfaceEditFields } from "@/domain/shape-info/components/fields/SurfaceEditFields";
import { ZoneEditFields } from "@/domain/shape-info/components/fields/ZoneEditFields";
import { BUILDING_HIERARCHY_TYPE } from "@/domain/shape-info/constants/shape.enums";
import { InputVisualProvider } from "@/domain/shape-info/hooks/useInputVisualState";

interface IRightSideAreaProps {
  selectedShape?: TSelectedShape;
}

type TSelectedFloor = {
  floorId: string;
  type: BUILDING_HIERARCHY_TYPE.floor;
};

type TSelectedShape = TSelectedFloor | TSelectedSurface | TSelectedZone;

type TSelectedSurface = {
  floorId: string;
  surfaceId: string;
  type: BUILDING_HIERARCHY_TYPE.surface;
  zoneId: string;
};

type TSelectedZone = {
  floorId: string;
  type: BUILDING_HIERARCHY_TYPE.zone;
  zoneId: string;
};

const ShapePropertiesPanelInner = ({ selectedShape }: IRightSideAreaProps) => {
  if (!selectedShape) return null;

  const renderFields = () => {
    switch (selectedShape.type) {
      case BUILDING_HIERARCHY_TYPE.surface:
        return (
          <SurfaceEditFields
            floorId={selectedShape.floorId}
            surfaceId={selectedShape.surfaceId}
            zoneId={selectedShape.zoneId}
          />
        );
      case BUILDING_HIERARCHY_TYPE.zone:
        return <ZoneEditFields zoneId={selectedShape.zoneId} />;
      default:
        return <></>;
    }
  };

  return <div>{renderFields()}</div>;
};

export const ShapePropertiesPanel = (props: IRightSideAreaProps) => {
  return (
    <InputVisualProvider>
      <ShapePropertiesPanelInner {...props} />
    </InputVisualProvider>
  );
};
