import { useMemo } from "react";
import { z } from "zod";

import { getTableErrors, TTableErrorCheckItem } from "@/lib/table-helper";

interface TParams {
  data: TTableErrorCheckItem[];
  existingNameList?: string[];
  schema: z.ZodType<object>;
  setErrorMap?: z.ZodErrorMap;
}

export const useValidateTableErrors = ({
  data,
  existingNameList,
  schema,
  setErrorMap,
}: TParams) => {
  const validationResult = useMemo(
    () => getTableErrors({ data, existingNameList, schema, setErrorMap }),
    [data, existingNameList, schema, setErrorMap],
  );

  const disabled = validationResult.errors.length > 0;

  return {
    disabled,
    validationResult,
  };
};
