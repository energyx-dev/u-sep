import { Form } from "@/components/ui/form";
import { PLACEHOLDERS } from "@/constants/placeholders";
import { FormInput } from "@/domain/basic-info/components/FormInput";
import { ShapeInfoEditSelect } from "@/domain/shape-info/components/ShapeInfoEditInput";
import { ZoneForm } from "@/domain/shape-info/components/zone/ZoneForm";
import { useZoneEditForm } from "@/domain/shape-info/hooks/useZoneEditForm";
import { useZoneEditor } from "@/domain/shape-info/hooks/useZoneEditor";
import {
  ZONE_PROFILE_TYPE,
  ZONE_PROFILE_TYPE_LABELS,
} from "@/domain/shape-info/schemas/zone/zone.enum";

const formStyles = {
  button: "h-11 justify-start pl-3 text-left text-sm font-normal",
  container: "flex flex-col gap-4",
  grid: "grid grid-cols-2 gap-4",
  input: "h-11",
  select: "h-11 w-full",
} as const;

interface IZoneEditFormProps {
  zoneId?: string;
}

export const ZoneEditFields = ({ zoneId }: IZoneEditFormProps) => {
  const { updateZone } = useZoneEditor();
  const { form, handleFieldBlur } = useZoneEditForm(zoneId);

  return (
    <>
      <Form {...form}>
        <div className={formStyles.container}>
          <div className={formStyles.grid}>
            <FormInput
              className={formStyles.input}
              form={form}
              isRequired
              label="이름"
              name="name"
              onBlurCallback={() => handleFieldBlur("name")}
              placeholder={PLACEHOLDERS.ZONE.NAME}
            />
            <ShapeInfoEditSelect
              control={form.control}
              isRequired
              label="용도"
              name="profile"
              onValueChange={(val) => {
                if (zoneId) {
                  updateZone(zoneId, { profile: val as ZONE_PROFILE_TYPE });
                  form.setValue("profile", val, { shouldValidate: true });
                }
              }}
              options={Object.entries(ZONE_PROFILE_TYPE_LABELS).map(([key, label]) => ({
                label,
                value: ZONE_PROFILE_TYPE[key as ZONE_PROFILE_TYPE],
              }))}
              placeholder={PLACEHOLDERS.ZONE.PROFILE}
            />
          </div>
          <div className={formStyles.grid}>
            <FormInput
              className={formStyles.input}
              form={form}
              isRequired
              label="천장고(m)"
              name="height"
              onBlurCallback={() => handleFieldBlur("height")}
              placeholder={PLACEHOLDERS.ZONE.HEIGHT}
              type="number"
            />
            <FormInput
              className={formStyles.input}
              form={form}
              isRequired
              label="침기율[ACH50](회/h)"
              name="infiltration"
              onBlurCallback={() => handleFieldBlur("infiltration")}
              placeholder={PLACEHOLDERS.ZONE.INFILTRATION}
              type="number"
            />
          </div>
        </div>
      </Form>
      <ZoneForm form={form} zoneId={zoneId!} />
    </>
  );
};
