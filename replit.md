# SafeTech Environmental Ltd - Monorepo

## Overview
SafeTech is a full-stack environmental assessment management application. This monorepo contains both the frontend (React + Vite + TypeScript) and backend (Node.js + Express + Sequelize) applications.

## Project Structure
```
safetech-mono/
├── packages/
│   ├── frontend/         # React + Vite + TypeScript frontend
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   ├── backend/          # Node.js + Express + Sequelize backend
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── server.js
│   │   └── package.json
│   └── shared/           # (Future) Shared types/utilities
├── package.json          # Root workspace config
└── pnpm-workspace.yaml   # pnpm workspace definition
```

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router 7
- **Port**: 5000

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express 5
- **Database ORM**: Sequelize 6
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT
- **Port**: 8080 (publicly accessible)
- **Development URL**: https://9ddf8f58-2768-4062-96b6-6f709c8dbac2-00-1omg4hp6qmbo2.picard.replit.dev:8080
- **Production URL**: https://safe-report-app.replit.app

### Package Manager
- **pnpm** v10.16.1 with workspaces

## Environment Setup

### Database
- **Type**: PostgreSQL (Neon-hosted)
- **Schema**: Created via Sequelize models sync
- **Environment Variables**: Configured in `packages/backend/.env`

### Frontend Environment Variables
Located in `packages/frontend/.env`:
- `VITE_BASE_URL`: Backend API URL
- `VITE_NAME`: Application name
- `VITE_VERSION`: Application version

### Backend Environment Variables
Located in `packages/backend/.env`:
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (8080)
- Database credentials (PostgreSQL)
- JWT secret and expiration
- Email/SMTP configuration
- AWS credentials (optional)

## Development

### Running the Application
```bash
# Install dependencies
pnpm install

# Run both frontend and backend in parallel (recommended)
pnpm dev

# Run frontend only
pnpm dev:fe

# Run backend only
pnpm dev:be
```

### Building for Production
```bash
# Build frontend
pnpm build:fe

# Run backend in production
cd packages/backend && pnpm start
```

## Database Management

### Initial Setup
The database schema was initialized using Sequelize model sync:
```bash
cd packages/backend && node src/scripts/sync-db.js
```

### Migrations
Migration files exist in `packages/backend/src/migrations/` but the initial schema was created via model sync due to migration ordering issues.

## Key Features
- User authentication and authorization
- Project management
- Customer and location tracking
- Environmental assessment reports (Asbestos, Lead, Mercury, Mould, PCB, Silica)
- Lab report management
- Material tracking
- PDF report generation
- File upload handling

## Recent Changes 

### November 17, 2025

#### Production Deployment Architecture - Backend Serves Both API and Frontend
- **Fixed production deployment to properly serve both backend and frontend**
  - **Root Cause**: Production was running Vite preview server instead of serving built static files
  - **Solution**: Backend now serves frontend static files directly on port 5000
  - Single Node.js server handles both API and frontend in production
  - Production URLs: `https://safe-report-app.replit.app` and `https://app.safetechenv.com`
  - Development environment remains completely unchanged

- **Backend Configuration Updates**
  - Configured to serve frontend static files when `NODE_ENV=production`
  - Serves built files from `packages/frontend/dist` on port 5000
  - Handles client-side routing by serving `index.html` for all non-API routes
  - API endpoints remain at `/api/v1/*`
  - File: `packages/backend/src/config/app.js`

- **Deployment Configuration Updates**
  - Build command: `pnpm build:fe` (builds frontend static files)
  - Run command: `cd packages/backend && NODE_ENV=production PORT=5000 npm start`
  - Single server on port 5000 serves both API and frontend
  - No separate Vite preview server in production

- **Updated CORS configuration for production**
  - Changed from `cors('*')` to specific origins
  - Allows: `http://localhost:5000` (development), `https://app.safetechenv.com` (custom domain), `https://safe-report-app.replit.app` (primary URL), all `.replit.dev` URLs (development testing)
  - Enabled credentials support for cross-origin requests
  - File: `packages/backend/src/config/app.js`

