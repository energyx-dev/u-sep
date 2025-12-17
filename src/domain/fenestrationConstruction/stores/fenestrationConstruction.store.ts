import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TFenestrationConstructionEngineAndGuiSchema } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";

export type TFenestrationConstructionAction = {
  addFenestrationConstructionStore: (list: TFenestrationConstructionEngineAndGuiSchema[]) => void;
  resetFenestrationConstructionStore: (resetData?: TFenestrationConstructionState) => void;
  setFenestrationConstructionStore: (state: TFenestrationConstructionState) => void;
  syncFenestrationConstructionStore: (list: TFenestrationConstructionEngineAndGuiSchema[]) => void;
};
export type TFenestrationConstructionState = {
  fenestration_constructions: TFenestrationConstructionEngineAndGuiSchema[];
};

const INITIAL_STATE: TFenestrationConstructionState = { fenestration_constructions: [] };

export const useFenestrationConstructionStore = create<
  TFenestrationConstructionAction & TFenestrationConstructionState
>()(
  devtools<TFenestrationConstructionAction & TFenestrationConstructionState>((set) => ({
    ...INITIAL_STATE,
    addFenestrationConstructionStore: (newList) =>
      set((state) => ({
        fenestration_constructions: [...state.fenestration_constructions, ...newList],
      })),
    resetFenestrationConstructionStore: (resetData = INITIAL_STATE) => set(resetData),
    setFenestrationConstructionStore: (state) => set(() => state),
    syncFenestrationConstructionStore: (newList) =>
      set((state) => {
        const oldList = state.fenestration_constructions;
        const merged = newList.map((item) => {
          const prev = oldList.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });
        return { fenestration_constructions: merged };
      }),
  })),
);
