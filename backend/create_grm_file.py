import os
import json
import sys

def create_grm_file(file_name: str, item_data: dict) -> str:
    print("start create file...")
    if getattr(sys,'frozen', False):
        base_dir = os.path.dirname(sys.executable)
    else:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_dir = os.path.join(base_dir, "input")
    os.makedirs(input_dir, exist_ok=True)

    file_path = os.path.join(input_dir, f"{file_name}.grm")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(item_data, f, ensure_ascii=False, indent=2)

    return file_path