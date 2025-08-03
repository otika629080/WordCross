# WordCross CMS - Project Overview

## Project Purpose
WordCross is a **cloudflare特化超高速分散コンピューティングCMS** - a ultra-fast CMS designed to completely replace WordPress. It leverages Cloudflare Workers, HonoX, and SQLite(D1) to create a Google Sites-equivalent no-code site builder for the MVP phase.

## Architecture
- **Framework**: HonoX (full-stack React meta-framework built on Hono)
- **Runtime**: Cloudflare Workers 
- **Database**: SQLite via Cloudflare D1
- **Styling**: TailwindCSS v4 (with dark mode support)
- **Language**: TypeScript (strict mode, no `any` types allowed)

## Tech Stack
- **Frontend**: HonoX with Islands Architecture, React JSX
- **Backend**: Hono web framework
- **Database**: Cloudflare D1 (SQLite)
- **Validation**: Zod schema validation
- **Testing**: Vitest (unit, integration, e2e tests)
- **Build**: Vite with Cloudflare Workers adapter
- **Deployment**: Wrangler (Cloudflare CLI)

## Current Status
- **Phase**: Foundation Setup (Phase 1 of 4)
- **Progress**: 1/8 tickets complete (12.5%)
- **Last Completed**: #001 Project Setup & D1 Database
- **Next**: #002 Authentication & Session Management

## Key Features (MVP Goal)
- Google Sites equivalent no-code site builder
- Visual drag-and-drop page builder
- Ultra-fast page delivery via Cloudflare edge network
- Responsive design support
- SEO optimization
- Media management
- Admin authentication and site management