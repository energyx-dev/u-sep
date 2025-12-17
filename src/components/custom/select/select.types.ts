export type TGroupSelectOption<V = unknown> = {
  label: string;
  options: TSelectOption<V>[];
};

export type TGroupSelectOptionFunction<R extends object, V = unknown> = (
  row: R,
) => (TGroupSelectOption<V> | TSelectOption<V>)[];

export type TSelectOption<V = unknown> = {
  disabled?: boolean;
  label: string;
  value: V;
};

export type TSelectOptionFunction<R extends object, V = unknown> = (row: R) => TSelectOption<V>[];
