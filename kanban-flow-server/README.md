# Kanban Flow Backend

The backend API for Kanban Flow, a collaborative kanban board application. It provides authentication, board and member management, columns, tasks, drag-and-drop task movement, and board activity history.

## Live Application

- Frontend: https://kanban-flow-mauve.vercel.app/
- API: https://kanban-flow-backend-rho.vercel.app
- Swagger API documentation: https://kanban-flow-backend-rho.vercel.app/api/docs

## Features

- User registration and local email/password login
- JWT access and refresh tokens
- Protected routes with role-based board permissions
- Board creation, editing, archiving, sharing, and member removal
- Column creation, editing, deletion, and reordering
- Task creation, editing, deletion, assignment, and drag-and-drop movement
- Paginated board activity history
- Global request validation, CORS, Helmet security headers, and Swagger documentation
- PostgreSQL persistence through Prisma 7
- Production bundling with esbuild

## Technology

- Node.js 24+
- NestJS 12
- TypeScript 6
- PostgreSQL 15+
- Prisma 7
- Vitest
- esbuild

## Project Structure

```text
prisma/
	schema.prisma       Database models and enums
	prisma.config.ts    Prisma CLI configuration

scripts/
	build.cjs           Type-check metadata-aware application bundle

src/
	auth/               Registration, login, JWT, Passport strategies, guards
	users/              Current-user endpoints
	boards/             Board and membership operations
	columns/            Column operations and ordering
	tasks/              Task operations and movement
	activities/         Board activity history
	common/             Guards, decorators, filters, and shared utilities
	prisma/              Global PrismaService and PrismaModule
	app.module.ts       Root Nest module
	main.ts             Application bootstrap

test/
	common/             Unit tests for shared utilities and role hierarchy
```

## Prerequisites

Install:

- Node.js 24 or newer
- npm
- Docker Desktop, for the local PostgreSQL database

Install dependencies:

```bash
npm install
```

## Environment Setup

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

The checked-in Compose file creates PostgreSQL with these values:

```env
DATABASE_URL="postgresql://kanban:kanban_password@localhost:5432/kanban_db?schema=public"
```

Update `DATABASE_URL` in `.env` to match those values. Replace the development JWT secrets before using the application outside local development. The application reads `PORT`, `CORS_ORIGIN`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`, and `DATABASE_URL` at runtime.

The `.env.example` file contains the full environment template:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanban?schema=public"
PORT=4000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="change-me-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS=10
```

## Start PostgreSQL With Docker

Start the database in the background:

```bash
docker compose up -d db
```

Check the container:

```bash
docker compose ps
docker compose logs -f db
```

The database is exposed on `localhost:5432` and uses the named Docker volume `postgres_data`, so data survives container recreation.

Stop the database:

```bash
docker compose down
```

To remove the database data as well, use this only when intentionally resetting local data:

```bash
docker compose down -v
```

## Initialize Prisma

Generate the Prisma client after installing dependencies or changing the schema:

```bash
npm run prisma:generate
```

Create and apply a development migration:

```bash
npm run prisma:migrate
```

Deploy existing migrations in a deployment environment:

```bash
npm run prisma:deploy
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

The normal first-time local sequence is:

```bash
npm install
docker compose up -d db
npm run prisma:generate
npm run prisma:migrate
npm start
```

## Run the Server

Build and start the production bundle:

```bash
npm start
```

The default port is `4000` when configured in `.env`. The server is available at `http://localhost:4000`.

Build without starting:

```bash
npm run build
```

Run the generated bundle directly:

```bash
npm run start:prod
```

The build runs TypeScript type-checking first, then creates `dist/main.cjs` with esbuild. Local TypeScript imports intentionally omit runtime file extensions because the production bundle resolves them before Node executes the application.

## Development Commands

```bash
npm run start:dev   # Nest watch mode
npm run start:debug # Nest debug watch mode
npm run typecheck   # TypeScript check only
npm run lint        # Oxlint
npm run format      # Prettier
```

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run coverage:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## API Overview

All routes are prefixed with `/api`. Unless marked public, endpoints require an access token in the `Authorization` header:

```http
Authorization: Bearer <access-token>
```

### Public Authentication

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create a user |
| `POST` | `/auth/login` | Authenticate with email and password |
| `POST` | `/auth/refresh` | Create a new access token |

### User

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/users/me` | Get the authenticated user |
| `PATCH` | `/users/me` | Update the authenticated user |
| `GET` | `/users/search?email=` | Search users by email |

### Boards

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/boards` | Create a board |
| `GET` | `/boards` | List active boards for the current user |
| `GET` | `/boards/archived` | List archived boards |
| `GET` | `/boards/:boardId` | Get a board |
| `PATCH` | `/boards/:boardId` | Update a board |
| `PATCH` | `/boards/:boardId/restore` | Restore an archived board |
| `DELETE` | `/boards/:boardId` | Archive a board |
| `GET` | `/boards/:boardId/members` | List board members |
| `POST` | `/boards/:boardId/members` | Add a member |
| `PATCH` | `/boards/:boardId/members/:memberUserId` | Update a member role |
| `DELETE` | `/boards/:boardId/members/:memberUserId` | Remove a member |

### Columns and Tasks

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/boards/:boardId/columns` | Create a column |
| `PATCH` | `/columns/:columnId` | Update a column |
| `DELETE` | `/columns/:columnId` | Delete a column |
| `POST` | `/columns/:columnId/reorder` | Reorder a column |
| `POST` | `/columns/:columnId/tasks` | Create a task |
| `GET` | `/tasks/:taskId` | Get a task |
| `PATCH` | `/tasks/:taskId` | Update a task |
| `POST` | `/tasks/:taskId/move` | Move or reorder a task |
| `DELETE` | `/tasks/:taskId` | Delete a task |

### Activities

| Method | Route | Query parameters |
| --- | --- | --- |
| `GET` | `/boards/:boardId/activities` | Optional `limit` and `cursor` |

## Board Roles

- `OWNER`: Full administration, including archiving and member removal
- `ADMIN`: Manage board settings and members where allowed
- `EDITOR`: Create and modify columns and tasks
- `VIEWER`: Read-only board access

## Database Model

The Prisma schema contains users, boards, board memberships, columns, tasks, and activity logs. Foreign keys use cascading or restrictive deletion behavior to protect board ownership and maintain related data consistency.

## Troubleshooting

### Port already in use

Change `PORT` in `.env`, then restart the server. On Windows, identify a listener with:

```powershell
netstat -ano | findstr :4000
```

### Prisma cannot connect

Confirm PostgreSQL is running and that `DATABASE_URL` matches the Compose credentials. Then regenerate the client and retry the migration:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Build or dependency changes

Reinstall dependencies and regenerate Prisma artifacts:

```bash
rm -rf node_modules dist
npm install
npm run prisma:generate
npm run build
```

On Windows PowerShell, replace the cleanup command with:

```powershell
Remove-Item -Recurse -Force node_modules, dist
```
