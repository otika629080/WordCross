# #005: Frontend Page Rendering Engine

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
作成されたページを高速にレンダリングするフロントエンドエンジン。HonoXのSSRとEdge Computingを最大活用。

## Goals
- [ ] 超高速ページレンダリング
- [ ] SEO最適化（メタタグ、OGP）
- [ ] カスタムドメイン対応
- [ ] キャッシュ戦略実装

## Technical Details

### Rendering Architecture
```typescript
// app/routes/[...slug].tsx - 動的ルート（全ページ）
// app/lib/renderer.ts - コンポーネントレンダラー
// app/components/frontend/ - フロントエンド専用コンポーネント
```

### Component Renderer
```typescript
interface RenderContext {
  component: PageComponent
  siteConfig: SiteConfig
  isPreview?: boolean
}

const renderComponent = (ctx: RenderContext): JSX.Element => {
  switch (ctx.component.type) {
    case 'text': return <TextComponent {...ctx} />
    case 'image': return <ImageComponent {...ctx} />
    // ...
  }
}
```

### Performance Optimizations
- **Edge Caching**: Cloudflare CDNでページ全体キャッシュ
- **Database Caching**: 頻繁にアクセスされるページはKVにキャッシュ
- **Image Optimization**: Cloudflare Imagesとの連携
- **CSS Purging**: 使用されるTailwindクラスのみ配信

### SEO Features
- 動的メタタグ生成
- OpenGraph対応
- JSON-LD構造化データ
- XMLサイトマップ自動生成

### Custom Domain Support
```typescript
// ドメインベースでサイト判定
const getSiteFromRequest = (request: Request): Site | null => {
  const hostname = new URL(request.url).hostname
  // D1からドメインでサイト検索
}
```

## Caching Strategy

### Level 1: Cloudflare Edge Cache
- 静的アセット: 1年
- ページHTML: 1時間（再生成時purge）

### Level 2: KV Cache  
- 人気ページ: 24時間
- サイト設定: 1時間

### Level 3: D1 Database
- ソースオブトゥルース

## Files to Create
- `app/routes/[...slug].tsx` - メインレンダリングルート
- `app/lib/renderer.ts` - コンポーネントレンダラー
- `app/lib/cache.ts` - キャッシュ管理
- `app/components/frontend/` - フロントエンドコンポーネント群

## Performance Targets
- **TTFB**: <100ms (Edge locations)
- **FCP**: <800ms
- **LCP**: <1.2s
- **CLS**: <0.1

## Acceptance Criteria
- 作成したページがパブリックURLでアクセス可能
- ページロードが極めて高速
- SEOメタデータが正しく設定
- モバイル・デスクトップで正常表示

## Testing Requirements
**⚠️ 必須: 本チケット完了前に以下のテストを作成し、全てPASSすること**

### Unit Tests
- [ ] `tests/unit/renderer.test.ts` - コンポーネントレンダラーのテスト
- [ ] `tests/unit/cache.test.ts` - キャッシュ管理のテスト
- [ ] `tests/unit/seo.test.ts` - SEOメタデータ生成のテスト

### Integration Tests
- [ ] `tests/integration/page-routing.test.ts` - ページルーティングのテスト
- [ ] `tests/integration/cache-strategy.test.ts` - キャッシュ戦略のテスト
- [ ] `tests/integration/custom-domain.test.ts` - カスタムドメインのテスト

### Performance Tests
- [ ] `tests/performance/rendering-speed.test.ts` - レンダリング速度のテスト
- [ ] `tests/performance/cache-hit-rate.test.ts` - キャッシュヒット率のテスト

### E2E Tests
- [ ] `tests/e2e/page-load.test.ts` - ページ読み込みのテスト
- [ ] `tests/e2e/seo-validation.test.ts` - SEO機能の検証テスト

**🚫 テスト未完了時の次工程進行禁止**
- 全テストがPASSするまで #006 以降の作業開始不可
- パフォーマンス目標達成必須（TTFB <100ms, LCP <1.2s）

## Priority: High
## Estimated Time: 12-14 hours + テスト作成 5-6 hours

## Depends on: #001, #004