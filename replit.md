# ZRU Sponsorship Management Platform

## Overview

This is a full-stack sponsorship and partnership management platform built for the Zimbabwe Rugby Union (ZRU). It enables staff to track sponsors, manage deal pipelines, log interactions with partners, and view reporting dashboards with charts and metrics. The application covers the lifecycle of sponsorship relationships — from prospecting to closing deals — across rugby teams and programmes.

Key domain entities: Partners (sponsor organizations), Deals (sponsorship opportunities with tiers and values), Interactions (logged communications), and Staff (internal users with roles).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; no global client state library
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives with Tailwind CSS
- **Charts**: Recharts (Pie, Bar charts on dashboard)
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support), custom font families (Inter for body, Outfit for display)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

The frontend follows a pages-based structure with shared layout components (`AppLayout` with collapsible sidebar). Custom hooks (`use-partners`, `use-deals`, `use-interactions`, `use-reports`, `use-auth`) encapsulate all API communication using React Query.

### Backend

- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via `tsx` in development
- **API Style**: RESTful JSON API under `/api/` prefix
- **API Contract**: Shared route definitions in `shared/routes.ts` with Zod schemas for input validation and response parsing — used by both client and server
- **Build**: Custom build script using esbuild for server bundling and Vite for client bundling. Production output goes to `dist/`

### Authentication

- **Replit Auth (OpenID Connect)**: Uses Replit's OIDC provider for authentication
- **Session Management**: `express-session` with `connect-pg-simple` storing sessions in PostgreSQL
- **User Model**: Users table with UUID primary keys, linked to Staff profiles for role-based access
- **Middleware**: `isAuthenticated` middleware protects all API routes
- **Auth flow**: `/api/login` redirects to OIDC, `/api/auth/user` returns current user, `/api/logout` ends session

### Database

- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod integration
- **Schema location**: `shared/schema.ts` (main tables) and `shared/models/auth.ts` (auth tables)
- **Migrations**: Managed via `drizzle-kit push` (push-based, no migration files checked in by default)
- **Key tables**:
  - `users` — Auth users (UUID PKs, Replit Auth managed)
  - `sessions` — Express sessions (mandatory for Replit Auth)
  - `staff` — Staff profiles linked to users (role, department, title)
  - `partners` — Sponsor organizations (multi-select org types, contact info, compliance fields)
  - `deals` — Sponsorship opportunities (status pipeline, tier, value, linked to partner and staff)
  - `interactions` — Communication logs (linked to deals and staff)

### Shared Code

The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` — Drizzle table definitions, enums (organization types, sponsorship tiers, deal statuses, etc.), and insert schemas
- `routes.ts` — API contract with paths, methods, Zod input/output schemas
- `models/auth.ts` — User and session table definitions

### Key Design Patterns

- **Shared API contract**: Route paths, HTTP methods, and Zod schemas are defined once in `shared/routes.ts` and consumed by both Express handlers and React Query hooks. This ensures type safety across the stack.
- **Storage interface**: `server/storage.ts` defines an `IStorage` interface with a `DatabaseStorage` implementation, making it possible to swap storage backends.
- **Component library**: Full shadcn/ui component set is installed and customized with project-specific theme variables.

## External Dependencies

- **PostgreSQL**: Primary database. Must be provisioned and `DATABASE_URL` environment variable set.
- **Replit Auth (OIDC)**: Authentication provider. Requires `ISSUER_URL` (defaults to `https://replit.com/oidc`), `REPL_ID`, and `SESSION_SECRET` environment variables.
- **Google Fonts**: Inter and Outfit fonts loaded via CDN in `index.html` and CSS.
- **No other external APIs**: The application is self-contained with no third-party API integrations beyond auth.

### Environment Variables Required

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for Express session encryption |
| `REPL_ID` | Replit environment identifier (auto-set on Replit) |
| `ISSUER_URL` | OIDC issuer URL (defaults to Replit's) |