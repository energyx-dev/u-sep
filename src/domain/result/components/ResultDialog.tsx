import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChartComponent } from "@/domain/result/components/BarChartComponent";
import { BuildingInfoCard } from "@/domain/result/components/BuildingInfoCard";
import { CostByEnergySource } from "@/domain/result/components/cost/CostByEnergySource";
import { CostByUsage } from "@/domain/result/components/cost/CostByUsage";
import { MonthlyCost } from "@/domain/result/components/cost/MonthlyCost";
import { TotalCost } from "@/domain/result/components/cost/TotalCost";
import { DetailConsumpionTables } from "@/domain/result/components/DetailConsumpionTables";
import { DetailStackedChartComponent } from "@/domain/result/components/DetailStackedChartComponent";
import { EffectCardComponent } from "@/domain/result/components/EffectCardComponent";
import { ResultSubtitle } from "@/domain/result/components/ResultSubtitle";
import { UsesConsumptionTables } from "@/domain/result/components/UsesConsumptionTables";
import { UsesStackedChartComponent } from "@/domain/result/components/UsesStackedChartComponent";
import { EResultEffect, EResults } from "@/domain/result/constants/result.enum";
import { RESULT_TOTAL_LABEL } from "@/domain/result/constants/result.label";
import { TResultSchemaV2 } from "@/schemas/result.schema";

interface IProps {
  data: TResultSchemaV2;
  isOpen: boolean;
  onClose: () => void;
}

// ---- NaN/Infinity guards ----
const safeNumber = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

const deepSanitizeNumbers = <T,>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map((v) =>
      typeof v === "number" ? safeNumber(v) : deepSanitizeNumbers(v),
    ) as unknown as T;
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [k, v]) => {
        // @ts-expect-error - dynamic assignment, shape preserved
        acc[k] = typeof v === "number" ? safeNumber(v) : deepSanitizeNumbers(v as never);
        return acc;
      },
      Array.isArray(obj) ? ([] as unknown[]) : ({} as Record<string, unknown>),
    ) as T;
  }
  return typeof obj === "number" ? (safeNumber(obj) as unknown as T) : obj;
};

