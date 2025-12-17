from fastapi import FastAPI
import json
import logging
import sys
import os
import signal
import subprocess
import time
from fastapi.middleware.cors import CORSMiddleware

from calculate_all_cost import calculate_all_cost
from calculate_energy_source_cost import calculate_energy_source_cost

from calculate_monthly_total_cost import calculate_monthly_total_cost
from calculate_use_cost import calculate_use_cost
from calculate_uses import build_all_site_load_uses
from run_engine import run_engine

# Windows에서 한글 출력을 위한 인코딩 설정
if sys.platform == "win32":
    try:
        # 안전한 방법으로 인코딩 설정
        import codecs

        if hasattr(sys.stdout, 'detach'):
            sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
            sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())
        else:
            # detach 메서드가 없는 경우 환경 변수로 설정
            os.environ['PYTHONIOENCODING'] = 'utf-8'
    except Exception:
        # 인코딩 설정 실패 시 환경 변수로 대체
        os.environ['PYTHONIOENCODING'] = 'utf-8'

from calculate_detail import build_before_after_monthly_from
from calculate_kpi import calculate_kpi
from create_grm_file import create_grm_file
from parse_grr_result import parse_grr_result
from request import EngineRequest
from response import KPIResult, RunEngineResponse, BeforeAfterEnergyUses


def kill_process_on_port(port):
    """지정된 포트를 사용하는 프로세스를 종료합니다."""
    try:
        # Windows에서 포트를 사용하는 프로세스 찾기
        result = subprocess.run(
            f'netstat -ano | findstr :{port}',
            shell=True, capture_output=True, text=True, encoding='utf-8'
        )

        if result.stdout:
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if f':{port}' in line and 'LISTENING' in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[-1]
                        try:
                            # 프로세스 종료
                            subprocess.run(f'taskkill /PID {pid} /F', shell=True, check=True, encoding='utf-8')
                            print(f"포트 {port}를 사용하던 프로세스 {pid}를 종료했습니다.")
                            time.sleep(2)  # 프로세스 종료 대기 시간 증가
                        except subprocess.CalledProcessError:
                            print(f"프로세스 {pid} 종료 실패 (이미 종료되었을 수 있음)")

        # 포트가 실제로 해제되었는지 확인
        max_retries = 5
        for i in range(max_retries):
            time.sleep(1)  # 1초 대기
            check_result = subprocess.run(
                f'netstat -ano | findstr :{port} | findstr LISTENING',
                shell=True, capture_output=True, text=True, encoding='utf-8'
            )
            if not check_result.stdout:
                print(f"포트 {port}가 성공적으로 해제되었습니다.")
                return True
            print(f"포트 {port} 해제 대기 중... ({i + 1}/{max_retries})")

        print(f"포트 {port} 해제 실패 - 최대 재시도 횟수 초과")
        return False

    except Exception as e:
        print(f"포트 {port} 프로세스 종료 중 오류: {e}")
        return False


def cleanup_on_exit(signum, frame):
    """서버 종료 시 정리 작업을 수행합니다."""
    print("\n서버를 종료합니다...")
    kill_process_on_port(28000)
    sys.exit(0)


logging.basicConfig(
    level=logging.INFO,  # 예시: INFO 레벨 이상만 로깅
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.post("/v3/run-engine")
async def run_engine_v5(data: EngineRequest):
    logging.info("request before name: %s, after name: %s", data.before.name, data.after.name)
    before_name = data.before.name.replace(" ", "_") + "_before_input"
    after_name = data.after.name.replace(" ", "_") + "_after_input"
    logging.info("sanitized before name: %s, after name: %s", before_name, after_name)

    before_path = create_grm_file(before_name, data.before.item)
    after_path = create_grm_file(after_name, data.after.item)
    logging.info("created file before path: %s, after path: %s", before_path, after_path)

    logging.info("engine analysis started")
    output_path_b = run_engine(before_path)
    output_path_a = run_engine(after_path)
    logging.info("engine analysis completed")

    logging.info("Loading data from folder")
    before_data = parse_grr_result(output_path_b)
    after_data = parse_grr_result(output_path_a)

    logging.info("data processing started")
    kpi = calculate_kpi(before_data["summary_gross"], after_data["summary_gross"])
    site_uses = build_before_after_monthly_from(before_data, after_data, "site_uses")
    source_uses = build_before_after_monthly_from(before_data, after_data, "source_uses")
    co2 = build_before_after_monthly_from(before_data, after_data, "co2")
    load_uses = build_all_site_load_uses(before_data, after_data)

    all_cost = calculate_all_cost(before_data["summary_gross"], after_data["summary_gross"])
    monthly_total_cost = calculate_monthly_total_cost(before_data["summary_gross"], after_data["summary_gross"])
    use_cost = calculate_use_cost(before_data["summary_gross"], after_data["summary_gross"])
    energy_source_cost = calculate_energy_source_cost(before_data["summary_gross"], after_data["summary_gross"])

    logging.info("data processing completed")
    return RunEngineResponse(
        before=before_data,
        after=after_data,
        results=KPIResult(**kpi),
        site_uses=BeforeAfterEnergyUses(**site_uses),
        source_uses=BeforeAfterEnergyUses(**source_uses),
        co2=BeforeAfterEnergyUses(**co2),
        **load_uses,
        all_cost=all_cost,
        monthly_total_cost=monthly_total_cost,
        use_cost=use_cost,
        energy_source_cost=energy_source_cost,
    )


if __name__ == "__main__":
    import uvicorn

    # 서버 시작 전 포트 28000을 사용하는 프로세스 종료
    print("포트 28000을 사용하는 기존 프로세스를 확인하고 종료합니다...")
    port_cleared = kill_process_on_port(28000)

    if not port_cleared:
        print("포트 28000을 사용할 수 없습니다. 다른 포트를 사용하거나 기존 프로세스를 수동으로 종료해주세요.")
        sys.exit(1)

    # 종료 시그널 핸들러 등록
    signal.signal(signal.SIGINT, cleanup_on_exit)
    signal.signal(signal.SIGTERM, cleanup_on_exit)

    if getattr(sys, 'frozen', False):
        print("===== Packaged environment =====")
        uvicorn.run(app, host="0.0.0.0", port=28000)
    else:
        print("===== Local environment =====")
        uvicorn.run("main:app", host="0.0.0.0", port=28000, reload=False)
