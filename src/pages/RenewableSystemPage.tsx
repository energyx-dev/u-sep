import { HeadingWithRequired, PAGE_TITLES } from "@/components/custom/HeadingWithRequired";
import { PhotovoltaicSystemTable } from "@/domain/systems/renewable/photovoltaic/components/PhotovoltaicSystemTable";
import { useTableSectionViewMode } from "@/hooks/useTableSectionViewMode";

const RenewableSystemPage = () => {
  const { handleChangeMode, isEdit, mode } = useTableSectionViewMode();

  return (
    <div className="container-page">
      <div className="mb-10">
        <HeadingWithRequired heading={PAGE_TITLES.RENEWABLE_SYSTEM} isEdit={isEdit} />
      </div>
      <PhotovoltaicSystemTable handleChangeMode={handleChangeMode} isEdit={isEdit} mode={mode} />
    </div>
  );
};

export default RenewableSystemPage;
