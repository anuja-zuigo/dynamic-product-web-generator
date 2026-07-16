# API Documentation

This document outlines the API endpoints exposed by the Node.js/Express server. All endpoints are prefixed with `/api`.

## 1. Authentication Endpoints (`/auth`)

*   **POST** `/auth/signup`
    *   *Description*: Creates a new admin or customer account.
    *   *Request Body*: `{ "name": "...", "email": "...", "password": "...", "role": "admin|customer" }`
    *   *Response*: `201 Created` with standard token payload.

*   **POST** `/auth/login`
    *   *Description*: Validates credentials and returns JWT.
    *   *Request Body*: `{ "email": "...", "password": "..." }`
    *   *Response*: `200 OK` with JSON Web Token.

## 2. Product Management Endpoints (`/products`)

*   **GET** `/products`
    *   *Description*: Retrieves a list of active products. Supports sorting/pagination.
    *   *Response*: `200 OK` with an array of product documents.

*   **GET** `/products/:slug`
    *   *Description*: Retrieves details for a specific product by its URL slug.
    *   *Response*: `200 OK` with a single product document.

*   **POST** `/products` (Admin Only)
    *   *Description*: Creates a product manually.
    *   *Response*: `201 Created`.

*   **PUT** `/products/:id` (Admin Only)
    *   *Description*: Updates a product's parameters directly.
    *   *Response*: `200 OK`.

*   **DELETE** `/products/:id` (Admin Only)
    *   *Description*: Removes a product from the registry.
    *   *Response*: `200 OK`.

## 3. Import Endpoints (`/imports`)

*   **POST** `/imports/excel` (Admin Only)
    *   *Description*: Uploads an Excel sheet and executes CRUD transactions.
    *   *Content-Type*: `multipart/form-data`
    *   *Body*: File key `excel_file` containing the `.xlsx` file.
    *   *Response*: `200 OK` with detailed report of records inserted, modified, or deleted.

*   **POST** `/imports/images` (Admin Only)
    *   *Description*: Uploads one or more product images to be mapped.
    *   *Content-Type*: `multipart/form-data`
    *   *Body*: File keys `product_images[]` containing image files.
    *   *Response*: `200 OK` listing the uploaded filenames.

## 4. Chatbot Endpoints (`/chatbot`)

*   **POST** `/chatbot/prompt`
    *   *Description*: Submits user prompt and fetches responses from Gemini API.
    *   *Request Body*: `{ "prompt": "...", "conversationHistory": [...] }`
    *   *Response*: `200 OK` with `{ "reply": "..." }`.
