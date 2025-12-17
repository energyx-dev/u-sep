import { useId } from "react";

import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { PanelTreeItem } from "@/domain/building/components/panel-common/PanelTreeItem";
import { PanelWrapper } from "@/domain/building/components/panel-common/PanelWrapper";
import { TNewOverwriteShape } from "@/domain/building/hooks/useNewOverwriteShape";
import { BUILDING_HIERARCHY_TYPE } from "@/domain/shape-info/constants/shape.enums";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { cn, createUniqueId } from "@/lib/utils";

interface IProps {
  handleChangeBaseRemodelingType: (type?: ERemodelingType) => void;
  handleChangeSelectedShapeItem: (shapeItem: TNewOverwriteShape) => void;
  selectedShapeItem?: TNewOverwriteShape;
  shapeInfo: TFloorGuiSchema[];
}

export const NewOverwriteBaseRemodelingPanel = ({
  handleChangeBaseRemodelingType,
  handleChangeSelectedShapeItem,
  selectedShapeItem,
}: IProps) => {
  const uniqueId = useId();

  const {
    buildingFloors: beforeShapeInfo,
    version: { name: beforeVersionName },
  } = useBuildingGeometryStore(ERemodelingType.BEFORE);
  const {
    buildingFloors: afterShapeInfo,
    version: { name: afterVersionName },
  } = useBuildingGeometryStore(ERemodelingType.AFTER);

  const toggleShapeId =
    (shapeType: "remodeling" | BUILDING_HIERARCHY_TYPE, type?: ERemodelingType) =>
    (shapeId: string) => {
      if (type !== undefined) {
        handleChangeBaseRemodelingType(type);
      }
      handleChangeSelectedShapeItem({ id: shapeId, type: shapeType });
    };

  const getIsChecked = (shapeId: string) => {
    return selectedShapeItem?.id === shapeId;
  };

  const beforeUniqueId = createUniqueId({ id: beforeVersionName, signature: uniqueId });
  const afterUniqueId = createUniqueId({ id: afterVersionName, signature: uniqueId });

  return (
    <PanelWrapper
      headerNode={
        <div className="space-y-1.5">
          <p className="text-neutral560 text-sm font-medium">형상 위치</p>
        </div>
      }
    >
      <div className={cn("h-full w-full p-2.5")}>
        <Accordion type="multiple">
          <AccordionItem value={beforeUniqueId}>
            <PanelTreeItem.Radio
              checked={getIsChecked(beforeUniqueId)}
              hasChildren={beforeShapeInfo.length > 0}
              label={beforeVersionName}
              shapeId={beforeUniqueId}
              toggleShapeId={toggleShapeId("remodeling", ERemodelingType.BEFORE)}
              uniqueId={beforeUniqueId}
            />
            <AccordionContent>
              <FloorList
                floors={beforeShapeInfo}
                getIsChecked={getIsChecked}
                remodelingType={ERemodelingType.BEFORE}
                signatureId={beforeUniqueId}
                toggleShapeId={toggleShapeId}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="multiple">
          <AccordionItem value={afterUniqueId}>
            <PanelTreeItem.Radio
              checked={getIsChecked(afterUniqueId)}
              hasChildren={afterShapeInfo.length > 0}
              label={afterVersionName}
              shapeId={afterUniqueId}
              toggleShapeId={toggleShapeId("remodeling", ERemodelingType.AFTER)}
              uniqueId={afterUniqueId}
            />
            <AccordionContent>
              <FloorList
                floors={afterShapeInfo}
                getIsChecked={getIsChecked}
                remodelingType={ERemodelingType.AFTER}
                signatureId={afterUniqueId}
                toggleShapeId={toggleShapeId}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PanelWrapper>
  );
};

interface IFloorListProps extends IShapeCommonListProps {
  floors: TFloorGuiSchema[];
  remodelingType: ERemodelingType;
}

interface IShapeCommonListProps {
  getIsChecked: (shapeId: string) => boolean;
  signatureId: string;
  toggleShapeId: (
    shapeType: BUILDING_HIERARCHY_TYPE,
    remodelingType: ERemodelingType,
  ) => (shapeId: string) => void;
}

const FloorList = ({
  floors,
  getIsChecked,
  remodelingType,
  signatureId,
  toggleShapeId,
}: IFloorListProps) => {
  return (
    <>
      {floors?.map((floor) => {
        const hasChildren = floor.zones.length > 0;
        const uniqueId = createUniqueId({ id: floor.floor_id, signature: signatureId });

        return (
          <Accordion className="ml-5" key={uniqueId} type="multiple">
            <AccordionItem value={uniqueId}>
              <PanelTreeItem.Radio
                checked={getIsChecked(floor.floor_id)}
                hasChildren={hasChildren}
                label={floor.floor_name}
                shapeId={floor.floor_id}
                toggleShapeId={toggleShapeId(BUILDING_HIERARCHY_TYPE.floor, remodelingType)}
                uniqueId={uniqueId}
              />
              <AccordionContent className="p-0">
                <ZoneList
                  getIsChecked={getIsChecked}
                  remodelingType={remodelingType}
                  signatureId={uniqueId}
                  toggleShapeId={toggleShapeId}
                  zones={floor.zones}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </>
  );
};

interface IZoneListProps extends IShapeCommonListProps {
  remodelingType: ERemodelingType;
  zones: TZoneGuiSchema[];
}

const ZoneList = ({
  getIsChecked,
  remodelingType,
  signatureId,
  toggleShapeId,
  zones,
}: IZoneListProps) => {
  return (
    <div>
      {zones.map((zone) => {
        const hasChildren = zone.surfaces.length > 0;
        const uniqueId = createUniqueId({ id: zone.id, signature: signatureId });

        return (
          <Accordion className="ml-5" key={uniqueId} type="multiple">
            <AccordionItem value={uniqueId}>
              <PanelTreeItem.Radio
                checked={getIsChecked(zone.id)}
                hasChildren={hasChildren}
                label={zone.name}
                shapeId={zone.id}
                toggleShapeId={toggleShapeId(BUILDING_HIERARCHY_TYPE.zone, remodelingType)}
                uniqueId={uniqueId}
              />
              <AccordionContent className="p-0">
                <SurfaceList
                  getIsChecked={getIsChecked}
                  remodelingType={remodelingType}
                  signatureId={uniqueId}
                  surfaces={zone.surfaces}
                  toggleShapeId={toggleShapeId}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
};

interface ISurfaceListProps extends IShapeCommonListProps {
  remodelingType: ERemodelingType;
  surfaces: TSurfaceGuiSchema[];
}

const SurfaceList = ({
  getIsChecked,
  remodelingType,
  signatureId,
  surfaces,
  toggleShapeId,
}: ISurfaceListProps) => {
  return (
    <div className="ml-5">
      {surfaces.map((surface) => {
        const uniqueId = createUniqueId({ id: surface.id, signature: signatureId });
        return (
          <PanelTreeItem.Radio
            checked={getIsChecked(surface.id)}
            key={uniqueId}
            label={surface.name}
            shapeId={surface.id}
            toggleShapeId={toggleShapeId(BUILDING_HIERARCHY_TYPE.surface, remodelingType)}
            uniqueId={uniqueId}
          />
        );
      })}
    </div>
  );
};
