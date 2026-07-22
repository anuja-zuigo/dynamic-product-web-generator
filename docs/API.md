# Backend API Documentation

The backend exposes the following FastAPI endpoints. Base URL is `/` (usually `http://localhost:5000` or `8000`).

## 1. Authentication
- `POST /auth/login`: Accepts `username` (email) and `password`. Returns JWT token.
- `POST /auth/register`: Creates a new user with `user` role.

## 2. Products
- `GET /products`: Returns all active products for the current user. Filters out `is_deleted=true`.
- `POST /products`: Creates a new draft product.
- `GET /products/{id}`: Returns details of a specific product.
- `PUT /products/{id}`: Updates product details. Status transitions to `submitted` will enforce a 3-image minimum.
- `DELETE /products/{id}`: Soft deletes the product (`is_deleted = True`).

## 3. Images
- `GET /images/auth`: Returns ImageKit authentication parameters (token, expire, signature) for client-side upload.
- `POST /images/products/{id}`: Associates a successfully uploaded image (via `imagekit_url` and `file_id`) to the product.

## 4. AI Pipeline
- `POST /ai/products/{id}/trigger`: Triggers the 5-agent AI pipeline. Generates deterministic mock `ai_reports` matching `SKILLS.md` and returns them. Status transitions to `ai_processing` then `user_review`.
- `GET /ai/products/{id}/reports`: Returns all AI reports for a specific product.

## 5. Admin & Publishing
*(Requires `admin` role)*
- `GET /admin/pending`: Lists all products currently in `admin_review`.
- `POST /admin/products/{id}/review`: Accepts `approved` boolean. If true, moves to `published`. If false, returns to `user_review`.
- `POST /admin/products/{id}/publish`: Binds a `template_id` to the product and marks it as `published`.
