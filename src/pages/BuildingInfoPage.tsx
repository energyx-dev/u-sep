import { HeadingWithRequired, PAGE_TITLES } from "@/components/custom/HeadingWithRequired";
import { Form } from "@/components/ui/form";
import { BuildingInfoForm } from "@/domain/basic-info/components/BuildingInfoForm";
import { useBuildingInfoForm } from "@/domain/basic-info/hooks/useBuildingInfoForm";

const BasicInfoPage = () => {
  const { form, handleFieldBlur } = useBuildingInfoForm();

  return (
    <div className="container-page">
      <Form {...form}>
        <div className="mb-10">
          <HeadingWithRequired heading={PAGE_TITLES.BUILDING_INFO} />
        </div>
        <BuildingInfoForm form={form} handleFieldBlur={handleFieldBlur} />
      </Form>
    </div>
  );
};

export default BasicInfoPage;
