import { useParams } from "react-router-dom";

import { TooltipUIWithAdjacent } from "@/components/custom/TooltipUI";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { formatZoneOrSurfaceName } from "@/domain/shape-info/utils/shape-info.utils";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { cn } from "@/lib/utils";

export type TOnCheckedChange = (params: {
  building: ERemodelingType;
  checked: boolean;
  floorId?: string;
  name?: string;
  surfaceId?: string;
  zoneId?: string;
}) => void;
type TDepth = "floor" | "surface" | "version" | "zone";
type TOnItemClick = ({
  depth,
  id,
  remodelingType,
}: {
  depth: TDepth;
  id: string;
  remodelingType: ERemodelingType;
}) => void;
type TSelectionType = "checkbox" | "none" | "radio";

/**
 * ShapeTree 컴포넌트는 건물 구조(버전, 층, 존, 표면)를 트리 구조로 렌더링합니다.
 *
 * @param depth - radio/checkbox 태그를 표시할 트리의 깊이("version" | "floor" | "zone" | "surface")
 * @param getIsDisabled - surface 데이터를 바탕으로 disabled 조건을 설정하는 함수
 * @param remodelingType - 리모델링 타입(ERemodelingType)
 * @param selectionType - 선택 모드("none" | "checkbox" | "radio"), 기본값 "none"
 * @param onItemClick - 아이템 클릭 시 호출되는 콜백 함수
 * @param onCheckedChange - 체크박스/라디오 클릭 시 호출되는 콜백 함수
 */

