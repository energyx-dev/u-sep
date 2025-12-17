from response import CostRow
from to_thousand_won import to_thousand_won


def calculate_cost_row(before: float, after: float) -> CostRow:
    # before = GR 전, after = GR 후
    diff = before - after
    diff_rate = (before - after) / before * 100 if before != 0 else 0.0

    return CostRow(
        gr_before=to_thousand_won(before),  # 천원
        gr_after=to_thousand_won(after),    # 천원
        diff=to_thousand_won(diff),         # 천원
        diff_rate=round(diff_rate, 2),      #
    )