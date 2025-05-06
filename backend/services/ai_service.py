# encoding: utf-8
import aiohttp
import json_repair
import openai
from loguru import logger

aclient = openai.AsyncOpenAI()
logger.info("OpenAI Base URL: {}".format(aclient.base_url))


class AIService:
    def __init__(self):
        self.model = "Qwen/Qwen3-8B"
        self.api_url = aclient.base_url.__str__() + "/chat/completions"
        self.api_token = aclient.api_key

    async def _generate_response_by_custom_api(self, prompt, max_tokens=500):
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "max_tokens": max_tokens,
            "enable_thinking": False,
            "thinking_budget": 512,
            "min_p": 0.05,
            "stop": None,
            "temperature": 0.7,
            "top_p": 0.7,
            "top_k": 50,
            "frequency_penalty": 0.5,
            "n": 1,
            "response_format": {"type": "text"},
        }
        headers = {"Authorization": f"Bearer {self.api_token}", "Content-Type": "application/json"}
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    data = await resp.json()
                    return data["choices"][0]["message"]["content"].strip()  # 根据实际返回结构调整
        except Exception as e:
            print(f"自定义API调用错误: {str(e)}")
            return f"生成建议时出错: {str(e)}"

    async def _generate_response_by_openai(self, prompt, max_tokens=500):
        """通用的AI响应生成函数"""
        try:
            response = await aclient.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位专业的小说创作顾问，擅长提供有关情节发展、角色塑造和文风调整的建议。",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=max_tokens,
                temperature=0.7,
                extra_body={"chat_template_kwargs": {"enable_thinking": False}},
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI API调用错误: {str(e)}")
            return f"生成建议时出错: {str(e)}"

    async def generate_plot_suggestion(self, story_content, specific_request=None):
        """生成情节建议"""
        prompt = f"以下是一个短篇小说的内容:\n\n{story_content}\n\n"

        if specific_request:
            prompt += f"请针对以下具体要求提供情节发展建议: {specific_request}"
        else:
            prompt += "请分析这个故事的情节，并提供2-3个可能的情节发展方向，使故事更加引人入胜。考虑当前情节中的冲突和悬念，提出能够推动故事发展的建议。"

        return await self._generate_response_by_custom_api(prompt)

    async def generate_character_suggestion(self, story_content, specific_request=None):
        """生成角色建议"""
        prompt = f"以下是一个短篇小说的内容:\n\n{story_content}\n\n"

        if specific_request:
            prompt += f"请针对以下具体要求提供角色发展建议: {specific_request}"
        else:
            prompt += "请分析这个故事中的主要角色，并提供2-3个角色发展或深化的建议。考虑角色的动机、内心冲突和成长空间，提出能够使角色更加丰满立体的建议。"

        return await self._generate_response_by_custom_api(prompt)

    async def generate_style_suggestion(self, story_content, specific_request=None):
        """生成文风建议"""
        prompt = f"以下是一个短篇小说的内容:\n\n{story_content}\n\n"

        if specific_request:
            prompt += f"请根据以下具体要求提供文风调整建议: {specific_request}"
        else:
            prompt += "请分析这个故事的写作风格，并提供2-3个文风优化的建议。考虑语言表达、叙事节奏和氛围营造，提出能够提升文学质量的具体修改建议，并给出示例。"

        return await self._generate_response_by_custom_api(prompt)

    async def generate_outline(self, story_content, tags=None, specific_request=None):
        """根据内容和标签生成行文大纲"""
        prompt = f"请根据以下小说内容生成详细的行文大纲，结合以下标签: {tags if tags else '无'}。\n\n小说内容：\n{story_content}\n\n如果有具体要求，请一并考虑。"
        if specific_request:
            prompt += f"\n具体要求：{specific_request}"
        prompt += "\n请以分条形式输出大纲，每条简明扼要。"
        return await self._generate_response_by_custom_api(prompt)

    async def generate_title_by_tags_stream(self, tags):
        """根据标签流式生成标题"""
        prompt = f"请根据以下标签扩展剧情并为小说生成一个吸引人的标题：{tags}\n输出格式: {{'title': '标题'}}"
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True,
            "max_tokens": 50,
            "enable_thinking": False,
            "thinking_budget": 512,
            "min_p": 0.05,
            "stop": None,
            "temperature": 0.7,
            "top_p": 0.7,
            "top_k": 50,
            "frequency_penalty": 0.5,
            "n": 1,
            "response_format": {"type": "text"},
        }
        headers = {"Authorization": f"Bearer {self.api_token}", "Content-Type": "application/json"}
        try:
            import aiohttp

            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for line in resp.content:
                        if line:
                            yield line.decode("utf-8")
        except Exception as e:
            yield f"\n[流式生成出错: {str(e)}]"
        # return await self._generate_response_by_custom_api(prompt)

    async def generate_outline_by_title_and_tags_stream(self, title, tags):
        """根据标题和标签流式生成大纲，逐步yield内容"""
        prompt = f"请根据标题“{title}”和标签“{tags}”为小说生成详细的行文大纲。要求结构清晰，分条列出主要情节节点。"
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True,
            "max_tokens": 1024,
            "enable_thinking": False,
            "thinking_budget": 512,
            "min_p": 0.05,
            "stop": None,
            "temperature": 0.7,
            "top_p": 0.7,
            "top_k": 50,
            "frequency_penalty": 0.5,
            "n": 1,
            "response_format": {"type": "text"},
        }
        headers = {"Authorization": f"Bearer {self.api_token}", "Content-Type": "application/json"}
        try:
            import aiohttp

            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for line in resp.content:
                        if line:
                            yield line.decode("utf-8")
        except Exception as e:
            yield f"\n[流式生成出错: {str(e)}]"
