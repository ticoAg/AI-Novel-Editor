import json
import os
from pathlib import Path
from typing import Awaitable, Callable, List, Optional

import uvicorn
from fastapi import Body, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from loguru import logger
from pydantic import BaseModel

# 导入AI服务
from services.ai_service import AIService

# 创建FastAPI应用
app = FastAPI(title="AI小说编辑器API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建数据目录
os.makedirs("data/stories", exist_ok=True)

# 初始化AI服务
ai_service = AIService()


# 定义数据模型
class Story(BaseModel):
    id: str
    title: str
    content: str


class AIRequest(BaseModel):
    story_content: str
    request_type: str
    specific_request: Optional[str] = None


# 路由定义


@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI小说编辑器API"}


# 获取所有小说
@app.get("/stories")
async def get_stories():
    stories_dir = Path("data/stories")
    stories = []
    for file in stories_dir.glob("*.json"):
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            stories.append(data)
    return {"stories": stories}


# 获取单个小说
@app.get("/stories/{story_id}")
async def get_story(story_id: str):
    file_path = Path(f"data/stories/{story_id}.json")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="小说未找到")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


# 创建新小说
@app.post("/stories")
async def create_story(story: Story):
    file_path = Path(f"data/stories/{story.id}.json")
    if file_path.exists():
        raise HTTPException(status_code=400, detail="ID已存在")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(story.dict(), f, ensure_ascii=False, indent=2)
    # 返回最新数据
    return story.dict()


# 更新小说
@app.put("/stories/{story_id}")
async def update_story(story_id: str, story: Story):
    file_path = Path(f"data/stories/{story_id}.json")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="小说未找到")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(story.dict(), f, ensure_ascii=False, indent=2)
    # 返回最新数据
    return story.dict()


# 删除小说
@app.delete("/stories/{story_id}")
async def delete_story(story_id: str):
    file_path = Path(f"data/stories/{story_id}.json")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="小说未找到")
    os.remove(file_path)
    return {"message": "删除成功", "id": story_id}


# AI辅助功能
@app.post("/ai/assist")
async def ai_assist(request: AIRequest):
    # 实现AI辅助功能的逻辑
    if request.request_type == "plot":
        # 情节建议逻辑
        pass
    elif request.request_type == "character":
        # 角色发展逻辑
        pass
    elif request.request_type == "style":
        # 写作风格逻辑
        pass
    elif request.request_type == "body":
        # 生成正文逻辑
        pass
    else:
        raise HTTPException(status_code=400, detail="无效的请求类型")


@app.middleware("http")
async def log_requests(request: Request, call_next: Callable):
    # 缓存 body 开始
    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.body()

        async def re_read():
            return {"type": "http.request", "body": body}

        request._receive = re_read
    # 缓存 body 结束

    # 打印查询参数或 body
    if request.method == "GET":
        logger.info(f"Query Parameters: {request.query_params}")
    elif request.method in ["POST", "PUT", "PATCH"]:
        try:
            json_body = await request.json()
            logger.info(f"Request Body: {json_body}")
        except Exception as e:
            logger.warning(f"Failed to parse request body: {e}")

    response = await call_next(request)
    logger.info(f"Request: {request.method} {request.url} - Status: {response.status_code}")
    return response


# 新增：生成标题
@app.post("/ai/generate-title")
async def generate_title(tags: List[str] = Body(...), stream: bool = Body(default=False)):
    logger.debug(f"接收到参数: {tags}")
    title = await ai_service.generate_title_by_tags(tags)
    return {"title": title}


# 新增：生成大纲
from fastapi.responses import StreamingResponse


@app.post("/ai/generate-outline")
async def generate_outline(title: str = Body(...), tags: List[str] = Body(...)):
    async def outline_generator():
        async for chunk in ai_service.generate_outline_by_title_and_tags_stream(title, tags):
            yield chunk

    return StreamingResponse(outline_generator(), media_type="text/plain")


# 新增：生成章节梗概
@app.post("/ai/generate-chapter-summaries")
async def generate_chapter_summaries(outline: str = Body(...)):
    # 实现生成章节梗概的逻辑
    pass


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000)
