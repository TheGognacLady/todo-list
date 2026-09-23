# Todo List

[English](README.md) | [Русский](README.ru.md)

A task management application built with React and TypeScript, featuring authentication, todo list and task management, filtering, theme switching, and REST API integration. The project uses RTK Query for server-state management and a Vercel server-side proxy for production API requests.

**[Live Demo](https://todo-list-swart-phi-73.vercel.app/#/login)**

## Demo Account

Use the public test account:

- **Email:** `free@samuraijs.com`
- **Password:** `free`

## Preview

![Todo List application preview](docs/todo-list-preview.png)

## Features

- Sign in, restore authentication on startup, sign out, and access protected routes.
- Create, rename, and delete todo lists and tasks; double-click a title to edit it.
- Mark tasks as completed or active; filter by All, Active, or Completed.
- Switch between light and dark themes.
- Validate the login form and reject empty titles when creating items.
- Show loading skeletons, progress indicators, and API error notifications.

## Tech Stack

| Area | Technologies |
| --- | --- |
| UI | React, TypeScript, Material UI, Emotion, CSS Modules |
| State and API | Redux Toolkit, RTK Query |
| Routing | React Router (`HashRouter`) |
| Forms | React Hook Form, Zod |
| Tooling and tests | Vite, pnpm, Vitest |
| Deployment | Vercel, Vercel Functions |

## Architecture / API

```text
Development: React → Vite development proxy → SamuraiJS API
Production:  React → Vercel server-side proxy → SamuraiJS API
```

RTK Query handles server-state requests, caching, and invalidation after mutations. The production proxy in [api/proxy.js](api/proxy.js) provides the browser with a same-origin API path at `/api/1.1/`, avoiding direct cross-origin requests to SamuraiJS.

## Getting Started

Prerequisites: Node.js 22.12+ and pnpm.

```bash
git clone https://github.com/TheGognacLady/todo-list.git
cd todo-list
pnpm install
```

Create `.env.local` in the project root and supply your SamuraiJS API key:

```dotenv
VITE_API_KEY=your_api_key_here
```

Then start the development server:

```bash
pnpm dev
```

Open [http://127.0.0.1:3000/#/login](http://127.0.0.1:3000/#/login).

Do not commit real API keys or tokens. Environment files are ignored by Git, but `VITE_` values are included in the browser bundle.

## Testing

Unit tests in [src/tests](src/tests) use Vitest:

- `createTaskModel`: update payload construction, unchanged fields, zero/null values, exclusion of server-only fields, and immutability.
- `handleError`: HTTP errors, network/timeout/parsing failures, business errors, missing messages, and unexpected response shapes.

Tests use mocked dispatch and do not need a live API or credentials. Vitest uses the existing Vite configuration, including its import alias. These tests cover utilities, not the complete UI or end-to-end authentication flows.

```bash
pnpm test          # Watch mode
pnpm test --run    # Single run
pnpm build        # TypeScript check and production build
```

## Deployment

The application is deployed on Vercel. Configure `VITE_API_KEY` in Vercel before building. [vercel.json](vercel.json) defines the deployment and API proxy configuration.

## Project Structure

```text
api/                 # Vercel API proxy
src/
  app/               # App entry, store, shared API configuration
  common/            # Shared UI, hooks, routing, theme, utilities
  features/
    auth/            # Login form, validation, authentication API
    todolists/       # Todo lists, tasks, API models and UI
  tests/             # Utility unit tests
docs/                # Application screenshot
```

## Key Technical Decisions

- Typed API models and mutation payloads, with types inferred from Zod schemas where used; login validation runs through the Zod resolver.
- RTK Query tag invalidation after mutations and cache updates for local list filters.
- A reusable `createTaskModel` utility builds task update payloads without mutating the original task.
- Centralized API error handling feeds a shared snackbar; unit tests exercise error-response edge cases.
- A server-side proxy keeps production API requests on the application's origin.

## Project Background

The project started during frontend development training at IT-Incubator. It was subsequently refined, supplemented with unit tests, and deployed to Vercel as a portfolio project.
