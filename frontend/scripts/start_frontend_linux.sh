#!/bin/bash
# 进入前端目录

# 设置npm国内镜像
npm config set registry https://registry.npmmirror.com

# 安装依赖
npm install

# 检查端口并启动前端服务
for port in $(seq 8001 8010); do
  if ! nc -z localhost $port; then
    export PORT=$port
    break
  fi
done
npm start -- --port $PORT