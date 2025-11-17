# Production Deployment Setup Guide

## Backend Production URL
**Production Backend:** `https://safe-report-app.replit.app`

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
1. **Redeploy** your backend
2. **Test** with Postman: `https://safe-report-app.replit.app/api/v1/dashboard`
3. **Should return data** instead of 500 error
4. **Rebuild frontend** with new backend URL
5. **Redeploy frontend** to `https://app.safetechenv.com`

## Architecture Overview

```
Production Setup:
├── Backend:  https://safe-report-app.replit.app
│   ├── Port: 8080 (internal)
│   ├── Exposed as: https://safe-report-app.replit.app (no port in URL)
│   └── Environment: Production secrets configured in deployment
│
└── Frontend: https://app.safetechenv.com
    ├── Custom domain pointing to frontend deployment
    └── Connects to: https://safe-report-app.replit.app/api/v1

Development Setup (Unchanged):
├── Backend:  https://...replit.dev:8080
│   ├── Port: 8080
│   └── Environment: Workspace secrets
│
└── Frontend: http://localhost:5000
    ├── Vite dev server with proxy
    └── Connects to: /api/v1 (proxied to localhost:8080)
```

## CORS Configuration

Backend CORS is configured to allow:
- `http://localhost:5000` (development)
- `https://app.safetechenv.com` (production frontend)
- All `.replit.dev` URLs (development testing)

## Notes

- Development environment remains completely unchanged
- Production deployment runs backend-only (no frontend)
- Frontend is deployed separately to custom domain
- All production secrets must be manually configured in deployment settings
