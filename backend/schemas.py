from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from models import RoleEnum, ProductStatusEnum, ProductAvailabilityEnum, AgentNameEnum, TemplateNameEnum

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    company_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    role: RoleEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Product Image Schemas ---
class ProductImageBase(BaseModel):
    imagekit_url: str
    imagekit_file_id: str
    is_primary: bool = False
    position: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: UUID
    product_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- AI Report Schemas ---
class AIReportBase(BaseModel):
    agent_name: AgentNameEnum
    input_snapshot: Dict[str, Any]
    output: Dict[str, Any]
    confidence_score: Optional[float] = None
    warnings: Optional[List[Dict[str, Any]]] = None

class AIReportCreate(AIReportBase):
    pass

class AIReportResponse(AIReportBase):
    id: UUID
    product_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Product Schemas ---
class ProductBase(BaseModel):
    title: Optional[str] = None
    sku: str
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    availability: ProductAvailabilityEnum = ProductAvailabilityEnum.offline

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    sku: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    availability: Optional[ProductAvailabilityEnum] = None
    status: Optional[ProductStatusEnum] = None
    selected_template_id: Optional[UUID] = None

class ProductResponse(ProductBase):
    id: UUID
    owner_id: UUID
    status: ProductStatusEnum
    is_deleted: bool
    selected_template_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    images: List[ProductImageResponse] = []
    ai_reports: List[AIReportResponse] = []

    class Config:
        from_attributes = True

# --- ImageKit Auth Schema ---
class ImageKitAuthResponse(BaseModel):
    token: str
    expire: int
    signature: str
    publicKey: str

# --- Auth Token Schema ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
