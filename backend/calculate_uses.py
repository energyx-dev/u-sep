FUEL_KEYS = ["ELECTRICITY", "NATURALGAS", "DISTRICTHEATING", "OIL"]


def to_monthly_12(value):
    if isinstance(value, list):
        return [float(v) for v in value]
    if isinstance(value, dict):
        monthly = [0.0] * 12
        for arr in value.values():
            for i, v in enumerate(arr):
                monthly[i] += float(v)
        return monthly
    return [0.0] * 12


def build_site_load_uses(before_section: dict, after_section: dict) -> dict:
    before = {}
    after = {}

    for fuel in FUEL_KEYS:
        before[fuel] = to_monthly_12(before_section.get(fuel, [0.0] * 12))
        after[fuel] = to_monthly_12(after_section.get(fuel, [0.0] * 12))

    before_total = [sum(months) for months in zip(*before.values())]
    after_total = [sum(months) for months in zip(*after.values())]

    return {
        "before_total": before_total,
        "after_total": after_total,
        "before": before,
        "after": after,
    }


def build_all_site_load_uses(before_data: dict, after_data: dict) -> dict:
    b = before_data.get("site_uses", {})
    a = after_data.get("site_uses", {})

    return {
        "cooling_uses": build_site_load_uses(b.get("cooling", {}), a.get("cooling", {})),
        "heating_uses": build_site_load_uses(b.get("heating", {}), a.get("heating", {})),
        "hotwater_uses": build_site_load_uses(b.get("hotwater", {}), a.get("hotwater", {})),
        "lighting_uses": build_site_load_uses(b.get("lighting", {}), a.get("lighting", {})),
        "circulation_uses": build_site_load_uses(b.get("circulation", {}), a.get("circulation", {})),
        "generators_uses": build_site_load_uses(b.get("generators", {}), a.get("generators", {})),
    }
