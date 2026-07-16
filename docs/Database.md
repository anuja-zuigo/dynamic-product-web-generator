# Database Design

## 1. Introduction

The application uses MongoDB Atlas as the primary database.

MongoDB was selected because it provides a flexible document-based data model that integrates naturally with JavaScript applications and enables rapid MVP development.

The database is designed to support a multi-user SaaS platform where each registered user can securely manage their own product catalog using Excel imports or manual product creation.

The design focuses on simplicity, scalability, maintainability, and data ownership.

---

# 2. Database Collections

The application consists of the following collections:

- User
- Product
- ImportLog

---

# 3. Collection: User

## Purpose

Stores registered user information used for authentication and authorization.

Each user owns their own products and import history.

### Fields

| Field | Type | Description |
|--------|------|-------------|
| userId | String (PK) | Unique User ID |
| fullName | String | User's full name |
| email | String | Unique email address |
| passwordHash | String | Encrypted password (Email login only) |
| authProvider | String | EMAIL or GOOGLE |
| createdAt | Date | Account creation timestamp |
| updatedAt | Date | Last profile update timestamp |

---

# 4. Collection: Product

## Purpose

Stores all product information created or imported by a registered user.

Each product belongs to exactly one user.

### Fields

| Field | Type | Description |
|--------|------|-------------|
| productId | String (PK) | Unique Product ID |
| ownerId | String (FK) | User who owns the product |
| name | String | Product name |
| description | String | Product description |
| brand | String | Product brand |
| category | String | Product category |
| price | Number | Product price |
| currency | String | Product currency (e.g., INR) |
| stock | Number | Available stock |
| imageName | String | Product image filename |
| status | String | ACTIVE / INACTIVE / DISCONTINUED |
| createdAt | Date | Product creation timestamp |
| updatedAt | Date | Last modification timestamp |

---

# 5. Collection: ImportLog

## Purpose

Stores the summary of every Excel import performed by a registered user.

Each import generates one ImportLog record.

### Fields

| Field | Type | Description |
|--------|------|-------------|
| importId | String (PK) | Unique Import ID |
| ownerId | String (FK) | User who performed the import |
| fileName | String | Uploaded Excel filename |
| uploadedAt | Date | Import timestamp |
| createdCount | Number | Number of products created |
| updatedCount | Number | Number of products updated |
| deletedCount | Number | Number of products deleted |
| failedCount | Number | Number of failed records |
| status | String | SUCCESS / PARTIAL_SUCCESS / FAILED |
| remarks | String | Import validation remarks |

---

# 6. Relationships

## User → Product

Relationship

One User can own multiple Products.

Cardinality

```
1 : Many
```

---

## User → ImportLog

Relationship

One User can perform multiple Excel imports.

Cardinality

```
1 : Many
```

---

# 7. Primary Keys

| Collection | Primary Key |
|------------|-------------|
| User | userId |
| Product | productId |
| ImportLog | importId |

---

# 8. Foreign Keys

| Collection | Foreign Key |
|------------|-------------|
| Product | ownerId |
| ImportLog | ownerId |

---

# 9. Database Design Principles

The database has been designed using the following principles:

- Multi-user architecture
- Data ownership
- Simplicity
- Scalability
- Data integrity
- Minimal redundancy
- Easy maintenance
- Fast product retrieval
- Support for bulk Excel operations
- Secure user isolation

---

# 10. Future Scope

The database can be extended in the future by adding:

- Category Collection
- Brand Collection
- Chat History
- Product Reviews
- Supplier Management
- Order Management
- Inventory Management
- Audit Logs
- Team Collaboration
- Organization / Workspace Support

without affecting the existing architecture.


---

# 11. Entity Relationship Diagram

The Entity Relationship Diagram (ERD) for the database design is available in:

```
docs/design/ERD.png
```

The editable Mermaid source is stored as:

```
docs/design/ERD.mmd
```