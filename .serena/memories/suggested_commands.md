# Essential Development Commands

## Development Workflow
```bash
# Start development server
npm run dev

# Build for production (client + server bundles)
npm run build

# Preview production build locally
npm run preview

# Deploy to Cloudflare Workers
npm run deploy
```

## Database Operations
```bash
# Create D1 database instance
npm run db:create

# Run database migrations
npm run db:migrate

# Access database shell
npm run db:shell

# Run custom migration script
npm run migrate
```

## Testing Commands
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only  
npm run test:integration

# Watch mode for continuous testing
npm run test:watch
```

## Build Process
The build creates two bundles:
1. **Client bundle**: `vite build --mode client` (browser assets)
2. **Server bundle**: `vite build` (Cloudflare Worker)

## System Commands (macOS Darwin)
```bash
# File operations
ls -la          # List files with details
find . -name    # Find files by name
grep -r         # Search in files recursively

# Git operations
git status      # Check repository status
git add .       # Stage all changes
git commit -m   # Commit with message
git push        # Push to remote

# Process management
ps aux          # List running processes
kill -9 <pid>   # Force kill process
```

## Development Environment
- **Node.js**: Required for npm commands
- **Wrangler**: Cloudflare CLI for deployment and D1 operations
- **Git**: Version control
- **VS Code**: Recommended IDE with TypeScript support