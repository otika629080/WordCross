# #001: Project Setup & D1 Database Configuration

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
WordPress代替CMSのための基盤セットアップ。Cloudflare D1データベースとプロジェクト構成の設定。

## Goals
- [ ] D1データベース設定とwrangler.jsonc更新
- [ ] 基本的なDB schema設計
- [ ] D1接続のための型定義作成
- [ ] 開発環境でのローカルD1セットアップ

## Technical Details

### D1 Schema (初期版)
```sql
-- Sites table
CREATE TABLE sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pages table  
CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id)
);

-- Page components (blocks)
CREATE TABLE page_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL,
  component_type TEXT NOT NULL, -- 'text', 'image', 'button', etc.
  component_data TEXT NOT NULL, -- JSON data
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (page_id) REFERENCES pages(id)
);
```

### Files to Create/Modify
- `wrangler.jsonc` - D1 binding設定
- `app/lib/db.ts` - D1接続とクエリヘルパー
- `app/types/database.ts` - DB型定義
- `migrations/001-initial.sql` - 初期スキーマ

## Testing Requirements
**⚠️ 必須: 本チケット完了前に以下のテストを作成し、全てPASSすること**

### Unit Tests
- [ ] `tests/unit/db.test.ts` - D1接続・クエリヘルパーのテスト
- [ ] `tests/unit/database-types.test.ts` - 型定義の検証

### Integration Tests  
- [ ] `tests/integration/d1-crud.test.ts` - 実際のD1でのCRUD操作テスト
- [ ] `tests/integration/schema.test.ts` - スキーマ整合性テスト

### Test Commands
```bash
# 単体テスト実行
npm run test:unit

# 統合テスト実行（ローカルD1使用）
npm run test:integration

# 全テスト実行
npm run test
```

**🚫 テスト未完了時の次工程進行禁止**
- 全テストがPASSするまで #002 以降の作業開始不可
- テストカバレッジ80%以上必須

## Acceptance Criteria
- D1データベースがローカルとリモートで動作
- 型安全なDBクエリが実行可能
- 基本的なCRUD操作のテスト完了
- **全テストがPASSしていること**

## Priority: High
## Estimated Time: 4-6 hours + テスト作成 2-3 hours