import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TBuildingGUIInputSchema } from "@/domain/basic-info/schemas/building.schema";
import { cn } from "@/lib/utils";

type TFormDatePickerProps = {
  className?: string;
  form: UseFormReturn<TBuildingGUIInputSchema>;
  isRequired?: boolean;
  label: string;
  name: keyof TBuildingGUIInputSchema;
  onBlurCallback?: () => void;
  placeholder?: string;
};

const DATE_FORMAT = "yyyy. MM. dd";

export const FormDatePicker = ({
  className,
  form,
  isRequired = false,
  label,
  name,
  onBlurCallback,
  placeholder = "날짜를 선택하세요",
}: TFormDatePickerProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel isRequired={isRequired}>{label}</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                className={cn(
                  "border-input aria-invalid:border-negative justify-between !p-2.5",
                  className,
                  !field.value && "text-muted-foreground",
                )}
                variant={"monoOutline"}
              >
                <div className="text-neutral640 flex-1 text-base font-medium">
                  {field.value ? (
                    format(new Date(field.value as string), DATE_FORMAT)
                  ) : (
                    <span className="text-neutral320">{placeholder}</span>
                  )}
                </div>
                <CalendarDays className="size-6 text-[#AAAAAA]" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              captionLayout="dropdown"
              disabled={(date) => date > new Date()}
              initialFocus
              mode="single"
              onSelect={(e) => {
                if (e === undefined) {
                  field.onChange(e);
                  onBlurCallback?.();
                } else {
                  field.onChange(format(e, DATE_FORMAT));
                  onBlurCallback?.();
                }
              }}
              selected={field.value ? new Date(field.value as string) : undefined}
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />
);
