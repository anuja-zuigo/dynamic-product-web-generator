from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from uuid import UUID

from database import get_db
from models import Product, User, RoleEnum, ProductStatusEnum, ProductImage
from schemas import ProductCreate, ProductUpdate, ProductResponse
from auth import get_current_user

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all active products for the current user.
    """
    if current_user.role == RoleEnum.admin:
        # Admins can see all active products
        products = db.query(Product).filter(Product.is_deleted == False).all()
    else:
        products = db.query(Product).filter(
            Product.owner_id == current_user.id,
            Product.is_deleted == False
        ).all()
    return products

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new product draft.
    """
    product = Product(
        **product_in.model_dump(),
        owner_id=current_user.id,
        status=ProductStatusEnum.draft
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific product by ID.
    """
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if current_user.role != RoleEnum.admin and product.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a product.
    """
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if current_user.role != RoleEnum.admin and product.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    update_data = product_in.model_dump(exclude_unset=True)
    
    # Enforce 3-image minimum if transitioning to submitted
    if update_data.get('status') == ProductStatusEnum.submitted:
        image_count = db.query(ProductImage).filter(ProductImage.product_id == product.id).count()
        if image_count < 3:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot submit product. Minimum 3 images required, found {image_count}."
            )
            
    for field, value in update_data.items():
        setattr(product, field, value)
        
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def soft_delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Soft delete a product.
    """
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if current_user.role != RoleEnum.admin and product.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    product.is_deleted = True
    db.add(product)
    
    # Cascade delete associated product images and AI reports to prevent stale references
    from models import ProductImage, AIReport
    db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
    db.query(AIReport).filter(AIReport.product_id == product.id).delete()
    
    db.commit()
    return {"message": "Product deleted successfully"}
