import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TSurfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";

export type TSurfaceConstructionAction = {
  addSurfaceConstructionStore: (systemList: TSurfaceConstructionEngineAndGuiSchema[]) => void;
  resetSurfaceConstructionStore: (resetData?: TSurfaceConstructionState) => void;
  setSurfaceConstructionStore: (state: TSurfaceConstructionState) => void;
  syncSurfaceConstructionStore: (systemList: TSurfaceConstructionEngineAndGuiSchema[]) => void;
};
export type TSurfaceConstructionState = {
  surface_constructions: TSurfaceConstructionEngineAndGuiSchema[];
};

const INITIAL_SURFACE_CONSTRUCTION_STATE: TSurfaceConstructionState = { surface_constructions: [] };

export const useSurfaceConstructionStore = create<
  TSurfaceConstructionAction & TSurfaceConstructionState
>()(
  devtools<TSurfaceConstructionAction & TSurfaceConstructionState>((set) => ({
    ...INITIAL_SURFACE_CONSTRUCTION_STATE,
    addSurfaceConstructionStore: (newList: TSurfaceConstructionEngineAndGuiSchema[]) =>
      set((state) => ({
        surface_constructions: [...state.surface_constructions, ...newList],
      })),
    resetSurfaceConstructionStore: (resetData = INITIAL_SURFACE_CONSTRUCTION_STATE) =>
      set(resetData),
    setSurfaceConstructionStore: (state: TSurfaceConstructionState) => set(() => state),
    syncSurfaceConstructionStore: (newList: TSurfaceConstructionEngineAndGuiSchema[]) => {
      set((state) => {
        const oldList = state.surface_constructions;
        const merged = newList.map((item) => {
          const prev = oldList.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });
        return { surface_constructions: merged };
      });
    },
  })),
);
