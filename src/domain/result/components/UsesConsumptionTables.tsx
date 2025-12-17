import { NewChartTableUI } from "@/domain/result/components/chart/NewChartTableUI";
import { TResultSchemaV2 } from "@/schemas/result.schema";

interface IProps {
  data:
    | TResultSchemaV2["circulation_uses"]
    | TResultSchemaV2["cooling_uses"]
    | TResultSchemaV2["generators_uses"]
    | TResultSchemaV2["heating_uses"]
    | TResultSchemaV2["hotwater_uses"]
    | TResultSchemaV2["lighting_uses"];
}

export const UsesConsumptionTables = ({ data }: IProps) => {
  const { after, after_total, before_total } = data;

  const to2 = (v: number | undefined) => Number((v ?? 0).toFixed(2));
  const A = after as Record<string, number[]>;

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}월`,
    // Bar stacks → after (energy sources)
    districtheating: to2(A.DISTRICTHEATING?.[i]),
    electricity: to2(A.ELECTRICITY?.[i]),
    naturalgas: to2(A.NATURALGAS?.[i]),
    oil: to2(A.OIL?.[i]),
    // Line → before_total
    afterTotal: to2(after_total?.[i]),
    beforeTotal: to2(before_total?.[i]),
  }));

  return <NewChartTableUI chartData={chartData} isConsumption unit={"kWh/m²"} />;
};
