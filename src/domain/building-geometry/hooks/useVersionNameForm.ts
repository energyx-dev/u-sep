import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";

import { versionErrorMap } from "@/domain/building-geometry/schemas/version-name.error-map";
import {
  TVersionGuiSchema,
  versionSchema,
} from "@/domain/building-geometry/schemas/version-name.schema";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useDebugStore } from "@/store/debug.store";

export const useVersionNameForm = () => {
  const { version } = useBuildingGeometryStore();
  const { setVersion } = useDataSyncActions();
  const { isDebuggingMode } = useDebugStore(
    useShallow((state) => ({
      isDebuggingMode: state.isDebuggingMode,
    })),
  );

  const form = useForm<TVersionGuiSchema>({
    defaultValues: version,
    mode: "onBlur",
    resolver: zodResolver(versionSchema, { errorMap: versionErrorMap }),
  });

  useEffect(() => {
    form.reset({ name: version.name });

    if (isDebuggingMode) {
      form.trigger();
    }
  }, [form, isDebuggingMode, version.name]);

  const handleChangeVersionName = useCallback(async () => {
    const isValid = await form.trigger("name");
    const value = form.getValues("name");

    if (isValid) {
      setVersion({ name: value });
    } else {
      setVersion({ name: "버전" });
    }
  }, [form, setVersion, version.name]);

  return { form, handleChangeVersionName };
};
