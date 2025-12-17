import { HeadingWithRequired, PAGE_TITLES } from "@/components/custom/HeadingWithRequired";
import { VentilationSystemTable } from "@/domain/systems/ventilation/components/VentilationSystemTable";
import { useTableSectionViewMode } from "@/hooks/useTableSectionViewMode";

const VentilationSystemPage = () => {
  const { handleChangeMode, isEdit, mode } = useTableSectionViewMode();

  return (
    <div className="container-page">
      <div className="mb-10">
        <HeadingWithRequired heading={PAGE_TITLES.VENTILATION_SYSTEM} isEdit={isEdit} />
      </div>
      <VentilationSystemTable handleChangeMode={handleChangeMode} isEdit={isEdit} mode={mode} />
    </div>
  );
};

export default VentilationSystemPage;
