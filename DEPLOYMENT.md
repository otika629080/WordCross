# 開発環境と本番環境の設定切り替えガイド

## 概要

WordCross CMSは開発環境と本番環境で異なる設定を使用します。このドキュメントでは、環境固有の設定項目とその切り替え方法を説明します。

## 環境判定

現在の環境は `process.env.NODE_ENV` で判定されます：
- **開発環境**: `development` または未設定
- **本番環境**: `production`

## 設定項目一覧

### 1. 認証クッキー設定

**ファイル**: `app/lib/auth.ts`

```typescript
export function createAuthCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const secureFlag = isProduction ? 'Secure; ' : ''
  return `auth_token=${token}; HttpOnly; ${secureFlag}SameSite=Strict; Path=/; Max-Age=${JWT_EXPIRES_IN}`
}
```

- **開発環境**: `Secure`フラグなし（HTTP対応）
- **本番環境**: `Secure`フラグあり（HTTPS必須）

### 2. データベース接続

**ファイル**: `app/middleware/database.ts`

```typescript
export const databaseMiddleware = createMiddleware(async (c, next) => {
  const db = c.env?.DB
  
  if (!db) {
    // 開発環境：モックデータベース使用
    console.warn('D1 database binding not found. Using mock database for development.')
    const mockDb = createMockD1()
    const database = createDatabase(mockDb as any)
    c.set('database', database)
    c.set('db', database)
    await next()
    return
  }
  
  // 本番環境：実際のD1データベース使用
  const database = createDatabase(db)
  c.set('database', database)
  c.set('db', database)
  await next()
})
```

- **開発環境**: モックデータベース（事前設定された管理ユーザー含む）
- **本番環境**: Cloudflare D1データベース

### 3. JWT秘密鍵

**ファイル**: `app/lib/auth.ts`

```typescript
const JWT_SECRET = 'your-secret-key-here' // TODO: Move to environment variable
```

**要修正**: 本番環境では環境変数から読み込むように変更が必要

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'
```

### 4. 管理ユーザー認証情報

#### 開発環境（モックデータベース）
- **Email**: `admin@wordcross.local`
- **Password**: `admin123`
- **Password Hash**: `$2b$12$sq3pKjj4Fo1yHqCtLXxgwOe7C79wREidO.VxJRH6Exj69N1g39rHy`

#### 本番環境（D1データベース）
- マイグレーション実行後、`admin@wordcross.dev`で作成される
- 本番デプロイ前に適切な認証情報に変更が必要

## 環境切り替え手順

### 開発環境での起動

```bash
# 環境変数設定（オプション）
export NODE_ENV=development

# 開発サーバー起動
npm run dev
```

### 本番環境での設定

#### 1. 環境変数設定

**wrangler.jsonc** または **環境変数**:
```json
{
  "vars": {
    "NODE_ENV": "production",
    "JWT_SECRET": "your-production-secret-key"
  }
}
```

#### 2. D1データベース設定

```bash
# 本番用D1データベース作成
npx wrangler d1 create wordcross-cms

# wrangler.jsonc の database_id を更新
# マイグレーション実行
npx wrangler d1 migrations apply wordcross-cms --remote

# 管理ユーザーのパスワード変更
npx wrangler d1 execute wordcross-cms --remote --command="UPDATE admin_users SET password_hash = 'new-secure-hash' WHERE email = 'admin@wordcross.dev';"
```

#### 3. デプロイ

```bash
# ビルドとデプロイ
npm run build
npm run deploy
```

## セキュリティチェックリスト

### 本番デプロイ前に必須

- [ ] `JWT_SECRET`を強力なランダム文字列に変更
- [ ] 管理ユーザーのパスワードを強力なものに変更
- [ ] D1データベースのマイグレーション実行
- [ ] HTTPS設定の確認
- [ ] `NODE_ENV=production`の設定
- [ ] ログ出力レベルの調整

### 開発環境での注意事項

- モックデータベースは開発専用（本番では使用不可）
- HTTPでのテストはローカルのみ
- 認証情報は開発専用（`admin123`等）

## トラブルシューティング

### よくある問題

1. **ログインできない**
   - クッキーの`Secure`フラグ確認
   - データベース接続状態確認
   - 認証情報の確認

2. **Database connection error**
   - D1バインディング設定確認
   - マイグレーション実行状態確認

3. **Authentication required**
   - ミドルウェアの適用順序確認
   - JWTトークンの有効性確認

## 関連ファイル

- `app/lib/auth.ts` - 認証ロジック
- `app/middleware/auth.ts` - 認証ミドルウェア
- `app/middleware/database.ts` - データベースミドルウェア
- `wrangler.jsonc` - Cloudflare Workers設定
- `migrations/001-initial.sql` - データベーススキーマ