- **Updated frontend production configuration**
  - Frontend production build uses relative path `/api/v1` (same domain)
  - Development mode unchanged: Uses `/api/v1` (Vite proxy to localhost:8080)
  - File: `packages/frontend/src/utils/config.ts`
  - Built frontend: `pnpm build:fe` creates production-optimized bundle

- **Updated production deployment documentation**
  - Updated `DEPLOYMENT_SETUP.md` with corrected architecture
  - Documents single server architecture (backend serves both API and frontend)
  - Lists all required environment variables for production deployment
  - Includes architecture diagrams showing single VM deployment model

- **Important**: Production deployment requires manual environment variable configuration
  - All secrets must be added to deployment settings before redeploying
  - Frontend must be built before deployment (`pnpm build:fe`)
  - See `DEPLOYMENT_SETUP.md` for complete deployment guide

### November 14, 2025

#### Backend Publicly Exposed & Frontend Production Configuration Updated
- **Backend moved to port 8080 and made publicly accessible**
  - Changed backend from localhost-only (port 4000) to publicly accessible (port 8080)
  - Created separate Backend and Frontend workflows for independent operation
  - Backend now accessible at: `https://9ddf8f58-2768-4062-96b6-6f709c8dbac2-00-1omg4hp6qmbo2.picard.replit.dev:8080`
  - Enables direct API testing with Postman and other external tools
  
- **Frontend production configuration updated**
  - Development mode: Uses `/api/v1` (Vite proxy to localhost:8080) - unchanged
  - Production mode: Uses public backend URL `https://...replit.dev:8080/api/v1`
  - Updated `packages/frontend/src/utils/config.ts` with environment-aware configuration
  - Updated `packages/frontend/vite.config.ts` proxy settings to point to port 8080
  - Rebuilt frontend with new production settings

- **All user passwords reset to `1tempPass!` for testing/development**
  - 5 Admins, 3 Project Managers, 7 Technicians
  - Script: `packages/backend/src/scripts/update-all-passwords.js`
  - Passwords properly hashed with bcrypt before storage

- **Fixed PostgreSQL ENUM search error**
  - Issue: User search endpoint returned "operator does not exist: enum_users_role ~~ unknown"
  - Root cause: PostgreSQL doesn't support LIKE operator on ENUM types without casting
  - Solution: Updated `packages/backend/src/helpers/pagination.js` to cast ENUM fields to TEXT before applying ILIKE
  - Impact: Fixed search across all endpoints (users, projects, customers, reports, templates)
  - ENUM fields now searchable: `role` (Admin/Technician/Project Manager), `status` (invited/activated)

### November 3, 2025

#### Complete Database Import (Latest - 09:23 UTC)
- **Successfully imported ALL production data from MySQL dump**
  - Database now contains complete dataset:
    * 15 customers (6 active, 9 deleted/archived)
    * 53 users (14 active, 39 deleted/archived)  
    * 15 projects (4 active, 11 deleted/archived)
    * 4 environmental assessment reports with full JSON answers data
    * 2 lab reports with 95 lab report results
    * 13 locations (12 active)
    * 134 materials
    * 1 report template
  - Key scripts used:
    * `packages/backend/src/scripts/import-mysql-fixed.js` - Main import with state-machine SQL parser
    * `packages/backend/src/scripts/import-reports-direct.js` - Simplified report-only import
    * `packages/backend/src/scripts/import-lab-data.js` - Lab reports and results import
  - Fixed critical parser bug: Previous regex parser was truncating at semicolons within JSON strings

