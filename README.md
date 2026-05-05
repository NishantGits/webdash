# Cloudflare Workers Full-Stack Boilerplate

[cloudflarebutton]

A production-ready full-stack template for Cloudflare Workers with React, shadcn/ui, Tailwind CSS, Tanstack Query, and Durable Objects. Includes a demo real-time chat application with users, chat boards, and messages for rapid development.

## Features

- **Full-Stack Ready**: React frontend with routing, state management, and API integration.
- **Modern UI**: shadcn/ui components, Tailwind CSS with custom design system, dark mode support.
- **Type-Safe**: End-to-end TypeScript with shared types between frontend and worker.
- **Durable Objects**: Entity-based architecture (Users, ChatBoards) with indexing for lists.
- **API Layer**: Hono-based REST API with CORS, error handling, and pagination.
- **Development Tools**: Vite HMR, Bun scripts, Tanstack Query for data fetching.
- **Production Optimized**: Cloudflare deployment, SQLite-backed Durable Objects.
- **Demo Included**: Interactive chat demo with create/list/delete operations.

## Tech Stack

### Frontend
- React 18 + React Router
- Vite (fast HMR)
- Tailwind CSS + shadcn/ui + Lucide icons
- Tanstack Query (data fetching/caching)
- Zustand (state management)
- Framer Motion (animations)
- Sonner (toasts)

### Backend
- Cloudflare Workers + Hono
- Durable Objects (Global storage + Entities)
- SQLite (via DO storage)

### Tools
- Bun (package manager/scripts)
- TypeScript (strict mode)
- ESLint + Prettier

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`bunx wrangler@latest`)
- Cloudflare account with Workers enabled

### Installation
```bash
bun install
```

### Development
```bash
# Start dev server (frontend + worker proxy)
bun dev

# Open http://localhost:3000 (or $PORT)
```

Hot Module Replacement works seamlessly. Frontend proxies API calls to the worker.

### Type Generation
```bash
bun cf-typegen  # Generate Worker types
```

## Usage

### API Examples
All endpoints under `/api/*`. Uses JSON responses with `{ success, data, error }`.

```bash
# Health check
curl http://localhost:3000/api/health

# List users (paginated)
curl "http://localhost:3000/api/users?limit=10"

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'

# List chats
curl http://localhost:3000/api/chats

# Create chat
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"title": "My Chat"}'

# List messages in chat
curl http://localhost:3000/api/chats/{chatId}/messages

# Send message
curl -X POST http://localhost:3000/api/chats/{chatId}/messages \
  -H "Content-Type: application/json" \
  -d '{"userId": "u1", "text": "Hello!"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/{userId}
```

Full API in `worker/user-routes.ts`. Extend by adding routes there.

### Frontend Customization
- Replace `src/pages/HomePage.tsx` with your app.
- Use shadcn/ui components from `src/components/ui/*`.
- API client: `src/lib/api-client.ts`.
- Hooks: `useTheme`, `useMobile`.
- Layouts: `AppLayout.tsx` (with sidebar).

### Backend Entities
Extend `worker/entities.ts`:
```typescript
export class MyEntity extends IndexedEntity<MyState> {
  static readonly entityName = "myentity";
  static readonly indexName = "myentities";
  static readonly initialState = { id: "", /* ... */ };
}
```
Auto-indexed lists, CRUD helpers included.

## Build & Deploy

```bash
# Build for production
bun build

# Deploy to Cloudflare (requires `wrangler login` & account ID in wrangler.jsonc)
bun deploy
```

[cloudflarebutton]

View live at `https://${YOUR_SUBDOMAIN}.workers.dev`.

### Custom Domain
```bash
wrangler deploy --var CUSTOM_DOMAIN:yourdomain.com
```

## Project Structure

```
├── src/              # React app
│   ├── components/   # UI components + shadcn/ui
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities + API client
│   └── pages/        # Route pages
├── shared/           # Shared types
├── worker/           # Cloudflare Worker
│   ├── core-utils.ts # DO utilities (DO NOT MODIFY)
│   ├── entities.ts   # Your entities
│   └── user-routes.ts # Your API routes
├── tailwind.config.js # Design system
└── wrangler.jsonc    # DO config
```

## Customization Guide

1. **Update `package.json` name & scripts.**
2. **Add routes**: `worker/user-routes.ts`.
3. **Add entities**: `worker/entities.ts`.
4. **Style**: `tailwind.config.js` + `src/index.css`.
5. **Pages**: `src/pages/*` + `src/main.tsx` router.
6. **Deploy**: `bun deploy`.

## Contributing
Fork, create a branch, PR to `main`. Follow TypeScript/ESLint rules.

## License
MIT. See [LICENSE](LICENSE) for details.