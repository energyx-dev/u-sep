import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { TooltipUIWithQuestion } from "@/components/custom/TooltipUI";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    id,
    name: fieldContext.name,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formDescriptionId, formItemId, formMessageId } = useFormField();

  return (
    <Slot
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      data-slot="form-control"
      id={formItemId}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  );
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("flex flex-col gap-1.5", className)} data-slot="form-item" {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  isRequired = false,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  description?: React.ReactNode;
  isRequired?: boolean;
  label?: string;
  name?: string;
}) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(
        "text-neutral560 flex h-[17px] items-center justify-between text-sm leading-normal font-medium",
        className,
      )}
      data-error={!!error}
      data-slot="form-label"
      htmlFor={formItemId}
      {...props}
    >
      <span className="flex items-center gap-0.5">
        {props.label}
        {props.children}
        {isRequired && <span className="text-negative">*</span>}
      </span>
      {props.label?.includes("방위각") && (
        <TooltipUIWithQuestion
          text={
            "건물 방위각은 도면에 표시된 방위각 그대로 입력하는 값입니다. 도면 상에서 건물이 바라보는 방향(정면 기준 각도)을 그대로 입력해 주세요."
          }
        />
      )}
      {props.label?.includes("벽 방향") && (
        <span className="flex items-center gap-0.5 font-normal">
          {props.description}
          <TooltipUIWithQuestion text="벽 방향은 “건물 기준 방향”으로 입력하세요. 건물 방위각은 자동으로 반영되어 실제 방위각(북쪽 기준)이 계산됩니다." />
        </span>
      )}
    </Label>
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn("text-destructive text-[13px]", className)}
      data-slot="form-message"
      id={formMessageId}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
