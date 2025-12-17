import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { TSupplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

type TSupplySystemAction = {
  addSupplySystemStore: (
    key: keyof TSupplySystemGuiSchema,
    newList: TSupplySystemGuiSchema[keyof TSupplySystemGuiSchema],
  ) => void;
  getSupplySystemByPurposeStore: () => {
    coolingSupplySystems: TSupplySystemGuiSchema;
    heatingSupplySystems: TSupplySystemGuiSchema;
  };
  // FIXME 추후 삭제
  setSupplySystemStore: (supplySystem: TSupplySystemGuiSchema) => void;
  supplySystemResetStore: (resetData?: TSupplySystemGuiSchema) => void;
  syncSupplySystemStore: (
    key: keyof TSupplySystemGuiSchema,
    newList: TSupplySystemGuiSchema[keyof TSupplySystemGuiSchema],
  ) => void;
  updateSourceSystemIdsToNull: (sourceSystemIds: string[]) => void;
};

const INITIAL_SUPPLY_SYSTEM_STATE: TSupplySystemGuiSchema = {
  [ESupplySystemType.AIR_HANDLING_UNIT]: [],
  [ESupplySystemType.ELECTRIC_RADIATOR]: [],
  [ESupplySystemType.FAN_COIL_UNIT]: [],
  [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: [],
  [ESupplySystemType.RADIANT_FLOOR]: [],
  [ESupplySystemType.RADIATOR]: [],
};

export const useSupplySystemStore = create<TSupplySystemAction & TSupplySystemGuiSchema>()(
  devtools<TSupplySystemAction & TSupplySystemGuiSchema>((set, get) => ({
    ...INITIAL_SUPPLY_SYSTEM_STATE,
    supplySystemResetStore: (resetData = INITIAL_SUPPLY_SYSTEM_STATE) => set(resetData),
    //
    addSupplySystemStore: (
      key: keyof TSupplySystemGuiSchema,
      newList: TSupplySystemGuiSchema[keyof TSupplySystemGuiSchema],
    ) => set((state) => ({ [key]: [...state[key], ...newList] })),
    getSupplySystemByPurposeStore: (): {
      coolingSupplySystems: TSupplySystemGuiSchema;
      heatingSupplySystems: TSupplySystemGuiSchema;
    } => {
      const state = get();

      const filterByPurpose = (purpose: EPurpose) => ({
        [ESupplySystemType.AIR_HANDLING_UNIT]: state[ESupplySystemType.AIR_HANDLING_UNIT].filter(
          (system) => system.purpose === purpose || system.purpose === EPurpose.COOLING_HEATING,
        ),
        [ESupplySystemType.ELECTRIC_RADIATOR]: state[ESupplySystemType.ELECTRIC_RADIATOR].filter(
          (system) => system.purpose === purpose || system.purpose === EPurpose.COOLING_HEATING,
        ),
        [ESupplySystemType.FAN_COIL_UNIT]: state[ESupplySystemType.FAN_COIL_UNIT].filter(
          (system) => system.purpose === purpose || system.purpose === EPurpose.COOLING_HEATING,
        ),
        [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: state[
          ESupplySystemType.PACKAGED_AIR_CONDITIONER
        ].filter(
          (system) => system.purpose === purpose || system.purpose === EPurpose.COOLING_HEATING,
        ),
        [ESupplySystemType.RADIANT_FLOOR]: state[ESupplySystemType.RADIANT_FLOOR].filter(
          (system) => system.purpose === purpose || system.purpose === EPurpose.COOLING_HEATING,
        ),
        [ESupplySystemType.RADIATOR]: state[ESupplySystemType.RADIATOR].filter(
          (system) => system.purpose === purpose || system.purpose === EPurpose.COOLING_HEATING,
        ),
      });

      return {
        coolingSupplySystems: filterByPurpose(EPurpose.COOLING),
        heatingSupplySystems: filterByPurpose(EPurpose.HEATING),
      };
    },
    syncSupplySystemStore: (
      key: keyof TSupplySystemGuiSchema,
      newList: TSupplySystemGuiSchema[keyof TSupplySystemGuiSchema],
    ) => {
      set((state) => {
        // 1) 기존 리스트
        const oldList = state[key];

        // 2) 삭제될 supply system ID들을 찾기
        const newListIds = new Set(newList.map((item) => item.id));
        const deletedSupplySystemIds = oldList
          .filter((item) => !newListIds.has(item.id))
          .map((item) => item.id);

        // 3) 삭제된 supply system ID들에 해당하는 zone들의 supply_system_cooling_id와 supply_system_heating_id를 undefined로 업데이트
        if (deletedSupplySystemIds.length > 0) {
          useBeforeBuildingGeometryStore
            .getState()
            .updateSupplySystemIdsToUndefined(deletedSupplySystemIds);
          useAfterBuildingGeometryStore
            .getState()
            .updateSupplySystemIdsToUndefined(deletedSupplySystemIds);
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
    setSupplySystemStore: (supplySystem: TSupplySystemGuiSchema) => set(() => supplySystem),
    updateSourceSystemIdsToNull: (sourceSystemIds: string[]) => {
      if (sourceSystemIds.length === 0) return;

      set((state) => {
        const updatedState = { ...state };

        // source_system_id를 가진 supply system 타입들만 업데이트
        Object.keys(updatedState).forEach((key) => {
          const systemType = key as keyof TSupplySystemGuiSchema;
          const systemArray = updatedState[systemType];

          if (Array.isArray(systemArray)) {
            if (systemArray.every((item) => "source_system_id" in item)) {
              // source_system_id가 있는 타입만 처리
              updatedState[systemType] = systemArray.map((item) => {
                if (sourceSystemIds.includes(item.source_system_id!)) {
                  return { ...item, source_system_id: null };
                }
                return item;
              }) as typeof systemArray;
            }
          }
        });

        return updatedState;
      });
    },
  })),
);
