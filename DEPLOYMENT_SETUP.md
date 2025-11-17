# Production Deployment Setup Guide

## Production URLs
**Primary URL:** `https://safe-report-app.replit.app`  
**Custom Domain:** `https://app.safetechenv.com`

Both domains point to the same production deployment running both backend and frontend.

## Required Environment Variables for Production Deployment

To make your production backend work, you **must** configure the following environment variables in your Replit deployment settings:

### 1. Database Credentials (Required)
These are needed for PostgreSQL connection:

- `DATABASE_URL` - Full PostgreSQL connection string
- `PGDATABASE` - Database name
- `PGHOST` - Database host
- `PGPASSWORD` - Database password
- `PGPORT` - Database port (usually 5432)
- `PGUSER` - Database username

### 2. Authentication (Required)
- `JWT_SECRET` - Secret key for JWT token signing

### 3. Mobile App (Required)
- `MOBILE_APP_KEY` - Key for mobile app authentication

### 4. AWS S3 (Optional - Only if using file uploads to S3)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - Already set in .env file (ca-central-1)
- `AWS_S3_BUCKET` - Already set in .env file (safetech-dev-images)

### 5. Email/SMTP (Optional - Only if sending emails)
- SMTP credentials if needed

## How to Configure Production Secrets

1. **Open Deployments Panel** in your Replit workspace
2. **Go to your deployment** (`safe-report-app`)
3. **Find "Environment Variables" or "Secrets" section**
4. **Add each variable** listed above with its corresponding value from your development environment
5. **Redeploy** your application

## Where to Get These Values

All sensitive values are currently stored in your **Replit Workspace Secrets**. You can:
1. Check your workspace secrets panel
2. Copy each value to your production deployment secrets
3. Use the same values for both development and production

## After Configuration

Once all secrets are configured:
1. **Build frontend**: `pnpm build:fe`
2. **Redeploy** your application
3. **Test backend** with Postman: `https://safe-report-app.replit.app/api/v1/dashboard`
4. **Test frontend** in browser: `https://app.safetechenv.com` or `https://safe-report-app.replit.app`
5. Both URLs should work and show the full application

## Architecture Overview

```
Production Deployment (Single VM):
├── Deployment: safe-report-app
│   ├── URL 1: https://safe-report-app.replit.app
│   ├── URL 2: https://app.safetechenv.com (custom domain)
│   ├── Backend: Port 8080 → serves /api/v1 endpoints
│   ├── Frontend: Port 5000 → serves static files (default route)
│   └── Environment: Production secrets configured in deployment
│
└── How it works:
    ├── Both URLs point to the same deployment
    ├── Frontend served on port 5000 (main port)
    ├── Backend API accessible at /api/v1 on same domain
    └── Frontend calls /api/v1 (relative path, same domain)

Development Setup (Unchanged):
├── Backend Workflow: Port 8080
│   ├── URL: https://...replit.dev:8080
│   └── Environment: Workspace secrets
│
└── Frontend Workflow: Port 5000
    ├── URL: http://localhost:5000
    ├── Vite dev server with proxy
    └── Connects to: /api/v1 (proxied to localhost:8080)
```

## CORS Configuration

Backend CORS is configured to allow:
- `http://localhost:5000` (development)
- `https://app.safetechenv.com` (production frontend)
- All `.replit.dev` URLs (development testing)

## Notes

- Development environment remains completely unchanged (separate Backend and Frontend workflows)
- Production runs both backend and frontend on the same VM deployment
- Both `safe-report-app.replit.app` and `app.safetechenv.com` point to the same deployment
- Frontend uses relative path `/api/v1` in production (same domain)
- All production secrets must be manually configured in deployment settings
- Frontend must be built (`pnpm build:fe`) before deployment
