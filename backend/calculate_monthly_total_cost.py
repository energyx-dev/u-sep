from response import MonthlyTotalCost
from to_thousand_won import to_thousand_won


def calculate_monthly_total_cost(before_summary: dict, after_summary: dict) -> MonthlyTotalCost:
    before = before_summary["cost"]["total_monthly"]   # 12개월 리스트
    after = after_summary["cost"]["total_monthly"]

    diff = [b - a for b, a in zip(before, after)]
    diff_rate = [
        ((b - a) / b * 100) if b != 0 else 0.0
        for b, a in zip(before, after)
    ]


    return MonthlyTotalCost(
        gr_before=[to_thousand_won(b) for b in before],  # 천원
        gr_after=[to_thousand_won(a) for a in after],  # 천원
        diff=[to_thousand_won(d) for d in diff],  # 천원
        diff_rate=[round(r, 2) for r in diff_rate],  # %
    )