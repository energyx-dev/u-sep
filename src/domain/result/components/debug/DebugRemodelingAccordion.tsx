import { Accordion } from "@/components/ui/accordion";
import { DebugAccordionItem } from "@/domain/result/components/debug/DebugAccordionItem";
import { DEBUG_LABEL_BY_REMODELING } from "@/domain/result/constants/debug.path";
import { TDebugErrorSetRemodelingItem } from "@/domain/result/helpers/debug.core";
import { TDebugErrorSetWithCount } from "@/domain/result/helpers/debug.ui.helper";
import { ERemodelingType, REMODELING_TYPE_LABEL } from "@/enums/ERemodelingType";

interface IProps {
  debugListByRemodelingType: TDebugErrorSetWithCount;
  remodelingTypeAfter: ERemodelingType;
  remodelingTypeBefore: ERemodelingType;
  type: "optional" | "required";
}

export const DebugRemodelingAccordion = ({
  debugListByRemodelingType,
  remodelingTypeAfter,
  remodelingTypeBefore,
  type,
}: IProps) => {
  const labelBefore = REMODELING_TYPE_LABEL[remodelingTypeBefore];
  const labelAfter = REMODELING_TYPE_LABEL[remodelingTypeAfter];
  const requireDebugListBefore = getRemodelingDebugList(debugListByRemodelingType.before);
  const requireDebugListAfter = getRemodelingDebugList(debugListByRemodelingType.after);

  const mergedDebugListByVersion = mergeDebugListByVersion(
    requireDebugListBefore,
    requireDebugListAfter,
  );

  return (
    <Accordion defaultValue={mergedDebugListByVersion.map((item) => item.pageKey)} type="multiple">
      {mergedDebugListByVersion.map((pageItem) => (
        <DebugAccordionItem
          afterDebugList={pageItem.afterDebugList}
          afterLabel={labelAfter}
          beforeDebugList={pageItem.beforeDebugList}
          beforeLabel={labelBefore}
          key={pageItem.pageKey}
          label={pageItem.label}
          type={type}
          value={pageItem.pageKey}
        />
      ))}
    </Accordion>
  );
};

const getRemodelingDebugList = (debugList: TDebugErrorSetRemodelingItem) => {
  const pageKeys = Object.keys(debugList) as (keyof TDebugErrorSetRemodelingItem)[];
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
      label: DEBUG_LABEL_BY_REMODELING[pageKey],
      pageKey: pageKey,
    };
  });

  return result;
};

export const mergeDebugListByVersion = (
  beforeList: ReturnType<typeof getRemodelingDebugList>,
  afterList: ReturnType<typeof getRemodelingDebugList>,
) => {
  const pageKeysSet = new Set([
    ...afterList.map((item) => item.pageKey),
    ...beforeList.map((item) => item.pageKey),
  ]);

  return Array.from(pageKeysSet)
    .map((pageKey) => {
      const beforeItem = beforeList.find((item) => item.pageKey === pageKey);
      const afterItem = afterList.find((item) => item.pageKey === pageKey);

      return {
        afterDebugList: afterItem?.debugList || [],
        beforeDebugList: beforeItem?.debugList || [],
        label: beforeItem?.label || afterItem?.label || "",
        pageKey,
      };
    })
    .filter((item) => item.beforeDebugList.length > 0 || item.afterDebugList.length > 0);
};
