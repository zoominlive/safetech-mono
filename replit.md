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
- **Port**: 4000 (localhost only)

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
- `PORT`: Server port (4000)
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

### November 14, 2025

#### Production Deployment Fix
- **Fixed ECONNREFUSED errors in production deployment**
  - Issue: Backend and frontend were starting simultaneously, causing race condition where frontend tried to connect before backend was ready
  - Solution: Created staged deployment startup process:
    * `deploy-start.sh` - Custom deployment script that orchestrates startup sequence (120s timeout)
    * `wait-for-port.js` - Node.js utility that polls port 4000 every 2 seconds
    * `packages/backend/start-production.js` - Production startup wrapper with environment variable validation
    * Backend starts first, script waits for it to be ready, then frontend starts
  - Updated deployment configuration to use `bash ./deploy-start.sh` instead of parallel startup
  - Fixed API connection configuration to use relative URLs (`/api/v1`) in both dev and production
  - Vite preview server proxy configuration ensures production API requests route correctly
  - Backend config now gracefully handles missing .env file in production (uses system environment variables)
  - Increased startup timeout to 120 seconds to accommodate Chromium initialization and database connection

#### Complete Data Import from Production SQL Dump
- **Successfully imported all 337 records from safetech_14-11.sql**
  - Extended import script to handle previously missing tables:
    * 39 project_technicians records (junction table)
    * 20 project_drawings records
    * 29 reports records with JSON answers and photos fields
  - Added foreign key validation for project_technicians, project_drawings, and reports
  - Added JSON field handling for reports table (answers, photos)
  - Import script now handles composite primary keys (project_technicians uses project_id + user_id)
  - 100% data import success rate (337/337 records)

#### Password Reset for Development
- **Reset all user passwords to `1tempPass!`**
  - Updated 15 active users across all roles (5 Admins, 3 Project Managers, 7 Technicians)
  - Passwords properly hashed with bcrypt before storage
  - Development/testing convenience feature only

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
- Backend runs on localhost:4000, frontend on 0.0.0.0:5000

## Deployment
The application is configured for Replit VM deployment:
- **Build**: Frontend only (`pnpm build:fe`)
- **Run**: Custom startup script (`deploy-start.sh`) that ensures backend is ready before starting frontend
- **Type**: VM (stateful, always-on)

### Deployment Architecture
The deployment uses a staged startup process to avoid race conditions:
1. Backend starts first (`pnpm --filter ./packages/backend start`)
2. Wait for backend port 4000 to be accessible (`wait-for-port.js`)
3. Frontend preview server starts (`pnpm --filter ./packages/frontend preview`)

This ensures the backend API is fully initialized before the frontend tries to connect, preventing `ECONNREFUSED` errors in production.

### API Connection Configuration
Both development and production use **relative URLs** (`/api/v1`) for API requests:
- **Development**: Vite dev server proxies `/api/*` to `localhost:4000`
- **Production**: Vite preview server proxies `/api/*` to `localhost:4000`
- This approach works because both servers run in the same Replit container

## Notes
- The backend serves static files from `src/public/` and `uploads/`
- CORS is configured to allow all origins (*)
- Helmet is used for security headers
- Morgan is used for HTTP request logging
- The application uses paranoid deletes (soft delete) for most models