export const ShapeTree = ({
  depth,
  getIsDisabled,
  onCheckedChange,
  onItemClick,
  remodelingType,
  selectionType = "none",
}: {
  depth: TDepth;
  getIsDisabled?: (surface: TSurfaceGuiSchema) => boolean;
  onCheckedChange?: TOnCheckedChange;
  onItemClick?: TOnItemClick;
  remodelingType: ERemodelingType;
  selectionType?: TSelectionType;
}) => {
  const { floorId, surfaceId, zoneId } = useParams();

  const {
    buildingFloors: shapeInfo,
    version: { name: versionName },
  } = useBuildingGeometryStore(remodelingType);

  return (
    <Accordion type="multiple">
      <AccordionItem value={remodelingType}>
        <div className="w-fit py-1">
          <AccordionTrigger
            className="cursor-pointer flex-row-reverse items-center gap-1 p-0"
            onClick={() =>
              onItemClick?.({
                depth: "version",
                id: remodelingType,
                remodelingType: remodelingType,
              })
            }
          >
            <div className="flex items-center gap-2">
              <SelectionControl
                depth={depth}
                id={`version-${remodelingType}`}
                levelName="version"
                onChange={(isChecked) =>
                  onCheckedChange?.({
                    building: remodelingType,
                    checked: isChecked,
                  })
                }
                selectionType={selectionType}
              />
              <Label className={cn("text-neutral640 cursor-pointer text-sm")}>{versionName}</Label>
            </div>
          </AccordionTrigger>
        </div>
        <AccordionContent className="ml-5 p-0">
          <Accordion type="multiple">
            {shapeInfo.map((floor) => {
              const floorName = `${floor.floor_name}(${floor.floor_number < 0 ? "B" : ""}${Math.abs(floor.floor_number)}F)`;

              return (
                <AccordionItem key={floor.floor_id} value={floor.floor_id}>
                  <div className="w-fit py-1">
                    <AccordionTrigger
                      className="cursor-pointer flex-row-reverse items-center gap-1 p-0"
                      onClick={() =>
                        onItemClick?.({ depth: "floor", id: floor.floor_id, remodelingType })
                      }
                    >
                      <div className="flex items-center gap-2">
                        <SelectionControl
                          depth={depth}
                          id={floor.floor_id}
                          levelName="floor"
                          selectionType={selectionType}
                        />
                        <Label
                          className={cn(
                            "text-neutral640 cursor-pointer text-sm",
                            floor.floor_id === floorId && "text-primary",
                          )}
                        >
                          {floorName}
                        </Label>
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="ml-5 p-0">
                    <Accordion type="multiple">
                      {floor.zones.map((zone) => {
                        return (
                          <AccordionItem key={zone.id} value={zone.id}>
                            <div className="w-fit py-1">
                              <AccordionTrigger
                                className="cursor-pointer flex-row-reverse items-center gap-1 p-0"
                                onClick={() =>
                                  onItemClick?.({ depth: "zone", id: zone.id, remodelingType })
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <SelectionControl
                                    depth={depth}
                                    id={zone.id}
                                    levelName="zone"
                                    onChange={(isChecked) =>
                                      onCheckedChange?.({
                                        building: remodelingType,
                                        checked: isChecked,
                                        floorId: floor.floor_id,
                                        name: `${versionName}-${floorName}-${zone.name}`,
                                        zoneId: zone.id,
                                      })
                                    }
                                    selectionType={selectionType}
                                  />
                                  <Label
                                    className={cn(
                                      "text-neutral640 cursor-pointer text-sm",
                                      zone.id === zoneId && "text-primary",
                                    )}
                                  >
                                    {zone.name}
                                  </Label>
                                </div>
                              </AccordionTrigger>
                            </div>
                            <AccordionContent className="ml-5 p-0">
                              {zone.surfaces.map((surface) => {
                                const disabled = getIsDisabled ? getIsDisabled(surface) : false;

                                return (
                                  <div
                                    className="flex w-fit items-center gap-1 py-1"
                                    key={surface.id}
                                  >
                                    <SelectionControl
                                      depth={depth}
                                      disabled={disabled}
                                      id={surface.id}
                                      levelName="surface"
                                      onChange={(isChecked) =>
                                        onCheckedChange?.({
                                          building: remodelingType,
                                          checked: isChecked,
                                          floorId: floor.floor_id,
                                          name: `${versionName}-${floorName}-${zone.name}-${surface.name}`,
                                          surfaceId: surface.id,
                                          zoneId: zone.id,
                                        })
                                      }
                                      selectionType={selectionType}
                                    />
                                    {(selectionType === "none" || depth !== "surface") &&
                                      (surface.type === BUILDING_SURFACE_TYPE.ceiling ? (
                                        <CeilingIcon />
                                      ) : surface.type === BUILDING_SURFACE_TYPE.wall ? (
                                        <WallIcon />
                                      ) : surface.type === BUILDING_SURFACE_TYPE.floor ? (
                                        <FloorIcon />
                                      ) : null)}
                                    <Label
                                      className={cn(
                                        "text-neutral640 cursor-pointer text-sm hover:underline",
                                        surface.id === surfaceId && "text-primary",
                                      )}
                                      onClick={() =>
                                        onItemClick?.({
                                          depth: "surface",
                                          id: surface.id,
                                          remodelingType,
                                        })
                                      }
                                    >
                                      {surface.name}
                                    </Label>
                                    {surface.adjacent_surface_id && (
                                      <button
                                        className="cursor-pointer"
                                        onClick={() =>
                                          onItemClick?.({
                                            depth: "surface",
                                            id: surface.adjacent_surface_id!,
                                            remodelingType,
                                          })
                                        }
                                      >
                                        <TooltipUIWithAdjacent
                                          text={formatZoneOrSurfaceName(
                                            surface.adjacent_surface_id,
                                            shapeInfo,
                                          )}
                                        />
                                      </button>
                                    )}
                                    {surface.adjacent_from && (
                                      <button
                                        className="cursor-pointer"
                                        onClick={() =>
                                          onItemClick?.({
                                            depth: "surface",
                                            id: surface.adjacent_from!,
                                            remodelingType,
                                          })
                                        }
                                      >
                                        <TooltipUIWithAdjacent
                                          text={formatZoneOrSurfaceName(
                                            surface.adjacent_from,
                                            shapeInfo,
                                          )}
                                        />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const SelectionControl = ({
  depth,
  disabled = false,
  id,
  levelName,
  onChange,
  selectionType,
}: {
  depth: TDepth;
  disabled?: boolean;
  id: string;
  levelName: TDepth;
  onChange?: (checked: boolean) => void;
  selectionType: TSelectionType;
}) => {
  if (selectionType === "none" || levelName !== depth) return null;

  const inputType = selectionType === "checkbox" ? "checkbox" : "radio";

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <input
        aria-label={`${levelName}-select-${id}`}
        className="accent-primary h-4 w-3.5"
        disabled={disabled}
        name={`${levelName}-selector`}
        onChange={(e) => {
          e.stopPropagation();
          onChange?.(e.currentTarget.checked);
        }}
        onClick={(e) => e.stopPropagation()}
        type={inputType}
      />
    </div>
  );
};

const CeilingIcon = () => {
  return (
    <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.47386 10.7727L2.22401 5.52271C2.11796 5.27526 2.29947 5 2.56869 5L13.4312 5C13.7005 5 13.882 5.27529 13.7759 5.52275L11.5254 10.7727C11.4663 10.9106 11.3307 11 11.1807 11L4.81854 11C4.66853 11 4.53295 10.9106 4.47386 10.7727Z"
        stroke="#808080"
        strokeWidth="1.2"
      />
    </svg>
  );
};

const WallIcon = () => {
  return (
    <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5341 2.11648L5.28405 3.42891C5.11711 3.47064 5 3.62063 5 3.79271V13.5197C5 13.7637 5.22927 13.9427 5.46595 13.8835L10.7159 12.5711C10.8829 12.5294 11 12.3794 11 12.2073V2.48028C11 2.23632 10.7707 2.05731 10.5341 2.11648Z"
        stroke="#808080"
        strokeWidth="1.2"
      />
    </svg>
  );
};

const FloorIcon = () => {
  return (
    <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.47386 5.22729L2.22401 10.4773C2.11796 10.7247 2.29947 11 2.56869 11L13.4312 11C13.7005 11 13.882 10.7247 13.7759 10.4773L11.5254 5.22725C11.4663 5.08939 11.3307 5 11.1807 5L4.81854 5C4.66853 5 4.53295 5.0894 4.47386 5.22729Z"
        stroke="#808080"
        strokeWidth="1.2"
      />
    </svg>
  );
};
