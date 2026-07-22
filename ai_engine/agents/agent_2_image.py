import json
from typing import Dict, Any, List
from ..llm_client import get_llm_client

SYSTEM_PROMPT = """You are an expert product image analyst.
Analyze the provided product image. Check if it's blurry, if it matches the declared category, and extract a brief caption describing what the image shows.
Return ONLY a valid JSON object matching this schema:
{
  "issues": [{"type": "blur" | "wrong_category" | "poor_lighting", "severity": "warning" | "error", "description": "string"}],
  "caption": "string"
}"""

async def run(images: List[Dict[str, Any]], declared_category: str) -> Dict[str, Any]:
    """
    Analyzes images via LLM Vision model.
    Input: list of images {"imagekit_url": ...}, declared_category
    """
    if len(images) < 3:
        return {"passed": False, "image_count": len(images), "issues": [{"type": "insufficient_images", "severity": "error", "description": "Minimum 3 images required"}], "captions": []}
        
    client = get_llm_client()
    issues = []
    captions = []
    
    prompt = f"The product is claimed to be in category: '{declared_category}'. Analyze the image and return the JSON."
    
    for img in images:
        url = img.get("imagekit_url")
        if url:
            try:
                # Ask Ollama Vision to analyze the image
                response = await client.analyze_image(url, prompt, SYSTEM_PROMPT)
                
                # Parse JSON
                try:
                    # Clean markdown if present
                    if "```json" in response:
                        response = response.split("```json")[1].split("```")[0].strip()
                    elif "```" in response:
                        response = response.split("```")[1].strip()
                        
                    data = json.loads(response)
                    
                    if data.get("issues"):
                        for issue in data["issues"]:
                            issue["image_url"] = url
                            issues.append(issue)
                    
                    if data.get("caption"):
                        captions.append(data["caption"])
                except json.JSONDecodeError:
                    issues.append({"type": "parse_error", "severity": "warning", "description": f"Failed to parse vision response for image: {response}"})
            except Exception as e:
                issues.append({"type": "api_error", "severity": "warning", "description": f"Error calling vision model: {str(e)}"})
                
    has_errors = any(i.get("severity") == "error" for i in issues)
    
    return {
        "passed": not has_errors,
        "image_count": len(images),
        "issues": issues,
        "captions": captions
    }
