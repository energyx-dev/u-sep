from typing import Dict, Any

from calculate_cost_row import calculate_cost_row
from response import EnergySourceCost


def calculate_energy_source_cost(
        before_summary_gross: Dict[str, Any],
        after_summary_gross: Dict[str, Any],
) -> EnergySourceCost:
    before_cost = before_summary_gross["cost"]
    after_cost = after_summary_gross["cost"]

    return EnergySourceCost(
        electricity=calculate_cost_row(before_cost["ELECTRICITY"], after_cost["ELECTRICITY"]),
        district_heating=calculate_cost_row(before_cost["DISTRICTHEATING"], after_cost["DISTRICTHEATING"]),
        oil=calculate_cost_row(before_cost["OIL"], after_cost["OIL"]),
        natural_gas=calculate_cost_row(before_cost["NATURALGAS"], after_cost["NATURALGAS"]),
    )
