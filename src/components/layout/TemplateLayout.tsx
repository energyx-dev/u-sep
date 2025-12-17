import { ReactNode } from "react";

interface IProps {
  children?: ReactNode;
  headerNode?: ReactNode;
}

export const TemplateLayout = ({ children, headerNode }: IProps) => {
  return (
    <section className="mx-7 my-6 flex min-h-[768px] min-w-[960px] flex-col gap-6 rounded-md bg-white">
      {headerNode && <header className="flex flex-col gap-3">{headerNode}</header>}
      {children}
    </section>
  );
};
