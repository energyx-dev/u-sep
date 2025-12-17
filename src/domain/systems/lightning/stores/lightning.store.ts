import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TLightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

export type TLightningAction = {
  addLightningStore: (systemList: TLightningGuiSchema[]) => void;
  resetLightningStore: (systemList?: TLightningState) => void;
  setLightningStore: (systemList: TLightningState) => void;
  syncLightningStore: (systemList: TLightningGuiSchema[]) => void;
};

export type TLightningState = { lightning: TLightningGuiSchema[] };

const INITIAL_LIGHTNING_STATE: TLightningState = { lightning: [] };

export const useLightningStore = create<TLightningAction & TLightningState>()(
  devtools<TLightningAction & TLightningState>((set) => ({
    ...INITIAL_LIGHTNING_STATE,
    addLightningStore: (newList: TLightningGuiSchema[]) =>
      set((state) => ({ lightning: [...state.lightning, ...newList] })),
    resetLightningStore: (resetData = INITIAL_LIGHTNING_STATE) => set(resetData),
    setLightningStore: (state: TLightningState) => set(() => state),
    syncLightningStore: (newList: TLightningGuiSchema[]) => {
      set((state) => {
        const oldList = state.lightning;

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
        return { lightning: merged };
      });
    },
  })),
);
