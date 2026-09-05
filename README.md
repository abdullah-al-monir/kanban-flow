# Kanban Flow

Kanban Flow is a collaborative task-management application with a Next.js frontend and a NestJS/Prisma backend.

## Repository Layout

```text
kanban-flow/              Next.js frontend
kanban-flow-server/       NestJS API, Prisma schema, and migrations
docker-compose.yml        PostgreSQL, API, and frontend services
```

## Requirements

For local development, install:

- Node.js 20 or newer
- npm
- Docker Desktop (recommended for PostgreSQL and the all-in-one stack)

## Quick Start With Docker

1. Clone the repository and enter it:

   ```bash
   git clone <repository-url>
   cd kanban-flow
   ```

2. Create the root environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Build and start the database, backend, and frontend:

   ```bash
   docker compose up --build
   ```

4. Open the application at <http://localhost:3000>.

   The API is available at <http://localhost:4000/api> and Swagger documentation is available at <http://localhost:4000/api/docs>.

Stop the stack with:

```bash
docker compose down
```

To remove the local PostgreSQL volume and reset all database data:

```bash
docker compose down -v
```

## Local Development Without Docker Services

Docker is still recommended for PostgreSQL. The following commands run the frontend and backend directly from their own directories.

### 1. Configure the backend

```bash
cd kanban-flow-server
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

The backend template connects to the Docker PostgreSQL instance with:

```env
DATABASE_URL="postgresql://kanban:kanban_password@localhost:5432/kanban_db?schema=public"
```

Start PostgreSQL only when using this workflow:

```bash
docker compose up -d db
```

Run the API in a second terminal:

```bash
cd kanban-flow-server
npm run start:dev
```

### 2. Configure the frontend

In another terminal:

```bash
cd kanban-flow
cp .env.local.example .env.local
npm install
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.local.example .env.local` instead.

Open <http://localhost:3000>.

## Environment Variables

Copy `.env.example` to `.env` for Docker. The checked-in templates are safe local-development examples; replace JWT secrets before deploying.

### Root Docker environment

```env
POSTGRES_USER=kanban
POSTGRES_PASSWORD=kanban_password
POSTGRES_DB=kanban_db
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
```

The Compose file supplies the full API configuration and uses the database service hostname automatically.

### Frontend environment

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Backend environment

The complete backend template is in `kanban-flow-server/.env.example` and includes database, CORS, JWT expiry, and bcrypt settings.

## Useful Commands

Frontend:

```bash
cd kanban-flow
npm run lint
npm run typecheck
npm run build
```

Backend:

```bash
cd kanban-flow-server
npm run lint
npm run typecheck
npm test
npm run prisma:deploy
```

## API

All API routes use the `/api` prefix. Public authentication endpoints include `/api/auth/register`, `/api/auth/login`, and `/api/auth/refresh`. The interactive API reference is available at `/api/docs` when the backend is running.
