# Data Analytics Frontend

A production-style analytics and governance dashboard built with Next.js, React, TypeScript, and TanStack Query. This application provides authenticated data operations across exploration, notebooks, SQL editing, published APIs, notifications, and AI-assisted chat workflows.

## Overview

This repository is the frontend for a data analytics platform with:

- authenticated dashboard navigation
- data exploration workflows
- notebook authoring and execution
- SQL editor and saved queries
- KPI and object resource management
- published API management
- real-time notifications
- AI chatbot sessions with inline results and visualization

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- Ant Design
- TanStack Query v5
- Axios
- Radix UI
- `react-resizable-panels`
- `lucide-react`

## Project Structure

```text
app/                         Next.js routes, layouts, and dashboard pages
features/                    Feature modules (components, hooks, services, types)
shared/                      Shared UI, contexts, API client, hooks, and utilities
public/                      Static assets
```

Feature modules generally follow this structure:

```text
features/<feature>/
  components/
  hooks/
  services/
  types/
```

## Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Current environment variables used by the app:

```env
NEXT_PUBLIC_API_BASE_URL=backend_api_url
```

### Variable Notes

- `NEXT_PUBLIC_API_BASE_URL`
  Base URL for the backend API used by the shared Axios client in [`shared/api/axios.ts`](./shared/api/axios.ts).
  If not provided, the app falls back to:
  `https://opensourcepulse.pro`

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env.local
```

Update `.env.local` with the correct backend API URL for your environment.

### Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # Start local development server
npm run build    # Create production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Running in Another System

To run this project on another machine:

1. Install Node.js and npm.
2. Clone the repository.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Set `NEXT_PUBLIC_API_BASE_URL` to the target backend.
6. Run `npm run dev`.

For a production-like run:

```bash
npm install
npm run build
npm run start
```

## Core Features

### Authentication and Dashboard Shell

- login and signup flows
- protected dashboard routes
- token-based API authentication
- centralized logout and refresh handling

### Explore

- data assets
- object resources
- KPI exploration
- lineage and observability-oriented workflows

### Notebooks

- notebook metadata and content editing
- code and markdown cells
- session management
- linked Spark job orchestration
- run history and local version history

### SQL Editor

- query authoring
- result viewing
- saved query support
- resizable workspace layout

### Published APIs

- manage and inspect published APIs
- page-level listing and detail views

### Notifications

- initial feed snapshot
- SSE-based live stream updates
- cache-driven real-time UI updates
- fallback refresh behavior

### Chatbot

- session-based AI chat
- clarification flows
- inline result previews
- inline visualization tabs
- streaming replies
- debug trace drawer support

## Architecture Notes

### Routing

- Uses Next.js App Router
- Main authenticated layout lives in [`app/(dashboard)/layout.tsx`](./app/(dashboard)/layout.tsx)
- Auth pages live outside the dashboard shell

### Data Fetching

The preferred application pattern is:

1. API access in `features/<feature>/services`
2. TanStack Query hooks in `features/<feature>/hooks`
3. UI consumption from pages and feature components

### Shared API Client

The application uses a shared Axios instance:

- [`shared/api/axios.ts`](./shared/api/axios.ts)

This client is responsible for:

- attaching auth tokens
- token refresh handling
- logout behavior on unrecoverable auth failures
- normalized error propagation

## Development Guidelines

- prefer feature hooks over direct API calls in new code
- reuse shared UI where possible
- preserve the local visual language of the section you are editing
- avoid introducing a second API client or parallel fetching stack
- keep changes aligned with App Router patterns

## Quality Checks

Before merging significant changes, run:

```bash
npm run lint
npm run build
```

## Useful Entry Points

- [`app/(dashboard)/layout.tsx`](./app/(dashboard)/layout.tsx)
- [`app/providers.tsx`](./app/providers.tsx)
- [`shared/api/axios.ts`](./shared/api/axios.ts)
- [`shared/contexts/auth-context.tsx`](./shared/contexts/auth-context.tsx)
- [`shared/contexts/sidebar-context.tsx`](./shared/contexts/sidebar-context.tsx)

## Notes

- This repo currently does not include a dedicated automated test suite.
- ESLint and production build checks are the main validation steps.

## License

This project is currently private and intended for internal/product use unless stated otherwise.
