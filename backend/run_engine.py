import subprocess
import os
import re
import sys

EXECUTION_METHOD = 'DIRECT'

def run_engine(input_file_path: str):
    cmd = []
    if EXECUTION_METHOD == 'DIRECT':
        if getattr(sys, 'frozen', False):
            # 패키지(PyInstaller 빌드 후) 실행 환경
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            python_exe_path = os.path.join(backend_dir, "simulator_v060", "venv", "python.exe")
        else:
            # 로컬(개발) 환경
            base_dir = os.path.dirname(os.path.abspath(__file__))
            python_exe_path = os.path.join(base_dir, "simulator_v060", "venv", "python.exe")

        cmd = [
            python_exe_path,
            "-m", "epsimple",
            "run",
        ]
        print("cwd:", os.getcwd())
        print("python.exe exists:", os.path.exists(python_exe_path))
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        run_engine_path = os.path.join(base_dir, "simulator_v060", "runEngine.bat")
        cmd = [
            run_engine_path,
            "run",
        ]

    cmd.extend(["-i", input_file_path])
    print("epsimple execute:", cmd)

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace"
    )

    success_message = None

    for line in process.stdout:
        # print("line : ", line)
        if "EnergyPlus Completed Successfully." in line:
            success_message = line.strip()


    process.stdout.close()
    return_code = process.wait()
    print("return code= ", return_code)
    print("success message= ", success_message)

    output_path = re.sub(r"(\.\w+?)$",rf".grr", input_file_path)
    print("output path= ", output_path)
    print("----------------------------------------------------------------------------")
    print("")
    return output_path
