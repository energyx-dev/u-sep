from typing import Dict, Any
from pydantic import BaseModel

class EnergyUses(BaseModel):
    total: list[float]
    cooling: list[float]
    heating: list[float]
    hotwater: list[float]
    lighting: list[float]
    circulation: list[float]

class BeforeAfterEnergyUses(BaseModel):
    before: EnergyUses
    after: EnergyUses


class KPIResult(BaseModel):
    energy_saving_rate: float
    primary_energy_saving_rate: float
    co2_saving_rate: float
    tree_planting_effect: float
    forest_preservation_effect: float
    car_replacement_effect: float

class CostRow(BaseModel):
    gr_before: float
    gr_after: float
    diff: float       # 증감 = 리모델링 전 - 리모델링 후 (양수면 절감 금액)
    diff_rate: float  # 증감률 = (리모델링 후 - 리모델링 전) / 리모델링 전 * 100

class AllCost(BaseModel):
    energy_usage_cost: CostRow  # 에너지 사용 요금
    saving_cost: CostRow        # 절감 요금
    final_cost: CostRow


class UseCost(BaseModel):
    cooling: CostRow       # 냉방
    heating: CostRow       # 난방
    lighting: CostRow      # 조명
    hotwater: CostRow      # 급탕
    circulation: CostRow   # 환기


class EnergySourceCost(BaseModel):
    electricity: CostRow        # 전기
    district_heating: CostRow   # 지역난방
    oil: CostRow                # 유류
    natural_gas: CostRow        # 가스

class MonthlyTotalCost(BaseModel):
    gr_before: list[float]
    gr_after: list[float]
    diff: list[float]
    diff_rate: list[float]

class RunEngineResponse(BaseModel):
    before: Dict[str, Any]   # grr 전체 내용 (before)
    after: Dict[str, Any]    # grr 전체 내용 (after)
    results: KPIResult        # KPI 결과
    site_uses: BeforeAfterEnergyUses # 에너지 소요량
    source_uses: BeforeAfterEnergyUses # 1차 에너지 소요량
    co2: BeforeAfterEnergyUses  # 온실가스 배출량
    cooling_uses: Dict[str, Any] # 냉방 소요량
    heating_uses: Dict[str, Any] # 난방 소요량
    hotwater_uses: Dict[str, Any] # 급탕 소요량
    lighting_uses: Dict[str, Any] # 조명 소요량
    circulation_uses: Dict[str, Any] # 환기 소요량
    generators_uses: Dict[str, Any] # 태양광 발전량
    all_cost: AllCost
    monthly_total_cost: MonthlyTotalCost
    use_cost: UseCost
    energy_source_cost: EnergySourceCost
