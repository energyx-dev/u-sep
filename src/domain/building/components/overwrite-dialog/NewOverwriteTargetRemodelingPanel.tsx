import { Dispatch, SetStateAction, useId } from "react";

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
  baseRemodelingType: ERemodelingType;
  baseShapeId?: string;
  handleChangeTargetRemodelingType: (type?: ERemodelingType) => void;
  selectableShapeType?: "remodeling" | BUILDING_HIERARCHY_TYPE;
  selectedTargetIds: Set<string>;
  setSelectedTargetIds: Dispatch<SetStateAction<Set<string>>>;
  shapeInfo: TFloorGuiSchema[];
}

export const NewOverwriteTargetRemodelingPanel = ({
  baseRemodelingType,
  baseShapeId,
  handleChangeTargetRemodelingType,
  selectableShapeType,
  selectedTargetIds,
  setSelectedTargetIds,
}: IProps) => {
  const signatureId = useId();

  const {
    buildingFloors: beforeShapeInfo,
    version: { name: beforeVersionName },
  } = useBuildingGeometryStore(ERemodelingType.BEFORE);

  const {
    buildingFloors: afterShapeInfo,
    version: { name: afterVersionName },
  } = useBuildingGeometryStore(ERemodelingType.AFTER);

  const beforeUniqueId = createUniqueId({ id: beforeVersionName, signature: signatureId });
  const afterUniqueId = createUniqueId({ id: afterVersionName, signature: signatureId });

  // Auto-open behavior depending on selectable shape type
  const shouldOpenRemodeling = !!selectableShapeType && selectableShapeType !== "remodeling";
  const shouldOpenFloors =
    selectableShapeType === "remodeling" ||
    selectableShapeType === BUILDING_HIERARCHY_TYPE.zone ||
    selectableShapeType === BUILDING_HIERARCHY_TYPE.surface;
  const shouldOpenZones = selectableShapeType === BUILDING_HIERARCHY_TYPE.surface;
  const shouldOpenSurfaces = selectableShapeType === BUILDING_HIERARCHY_TYPE.surface;

  const toggleShapeId =
    (shapeType: "remodeling" | BUILDING_HIERARCHY_TYPE, remodelingBase?: ERemodelingType) =>
    (shapeId: string) => {
      if (getIsDisabled({ id: shapeId, type: shapeType as BUILDING_HIERARCHY_TYPE })) {
        return;
      }

      if (remodelingBase !== undefined) {
        handleChangeTargetRemodelingType(remodelingBase);
      }

      setSelectedTargetIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(shapeId)) {
          newSet.delete(shapeId);
        } else {
          newSet.add(shapeId);
        }
        return newSet;
      });
    };

  const getIsDisabled = ({
    id,
    remodelingType,
    type,
  }: TNewOverwriteShape & { remodelingType?: ERemodelingType }) => {
    if (type === "remodeling") {
      // 선택한 리모델링 타입, base 리모델링 타입이 같으면 비활성화
      if (
        baseRemodelingType === ERemodelingType.BEFORE &&
        remodelingType === ERemodelingType.BEFORE
      ) {
        return true;
      }
      if (
        baseRemodelingType === ERemodelingType.AFTER &&
        remodelingType === ERemodelingType.AFTER
      ) {
        return true;
      }
      // Allow interaction when the same remodeling type is selected
      return selectableShapeType !== "remodeling";
    }

    if (type === BUILDING_HIERARCHY_TYPE.surface) {
      const allSurfaces = [...beforeShapeInfo, ...afterShapeInfo].flatMap((f) =>
        f.zones.flatMap((z) => z.surfaces),
      );
      const targetSurface = allSurfaces.find((s) => s.id === id);
      const baseSurface = allSurfaces.find((s) => s.id === baseShapeId);
      if (targetSurface && baseSurface) {
        return (
          selectableShapeType !== type ||
          baseShapeId === id ||
          targetSurface.type !== baseSurface.type
        );
      }
    }
    return selectableShapeType !== type || baseShapeId === id;
  };

  const getLabel = ({ name, shapeId }: { name: string; shapeId: string }) => {
    if (shapeId === baseShapeId) return `${name} (복사할 형상 정보)`;
    return `${name}`;
  };

  const getIsChecked = (shapeId: string) => {
    return selectedTargetIds.has(shapeId);
  };

  return (
    <PanelWrapper
      headerNode={
        <div className="space-y-1.5">
          <p className="text-neutral560 text-sm font-medium">{"목표 위치"}</p>
        </div>
      }
    >
      <div className={cn("h-full w-full p-2.5")}>
        <Accordion
          defaultValue={shouldOpenRemodeling ? [beforeUniqueId] : []}
          key={`before-${selectableShapeType ?? "none"}`}
          type="multiple"
        >
          <AccordionItem value={beforeUniqueId}>
            <PanelTreeItem.Checkbox
              checked={getIsChecked(beforeUniqueId)}
              disabled={getIsDisabled({
                id: beforeUniqueId,
                remodelingType: ERemodelingType.BEFORE,
                type: "remodeling",
              })}
              hasChildren={beforeShapeInfo.length > 0}
              label={beforeVersionName}
              shapeId={beforeUniqueId}
              toggleShapeId={toggleShapeId("remodeling", ERemodelingType.BEFORE)}
              uniqueId={beforeUniqueId}
            />
            <AccordionContent>
              <FloorList
                autoOpenFloors={shouldOpenFloors}
                autoOpenSurfaces={shouldOpenSurfaces}
                autoOpenZones={shouldOpenZones}
                floors={beforeShapeInfo}
                getIsChecked={getIsChecked}
                getIsDisabled={getIsDisabled}
                getLabel={getLabel}
                remodelingType={ERemodelingType.BEFORE}
                signatureId={beforeUniqueId}
                toggleShapeId={toggleShapeId}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion
          defaultValue={shouldOpenRemodeling ? [afterUniqueId] : []}
          key={`after-${selectableShapeType ?? "none"}`}
          type="multiple"
        >
          <AccordionItem value={afterUniqueId}>
            <PanelTreeItem.Checkbox
              checked={getIsChecked(afterUniqueId)}
              disabled={getIsDisabled({
                id: afterUniqueId,
                remodelingType: ERemodelingType.AFTER,
                type: "remodeling",
              })}
              hasChildren={afterShapeInfo.length > 0}
              label={afterVersionName}
              shapeId={afterUniqueId}
              toggleShapeId={toggleShapeId("remodeling", ERemodelingType.AFTER)}
              uniqueId={afterUniqueId}
            />
            <AccordionContent>
              <FloorList
                autoOpenFloors={shouldOpenFloors}
                autoOpenSurfaces={shouldOpenSurfaces}
                autoOpenZones={shouldOpenZones}
                floors={afterShapeInfo}
                getIsChecked={getIsChecked}
                getIsDisabled={getIsDisabled}
                getLabel={getLabel}
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
  autoOpenFloors: boolean;
  autoOpenSurfaces: boolean;
  autoOpenZones: boolean;
  floors: TFloorGuiSchema[];
  remodelingType: ERemodelingType;
}

