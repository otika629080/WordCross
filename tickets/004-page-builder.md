# #004: Visual Page Builder (Google Sites風)

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
ドラッグ&ドロップのビジュアルページビルダー。Google Sitesと同等のノーコード体験を提供。

## Goals
- [ ] コンポーネントベースのページ構築
- [ ] ドラッグ&ドロップインターフェース
- [ ] リアルタイムプレビュー
- [ ] レスポンシブデザイン対応
- [ ] **TailwindCSS v4ネイティブダークモード対応**

## Technical Details

### Component System
```typescript
// Base component types
type ComponentType = 'text' | 'image' | 'button' | 'heading' | 'spacer' | 'columns'

interface PageComponent {
  id: string
  type: ComponentType
  props: Record<string, any>
  children?: PageComponent[]
  styles?: ComponentStyles
}
```

### Available Components (MVP)
1. **Text Block** - Rich text editor with dark mode styling
2. **Heading** - H1-H6 with auto dark mode adaptation
3. **Image** - Upload + positioning with dark mode overlays
4. **Button** - Call-to-action buttons with dark variants
5. **Spacer** - Vertical spacing control
6. **Columns** - Layout container (2-4 columns) with dark backgrounds

### TailwindCSS v4 Dark Mode Features
```typescript
// Component styling with automatic dark mode
interface ComponentStyles {
  // Light mode (default)
  background: string // bg-white
  text: string       // text-gray-900
  border: string     // border-gray-200
  
  // Dark mode (automatic with CSS variables)
  // bg-white → bg-slate-900
  // text-gray-900 → text-gray-100  
  // border-gray-200 → border-gray-700
}

// v4 Dark mode implementation
const componentClasses = {
  container: "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100",
  button: "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400",
  card: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
}
```

### Key Islands
```typescript
// app/islands/PageBuilder.tsx - メインビルダー（ダークモード対応UI）
// app/islands/ComponentPalette.tsx - コンポーネント選択（ダークテーマ）
// app/islands/PropertyPanel.tsx - 選択中コンポーネントの設定（ダーク対応）
// app/islands/PreviewFrame.tsx - リアルタイムプレビュー（ライト/ダーク切り替え）
// app/islands/ThemeToggle.tsx - ダークモード切り替えボタン
```

### Drag & Drop Features
- コンポーネント追加（パレットから）
- 並び替え（ページ内）
- ネストされたコンポーネント（カラム内など）
- 削除・複製・元に戻す

### Data Flow
```
PageBuilder (State) 
  ↓ 
ComponentRenderer (Display)
  ↓
D1 Database (Persist)
```

## Files to Create
- `app/islands/page-builder/` - ビルダー関連Islands
- `app/components/builder/` - ビルダー専用UI
- `app/lib/page-builder.ts` - ページ構築ロジック
- `app/routes/admin/pages/[id]/edit.tsx` - 編集画面

## Technical Challenges
- パフォーマンス（大きなページでのドラッグ処理）
- 状態管理（複雑なネストされたコンポーネント）
- レスポンシブプレビュー

## Acceptance Criteria
- 新規ページを視覚的に作成可能
- すべてのMVPコンポーネントが動作
- 変更がリアルタイムでプレビューされる
- 作成したページがD1に保存される
- **ライト/ダークモードの完全対応**
- **プレビューでのテーマ切り替え機能**
- **全コンポーネントがダークモードで適切に表示**

## Testing Requirements
**⚠️ 必須: 本チケット完了前に以下のテストを作成し、全てPASSすること**

### Unit Tests
- [ ] `tests/unit/page-builder.test.ts` - ページ構築ロジックのテスト
- [ ] `tests/unit/component-renderer.test.ts` - コンポーネントレンダリングのテスト
- [ ] `tests/unit/drag-drop.test.ts` - D&Dロジックのテスト

### Integration Tests
- [ ] `tests/integration/page-save.test.ts` - ページ保存機能のテスト
- [ ] `tests/integration/component-crud.test.ts` - コンポーネントCRUDのテスト

### E2E Tests
- [ ] `tests/e2e/page-builder-workflow.test.ts` - ページ作成全フローのテスト
- [ ] `tests/e2e/drag-drop-ui.test.ts` - D&DUI操作のテスト
- [ ] `tests/e2e/responsive-preview.test.ts` - レスポンシブプレビューのテスト
- [ ] `tests/e2e/dark-mode-builder.test.ts` - ダークモードビルダー操作のテスト
- [ ] `tests/e2e/theme-preview-toggle.test.ts` - プレビューテーマ切り替えのテスト

**🚫 テスト未完了時の次工程進行禁止**
- 全テストがPASSするまで #005 以降の作業開始不可
- パフォーマンステスト必須（大きなページでのD&D操作）

## Priority: High
## Estimated Time: 16-20 hours + テスト作成 6-8 hours

## Depends on: #001, #003