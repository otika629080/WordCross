# Testing and Quality Standards

## Testing Requirements (Mandatory)
**🚫 テスト未完了時の次工程進行禁止** - No progress to next ticket without passing tests

## Test Coverage Requirements
- **Minimum Coverage**: 80% for branches, functions, lines, statements
- **Test Types**: Unit, Integration, E2E tests required for each ticket
- **Security Tests**: Mandatory for auth, file upload, and API endpoints

## Test Configuration (Vitest)
```typescript
// vitest.config.ts settings
test: {
  globals: true,
  environment: 'node',
  include: ['tests/**/*.test.ts'],
  coverage: {
    provider: 'v8',
    thresholds: {
      global: {
        branches: 80,
        functions: 80, 
        lines: 80,
        statements: 80
      }
    }
  }
}
```

## Test Directory Structure
```
tests/
├── unit/              # Unit tests for individual functions/classes
│   ├── database-types.test.ts
│   ├── db.test.ts
│   └── ...
├── integration/       # Integration tests for API endpoints
│   ├── schema.test.ts
│   ├── d1-crud.test.ts
│   └── ...
└── e2e/              # End-to-end user flow tests
    └── ...
```

## Current Test Status (#001 Complete)
- **Unit Tests**: 32/32 (100%) ✅ 
- **Integration Tests**: 30/30 (100%) ✅
- **Total Tests Passing**: 62/62 ✅
- **Code Coverage**: 80%+ achieved ✅

## Quality Gates for Each Ticket
1. All unit tests must pass
2. All integration tests must pass  
3. E2E tests for user flows must pass
4. Code coverage meets 80% threshold
5. Security tests pass (for auth/security features)
6. TypeScript compilation without errors
7. No `any` types in codebase

## Testing Commands
```bash
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:integration  # Integration tests only
npm run test:watch # Watch mode for development
```