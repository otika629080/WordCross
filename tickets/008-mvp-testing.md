# #008: MVP Testing & Quality Assurance

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
MVP完成前の包括的テスト。機能テスト、パフォーマンステスト、セキュリティテストを実施。

## Goals
- [ ] 機能テスト完了
- [ ] パフォーマンステスト実施
- [ ] セキュリティテスト実施
- [ ] ユーザビリティテスト
- [ ] バグ修正・改善

## Test Categories

### 1. Functional Testing

#### Authentication Tests
- [ ] ログイン・ログアウト
- [ ] セッション管理
- [ ] 不正アクセス防止
- [ ] パスワードリセット

#### Admin Dashboard Tests  
- [ ] サイト作成・編集・削除
- [ ] ページ一覧表示
- [ ] 検索・フィルタリング
- [ ] ページネーション

#### Page Builder Tests
- [ ] 全コンポーネント追加・編集・削除
- [ ] ドラッグ&ドロップ操作
- [ ] レスポンシブプレビュー
- [ ] 保存・復元機能

#### Frontend Rendering Tests
- [ ] ページ表示速度
- [ ] SEOメタデータ
- [ ] カスタムドメイン
- [ ] モバイル表示

#### Media Management Tests
- [ ] 画像アップロード
- [ ] 自動リサイズ・最適化
- [ ] メディアライブラリ操作
- [ ] ファイル削除

### 2. Performance Testing

#### Load Testing
```bash
# k6やArterryでロードテスト
import http from 'k6/http'

export default function() {
  // ページ表示テスト
  http.get('https://your-cms.workers.dev/test-page')
  
  // API負荷テスト  
  http.post('https://your-cms.workers.dev/api/pages', payload)
}
```

#### Performance Metrics
- TTFB: <100ms target
- FCP: <800ms target  
- LCP: <1.2s target
- CLS: <0.1 target

### 3. Security Testing

#### Authentication Security
- [ ] JWT token検証
- [ ] SQLインジェクション対策
- [ ] XSS対策
- [ ] CSRF対策

#### File Upload Security
- [ ] ファイルタイプ検証
- [ ] ファイルサイズ制限
- [ ] 悪意あるファイル対策

#### API Security
- [ ] Rate limiting動作確認
- [ ] 入力値検証
- [ ] 権限制御

### 4. Cross-browser Testing

#### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)  
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Devices
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] タブレット表示

### 5. Database Testing

#### Data Integrity
- [ ] CRUD操作整合性
- [ ] 外部キー制約
- [ ] トランザクション処理

#### Performance
- [ ] クエリ実行時間測定
- [ ] インデックス効果確認
- [ ] 大量データでの動作

## Test Environment Setup

### Test Data
```sql
-- テスト用初期データ
INSERT INTO sites (name, domain) VALUES 
  ('Test Site 1', 'test1.example.com'),
  ('Test Site 2', 'test2.example.com');

INSERT INTO pages (site_id, title, slug, content, is_published) VALUES
  (1, 'Home Page', 'home', '{}', true),
  (1, 'About Page', 'about', '{}', true);
```

### Automated Testing
```typescript
// tests/integration/page-builder.test.ts
import { test, expect } from '@playwright/test'

test('page builder creates new page', async ({ page }) => {
  await page.goto('/admin/pages/new')
  await page.fill('#page-title', 'Test Page')
  await page.click('[data-component="text"]')
  await expect(page.locator('.page-preview')).toContainText('Test Page')
})
```

## Test Tools & Framework

### Testing Stack
- **Playwright**: E2Eテスト
- **Vitest**: ユニットテスト  
- **k6**: ロードテスト
- **Lighthouse**: パフォーマンステスト

### Files to Create
- `tests/` - テストファイル群
- `playwright.config.ts` - E2E設定
- `vitest.config.ts` - ユニットテスト設定
- `scripts/test-data.sql` - テストデータ

## Bug Tracking

### Issue Categories
1. **Critical** - システム停止・データ損失
2. **High** - 主要機能不具合
3. **Medium** - UI/UXの問題
4. **Low** - マイナーな改善点

## Acceptance Criteria
- 全機能テストがPASS
- パフォーマンス目標達成
- セキュリティ脆弱性ゼロ
- クロスブラウザ動作確認完了
- Critical/Highバグがゼロ

## Priority: High
## Estimated Time: 12-16 hours

## Depends on: #001-#007 (全チケット)