import { createContext, useContext, useId } from "react";

import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { FloorViewText } from "@/domain/building/components/panel-common/FloorViewText";
import { PanelEmptyText } from "@/domain/building/components/panel-common/PanelEmptyText";
import { PanelTreeItem } from "@/domain/building/components/panel-common/PanelTreeItem";
import { PanelWrapper } from "@/domain/building/components/panel-common/PanelWrapper";
import { TAdjacentShape } from "@/domain/shape-info/components/surface/NewAddAdjacentZoneDialog";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { cn, createUniqueId } from "@/lib/utils";

const AdjacentTreeCtx = createContext<null | {
  currentSurfaceId: string;
  getFloorNumberBySurfaceId: (surfaceId: string) => number | undefined;
  getIsChecked: (id: string) => boolean;
  getZoneIdBySurfaceId: (surfaceId: string) => string | undefined;
  surfaceData: TSurfaceGuiSchema;
  toggleShapeId: (shapeType: BUILDING_SURFACE_TYPE, zoneId?: string) => (shapeId: string) => void;
}>(null);

const useAdjacentTree = () => {
  const ctx = useContext(AdjacentTreeCtx);
  if (!ctx) throw new Error("useAdjacent Tree must be used within AdjacentTreeCtx.Provider");
  return ctx;
};

// Helpers: 1층일 때 -1를 하면 0층이기 때문에 보정하는 helper 함수
const floorBelow = (n: number) => {
  const next = n - 1;
  return next === 0 ? -1 : next;
};
const floorAbove = (n: number) => {
  const next = n + 1;
  return next === 0 ? 1 : next;
};

interface IProps {
  currentSurfaceId: string;
  handleChangeSelectedShapeItem: (shapeItem: TAdjacentShape) => void;
  remodelingType?: ERemodelingType;
  selectedShapeItem?: TAdjacentShape;
  shapeInfo: TFloorGuiSchema[];
  surfaceData: TSurfaceGuiSchema;
}

export const AdjacentFloorTreePanel = ({
  currentSurfaceId,
  handleChangeSelectedShapeItem,
  remodelingType,
  selectedShapeItem,
  shapeInfo,
  surfaceData,
}: IProps) => {
  const uniqueId = useId();

  // Build a surfaceId -> floor_number map for quick lookups
  const surfaceIdToFloorNumber = new Map<string, number>();
  const surfaceIdToZoneId = new Map<string, string>();
  for (const floor of shapeInfo ?? []) {
    const fn = floor.floor_number;
    for (const zone of floor.zones ?? []) {
      for (const s of zone.surfaces ?? []) {
        surfaceIdToFloorNumber.set(s.id, fn);
        surfaceIdToZoneId.set(s.id, zone.id);
      }
    }
  }
  const getFloorNumberBySurfaceId = (surfaceId: string) => surfaceIdToFloorNumber.get(surfaceId);
  const getZoneIdBySurfaceId = (surfaceId: string) => surfaceIdToZoneId.get(surfaceId);

  const toggleShapeId =
    (shapeType: BUILDING_SURFACE_TYPE, zoneId?: string) => (shapeId: string) => {
      handleChangeSelectedShapeItem({
        surfaceId: shapeId,
        type: shapeType,
        zoneId: zoneId!,
      });
    };

  const getIsChecked = (shapeId: string) => {
    return selectedShapeItem?.surfaceId === shapeId;
  };
  const isEmpty = !shapeInfo || shapeInfo.length === 0;

  return (
    <PanelWrapper
      headerNode={
        <div className="space-y-1.5">
          <p className="text-neutral560 text-sm font-medium">위치</p>
        </div>
      }
    >
      <div className={cn("h-full w-full p-2.5", !remodelingType && "bg-neutral040")}>
        {remodelingType && (
          <AdjacentTreeCtx.Provider
            value={{
              currentSurfaceId,
              getFloorNumberBySurfaceId,
              getIsChecked,
              getZoneIdBySurfaceId,
              surfaceData,
              toggleShapeId,
            }}
          >
            {isEmpty ? <PanelEmptyText /> : <FloorList floors={shapeInfo} signatureId={uniqueId} />}
          </AdjacentTreeCtx.Provider>
        )}
      </div>
    </PanelWrapper>
  );
};

interface IFloorListProps extends IShapeCommonListProps {
  floors: TFloorGuiSchema[];
}

interface IShapeCommonListProps {
  signatureId: string;
}

