import { useOverlay } from "@toss/use-overlay";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { BuildingDataOverwriteDialog } from "@/domain/building/components/BuildingDataOverwriteDialog";
import { useRemodelingTypeStore } from "@/store/remodeling-type.store";

export const useBuildingDataCopyOverwriteOptions = () => {
  const overlay = useOverlay();
  const navigate = useNavigate();
  const remodelingType = useRemodelingTypeStore(useShallow((state) => state.remodelingType));

  const onNavigate = useCallback(() => {
    navigate(`/remodeling/${remodelingType}/building-overview`);
  }, [navigate, remodelingType]);

  const handleOpenOverwriteOverlay = useCallback(() => {
    overlay.open(({ close, isOpen }) => {
      return (
        <BuildingDataOverwriteDialog isOpen={isOpen} onClose={close} onNavigate={onNavigate} />
      );
    });
  }, [overlay, onNavigate]);

  return {
    handleOpenOverwriteOverlay,
  };
};
