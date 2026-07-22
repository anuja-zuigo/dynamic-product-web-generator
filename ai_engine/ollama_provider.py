import os
import httpx
import base64
from .llm_client import LLMProvider
from typing import Optional

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_TEXT_MODEL = os.getenv("OLLAMA_TEXT_MODEL", "qwen2.5:7b")
DEFAULT_VISION_MODEL = os.getenv("OLLAMA_VISION_MODEL", "llava")

class OllamaProvider(LLMProvider):
    async def generate_text(self, prompt: str, system_prompt: str = "", json_mode: bool = False, model: Optional[str] = None) -> str:
        target_model = model or DEFAULT_TEXT_MODEL
        
        payload = {
            "model": target_model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
        }
        
        if json_mode:
            payload["format"] = "json"
            
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")

    async def analyze_image(self, image_url: str, prompt: str, system_prompt: str = "") -> str:
        # For Ollama Vision models (like llava), we need to download the image first and send as base64
        # since Ollama's API requires base64 encoded images.
        async with httpx.AsyncClient(timeout=180.0) as client:
            # 1. Fetch image
            img_response = await client.get(image_url)
            img_response.raise_for_status()
            img_base64 = base64.b64encode(img_response.content).decode('utf-8')
            
            # 2. Call Ollama
            payload = {
                "model": DEFAULT_VISION_MODEL,
                "prompt": prompt,
                "system": system_prompt,
                "images": [img_base64],
                "stream": False
            }
            
            res = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload)
            res.raise_for_status()
            return res.json().get("response", "")
