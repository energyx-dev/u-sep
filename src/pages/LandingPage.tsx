import { useNavigate } from "react-router-dom";

import logo from "@/assets/landing_logo.svg";
import { ToolbarButton } from "@/components/buttons/ToolbarButton";
import { useFileManage } from "@/components/custom/gnb/file-manage/useFileManage";
import { GuideVideo } from "@/components/custom/GuideVideo";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator";
import { STEP_PATH } from "@/constants/routes";
import { downloadManualPdf } from "@/lib/guides";

const TEXT = {
  FOOTER: "U-SEP Made in Korea",
  SUBTITLE: "Your Simplified EnergyPlus",
  TITLE: "U-SEP",
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { loadFile, newFile } = useFileManage();

  const handleLoadFile = () => {
    loadFile(() => {
      navigate(STEP_PATH.BASIC_INFO.path);
    });
  };

  const handleNewFile = () => {
    newFile();
    navigate(STEP_PATH.BASIC_INFO.path);
  };

  return (
    <div className="flex min-h-[600px] min-w-[720px] flex-1 items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-32">
        <div className="flex flex-1 flex-col items-center justify-center gap-36">
          <div className="flex flex-col items-center gap-15">
            <img alt="signature-logo" src={logo} />
            <div className="flex flex-col items-center gap-4">
              <p className="text-primary text-6xl font-bold">{TEXT.TITLE}</p>
              <p className="text-neutral480 text-4xl">{TEXT.SUBTITLE}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-12">
            <div className="flex gap-3">
              <Button
                className="px-7 py-4 text-base leading-none font-semibold"
                onClick={handleLoadFile}
                variant={"outline"}
              >
                파일 열기
              </Button>
              <Button
                className="px-7 py-4 text-base leading-none font-semibold"
                onClick={handleNewFile}
              >
                새 파일
              </Button>
            </div>
            <div className="flex h-5 items-center gap-3">
              <ToolbarButton onClick={downloadManualPdf}>매뉴얼 PDF 다운로드</ToolbarButton>
              <Separator orientation="vertical" />
              <GuideVideo />
            </div>
          </div>
        </div>
        <p className="text-neutral320 text-sm font-medium">{TEXT.FOOTER}</p>
      </div>
    </div>
  );
};

export default LandingPage;
