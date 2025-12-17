import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TMaterialEngineAndGuiSchema } from "@/domain/material/schemas/material.schema";

export type TMaterialAction = {
  addMaterialStore: (systemList: TMaterialEngineAndGuiSchema[]) => void;
  resetMaterialStore: (resetData?: TMaterialState) => void;
  setMaterialStore: (state: TMaterialState) => void;
  syncMaterialStore: (systemList: TMaterialEngineAndGuiSchema[]) => void;
};

export type TMaterialState = { materials: TMaterialEngineAndGuiSchema[] };

const INITIAL_MATERIAL_STATE: TMaterialState = { materials: [] };

export const useMaterialStore = create<TMaterialAction & TMaterialState>()(
  devtools<TMaterialAction & TMaterialState>((set) => ({
    ...INITIAL_MATERIAL_STATE,
    addMaterialStore: (newList: TMaterialEngineAndGuiSchema[]) =>
      set((state) => ({ materials: [...state.materials, ...newList] })),
    resetMaterialStore: (resetData = INITIAL_MATERIAL_STATE) => set(resetData),
    setMaterialStore: (state: TMaterialState) => set(() => state),
    syncMaterialStore: (newList: TMaterialEngineAndGuiSchema[]) => {
      set((state) => {
        const oldList = state.materials;
        const merged = newList.map((item) => {
          const prev = oldList.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });
        return { materials: merged };
      });
    },
  })),
);
