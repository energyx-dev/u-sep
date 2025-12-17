import { UseFormReturn } from "react-hook-form";

import { TableForm } from "@/components/layout/TableFormLayout";
import { ViewAndSelectTable } from "@/components/table/ViewAndSelectTable";
import { Separator } from "@/components/ui/separator";
import { useSupplySystemManage } from "@/domain/shape-info/hooks/zone/useSupplySystemManage";
import { useVentilationManage } from "@/domain/shape-info/hooks/zone/useVentilationManage";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { useDynamicSupplySystemColumns } from "@/domain/systems/supply/hooks/useDynamicSupplySystemColumns";
import { VENTILATION_SYSTEM_COLUMNS } from "@/domain/systems/ventilation/constants/ventilation.column";

import { LightningForm } from "./LightningForm";

type TProps = {
  form: UseFormReturn<TZoneGuiSchema>;
  zoneId: string;
};

export const ZoneForm = ({ form, zoneId }: TProps) => {
  const {
    handleOpenCoolingSupplySystemSelectDialog,
    handleOpenHeatingSupplySystemSelectDialog,
    viewCoolingData,
    viewHeatingData,
  } = useSupplySystemManage({
    form,
    zoneId,
  });

  const { handleOpenVentilationSelectDialog, viewData: ventilationViewData } = useVentilationManage(
    { form, zoneId },
  );

  const selectedHeatingSupplySystem = viewHeatingData[0];
  const selectedCoolingSupplySystem = viewCoolingData[0];
  const { columns: heatingColumns } = useDynamicSupplySystemColumns(
    selectedHeatingSupplySystem?.type ?? null,
  );
  const { columns: coolingColumns } = useDynamicSupplySystemColumns(
    selectedCoolingSupplySystem?.type ?? null,
  );

  return (
    <>
      <div className="space-y-3">
        <Separator className="bg-neutral080 my-5" />
        <LightningForm form={form} zoneId={zoneId} />
      </div>
      <div className="space-y-3">
        <Separator className="bg-neutral080 my-5" />
        <div className="flex items-center gap-3">
          <TableForm.Header
            onClickManage={handleOpenHeatingSupplySystemSelectDialog}
            title="난방용 공급 설비"
          />
        </div>
        {selectedHeatingSupplySystem?.type && (
          <ViewAndSelectTable columns={heatingColumns} data={viewHeatingData} type="read-only" />
        )}
      </div>
      <div className="space-y-3">
        <Separator className="bg-neutral080 my-5" />
        <div className="flex items-center gap-3">
          <TableForm.Header
            onClickManage={handleOpenCoolingSupplySystemSelectDialog}
            title="냉방용 공급 설비"
          />
        </div>
        {selectedCoolingSupplySystem?.type && (
          <ViewAndSelectTable columns={coolingColumns} data={viewCoolingData} type="read-only" />
        )}
      </div>
      <div className="space-y-3">
        <Separator className="bg-neutral080 my-5" />
        <div className="flex items-center gap-3">
          <TableForm.Header onClickManage={handleOpenVentilationSelectDialog} title="환기 설비" />
        </div>
        {ventilationViewData.length > 0 && (
          <ViewAndSelectTable
            columns={VENTILATION_SYSTEM_COLUMNS}
            data={ventilationViewData}
            type="read-only"
          />
        )}
      </div>
    </>
  );
};
