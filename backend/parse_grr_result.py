import json
import os

def parse_grr_result(file_path: str) -> dict:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"분석 결과 파일을 찾을 수 없습니다: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        try:
            result = json.load(f)
            return result
        except json.JSONDecodeError as e:
            raise ValueError(f"Json 파싱 실패: {file_path}\n{e}")