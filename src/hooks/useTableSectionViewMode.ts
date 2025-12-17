import { useState } from "react";

import { TViewMode } from "@/types/view-mode.type";

export const useTableSectionViewMode = (initialMode: TViewMode = "view") => {
  const [mode, setMode] = useState<TViewMode>(initialMode);
  const isEdit = mode === "edit";

  const handleChangeMode = (mode: TViewMode) => {
    setMode(mode);
  };

  return {
    handleChangeMode,
    isEdit,
    mode,
  };
};
