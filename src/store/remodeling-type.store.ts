import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { ERemodelingType } from "@/enums/ERemodelingType";

type TAction = {
  setRemodelingType: (data: ERemodelingType) => void;
};

type TState = {
  remodelingType: ERemodelingType;
};

const INITIAL_STATE: TState = {
  remodelingType: ERemodelingType.BEFORE,
};

export const useRemodelingTypeStore = create<TAction & TState>()(
  devtools<TAction & TState>((set) => ({
    ...INITIAL_STATE,
    setRemodelingType: (data: ERemodelingType) => set({ remodelingType: data }),
  })),
);
