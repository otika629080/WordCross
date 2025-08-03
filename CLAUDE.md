# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Documentation

**Always refer to these core resources when working on this project:**

- **Hono Framework**: https://hono.dev/llms-full.txt
- **HonoX Meta-framework**: https://github.com/honojs/honox
- **Cloudflare Workers**: https://developers.cloudflare.com/llms-full.txt

These three resources are the foundation of this project and should be consulted for accurate implementation patterns and best practices.

## Project Architecture

This is a **HonoX** application - a full-stack React framework built on top of **Hono** for server-side rendering and client hydration. The application is configured to deploy to **Cloudflare Workers**.

### Key Framework Components
- **HonoX**: Meta-framework providing file-based routing, SSR, and island architecture
- **Hono**: Web framework for the server-side runtime
- **Islands Architecture**: Interactive components (in `app/islands/`) that hydrate on the client
- **Tailwind CSS v4**: Utility-first CSS framework with native dark mode support using CSS variables

### Directory Structure
```
app/
├── server.ts          # Server entry point - creates HonoX app
├── client.ts          # Client entry point - handles hydration
├── routes/            # File-based routing (SSR pages)
│   ├── index.tsx      # Home page route
│   ├── _renderer.tsx  # HTML shell/layout
│   ├── _404.tsx       # 404 error page
│   └── _error.tsx     # Error boundary
├── islands/           # Client-side interactive components
│   └── counter.tsx    # Example island component
├── style.css          # Global styles (Tailwind imports)
└── global.d.ts        # TypeScript declarations
```

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (client bundle + server bundle)
- `npm run preview` - Preview production build locally using Wrangler
- `npm run deploy` - Build and deploy to Cloudflare Workers

## Build Process

The build creates two bundles:
1. **Client bundle**: `vite build --mode client` (for browser assets)
2. **Server bundle**: `vite build` (for Cloudflare Worker)

## Deployment

The application is configured for **Cloudflare Workers** deployment with:
- Wrangler configuration in `wrangler.jsonc`
- Static assets served from `./dist` directory
- Node.js compatibility enabled

## TypeScript Configuration

- JSX configured for React with `hono/jsx` as import source
- Cloudflare Workers types included
- Strict mode enabled

## Styling Guidelines

### TailwindCSS v4 Dark Mode
- **Must use**: Native dark mode classes (e.g., `bg-white dark:bg-slate-900`)
- **Default**: All components support both light and dark themes
- **Approach**: CSS variables for seamless theme transitions
- **Testing**: All UI must be tested in both light and dark modes

### Dark Mode Implementation
```typescript
// Required pattern for all components
const componentStyles = {
  container: "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100",
  button: "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400",
  input: "bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
}
```