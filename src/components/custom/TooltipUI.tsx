import { CircleHelpIcon, InfoIcon, Link2Icon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ACCORDION_STYLES } from "@/domain/shape-info/components/snb/accordion.constants";
import { cn } from "@/lib/utils";

interface Props {
  text?: string;
}

export const TooltipUI = ({ text }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon className="text-bk6" size={16} />
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-2xs text-white">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const TooltipUIWithQuestion = ({ text }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleHelpIcon className="text-white" fill="hsla(0, 0%, 64%, 1)" size={16} />
      </TooltipTrigger>
      <TooltipContent className="max-w-[165px]" variant="light">
        <p className="bk7 text-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const TooltipUIWithAdjacent = ({ text }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link2Icon className={cn(ACCORDION_STYLES.iconSize, "text-primary rotate-135")} />
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm text-white">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};
