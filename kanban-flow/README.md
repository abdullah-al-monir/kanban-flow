# Kanban Flow

Kanban Flow is a collaborative task-management application for organizing work on visual Kanban boards. Users can create boards, manage columns and tasks, assign work to team members, and track board activity from a responsive dashboard.

**Live application:** [kanban-flow-mauve.vercel.app](https://kanban-flow-mauve.vercel.app/)

## Features

- Email and password registration and login.
- Persistent sessions with access-token refresh handling.
- Create, edit, archive, restore, and delete boards.
- Create, rename, reorder, and delete Kanban columns.
- Create and edit tasks with descriptions, assignees, due dates, and colored labels.
- Drag and drop tasks between columns and reorder columns.
- Board collaboration with member invitations and role management.
- Role-based permissions for owners, admins, editors, and viewers.
- Paginated board activity history for task, column, member, and board changes.
- Profile editing and appearance settings.
- Light, dark, and system theme modes, with selectable accent colors and dark backgrounds.
- Responsive layout with desktop sidebar navigation and mobile navigation.

## Tech Stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4 and shadcn/ui components
- TanStack Query for server state
- Zustand for authentication and theme state
- Axios for API communication
- dnd-kit for drag-and-drop interactions
- Radix UI primitives, Lucide icons, Sonner notifications, and date-fns

## Requirements

- Node.js 20 or newer
- npm
- A running Kanban Flow-compatible backend API

This repository contains the frontend only. The frontend expects the backend API under the `/api` path and uses the following authentication endpoints at minimum: `/auth/register`, `/auth/login`, and `/auth/refresh`.

## Getting Started

1. Clone the repository and enter the project directory.

	```bash
	git clone https://github.com/abdullah-al-monir/kanban-flow-frontend.git
	cd kanban-flow-frontend
	```

2. Install dependencies.

	```bash
	npm install
	```

3. Create a local environment file.

	```bash
	cp .env.example .env.local
	```

	If `.env.example` is not present, create `.env.local` manually:

	```env
	NEXT_PUBLIC_API_URL=http://localhost:4000/api
	```

	Set `NEXT_PUBLIC_API_URL` to the base URL of your deployed or local backend API. The application falls back to `http://localhost:4000/api` when the variable is not set.

4. Start the development server.

	```bash
	npm run dev
	```

5. Open [http://localhost:3000](http://localhost:3000) in your browser. The root route sends unauthenticated users to login and authenticated users to the boards page.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server after building. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Check TypeScript types without emitting files. |
| `npm run format` | Format TypeScript and TSX files with Prettier. |

## Main Workflows

### Boards

The boards page shows boards the current user owns or has been invited to. Create a board with an optional description, open a board to manage its workflow, or use the archived section to restore and revisit archived boards.

### Tasks and columns

Editors and above can add columns and tasks, rename or remove columns, edit task details, assign tasks to board members, set due dates, apply labels, and move work with drag and drop. Viewers can inspect board content without making changes.

### Collaboration

Board owners and admins can search for users by email, invite members, assign roles, change member roles, and remove members. Permissions are ordered from lowest to highest as `VIEWER`, `EDITOR`, `ADMIN`, and `OWNER`.

### Activity history

Authorized board managers can open the activity view to review paginated changes, including task creation and movement, column changes, member changes, and board updates.

### Profile and appearance

The settings page lets users update their name and email, choose light, dark, or system mode, select an accent color, and choose a dark-mode background tint.

## Project Structure

```text
app/          Next.js routes, layouts, and global styles
components/   Auth, board, Kanban, shared, and UI components
hooks/        React Query hooks for API-backed state
lib/api/      Axios API modules
lib/          Types, constants, formatting, and utilities
store/        Zustand authentication and theme stores
```

## Production Build

Set `NEXT_PUBLIC_API_URL` to the production API URL in your hosting provider, then run:

```bash
npm run build
npm run start
```

The application can also be deployed to platforms such as Vercel using the standard Next.js build settings.
