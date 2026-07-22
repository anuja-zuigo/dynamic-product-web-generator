import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from uuid import UUID

from imagekitio import ImageKit

from database import get_db
from models import Product, User, RoleEnum, ProductImage
from schemas import ImageKitAuthResponse, ProductImageCreate, ProductImageResponse
from auth import get_current_user

router = APIRouter(prefix="/images", tags=["images"])

IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY", "dummy_public_key")
IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY", "dummy_private_key")
IMAGEKIT_URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/dummy")

# Initialize ImageKit only if we have keys (prevents crashing locally if missing)
try:
    imagekit = ImageKit(
        public_key=IMAGEKIT_PUBLIC_KEY,
        private_key=IMAGEKIT_PRIVATE_KEY,
        url_endpoint=IMAGEKIT_URL_ENDPOINT
    )
except Exception:
    imagekit = None

@router.get("/auth", response_model=ImageKitAuthResponse)
def get_imagekit_auth(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get ImageKit signed authentication parameters for client-side upload.
    """
    if not imagekit:
        # Fallback for development if keys aren't set
        import time
        import uuid
        import hmac
        import hashlib
        
        token = str(uuid.uuid4())
        expire = int(time.time()) + 600
        signature = hmac.new(
            IMAGEKIT_PRIVATE_KEY.encode('utf-8'),
            (token + str(expire)).encode('utf-8'),
            hashlib.sha1
        ).hexdigest()
        
        return {
            "token": token,
            "expire": expire,
            "signature": signature,
            "publicKey": IMAGEKIT_PUBLIC_KEY
        }
        
    auth_params = imagekit.get_authentication_parameters()
    auth_params["publicKey"] = IMAGEKIT_PUBLIC_KEY
    return auth_params

@router.post("/products/{product_id}", response_model=ProductImageResponse, status_code=status.HTTP_201_CREATED)
def associate_image(
    product_id: UUID,
    image_in: ProductImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Save ImageKit upload results to a product.
    """
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if current_user.role != RoleEnum.admin and product.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    image = ProductImage(
        **image_in.model_dump(),
        product_id=product_id
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image
