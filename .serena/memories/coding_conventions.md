# Coding Conventions and Style Guide

## Strict Rules (Must Follow)
1. **any型の使用を禁止** - TypeScript types must be explicitly defined, no `any` types allowed
2. **TailwindCSS v4のみ使用** - Only TailwindCSS for styling, no regular CSS files
3. **TailwindCSS v4記法必須** - Dark mode support using `dark:` classes is mandatory

## TypeScript Configuration
- **Strict mode**: Enabled in tsconfig.json
- **JSX**: React JSX with `hono/jsx` as import source
- **Module system**: ESNext with Bundler resolution
- **Target**: ESNext
- **Types**: Cloudflare Workers types included

## TailwindCSS v4 Dark Mode Implementation
**Required pattern for all components:**
```typescript
const componentStyles = {
  container: "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100",
  button: "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400",
  input: "bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
}
```

## File Organization
- **Islands**: Client-side interactive components in `app/islands/`
- **Routes**: File-based routing in `app/routes/`
- **Types**: Database and other types in `app/types/`
- **Lib**: Utility functions and classes in `app/lib/`
- **Middleware**: Hono middleware in `app/middleware/`

## Code Quality Standards
- **No comments unless necessary** (self-documenting code preferred)
- **Type safety**: All functions and variables must have explicit types
- **Validation**: Use Zod for schema validation
- **Error handling**: Proper error types and handling
- **Testing**: Comprehensive unit, integration, and e2e tests required