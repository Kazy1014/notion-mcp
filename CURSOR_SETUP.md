# Cursor MCP セットアップガイド

このガイドでは、CursorでNotion MCP Serverを設定・使用する方法を説明します。

## 🚀 クイックスタート

### ステップ1: Notion API キーの取得

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「New integration」をクリック
3. インテグレーション名を入力（例: "Cursor MCP"）
4. ワークスペースを選択
5. 「Submit」をクリック
6. **Internal Integration Token** をコピー（`secret_` で始まる文字列）

### ステップ2: データベースへのアクセス許可

1. Notionで使用したいデータベースを開く
2. 右上の「...」メニューをクリック
3. 「Connections」→「Connect to」
4. 作成したインテグレーションを選択

### ステップ3: Cursor MCP設定

#### オプション1: Docker使用（推奨）

Cursorの設定ファイル（`.cursor/mcp.json` または `~/.cursor/mcp.json`）に以下を追加：

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
        "NOTION_API_KEY=your_actual_notion_api_key_here",
        "kazuyaoda/notion-mcp:latest"
      ]
    }
  }
}
```

**重要**: `your_actual_notion_api_key_here` を実際のAPIキーに置き換えてください。

#### オプション2: ローカルビルド使用

```json
{
  "mcpServers": {
    "notion": {
      "command": "node",
      "args": [
        "/Users/kazy/Development/MCP/notion-mcp/dist/index.js"
      ],
      "env": {
        "NOTION_API_KEY": "your_actual_notion_api_key_here"
      }
    }
  }
}
```

**事前準備**:
```bash
cd /Users/kazy/Development/MCP/notion-mcp
npm install
npm run build
```

### ステップ4: Cursor再起動

設定を保存したら、**Cursorを完全に再起動**してください。

---

## 🔍 利用可能なツール

Notion MCP Serverは以下の8つのツールを提供します：

### 📄 ページ操作

1. **create_page** - 新しいページ（レコード）を作成
   ```
   "Create a new task 'Write report' in database XYZ"
   ```

2. **get_page** - ページの詳細情報を取得
   ```
   "Get details of page ABC123"
   ```

3. **update_page** ⭐ - ページのプロパティを更新
   ```
   "Update page ABC123: set status to 'Completed' and progress to 100%"
   "Change the due date to next Friday and add tag 'Important'"
   ```

4. **delete_page** - ページを削除（アーカイブ）
   ```
   "Archive completed task ABC123"
   ```

5. **query_pages** ⭐ - ページを検索・フィルター
   ```
   "Show all tasks with status 'In Progress' in database XYZ"
   "Find projects due this week, sorted by priority"
   ```

### 🗄️ データベース操作

6. **get_database** - データベースの詳細とスキーマを取得
   ```
   "Get the schema of database XYZ"
   "What properties does my Tasks database have?"
   ```

7. **list_databases** - アクセス可能なデータベースを一覧表示
   ```
   "Show all my Notion databases"
   "List available databases"
   ```

8. **update_database** - データベース設定を更新
   ```
   "Add a 'Priority' property to database XYZ"
   ```

---

## 🎯 実践例

### 例1: ジャーナルエントリの作成

```
"In my Journaling database (ID: abc-123), create a new entry for today:
- Title: 2024-12-26
- Date: 2024-12-26
- Emotion: Happy, Excited
- Notes: Made great progress on the project!"
```

### 例2: タスク管理

```
"In my Tasks database:
1. Find all tasks assigned to me with status 'TODO'
2. Update task XYZ: change status to 'In Progress' and set progress to 30%
3. Create a new task 'Review code' with high priority, due tomorrow"
```

### 例3: プロジェクト追跡

```
"For project ABC in Projects database:
- Get current status and progress
- Update progress to 75%
- Add note 'Phase 2 completed successfully'
- Set next review date to next Monday"
```

---

## 🐛 トラブルシューティング

### 問題1: Cursorが「ツールがない」と言う

**症状**: 
```
NotionのMCPツールにはデータベースの読み取りや更新機能がない
クエリ/ページ更新ツールの追加が必要
```

**原因**: MCPサーバーが最新版でない、またはCursorがツールリストをキャッシュしている

**解決方法**:
1. Cursorを**完全に再起動**（Command+Q で終了してから再起動）
2. Docker使用時: イメージを更新
   ```bash
   docker pull kazuyaoda/notion-mcp:latest
   ```
3. ローカルビルド使用時: 再ビルド
   ```bash
   cd /Users/kazy/Development/MCP/notion-mcp
   npm run build
   ```
4. MCP設定ファイルを確認・再保存

### 問題2: 「Notion API key is required」エラー

**原因**: APIキーが設定されていない、または間違っている

**解決方法**:
1. `.cursor/mcp.json` のAPIキーを確認
2. APIキーが `secret_` で始まることを確認
3. Notionの[インテグレーション設定](https://www.notion.so/my-integrations)で正しいキーをコピー

### 問題3: 「Database not found」エラー

**原因**: データベースIDが間違っている、またはインテグレーションにアクセス権限がない

**解決方法**:
1. まず利用可能なデータベースを確認:
   ```
   "List all my Notion databases"
   ```
2. データベースの「Connections」設定を確認
3. インテグレーションを接続

### 問題4: プロパティ更新が失敗する

**原因**: プロパティ名が間違っている、またはフォーマットが正しくない

**解決方法**:
1. まずデータベーススキーマを確認:
   ```
   "Get the schema of database XYZ"
   ```
2. プロパティ名を正確にコピー（大文字小文字を区別）
3. [PROPERTY_UPDATE_GUIDE.md](./PROPERTY_UPDATE_GUIDE.md) で正しいフォーマットを確認

### 問題5: Dockerコンテナが起動しない

**原因**: Dockerが起動していない、またはイメージがない

**解決方法**:
1. Dockerアプリケーションが起動しているか確認
2. イメージを手動でpull:
   ```bash
   docker pull kazuyaoda/notion-mcp:latest
   ```
3. 動作確認:
   ```bash
   docker run -it --rm \
     -e NOTION_API_KEY=your_key \
     kazuyaoda/notion-mcp:latest
   ```

---

## 📊 デバッグモード

より詳細なログを確認したい場合：

### Dockerの場合

```bash
# ログ出力を確認
docker run -it --rm \
  -e NOTION_API_KEY=your_key \
  kazuyaoda/notion-mcp:latest
