#!/bin/bash
# 加载 .env 环境变量
if [ -f "../.env" ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# 打印 base_url（以 OPENAI_API_BASE 为例）
echo "base_url: $OPENAI_API_BASE"

# 启动 FastAPI 后端服务
cd ..
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload