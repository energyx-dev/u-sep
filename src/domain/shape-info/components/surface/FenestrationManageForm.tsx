import { createColumnHelper } from "@tanstack/react-table";

import { TableForm } from "@/components/layout/TableFormLayout";
import { ViewAndSelectTable } from "@/components/table/ViewAndSelectTable";
import { useFenestrationColumn } from "@/domain/fenestration/hooks/useFenestrationColumn";
import { TFenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import { useFenestrationManage } from "@/domain/shape-info/hooks/surface/useFenestrationManage";
import { TTemplateToInstanceMergeIds } from "@/lib/convert";

const columnHelper =
  createColumnHelper<TTemplateToInstanceMergeIds<TFenestrationEngineAndGuiSchema>>();

export const FenestrationManageForm = ({
  surfaceId,
  zoneId,
}: {
  surfaceId: string;
  zoneId: string;
}) => {
  const { handleOpenFenestrationSelectDialog, viewData } = useFenestrationManage({
    surfaceId,
    zoneId,
  });
  const { columns } = useFenestrationColumn();

  const VIEW_COLUMNS = [
    ...columns,
    columnHelper.accessor((row) => row.count, {
      header: "개수",
      id: "count",
      size: 100,
    }),
  ];

  return (
    <TableForm.Wrapper>
      <TableForm.Header onClickManage={handleOpenFenestrationSelectDialog} title="개구부" />
      {viewData.length > 0 && (
        <ViewAndSelectTable columns={VIEW_COLUMNS} data={viewData} type="read-only" />
      )}
    </TableForm.Wrapper>
  );
};
