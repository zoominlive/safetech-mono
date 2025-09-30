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

## Recent Changes (Sept 30, 2025)
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
- **Run**: Both backend and frontend services in parallel
- **Type**: VM (stateful, always-on)

## Notes
- The backend serves static files from `src/public/` and `uploads/`
- CORS is configured to allow all origins (*)
- Helmet is used for security headers
- Morgan is used for HTTP request logging
- The application uses paranoid deletes (soft delete) for most models
