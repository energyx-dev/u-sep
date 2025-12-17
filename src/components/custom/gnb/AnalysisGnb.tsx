import { ToolbarButton } from "@/components/buttons/ToolbarButton";
import { useGnbFileManage } from "@/components/custom/gnb/file-manage/useGnbFileManage";
import { GuideVideo } from "@/components/custom/GuideVideo";
import { SaveBeforeLeaveDialog } from "@/components/dialog/SaveBeforeLeaveDialog";
import { Separator } from "@/components/ui/separator";
import { ResultDialog } from "@/domain/result/components/ResultDialog";

export const AnalysisGnb = () => {
  const { features, files, guides, leaveDialog, resultDialog } = useGnbFileManage();

  return (
    <>
      <div className="fixed z-10 w-full bg-white">
        <div className="flex items-center justify-between gap-4 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {files.map((file) => {
                if (!file.visible) return null;
                return (
                  <ToolbarButton disabled={file.disabled} key={file.label} onClick={file.onClick}>
                    {file.icon}
                    <span>{file.label}</span>
                  </ToolbarButton>
                );
              })}
            </div>
            <div className="bg-neutral160 h-[20px] w-[1px]" />
            <div className="flex items-center gap-3">
              {features.map((feature) => {
                if (!feature.visible) return null;
                return (
                  <ToolbarButton
                    disabled={feature.disabled}
                    key={feature.label}
                    onClick={feature.onClick}
                  >
                    {feature.icon}
                    <span>{feature.label}</span>
                  </ToolbarButton>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-5 items-center gap-3">
              {guides.map((guide) => {
                if (!guide.visible) return null;
                return (
                  <ToolbarButton
                    disabled={guide.disabled}
                    key={guide.label}
                    onClick={guide.onClick}
                  >
                    {guide.icon}
                    <span>{guide.label}</span>
                  </ToolbarButton>
                );
              })}
              <Separator orientation="vertical" />
              <GuideVideo />
            </div>
          </div>
        </div>
        <Separator className="bg-primary" />
      </div>

      {/* Dialog */}
      {resultDialog.isOpen && resultDialog.result && (
        <ResultDialog
          data={resultDialog.result}
          isOpen={resultDialog.isOpen}
          onClose={resultDialog.close}
        />
      )}

      <SaveBeforeLeaveDialog
        fileName={leaveDialog.fileName}
        onOpenChange={leaveDialog.onOpenChange}
        onSuccess={leaveDialog.onSuccess}
        open={leaveDialog.open}
        title={leaveDialog.title}
      />
    </>
  );
};
