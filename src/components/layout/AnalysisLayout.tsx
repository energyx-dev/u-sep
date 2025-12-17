import { Outlet } from "react-router-dom";

import { AnalysisGnb } from "@/components/custom/gnb/AnalysisGnb";
import { SideNavigationBar } from "@/components/custom/snb/SideNavigationBar";
import { SnbLayout } from "@/components/custom/snb/SnbLayout";

export const AnalysisLayout = () => {
  return (
    <div>
      <AnalysisGnb />
      <div className="pt-[45px]">
        <div className="flex min-w-[1024px] flex-1">
          <SnbLayout>
            <SideNavigationBar />
          </SnbLayout>
          <div className="text-neutral720 mx-auto ml-[260px] w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
