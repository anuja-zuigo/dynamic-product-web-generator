# Architecture Decision Records (ADR)

Project: Dynamic Web Page Generation of Products Using Excel Row Description

This document records all major architectural and technical decisions made during the development of this project.

Each decision answers:
- What decision was made?
- Why was it made?
- Why were other approaches not chosen?

---

## ADR-001 : Product ID as Business Identifier

### Decision

Use `productId` as the unique business identifier for every product.

MongoDB's `_id` will only be used internally by the database.

Example:

productId = P00001

### Why?

- Business users work with Product IDs.
- Excel CRUD operations become simple.
- Easy to debug.
- Easy to search.
- Matches enterprise Product Information Management (PIM) systems.

### Alternatives Considered

Use MongoDB `_id`

Rejected because:
- Not human readable.
- Difficult to use in Excel.
- Not suitable for business users.

---

## ADR-002 : Backend First Development

### Decision

Develop the backend before starting the frontend.

### Why?

- APIs become stable.
- Database schema becomes stable.
- Frontend development becomes easier.
- Easier debugging.
- Follows industry workflow.

---

## ADR-003 : Single Bulk Product Import Page

### Decision

Use one page called **Bulk Product Import** instead of separate pages for Excel upload and Image upload.

### Why?

- Simpler workflow.
- Less navigation.
- Less code.
- Better user experience.
- Both uploads are always related.

Workflow:

Select Excel

↓

Select Images

↓

Import

---

## ADR-004 : Image Storage Strategy

### Decision

Store product images inside the server uploads folder.

Store only the image filename inside MongoDB.

Example

image = nike-air-max.jpg

### Why?

- Faster implementation.
- Easier development.
- Lightweight database.
- Industry-friendly approach for MVP.

---

## ADR-005 : Dynamic Product Pages

### Decision

Every product will have its own dynamic URL.

Example

/products/P00001

/products/P00002

/products/P00003

### Why?

- Matches modern eCommerce platforms.
- No hardcoded pages.
- Automatically supports newly imported products.

---

## ADR-006 : Excel as Source of Truth

### Decision

The uploaded Excel file will contain all CRUD operations.

Operation values:

CREATE

UPDATE

DELETE

### Why?

- Simple processing.
- Easy validation.
- Business-friendly.
- Matches enterprise bulk import systems.

---

## ADR-007 : Keep MVP Simple

### Decision

Only implement features required for the problem statement.

Not included:

- Cart
- Orders
- Payment Gateway
- User Registration
- Seller Portal
- Analytics
- Reviews
- Inventory Forecasting

### Why?

The objective is to demonstrate dynamic product generation using Excel, not to build a complete eCommerce platform.

---

## ADR-008 : Tech Stack

Frontend
- React (Vite)
- Tailwind CSS

Backend
- Express.js

Database
- MongoDB Atlas

Authentication
- JWT
- bcrypt

Excel Processing
- SheetJS

Image Upload
- Multer

Chatbot
- Gemini API

### Why?

Chosen because they are:
- Free
- Beginner friendly
- Production capable
- Well documented
- Suitable for a 6-day MVP

---

Future ADRs will be added as the project evolves.


## ADR-009 : Separate app.js and server.js

### Decision

Keep Express application configuration inside `app.js` and server startup logic inside `server.js`.

### Why?

- Separation of responsibilities.
- Easier testing.
- Cleaner architecture.
- Industry-standard Express project structure.