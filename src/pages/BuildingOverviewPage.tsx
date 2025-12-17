import { HeadingWithRequired } from "@/components/custom/HeadingWithRequired";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/domain/basic-info/components/FormInput";
import { useVersionNameForm } from "@/domain/building-geometry/hooks/useVersionNameForm";
import { RenewableManageForm } from "@/domain/systems/renewable/components/RenewableManageForm";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";

const BuildingOverviewPage = () => {
  const { version } = useBuildingGeometryStore();
  const { form, handleChangeVersionName } = useVersionNameForm();

  return (
    <div className="container-page">
      <div className="mb-10">
        <HeadingWithRequired heading={version.name} />
      </div>
      <Form {...form}>
        <FormInput
          form={form}
          isRequired
          label="리모델링 버전 이름"
          name="name"
          onBlurCallback={handleChangeVersionName}
          placeholder="입력하세요."
        />
      </Form>
      <Separator className="my-5" />
      <RenewableManageForm />
    </div>
  );
};

export default BuildingOverviewPage;
