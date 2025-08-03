# Ticket Completion Workflow

## Task Completion Requirements (Must Follow)
When completing any ticket, the following steps are mandatory:

## 1. Code Implementation
- Follow all coding conventions in `coding_conventions.md`
- No `any` types allowed - use explicit TypeScript types
- TailwindCSS v4 only with dark mode support (`dark:` classes)
- Implement all features specified in the ticket

## 2. Testing Requirements ⚠️ CRITICAL
**🚫 次工程進行禁止 - Cannot proceed to next ticket without:**
- All unit tests written and passing
- All integration tests written and passing  
- E2E tests for user flows written and passing
- 80%+ code coverage achieved
- Security tests (for auth/security features)

## 3. Quality Checks
```bash
# Run before marking ticket complete
npm test              # All tests must pass
npm run build         # Build must succeed
npm run test:unit     # Unit tests
npm run test:integration  # Integration tests
```

## 4. Documentation Updates
- Update PROGRESS.md with completion status
- Update test counts and coverage metrics
- Mark ticket as ✅ Completed

## 5. Verification Checklist
- [ ] All acceptance criteria met
- [ ] Code follows project conventions
- [ ] Tests written and passing (unit + integration + e2e)
- [ ] 80%+ code coverage maintained
- [ ] TypeScript compilation without errors
- [ ] No `any` types in codebase
- [ ] TailwindCSS v4 with dark mode support
- [ ] Build process succeeds
- [ ] Security requirements met (if applicable)

## Current Progress Status
- **#001**: ✅ Complete (62/62 tests passing)
- **#002**: 🔴 Not Started (Authentication & Session)
- **#003-008**: 🔴 Pending

## Next: Start #002 Authentication & Session Management
Ready to begin implementing JWT authentication, session management, and admin login system.