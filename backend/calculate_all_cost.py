from typing import Dict, Any

from calculate_cost_row import calculate_cost_row
from response import AllCost, CostRow


def calculate_all_cost(
    before_summary_gross: Dict[str, Any],
    after_summary_gross: Dict[str, Any],
) -> AllCost:
    before_cost = before_summary_gross.get("cost", {})
    after_cost = after_summary_gross.get("cost", {})

    # 1) 에너지 사용 요금
    energy_before = float(before_cost.get("total_annual", 0.0))
    energy_after = float(after_cost.get("total_annual", 0.0))

    # 2) 절감 요금
    saving_before = float(before_cost.get("generators", 0.0))
    saving_after = float(after_cost.get("generators", 0.0))

    # 3) 최종 요금 = 에너지 사용 요금 - 절감 요금
    final_before = energy_before - saving_before
    final_after = energy_after - saving_after

    energy_row = calculate_cost_row(energy_before, energy_after)
    saving_row = calculate_cost_row(saving_before, saving_after)
    final_row = calculate_cost_row(final_before, final_after)

    return AllCost(
        energy_usage_cost=energy_row,
        saving_cost=saving_row,
        final_cost=final_row,
    )