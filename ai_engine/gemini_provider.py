import os
import httpx
from google import genai
from google.genai import types
from .llm_client import LLMProvider
from typing import Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

DEFAULT_MODEL = "gemini-flash-latest"

class GeminiProvider(LLMProvider):
    async def generate_text(self, prompt: str, system_prompt: str = "", json_mode: bool = False, model: Optional[str] = None) -> str:
        target_model = model or DEFAULT_MODEL
        
        full_prompt = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER PROMPT:\n{prompt}" if system_prompt else prompt
        
        kwargs = {}
        if json_mode:
            kwargs["config"] = types.GenerateContentConfig(response_mime_type="application/json")
            
        if not client:
            raise ValueError("GEMINI_API_KEY not set in environment.")
            
        response = await client.aio.models.generate_content(
            model=target_model,
            contents=full_prompt,
            **kwargs
        )
        return response.text

    async def analyze_image(self, image_url: str, prompt: str, system_prompt: str = "") -> str:
        async with httpx.AsyncClient(timeout=60.0) as client_http:
            img_response = await client_http.get(image_url)
            img_response.raise_for_status()
            
            mime_type = img_response.headers.get("content-type", "image/jpeg")
            
            image_part = types.Part.from_bytes(
                data=img_response.content,
                mime_type=mime_type
            )
            
            full_prompt = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER PROMPT:\n{prompt}" if system_prompt else prompt
            
            if not client:
                raise ValueError("GEMINI_API_KEY not set in environment.")
                
            response = await client.aio.models.generate_content(
                model=DEFAULT_MODEL,
                contents=[image_part, full_prompt]
            )
            
            return response.text
