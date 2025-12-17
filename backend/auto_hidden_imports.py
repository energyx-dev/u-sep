import pkgutil
import re

# 1️⃣ 필요한 모듈 화이트리스트
whitelist = {
    "fastapi",
    "uvicorn",
    "starlette",
    "pydantic",
    "typing_extensions",
    "anyio",
    "h11",
    "idna",
    "sniffio",
    "annotated_types",
    "pydantic_core",
    "typing_inspect",
}

# 2️⃣ 현재 설치된 모듈 추출
installed_modules = {module.name for module in pkgutil.iter_modules()}
filtered_modules = sorted(installed_modules & whitelist)


# 3️⃣ main.spec 파일 업데이트
spec_path = "main.spec"

with open(spec_path, "r", encoding="utf-8") as f:
    spec_content = f.read()

# 기존 hiddenimports=[] 부분을 정규식으로 찾아 교체
new_hidden_imports = "hiddenimports=[\n" + \
    "\n".join([f"    '{mod}'," for mod in filtered_modules]) + "\n],"

spec_content_updated = re.sub(
    r"hiddenimports=\[.*?\],",
    new_hidden_imports,
    spec_content,
    flags=re.DOTALL
)

with open(spec_path, "w", encoding="utf-8") as f:
    f.write(spec_content_updated)

print("Auto update of hiddenimports in main.spec completed.")
