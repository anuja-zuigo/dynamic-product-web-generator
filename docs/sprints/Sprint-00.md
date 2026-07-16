# Sprint 00 - Project Planning & Architecture

## Sprint Goal

Understand the problem statement, finalize the project architecture, freeze the technology stack, define the MVP scope, and prepare the project for development.

---

## Duration

Day 0

---

## Problem Statement

Dynamic Web Page Generation of Products Using Excel Row Description.

The system should allow administrators to upload an Excel sheet containing product information and CRUD operations. The application should process the Excel file, update the product database, and dynamically generate product web pages without modifying the application code or stopping the application.

---

## Objectives Achieved

- Understand the complete problem statement.
- Research enterprise product management systems.
- Finalize the MVP scope.
- Finalize the project architecture.
- Freeze the technology stack.
- Design the product workflow.
- Design the documentation structure.
- Plan the project using Agile Scrum.

---

## Architecture Decisions

### ADR-001

Use Product ID as the Business Identifier instead of MongoDB ObjectId.

### ADR-002

Backend First Development.

### ADR-003

Single Bulk Product Import page instead of separate Excel and Image upload pages.

### ADR-004

Store only image filenames in MongoDB while images remain in the uploads folder.

### ADR-005

Generate dynamic product pages using Product ID.

### ADR-006

Excel is the single source of truth for CRUD operations.

### ADR-007

Keep the project MVP-focused and avoid unnecessary eCommerce features.

### ADR-008

Use only free and production-ready technologies.

---

## Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas

### Authentication

- JWT
- bcrypt

### Excel Processing

- SheetJS (xlsx)

### File Upload

- Multer

### AI

- Gemini API

---

## Project Structure Finalized

- Client
- Server
- Documentation
- Sample Data
- Changelog
- README

---

## Documentation Created

- README.md
- CHANGELOG.md
- DECISIONS.md
- PROJECT_SCOPE.md
- PROJECT_RULES.md
- Architecture.md
- API.md
- Database.md
- UserFlow.md
- Sprint Folder

---

## Features Included in MVP

### Admin

- Admin Login
- Dashboard
- Product List
- Bulk Product Import

### Customer

- Home
- Products
- Dynamic Product Details
- AI Chatbot

---

## Features Excluded

- Cart
- Orders
- Payments
- User Registration
- Seller Portal
- Analytics
- Reviews
- Inventory Forecasting

---

## Deliverables

✅ Folder Structure

✅ Documentation

✅ Sprint Planning

✅ Architecture Frozen

✅ Development Workflow

---

## Learnings

- Importance of planning before coding.
- Importance of Architecture Decision Records.
- Difference between Product Requirements and Implementation.
- Importance of keeping the MVP focused.

---

## Sprint Retrospective

### What went well

- Clear understanding of the problem statement.
- Project scope finalized.
- Folder structure finalized.
- Technology stack frozen.
- Architecture frozen.

### What could be improved

- Nothing significant.

### Action Items

Start Sprint 01.

---

## Git Commit

docs(project): complete project planning, architecture and documentation

---

## Sprint Status

✅ COMPLETED