# Technology Stack

## 1. Introduction

Selecting the appropriate technology stack is one of the most important decisions in software development. The technologies chosen for this project were selected based on the following criteria:

- Free and open source
- Suitable for MVP development
- Industry adoption
- Easy maintenance
- Good community support
- Scalability
- Learning value

---

# 2. Technology Stack Overview

| Layer | Technology |
|--------|------------|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT + bcrypt |
| Excel Processing | SheetJS (xlsx) |
| File Upload | Multer |
| HTTP Client | Axios |
| AI Chatbot | Google Gemini API |
| Version Control | Git & GitHub |

---

# 3. Frontend

## Technology Selected

React (Vite)

### Why React?

- Component-based architecture
- Reusable UI components
- Fast rendering using Virtual DOM
- Large developer community
- Easy API integration
- Industry-standard framework
- Excellent documentation

### Alternatives Considered

#### Angular

Advantages:
- Complete framework
- Built-in features

Why Not?

- Steeper learning curve
- More boilerplate
- Overkill for this MVP

#### Vue.js

Advantages:
- Easy to learn
- Lightweight

Why Not?

- Smaller ecosystem
- Less commonly used in enterprise React-based projects

### Final Decision

React was selected because it provides the best balance of simplicity, scalability, and industry adoption.

---

# 4. Styling

## Technology Selected

Tailwind CSS

### Why Tailwind CSS?

- Utility-first approach
- Faster UI development
- Highly customizable
- Responsive design
- No unnecessary CSS files

### Alternative

Bootstrap

Why Not?

- Generic appearance
- Harder to customize
- Less flexible for modern UI design

### Final Decision

Tailwind CSS was selected because it enables rapid development while maintaining complete design flexibility.

---

# 5. Backend

## Technology Selected

Node.js + Express.js

### Why Node.js?

- JavaScript on both frontend and backend
- Fast development
- Event-driven architecture
- Large package ecosystem

### Why Express?

- Lightweight
- Minimal configuration
- REST API friendly
- Excellent documentation
- Widely adopted

### Alternatives

#### Django

Advantages

- Secure
- Built-in admin panel

Why Not?

- Python backend while frontend uses JavaScript
- Higher learning overhead for this project

#### Spring Boot

Advantages

- Enterprise-grade

Why Not?

- Complex setup
- Excessive for a 6-day MVP

### Final Decision

Node.js with Express.js provides the fastest and most practical solution for building REST APIs in this project.

---

# 6. Database

## Technology Selected

MongoDB Atlas

### Why MongoDB?

- Flexible document model
- Easy integration with JavaScript
- Cloud-hosted free tier
- Suitable for evolving product data
- No complex migrations during MVP development

### Alternative

MySQL

Advantages

- Strong relational integrity
- Structured schema

Why Not?

- Product information may evolve frequently
- More rigid schema changes
- Additional setup effort for this MVP

### Final Decision

MongoDB was selected because it offers flexibility and faster development for product catalog management.

---

# 7. Authentication


### Google OAuth

Google OAuth enables users to securely authenticate using their Google account.

Benefits

- Faster onboarding
- Improved user experience
- Trusted authentication
- Reduced password management

The application supports both Email Authentication and Google OAuth.


## Technology Selected

JWT + bcrypt

### Why JWT?

- Stateless authentication
- Lightweight
- Easy API integration
- Suitable for REST architecture

### Why bcrypt?

- Secure password hashing
- Industry-standard password protection

### Alternative

Session Authentication

Why Not?

- Requires server-side session management
- Less suitable for REST APIs

### Final Decision

JWT with bcrypt provides a secure and scalable authentication mechanism.

---

# 8. Excel Processing

## Technology Selected

SheetJS (xlsx)

### Why?

- Reads Excel files efficiently
- Supports .xlsx format
- Easy integration with Node.js
- Well documented

### Alternative

ExcelJS

Why Not?

- Better suited for generating Excel files
- SheetJS is simpler for reading and importing data

### Final Decision

SheetJS was selected because the primary requirement is reading and processing Excel files.

---

# 9. File Upload

## Technology Selected

Multer

### Why?

- Handles multipart/form-data
- Supports image uploads
- Supports Excel uploads
- Lightweight
- Popular Express middleware

### Alternative

Formidable

Why Not?

- Less commonly used in Express projects

### Final Decision

Multer provides a simple and reliable solution for handling file uploads.

---

# 10. AI Integration

## Technology Selected

Google Gemini API

### Why?

- Free tier available
- Easy REST API integration
- Good response quality
- Suitable for implementing a basic chatbot

### Alternative

OpenAI API

Why Not?

- Paid usage for most practical scenarios

### Final Decision

Gemini API was selected because it offers a cost-effective solution suitable for the project requirements.

---

# 11. Summary

The selected technology stack prioritizes simplicity, scalability, maintainability, and rapid development while remaining completely suitable for a 6-day MVP implementation.

Every technology was selected based on project requirements rather than popularity.

# 12. Technology Selection Principles

The following principles were followed while selecting the technology stack:

- Prefer free and open-source technologies.
- Choose technologies with strong community support.
- Minimize setup complexity.
- Select tools suitable for rapid MVP development.
- Prefer technologies that integrate well with JavaScript.
- Avoid unnecessary frameworks and libraries.
- Keep the architecture simple, maintainable, and scalable.