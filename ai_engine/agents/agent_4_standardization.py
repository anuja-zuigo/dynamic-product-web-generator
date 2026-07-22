import json
from typing import Dict, Any
from ..llm_client import get_llm_client

SYSTEM_PROMPT = """You are a catalog standardization AI.
Your job is to normalize casing (Title Case for titles), units, and grammar.
Review the enriched product data.
Return ONLY a valid JSON object matching this schema, including a 'changes' array documenting what you modified:
{
  "title": "string",
  "short_description": "string",
  "long_description": "string",
  "features": ["string"],
  "specifications": {"key": "value"},
  "seo_title": "string",
  "meta_description": "string",
  "keywords": ["string"],
  "changes": [{"field": "string", "before": "string", "after": "string"}]
}"""

async def run(enriched_data: Dict[str, Any]) -> Dict[str, Any]:
    if enriched_data.get("enrichment_failed"):
        return enriched_data # Skip if enrichment failed
        
    client = get_llm_client()
    
    prompt = f"Enriched Data:\n{json.dumps(enriched_data, indent=2)}\n\nPlease standardize this."
    
    try:
        response = await client.generate_text(prompt, SYSTEM_PROMPT, json_mode=True)
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].strip()
            
        data = json.loads(response)
        return data
    except Exception as e:
        # Fallback to original enriched data on error
        enriched_data["standardization_failed"] = True
        enriched_data["standardization_error"] = str(e)
        return enriched_data
