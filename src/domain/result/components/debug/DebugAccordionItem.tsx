import { useNavigate } from "react-router-dom";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface IProps {
  afterDebugList?: {
    message: string;
    path: string;
  }[];
  afterLabel?: string;
  beforeDebugList?: {
    message: string;
    path: string;
  }[];
  beforeLabel?: string;
  debugList?: {
    message: string;
    path: string;
  }[];
  label: string;
  type: "optional" | "required";
  value: string;
}

export const DebugAccordionItem = ({
  afterDebugList = [],
  afterLabel,
  beforeDebugList = [],
  beforeLabel,
  debugList = [],
  label,
  type,
  value,
}: IProps) => {
  const navigate = useNavigate();

  const isRemodelingVersion = beforeDebugList.length > 0 || afterDebugList.length > 0;
  const totalCount = isRemodelingVersion
    ? beforeDebugList.length + afterDebugList.length
    : debugList.length;

  if (totalCount === 0) return null;

  const isRequired = type === "required";

  return (
    <Accordion defaultValue={[value]} type="multiple">
      <AccordionItem className="rounded-[4px] border p-2" value={value}>
        <AccordionTrigger className="text-neutral640 cursor-pointer flex-row-reverse items-center justify-end gap-1 p-0 text-sm hover:no-underline">
          <div className="flex flex-1 items-center justify-between">
            <p>{label}</p>
            <p
              className={cn(
                "rounded-[4px] px-2 py-1 text-[13px] font-medium text-white",
                isRequired ? "bg-negative" : "bg-pantone377-c",
              )}
            >
              {totalCount}개 {isRequired ? "위치" : "항목"}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-3 px-2 py-0">
          {!isRemodelingVersion && debugList.length > 0 && (
            <div>
              <Separator className="my-2" />
              <div className="flex flex-col gap-1">
                {debugList.map((item, index) => (
                  <button
                    className="text-neutral560 hover:bg-bk3 cursor-pointer rounded-xs px-2 py-1 text-start text-xs transition-all"
                    key={`common-${index}-${item.message}`}
                    onClick={() => {
                      navigate(item.path);
                    }}
                    type="button"
                  >
                    {item.message}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 리모델링 전 */}
          {isRemodelingVersion && beforeDebugList.length > 0 && (
            <div>
              <Separator className="my-2" />
              <div className="flex flex-col gap-1">
                <p className="text-neutral640 px-2 py-1 text-sm font-medium">{beforeLabel}</p>
                <div className="flex flex-col gap-1">
                  {beforeDebugList.map((item, index) => (
                    <button
                      className="text-neutral560 hover:bg-bk3 cursor-pointer rounded-xs px-2 py-1 text-start text-xs transition-all"
                      key={`before-${index}-${item.message}`}
                      onClick={() => {
                        navigate(item.path);
                      }}
                      type="button"
                    >
                      {item.message}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 리모델링 후 */}
          {isRemodelingVersion && afterDebugList.length > 0 && (
            <div>
              {beforeDebugList.length === 0 && <Separator className="my-2" />}
              <div className="flex flex-col gap-1">
                <p className="text-neutral640 px-2 py-1 text-sm font-medium">{afterLabel}</p>
                <div className="flex flex-col gap-1">
                  {afterDebugList.map((item, index) => (
                    <button
                      className="text-neutral560 hover:bg-bk3 cursor-pointer rounded-xs px-2 py-1 text-start text-xs transition-all"
                      key={`after-${index}-${item.message}`}
                      onClick={() => {
                        navigate(item.path);
                      }}
                      type="button"
                    >
                      {item.message}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
