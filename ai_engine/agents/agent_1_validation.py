from typing import Dict, Any

async def run(product_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic validation.
    Input: product_data with fields title, sku, category, price
    Output: {"passed": bool, "errors": list, "warnings": list}
    """
    errors = []
    warnings = []
    
    if not product_data.get("sku"):
        errors.append({"field": "sku", "message": "SKU is required"})
        
    price = product_data.get("price")
    if price is None or price <= 0:
        errors.append({"field": "price", "message": "Price must be greater than 0"})
        
    if not product_data.get("category"):
        warnings.append({"field": "category", "message": "Category is missing"})
        
    return {
        "passed": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }
