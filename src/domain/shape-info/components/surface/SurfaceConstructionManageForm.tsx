import { TableForm } from "@/components/layout/TableFormLayout";
import { useSurfaceConstructionManage } from "@/domain/shape-info/hooks/surface/useSurfaceConstructionManage";
import { useSurfaceEditor } from "@/domain/shape-info/hooks/useSurfaceEditor";
import { SurfaceConstructionsViewTable } from "@/domain/surface-constructions/components/SurfaceConstructionsViewTable";
import { useSurfaceConstructionColumn } from "@/domain/surface-constructions/hooks/useSurfaceConstructionColumn";

export const SurfaceConstructionManageForm = ({
  surfaceId,
  zoneId,
}: {
  surfaceId: string;
  zoneId: string;
}) => {
  const { handleOpenSurfaceConstructionSelectDialog, viewData } = useSurfaceConstructionManage({
    surfaceId,
    zoneId,
  });

  const { getSurfaceById, isMaxFloorBySurfaceId, isMinFloorBySurfaceId } = useSurfaceEditor();
  const surfaceData = getSurfaceById({ surfaceId, zoneId });

  // 기준면 여부 판단: adjacent_from이 없으면 기준면
  const isPrimarySurface = !surfaceData?.adjacent_from;

  const { surfaceConstructionsSurfaceViewColumn } = useSurfaceConstructionColumn({
    floorStatus: {
      isMax: isMaxFloorBySurfaceId(surfaceId),
      isMin: isMinFloorBySurfaceId(surfaceId),
    },
    surfaceData,
    type: surfaceData?.type,
  });

  return (
    <TableForm.Wrapper>
      <TableForm.Header
        isPrimarySurface={isPrimarySurface}
        isRequired
        onClickManage={handleOpenSurfaceConstructionSelectDialog}
        title="면 구조체"
      />
      {viewData.length > 0 && (
        <SurfaceConstructionsViewTable
          columns={surfaceConstructionsSurfaceViewColumn}
          data={viewData}
          setData={() => {}}
          setMode={() => {}}
        />
      )}
    </TableForm.Wrapper>
  );
};
