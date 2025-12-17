import { EnergySourceKeyEnum } from "@/domain/result/constants/result.enum";

export const getEnergySourceMonthlySums = (
  ...datasets: Partial<Record<EnergySourceKeyEnum, number[]>>[]
): Record<EnergySourceKeyEnum, number[]> => {
  const sources = Object.values(EnergySourceKeyEnum);

  const result: Record<EnergySourceKeyEnum, number[]> = Object.fromEntries(
    sources.map((key) => [key, Array(12).fill(0)]),
  ) as Record<EnergySourceKeyEnum, number[]>;

  for (const dataset of datasets) {
    for (const source of sources) {
      const values = dataset[source];
      if (Array.isArray(values)) {
        for (let i = 0; i < 12; i++) {
          result[source][i] += values[i] ?? 0;
        }
      }
    }
  }

  return result;
};
