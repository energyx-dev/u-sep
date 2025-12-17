import { ExternalLinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface IProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const NavigationButton = ({ children, onClick }: IProps) => {
  return (
    <Button
      className="border-neutral160 text-neutral560 hover:bg-neutral080 gap-1 px-1.5 py-1 has-[>svg]:px-1.5"
      onClick={onClick}
      variant={"outline"}
    >
      {children}
      <ExternalLinkIcon className="text-neutral320" />
    </Button>
  );
};
