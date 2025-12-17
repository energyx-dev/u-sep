import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { TResultSchemaV2 } from "@/schemas/result.schema";

type TResultAction = {
  setResult: (result: TResultSchemaV2 | undefined) => void;
};

type TResultState = {
  result: TResultSchemaV2 | undefined;
};

export const useResultStore = create<TResultAction & TResultState>()(
  devtools((set) => ({
    result: undefined,
    setResult: (result: TResultSchemaV2 | undefined) => set({ result: result }),
  })),
);