```

### ローカルビルドの場合

```bash
# 開発モードで実行
cd /Users/kazy/Development/MCP/notion-mcp
npm run dev
```

標準エラー出力にログが表示されます。

---

## 🔄 MCPサーバーの更新

### Dockerイメージの更新

```bash
# 最新版を取得
docker pull kazuyaoda/notion-mcp:latest

# 古いイメージを削除（オプション）
docker image prune
```

Cursor再起動後、新しいバージョンが使用されます。

### ローカルビルドの更新

```bash
cd /Users/kazy/Development/MCP/notion-mcp
git pull origin main
npm install
npm run build
```

Cursor再起動後、新しいバージョンが使用されます。

---

## 💡 ヒントとベストプラクティス

### 1. データベースIDの取得

Notionでデータベースを開き、URLから取得：
```
https://notion.so/workspace/abc123def456?v=...
                          ^^^^^^^^^^^^
                          これがデータベースID
```

### 2. プロパティ名の確認

データベーススキーマを確認してから操作：
```
"Get the schema of my Tasks database"
```

### 3. 複数操作の実行

一度に複数のプロパティを更新可能：
```
"Update task ABC: 
- status to 'In Progress'
- progress to 50%
- due date to next Friday
- assignee to John"
```

### 4. エラーメッセージの活用

エラーメッセージには問題の詳細が含まれています。
Cursorに「エラーメッセージを詳しく見せて」と言うと、
問題の特定に役立ちます。

---

## 📚 関連ドキュメント

- [README.md](./README.md) - プロジェクト概要
- [PROPERTY_UPDATE_GUIDE.md](./PROPERTY_UPDATE_GUIDE.md) - プロパティ更新の完全ガイド
- [EXAMPLES.md](./EXAMPLES.md) - 実践的な使用例
- [DOCKER.md](./DOCKER.md) - Docker詳細ガイド

---

## ❓ よくある質問

### Q: 日本語でも使えますか？

A: はい、プロパティ値（タイトル、説明など）は日本語で指定できます。
```
"タスク「週次レポート作成」を「完了」に更新して"
```

### Q: どのプロパティタイプがサポートされていますか？

A: 以下を含む12種類以上をサポート：
- Title, Rich Text, Select, Multi-select
- Date, Checkbox, Number
- URL, Email, Phone Number
- People, Relation

詳細は [PROPERTY_UPDATE_GUIDE.md](./PROPERTY_UPDATE_GUIDE.md) を参照。

### Q: 一度に何件のページを更新できますか？

A: Notion APIの制限内であれば何件でも可能ですが、
大量更新の場合は`query_pages`で対象を絞ってから
順次更新することを推奨します。

### Q: プライベートページにアクセスできますか？

A: インテグレーションに接続されているページ・データベースのみアクセス可能です。
各ページ/データベースで明示的に接続設定が必要です。

---

## 🆘 サポート

問題が解決しない場合：

1. [GitHub Issues](https://github.com/kazuyaoda/notion-mcp/issues) で報告
2. [Notion API ドキュメント](https://developers.notion.com/)を参照
3. [MCP プロトコル仕様](https://modelcontextprotocol.io/)を確認

---

Happy Notioning with Cursor! 🎉

