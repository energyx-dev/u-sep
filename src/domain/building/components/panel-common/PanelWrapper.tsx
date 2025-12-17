import { ReactNode } from "react";

interface IProps {
  children?: ReactNode;
  headerNode?: ReactNode;
}

export const PanelWrapper = ({ children, headerNode }: IProps) => {
  return (
    <div className="flex h-[470px] min-w-[316px] flex-col gap-1 overflow-auto">
      {headerNode}
      <div className="flex-1 overflow-auto rounded-[4px] border">{children}</div>
    </div>
  );
};
