import { z } from "zod";

import {
  ConstantEnergyKeyEnum,
  EnergySourceKeyEnum,
  UseCategoryKeyEnum,
} from "@/domain/result/constants/result.enum";

export const ConstantEnergyKeyNativeEnum = z.nativeEnum(ConstantEnergyKeyEnum);
export const EnergySourceNativeEnum = z.nativeEnum(EnergySourceKeyEnum);
export const UseCategoryNativeEnum = z.nativeEnum(UseCategoryKeyEnum);

const FiniteNumber = z.number().finite();

export const grrSchema = z.object({
  building: z.object({
    address: z.string().optional(),
    name: z.string().optional(),
    north_axis: z.number().optional(),
    total_area: FiniteNumber,
    vintage: z.string().optional(),
  }),
  co2: z.record(
    UseCategoryNativeEnum,
    z.record(EnergySourceNativeEnum, z.array(FiniteNumber).length(12)),
  ),
  constants: z.object({
    site2co2: z.record(ConstantEnergyKeyNativeEnum, FiniteNumber),
    site2cost: z.record(ConstantEnergyKeyNativeEnum, FiniteNumber),
    site2source: z.record(ConstantEnergyKeyNativeEnum, FiniteNumber),
  }),
  cost: z.record(
    UseCategoryNativeEnum,
    z.record(EnergySourceNativeEnum, z.array(FiniteNumber).length(12)),
  ),
  site_uses: z.record(
    UseCategoryNativeEnum,
    z.record(EnergySourceNativeEnum, z.array(FiniteNumber).length(12)),
  ),
  source_uses: z.record(
    UseCategoryNativeEnum,
    z.record(EnergySourceNativeEnum, z.array(FiniteNumber).length(12)),
  ),
  summary_gross: z.object({
    co2: z.object({
      circulation: FiniteNumber,
      cooling: FiniteNumber,
      DISTRICTHEATING: FiniteNumber,
      ELECTRICITY: FiniteNumber,
      generators: FiniteNumber,
      heating: FiniteNumber,
      hotwater: FiniteNumber,
      lighting: FiniteNumber,
      NATURALGAS: FiniteNumber,
      OIL: FiniteNumber,
      total_annual: FiniteNumber,
      total_monthly: z.array(FiniteNumber).length(12),
    }),
    cost: z.object({
      circulation: FiniteNumber,
      cooling: FiniteNumber,
      DISTRICTHEATING: FiniteNumber,
      ELECTRICITY: FiniteNumber,
      generators: FiniteNumber,
      heating: FiniteNumber,
      hotwater: FiniteNumber,
      lighting: FiniteNumber,
      NATURALGAS: FiniteNumber,
      OIL: FiniteNumber,
      total_annual: FiniteNumber,
      total_monthly: z.array(FiniteNumber).length(12),
    }),
    site_uses: z.object({
      circulation: FiniteNumber,
      cooling: FiniteNumber,
      DISTRICTHEATING: FiniteNumber,
      ELECTRICITY: FiniteNumber,
      generators: FiniteNumber,
      heating: FiniteNumber,
      hotwater: FiniteNumber,
      lighting: FiniteNumber,
      NATURALGAS: FiniteNumber,
      OIL: FiniteNumber,
      total_annual: FiniteNumber,
      total_monthly: z.array(FiniteNumber).length(12),
    }),
    source_uses: z.object({
      circulation: FiniteNumber,
      cooling: FiniteNumber,
      DISTRICTHEATING: FiniteNumber,
      ELECTRICITY: FiniteNumber,
      generators: FiniteNumber,
      heating: FiniteNumber,
      hotwater: FiniteNumber,
      lighting: FiniteNumber,
      NATURALGAS: FiniteNumber,
      OIL: FiniteNumber,
      total_annual: FiniteNumber,
      total_monthly: z.array(FiniteNumber).length(12),
    }),
  }),
  summary_per_area: z.object({
    co2: z.object({
      circulation: FiniteNumber,
      cooling: FiniteNumber,
      DISTRICTHEATING: FiniteNumber,
      ELECTRICITY: FiniteNumber,
      generators: FiniteNumber,
      heating: FiniteNumber,
      hotwater: FiniteNumber,
      lighting: FiniteNumber,
      NATURALGAS: FiniteNumber,
      OIL: FiniteNumber,
      total_annual: FiniteNumber,
      total_monthly: z.array(FiniteNumber).length(12),
    }),
    cost: z.object({
      circulation: FiniteNumber,
      cooling: FiniteNumber,
      DISTRICTHEATING: FiniteNumber,
      ELECTRICITY: FiniteNumber,
      generators: FiniteNumber,
      heating: FiniteNumber,
      hotwater: FiniteNumber,
      lighting: FiniteNumber,
      NATURALGAS: FiniteNumber,
      OIL: FiniteNumber,
      total_annual: FiniteNumber,
      total_monthly: z.array(FiniteNumber).length(12),
    }),
    site_uses: z.object({
      circulation: FiniteNumber,
      cooling: FiniteNumber,
      DISTRICTHEATING: FiniteNumber,
      ELECTRICITY: FiniteNumber,
      generators: FiniteNumber,
      heating: FiniteNumber,
      hotwater: FiniteNumber,
      lighting: FiniteNumber,
      NATURALGAS: FiniteNumber,
      OIL: FiniteNumber,
      total_annual: FiniteNumber,
      total_monthly: z.array(FiniteNumber).length(12),
    }),
    source_uses: z.object({
      circulation: FiniteNumber,
      cooling: FiniteNumber,
      DISTRICTHEATING: FiniteNumber,
      ELECTRICITY: FiniteNumber,
      generators: FiniteNumber,
      heating: FiniteNumber,
      hotwater: FiniteNumber,
      lighting: FiniteNumber,
      NATURALGAS: FiniteNumber,
      OIL: FiniteNumber,
      total_annual: FiniteNumber,
      total_monthly: z.array(FiniteNumber).length(12),
    }),
  }),
});

export const resultSchema = z.object({
  after: grrSchema,
  before: grrSchema,
  results: z.object({
    car_replacement_effect: FiniteNumber,
    co2_saving_rate: FiniteNumber,
    energy_saving_rate: FiniteNumber,
    forest_preservation_effect: FiniteNumber,
    primary_energy_saving_rate: FiniteNumber,
    tree_planting_effect: FiniteNumber,
  }),
});

// export type EnergySourceKey = (typeof EnergySourceEnum)["Enum"];
export type TGrrSchema = z.infer<typeof grrSchema>;
export type TResultSchema = z.infer<typeof resultSchema>;

// export type UseCategoryKey = (typeof UseCategoryEnum)["Enum"];

// -----------------------------
// V2 Output Schema (based on response JSON)
// -----------------------------

// Reuse the finite monthly array definition for readability
const Monthly12 = z.array(FiniteNumber).length(12);

// Per-metric monthly breakdown used by site_uses / source_uses / co2 at the top level
export const resultMonthlyBreakdownV2 = z.object({
  after: z.object({
    circulation: Monthly12,
    cooling: Monthly12,
    heating: Monthly12,
    hotwater: Monthly12,
    lighting: Monthly12,
    total: Monthly12,
  }),
  before: z.object({
    circulation: Monthly12,
    cooling: Monthly12,
    heating: Monthly12,
    hotwater: Monthly12,
    lighting: Monthly12,
    total: Monthly12,
    // generators is intentionally omitted because it is not present in the provided JSON
  }),
});

// Energy-source buckets for before/after breakdowns inside each *_uses section
const EnergySourceBuckets12 = z.object({
  DISTRICTHEATING: Monthly12,
  ELECTRICITY: Monthly12,
  NATURALGAS: Monthly12,
  OIL: Monthly12,
});

// Per-category energy uses schema (e.g., cooling_uses, heating_uses, ...)
export const resultCategoryEnergyUsesV2 = z.object({
  after: EnergySourceBuckets12,
  after_total: Monthly12,
  before: EnergySourceBuckets12,
  before_total: Monthly12,
});

const CostDetailSchema = z.object({
  diff: FiniteNumber,
  diff_rate: FiniteNumber,
  gr_after: FiniteNumber,
  gr_before: FiniteNumber,
});

const resultAllCost = z.object({
  energy_usage_cost: CostDetailSchema,
  final_cost: CostDetailSchema,
  saving_cost: CostDetailSchema,
});

export type TResultAllCost = z.infer<typeof resultAllCost>;

const resultMonthlyCost = z.object({
  diff: Monthly12,
  diff_rate: Monthly12,
  gr_after: Monthly12,
  gr_before: Monthly12,
});

export type TResultMonthlyCost = z.infer<typeof resultMonthlyCost>;

const resultUseCost = z.object({
  circulation: CostDetailSchema,
  cooling: CostDetailSchema,
  heating: CostDetailSchema,
  hotwater: CostDetailSchema,
  lighting: CostDetailSchema,
});

export type TResultUseCost = z.infer<typeof resultUseCost>;

const resultEnergySourceCost = z.object({
  district_heating: CostDetailSchema,
  electricity: CostDetailSchema,
  natural_gas: CostDetailSchema,
  oil: CostDetailSchema,
});

export type TResultEnergySourceCost = z.infer<typeof resultEnergySourceCost>;

// Full V2 result object
export const resultSchemaV2 = z.object({
  after: grrSchema,
  before: grrSchema,
  results: z.object({
    car_replacement_effect: FiniteNumber,
    co2_saving_rate: FiniteNumber,
    energy_saving_rate: FiniteNumber,
    forest_preservation_effect: FiniteNumber,
    primary_energy_saving_rate: FiniteNumber,
    tree_planting_effect: FiniteNumber,
  }),
  // Top-level monthly breakdowns (already aggregated per category)
  all_cost: resultAllCost,
  circulation_uses: resultCategoryEnergyUsesV2,
  co2: resultMonthlyBreakdownV2,
  cooling_uses: resultCategoryEnergyUsesV2,
  energy_source_cost: resultEnergySourceCost,
  generators_uses: resultCategoryEnergyUsesV2,
  heating_uses: resultCategoryEnergyUsesV2,
  hotwater_uses: resultCategoryEnergyUsesV2,
  lighting_uses: resultCategoryEnergyUsesV2,
  monthly_total_cost: resultMonthlyCost,
  site_uses: resultMonthlyBreakdownV2,
  source_uses: resultMonthlyBreakdownV2,
  use_cost: resultUseCost,
});

export type TResultSchemaV2 = z.infer<typeof resultSchemaV2>;
