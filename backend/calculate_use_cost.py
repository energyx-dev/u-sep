from typing import Dict, Any

from calculate_cost_row import calculate_cost_row
from response import UseCost


def calculate_use_cost(
        before_summary_gross: Dict[str, Any],
        after_summary_gross: Dict[str, Any],
) -> UseCost:
    before_cost = before_summary_gross["cost"]
    after_cost = after_summary_gross["cost"]

    return UseCost(
        cooling=calculate_cost_row(before_cost["cooling"], after_cost["cooling"]),
        heating=calculate_cost_row(before_cost["heating"], after_cost["heating"]),
        lighting=calculate_cost_row(before_cost["lighting"], after_cost["lighting"]),
        hotwater=calculate_cost_row(before_cost["hotwater"], after_cost["hotwater"]),
        circulation=calculate_cost_row(before_cost["circulation"], after_cost["circulation"]),
    )