interface IShapeCommonListProps {
  getIsChecked: (shapeId: string) => boolean;
  getIsDisabled: (params: TNewOverwriteShape & { remodelingType?: ERemodelingType }) => boolean;
  getLabel: ({ name, shapeId }: { name: string; shapeId: string }) => string;
  signatureId: string;
  toggleShapeId: (
    shapeType: "remodeling" | BUILDING_HIERARCHY_TYPE,
    remodelingBase?: ERemodelingType,
  ) => (shapeId: string) => void;
}

// 층 렌더링 컴포넌트
const FloorList = ({
  autoOpenFloors,
  autoOpenSurfaces,
  autoOpenZones,
  floors,
  getIsChecked,
  getIsDisabled,
  getLabel,
  remodelingType,
  signatureId,
  toggleShapeId,
}: IFloorListProps) => (
  <>
    {floors.map((floor) => {
      const hasChildren = floor.zones.length > 0;
      const uniqueId = createUniqueId({ id: floor.floor_id, signature: signatureId });

      return (
        <Accordion
          className="ml-5"
          defaultValue={autoOpenFloors ? [uniqueId] : []}
          key={`${uniqueId}-${autoOpenFloors}-${autoOpenZones}`}
          type="multiple"
        >
          <AccordionItem value={uniqueId}>
            <PanelTreeItem.Checkbox
              checked={getIsChecked(floor.floor_id)}
              disabled={getIsDisabled({
                id: floor.floor_id,
                remodelingType,
                type: BUILDING_HIERARCHY_TYPE.floor,
              })}
              hasChildren={hasChildren}
              label={getLabel({ name: floor.floor_name, shapeId: floor.floor_id })}
              shapeId={floor.floor_id}
              toggleShapeId={toggleShapeId(BUILDING_HIERARCHY_TYPE.floor, remodelingType)}
              uniqueId={uniqueId}
            />
            <AccordionContent className="p-0">
              <ZoneList
                autoOpenZones={autoOpenZones || autoOpenSurfaces}
                getIsChecked={getIsChecked}
                getIsDisabled={getIsDisabled}
                getLabel={getLabel}
                remodelingType={remodelingType}
                signatureId={signatureId}
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

interface IZoneListProps extends IShapeCommonListProps {
  autoOpenZones: boolean;
  remodelingType: ERemodelingType;
  zones: TZoneGuiSchema[];
}

// 존 렌더링 컴포넌트
const ZoneList = ({
  autoOpenZones,
  getIsChecked,
  getIsDisabled,
  getLabel,
  remodelingType,
  signatureId,
  toggleShapeId,
  zones,
}: IZoneListProps) => (
  <div>
    {zones.map((zone) => {
      const hasChildren = zone.surfaces.length > 0;
      const uniqueId = createUniqueId({ id: zone.id, signature: signatureId });

      return (
        <Accordion
          className="ml-5"
          defaultValue={autoOpenZones ? [uniqueId] : []}
          key={`${uniqueId}-${autoOpenZones}`}
          type="multiple"
        >
          <AccordionItem value={uniqueId}>
            <PanelTreeItem.Checkbox
              checked={getIsChecked(zone.id)}
              disabled={getIsDisabled({
                id: zone.id,
                remodelingType,
                type: BUILDING_HIERARCHY_TYPE.zone,
              })}
              hasChildren={hasChildren}
              label={getLabel({ name: zone.name, shapeId: zone.id })}
              shapeId={zone.id}
              toggleShapeId={toggleShapeId(BUILDING_HIERARCHY_TYPE.zone, remodelingType)}
              uniqueId={uniqueId}
            />
            <AccordionContent className="p-0">
              <SurfaceList
                getIsChecked={getIsChecked}
                getIsDisabled={getIsDisabled}
                getLabel={getLabel}
                remodelingType={remodelingType}
                signatureId={signatureId}
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

interface ISurfaceListProps extends IShapeCommonListProps {
  remodelingType: ERemodelingType;
  surfaces: TSurfaceGuiSchema[];
}

// 면 렌더링 컴포넌트
const SurfaceList = ({
  getIsChecked,
  getIsDisabled,
  getLabel,
  remodelingType,
  signatureId,
  surfaces,
  toggleShapeId,
}: ISurfaceListProps) => (
  <div className={"ml-5"}>
    {surfaces.map((surface) => {
      const uniqueId = createUniqueId({ id: surface.id, signature: signatureId });
      return (
        <PanelTreeItem.Checkbox
          checked={getIsChecked(surface.id)}
          disabled={getIsDisabled({
            id: surface.id,
            remodelingType,
            type: BUILDING_HIERARCHY_TYPE.surface,
          })}
          key={uniqueId}
          label={getLabel({ name: surface.name, shapeId: surface.id })}
          shapeId={surface.id}
          toggleShapeId={toggleShapeId(BUILDING_HIERARCHY_TYPE.surface, remodelingType)}
          uniqueId={uniqueId}
        />
      );
    })}
  </div>
);
