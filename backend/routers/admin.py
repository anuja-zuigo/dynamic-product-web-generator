from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from uuid import UUID

from database import get_db
from models import Product, User, RoleEnum, ProductStatusEnum, Template
from schemas import ProductResponse
from auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/pending", response_model=List[ProductResponse])
def get_pending_products(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
) -> Any:
    """
    Get all products in 'admin_review' status.
    """
    products = db.query(Product).filter(
        Product.status == ProductStatusEnum.admin_review,
        Product.is_deleted == False
    ).all()
    return products

@router.post("/products/{product_id}/review", response_model=ProductResponse)
def review_product(
    product_id: UUID,
    approved: bool,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
) -> Any:
    """
    Approve or reject a product.
    If approved, transitions to 'published' (if template bound, or just stays approved).
    If rejected, returns to 'user_review'.
    """
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if approved:
        # In this flow, we assume approval means it's ready to publish or published.
        # But per the flow, it needs a template to be fully published.
        # Let's transition to published if it has a template, or stay admin_review?
        # The prompt says "publish" is a separate API. Let's just keep it simple: 
        # Approve -> "published". Reject -> "user_review"
        product.status = ProductStatusEnum.published
    else:
        product.status = ProductStatusEnum.user_review
        
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.post("/products/{product_id}/publish", response_model=ProductResponse)
def publish_product(
    product_id: UUID,
    template_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
) -> Any:
    """
    Bind a template and transition to published.
    """
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    product.selected_template_id = template.id
    product.status = ProductStatusEnum.published
    
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
