import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { TSourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { useSupplySystemStore } from "@/domain/systems/supply/stores/supplySystem.store";

type TSourceSystemAction = {
  addSourceSystemStore: (
    key: keyof TSourceSystemGuiSchema,
    newList: TSourceSystemGuiSchema[keyof TSourceSystemGuiSchema],
  ) => void;
  resetSourceSystemStore: (resetData?: TSourceSystemGuiSchema) => void;
  // FIXME 추후 삭제
  setSourceSystemStore: (sourceSystem: TSourceSystemGuiSchema) => void;
  syncSourceSystemStore: (
    key: keyof TSourceSystemGuiSchema,
    newList: TSourceSystemGuiSchema[keyof TSourceSystemGuiSchema],
  ) => void;
};

const INITIAL_SOURCE_SYSTEM_STATE: TSourceSystemGuiSchema = {
  [ESourceSystemType.ABSORPTION_CHILLER]: [],
  [ESourceSystemType.BOILER]: [],
  [ESourceSystemType.CHILLER]: [],
  [ESourceSystemType.DISTRICT_HEATING]: [],
  [ESourceSystemType.GEOTHERMAL_HEATPUMP]: [],
  [ESourceSystemType.HEATPUMP]: [],
};

export const useSourceSystemStore = create<TSourceSystemAction & TSourceSystemGuiSchema>()(
  devtools<TSourceSystemAction & TSourceSystemGuiSchema>((set) => ({
    ...INITIAL_SOURCE_SYSTEM_STATE,
    resetSourceSystemStore: (resetData = INITIAL_SOURCE_SYSTEM_STATE) => set(resetData),
    //
    addSourceSystemStore: (
      key: keyof TSourceSystemGuiSchema,
      newList: TSourceSystemGuiSchema[keyof TSourceSystemGuiSchema],
    ) => set((state) => ({ [key]: [...state[key], ...newList] })),
    syncSourceSystemStore: (
      key: keyof TSourceSystemGuiSchema,
      newList: TSourceSystemGuiSchema[keyof TSourceSystemGuiSchema],
    ) => {
      set((state) => {
        // 1) 기존 리스트
        const oldList = state[key];

        // 2) 삭제될 source system ID들을 찾기
        const newListIds = new Set(newList.map((item) => item.id));
        const deletedSourceSystemIds = oldList
          .filter((item) => !newListIds.has(item.id))
          .map((item) => item.id);

        // 3) 삭제된 source system ID들에 해당하는 supply system들의 source_system_id를 null로 업데이트
        if (deletedSourceSystemIds.length > 0) {
          useSupplySystemStore.getState().updateSourceSystemIdsToNull(deletedSourceSystemIds);
        }

        // 4) newList 기반으로 add & update
        const merged = newList.map((item) => {
          const prev = oldList.find((i) => i.id === item.id);
          return prev ? { ...prev, ...item } : item;
        });

        // 5) sync: newList에 없는 oldList 항목은 제외(삭제)
        return { [key]: merged };
      });
    },
    // FIXME 추후 삭제
    setSourceSystemStore: (sourceSystem: TSourceSystemGuiSchema) => set(() => sourceSystem),
  })),
);
