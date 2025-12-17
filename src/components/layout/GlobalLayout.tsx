import { Outlet } from "react-router-dom";

import { GlobalGnb } from "@/components/custom/gnb/GlobalGnb";

export const GlobalLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalGnb />
      <div className="bg-background flex flex-1 flex-col p-0 pt-[50px]">
        <Outlet />
      </div>
    </div>
  );
};
