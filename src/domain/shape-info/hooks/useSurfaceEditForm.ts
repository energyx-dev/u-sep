import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useSurfaceEditor } from "@/domain/shape-info/hooks/useSurfaceEditor";
import { surfaceErrorMap } from "@/domain/shape-info/schemas/surface/surface.error-map";
import {
  surfaceGuiSchema,
  TSurfaceGuiSchema,
} from "@/domain/shape-info/schemas/surface/surface.schema";
import { initSurface } from "@/domain/shape-info/utils/shape-info.utils";
import { useDebugStore } from "@/store/debug.store";

export const useSurfaceEditForm = (zoneId?: string, surfaceId?: string) => {
  const { getSurfaceById, updateSurface } = useSurfaceEditor();
  const savedSurface = zoneId && surfaceId ? getSurfaceById({ surfaceId, zoneId }) : undefined;

  const { isDebuggingMode } = useDebugStore(
    useShallow((state) => ({
      isDebuggingMode: state.isDebuggingMode,
    })),
  );

  const form = useForm<TSurfaceGuiSchema>({
    defaultValues: savedSurface ?? initSurface,
    resolver: zodResolver(surfaceGuiSchema, { errorMap: surfaceErrorMap }),
  });

  useEffect(() => {
    form.reset(savedSurface);

    if (isDebuggingMode) {
      form.trigger();
    }
    // surfaceId나 zoneId가 변경될 때만 폼 리셋 -> 입력 중 리셋 방지
  }, [surfaceId, zoneId, isDebuggingMode]);

  const handleFieldBlur = useCallback(
    async (fieldName: keyof TSurfaceGuiSchema) => {
      if (!zoneId || !surfaceId) return;

      const isValid = await form.trigger(fieldName);

      if (isValid) {
        updateSurface({
          adjacentSurfaceId: form.watch("adjacent_surface_id"),
          data: { [fieldName]: form.getValues(fieldName) },
          surfaceId,
        });
      } else {
        updateSurface({
          adjacentSurfaceId: form.watch("adjacent_surface_id"),
          data: { [fieldName]: initSurface[fieldName] },
          surfaceId,
        });
      }
    },
    [zoneId, surfaceId, form, updateSurface],
  );

  return {
    form,
    handleFieldBlur,
  };
};
