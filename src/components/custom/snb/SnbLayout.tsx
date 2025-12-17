import { ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

export const SnbLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="border-primary fixed z-20 h-[calc(100dvh-44px-50px)] w-[260px] overflow-auto border-r bg-white">
      <ScrollArea className="h-full w-full">{children}</ScrollArea>
    </div>
  );
};