const FloorList = ({ floors, signatureId }: IFloorListProps) => {
  return (
    <>
      {floors?.map((floor) => {
        const hasChildren = floor.zones.length > 0;
        const uniqueId = createUniqueId({ id: floor.floor_id, signature: signatureId });

        return (
          <Accordion key={uniqueId} type="multiple">
            <AccordionItem value={uniqueId}>
              <PanelTreeItem.Floor
                hasChildren={hasChildren}
                label={<FloorViewText name={floor.floor_name} num={floor.floor_number} />}
                uniqueId={uniqueId}
              />
              <AccordionContent className="p-0">
                <ZoneList
                  floorNumber={floor.floor_number}
                  signatureId={uniqueId}
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
  floorNumber: number;
  zones: TZoneGuiSchema[];
}

const ZoneList = ({ floorNumber, signatureId, zones }: IZoneListProps) => {
  return (
    <div className="ml-5">
      {zones.map((zone) => {
        const hasChildren = zone.surfaces.length > 0;
        const uniqueId = createUniqueId({ id: zone.id, signature: signatureId });

        return (
          <Accordion key={uniqueId} type="multiple">
            <AccordionItem value={uniqueId}>
              <PanelTreeItem.Floor
                hasChildren={hasChildren}
                label={zone.name}
                uniqueId={uniqueId}
              />
              <AccordionContent className="p-0">
                <SurfaceList
                  floorNumber={floorNumber}
                  signatureId={uniqueId}
                  surfaces={zone.surfaces}
                  zoneId={zone.id}
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
  floorNumber: number;
  surfaces: TSurfaceGuiSchema[];
  zoneId: string;
}

const SurfaceList = ({ floorNumber, signatureId, surfaces, zoneId }: ISurfaceListProps) => {
  const {
    currentSurfaceId,
    getFloorNumberBySurfaceId,
    getIsChecked,
    getZoneIdBySurfaceId,
    surfaceData,
    toggleShapeId,
  } = useAdjacentTree();
  const surfaceType = surfaceData?.type;

  const selectedZoneId = getZoneIdBySurfaceId(currentSurfaceId);

  const getIsDisabled = (candidate: TSurfaceGuiSchema) => {
    // 현재 선택된 surface(자신)은 항상 비활성화
    if (candidate.id === currentSurfaceId) return true;

    // 이미 인접이 설정된 면은 선택 불가 (adjacent_from 값이 존재하면 비활성화)
    if (
      (candidate.adjacent_from !== undefined &&
        candidate.adjacent_from !== null &&
        candidate.adjacent_from !== "") ||
      (candidate.adjacent_surface_id !== undefined &&
        candidate.adjacent_surface_id !== null &&
        candidate.adjacent_surface_id !== "")
    ) {
      return true;
    }

    // selectedFloorNumber: 현재 선택된 surface의 층(floor_number)
    const selectedFloorNumber = getFloorNumberBySurfaceId(currentSurfaceId);
    // candidateFloorNumber: 후보 surface의 층(floor_number)
    const candidateFloorNumber = floorNumber;

    // selectedFloorNumber이 undefined라면, 현재 선택된 surface의 층(floor_number)을 찾을 수 없음 -> disabled
    if (selectedFloorNumber === undefined) return true;

    // 타입이 벽이라면 같은 층의 다른 존 벽만 활성화
    if (surfaceType === BUILDING_SURFACE_TYPE.wall) {
      // Enable only same-floor walls in a different zone
      const candidateZoneId = zoneId;
      const isSameFloor = candidateFloorNumber === selectedFloorNumber;
      const isDifferentZone = selectedZoneId !== undefined && candidateZoneId !== selectedZoneId;
      return !(candidate.type === BUILDING_SURFACE_TYPE.wall && isSameFloor && isDifferentZone);
    }

    // 타입이 천장이라면 위층 바닥만 활성화
    if (surfaceType === BUILDING_SURFACE_TYPE.ceiling) {
      return !(
        candidate.type === BUILDING_SURFACE_TYPE.floor &&
        candidateFloorNumber === floorAbove(selectedFloorNumber)
      );
    }

    // 타입이 바닥이라면 아래층 천장만 활성화
    if (surfaceType === BUILDING_SURFACE_TYPE.floor) {
      // Enable only LOWER floor's ceiling surfaces

      return !(
        candidate.type === BUILDING_SURFACE_TYPE.ceiling &&
        candidateFloorNumber === floorBelow(selectedFloorNumber)
      );
    }

    // Default: disable others
    return true;
  };

  return (
    <div className="ml-5">
      {surfaces.map((surface) => {
        const uniqueId = createUniqueId({ id: surface.id, signature: signatureId });
        return (
          <PanelTreeItem.Radio
            checked={getIsChecked(surface.id)}
            disabled={getIsDisabled(surface)}
            key={uniqueId}
            label={surface.name}
            shapeId={surface.id}
            toggleShapeId={toggleShapeId(surface.type, zoneId)}
            uniqueId={uniqueId}
          />
        );
      })}
    </div>
  );
};
