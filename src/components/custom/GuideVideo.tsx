import { useEffect, useState } from "react";

import { ToolbarButton } from "@/components/buttons/ToolbarButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const GuideVideo = () => {
  const [videoSrc, setVideoSrc] = useState<string>("");

  useEffect(() => {
    const isElectron =
      typeof window !== "undefined" && typeof window.fileApi?.getGuideVideoPath === "function";

    if (isElectron) {
      window.fileApi?.getGuideVideoPath().then((path: string) => {
        setVideoSrc(`file://${path}`);
      });
    } else {
      setVideoSrc("/U-SEP_Tutorial.mp4");
    }
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ToolbarButton>가이드 영상 보기</ToolbarButton>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="sm:max-w-[991px]" isClose={false}>
        <DialogHeader>
          <DialogTitle>가이드 영상</DialogTitle>
        </DialogHeader>

        <video autoPlay controls preload="metadata" src={videoSrc} />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
