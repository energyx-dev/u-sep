import { ChartTableUI } from "@/domain/result/components/chart/ChartTableUI";
import { ConstantEnergyKeyEnum, UseCategoryKeyEnum } from "@/domain/result/constants/result.enum";
import { getEnergySourceMonthlySums } from "@/domain/result/helpers/helper";
import { TGrrSchema } from "@/schemas/result.schema";

interface IProps {
  data: {
    after: TGrrSchema;
    before: TGrrSchema;
  };
  labelKey: UseCategoryKeyEnum;
}
export const EnergyConsumptionTables = ({ data, labelKey }: IProps) => {
  const { after, before } = data;

  const beforeSiteUsesData = before.site_uses[labelKey] ?? {};
  const beforeSourceUsesData = before.source_uses[labelKey] ?? {};
  const beforeCo2Data = before.co2[labelKey] ?? {};

  const afterSiteUsesData = after.site_uses[labelKey] ?? {};
  const afterSourceUsesData = after.source_uses[labelKey] ?? {};
  const afterCo2Data = after.co2[labelKey] ?? {};

  const beforeMonthlySums = getEnergySourceMonthlySums(
    beforeSiteUsesData,
    beforeSourceUsesData,
    beforeCo2Data,
  );

  const afterMonthlySums = getEnergySourceMonthlySums(
    afterSiteUsesData,
    afterSourceUsesData,
    afterCo2Data,
  );

  return (
    <>
      <ChartTableUI
        after={afterMonthlySums}
        before={beforeMonthlySums}
        energyKey={ConstantEnergyKeyEnum.ELECTRICITY}
      />
      <ChartTableUI
        after={afterMonthlySums}
        before={beforeMonthlySums}
        energyKey={ConstantEnergyKeyEnum.DISTRICT_HEATING}
      />
      <ChartTableUI
        after={afterMonthlySums}
        before={beforeMonthlySums}
        energyKey={ConstantEnergyKeyEnum.OIL}
      />
      <ChartTableUI
        after={afterMonthlySums}
        before={beforeMonthlySums}
        energyKey={ConstantEnergyKeyEnum.NATURAL_GAS}
      />
    </>
  );
};
