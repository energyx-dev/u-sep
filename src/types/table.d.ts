import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, V = unknown> {
    disabled?: (row: TData) => boolean;
    groupSelectOptions?:
      | import("@/components/custom/select/select.types").TGroupSelectOption<V>[]
      | import("@/components/custom/select/select.types").TGroupSelectOptionFunction<TData, V>;
    inputType?: "boolean" | "number" | "text";
    isRequired?: boolean;
    isRowHeader?: boolean;
    openWithDialog?: boolean;
    placeholder?: string;
    placeholderGetter?: (row: TData) => string;
    selectOptions?:
      | import("@/components/custom/select/select.types").TSelectOption<V>[]
      | import("@/components/custom/select/select.types").TSelectOptionFunction<TData, V>;
    valueGetter?: (row: TData) => string | undefined;
  }
}
