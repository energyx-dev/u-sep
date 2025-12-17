import { formatToKoreanNumber } from "@toss/utils";

import car from "@/assets/result/car.png";
import tree from "@/assets/result/tree.png";
import trees from "@/assets/result/trees.png";
import { ResultItemTitle } from "@/domain/result/components/ResultItemTitle";
import { EResultEffect } from "@/domain/result/constants/result.enum";
import { RESULT_EFFECT_LABEL } from "@/domain/result/constants/result.label";
import { TResultSchemaV2 } from "@/schemas/result.schema";

interface IProps {
  labelKey: keyof typeof RESULT_EFFECT_LABEL;
  results: TResultSchemaV2["results"];
}

export const EffectCardComponent = ({ labelKey, results }: IProps) => {
  const EFFECT_MAP = {
    [EResultEffect.FOREST_CREATION]: {
      image: trees,
      value: results.forest_preservation_effect.toFixed(0),
    },
    [EResultEffect.PLANTING_EFFECT]: {
      image: tree,
      value: results.tree_planting_effect.toFixed(0),
    },
    [EResultEffect.REPLACEMENT_OF_CARS]: {
      image: car,
      value: results.car_replacement_effect.toFixed(0),
    },
  } satisfies Record<EResultEffect, { image: string; value: string }>;

  const { image, value } = EFFECT_MAP[labelKey] || { image: "", value: "0" };
  const { title, unit } = RESULT_EFFECT_LABEL[labelKey];
  const isNotReplacementOfCars = labelKey !== EResultEffect.REPLACEMENT_OF_CARS;

  return (
    <div className="flex flex-1 flex-col justify-between gap-3 bg-white">
      <ResultItemTitle
        title={title}
        unit={isNotReplacementOfCars ? "소나무" : ""}
        unitLabel="기준"
      />
      <div className="flex h-40 items-center justify-between">
        <img src={image} />
        <div className="text-primary flex flex-col items-end font-bold">
          <span className="text-[42px] leading-none font-extrabold">
            {(() => {
              const formatted = formatToKoreanNumber(Number(value));
              if (formatted.includes("억")) {
                const [eokPart] = formatted.split("억");
                return `${eokPart}억`;
              }
              if (formatted.includes("만")) {
                const [manPart] = formatted.split("만");
                return `${manPart}만`;
              }
              return formatted;
            })()}
          </span>
          <span className="text-2xl">{unit}</span>
        </div>
      </div>
    </div>
  );
};
