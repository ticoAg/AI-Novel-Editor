@echo off
REM 进入前端目录

REM 设置npm国内镜像
npm config set registry https://registry.npmmirror.com

REM 安装依赖
npm install

REM 检查端口并启动前端服务
npm start