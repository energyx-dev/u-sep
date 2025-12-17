import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TVersionGuiSchema } from "@/domain/building-geometry/schemas/version-name.schema";
import { TFenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { ERemodelingType, REMODELING_TYPE_LABEL } from "@/enums/ERemodelingType";
import { TTemplateReference } from "@/types/template.types";

export type TRenewableSystemState = {
  photovoltaic_systems: TTemplateReference[];
};

type TBuildingFloorsAction = {
  resetBuildingFloorsStore: (resetData?: TBuildingGeometryState) => void;
  setBuildingFloorsStore: (data: TFloorGuiSchema[]) => void;
  updateFenestrationIdsToUndefined: (fenestrationIds: string[]) => void;
  updateLightningIdsToUndefined: (lightningIds: string[]) => void;
  updatePhotovoltaicSystemIdsToUndefined: (photovoltaicSystemIds: string[]) => void;
  updateSupplySystemIdsToUndefined: (supplySystemIds: string[]) => void;
  updateVentilationSystemIdsToUndefined: (ventilationSystemIds: string[]) => void;
};

type TBuildingGeometryState = {
  buildingFloors: TFloorGuiSchema[];
};

type TBuildingVersionAction = {
  resetVersionStore: (resetData?: TBuildingVersionState) => void;
  setVersionStore: (state: TVersionGuiSchema) => void;
};

type TBuildingVersionState = {
  version: TVersionGuiSchema;
};

type TRenewableSystemAction = {
  addPhotovoltaicSystemStore: (list: TTemplateReference[]) => void;
  resetRenewableSystemStore: (resetData?: TRenewableSystemState) => void;
  setRenewableSystemStore: (state: TRenewableSystemState) => void; // FIXME 추후 삭제 - mock 데이터 용
  syncPhotovoltaicSystemStore: (list: TTemplateReference[]) => void;
};

const getInitialBuildingFloors = (): TBuildingGeometryState => ({
  buildingFloors: [],
});

const getInitialVersion = (remodelingType: ERemodelingType): TBuildingVersionState => ({
  version: {
    name: REMODELING_TYPE_LABEL[remodelingType],
  },
});

const getInitialRenewableSystemState = (): TRenewableSystemState => ({
  photovoltaic_systems: [],
});

type TBuildingGeometryStore = TBuildingFloorsAction &
  TBuildingGeometryState &
  TBuildingVersionAction &
  TBuildingVersionState &
  TRenewableSystemAction &
  TRenewableSystemState;

// 버전 정보, 형상 정보, 신재생 (버전별 각각 store)
const createBuildingGeometryStore = (remodelingType: ERemodelingType) =>
  devtools<TBuildingGeometryStore>((set) => ({
    // 버전 정보
    ...getInitialVersion(remodelingType),
    resetVersionStore: (resetData = getInitialVersion(remodelingType)) => set(resetData),
    setVersionStore: (data) => set({ version: data }),

    // 형상 정보
    ...getInitialBuildingFloors(),
    resetBuildingFloorsStore: (resetData = getInitialBuildingFloors()) => set(resetData),
    setBuildingFloorsStore: (data) => set({ buildingFloors: data }),
    updateFenestrationIdsToUndefined: (fenestrationIds: string[]) => {
      if (!fenestrationIds || fenestrationIds.length === 0) return;

      set((state) => {
        const updatedShapeInfo = state.buildingFloors.map((floor) => ({
          ...floor,
          zones: floor.zones.map((zone) => {
            const updatedZone = { ...zone };

            if (Array.isArray(updatedZone.surfaces)) {
              updatedZone.surfaces = updatedZone.surfaces.map((surface: TSurfaceGuiSchema) => {
                const nextSurface = { ...surface };

                // surface.fenestrations: { id, ... }[] 에서 삭제 대상 id 제거
                if (Array.isArray(nextSurface.fenestrations)) {
                  nextSurface.fenestrations = nextSurface.fenestrations.filter(
                    (f: TFenestrationEngineAndGuiSchema) => !fenestrationIds.includes(f?.id),
                  );
                }

                return nextSurface;
              });
            }

            return updatedZone;
          }),
        }));

        return { buildingFloors: updatedShapeInfo };
      });
    },
    updateLightningIdsToUndefined: (lightningIds: string[]) => {
      if (lightningIds.length === 0) return;

      set((state) => {
        const updatedShapeInfo = state.buildingFloors.map((floor) => ({
          ...floor,
          zones: floor.zones.map((zone) => {
            const updatedZone: TZoneGuiSchema = { ...(zone as TZoneGuiSchema) };

            // lightning은 zone에만 존재하며, zone.lightning는 TLightningGuiSchema[] (optional)
            // 삭제된 ID를 가진 lightning 객체들을 제거
            if (updatedZone.lightning && Array.isArray(updatedZone.lightning)) {
              updatedZone.lightning = updatedZone.lightning.filter(
                (item) => !lightningIds.includes(item.id),
              );
            }

            return updatedZone;
          }),
        }));

        return { buildingFloors: updatedShapeInfo };
      });
    },
    updatePhotovoltaicSystemIdsToUndefined: (photovoltaicSystemIds: string[]) => {
      if (!photovoltaicSystemIds || photovoltaicSystemIds.length === 0) return;

      set((state) => {
        // buildingGeometryGuiSchema.photovoltaic_systems: { id, count }[] 기준으로 삭제
        const updatedPhotovoltaics = Array.isArray(state.photovoltaic_systems)
          ? state.photovoltaic_systems.filter((item) => !photovoltaicSystemIds.includes(item.id))
          : state.photovoltaic_systems;

        return {
          photovoltaic_systems: updatedPhotovoltaics,
        };
      });
    },
    updateSupplySystemIdsToUndefined: (supplySystemIds: string[]) => {
      if (supplySystemIds.length === 0) return;

      set((state) => {
        const updatedShapeInfo = state.buildingFloors.map((floor) => ({
          ...floor,
          zones: floor.zones.map((zone) => {
            const updatedZone = { ...zone };

            // supply_system_cooling_id가 삭제된 supply system ID와 일치하면 undefined로 설정
            if (
              zone.supply_system_cooling_id &&
              supplySystemIds.includes(zone.supply_system_cooling_id)
            ) {
              updatedZone.supply_system_cooling_id = undefined;
            }

            // supply_system_heating_id가 삭제된 supply system ID와 일치하면 undefined로 설정
            if (
              zone.supply_system_heating_id &&
              supplySystemIds.includes(zone.supply_system_heating_id)
            ) {
              updatedZone.supply_system_heating_id = undefined;
            }

            return updatedZone;
          }),
        }));

        return { buildingFloors: updatedShapeInfo };
      });
    },
    updateVentilationSystemIdsToUndefined: (ventilationSystemIds: string[]) => {
      if (ventilationSystemIds.length === 0) return;

      set((state) => {
        const updatedShapeInfo = state.buildingFloors.map((floor) => ({
          ...floor,
          zones: floor.zones.map((zone) => {
            const updatedZone = { ...zone };

            // ventilation_system_id가 삭제된 ventilation system ID와 일치하면 undefined로 설정
            if (
              zone.ventilation_system_id &&
              ventilationSystemIds.includes(zone.ventilation_system_id)
            ) {
              updatedZone.ventilation_system_id = undefined;
            }

            return updatedZone;
          }),
        }));

        return { buildingFloors: updatedShapeInfo };
      });
    },
    // 태양광 (현재 사용되지 않음 renewable.store.ts - 신재생에서 사용되는 중)
    ...getInitialRenewableSystemState(),
    addPhotovoltaicSystemStore: (newList: TTemplateReference[]) =>
      set((state) => ({ photovoltaic_systems: [...state.photovoltaic_systems, ...newList] })),
    resetRenewableSystemStore: (resetData = getInitialRenewableSystemState()) => set(resetData),
    setRenewableSystemStore: (state) => set(() => state),
    syncPhotovoltaicSystemStore: (newList) => {
      set((state) => {
        const oldList = state.photovoltaic_systems;
        const merged = newList.map((item) => {
          const prev = oldList.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });
        return { photovoltaic_systems: merged };
      });
    },
  }));

export const useBeforeBuildingGeometryStore = create<TBuildingGeometryStore>()(
  createBuildingGeometryStore(ERemodelingType.BEFORE),
);

export const useAfterBuildingGeometryStore = create<TBuildingGeometryStore>()(
  createBuildingGeometryStore(ERemodelingType.AFTER),
);
