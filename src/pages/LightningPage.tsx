import { HeadingWithRequired, PAGE_TITLES } from "@/components/custom/HeadingWithRequired";
import { LightningDensityEditTable } from "@/domain/systems/lightning/components/LightningDensityEditTable";
import { LightningEditTable } from "@/domain/systems/lightning/components/LightningEditTable";
import { useTableSectionViewMode } from "@/hooks/useTableSectionViewMode";

const LightningPage = () => {
  const { handleChangeMode, isEdit, mode } = useTableSectionViewMode();
  const {
    handleChangeMode: handleChangeModeDensity,
    isEdit: isEditDensity,
    mode: modeDensity,
  } = useTableSectionViewMode();

  return (
    <div className="container-page">
      <div className="mb-10">
        <HeadingWithRequired heading={PAGE_TITLES.LIGHTNING} isEdit={isEdit} />
      </div>
      <div className="space-y-9">
        <LightningEditTable handleChangeMode={handleChangeMode} isEdit={isEdit} mode={mode} />
        <LightningDensityEditTable
          handleChangeMode={handleChangeModeDensity}
          isEdit={isEditDensity}
          mode={modeDensity}
        />
      </div>
    </div>
  );
};

export default LightningPage;
