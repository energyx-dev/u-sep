import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useZoneEditor } from "@/domain/shape-info/hooks/useZoneEditor";
import { zoneErrorMap } from "@/domain/shape-info/schemas/zone/zone.error-map";
import { TZoneGuiSchema, zoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { initZone } from "@/domain/shape-info/utils/shape-info.utils";
import { useDebugStore } from "@/store/debug.store";

export const useZoneEditForm = (zoneId?: string) => {
  const { getZoneById, updateZone } = useZoneEditor();
  const savedZone = zoneId ? getZoneById(zoneId) : undefined;

  const { isDebuggingMode } = useDebugStore(
    useShallow((state) => ({
      isDebuggingMode: state.isDebuggingMode,
    })),
  );

  const form = useForm<TZoneGuiSchema>({
    defaultValues: savedZone ?? initZone,
    resolver: zodResolver(zoneGuiSchema, { errorMap: zoneErrorMap }),
  });

  useEffect(() => {
    form.reset(savedZone);

    if (isDebuggingMode) {
      form.trigger();
    }
  }, [zoneId, form, isDebuggingMode]);

  const handleFieldBlur = useCallback(
    async (fieldName: keyof TZoneGuiSchema) => {
      if (!zoneId) return;

      const isValid = await form.trigger(fieldName);

      if (isValid) {
        updateZone(zoneId, { [fieldName]: form.getValues(fieldName) });
      } else {
        updateZone(zoneId, { [fieldName]: initZone[fieldName] });
      }
    },
    [zoneId, form, updateZone],
  );

  return {
    form,
    handleFieldBlur,
  };
};
