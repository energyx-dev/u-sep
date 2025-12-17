import { createColumnHelper } from "@tanstack/react-table";

import { TableForm } from "@/components/layout/TableFormLayout";
import { ViewAndSelectTable } from "@/components/table/ViewAndSelectTable";
import { useRenewableManage } from "@/domain/systems/renewable/hooks/useRenewableManage";
import { PHOTOVOLTAIC_SYSTEM_COLUMNS } from "@/domain/systems/renewable/photovoltaic/constants/photovoltaic.column";
import { TPhotovoltaicSystemEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import { TTemplateToInstanceMergeIds } from "@/lib/convert";

const columnHelper =
  createColumnHelper<TTemplateToInstanceMergeIds<TPhotovoltaicSystemEngineAndGuiSchema>>();

const VIEW_COLUMNS = [
  ...PHOTOVOLTAIC_SYSTEM_COLUMNS,
  columnHelper.accessor((row) => row.count, {
    header: "개수",
    id: "count",
    size: 100,
  }),
];

export const RenewableManageForm = () => {
  const { handleOpenRenewableSelectDialog, viewData } = useRenewableManage();

  return (
    <TableForm.Wrapper>
      <TableForm.Header onClickManage={handleOpenRenewableSelectDialog} title="신재생" />
      {viewData.length > 0 && (
        <ViewAndSelectTable columns={VIEW_COLUMNS} data={viewData} type="read-only" />
      )}
    </TableForm.Wrapper>
  );
};
