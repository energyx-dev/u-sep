import { UseFormReturn } from "react-hook-form";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { FormDatePicker } from "@/domain/basic-info/components/FormDatePicker";
import { FormInput } from "@/domain/basic-info/components/FormInput";
import { FormRegionSelect } from "@/domain/basic-info/components/FormRegionSelect";
import { TBuildingGUIInputSchema } from "@/domain/basic-info/schemas/building.schema";

type TProps = {
  form: UseFormReturn<TBuildingGUIInputSchema>;
  handleFieldBlur: (fieldName: keyof TBuildingGUIInputSchema) => Promise<void>;
};

const formStyles = {
  button: "h-11 justify-start pl-3 text-left text-sm font-normal",
  container: "flex flex-col gap-4",
  grid: "grid grid-cols-2 gap-4",
  input: "h-11",
  select: "h-11 w-full",
} as const;

export const BuildingInfoForm = ({ form, handleFieldBlur }: TProps) => {
  return (
    <div className={formStyles.container}>
      <FormInput
        className={formStyles.input}
        form={form}
        isRequired
        label="건물 이름"
        name="name"
        onBlurCallback={() => handleFieldBlur("name")}
        placeholder={PLACEHOLDERS.BUILDING_INFO.NAME}
      />

      <div className={formStyles.grid}>
        <FormRegionSelect
          className={formStyles.select}
          form={form}
          handleFieldBlur={handleFieldBlur}
          placeholder={PLACEHOLDERS.BUILDING_INFO.ADDRESS_REGION}
        />
        <FormInput
          className={formStyles.input}
          form={form}
          label="상세 주소"
          name="detailAddress"
          onBlurCallback={() => handleFieldBlur("detailAddress")}
          placeholder={PLACEHOLDERS.BUILDING_INFO.DETAIL_ADDRESS}
        />
      </div>

      <div className={formStyles.grid}>
        <FormDatePicker
          className={formStyles.button}
          form={form}
          isRequired
          label="허가일자"
          name="vintage"
          onBlurCallback={() => handleFieldBlur("vintage")}
          placeholder={PLACEHOLDERS.BUILDING_INFO.VINTAGE}
        />
        <FormInput
          className={formStyles.input}
          form={form}
          isRequired
          label="방위각(°)"
          name="north_axis"
          onBlurCallback={() => handleFieldBlur("north_axis")}
          placeholder={PLACEHOLDERS.BUILDING_INFO.NORTH_AXIS}
          type="number"
        />
      </div>
    </div>
  );
};
