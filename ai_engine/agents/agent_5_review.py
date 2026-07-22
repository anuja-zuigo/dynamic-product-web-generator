import json
from typing import Dict, Any, List
from ..llm_client import get_llm_client

SYSTEM_PROMPT = """You are a final review agent for a multi-agent e-commerce pipeline.
Synthesize a human-readable summary of what the AI did to this product based on the outputs of the validation, image analysis, enrichment, and standardization agents.
Return ONLY a valid JSON object matching this schema:
{
  "summary": "string (human readable synthesis of actions taken)",
  "changes_made": [{"field": "string", "before": "string", "after": "string"}],
  "missing_information": ["string", "string"],
  "warnings": ["string"],
  "confidence_score": 0.85,
  "enriched_fields": { ... the final standardized data ... }
}"""

async def run(reports: List[Dict[str, Any]], final_data: Dict[str, Any]) -> Dict[str, Any]:
    client = get_llm_client()
    
    # Strip some massive data to save context window if necessary, but assuming reports are small enough
    prompt = f"Agent Reports History:\n{json.dumps(reports, indent=2)}\n\nFinal Output Data:\n{json.dumps(final_data, indent=2)}"
    
    try:
        response = await client.generate_text(prompt, SYSTEM_PROMPT, json_mode=True)
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].strip()
            
        data = json.loads(response)
        
        # Ensure enriched_fields is populated correctly in the final output even if the LLM hallucinates
        data["enriched_fields"] = final_data
        
        return data
    except Exception as e:
        return {
            "summary": "Failed to generate review summary.",
            "changes_made": [],
            "missing_information": [],
            "warnings": [f"Review synthesis failed: {str(e)}"],
            "confidence_score": 0.0,
            "enriched_fields": final_data
        }
