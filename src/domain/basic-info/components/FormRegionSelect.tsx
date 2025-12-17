import { UseFormReturn } from "react-hook-form";

import SelectUI from "@/components/custom/select/SelectUI";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { REGIONS } from "@/domain/basic-info/constants/region.constant";
import { TBuildingGUIInputSchema } from "@/domain/basic-info/schemas/building.schema";

type TFormRegionSelectProps = {
  className?: string;
  form: UseFormReturn<TBuildingGUIInputSchema>;
  handleFieldBlur: (fieldName: keyof TBuildingGUIInputSchema) => Promise<void>;
  placeholder?: string;
  wrapperClassName?: string;
};

export const FormRegionSelect = ({
  className,
  form,
  handleFieldBlur,
  placeholder = "선택하세요.",
  wrapperClassName,
}: TFormRegionSelectProps) => {
  const w_addressRegion = form.watch("addressRegion") as keyof typeof REGIONS;

  const regionList = Object.keys(REGIONS);
  const districtList = REGIONS[w_addressRegion] ?? [];

  return (
    <div className={wrapperClassName ?? "grid grid-cols-2 gap-2"}>
      <FormField
        control={form.control}
        name="addressRegion"
        render={({ field }) => (
          <FormItem>
            <FormLabel isRequired>주소</FormLabel>
            <SelectUI
              hasFormControl
              onValueChange={(e) => {
                field.onChange(e);
                handleFieldBlur("addressRegion");
              }}
              options={regionList.map((region) => ({
                label: region,
                value: region,
              }))}
              placeholder={placeholder}
              triggerClassName={className}
              value={field.value || undefined}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="addressDistrict"
        render={({ field }) => (
          <FormItem>
            <FormLabel />
            <SelectUI
              disabled={!w_addressRegion}
              hasFormControl
              onValueChange={(e) => {
                field.onChange(e);
                handleFieldBlur("addressDistrict");
              }}
              options={districtList.map((district) => ({
                label: district,
                value: district,
              }))}
              placeholder={placeholder}
              triggerClassName={className}
              value={field.value || undefined}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
