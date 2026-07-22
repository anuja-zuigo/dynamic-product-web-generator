from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from uuid import UUID
import json

from database import get_db
from models import Product, User, RoleEnum, ProductStatusEnum, AIReport, AgentNameEnum, ProductImage
from schemas import AIReportResponse
from auth import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from ai_engine.orchestrator import run_pipeline

@router.post("/products/{product_id}/trigger", response_model=List[AIReportResponse])
async def trigger_ai_pipeline(
    product_id: UUID,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Trigger the 5-agent AI pipeline using Ollama.
    """
    from database import SessionLocal
    
    # 1. Fetch initial data and commit status (short lived session)
    with SessionLocal() as db:
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.is_deleted == False
        ).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        if current_user.role != RoleEnum.admin and product.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
            
        images = db.query(ProductImage).filter(ProductImage.product_id == product.id).order_by(ProductImage.position).all()
        if len(images) < 3:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot trigger AI. Minimum 3 images required, found {len(images)}."
            )

        product.status = ProductStatusEnum.ai_processing
        db.add(product)
        
        db.query(AIReport).filter(AIReport.product_id == product.id).delete()
        db.commit()
        
        input_snapshot = {
            "title": product.title,
            "sku": product.sku,
            "category": product.category or "General",
            "price": product.price,
            "short_description": product.short_description
        }
        image_dicts = [{"imagekit_url": img.imagekit_url} for img in images]

    # 2. Run the real AI pipeline WITHOUT holding a DB connection
    try:
        pipeline_reports = await run_pipeline(input_snapshot, image_dicts)
    except Exception as e:
        with SessionLocal() as db:
            prod = db.query(Product).filter(Product.id == product_id).first()
            if prod:
                prod.status = ProductStatusEnum.draft
                db.commit()
        raise HTTPException(status_code=500, detail=f"AI Pipeline failed: {str(e)}")
    
    # 3. Save the results (short lived session)
    with SessionLocal() as db:
        reports = []
        for rep in pipeline_reports:
            try:
                enum_val = AgentNameEnum(rep["agent_name"])
            except ValueError:
                continue
                
            reports.append(AIReport(
                product_id=product_id,
                agent_name=enum_val,
                input_snapshot=rep.get("input_snapshot", {}),
                output=rep.get("output", {}),
                confidence_score=rep.get("confidence_score", 0.0)
            ))
            
        db.add_all(reports)
        
        prod = db.query(Product).filter(Product.id == product_id).first()
        if prod:
            # Check if it actually completed the full pipeline
            has_review = any(r.agent_name == AgentNameEnum.review for r in reports)
            if has_review:
                prod.status = ProductStatusEnum.user_review
            else:
                prod.status = ProductStatusEnum.draft
            
        db.commit()
        
        return db.query(AIReport).filter(AIReport.product_id == product_id).all()

@router.get("/products/{product_id}/reports", response_model=List[AIReportResponse])
def get_ai_reports(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all AI reports for a product.
    """
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if current_user.role != RoleEnum.admin and product.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return db.query(AIReport).filter(AIReport.product_id == product.id).all()
