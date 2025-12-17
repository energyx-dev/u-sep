import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TBuildingGUISchema } from "@/domain/basic-info/schemas/building.schema";

export type TBuildingState = {
  buildingInfo: TBuildingGUISchema;
  isFileLoaded: boolean;
};

type TBuildingAction = {
  buildingResetStore: (resetData?: TBuildingState) => void;
  setBuildingInfoStore: (data: TBuildingState["buildingInfo"]) => void;
  setIsFileLoaded: (flag: boolean) => void;
};

export const getInitialBuildingState = (): TBuildingState => ({
  buildingInfo: {
    addressDistrict: "",
    addressRegion: "",
    detailAddress: "",
    name: "",
    north_axis: undefined,
    vintage: "",
  },
  isFileLoaded: false,
});

type TBuildingStore = TBuildingAction & TBuildingState;

export const useBuildingInfoStore = create<TBuildingStore>()(
  devtools<TBuildingStore>((set) => ({
    // 건물 정보
    ...getInitialBuildingState(),
    buildingResetStore: (resetData = getInitialBuildingState()) => set(resetData),
    setBuildingInfoStore: (data) => set({ buildingInfo: data }),
    setIsFileLoaded: (flag) => set({ isFileLoaded: flag }),
  })),
);
