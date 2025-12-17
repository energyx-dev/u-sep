import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { buildingErrorMap } from "@/domain/basic-info/schemas/building.error-map";
import {
  buildingGUISchema,
  TBuildingGUIInputSchema,
} from "@/domain/basic-info/schemas/building.schema";
import {
  getInitialBuildingState,
  useBuildingInfoStore,
} from "@/domain/basic-info/stores/building.store";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useDebugStore } from "@/store/debug.store";

export const useBuildingInfoForm = () => {
  const { setBuildingInfo } = useDataSyncActions();
  const { buildingInfo, isFileLoaded, setIsFileLoaded } = useBuildingInfoStore();
  const { isDebuggingMode } = useDebugStore(
    useShallow((state) => ({
      isDebuggingMode: state.isDebuggingMode,
    })),
  );

  const form = useForm<TBuildingGUIInputSchema>({
    defaultValues: buildingInfo,
    mode: "onBlur",
    resolver: zodResolver(buildingGUISchema, { errorMap: buildingErrorMap }),
  });

  useEffect(() => {
    if (isFileLoaded) {
      form.reset(buildingInfo);
      setIsFileLoaded(false);
    }
  }, [isFileLoaded, buildingInfo, form]);

  useEffect(() => {
    // 디버깅 모드 -> 렌더링 시 에러 체크
    if (isDebuggingMode) {
      form.trigger();
    }
  }, [form, isDebuggingMode]);

  const handleFieldBlur = useCallback(
    async (fieldName: keyof TBuildingGUIInputSchema) => {
      const isValid = await form.trigger(fieldName);
      const currentValues = form.getValues();

      if (isValid) {
        // 유효한 경우, 전역 상태로 저장
        // 시/도 변경시 시/군/구 초기화
        if (fieldName === "addressRegion") {
          form.setValue("addressDistrict", "", { shouldValidate: true });
        }

        // 전역 상태 업데이트
        setBuildingInfo({
          ...currentValues,
          [fieldName]: form.getValues(fieldName),
        });
      } else {
        // 유효하지 않을 경우, 필드 타입에 따라 초기값으로 되돌리기
        const initialBuildingState = getInitialBuildingState().buildingInfo;
        setBuildingInfo({ ...currentValues, [fieldName]: initialBuildingState[fieldName] });
      }
    },
    [form, setBuildingInfo],
  );

  return { form, handleFieldBlur };
};
