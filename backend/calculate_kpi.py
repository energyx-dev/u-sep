def calculate_kpi(before_summary:dict, after_summary: dict) -> dict:
    def get_value(summary: dict, key: str) -> float:
        return summary.get(key, {}).get("total_annual", 0.0)

    before_site = get_value(before_summary, "site_uses")
    after_site = get_value(after_summary, "site_uses")

    before_source = get_value(before_summary, "source_uses")
    after_source = get_value(after_summary, "source_uses")

    before_co2 = get_value(before_summary, "co2")
    after_co2 = get_value(after_summary, "co2")

    def calc_rate(before, after):
        return round((before - after)/ before * 100, 2) if before > 0 else 0.0

    return {
        "energy_saving_rate": calc_rate(before_site, after_site),
        "primary_energy_saving_rate": calc_rate(before_source, after_source),
        "co2_saving_rate": calc_rate(before_co2, after_co2),
        "tree_planting_effect": round((before_co2 - after_co2)/ 9.27, 2),
        "forest_preservation_effect": round((before_co2 - after_co2), 2),
        "car_replacement_effect": round((before_co2 - after_co2) / 2786, 2)
    }