import { TSelectOption } from "@/components/custom/select/select.types";

// https://medium.com/@lovebuizel/how-to-make-shadcn-ui-select-components-value-accept-empty-strings-and-other-types-93401e2f38bb

export const valueToString = (val: TSelectOption["value"]) => {
  if (val === -Infinity) return "__-Infinity__";
  if (val === Infinity) return "__Infinity__";
  if (Number.isNaN(val)) return "__NaN__";
  if (val === null) return "__null__";
  if (val === undefined) {
    console.error("option value cannot be undefined");
    return "__undefined__";
  }
  if (typeof val === "symbol") return `__symbol__${val.description}`;
  return JSON.stringify(val);
};

export const stringToValue = (str: string) => {
  switch (str) {
    case "__-Infinity__":
      return -Infinity;
    case "__Infinity__":
      return Infinity;
    case "__NaN__":
      return NaN;
    case "__null__":
      return null;
    case "__undefined__":
      return undefined;
    default:
      if (str.startsWith("__symbol__")) {
        return Symbol(str.slice(10));
      }
      return JSON.parse(str);
  }
};
