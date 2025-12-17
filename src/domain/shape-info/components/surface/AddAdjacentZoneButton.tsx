import { useOverlay } from "@toss/use-overlay";
import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { NewAddAdjacentZoneDialog } from "@/domain/shape-info/components/surface/NewAddAdjacentZoneDialog";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";

interface Props {
  floorId?: string;
  form: UseFormReturn<TSurfaceGuiSchema>;
  surfaceId?: string;
  zoneId?: string;
}

export const AddAdjacentZoneButton = ({ floorId, form, surfaceId, zoneId }: Props) => {
  const overlay = useOverlay();

  // 다이얼로그 오픈 핸들러
  const openDialog = useCallback(() => {
    overlay.open(({ close, isOpen }) => (
      <NewAddAdjacentZoneDialog
        currentFloorId={floorId}
        currentSurfaceId={surfaceId}
        currentZoneId={zoneId}
        form={form}
        isOpen={isOpen}
        onClose={close}
      />
    ));
  }, [overlay, floorId, surfaceId, zoneId]);

  return (
    <Button className="h-11" onClick={openDialog} variant="secondary">
      선택
    </Button>
  );
};
