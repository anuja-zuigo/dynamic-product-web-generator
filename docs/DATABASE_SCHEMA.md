# Database Schema (Phase 4)

This document describes the schema implemented in the PostgreSQL database via SQLAlchemy models and Alembic migrations.

## `users`
- `id`: UUID (Primary Key)
- `email`: String (Unique, Indexed, Not Null)
- `password_hash`: String (Not Null)
- `role`: Enum (`user`, `admin`) (Default: `user`)
- `company_name`: String (Nullable)
- `created_at`: DateTime (Timezone aware, default `now()`)
- `updated_at`: DateTime (Timezone aware, auto-updates on change)

## `templates`
- `id`: UUID (Primary Key)
- `name`: Enum (`electronics`, `fashion`, `medical`, `corporate`, `minimal`, `luxury`) (Unique, Not Null)
- `slug`: String (Unique, Not Null)
- `config`: JSONB (Theme tokens, layout options) (Not Null)
- `is_active`: Boolean (Default: `True`)

## `products`
- `id`: UUID (Primary Key)
- `owner_id`: UUID (Foreign Key to `users.id`, Not Null)
- `sku`: String (Not Null)
- `title`: String (Nullable)
- `short_description`: String (Nullable)
- `long_description`: String (Nullable)
- `category`: String (Nullable)
- `price`: Float (Nullable)
- `status`: Enum (`draft`, `submitted`, `ai_processing`, `user_review`, `admin_review`, `published`) (Default: `draft`)
- `availability`: Enum (`active`, `offline`) (Default: `offline`)
- `is_deleted`: Boolean (Soft delete flag, Default: `False`)
- `selected_template_id`: UUID (Foreign Key to `templates.id`, Nullable)
- `created_at`: DateTime (Timezone aware, default `now()`)
- `updated_at`: DateTime (Timezone aware, auto-updates on change)

## `product_images`
- `id`: UUID (Primary Key)
- `product_id`: UUID (Foreign Key to `products.id`, Not Null)
- `imagekit_url`: String (Not Null)
- `imagekit_file_id`: String (Not Null)
- `is_primary`: Boolean (Default: `False`)
- `position`: Integer (Default: 0)
- `created_at`: DateTime (Timezone aware, default `now()`)

## `ai_reports`
- `id`: UUID (Primary Key)
- `product_id`: UUID (Foreign Key to `products.id`, Not Null)
- `agent_name`: Enum (`validation`, `image_analysis`, `enrichment`, `standardization`, `review`) (Not Null)
- `input_snapshot`: JSONB (Not Null)
- `output`: JSONB (Not Null)
- `confidence_score`: Float (Nullable)
- `warnings`: JSONB (Nullable)
- `created_at`: DateTime (Timezone aware, default `now()`)

## `audit_logs`
- `id`: UUID (Primary Key)
- `actor_id`: UUID (Foreign Key to `users.id`, Not Null)
- `action`: String (Not Null)
- `entity_type`: String (Not Null)
- `entity_id`: UUID (Not Null)
- `before`: JSONB (Nullable)
- `after`: JSONB (Nullable)
- `created_at`: DateTime (Timezone aware, default `now()`)
