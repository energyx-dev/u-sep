SITE_KEYS = ["cooling", "heating", "hotwater", "lighting", "circulation"]

def to_monthly_12(value) -> list[float]:
    if isinstance(value, list):
        return [float(v) for v in value]

    if isinstance(value, dict):
        monthly = [0.0] * 12
        for arr in value.values():
            for i, v in enumerate(arr):
                monthly[i] += float(v)
        return monthly

    return [0.0] * 12


def build_monthly_from_section(section: dict) -> dict[str, list[float]]:
    result = {}
    for key in SITE_KEYS:
        result[key] = to_monthly_12(section[key])
    # total
    monthly_total = [0.0] * 12
    for key in SITE_KEYS:
        for i, v in enumerate(result[key]):
            monthly_total[i] += v
    result["total"] = monthly_total
    return result


def build_before_after_monthly_from(grr_before: dict, grr_after: dict, section_name: str) -> dict:
    before_section = grr_before.get(section_name, {})
    after_section = grr_after.get(section_name, {})
    return {
        "before": build_monthly_from_section(before_section),
        "after": build_monthly_from_section(after_section),
    }