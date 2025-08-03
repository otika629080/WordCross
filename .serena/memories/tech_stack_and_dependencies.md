# Tech Stack and Dependencies

## Core Dependencies
```json
{
  "dependencies": {
    "@hono/zod-validator": "^0.7.2",
    "hono": "^4.8.12",
    "honox": "^0.1.43", 
    "zod": "^4.0.14"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250214.0",
    "@hono/vite-build": "^1.3.0",
    "@hono/vite-dev-server": "^0.18.2",
    "@tailwindcss/vite": "^4.0.9",
    "@types/node": "^22.0.0",
    "tailwindcss": "^4.0.9",
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "vite": "^6.3.5",
    "vitest": "^2.0.0",
    "wrangler": "^4.4.0"
  }
}
```

## Framework Architecture
- **HonoX**: Meta-framework providing file-based routing, SSR, and island architecture
- **Hono**: Web framework for the server-side runtime
- **Islands Architecture**: Interactive components (in `app/islands/`) that hydrate on the client
- **Cloudflare Workers**: Edge runtime for ultra-fast global deployment

## Database
- **Cloudflare D1**: SQLite database with global distribution
- **Tables**: sites, pages, page_components, admin_users
- **Migration**: SQL files in `migrations/` directory
- **Access**: Type-safe Database class with CRUD operations

## Build System
- **Vite**: Build tool with HonoX integration
- **Two-stage build**: Client bundle + Server bundle for Cloudflare Workers
- **TailwindCSS v4**: Integrated via Vite plugin
- **TypeScript**: Strict mode enabled, JSX configured for React with hono/jsx