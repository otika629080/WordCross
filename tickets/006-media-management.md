# #006: Media Management System

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
画像・ファイルアップロード機能。Cloudflare R2とImageの連携による高速メディア配信。

## Goals  
- [ ] 画像アップロード・管理
- [ ] 自動画像最適化・リサイズ
- [ ] メディアライブラリ
- [ ] ファイル検索・フィルタリング

## Technical Details

### Storage Architecture
```
User Upload → Cloudflare R2 → Cloudflare Images → CDN
                     ↓
                D1 (metadata)
```

### Database Schema Addition
```sql
-- Media files table
CREATE TABLE media_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  cloudflare_image_id TEXT,
  alt_text TEXT,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id)
);
```

### Upload Flow
1. クライアント → Presigned R2 URL取得
2. 直接R2へアップロード
3. Cloudflare Images API連携（自動最適化）
4. メタデータをD1に保存

### Image Variants
```typescript
// Cloudflare Images variants
const variants = {
  thumbnail: { width: 150, height: 150, fit: 'cover' },
  medium: { width: 800, height: 600, fit: 'scale-down' },
  large: { width: 1920, height: 1080, fit: 'scale-down' }
}
```

### API Routes
```typescript
// app/routes/api/media/upload.ts - アップロード処理
// app/routes/api/media/index.ts - メディア一覧
// app/routes/api/media/[id].ts - 個別ファイル操作
```

### Media Library UI
- ドラッグ&ドロップアップロード
- グリッド表示・リスト表示切り替え
- 検索・フィルタリング（ファイル名、タイプ、日付）
- 一括選択・削除
- 詳細情報編集（alt text, caption）

## Islands Components
```typescript
// app/islands/MediaLibrary.tsx - メインライブラリ
// app/islands/MediaUploader.tsx - アップロードUI  
// app/islands/MediaSelector.tsx - ページビルダー用選択UI
```

## Security & Validation
- ファイルタイプ検証（MIME + 拡張子）
- ファイルサイズ制限（10MB）
- ウイルススキャン（Cloudflare連携）
- アクセス権限制御（サイト単位）

## Files to Create
- `app/routes/api/media/` - メディアAPI群
- `app/islands/media/` - メディア関連Islands
- `app/lib/media.ts` - メディア処理ヘルパー
- `app/lib/r2.ts` - R2操作ヘルパー

## Cloudflare Configuration
- R2 bucket設定
- Images API有効化  
- wrangler.jsonc更新（R2 binding）

## Acceptance Criteria
- 画像アップロードが正常動作
- アップロード画像が自動最適化される
- メディアライブラリで管理可能
- ページビルダーから画像選択可能

## Testing Requirements
**⚠️ 必須: 本チケット完了前に以下のテストを作成し、全てPASSすること**

### Unit Tests
- [ ] `tests/unit/media.test.ts` - メディア処理ヘルパーのテスト
- [ ] `tests/unit/r2.test.ts` - R2操作ヘルパーのテスト
- [ ] `tests/unit/file-validation.test.ts` - ファイル検証のテスト

### Integration Tests
- [ ] `tests/integration/media-upload.test.ts` - メディアアップロードのテスト
- [ ] `tests/integration/r2-cloudflare-images.test.ts` - R2とImages API連携のテスト
- [ ] `tests/integration/media-library.test.ts` - メディアライブラリ機能のテスト

### Security Tests
- [ ] `tests/security/file-upload-security.test.ts` - ファイルアップロードセキュリティのテスト
- [ ] `tests/security/file-type-validation.test.ts` - ファイルタイプ検証のテスト

### E2E Tests
- [ ] `tests/e2e/media-workflow.test.ts` - メディア管理全フローのテスト
- [ ] `tests/e2e/image-optimization.test.ts` - 画像最適化のテスト

**🚫 テスト未完了時の次工程進行禁止**
- 全テストがPASSするまで #007 以降の作業開始不可
- セキュリティテスト必須（悪意あるファイル対策）

## Priority: Medium
## Estimated Time: 10-12 hours + テスト作成 4-5 hours

## Depends on: #001, #004