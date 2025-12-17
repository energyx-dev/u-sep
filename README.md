## Environment

- Node.js: 20.18.0
- Package Manager: pnpm
- Platform: Windows (Electron)

## Install

pnpm install

## Build (Local)

Windows 기준 Electron 패키징:

pnpm run electron-pack:win

빌드 결과물은 dist/ 디렉토리에 생성됩니다.

## Release (GitHub Actions)

본 프로젝트는 GitHub Actions 기반 자동 릴리즈를 사용합니다.

### 릴리즈 조건

- 태그 형식: x.y.z-electron  
  예: 1.0.0-electron
- 릴리즈 대상 PR에는 반드시 release 라벨이 필요합니다.
- 가장 최근에 머지된 release 라벨 PR의 본문이 GitHub Release 본문으로 사용됩니다.

### 릴리즈 절차

git tag 1.0.0-electron  
git push origin 1.0.0-electron

태그 푸시 시 GitHub Actions가 자동으로 실행되며 Windows 설치 파일을 포함한 Release가 생성됩니다.

## Artifacts

- Windows Installer (.exe)
- ZIP 파일로 압축된 설치 파일

## Notes

- 본 레포지토리는 납품 및 배포 목적로만 사용됩니다.
- 납품 및 배포 목적의 초기 릴리즈를 포함합니다.
- 내부 개발용 히스토리 및 실험 코드는 포함하지 않습니다.

## License

본 프로젝트는 MIT 라이선스를 따릅니다.
자세한 내용은 LICENSE 파일을 참고하십시오.