import json
from typing import Dict, Any, List
from ..llm_client import get_llm_client

SYSTEM_PROMPT = """You are an expert e-commerce copywriter and SEO specialist.
Given the raw product fields and image captions, generate rich, engaging product copy.
Return ONLY a valid JSON object matching this schema:
{
  "title": "string (polished title)",
  "short_description": "string (1-2 sentences)",
  "long_description": "string (comprehensive description)",
  "features": ["string", "string", "..."],
  "specifications": {"key": "value"},
  "seo_title": "string (max 60 chars)",
  "meta_description": "string (max 160 chars)",
  "keywords": ["string", "string"]
}"""

async def run(product_data: Dict[str, Any], image_captions: List[str]) -> Dict[str, Any]:
    client = get_llm_client()
    
    prompt = f"Raw Product Fields:\n{json.dumps(product_data, indent=2)}\n\nImage Captions:\n"
    for i, cap in enumerate(image_captions):
        prompt += f"- {cap}\n"
        
    try:
        response = await client.generate_text(prompt, SYSTEM_PROMPT, json_mode=True)
        # Clean markdown if present
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].strip()
            
        data = json.loads(response)
        return data
    except Exception as e:
        # Fallback to returning basic if fails
        return {
            "enrichment_failed": True,
            "error": str(e),
            "title": product_data.get("title", ""),
            "short_description": product_data.get("short_description", ""),
            "features": [],
            "specifications": {}
        }
