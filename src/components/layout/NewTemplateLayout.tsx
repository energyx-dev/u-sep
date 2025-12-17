import { ReactNode } from "react";

interface IProps {
  children?: ReactNode;
  headerNode?: ReactNode;
}

export const NewTemplateLayout = ({ children, headerNode }: IProps) => {
  return (
    <div className="flex min-h-[768px] w-full flex-col gap-6 rounded-md bg-white">
      {headerNode && <header className="flex flex-col gap-3">{headerNode}</header>}
      {children}
    </div>
  );
};
