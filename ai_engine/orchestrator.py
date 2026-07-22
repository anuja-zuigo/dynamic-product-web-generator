from .agents import agent_1_validation, agent_2_image, agent_3_enrichment, agent_4_standardization, agent_5_review

async def run_pipeline(product_data: dict, images: list) -> list:
    """
    Executes the 5-agent pipeline sequentially.
    Returns a list of agent reports formatted for the DB AIReport model.
    """
    reports = []
    
    input_snapshot = product_data.copy()
    
    # 1. Validation
    val_out = await agent_1_validation.run(product_data)
    reports.append({
        "agent_name": "validation",
        "input_snapshot": input_snapshot,
        "output": val_out,
        "confidence_score": 1.0 if val_out["passed"] else 0.0
    })
    
    if not val_out["passed"]:
        return reports
        
    # 2. Image Analysis
    img_out = await agent_2_image.run(images, product_data.get("category", "General"))
    reports.append({
        "agent_name": "image_analysis",
        "input_snapshot": {"images": images, "category": product_data.get("category")},
        "output": img_out,
        "confidence_score": 0.9 if img_out["passed"] else 0.5
    })
    
    if not img_out["passed"]:
        return reports
        
    captions = img_out.get("captions", [])
    
    # 3. Enrichment
    enrich_out = await agent_3_enrichment.run(product_data, captions)
    reports.append({
        "agent_name": "enrichment",
        "input_snapshot": {"product_data": product_data, "captions": captions},
        "output": enrich_out,
        "confidence_score": 0.8
    })
    
    # 4. Standardization
    standard_out = await agent_4_standardization.run(enrich_out)
    reports.append({
        "agent_name": "standardization",
        "input_snapshot": enrich_out,
        "output": standard_out,
        "confidence_score": 0.9
    })
    
    # 5. Review
    review_out = await agent_5_review.run(reports, standard_out)
    reports.append({
        "agent_name": "review",
        "input_snapshot": {"reports_so_far": len(reports), "final_data": standard_out},
        "output": review_out,
        "confidence_score": review_out.get("confidence_score", 0.8)
    })
    
    return reports
