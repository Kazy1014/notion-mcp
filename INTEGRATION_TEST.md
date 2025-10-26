# 統合テストガイド

このドキュメントでは、実際のNotion APIを使用した統合テストの実行方法を説明します。

## 前提条件

1. Notionアカウントを持っていること
2. Notion APIキーを取得済みであること
3. テスト用のNotionデータベースを作成済みであること

## Notion APIキーの取得

1. [Notion Developers](https://www.notion.so/my-integrations)にアクセス
2. 「新しいインテグレーション」を作成
3. APIキーをコピー
4. テスト用データベースにインテグレーションを接続

## 環境設定

```bash
export NOTION_API_KEY=your_notion_api_key_here
export TEST_DATABASE_ID=your_test_database_id_here
```

## 統合テストの実行

### 1. サーバーの起動テスト

```bash
npm run dev
```

サーバーが正常に起動することを確認します。

### 2. 手動統合テスト

以下のコマンドで、MCP経由でNotionにアクセスできることを確認します：

#### データベース一覧の取得

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js
```

#### ページの作成

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_page",
    "arguments": {
      "databaseId": "'$TEST_DATABASE_ID'",
      "properties": {
        "Name": {
          "title": [
            {
              "text": {
                "content": "テストページ"
              }
            }
          ]
        }
      }
    }
  }
}' | NOTION_API_KEY=$NOTION_API_KEY node dist/index.js
```

#### ページの取得

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_page",
    "arguments": {
      "pageId": "your_page_id_here"
    }
  }
}' | NOTION_API_KEY=$NOTION_API_KEY node dist/index.js
```

## Cursor/Claudeでの使用テスト

### 1. MCP設定ファイルの作成

Cursorの設定ファイル（`.cursor/mcp_settings.json`）に以下を追加：

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

### 2. 動作確認

Cursor/Claudeで以下のようなプロンプトを試してください：

- "Notionのデータベース一覧を表示して"
- "Notionに新しいページを作成して"
- "特定のページの情報を取得して"

## トラブルシューティング

### APIキーのエラー

```
Error: NOTION_API_KEY environment variable is required
```

→ 環境変数が正しく設定されているか確認してください。

### データベースが見つからない

```
Error: Database not found
```

→ データベースIDが正しいか、インテグレーションがデータベースにアクセス権を持っているか確認してください。

### 認証エラー

```
Error: Failed to validate API key
```

→ APIキーが有効か確認してください。Notionの設定でインテグレーションが有効になっているか確認してください。

## 実際のユースケーステスト

### シナリオ1: タスク管理

1. タスク管理用データベースを作成
2. 新しいタスクページを追加
3. タスクのステータスを更新
4. 完了したタスクをアーカイブ

### シナリオ2: ナレッジベース

1. ナレッジベース用データベースを作成
2. 記事ページを複数作成
3. カテゴリーでフィルタリング
4. 統計情報を取得

### シナリオ3: プロジェクト管理

1. プロジェクト管理用データベースを作成
2. プロジェクトページを作成
3. サブタスクを追加
4. プロジェクトの進捗状況を追跡

## パフォーマンステスト

大量のページを持つデータベースでのクエリパフォーマンスをテスト：

```bash
# 100ページのクエリ
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "query_pages",
    "arguments": {
      "databaseId": "'$TEST_DATABASE_ID'",
      "pageSize": 100
    }
  }
}' | NOTION_API_KEY=$NOTION_API_KEY node dist/index.js
```

## セキュリティテスト

1. 無効なAPIキーでのアクセス試行
2. 権限のないデータベースへのアクセス試行
3. 不正なページIDでのアクセス試行

すべてのケースで適切なエラーハンドリングが行われることを確認してください。

