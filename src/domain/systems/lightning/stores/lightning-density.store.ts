import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TLightningDensityGuiSchema } from "@/domain/systems/lightning/schemas/lightning-density.schema";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

export type TLightningDensityAction = {
  addLightningDensityStore: (systemList: TLightningDensityGuiSchema[]) => void;
  resetLightningDensityStore: (systemList?: TLightningDensityState) => void;
  setLightningDensityStore: (systemList: TLightningDensityState) => void;
  syncLightningDensityStore: (systemList: TLightningDensityGuiSchema[]) => void;
};

export type TLightningDensityState = { density: TLightningDensityGuiSchema[] };

const INITIAL_LIGHTNING_DENSITY_STATE: TLightningDensityState = { density: [] };

export const useLightningDensityStore = create<TLightningDensityAction & TLightningDensityState>()(
  devtools<TLightningDensityAction & TLightningDensityState>((set) => ({
    ...INITIAL_LIGHTNING_DENSITY_STATE,
    addLightningDensityStore: (newList: TLightningDensityGuiSchema[]) =>
      set((state) => ({ density: [...state.density, ...newList] })),
    resetLightningDensityStore: (resetData = INITIAL_LIGHTNING_DENSITY_STATE) => set(resetData),
    setLightningDensityStore: (state: TLightningDensityState) => set(() => state),
    syncLightningDensityStore: (newList: TLightningDensityGuiSchema[]) => {
      set((state) => {
        const oldList = state.density;

        // 삭제될 lightning ID들을 찾기
        const newListIds = new Set(newList.map((item) => item.id));
        const deletedLightningIds = oldList
          .filter((item) => !newListIds.has(item.id))
          .map((item) => item.id);

        // 삭제된 lightning ID들에 해당하는 geometry의 lightning 참조 제거
        // lightning은 zone에만 존재하므로 zone 레벨의 배열에서 삭제된 ID를 제거하도록 설정
        if (deletedLightningIds.length > 0) {
          useBeforeBuildingGeometryStore
            .getState()
            .updateLightningIdsToUndefined(deletedLightningIds);
          useAfterBuildingGeometryStore
            .getState()
            .updateLightningIdsToUndefined(deletedLightningIds);
        }

        // 기존 항목에 대해 변경 사항 병합
        const merged = newList.map((item) => {
          const prev = oldList.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });
        return { density: merged };
      });
    },
  })),
);
