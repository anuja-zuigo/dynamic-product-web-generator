# Deployment & Environment Documentation

## Local Development Setup

We use a hosted free-tier PostgreSQL database on Neon for development instead of local Docker. 

1. The database connection string is provided by Neon (which includes `sslmode=require`).
2. Ensure you have the Neon connection string ready for your `.env` file.

### Environment Variables

You need to configure your backend environment variables. Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

**Required Backend Environment Variables:**

- `DATABASE_URL`: The connection string to the database. For Neon, it must include `sslmode=require`. Example:
  ```
  DATABASE_URL=postgresql://neondb_owner:password@ep-square...aws.neon.tech/neondb?sslmode=require
  ```
- `SECRET_KEY`: Used for JWT signing.
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`: Required for ImageKit integration (Phase 3).

## Production Deployment

*(To be expanded in Phase 9)*
