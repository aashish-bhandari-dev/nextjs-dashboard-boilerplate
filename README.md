# Next.js Admin Boilerplate (AdminHub)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-orange)](https://zustand.docs.pmnd.rs/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A production-ready, performant, enterprise-grade admin dashboard boilerplate built with **Next.js 16 (App Router & Turbopack)**, **React 19**, **Tailwind CSS v4**, **TypeScript**, and **Zustand**. Designed from the ground up for SaaS backoffices, internal consoles, and enterprise platforms requiring granular Role-Based Access Control (RBAC), user management, and real-time operational analytics.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Docker Setup & Deployment](#docker-setup--deployment)
  - [Production Multi-Stage Dockerfile](#production-multi-stage-dockerfile)
  - [Docker Compose (Production)](#docker-compose-production)
  - [Docker Compose (Local Development)](#docker-compose-local-development)
  - [Container CLI Commands](#container-cli-commands)
- [Available Scripts](#available-scripts)
- [Authentication & RBAC System](#authentication--rbac-system)
- [Repository Pattern & API Layer](#repository-pattern--api-layer)
- [Code Quality & Linting](#code-quality--linting)
- [License](#license)

---

## Key Features

### 🛡️ Authentication & Access Control (RBAC)

- **Role-Based Route Guard**: Protected route validation via middleware (`proxy.ts`), restricting admin console access to authorized roles (`SUPER_ADMIN` and `ADMIN`).
- **Synchronized Auth State**: Dual-persistence strategy leveraging HTTP cookies for SSR/routing protection and local storage for client-side state hydration.
- **Enterprise Login Experience**: Split-screen authentication view featuring an ambient background, platform showcase, form validations, and error handling.

### 👥 User & Permission Management

- **User Directory**: Searchable, filterable, and paginated user catalog with status badges (active, verified, deactivated).
- **User CRUD & Forms**: Type-safe user creation and editing forms validated with **Zod** schemas.
- **Granular Permission Overrides**: Capability to inspect effective user permissions and configure direct grants or revocations on top of inherited role defaults.
- **Role Management**: Dedicated roles listing, role creator/editor, and permission catalog matrix for modular capability assignment.

### 📊 Real-Time Analytics & Dashboard Overview

- **Executive KPI Cards**: Real-time operational metrics for platform revenue, active accounts, API latencies, and system health status.
- **Interactive Visualizations (Recharts)**:
  - **Revenue Velocity**: Responsive line/area charts with time-range filtering (7 Days, 30 Days, Quarter).
  - **Acquisition Channels**: Distribution breakdowns by source.
  - **Performance & Traffic**: User growth trends, conversion funnels, and geographic activity breakdowns.

### ⚡ Developer Experience & Performance

- **Turbopack Powered**: Lightning-fast compilation and Hot Module Replacement (HMR).
- **Tailwind CSS v4 & OKLCH Theming**: Dynamic modern CSS design system with CSS variables and responsive design tokens.
- **Accessible Primitives**: Built with Shadcn UI and Base UI headless components.
- **Deduplicated & Cached Requests**: In-memory TTL caching and concurrent request deduplication for client API operations.
- **Docker-Ready**: Multi-stage standalone build containerized for lean production images (< 150MB).

---

## Tech Stack

| Category                 | Technology                                                            | Description                                                       |
| :----------------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------- |
| **Framework**            | [Next.js 16](https://nextjs.org/)                                     | React framework with App Router & Turbopack                       |
| **Library**              | [React 19](https://react.dev/)                                        | Core UI rendering engine                                          |
| **Language**             | [TypeScript 5](https://www.typescriptlang.org/)                       | Strongly typed JavaScript                                         |
| **Styling**              | [Tailwind CSS v4](https://tailwindcss.com/)                           | Next-generation utility-first styling with `@tailwindcss/postcss` |
| **UI Components**        | [shadcn/ui](https://ui.shadcn.com/) / [Base UI](https://base-ui.com/) | Accessible, themeable UI components and primitives                |
| **Icons**                | [Lucide React](https://lucide.dev/)                                   | Clean, consistent SVG icon set                                    |
| **State Management**     | [Zustand](https://zustand.docs.pmnd.rs/)                              | Minimalist and fast state management with persistence             |
| **Data Fetching**        | [Axios](https://axios-http.com/) / Fetch API                          | In-memory cached client API & SSR-capable server API client       |
| **Validation**           | [Zod 4](https://zod.dev/)                                             | Schema declaration and input validation                           |
| **Charts**               | [Recharts 3](https://recharts.org/)                                   | Composable SVG chart library                                      |
| **Containerization**     | [Docker](https://www.docker.com/) / Compose                           | Multi-stage standalone Alpine container & Compose profiles        |
| **Formatting & Linting** | ESLint 9 & Prettier                                                   | Strict code standards and Tailwind class sorting                  |

---

## Architecture & Design Patterns

### 1. Dual API Strategy (`lib/api`)

- **`clientApi` (Axios)**: Optimized for browser requests. Features automatic token header injection, response interceptors for 401 redirect handling, in-memory GET request deduplication, and configurable TTL caching (`cacheTtlMs`).
- **`serverApi` (Fetch)**: Designed for Server Components and SSR execution. Reads incoming cookies directly via `next/headers` and handles backend error payload normalization.
- **API Rewrite Proxy**: Configured in [`next.config.ts`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/next.config.ts) to forward `/api/v1/*` requests directly to backend services, avoiding CORS issues during development.

### 2. Repository Pattern (`repo/`)

Business logic and network communication are separated from UI components using repository classes:

- [`authRepo`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/repo/auth.repo.ts): Handles sign-in workflows, token assignment, and credential validation.
- [`userRepo`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/repo/user.repo.ts): Manages user retrieval, filtering, creation, mutation, and permission override management.
- [`roleRepo`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/repo/role.repo.ts): Manages roles listing, creation, updates, and permission matrix assignments.
- [`permissionRepo`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/repo/permission.repo.ts): Retrieves system permission definitions and module groupings.

### 3. State Management with Zustand (`store/`)

- [`useAuthStore`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/store/auth.store.ts): Manages active user session, tokens, role-check helpers (`isAdmin()`, `isSuperAdmin()`), and syncs auth tokens across cookies and localStorage.
- [`useSidebarStore`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/store/sidebar.store.ts): Persists navigation sidebar state across browser sessions.

---

## Directory Structure

```text
nextjs-admin-boilerplate/
├── app/                              # Next.js App Router root
│   ├── (dashboard)/                  # Protected Dashboard Route Group
│   │   ├── analytics/                # Analytics & metrics page
│   │   ├── roles/                    # Role and permission management
│   │   │   ├── [id]/                 # Role detail and edit view
│   │   │   └── create/               # Create role view
│   │   ├── users/                    # User accounts management
│   │   │   ├── [id]/                 # User details & permission overrides
│   │   │   └── create/               # Create user view
│   │   ├── layout.tsx                # Dashboard shell (sidebar, topbar, inset)
│   │   └── page.tsx                  # Primary overview dashboard
│   ├── login/                        # Authentication login page
│   ├── globals.css                   # Tailwind CSS v4 variables & base styling
│   └── layout.tsx                    # Root application HTML layout
├── components/                       # Modular UI components
│   ├── analytics/                    # Analytics charts and data funnel widgets
│   ├── auth/                         # Login form and presentation showcase
│   ├── dashboard/                    # Overview stats, charts, topbar, and sidebar
│   ├── roles/                        # Roles table, modals, and permission matrices
│   ├── ui/                           # Reusable atomic UI elements (buttons, dialogs, etc.)
│   └── users/                        # Users table, permission overrides, and forms
├── hooks/                            # Custom React hooks (useMobile, etc.)
├── lib/                              # Core libraries and utility helpers
│   ├── api/                          # Client API (Axios) & Server API (Fetch)
│   └── utils.ts                      # Class merging (cn) and error handlers
├── repo/                             # Repository layer for data fetching
├── schemas/                          # Zod validation schemas
├── store/                            # Zustand state stores
├── types/                            # TypeScript interfaces and type definitions
├── proxy.ts                          # Next.js route guard middleware
├── next.config.ts                    # Next.js configuration (standalone output & API rewrites)
├── Dockerfile                        # Multi-stage production container build
├── docker-compose.yml                # Docker Compose production configuration
├── docker-compose.dev.yml            # Docker Compose local development with hot reload
├── .dockerignore                     # Build context exclusions
└── package.json                      # Project dependencies and npm scripts
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:

- **Node.js**: `v20.x` or `v24.x` (see [`.nvmrc`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/.nvmrc))
- **Package Manager**: `npm`, `pnpm`, `yarn`, or `bun`
- **Docker** _(Optional, for containerized execution)_: Docker Desktop / Engine 20+

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/aashish-bhandari-dev/nextjs-dashboard-boilerplate.git
   cd nextjs-dashboard-boilerplate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

### Environment Configuration

Copy the example environment configuration file to create your local `.env`:

```bash
cp .env.example .env
```

Configure the environment variables according to your local setup:

| Variable               | Description                                            | Default                   |
| :--------------------- | :----------------------------------------------------- | :------------------------ |
| `NODE_ENV`             | Application environment (`development` / `production`) | `development`             |
| `NEXT_PUBLIC_APP_NAME` | Display name of the admin platform                     | `AdminHub`                |
| `NEXT_PUBLIC_APP_URL`  | Base URL of the Next.js frontend                       | `http://localhost:3000`   |
| `NEXT_PUBLIC_API_URL`  | Base URL of the backend API service                    | `http://localhost:5001`   |
| `AUTH_SECRET`          | Secret key used for signing session tokens             | `your-secure-auth-secret` |
| `AUTH_URL`             | Auth callback / provider endpoint URL                  | `http://localhost:3000`   |

### Running the Application

Start the local development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Setup & Deployment

The repository includes a production-grade multi-stage [`Dockerfile`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/Dockerfile) and [`docker-compose.yml`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/docker-compose.yml) leveraging Next.js **standalone output** mode (`output: "standalone"`).

### Production Multi-Stage Dockerfile

The multi-stage build creates ultra-compact and secure runtime containers:

1. **`base`**: `node:20-alpine` with `libc6-compat`.
2. **`deps`**: Installs clean dependencies via `npm ci`.
3. **`builder`**: Injects build-time environment arguments and compiles optimized production assets via `npm run build`.
4. **`runner`**: Minimal Alpine runtime executing as a non-privileged `nextjs` system user (`UID: 1001`), with built-in HTTP healthchecks (`HEALTHCHECK`).

### Docker Compose (Production)

Deploy the containerized application using Docker Compose:

```bash
# Start container in detached background mode
docker compose up -d

# View container logs
docker compose logs -f

# Check health and status
docker compose ps

# Stop container
docker compose down
```

Or run via npm convenience scripts:

```bash
npm run docker:up
npm run docker:down
```

### Docker Compose (Local Development)

If you prefer developing inside a container with volume-mounted source code and live hot reloading:

```bash
docker compose -f docker-compose.dev.yml up
```

### Container CLI Commands

You can also build and run directly with standard Docker commands:

```bash
# Build the production image
docker build -t nextjs-admin-boilerplate .

# Run the container with environment variables
docker run -p 3000:3000 --env-file .env --name adminhub-app nextjs-admin-boilerplate
```

---

## Available Scripts

In the project directory, you can run:

| Command                | Description                                                                     |
| :--------------------- | :------------------------------------------------------------------------------ |
| `npm run dev`          | Starts the Next.js development server with Turbopack enabled                    |
| `npm run build`        | Builds the application for production deployment (generates standalone package) |
| `npm run start`        | Starts the production server                                                    |
| `npm run lint`         | Runs ESLint to check for syntax and style issues                                |
| `npm run format`       | Automatically formats all source code using Prettier                            |
| `npm run format:check` | Checks code formatting against Prettier guidelines                              |
| `npm run docker:build` | Builds the Docker image locally                                                 |
| `npm run docker:up`    | Boots the application container using Docker Compose                            |
| `npm run docker:down`  | Stops and tears down the Docker Compose container network                       |

---

## Authentication & RBAC System

The boilerplate enforces a strict security perimeter designed for administrative dashboards:

```text
Request (Browser)
       │
       ▼
[ proxy.ts (Middleware) ] ── (No Token or Invalid Role) ──► Redirect to /login
       │
       ▼ (Valid access_token + SUPER_ADMIN / ADMIN)
[ Protected Dashboard Routes (app/(dashboard)/*) ]
```

1. **Route Guarding**: [`proxy.ts`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/proxy.ts) inspects every incoming request path (excluding static assets, API routes, and public files). If an unauthenticated user or a user without administrative credentials requests a protected path, they are redirected to `/login`.
2. **Session Persistence**: When authenticating through [`authRepo.login`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/repo/auth.repo.ts), valid credentials set `access_token`, `refresh_token`, and `user_role` in secure cookies and synchronize the state with [`useAuthStore`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/store/auth.store.ts).
3. **Permission Overrides**: Permissions can be resolved on three tiers:
   - **Global Super Admin**: Has unrestricted access across all actions.
   - **Role Inheritance**: Inherits standard permissions defined on the assigned role.
   - **Direct User Overrides**: Explicitly grants or revokes specific action scopes for individual users.

---

## Repository Pattern & API Layer

All API communications are orchestrated through repository classes. Here is an example of consuming [`userRepo`](file:///Users/sandesh/personal-projects/nextjs-admin-boilerplate/repo/user.repo.ts):

```typescript
import { userRepo } from "@/repo/user.repo";

// Fetch paginated user list with search & filters
await userRepo.listUsers({
  query: {
    page: 1,
    limit: 10,
    searchTerm: "admin",
    role: "ADMIN",
    isActive: true,
  },
  onSuccess: (users, total, meta) => {
    console.log(`Loaded ${users.length} of ${total} users`);
  },
  onError: (errorMessage) => {
    console.error("Fetch failed:", errorMessage);
  },
});
```

Client-side requests benefit from automatic TTL caching:

```typescript
// Uses cached result if requested within 60 seconds
await roleRepo.listRoles({
  cacheTtlMs: 60000,
  onSuccess: (roles) => setRoles(roles),
  onError: (err) => toast.error(err),
});
```

---

## Code Quality & Linting

Code consistency and standards are maintained using **ESLint 9** and **Prettier**:

- **Tailwind CSS Sorting**: Automatically formats and sorts Tailwind utility classes using `prettier-plugin-tailwindcss`.
- **TypeScript Strictness**: Type checking enabled across all components, repositories, and API clients.

To run checks:

```bash
# Check for lint errors
npm run lint

# Format codebase
npm run format
```

---

## License

This project is licensed under the [MIT License](LICENSE).