export const ResultDialog = ({ data, isOpen, onClose }: IProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Sanitize all numeric fields to avoid NaN/Infinity propagating into charts/PDF
  const safeData = useMemo(() => deepSanitizeNumbers(data), [data]);
  const { after, before, results } = safeData;

  const detailSliceSiteUses = useMemo(
    () => ({
      after: safeData.site_uses.after,
      before: safeData.site_uses.before,
      title: RESULT_TOTAL_LABEL[EResults.SITE_USES].title,
      unit: "kWh/m²",
    }),
    [safeData.site_uses.after, safeData.site_uses.before],
  );

  const detailSliceSourceUses = useMemo(
    () => ({
      after: safeData.source_uses.after,
      before: safeData.source_uses.before,
      title: RESULT_TOTAL_LABEL[EResults.SOURCE_USES].title,
      unit: "kWh/m²",
    }),
    [safeData.source_uses.before, safeData.source_uses.after],
  );

  const detailSliceCO2 = useMemo(
    () => ({
      after: safeData.co2.after,
      before: safeData.co2.before,
      title: RESULT_TOTAL_LABEL[EResults.CO2].title,
      unit: "kgCO₂e/m²",
    }),
    [safeData.co2.after, safeData.co2.before],
  );

  const handleSavePDF = async () => {
    // Electron 환경 확인
    const isElectron = typeof window !== "undefined" && window.fileApi?.printToPDF;

    if (isElectron) {
      try {
        // Chart 렌더링 완료를 위해 대기
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 콘텐츠 복제 준비
        const printContainer = document.getElementById("pdf-print-container");
        if (printContainer) {
          printContainer.remove();
        }

        // 새로운 출력 컨테이너 생성
        const newPrintContainer = document.createElement("div");
        newPrintContainer.id = "pdf-print-container";
        newPrintContainer.className = "print-only";

        // 콘텐츠 복제
        const content = contentRef.current;
        if (content) {
          newPrintContainer.innerHTML = content.innerHTML;
        }

        document.body.appendChild(newPrintContainer);

        // DOM에 콘텐츠가 추가 대기
        await new Promise((resolve) => setTimeout(resolve, 100));

        const result = await window.fileApi.printToPDF();

        // 출력 컨테이너 제걱
        newPrintContainer.remove();

        if (result.success) {
          console.log("PDF 저장 완료:", result.path);
        } else {
          console.error("PDF 저장 실패:", result.error);
        }
      } catch (error) {
        console.error("PDF 저장 중 오류:", error);
        const printContainer = document.getElementById("pdf-print-container");
        if (printContainer) {
          printContainer.remove();
        }
      }
      return;
    }

    // Fallback to html2canvas + jsPDF for browser environment
    const container = contentRef.current;
    if (!container) return;

    const sections = document.querySelectorAll<HTMLElement>(".pdf-page");
    if (!sections.length) return;

    const pdf = new jsPDF({ format: "a4", orientation: "p", unit: "mm" });
    const pageWidthMm = pdf.internal.pageSize.getWidth();
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    const marginXmm = 10;
    const marginYmm = 15;
    const drawableWidthMm = pageWidthMm - marginXmm * 2;
    const drawableHeightMm = pageHeightMm - marginYmm * 2;

    let first = true;
    for (const section of sections) {
      // Render each section independently so it becomes exactly one PDF page
      const canvas = await html2canvas(section, {
        backgroundColor: "#ffffff",
        scale: Math.max(2, window.devicePixelRatio || 2),
        useCORS: true,
        windowHeight: section.scrollHeight,
        windowWidth: section.scrollWidth,
      });

      // Compute mm size preserving aspect ratio, while ensuring it fits within drawable area
      // Start by fitting width, then reduce width if height would overflow
      let imgWidthMm = drawableWidthMm;
      let imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      if (imgHeightMm > drawableHeightMm) {
        imgWidthMm = (drawableHeightMm * canvas.width) / canvas.height;
        imgHeightMm = drawableHeightMm;
      }

      const xMm = marginXmm + (drawableWidthMm - imgWidthMm) / 2; // center horizontally
      const yMm = marginYmm; // top margin

      if (!first) pdf.addPage();
      first = false;

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      pdf.addImage(imgData, "JPEG", xMm, yMm, imgWidthMm, imgHeightMm, undefined, "FAST");
    }

    pdf.save("분석_리포트.pdf");
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[90dvh] min-w-[980px] flex-col gap-12 overflow-auto p-8"
      >
        {/* 헤더 */}
        <DialogHeader>
          <DialogTitle className="decoration-primary text-3xl font-bold underline decoration-4 underline-offset-12">
            분석 리포트
          </DialogTitle>
        </DialogHeader>

        {/* 본문 */}
        <div className="flex flex-col gap-12" ref={contentRef}>
          <div className="pdf-page flex flex-col gap-12">
            <h1 className="decoration-primary print-only text-3xl font-bold underline decoration-4 underline-offset-12">
              분석 리포트
            </h1>

            {/* 건물 정보 */}
            <BuildingInfoCard data={after.building} />

            {/* 주요 지표 */}
            <div className="flex flex-col gap-6">
              <ResultSubtitle>주요 지표</ResultSubtitle>
              <div className="flex flex-col gap-12">
                <div className="flex gap-6">
                  <BarChartComponent
                    data={{
                      after: after.summary_per_area,
                      before: before.summary_per_area,
                      results,
                    }}
                    labelKey={EResults.SITE_USES}
                  />
                  <BarChartComponent
                    data={{
                      after: after.summary_per_area,
                      before: before.summary_per_area,
                      results,
                    }}
                    labelKey={EResults.SOURCE_USES}
                  />
                  <BarChartComponent
                    data={{
                      after: after.summary_per_area,
                      before: before.summary_per_area,
                      results,
                    }}
                    labelKey={EResults.CO2}
                  />
                </div>
                <div className="flex gap-6">
                  <EffectCardComponent labelKey={EResultEffect.PLANTING_EFFECT} results={results} />
                  <EffectCardComponent labelKey={EResultEffect.FOREST_CREATION} results={results} />
                  <EffectCardComponent
                    labelKey={EResultEffect.REPLACEMENT_OF_CARS}
                    results={results}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 상세 지표 */}
          <div className="pdf-page pdf-page-break flex flex-col gap-6">
            <ResultSubtitle>상세 지표</ResultSubtitle>
            <div className="flex flex-col gap-12">
              <div>
                <DetailStackedChartComponent data={detailSliceSiteUses} />
                <DetailConsumpionTables data={detailSliceSiteUses} />
              </div>
              <div>
                <DetailStackedChartComponent data={detailSliceSourceUses} />
                <DetailConsumpionTables data={detailSliceSourceUses} />
              </div>
              <div className="pdf-page-break pdf-gap">
                <DetailStackedChartComponent data={detailSliceCO2} />
                <DetailConsumpionTables data={detailSliceCO2} />
              </div>
            </div>
          </div>

          {/* 용도별 소요량 */}
          <div className="pdf-page flex flex-col gap-6">
            <ResultSubtitle>용도별 소요량</ResultSubtitle>
            <div className="flex flex-col gap-12">
              <div>
                <UsesStackedChartComponent data={data.cooling_uses} title={"냉방 소요량"} />
                <UsesConsumptionTables data={data.cooling_uses} />
              </div>
              <div className="pdf-page-break">
                <UsesStackedChartComponent data={data.heating_uses} title={"난방 소요량"} />
                <UsesConsumptionTables data={data.heating_uses} />
              </div>
              <div>
                <UsesStackedChartComponent data={data.hotwater_uses} title={"급탕 소요량"} />
                <UsesConsumptionTables data={data.hotwater_uses} />
              </div>
              <div className="pdf-page-break">
                <UsesStackedChartComponent data={data.lighting_uses} title={"조명 소요량"} />
                <UsesConsumptionTables data={data.lighting_uses} />
              </div>
              <div>
                <UsesStackedChartComponent data={data.circulation_uses} title={"환기 소요량"} />
                <UsesConsumptionTables data={data.circulation_uses} />
              </div>
            </div>
          </div>

          {/* 신재생 생산량 */}
          <div className="pdf-page pdf-page-break flex flex-col gap-6">
            <ResultSubtitle>신재생 생산량</ResultSubtitle>
            <div className="flex flex-col gap-12">
              <div>
                <UsesStackedChartComponent data={data.generators_uses} title={"태양광 발전량"} />
                <UsesConsumptionTables data={data.generators_uses} />
              </div>
            </div>
          </div>

          {/* 요금 */}
          <div className="pdf-page pdf-page-break flex flex-col gap-6">
            <ResultSubtitle description="KESIS(국가에너지통계), 2024년 기준 평균 단가 사용">
              요금
            </ResultSubtitle>
            <div className="flex flex-col gap-12">
              <TotalCost data={data.all_cost} />
              <MonthlyCost data={data.monthly_total_cost} />
              <div className="pdf-page-break flex gap-6">
                <CostByUsage data={data.use_cost} />
                <CostByEnergySource data={data.energy_source_cost} />
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <DialogFooter className="flex justify-center gap-2 p-2">
          <Button className="text-md px-7 py-4" onClick={onClose} variant="outline">
            닫기
          </Button>
          <Button className="text-md px-7 py-4" onClick={handleSavePDF}>
            PDF 저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
