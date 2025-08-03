# #003: Admin Dashboard Core

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
管理者用ダッシュボードのコア機能。サイト一覧、ページ管理、基本統計の表示。

## Goals
- [ ] レスポンシブな管理画面レイアウト
- [ ] サイト作成・編集・削除機能
- [ ] ページ一覧表示
- [ ] 基本的なナビゲーション

## Technical Details

### HonoX Islands Architecture活用
```typescript
// app/islands/SiteList.tsx - クライアントサイド操作
// app/routes/admin/dashboard.tsx - SSRページ
// app/routes/admin/sites/new.tsx - サイト作成
```

### UI Components (TailwindCSS)
- ダッシュボードレイアウト
- データテーブル（サイト・ページ一覧）
- モーダル（作成・編集）
- アラート・通知システム

### API Routes
```typescript
// app/routes/api/sites/index.ts - GET, POST
// app/routes/api/sites/[id].ts - GET, PUT, DELETE
// app/routes/api/pages/index.ts - GET, POST
```

### Key Features
- リアルタイム検索・フィルタリング
- ページネーション
- Bulk操作（複数選択・削除）
- ドラッグ&ドロップ並び替え

## Files to Create
- `app/routes/admin/` - 管理画面ルート群
- `app/islands/admin/` - 管理画面Islands
- `app/components/admin/` - 再利用可能コンポーネント
- `app/lib/admin-api.ts` - 管理API クライアント

## Acceptance Criteria
- 管理画面にログイン後アクセス可能
- サイトのCRUD操作が完全に動作
- ページ一覧が正しく表示される
- モバイル対応済み

## Testing Requirements
**⚠️ 必須: 本チケット完了前に以下のテストを作成し、全てPASSすること**

### Unit Tests
- [ ] `tests/unit/admin-api.test.ts` - 管理APIクライアントのテスト
- [ ] `tests/unit/site-operations.test.ts` - サイト操作ロジックのテスト

### Integration Tests
- [ ] `tests/integration/admin-api-endpoints.test.ts` - 管理APIエンドポイントのテスト
- [ ] `tests/integration/dashboard-data.test.ts` - ダッシュボードデータ取得のテスト

### E2E Tests
- [ ] `tests/e2e/admin-dashboard.test.ts` - 管理画面ナビゲーションのテスト
- [ ] `tests/e2e/site-management.test.ts` - サイト作成・編集・削除のテスト

**🚫 テスト未完了時の次工程進行禁止**
- 全テストがPASSするまで #004 以降の作業開始不可
- レスポンシブテスト必須

## Priority: High
## Estimated Time: 10-12 hours + テスト作成 4-5 hours

## Depends on: #001, #002