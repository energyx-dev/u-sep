import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useShallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdjacentFloorTreePanel } from "@/domain/shape-info/components/surface/AdjacentFloorTreePanel";
import { useSurfaceEditor } from "@/domain/shape-info/hooks/useSurfaceEditor";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useRemodelingTypeStore } from "@/store/remodeling-type.store";

export type TAdjacentShape = {
  surfaceId: string;
  type: BUILDING_SURFACE_TYPE;
  zoneId: string;
};

interface IProps {
  /**
   * 현재 선택된 층, 존, 면 정보를 전달받는 props
   * currentFloorId: 현재 선택된 층 ID (optional)
   * currentSurfaceId: 현재 선택된 면 ID (optional)
   * currentZoneId: 현재 선택된 존 ID (optional)
   * isOpen: 모달 열림 상태
   * isSurfaceWallType: 선택된 면이 벽면 타입인지 여부 (optional)
   * onClose: 모달 닫기 콜백 함수
   * remodelingType: 리모델링 타입 (enum)
   */
  currentFloorId?: string;
  currentSurfaceId?: string;
  currentZoneId?: string;
  form: UseFormReturn<TSurfaceGuiSchema>;
  isOpen: boolean;
  onClose: () => void;
}

export const NewAddAdjacentZoneDialog = ({
  currentSurfaceId,
  currentZoneId,
  form,
  isOpen,
  onClose,
}: IProps) => {
  /**
   * 로컬 상태 관리
   * dialogSelection: 모달 내에서 선택한 층(floorId), 존(zoneId), 면(surfaceId) 정보를 저장
   * isConfirmed: 첫번째 확인 버튼 클릭 여부 (추가하기 -> 설정 단계 분리)
   */

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedShapeItem, setSelectedShapeItem] = useState<TAdjacentShape>();

  const { getSurfaceById } = useSurfaceEditor();

  const surfaceData = getSurfaceById({ surfaceId: currentSurfaceId!, zoneId: currentZoneId });

  /**
   * 파생 상태값 계산
   * isSurfaceRequired: 벽면 타입이면서 '존에 직접 연결'이 아닌 경우 면 선택이 필수인지 여부
   * isOnClickDisabled: 설정 버튼 활성화 조건 (층, 존, 면이 모두 선택되어야 활성화)
   * isConfirmDisabled: 첫번째 확인 버튼 활성화 조건 (isOnClickDisabled와 동일)
   */

  const isOnClickDisabled = !selectedShapeItem?.surfaceId;

  const isConfirmDisabled = !selectedShapeItem?.surfaceId;

  const remodelingType = useRemodelingTypeStore(useShallow((state) => state.remodelingType));
  const { setShapeInfo } = useDataSyncActions(remodelingType);
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore(remodelingType);

  /**
   * getUpdatedShapeInfo
   * - 현재 선택한 면(currentSurfaceId)에 대해 모달에서 선택한 인접 존 및 면 정보를 업데이트
   * - 기존 shapeInfo 배열을 복사하여 floor, zone, surface 단위로 순회하며 수정 적용
   * - 주로 adjacent_surface_id, adjacent_zone_id 필드를 dialogSelection 값으로 갱신
   */
  const getUpdatedShapeInfo = () => {
    if (!shapeInfo) return [];

    return shapeInfo.map((floor) => {
      return {
        ...floor,
        zones: floor.zones.map((zone) => {
          const updatedSurfaces = zone.surfaces.map((surface) => {
            if (surface.id === currentSurfaceId) {
              form.setValue("adjacent_surface_id", selectedShapeItem?.surfaceId, {
                shouldValidate: true,
              });
              form.setValue("adjacent_zone_id", selectedShapeItem?.zoneId, {
                shouldValidate: true,
              });

              return {
                ...surface,
                adjacent_surface_id: selectedShapeItem?.surfaceId,
                adjacent_zone_id: selectedShapeItem?.zoneId,
              };
            }
            return surface;
          });

          return {
            ...zone,
            surfaces: updatedSurfaces,
          };
        }),
      };
    });
  };

  /**
   * getReplaceShapeInfo
   * - 1) replacementSurface 찾기: updatedShapeInfo에서 currentSurfaceId에 해당하는 면을 탐색
   * - 2) 이전에 존에 직접 연결했던 면 제거 및 중복 인접존 필터링:
   *    - adjacent_from가 replacementSurface.id이면서 isGenerated가 true인 면 제거
   *    - 현재 선택된 존과 중복되는 adjacent_zone_id는 빈 문자열로 초기화
   *    - currentSurfaceId와 연결된 adjacent_from은 빈 문자열로 초기화
   * - 3) 분기 처리: 존 직접 연결(isChecked가 true거나 replacementSurface가 벽면이 아닌 경우)과 면 선택에 따른 존 업데이트 분기
   *    - 직접 연결 시: 새로운 면(surface) 생성하여 존에 추가, 기존 adjacent_from이 currentSurfaceId인 면은 초기화
   *    - 면 선택 시: 기존 면 중 선택된 면(surfaceId)만 replacementSurface 정보로 대체, adjacent_from 초기화 처리
   * - 4) 새로 생성된 면 ID(createdSurfaceId) 저장
   * - 5) createdSurfaceId가 존재하면 두 번째 순회로 currentSurfaceId 면에 adjacent_surface_id를 새로 생성된 면 ID로 동기화
   */
  // Helper 1: 교체할 면 찾는 함수
  const findReplacementSurface = (
    updatedShapeInfo: TFloorGuiSchema[],
    currentSurfaceId: string | undefined,
  ) => {
    if (!currentSurfaceId) return null;
    return (
      updatedShapeInfo
        .flatMap((floor) => floor.zones)
        .flatMap((zone) => zone.surfaces)
        .find((surface) => surface.id === currentSurfaceId) || null
    );
  };

  // 작은 조건자 헬퍼 함수들
  const isDuplicateAdjacentZone = (
    s: TSurfaceGuiSchema,
    targetZoneId: string,
    currentSurfaceId?: string,
  ) => s.adjacent_zone_id === targetZoneId && s.id !== currentSurfaceId;
  const isLinkedFromCurrent = (s: TSurfaceGuiSchema, currentSurfaceId?: string) =>
    s.adjacent_from === currentSurfaceId;

  // Helper 2: 이전 직접 연결된 면 및 중복 인접존 초기화 함수
  const clearPreviousDirectLinks = (
    updatedShapeInfo: TFloorGuiSchema[],
    currentSurfaceId: string | undefined,
    targetZoneId: string,
  ) => {
    return updatedShapeInfo.map((floor) => {
      return {
        ...floor,
        zones: floor.zones.map((zone) => {
          return {
            ...zone,
            surfaces: zone.surfaces
              // 존에 직접 연결했던 면 제거
              .filter((s) => !(s.adjacent_from === currentSurfaceId && s.isGenerated === true))
              .map((s) => {
                return {
                  ...s,
                  adjacent_from: isLinkedFromCurrent(s, currentSurfaceId) ? "" : s.adjacent_from,
                  // 이전 로직은 같은 존(targetZoneId)에 연결된 모든 면의 adjacent_zone_id를 비워버렸음
                  // 이제는 '현재 면에서 파생된 면'(adjacent_from === currentSurfaceId)인 경우에만 초기화하도록 한정
                  adjacent_zone_id:
                    isLinkedFromCurrent(s, currentSurfaceId) &&
                    isDuplicateAdjacentZone(s, targetZoneId, currentSurfaceId)
                      ? ""
                      : s.adjacent_zone_id,
                };
              }),
          };
        }),
      };
    });
  };

  // Helper: 존 연결을 위한 층 정보 업데이트 함수
  const updateFloorForConnection = (
    floor: TFloorGuiSchema,
    replacementSurface: TSurfaceGuiSchema,
    currentSurfaceId: string | undefined,
    basisZoneId: string,
  ): { createdSurfaceId: null | string; floor: TFloorGuiSchema } => {
    const containsTargetZone = floor.zones.some((z) => z.id === selectedShapeItem?.zoneId);
    if (!containsTargetZone) return { createdSurfaceId: null, floor };

    // 2. 면 선택 시 기준면에 인접면 정보로 대체 (id와 type은 업데이트 하지 않음)
    const updateZonesForSurfaceSelection = (zones: TZoneGuiSchema[]) => {
      const nextZones = zones.map((zone) => {
        if (zone.id !== selectedShapeItem?.zoneId) return zone;
        const clearedSurfaces = zone.surfaces.map((s) =>
          isLinkedFromCurrent(s, currentSurfaceId) ? { ...s, adjacent_from: "" } : s,
        );
        const updatedSurfaces = clearedSurfaces.map((surface) => {
          if (surface.id === selectedShapeItem?.surfaceId) {
            return {
              ...replacementSurface,
              // 이 면은 현재 기준면에서 파생/연결되었음을 표시
              adjacent_from: currentSurfaceId,
              adjacent_surface_id: "",
              adjacent_zone_id: basisZoneId,
              id: surface.id,
              isGenerated: surface.isGenerated,
              name: surface.name,
              type: surface.type,
            };
          }
          return surface;
        });
        return { ...zone, surfaces: updatedSurfaces };
      });
      return { zones: nextZones };
    };

    const { zones } = updateZonesForSurfaceSelection(floor.zones);
    return { createdSurfaceId: null, floor: { ...floor, zones } };
  };

  const getReplaceShapeInfo = (updatedShapeInfo: TFloorGuiSchema[]) => {
    // 1. 헬퍼를 사용하여 기준면 찾기
    const replacementSurface = findReplacementSurface(updatedShapeInfo, currentSurfaceId);

    if (!replacementSurface) {
      console.error("replacementSurface를 찾을 수 없습니다.");
      return updatedShapeInfo;
    }

    // 2-a. 기존에 기준면을 인접면으로 사용 중인 상대면(B 등)의 데이터를 먼저 초기화
    const unlinkedTargets = updatedShapeInfo.map((floor) => ({
      ...floor,
      zones: floor.zones.map((zone) => ({
        ...zone,
        surfaces: zone.surfaces.map((s) => {
          if (s.adjacent_from === replacementSurface.id) {
            return {
              ...s,
              // 기존 연결 해제 (상대면 복귀)
              adjacent_surface_id: "",
              adjacent_zone_id: "",
              boundary_condition: "",
            };
          }
          return s;
        }),
      })),
    }));

    // 2-b. 기존에 현재 면에서 파생된 직접 연결 면 초기화 및 중복 인접존 정리
    const clearedShapeInfo = clearPreviousDirectLinks(
      unlinkedTargets,
      currentSurfaceId,
      selectedShapeItem?.zoneId ?? "",
    );

    // basisZoneId 계산: currentSurfaceId를 포함하는 존의 id
    const basisZoneId =
      clearedShapeInfo
        .flatMap((f) => f.zones)
        .find((z) => z.surfaces.some((s) => s.id === currentSurfaceId))?.id || "";

    // 3. 각 층에 대해 updateFloorForConnection 사용, 생성된 면 ID 수집
    const res = clearedShapeInfo.map((floor) =>
      updateFloorForConnection(floor, replacementSurface, currentSurfaceId, basisZoneId),
    );
    const next = res.map((r) => r.floor);
    const createdSurfaceId = res.find((r) => r.createdSurfaceId)?.createdSurfaceId ?? null;

    // 직접 연결로 새로운 면이 생성된 경우, 현재 면이 해당 면을 가리키도록 업데이트
    if (createdSurfaceId) {
      // 두 번째 순회로 id가 currentSurfaceId인 면을 업데이트
      return next.map((floor) => ({
        ...floor,
        zones: floor.zones.map((zone) => ({
          ...zone,
          surfaces: zone.surfaces.map((surface) => {
            if (surface.id === currentSurfaceId) {
              return {
                ...surface,
                adjacent_surface_id: createdSurfaceId,
                adjacent_zone_id: selectedShapeItem?.zoneId,
              };
            }
            return surface;
          }),
        })),
      }));
    }
    return next;
  };

  /**
   * handleClick
   * - 첫번째 클릭 시 isConfirmed를 true로 설정하여 경고 메시지 및 두번째 확인 버튼 노출
   * - 두번째 클릭 시 실제 데이터 업데이트 수행:
   *    - getUpdatedShapeInfo 호출하여 기본 인접존 정보 갱신
   *    - getReplaceShapeInfo 호출하여 존 및 면 연결 상태 정리 및 신규 면 생성 반영
   *    - setShapeInfo 호출로 전역 상태 업데이트
   *    - 모달 닫기(onClose 호출)
   */
  const handleClick = () => {
    if (isOnClickDisabled) return;
    // 모달에서 선택 된 인접존을 현재 선택한 면에 적용하는 함수
    const updatedShapeInfo = getUpdatedShapeInfo();
    // 모달에서 선택한 인접존/면을 현재 선택한 면에 데이터 반영하는 함수
    const replaceShapeInfo = getReplaceShapeInfo(updatedShapeInfo);
    setShapeInfo(replaceShapeInfo);
    onClose();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="flex w-[420px] max-w-[90vw] flex-col overflow-auto" isClose={false}>
        {/* 헤더 */}
        <DialogHeader className="sticky top-0 z-10 bg-white pb-0">
          <DialogTitle className="text-xl font-semibold">인접 관계 선택</DialogTitle>
        </DialogHeader>
        {/* 내용 */}
        {isConfirmed ? (
          <span className="text-bk7 text-sm">인접 관계 정보가 변경됩니다.</span>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <AdjacentFloorTreePanel
              currentSurfaceId={currentSurfaceId!}
              handleChangeSelectedShapeItem={setSelectedShapeItem}
              remodelingType={remodelingType}
              selectedShapeItem={selectedShapeItem}
              shapeInfo={shapeInfo}
              surfaceData={surfaceData!}
            />
          </div>
        )}
        {/* 푸터 */}
        <DialogFooter className="sticky bottom-0 flex flex-col gap-2 bg-white pt-0">
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button onClick={onClose} type="button" variant="outline">
                취소
              </Button>
            </DialogClose>
            <Button
              disabled={isConfirmed ? isOnClickDisabled : isConfirmDisabled}
              onClick={isConfirmed ? handleClick : () => setIsConfirmed(true)}
              type="button"
            >
              {isConfirmed ? "설정" : "적용"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
