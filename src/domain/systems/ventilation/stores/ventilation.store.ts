import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TVentilationEngineAndGuiSchema } from "@/domain/systems/ventilation/schemas/ventilation-system.schema";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

export type TVentilationSystemAction = {
  addVentilationSystemStore: (systemList: TVentilationEngineAndGuiSchema[]) => void;
  resetVentilationSystemStore: (resetData?: TVentilationSystemState) => void;
  // FIXME 추후 삭제
  setVentilationSystemStore: (state: TVentilationSystemState) => void;
  syncVentilationSystemStore: (systemList: TVentilationEngineAndGuiSchema[]) => void;
};

export type TVentilationSystemState = { ventilation_systems: TVentilationEngineAndGuiSchema[] };

const INITIAL_SOURCE_SYSTEM_STATE: TVentilationSystemState = { ventilation_systems: [] };

export const useVentilationSystemStore = create<
  TVentilationSystemAction & TVentilationSystemState
>()(
  devtools<TVentilationSystemAction & TVentilationSystemState>((set) => ({
    ...INITIAL_SOURCE_SYSTEM_STATE,
    resetVentilationSystemStore: (resetData = INITIAL_SOURCE_SYSTEM_STATE) => set(resetData),
    //
    addVentilationSystemStore: (newList: TVentilationEngineAndGuiSchema[]) =>
      set((state) => ({ ventilation_systems: [...state.ventilation_systems, ...newList] })),
    syncVentilationSystemStore: (newList: TVentilationEngineAndGuiSchema[]) => {
      set((state) => {
        const oldList = state.ventilation_systems;

        // 삭제될 ventilation system ID들을 찾기
        const newListIds = new Set(newList.map((item) => item.id));
        const deletedVentilationSystemIds = oldList
          .filter((item) => !newListIds.has(item.id))
          .map((item) => item.id);

        // 삭제된 ventilation system ID들에 해당하는 zone들의 ventilation_system_id를 undefined로 업데이트
        if (deletedVentilationSystemIds.length > 0) {
          useBeforeBuildingGeometryStore
            .getState()
            .updateVentilationSystemIdsToUndefined(deletedVentilationSystemIds);
          useAfterBuildingGeometryStore
            .getState()
            .updateVentilationSystemIdsToUndefined(deletedVentilationSystemIds);
        }

        const merged = newList.map((item) => {
          const prev = oldList.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });
        return { ventilation_systems: merged };
      });
    },
    // FIXME 추후 삭제
    setVentilationSystemStore: (state: TVentilationSystemState) => set(() => state),
  })),
);
