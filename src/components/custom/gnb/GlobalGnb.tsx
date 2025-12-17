import { version } from "package.json";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "@/assets/logo.svg";
import { useGnbHeader } from "@/components/custom/gnb/file-manage/useGnbHeader";
import { SaveBeforeLeaveDialog } from "@/components/dialog/SaveBeforeLeaveDialog";

export const GlobalGnb = () => {
  const navigate = useNavigate();
  const { isDirty, originHeaderText, subText, viewHeaderText } = useGnbHeader();

  const [open, setOpen] = useState<boolean>(false);

  const handleLogoClick = () => {
    if (isDirty) {
      setOpen(true);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <header className="bg-background fixed top-0 z-20 flex h-[50px] w-full flex-col justify-center border-b">
        <div className="relative flex h-9 w-full items-center justify-between p-2.5">
          <button
            className="cursor-pointer border-none bg-transparent p-0"
            onClick={handleLogoClick}
          >
            <img alt="logo" src={logo} />
          </button>
          <div className="center absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
            <h1 className="text-neutral560 text-sm font-medium" title={originHeaderText}>
              {viewHeaderText}
            </h1>
            {subText && <p className="text-neutral400 text-sm">{`- ${subText}`}</p>}
          </div>
          <p className="text-neutral400 text-sm">v{version}</p>
        </div>
      </header>

      <SaveBeforeLeaveDialog
        fileName={originHeaderText}
        onOpenChange={setOpen}
        onSuccess={() => navigate("/")}
        open={open}
        title="홈으로 이동"
      />
    </>
  );
};
