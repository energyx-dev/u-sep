import math


def to_thousand_won(value_won: float) -> float:
    """
    원 → 천원 변환 후
    소수점 2자리까지 '버림'
    """
    value = value_won / 1000.0
    return math.trunc(value * 100) / 100