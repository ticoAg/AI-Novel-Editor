chcp 65001
@echo on

echo 请先手动执行 npm config set registry https://registry.npmmirror.com 并确保网络畅通。

@REM REM 继续安装依赖
echo 正在安装依赖...
npm install
if %errorlevel% neq 0 (
  echo 安装依赖失败，脚本终止。
  exit /b %errorlevel%
)

@REM REM 启动前端服务
echo 正在启动前端服务...
npm start
if %errorlevel% neq 0 (
  echo 启动前端服务失败，脚本终止。
  exit /b %errorlevel%
)