import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { StepperUIDisplay } from "@/components/custom/StepperUIDisplay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShapeInfoTable } from "@/domain/shape-info/components/ShapeInfoTable";
import { BUILDING_HIERARCHY_TYPE } from "@/domain/shape-info/constants/shape.enums";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { initSurface, initZone } from "@/domain/shape-info/utils/shape-info.utils";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { customNanoid } from "@/lib/utils";

export type TTableData = {
  ceiling: number;
  floor: number;
  floorLabel: string;
  wall: number;
  zoneId: string;
  zoneLabel: string;
};

type Props = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  remodelingType?: ERemodelingType; // TODO optional 제거
};

const SURFACE_SORT_ORDER: Record<string, number> = {
  [BUILDING_SURFACE_TYPE.ceiling]: 1,
  [BUILDING_SURFACE_TYPE.floor]: 0,
  [BUILDING_SURFACE_TYPE.wall]: 2,
};

const getColumns = () => {
  const columnHelper = createColumnHelper();
  return [
    columnHelper.accessor("floorLabel", {
      cell: (info) => info.getValue(),
      header: "층",
      size: 72,
    }),
    columnHelper.accessor("zoneLabel", {
      cell: (info) => info.getValue(),
      header: "존",
      size: 72,
    }),
    columnHelper.accessor(BUILDING_SURFACE_TYPE.floor, {
      cell: (info) => info.getValue(),
      header: "바닥",
      size: 72,
    }),
    columnHelper.accessor(BUILDING_SURFACE_TYPE.ceiling, {
      cell: (info) => info.getValue(),
      header: "천장",
      size: 72,
    }),
    columnHelper.accessor(BUILDING_SURFACE_TYPE.wall, {
      cell: (info) => info.getValue(),
      header: "벽",
      size: 72,
    }),
  ];
};

export const AddShapeDialog = ({ onOpenChange, open, remodelingType }: Props) => {
  const navigate = useNavigate();
  const {
    buildingFloors: shapeInfo,
    version: { name: versionName },
  } = useBuildingGeometryStore(remodelingType);
  const { setShapeInfo } = useDataSyncActions(remodelingType);

  const [abovegroundFloor, setAbovegroundFloor] = useState<number>(0); // 지상
  const [undergroundFloor, setUndergroundFloor] = useState<number>(0); // 지하

  const [tableData, setTableData] = useState<TTableData[]>([]);

  const [errorMessage, setErrorMessage] = useState("");

  const [localShapeInfo, setLocalShapeInfo] = useState<TFloorGuiSchema[]>([]);

  // shapeInfo의 [지상층 개수, 지하층 개수, 테이블 데이터]
  const [abovegroundFloorCount, undergroundFloorCount, initialTableData] = useMemo(() => {
    let above = 0;
    let below = 0;
    const table: TTableData[] = [];

    shapeInfo.forEach((floor) => {
      if (floor.floor_number > 0) above += 1;
      else if (floor.floor_number < 0) below += 1;

      floor.zones.forEach((zone) => {
        const ceilingCount =
          zone.surfaces?.filter((s) => s.type === BUILDING_SURFACE_TYPE.ceiling).length ?? 1;
        const floorCount =
          zone.surfaces?.filter((s) => s.type === BUILDING_SURFACE_TYPE.floor).length ?? 1;
        const wallCount =
          zone.surfaces?.filter((s) => s.type === BUILDING_SURFACE_TYPE.wall).length ?? 1;

        table.push({
          ceiling: ceilingCount,
          floor: floorCount,
          floorLabel:
            floor.floor_number < 0 ? `B${-floor.floor_number}F` : `${floor.floor_number}F`,
          wall: wallCount,
          zoneId: zone.id,
          zoneLabel: zone.name,
        });
      });
    });

    return [above, below, table] as const;
  }, [shapeInfo]);

  // 모달이 열릴 때 값 초기화
  useEffect(() => {
    if (open) {
      setLocalShapeInfo(shapeInfo);
      setAbovegroundFloor(abovegroundFloorCount);
      setUndergroundFloor(undergroundFloorCount);
      setTableData(initialTableData);
      setErrorMessage("");
    }
  }, [open]);

  // localShapeInfo 변경에 따라 면 테이블 row 추가/제거
  useEffect(() => {
    setTableData((prev) => {
      const prevMap = new Map(prev.map((r) => [r.zoneId, r]));
      return localShapeInfo.flatMap((floor) =>
        floor.zones.map((zone) => {
          const old = prevMap.get(zone.id);
          return {
            ceiling: old?.ceiling ?? 1,
            floor: old?.floor ?? 1,
            floorLabel:
              floor.floor_number < 0 ? `B${-floor.floor_number}F` : `${floor.floor_number}F`,
            wall: old?.wall ?? 1,
            zoneId: zone.id,
            zoneLabel: zone.name,
          };
        }),
      );
    });
  }, [localShapeInfo]);

  /**
   * 삭제되는 면 목록과 연결된 반대편 면들의 인접관계를 해제
   */
  const clearReverseAdjacency = (
    deletingSurfaces: TSurfaceGuiSchema[],
    allFloors: TFloorGuiSchema[],
  ) => {
    const affectedSurfaceIds = new Set<string>();

    // 삭제 대상 층과 연관된 모든 surface ID 수집
    deletingSurfaces.forEach((surface) => {
      // 삭제 대상이 바라보는 surface ID 수집
      if (surface.adjacent_surface_id) {
        affectedSurfaceIds.add(surface.adjacent_surface_id);
      }
      // 삭제 대상을 바라보는 surface ID 수집
      if (surface.adjacent_from) {
        affectedSurfaceIds.add(surface.adjacent_from);
      }
    });

    // 반대편 인접관계 제거
    allFloors.forEach((floor) => {
      floor.zones.forEach((zone) => {
        zone.surfaces.forEach((surface) => {
          if (affectedSurfaceIds.has(surface.id)) {
            surface.adjacent_surface_id = undefined;
            surface.adjacent_from = undefined;
            surface.adjacent_zone_id = undefined;
            surface.boundary_condition = "";
          }
        });
      });
    });
  };

  // 층 변경
  const handleFloorChange = (type: "aboveground" | "underground", value: number) => {
    if (type === "aboveground") {
      // 지상층 변경
      setAbovegroundFloor(value);

      if (value > abovegroundFloor) {
        const nextFloor =
          abovegroundFloorCount > 0
            ? shapeInfo[0].floor_number + value - abovegroundFloorCount
            : value;

        // 증가버튼 클릭
        setLocalShapeInfo([
          {
            floor_id: customNanoid(16),
            floor_name: `${nextFloor}층`,
            floor_number: nextFloor,
            zones: [
              {
                ...initZone,
                id: customNanoid(16),
                name: `존 1`,
                surfaces: [
                  {
                    ...initSurface,
                    id: customNanoid(16),
                    name: `바닥 1`,
                    type: BUILDING_SURFACE_TYPE.floor,
                  },
                  {
                    ...initSurface,
                    id: customNanoid(16),
                    name: `천장 1`,
                    type: BUILDING_SURFACE_TYPE.ceiling,
                  },
                ],
              },
            ],
          },
          ...(localShapeInfo || []),
        ]);
      } else {
        // 감소버튼 클릭
        const deletingFloor = localShapeInfo[0];
        if (deletingFloor) {
          const deletingSurfaces = deletingFloor.zones.flatMap((z) => z.surfaces);
          clearReverseAdjacency(deletingSurfaces, localShapeInfo);
        }
        setLocalShapeInfo(localShapeInfo.slice(1));
      }
    } else {
      // 지하층 변경
      setUndergroundFloor(value);

      if (value > undergroundFloor) {
        const nextFloor =
          undergroundFloorCount > 0
            ? shapeInfo[shapeInfo.length - 1].floor_number - value + undergroundFloorCount
            : -value;

        // 증가버튼 클릭
        setLocalShapeInfo([
          ...(localShapeInfo || []),
          {
            floor_id: customNanoid(16),
            floor_name: `B${-nextFloor}층`,
            floor_number: nextFloor,
            zones: [
              {
                ...initZone,
                id: customNanoid(16),
                name: `존 1`,
                surfaces: [
                  {
                    ...initSurface,
                    id: customNanoid(16),
                    name: `바닥 1`,
                    type: BUILDING_SURFACE_TYPE.floor,
                  },
                  {
                    ...initSurface,
                    id: customNanoid(16),
                    name: `천장 1`,
                    type: BUILDING_SURFACE_TYPE.ceiling,
                  },
                ],
              },
            ],
          },
        ]);
      } else {
        // 감소버튼 클릭
        const deletingFloor = localShapeInfo[localShapeInfo.length - 1];
        if (deletingFloor) {
          const deletingSurfaces = deletingFloor.zones.flatMap((z) => z.surfaces);
          clearReverseAdjacency(deletingSurfaces, localShapeInfo);
        }
        setLocalShapeInfo(localShapeInfo.slice(0, -1));
      }
    }
  };

  // 존 변경
  const handleZoneChange = (id: string, value: number) => {
    const findIndex = localShapeInfo.findIndex((d) => d.floor_id === id);
    if (findIndex === -1) return;

    const newFloor = { ...localShapeInfo[findIndex] };
    const newZones = [...newFloor.zones];

    if (value > newFloor.zones.length) {
      // 증가 버튼
      newZones.push({
        ...initZone,
        id: customNanoid(16),
        name: `존 ${value}`,
        surfaces: [
          {
            ...initSurface,
            id: customNanoid(16),
            name: `바닥 1`,
            type: BUILDING_SURFACE_TYPE.floor,
          },
          {
            ...initSurface,
            id: customNanoid(16),
            name: `천장 1`,
            type: BUILDING_SURFACE_TYPE.ceiling,
          },
        ],
      });
    } else {
      // 감소 버튼
      const deletingZone = newZones[newZones.length - 1];
      if (deletingZone) {
        clearReverseAdjacency(deletingZone.surfaces, localShapeInfo);
      }
      newZones.pop();
    }

    newFloor.zones = newZones;

    setLocalShapeInfo([
      ...localShapeInfo.slice(0, findIndex),
      newFloor,
      ...localShapeInfo.slice(findIndex + 1),
    ]);
  };

  // 면 테이블 입력값 변경
  const handleDataChange = (data: TTableData[]) => {
    setErrorMessage("");
    setTableData(() => {
      const dataMap = new Map(data.map((r) => [r.zoneId, r]));
      return localShapeInfo.flatMap((floor) =>
        floor.zones.map((zone) => {
          const current = dataMap.get(zone.id);
          return {
            ceiling: Math.min(10, Math.max(1, current?.ceiling ?? 1)),
            floor: Math.min(10, Math.max(1, current?.floor ?? 1)),
            floorLabel:
              floor.floor_number < 0 ? `B${-floor.floor_number}F` : `${floor.floor_number}F`,
            wall: Math.min(50, Math.max(1, current?.wall ?? 1)),
            zoneId: zone.id,
            zoneLabel: zone.name,
          };
        }),
      );
    });
  };

  // 적용 클릭 이벤트
  const handleConfirmClick = () => {
    if (!localShapeInfo) return;
    if (errorMessage) return;

    // 입력한 값들 중에 음수가 있으면 에러메시지 표시
    const hasNegativeValue = tableData.some(
      (entry) => entry.floor < 0 || entry.wall < 0 || entry.ceiling < 0,
    );
    if (hasNegativeValue) {
      setErrorMessage("음수는 입력할 수 없습니다.");
      return;
    }

    const updatedShapeInfo = localShapeInfo.map((floor) => {
      // 입력받은 벽/바닥/천장 값을 바탕으로 zones 업데이트 (surfaces 추가)
      const updatedZones = floor.zones.map((zone) => {
        const input = tableData.find((z) => z.zoneId === zone.id);
        if (!input) return zone;

        // 기존 surfaces 의 타입별 배열
        const floorSurfaces =
          zone.surfaces?.filter((s) => s.type === BUILDING_SURFACE_TYPE.floor) ?? [];
        const ceilingSurfaces =
          zone.surfaces?.filter((s) => s.type === BUILDING_SURFACE_TYPE.ceiling) ?? [];
        const wallSurfaces =
          zone.surfaces?.filter((s) => s.type === BUILDING_SURFACE_TYPE.wall) ?? [];

        // 바닥면 삭제 clean-up
        if (input.floor < floorSurfaces.length) {
          const deleted = floorSurfaces.slice(input.floor);
          clearReverseAdjacency(deleted, localShapeInfo);
        }

        // 천장면 삭제 clean-up
        if (input.ceiling < ceilingSurfaces.length) {
          const deleted = ceilingSurfaces.slice(input.ceiling);
          clearReverseAdjacency(deleted, localShapeInfo);
        }

        // 벽면 삭제 clean-up
        if (input.wall < wallSurfaces.length) {
          const deleted = wallSurfaces.slice(input.wall);
          clearReverseAdjacency(deleted, localShapeInfo);
        }

        // surface 타입별로 input 갯수에 맞게 추가/제거
        const nextFloor = [
          ...floorSurfaces.slice(0, Math.max(0, input.floor)),
          ...Array.from({ length: Math.max(0, input.floor - floorSurfaces.length) }).map(
            (_, i) => ({
              ...initSurface,
              id: customNanoid(16),
              name: `바닥 ${floorSurfaces.length + i + 1}`,
              type: BUILDING_SURFACE_TYPE.floor,
            }),
          ),
        ];
        const nextCeiling = [
          ...ceilingSurfaces.slice(0, Math.max(0, input.ceiling)),
          ...Array.from({ length: Math.max(0, input.ceiling - ceilingSurfaces.length) }).map(
            (_, i) => ({
              ...initSurface,
              id: customNanoid(16),
              name: `천장 ${ceilingSurfaces.length + i + 1}`,
              type: BUILDING_SURFACE_TYPE.ceiling,
            }),
          ),
        ];
        const nextWall = [
          ...wallSurfaces.slice(0, Math.max(0, input.wall)),
          ...Array.from({ length: Math.max(0, input.wall - wallSurfaces.length) }).map((_, i) => ({
            ...initSurface,
            id: customNanoid(16),
            name: `벽 ${wallSurfaces.length + i + 1}`,
            type: BUILDING_SURFACE_TYPE.wall,
          })),
        ];

        return {
          ...zone,
          surfaces: [...nextFloor, ...nextCeiling, ...nextWall].sort(
            (a, b) => SURFACE_SORT_ORDER[a.type] - SURFACE_SORT_ORDER[b.type],
          ),
        };
      });

      return {
        ...floor,
        zones: updatedZones,
      };
    });

    setShapeInfo(updatedShapeInfo);
    toast.success("생성 완료");
    navigate(`/remodeling/${remodelingType}/building-overview`);
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent
        aria-describedby={undefined}
        className="flex h-[90dvh] max-h-[720px] max-w-[90vw] flex-col sm:max-w-fit"
      >
        {/* 헤더 영역 */}
        <AlertDialogHeader>
          <AlertDialogTitle>형상 관리-{versionName}</AlertDialogTitle>
        </AlertDialogHeader>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex flex-1 gap-2 overflow-x-auto overflow-y-hidden">
          {/* 층 */}
          <div className="flex flex-1 flex-col gap-3">
            <Label className="px-4 text-[16px]" htmlFor="floor">
              층
            </Label>
            <div className="flex flex-col items-end gap-3 overflow-y-auto px-4">
              <div className="flex w-[162px] items-center justify-end gap-2.5">
                <Label className="text-sm">지상</Label>
                <StepperUIDisplay
                  max={70}
                  min={0}
                  onValueChange={(value) => handleFloorChange("aboveground", value)}
                  value={abovegroundFloor}
                />
              </div>
              <div className="flex items-center justify-end gap-2.5">
                <Label className="text-sm">지하</Label>
                <StepperUIDisplay
                  max={70}
                  min={0}
                  onValueChange={(value) => handleFloorChange("underground", value)}
                  value={undergroundFloor}
                />
              </div>
            </div>
          </div>

          {/* 존 */}
          {localShapeInfo.length > 0 && (
            <>
              <Separator orientation="vertical" />

              <div className="flex flex-1 flex-col gap-3">
                <Label className="px-4 text-[16px]" htmlFor="floor">
                  존
                </Label>
                <div className="flex flex-col items-end gap-3 overflow-y-auto px-4">
                  {localShapeInfo.map((floor) => {
                    return (
                      <div
                        className="flex w-[162px] items-center justify-end gap-2.5"
                        key={floor.floor_id}
                      >
                        <Label className="text-sm">
                          {floor.floor_number < 0
                            ? `B${-floor.floor_number}F`
                            : `${floor.floor_number}F`}
                        </Label>
                        <StepperUIDisplay
                          max={50}
                          min={1}
                          onValueChange={(value) => handleZoneChange(floor.floor_id, value)}
                          value={floor.zones.length}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator orientation="vertical" />

              {/* 면 */}
              <div className="flex flex-1 flex-col gap-3">
                <Label className="px-4 text-[16px]" htmlFor="floor">
                  면
                </Label>
                <ShapeInfoTable
                  // 해당하는 값들이 모두 0인지 확인하는 로직 - 스타일 적용을 위해 사용
                  checkIsAllZero={[
                    BUILDING_SURFACE_TYPE.ceiling,
                    BUILDING_SURFACE_TYPE.floor,
                    BUILDING_SURFACE_TYPE.wall,
                  ]}
                  columns={getColumns()}
                  data={tableData}
                  editableColumns={[
                    BUILDING_HIERARCHY_TYPE.zone,
                    BUILDING_SURFACE_TYPE.ceiling,
                    BUILDING_SURFACE_TYPE.floor,
                    BUILDING_SURFACE_TYPE.wall,
                  ]}
                  onDataChange={handleDataChange}
                />
              </div>
            </>
          )}
        </div>

        {/* 푸터 영역 */}
        <AlertDialogFooter className="flex flex-row items-end justify-between sm:justify-between">
          <div>{errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}</div>
          <div className="flex items-center gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline">취소</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleConfirmClick}>적용</Button>
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
