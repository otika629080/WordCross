# #007: Production Deployment & Performance Optimization

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
本番環境での超高速化を実現するための最適化とデプロイメント設定。

## Goals
- [ ] 本番環境セットアップ
- [ ] パフォーマンス最適化
- [ ] モニタリング・ログ設定
- [ ] CI/CDパイプライン構築

## Technical Details

### Performance Optimizations

#### Bundle Optimization
```typescript
// vite.config.ts 最適化
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['cloudflare:workers'],
      output: {
        manualChunks: {
          'admin': ['app/islands/admin'],
          'builder': ['app/islands/page-builder']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true }
    }
  }
})
```

#### Database Optimization
- インデックス最適化
- クエリパフォーマンス分析
- Connection pooling設定
- Prepared statements使用

#### Edge Caching Strategy
```typescript
// キャッシュヘッダー最適化
const setCacheHeaders = (c: Context, type: 'static' | 'dynamic' | 'api') => {
  switch (type) {
    case 'static':
      return c.header('Cache-Control', 'public, max-age=31536000, immutable')
    case 'dynamic':  
      return c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
    case 'api':
      return c.header('Cache-Control', 'public, max-age=300')
  }
}
```

### Production Environment Setup

#### Environment Variables
```bash
# wrangler.toml (production)
[env.production]
name = "wordcross-cms-prod"
compatibility_date = "2025-08-03"

[env.production.vars]
ENVIRONMENT = "production"
JWT_SECRET = "production-secret"
ADMIN_EMAIL = "admin@example.com"
```

#### D1 Production Database
- 本番D1データベース作成
- マイグレーション実行スクリプト
- バックアップ戦略

### Monitoring & Analytics

#### Performance Monitoring
```typescript
// app/middleware/analytics.ts
const analyticsMiddleware = async (c: Context, next: Next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  
  // Cloudflare Analytics または外部サービスに送信
  await logPerformance({
    url: c.req.url,
    method: c.req.method,
    duration,
    status: c.res.status
  })
}
```

#### Error Tracking
- エラーログ収集
- パフォーマンスメトリクス
- アラート設定

### CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx wrangler deploy --env production
```

#### Deployment Strategy
- Blue-Green deployment
- Database migration自動実行
- Rollback plan

### Security Hardening

#### Headers & CSP
```typescript
// app/middleware/security.ts
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

#### Rate Limiting
- API endpoint保護
- ブルートフォース対策
- DDoS緩和

## Files to Create/Modify
- `.github/workflows/deploy.yml` - CI/CD設定
- `scripts/migrate.ts` - DBマイグレーションスクリプト
- `app/middleware/analytics.ts` - 分析ミドルウェア
- `app/middleware/security.ts` - セキュリティヘッダー
- `wrangler.toml` - 本番環境設定

## Performance Targets (Production)
- **Bundle Size**: <500KB (gzipped)
- **Cold Start**: <50ms
- **TTFB**: <50ms
- **Database Query**: <10ms average

## Acceptance Criteria
- 本番環境への自動デプロイが動作
- 全ページが目標パフォーマンス達成
- エラー監視が正常動作
- セキュリティヘッダーが適切に設定

## Testing Requirements
**⚠️ 必須: 本チケット完了前に以下のテストを作成し、全てPASSすること**

### Performance Tests
- [ ] `tests/performance/bundle-size.test.ts` - バンドルサイズのテスト
- [ ] `tests/performance/cold-start.test.ts` - コールドスタート時間のテスト
- [ ] `tests/performance/database-query.test.ts` - データベースクエリパフォーマンスのテスト

### Security Tests
- [ ] `tests/security/headers.test.ts` - セキュリティヘッダーのテスト
- [ ] `tests/security/rate-limiting.test.ts` - レートリミットのテスト
- [ ] `tests/security/csp.test.ts` - CSP設定のテスト

### Deployment Tests
- [ ] `tests/deployment/staging.test.ts` - ステージングデプロイのテスト
- [ ] `tests/deployment/production.test.ts` - 本番デプロイのテスト
- [ ] `tests/deployment/rollback.test.ts` - ロールバックのテスト

### Monitoring Tests
- [ ] `tests/monitoring/analytics.test.ts` - 分析データ収集のテスト
- [ ] `tests/monitoring/error-tracking.test.ts` - エラートラッキングのテスト

**🚫 テスト未完了時の次工程進行禁止**
- 全テストがPASSするまで #008 以降の作業開始不可
- パフォーマンス目標全順目達成必須

## Priority: Medium
## Estimated Time: 8-10 hours + テスト作成 3-4 hours

## Depends on: #001, #005