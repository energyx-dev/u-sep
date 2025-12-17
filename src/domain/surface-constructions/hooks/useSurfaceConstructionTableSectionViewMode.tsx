import { useState } from "react";

import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TViewMode } from "@/types/view-mode.type";

export const useSurfaceConstructionTableSectionViewMode = (
  type: BUILDING_SURFACE_TYPE.floor | BUILDING_SURFACE_TYPE.wall,
) => {
  const [mode, setMode] = useState<
    Record<BUILDING_SURFACE_TYPE.floor | BUILDING_SURFACE_TYPE.wall, TViewMode>
  >({
    [BUILDING_SURFACE_TYPE.floor]: "view",
    [BUILDING_SURFACE_TYPE.wall]: "view",
  });

  const isEdit = mode[type] === "edit";

  const handleChangeMode = (next: TViewMode) => {
    setMode((prev) => ({ ...prev, [type]: next }));
  };

  return {
    handleChangeMode,
    isEdit,
    mode,
  };
};
