# User Flow

## Overview

The application consists of two user roles:

- Registered User (Business Owner)
- Customer (Public Visitor)

A registered user can manage their own products, while customers can browse dynamically generated product pages.

---

# 1. User Authentication Flow

```
Landing Page
      │
      ▼
Sign Up
      │
      ▼
Login
      │
      ▼
Dashboard
```

Users can register using:

- Email & Password
- Google Sign-In

Authentication is mandatory before accessing the dashboard.

---

# 2. User Dashboard Flow

```
Dashboard
      │
 ┌────┼──────────────────────────────┐
 ▼    ▼                              ▼
Add Product      Bulk Product Import      My Products
 │                  │                     │
 ▼                  ▼                     ▼
Fill Form      Upload Excel         Search / Filter
 │                  │                     │
 ▼                  ▼                     ▼
Validation     Smart Import Engine   Edit / Delete
 │                  │
 ▼                  ▼
Database Updated
 │
 ▼
Dynamic Product Pages Updated
```

---

# 3. Bulk Import Flow

```
Upload Excel
      │
      ▼
Read Excel
      │
      ▼
Smart Column Mapping
      │
      ▼
Data Validation
      │
      ▼
Duplicate Detection
      │
      ▼
Image Validation
      │
      ▼
CRUD Processing
      │
      ▼
Import Summary
      │
      ▼
Import Log Stored
```

---

# 4. Customer Flow

```
Customer Visits Website
      │
      ▼
Home Page
      │
      ▼
Browse Products
      │
      ▼
Product Details
      │
 ┌────┴───────────┐
 ▼                ▼
AI Chatbot   Related Products
```

---

# 5. Key Decisions

- Every user must register before publishing products.
- Every product belongs to exactly one user.
- Users can manually add products.
- Users can bulk import products using Excel.
- Import history is stored for every upload.
- Dynamic product pages are generated from database records.