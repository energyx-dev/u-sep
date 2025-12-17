import { spawn } from "child_process";
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(process.resourcesPath ?? __dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFilePath = path.join(logDir, "u-sep.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

function log(...messages) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${messages.join(" ")}\n`;
  console.log(fullMessage.trim());
  logStream.write(fullMessage);
}

let fastapiProcess;

// 기본 해상도
const DEFAULT_RESOLUTION = { width: 1200, height: 900 };

// 포트를 사용하는 프로세스를 강제 종료하는 함수
function killProcessOnPort(port) {
  try {
    const { execSync } = require("child_process");

    // 포트를 사용하는 프로세스 찾기
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const lines = result.trim().split("\n");

    for (const line of lines) {
      if (line.includes("LISTENING")) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];

        if (pid && !isNaN(pid)) {
          log(`[FastAPI] 포트 ${port}를 사용하는 프로세스 ${pid} 발견`);

          // 자식 프로세스들 먼저 종료
          try {
            execSync(`wmic process where "ParentProcessId=${pid}" call terminate`, {
              stdio: "ignore",
            });
            log(`[FastAPI] 자식 프로세스들 종료 완료 (부모 PID: ${pid})`);
          } catch (e) {
            // 자식 프로세스가 없거나 이미 종료된 경우 무시
          }

          // 부모 프로세스 종료
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
            log(`[FastAPI] 프로세스 ${pid} 강제 종료 완료`);
          } catch (e) {
            log(`[FastAPI] 프로세스 ${pid} 종료 실패: ${e.message}`);
          }
        }
      }
    }
  } catch (e) {
    log(`[FastAPI] 포트 ${port} 프로세스 종료 중 오류: ${e.message}`);
  }
}

// FIXME fastAPI 서버가 뜰때까지 electron 앱이 기다리도록 조치 필요
function startFastAPIServer() {
  // 시작 전에 기존 포트 정리
  killProcessOnPort(28000);

  const isDev = process.env.NODE_ENV === "development"; // 개발/운영 환경 구분
  if (isDev) {
    // Windows 전용 python.exe 경로 고정
    log("process.platform : ", process.platform);
    const pythonCmd =
      process.platform === "win32"
        ? path.join(__dirname, "..", "backend", ".venv", "Scripts", "python.exe")
        : path.join(__dirname, "..", "backend", ".venv", "bin", "python");

    const scriptPath = path.join(__dirname, "..", "backend", "main.py");

    log("[FastAPI] 개발 환경에서 python main.py 실행:", scriptPath);
    fastapiProcess = spawn(pythonCmd, ["-u", scriptPath], {
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
        PYTHONLEGACYWINDOWSSTDIO: "utf-8",
      },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: false,
    });
  } else {
    // 빌드된 main.exe 경로 고정
    const serverPath = path.join(process.resourcesPath, "backend", "main", "main.exe");

    log("[FastAPI] 운영 환경에서 빌드된 main.exe 실행:", serverPath);
    fastapiProcess = spawn(serverPath, [], {
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
        PYTHONLEGACYWINDOWSSTDIO: "utf-8",
      },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: false,
    });
  }

  fastapiProcess.stdout.on("data", (data) => {
    // UTF-8로 디코딩하여 한글 출력 문제 해결
    const decodedData = data.toString("utf8");
    log(`[FastAPI stdout] ${decodedData}`);
  });

  fastapiProcess.stderr.on("data", (data) => {
    // UTF-8로 디코딩하여 한글 출력 문제 해결
    const decodedData = data.toString("utf8");
    log(`[FastAPI stderr] ${decodedData}`);
  });

  fastapiProcess.on("exit", (code) => {
    log(`[FastAPI 종료] 종료 코드: ${code}`);
  });
}

// Vite 서버가 준비될 때까지 기다리는 함수
function waitForViteServer(url) {
  return new Promise((resolve) => {
    const checkServer = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            setTimeout(checkServer, 300);
          }
        })
        .on("error", () => {
          setTimeout(checkServer, 300);
        });
    };
    checkServer();
  });
}

// 메뉴 템플릿 생성 함수
function createMenuTemplate(mainWindow) {
  // 기본 메뉴 가져오기
  // 기본 메뉴 비활성화
  // const defaultMenu = Menu.getApplicationMenu();

  // const menuItems = defaultMenu ? defaultMenu.items.map((item) => item) : [];
  const menuItems = [];

  // 해상도 메뉴 추가
  // const viewMenu = {
  //   label: "해상도",
  //   submenu: [
  //     {
  //       label: "표준 크기 (1200x900)",
  //       accelerator: "CmdOrCtrl+1",
  //       click: () => {
  //         mainWindow.setSize(DEFAULT_RESOLUTION.width, DEFAULT_RESOLUTION.height);
  //         mainWindow.center();
  //       },
  //     },
  //     {
  //       label: "전체화면",
  //       accelerator: "CmdOrCtrl+2",
  //       click: () => {
  //         mainWindow.maximize();
  //       },
  //     },
      
  //   ],
  // };
  const editMenu = {
    label: "Edit",
    submenu: [
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  };

  menuItems.push(editMenu);

  return menuItems;
}

async function createWindow() {
  const startUrl =
    process.env.ELECTRON_START_URL || `file://${path.join(__dirname, "../dist/index.html")}`;

  // 개발 환경에서는 Vite 서버가 준비될 때까지 대기
  if (process.env.ELECTRON_START_URL) {
    await waitForViteServer(process.env.ELECTRON_START_URL);
  }

  const win = new BrowserWindow({
    title: "",
    autoHideMenuBar: true,
    width: DEFAULT_RESOLUTION.width,
    height: DEFAULT_RESOLUTION.height,
    icon: path.join(__dirname, "../public/win-logo.ico"), // 아이콘 설정
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "/preload.mjs"),
    },
  });

  // 메뉴 설정
  const menu = Menu.buildFromTemplate(createMenuTemplate(win));
  Menu.setApplicationMenu(menu);

  // IPC 통신 설정
  ipcMain.handle("file:open", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (canceled || filePaths.length === 0) {
      return { canceled: true };
    }

    const fullPath = filePaths[0];
    const { name } = path.parse(fullPath);
    const content = fs.readFileSync(fullPath, "utf-8");

    return { canceled: false, path: fullPath, content, name };
  });

  // 파일 저장 핸들러
  ipcMain.handle("file:save", async (_, { defaultPath, data, fileName }) => {
    let saveFilePath = defaultPath;

    // 새 파일일 때, 경로 지정
    if (defaultPath === null) {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "파일 저장",
        defaultPath: fileName,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (canceled || !filePath) {
        return { success: false, error: "저장 취소됨" };
      }

      saveFilePath = filePath;
    }

    try {
      fs.writeFileSync(saveFilePath, JSON.stringify(data, null, 2), "utf-8");
      const { name } = path.parse(saveFilePath);
      return { success: true, path: saveFilePath, name };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  });

  // PDF 저장 핸들러 (printToPDF 적용)
  ipcMain.handle("print:toPDF", async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "PDF 저장",
      defaultPath: "분석_리포트.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) {
      return { success: false, error: "저장 취소됨" };
    }

    try {
      const pdfData = await win.webContents.printToPDF({
        pageSize: "A4",
        printBackground: true,
        landscape: false,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        printSelectionOnly: false,
        scale: 1,
      });

      fs.writeFileSync(filePath, pdfData);
      log(`[PDF] PDF 저장 완료: ${filePath}`);
      return { success: true, path: filePath };
    } catch (err) {
      log(`[PDF] PDF 저장 실패: ${err.message}`);
      console.error(err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("manual:save", async () => {
    const pdfPath = path.join(__dirname, "U-SEP 사용 매뉴얼.pdf");

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "매뉴얼 PDF 다운로드",
      defaultPath: "U-SEP 사용 매뉴얼.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) {
      return { success: false, error: "취소됨" };
    }

    try {
      fs.copyFileSync(pdfPath, filePath);
      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("guide-video:path", () => {
    return path.join(
      process.resourcesPath,
      "videos",
      "U-SEP_Tutorial.mp4",
    );
  });

  log("Loading URL:", startUrl);
  win.loadURL(startUrl);

  // 개발 모드에서 DevTools 자동 열기
  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }
}

app.on("ready", () => {
  startFastAPIServer();
  createWindow().catch((e) => console.error("Electron 창 생성 실패", e));
});

app.on("window-all-closed", () => {
  if (fastapiProcess) {
    log("[FastAPI] Electron 종료로 FastAPI 서버 kill() 실행");

    // Windows에서 프로세스 트리 전체를 종료하기 위한 처리
    if (process.platform === "win32") {
      try {
        // 부모 프로세스와 모든 자식 프로세스를 강제 종료
        const { execSync } = require("child_process");
        const pid = fastapiProcess.pid;

        // 자식 프로세스들 먼저 종료
        try {
          execSync(`wmic process where "ParentProcessId=${pid}" call terminate`, {
            stdio: "ignore",
          });
          log(`[FastAPI] 자식 프로세스들 종료 완료 (PID: ${pid})`);
        } catch (e) {
          log(`[FastAPI] 자식 프로세스 종료 중 오류 (무시): ${e.message}`);
        }

        // 부모 프로세스 종료
        fastapiProcess.kill("SIGTERM");

        // 3초 대기 후 강제 종료
        setTimeout(() => {
          try {
            fastapiProcess.kill("SIGKILL");
            log("[FastAPI] 강제 종료 완료");
          } catch (e) {
            log(`[FastAPI] 강제 종료 중 오류: ${e.message}`);
          }
        }, 3000);
      } catch (e) {
        log(`[FastAPI] 프로세스 종료 중 오류: ${e.message}`);
        // 기본 kill() 메서드로 fallback
        fastapiProcess.kill();
      }
    } else {
      // Windows가 아닌 경우 기본 kill() 사용
      fastapiProcess.kill();
    }
  } else {
    log("[FastAPI] Electron 종료, FastAPI 서버가 존재하지 않아 kill() 생략");
  }
  log("[Electron] 모든 창이 닫혀 앱 종료");

  // 최종적으로 포트 정리
  setTimeout(() => {
    killProcessOnPort(28000);
  }, 1000);

  app.quit();
});
