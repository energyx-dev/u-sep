import { DebugAccordionItem } from "@/domain/result/components/debug/DebugAccordionItem";
import { DEBUG_LABEL_BY_COMMON } from "@/domain/result/constants/debug.path";
import { TDebugErrorSetCommonItem } from "@/domain/result/helpers/debug.core";

interface IProps {
  debugList: TDebugErrorSetCommonItem;
  type: "optional" | "required";
}

export const DebugCommonAccordion = ({ debugList, type }: IProps) => {
  const commonDebugList = getCommonDebugList(debugList);
  return (
    <div className="flex flex-col gap-2">
      {commonDebugList.map((item) => (
        <DebugAccordionItem
          debugList={item.debugList}
          key={item.pageKey}
          label={DEBUG_LABEL_BY_COMMON[item.pageKey]}
          type={type}
          value={`${item.pageKey}`}
        />
      ))}
    </div>
  );
};

const getCommonDebugList = (debugList: TDebugErrorSetCommonItem) => {
  const pageKeys = Object.keys(debugList) as (keyof TDebugErrorSetCommonItem)[];

  const result = pageKeys.map((pageKey) => {
    const debugListByPage = debugList[pageKey];
    const debugListWithPath = debugListByPage.map((item) => {
      return {
        message: item.message,
        path: item.path,
      };
    });

    return {
      debugList: debugListWithPath,
      pageKey: pageKey,
      pageLabel: DEBUG_LABEL_BY_COMMON[pageKey],
    };
  });

  return result;
};
