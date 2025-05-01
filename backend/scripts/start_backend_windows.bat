@echo off
REM 载入.env环境变量
for /f "usebackq tokens=1,* delims==" %%A in ("..\.env") do set %%A=%%B

REM 打印 base_url（以 OPENAI_API_BASE 为例）
echo base_url: %OPENAI_API_BASE%

REM 启动 FastAPI 后端服务
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload