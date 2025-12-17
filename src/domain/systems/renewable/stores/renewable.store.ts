import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TPhotovoltaicSystemEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

type TRenewableSystemAction = {
  addPhotovoltaicSystemStore: (systemList: TPhotovoltaicSystemEngineAndGuiSchema[]) => void;
  resetRenewableSystemStore: (resetData?: TRenewableSystemState) => void;
  syncPhotovoltaicSystemStore: (systemList: TPhotovoltaicSystemEngineAndGuiSchema[]) => void;
};

type TRenewableSystemState = {
  photovoltaic_systems: TPhotovoltaicSystemEngineAndGuiSchema[];
};

const getInitialRenewableSystemState = (): TRenewableSystemState => ({
  photovoltaic_systems: [],
});

type TRenewableStore = TRenewableSystemAction & TRenewableSystemState;

// 신재생 설비 (현재는 태양광 설비만 있음)
const createRenewableStore = () =>
  devtools<TRenewableStore>((set) => ({
    ...getInitialRenewableSystemState(),
    addPhotovoltaicSystemStore: (newList: TPhotovoltaicSystemEngineAndGuiSchema[]) =>
      set((state) => ({ photovoltaic_systems: [...state.photovoltaic_systems, ...newList] })),
    resetRenewableSystemStore: (resetData = getInitialRenewableSystemState()) => set(resetData),
    syncPhotovoltaicSystemStore: (newList) => {
      set((state) => {
        const oldList = state.photovoltaic_systems;
        const newIds = new Set(newList.map((i) => i.id));
        const deletedIds = oldList.filter((i) => !newIds.has(i.id)).map((i) => i.id);

        if (deletedIds.length > 0) {
          useBeforeBuildingGeometryStore
            .getState()
            .updatePhotovoltaicSystemIdsToUndefined(deletedIds);
          useAfterBuildingGeometryStore
            .getState()
            .updatePhotovoltaicSystemIdsToUndefined(deletedIds);
        }

        // 삭제된 항목 제거
        const updatedPhotovoltaics = oldList.filter((item) => !deletedIds.includes(item.id));

        // 최신 데이터 병합
        const merged = newList.map((item) => {
          const prev = updatedPhotovoltaics.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });
        return { photovoltaic_systems: merged };
      });
    },
  }));

export const useRenewableStore = create<TRenewableStore>()(createRenewableStore());