#### Environmental Assessment Reports Import
- **Imported 4 complete assessment reports from 13 available in SQL**
  - Window Replacement Project (Phase 1) - Toronto Metropolitan University (1,867 bytes JSON)
  - Interior test - Safetech Env (1,294 bytes JSON, includes PM feedback)
  - Test Project for Assessing via Mobile - Acme Inc. (762 bytes JSON)
  - St. Matthias Catholic School Demolition - New Company (905 bytes JSON)
  - Reports contain detailed assessment data: asbestos, lead, mercury, mould, PCB, silica observations
  - 9 reports skipped: referenced deleted/archived projects not in active database

#### Lab Data Import  
- **Imported lab reports and results from SQL dump**
  - Added 2 lab reports with work order #2518431 for Safetech Environmental Limited (Mississauga)
  - Imported 95 lab report results (47-48 results per lab report)
  - Lab reports linked to existing projects: St. Matthias Catholic School Demolition
  - Lab reports include environmental testing parameters (PHCs, metals, VOCs, pH, conductivity, etc.)

#### Production Data Import (Earlier)
- **Successfully imported production data from MySQL dump (Nov 2, 2025)**
  - Fixed parser bug that was only extracting first record from multi-record INSERT statements
  - Created robust import script (packages/backend/src/scripts/import-mysql-fixed.js)
  - Successfully imported: 15 customers, 53 users, 13 locations, 134 materials, 15 projects, 1 report template
  - Fixed platform authentication security vulnerability in auth.js (now properly validates platform parameter)
  - Handles self-referential foreign keys with two-pass approach
  - Validates and fixes data issues (empty enums, invalid JSON, missing foreign keys)
  - Maps MySQL columns to PostgreSQL schema correctly
  - Production database is now populated with real data

### Sept 30, 2025
- Migrated from MySQL to PostgreSQL for Replit compatibility
- Updated database configuration to use Neon PostgreSQL
- Configured Vite for Replit environment (port 5000, host 0.0.0.0)
- Set up HMR for WebSocket proxy compatibility
- Created monorepo workspace with pnpm
- Added deployment configuration for VM target
- Backend runs on 0.0.0.0:8080 (publicly accessible), frontend on 0.0.0.0:5000

## Deployment

### Development Environment
- **Backend**: Runs on port 8080 via "Backend" workflow
- **Frontend**: Runs on port 5000 via "Frontend" workflow
- **Database**: Uses workspace secrets (DATABASE_URL, etc.)
- **CORS**: Allows localhost:5000 and all .replit.dev URLs

### Production Deployment
The application is configured for Replit VM deployment:
- **Deployment Type**: VM (stateful, always-on)
- **Single Server Architecture**: Backend serves both API and frontend
  - **Build Command**: `pnpm build:fe` (builds frontend static files)
  - **Run Command**: `cd packages/backend && NODE_ENV=production PORT=5000 npm start`
  - **Port**: 5000 (single Node.js server)
  - **Primary URL**: https://safe-report-app.replit.app
  - **Custom Domain**: https://app.safetechenv.com (points to same deployment)
  - **API Endpoints**: `/api/v1/*` served by backend
  - **Frontend**: Static files from `packages/frontend/dist` served at root
  - **Client-side Routing**: All non-API routes serve `index.html`
  - **Environment Variables**: Must be configured in deployment settings (see DEPLOYMENT_SETUP.md)

### Production Secrets Required
All sensitive environment variables must be configured in deployment settings:
- Database: `DATABASE_URL`, `PGDATABASE`, `PGHOST`, `PGPASSWORD`, `PGPORT`, `PGUSER`
- Authentication: `JWT_SECRET`, `MOBILE_APP_KEY`
- AWS (optional): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

See `DEPLOYMENT_SETUP.md` for detailed configuration instructions.

## Notes
- The backend serves static files from `src/public/` and `uploads/`
- In production, backend also serves frontend static files from `packages/frontend/dist`
- CORS is configured for both development and production:
  - Development: `http://localhost:5000`, all `.replit.dev` URLs
  - Production: `https://app.safetechenv.com`, `https://safe-report-app.replit.app`
- Helmet is used for security headers
- Morgan is used for HTTP request logging
- The application uses paranoid deletes (soft delete) for most models
