// Python 가상환경 및 패키지 설치 자동화 스크립트
// 운영체제에 따라 명령어 분기 (윈도우/맥/리눅스)
// 사용법: node scripts/setup-python.js

import { execSync } from "child_process";
import os from "os";

const isWin = os.platform().startsWith("win");
const backendDir = "backend";

try {
  if (isWin) {
    // 윈도우: python 가상환경 생성 및 활성화 후 requirements 설치
    execSync(`python -m venv .venv`, { cwd: backendDir, stdio: "inherit" });
    execSync(`.venv\\Scripts\\activate && pip install -r requirements-local.txt`, {
      cwd: backendDir,
      stdio: "inherit",
      shell: true,
    });
  } else {
    // 맥/리눅스: python3 가상환경 생성 및 활성화 후 requirements 설치
    execSync(`python3 -m venv .venv`, { cwd: backendDir, stdio: "inherit" });
    execSync(`source .venv/bin/activate && pip install -r requirements-local.txt`, {
      cwd: backendDir,
      stdio: "inherit",
      shell: true,
    });
  }
  console.log("✅ Python 가상환경 및 패키지 설치 완료");
} catch (e) {
  console.error("❌ Python 환경 준비 실패:", e);
  process.exit(1);
}
