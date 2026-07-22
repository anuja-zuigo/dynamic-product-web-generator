import uuid
from sqlalchemy import Boolean, Column, String, Float, ForeignKey, Integer, Enum as SQLEnum, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base

class RoleEnum(str, enum.Enum):
    user = "user"
    admin = "admin"

class ProductStatusEnum(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    ai_processing = "ai_processing"
    user_review = "user_review"
    admin_review = "admin_review"
    published = "published"

class ProductAvailabilityEnum(str, enum.Enum):
    active = "active"
    offline = "offline"

class AgentNameEnum(str, enum.Enum):
    validation = "validation"
    image_analysis = "image_analysis"
    enrichment = "enrichment"
    standardization = "standardization"
    review = "review"

class TemplateNameEnum(str, enum.Enum):
    electronics = "electronics"
    fashion = "fashion"
    medical = "medical"
    corporate = "corporate"
    minimal = "minimal"
    luxury = "luxury"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.user, nullable=False)
    company_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    products = relationship("Product", back_populates="owner")
    audit_logs = relationship("AuditLog", back_populates="actor")


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(SQLEnum(TemplateNameEnum), unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    config = Column(JSONB, nullable=False) # theme tokens, layout options
    is_active = Column(Boolean, default=True)

    products = relationship("Product", back_populates="selected_template")


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sku = Column(String, nullable=False)
    title = Column(String, nullable=True)
    short_description = Column(String, nullable=True)
    long_description = Column(String, nullable=True)
    category = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    status = Column(SQLEnum(ProductStatusEnum), default=ProductStatusEnum.draft, nullable=False)
    availability = Column(SQLEnum(ProductAvailabilityEnum), default=ProductAvailabilityEnum.offline, nullable=False)
    is_deleted = Column(Boolean, default=False)
    selected_template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="products")
    selected_template = relationship("Template", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    ai_reports = relationship("AIReport", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    imagekit_url = Column(String, nullable=False)
    imagekit_file_id = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="images")


class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    agent_name = Column(SQLEnum(AgentNameEnum), nullable=False)
    input_snapshot = Column(JSONB, nullable=False)
    output = Column(JSONB, nullable=False)
    confidence_score = Column(Float, nullable=True)
    warnings = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="ai_reports")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    before = Column(JSONB, nullable=True)
    after = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    actor = relationship("User", back_populates="audit_logs")
