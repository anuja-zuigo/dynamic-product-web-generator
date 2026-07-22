import os
from typing import Optional

class LLMProvider:
    async def generate_text(self, prompt: str, system_prompt: str = "", json_mode: bool = False, model: Optional[str] = None) -> str:
        raise NotImplementedError
        
    async def analyze_image(self, image_url: str, prompt: str, system_prompt: str = "") -> str:
        raise NotImplementedError

def get_llm_client() -> LLMProvider:
    provider = os.getenv("AI_PROVIDER", "ollama").lower()
    
    if provider == "ollama":
        from .ollama_provider import OllamaProvider
        return OllamaProvider()
    elif provider == "gemini":
        from .gemini_provider import GeminiProvider
        return GeminiProvider()
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")
