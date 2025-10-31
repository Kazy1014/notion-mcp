# Notion MCP Server

[![Docker Image](https://img.shields.io/badge/docker-notion--mcp-blue.svg)](https://hub.docker.com/r/kazuyaoda/notion-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Notion API連携を行うMCP（Model Context Protocol）サーバー。CursorやClaudeと連携し、NotionのデータベースへのCRUD操作を可能にします。

<a href="https://glama.ai/mcp/servers/@Kazy1014/notion-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@Kazy1014/notion-mcp/badge" alt="Notion Server MCP server" />
</a>

## 特徴

- **DDD（ドメイン駆動設計）**: 保守性の高いアーキテクチャ
- **TDD（テスト駆動開発）**: 高品質なコード
- **TypeScript**: 型安全な実装
- **Notion API統合**: Notion APIの全般的な機能をサポート
- **Docker対応**: 環境構築不要で即座に利用可能

## 主な機能

### ページ（レコード）操作
- ✅ **ページ作成**: データベースに新しいレコードを追加
- ✅ **ページ取得**: 指定したIDのレコードを取得
- ✅ **ページ更新**: レコードの各項目（プロパティ）を個別または一括更新
  - テキスト、セレクト、マルチセレクト、日付、チェックボックス、数値、URL、メールアドレス、電話番号、ユーザー、関連ページなど、全てのプロパティタイプに対応
- ✅ **ページ削除**: レコードをアーカイブ（削除）
- ✅ **ページクエリ**: フィルター・ソート条件でレコードを検索

### データベース操作
- ✅ **データベース取得**: 指定したIDのデータベース情報を取得
- ✅ **データベース一覧**: アクセス可能なデータベースを一覧表示
- ✅ **データベース更新**: データベースのタイトルやスキーマを更新

### 高度な機能
- 🔄 **ページネーション**: 大量データの自動ページング処理
- 🔍 **フィルタリング**: 条件に基づく柔軟な検索
- 📊 **ソート**: 複数条件による並び替え
- 📈 **統計情報**: データベースの統計取得

## アーキテクチャ

```
src/
├── domain/          # ドメイン層（ビジネスロジック）
│   ├── entities/    # エンティティ
│   ├── repositories/ # リポジトリインターフェース
│   ├── services/    # ドメインサービス
│   └── value-objects/ # 値オブジェクト
├── infrastructure/  # インフラ層（外部システム連携）
│   ├── notion/      # Notion APIクライアント
│   └── repositories/ # リポジトリ実装
├── application/     # アプリケーション層（ユースケース）
│   └── use-cases/   # ビジネスユースケース
├── presentation/    # プレゼンテーション層（入出力）
│   └── mcp/         # MCPサーバー実装
└── shared/          # 共有コード
```

## クイックスタート（Docker使用）🐳

最も簡単な方法はDockerを使用することです：

```bash
# Docker Hubから取得
docker pull kazuyaoda/notion-mcp:latest

# 実行
docker run -it \
  -e NOTION_API_KEY=your_notion_api_key \
  kazuyaoda/notion-mcp:latest
```

または、スクリプトを使用：

```bash
export NOTION_API_KEY=your_notion_api_key
./scripts/docker-run.sh
```

詳細は [DOCKER.md](./DOCKER.md) を参照してください。

## ローカル開発セットアップ

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# テスト実行
npm test

# 開発モード
npm run dev
```

## 設定

環境変数 `NOTION_API_KEY` にNotion APIキーを設定してください。

```bash
export NOTION_API_KEY=your_notion_api_key
```

## Cursor/Claudeでの使用方法

### オプション1: Docker経由（推奨）

MCP設定ファイルに以下を追加：

```json
{
  "mcpServers": {
    "notion": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "NOTION_API_KEY=your_notion_api_key",
        "kazuyaoda/notion-mcp:latest"
      ]
    }
  }
}
```

### オプション2: ローカル実行

```json
{
  "mcpServers": {
    "notion": {
      "command": "node",
      "args": ["/path/to/notion-mcp/dist/index.js"],
      "env": {
        "NOTION_API_KEY": "your_notion_api_key"
      }
    }
  }
}
```

## 機能

- ✅ ページの作成、取得、更新、削除
- ✅ データベースの取得と更新
- ✅ 高度なクエリ（フィルター、ソート、ページネーション）
- ✅ 統計情報の取得
- ✅ エラーハンドリング

## ドキュメント

- [ARCHITECTURE.md](./ARCHITECTURE.md) - アーキテクチャの詳細
- [DOCKER.md](./DOCKER.md) - Docker使用ガイド
- [EXAMPLES.md](./EXAMPLES.md) - 使用例
- [INTEGRATION_TEST.md](./INTEGRATION_TEST.md) - 統合テストガイド
- [SECURITY.md](./SECURITY.md) - セキュリティガイド
- [QUICK_START.md](./QUICK_START.md) - クイック公開ガイド

## 開発

### テスト

```bash
# 全テスト実行
npm test

# カバレッジ付き
npm run test:coverage

# watch モード
npm run test:watch
```

### Dockerビルド

```bash
# 基本ビルド
docker build -t notion-mcp:latest .

# マルチプラットフォームビルド
./scripts/docker-build.sh --multi-platform

# ビルドしてDocker Hubにプッシュ
./scripts/docker-build.sh --push --username kazuyaoda
```

## ライセンス

MIT