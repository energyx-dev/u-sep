import { createContext, useContext } from "react";

import { ERemodelingType } from "@/enums/ERemodelingType";

export const RemodelingTypeContext = createContext<ERemodelingType>(ERemodelingType.BEFORE);

export const useRemodelingType = (): ERemodelingType => {
  return useContext(RemodelingTypeContext);
};
