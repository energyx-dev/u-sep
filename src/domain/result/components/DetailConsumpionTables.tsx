import { NewChartTableUI } from "@/domain/result/components/chart/NewChartTableUI";

interface DetailEnergySeries {
  [key: string]: number[] | undefined;
}

interface IProps {
  data: {
    after: DetailEnergySeries; // keys should align with EnergySourceKeyEnum (ELECTRICITY, NATURALGAS, OIL, DISTRICTHEATING)
    before: DetailEnergySeries;
    title: string;
    unit: string;
  };
}

export const DetailConsumpionTables = ({ data }: IProps) => {
  const { after, before, unit } = data;

  const to2 = (v: number | undefined) => Number((v ?? 0).toFixed(2));
  const A = after as Record<string, number[]>;
  const B = before as Record<string, number[]>;

  // Build chartData that NewChartTableUI will consume
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    afterTotal: to2(A.total?.[i]),
    beforeTotal: to2(B.total?.[i]),
    circulation: to2(A.circulation?.[i]),
    cooling: to2(A.cooling?.[i]),
    heating: to2(A.heating?.[i]),
    hotwater: to2(A.hotwater?.[i]),
    label: `${i + 1}월`,
    lightning: to2(A.lighting?.[i]), // source key 'lighting'
  }));

  return <NewChartTableUI chartData={chartData} unit={unit} />;
};
