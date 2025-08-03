# #002: Authentication & Session Management

## Coding Standards
**⚠️ 実装前必読: 以下の規約とベストプラクティスに必ず従うこと**

### Code Quality Rules
- **any型の使用を禁止** - 必ずTypeScript型を明示的に定義
- **TailwindCSS v4のみ使用** - 通常のCSSファイルは使用禁止
- **TailwindCSS v4記法必須** - ダークモード対応（`dark:`）クラス必須

### Required Reading (実装前必須)
- **Hono Framework**: https://hono.dev/llms-full.txt
- **HonoX Meta-framework**: https://github.com/honojs/honox
- **Cloudflare Workers**: https://developers.cloudflare.com/llms-full.txt

---

## Overview
CMS管理者用のシンプルな認証システム。HonoのJWTミドルウェアとD1を活用。

## Goals
- [ ] JWT認証の実装
- [ ] セッション管理（Cloudflare KV使用を検討）
- [ ] ログイン/ログアウト機能
- [ ] 認証ガードミドルウェア

## Technical Details

### Database Schema Addition
```sql
-- Admin users table
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Key Components
- `app/middleware/auth.ts` - JWT認証ミドルウェア
- `app/routes/auth/login.tsx` - ログインページ
- `app/routes/auth/logout.tsx` - ログアウト処理
- `app/lib/auth.ts` - 認証ヘルパー関数

### Security Features
- bcryptでパスワードハッシュ化
- JWT with secure httpOnly cookies
- CSRF protection
- Rate limiting (Hono middleware)

## Dependencies
- `@hono/jwt` - JWT認証
- `bcryptjs` - パスワードハッシュ化（Workers互換）

## Acceptance Criteria
- 管理者ログイン/ログアウトが動作
- 認証が必要なルートが保護される
- セキュアなセッション管理

## Testing Requirements
**⚠️ 必須: 本チケット完了前に以下のテストを作成し、全てPASSすること**

### Unit Tests
- [ ] `tests/unit/auth.test.ts` - 認証ヘルパー関数のテスト
- [ ] `tests/unit/jwt.test.ts` - JWT生成・検証のテスト
- [ ] `tests/unit/password.test.ts` - パスワードハッシュ化のテスト

### Integration Tests
- [ ] `tests/integration/auth-api.test.ts` - 認証APIエンドポイントのテスト
- [ ] `tests/integration/auth-middleware.test.ts` - 認証ミドルウェアのテスト

### E2E Tests
- [ ] `tests/e2e/login-flow.test.ts` - ログイン・ログアウトフローのテスト

**🚫 テスト未完了時の次工程進行禁止**
- 全テストがPASSするまで #003 以降の作業開始不可
- セキュリティテスト必須

## Priority: High  
## Estimated Time: 6-8 hours + テスト作成 3-4 hours

## Depends on: #001