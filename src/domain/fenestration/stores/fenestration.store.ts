import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TFenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

export type TFenestrationAction = {
  addFenestrationStore: (list: TFenestrationEngineAndGuiSchema[]) => void;
  resetFenestrationStore: (resetData?: TFenestrationState) => void;
  setFenestrationStore: (state: TFenestrationState) => void;
  syncFenestrationStore: (list: TFenestrationEngineAndGuiSchema[]) => void;
};
export type TFenestrationState = { fenestrations: TFenestrationEngineAndGuiSchema[] };

const INITIAL_STATE: TFenestrationState = { fenestrations: [] };

export const useFenestrationStore = create<TFenestrationAction & TFenestrationState>()(
  devtools<TFenestrationAction & TFenestrationState>((set) => ({
    ...INITIAL_STATE,
    addFenestrationStore: (newList) =>
      set((state) => ({ fenestrations: [...state.fenestrations, ...newList] })),
    resetFenestrationStore: (resetData = INITIAL_STATE) => set(resetData),
    setFenestrationStore: (state) => set(() => state),
    syncFenestrationStore: (newList) =>
      set((state) => {
        const oldList = state.fenestrations;
        const newIds = new Set(newList.map((i) => i.id));
        const deletedIds = oldList.filter((i) => !newIds.has(i.id)).map((i) => i.id);

        // surface 레벨 참조 제거 (before/after geometry 모두)
        if (deletedIds.length > 0) {
          useBeforeBuildingGeometryStore.getState().updateFenestrationIdsToUndefined(deletedIds);
          useAfterBuildingGeometryStore.getState().updateFenestrationIdsToUndefined(deletedIds);
        }

        // 최신 기준 병합
        const kept = oldList.filter((i) => !deletedIds.includes(i.id));
        const merged = newList.map((item) => {
          const prev = kept.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });

        return { fenestrations: merged };
      }),
  })),
);
