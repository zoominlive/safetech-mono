# SafeTech Environmental Ltd - Monorepo

### Overview
SafeTech is a full-stack environmental assessment management application designed to streamline environmental assessment processes. This monorepo integrates a React-based frontend with a Node.js, Express, and Sequelize backend. The application aims to provide a comprehensive solution for managing environmental assessments, from project inception to report generation. Key capabilities include user authentication, project and customer management, various environmental assessment reports (Asbestos, Lead, Mercury, Mould, PCB, Silica), lab report handling, material tracking, PDF report generation, and file uploads. The business vision is to become a leading platform for environmental consulting firms, enhancing efficiency and accuracy in their operations, with significant market potential in the environmental compliance and consulting sectors.

### User Preferences
- **Communication Style**: I prefer clear and concise communication.
- **Coding Style**: Please adhere to best practices for React/TypeScript and Node.js/Express, focusing on maintainable and scalable code.
- **Workflow**: I prefer an iterative development approach.
- **Interaction**: Ask for confirmation before making significant architectural changes or refactoring large portions of the codebase.
- **Explanations**: Provide detailed explanations for complex solutions or decisions.
- **Folder Restrictions**: Do not make changes to the `shared/` folder within `packages/` as it's reserved for future use.
- **File Restrictions**: Do not modify `DEPLOYMENT_SETUP.md` without explicit instruction.

### System Architecture

**Monorepo Structure**:
The project is organized as a monorepo using `pnpm` workspaces, containing `frontend` (React + Vite + TypeScript) and `backend` (Node.js + Express + Sequelize) packages.

**Frontend**:
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **UI**: Radix UI components styled with Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router 7

**Backend**:
- **Runtime**: Node.js 20
- **Framework**: Express 5
- **ORM**: Sequelize 6 for PostgreSQL
- **Authentication**: JWT-based
- **API Versioning**: All API endpoints are under `/api/v1/*`.

**Database**:
- **Type**: PostgreSQL, hosted on Neon.
- **Schema Management**: Initialized via Sequelize model sync; migration files exist but initial schema was direct sync.
- **Data Handling**: Uses paranoid deletes (soft delete) for most models.

**Deployment & Hosting**:
- **Development Environment**: Backend runs on port 8080 (publicly accessible), frontend on port 5000.
- **Production Environment**: Deployed on Replit VM. A single Node.js server serves both the API and frontend static files.
  - The backend serves static files from `packages/frontend/dist` for the frontend and handles client-side routing by serving `index.html` for non-API routes.
  - The backend also serves static files from `src/public/` and `uploads/`.

**Security & Logging**:
- **Security Headers**: Helmet is used to configure HTTP security headers, including Content Security Policy.
- **Logging**: Morgan is used for HTTP request logging.
- **CORS**: Configured for both development (localhost, .replit.dev URLs) and production (specific custom domains and Replit app URLs).

**Key Features**:
- User authentication and authorization
- Project, customer, and location management
- Environmental assessment reports (Asbestos, Lead, Mercury, Mould, PCB, Silica)
- Lab report management and material tracking
- PDF report generation and file upload handling
- Health check endpoint (`/api/v1/health/healthz`) for production diagnostics.

### External Dependencies

- **Database**: Neon (PostgreSQL hosting)
- **Cloud Storage**: AWS S3 (for image/file storage; specific S3 bucket host configurable via `AWS_S3_BUCKET_HOST`)
- **Email/SMTP**: Configurable via environment variables (for transactional emails, e.g., user invitations, password resets).
- **AWS**: AWS SDK for S3 interactions (optional, based on environment variables).