# 使用例

このドキュメントでは、Notion MCP Serverの具体的な使用例を紹介します。

## 基本的な使用方法

### 1. データベース一覧の取得

```typescript
// Cursor/Claudeでの使用例
"Notionのデータベース一覧を表示して"
```

期待される応答：
```json
[
  {
    "id": "abc123...",
    "title": "タスク管理",
    "createdTime": "2024-01-01T00:00:00Z",
    "archived": false
  },
  {
    "id": "def456...",
    "title": "プロジェクト",
    "createdTime": "2024-01-02T00:00:00Z",
    "archived": false
  }
]
```

### 2. 新しいページの作成

```typescript
// Cursor/Claudeでの使用例
"タスク管理データベース（ID: abc123）に「週次レポート作成」というタスクを追加して"
```

内部的には以下のようなリクエストが送信されます：
```json
{
  "databaseId": "abc123",
  "properties": {
    "Name": {
      "title": [
        {
          "text": {
            "content": "週次レポート作成"
          }
        }
      ]
    },
    "Status": {
      "select": {
        "name": "TODO"
      }
    }
  }
}
```

### 3. ページの更新

Notionページの各プロパティ（項目）を個別または同時に更新できます。

#### 基本的な更新

```typescript
// Cursor/Claudeでの使用例
"ページ（ID: xyz789）のステータスを「完了」に変更して"
```

#### 内部的なリクエスト形式

```json
{
  "pageId": "xyz789",
  "properties": {
    "Status": {
      "select": {
        "name": "完了"
      }
    }
  }
}
```

#### プロパティタイプ別の更新例

**1. テキスト（Title）の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Name": {
      "title": [
        {
          "text": {
            "content": "更新されたタイトル"
          }
        }
      ]
    }
  }
}
```

**2. リッチテキストの更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Description": {
      "rich_text": [
        {
          "text": {
            "content": "詳細な説明文"
          }
        }
      ]
    }
  }
}
```

**3. セレクト（Select）の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Status": {
      "select": {
        "name": "進行中"
      }
    }
  }
}
```

**4. マルチセレクト（Multi-select）の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Tags": {
      "multi_select": [
        { "name": "重要" },
        { "name": "緊急" }
      ]
    }
  }
}
```

**5. 日付（Date）の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Due Date": {
      "date": {
        "start": "2024-12-31"
      }
    }
  }
}
```

**6. 期間（Date Range）の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Period": {
      "date": {
        "start": "2024-01-01",
        "end": "2024-12-31"
      }
    }
  }
}
```

**7. チェックボックスの更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Completed": {
      "checkbox": true
    }
  }
}
```

**8. 数値（Number）の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Progress": {
      "number": 75
    }
  }
}
```

**9. URL の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Website": {
      "url": "https://example.com"
    }
  }
}
```

**10. メールアドレスの更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Email": {
      "email": "user@example.com"
    }
  }
}
```

**11. 電話番号の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Phone": {
      "phone_number": "03-1234-5678"
    }
  }
}
```

**12. ユーザー（People）の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Assignee": {
      "people": [
        { "id": "user-id-123" }
      ]
    }
  }
}
```

**13. 関連ページ（Relation）の更新**
```json
{
  "pageId": "xyz789",
  "properties": {
    "Related Project": {
      "relation": [
        { "id": "project-page-id-456" }
      ]
    }
  }
}
```

#### 複数プロパティの同時更新

```typescript
// Cursor/Claudeでの使用例
"タスク（ID: xyz789）のステータスを「進行中」、優先度を「高」、進捗を50%に更新して"
```

内部的には：
```json
{
  "pageId": "xyz789",
  "properties": {
    "Status": {
      "select": {
        "name": "進行中"
      }
    },
    "Priority": {
      "select": {
        "name": "高"
      }
    },
    "Progress": {
      "number": 50
    }
  }
}
```

### 4. ページのクエリ

```typescript
// Cursor/Claudeでの使用例
"タスク管理データベースから、ステータスが「進行中」のタスクを取得して"
```

## 実践的なユースケース

### ユースケース1: タスク管理システム

#### データベース構造

```
タスク管理データベース
- Name (Title)
- Status (Select: TODO, 進行中, 完了)
- Priority (Select: 高, 中, 低)
- Due Date (Date)
- Assignee (Person)
```

#### 操作例

1. **新しいタスクの追加**

```typescript
"高優先度のタスク「API設計レビュー」を追加して、担当者は山田さん、期限は来週金曜日"
```

2. **進行中のタスク一覧**

```typescript
"現在進行中のタスクを優先度順に表示して"
```

3. **タスクの完了**

```typescript
"タスク「API設計レビュー」を完了にして"
```

内部的には、ページIDを取得してステータスを更新：
```json
{
  "pageId": "取得したページID",
  "properties": {
    "Status": {
      "select": {
        "name": "完了"
      }
    }
  }
}
```

4. **タスクの詳細更新（複数項目同時）**

```typescript
"タスク「API設計レビュー」のステータスを「進行中」、進捗を80%、期限を明日に更新して"
```

内部的には：
```json
{
  "pageId": "取得したページID",
  "properties": {
    "Status": {
      "select": {
        "name": "進行中"
      }
    },
    "Progress": {
      "number": 80
    },
    "Due Date": {
      "date": {
        "start": "2024-12-27"
      }
    }
  }
}
```

5. **統計情報の取得**

```typescript
"タスクデータベースの統計情報を表示して（総数、完了数、未完了数）"
```

### ユースケース2: ナレッジベース管理

#### データベース構造

```
ナレッジベースデータベース
- Title (Title)
- Category (Select: 技術, プロセス, ドキュメント)
- Tags (Multi-select)
- Status (Select: 下書き, レビュー中, 公開)
- Author (Person)
- Published Date (Date)
```

#### 操作例

1. **新しい記事の作成**

```typescript
"技術カテゴリーで「TypeScriptのベストプラクティス」という記事を下書きとして作成して"
```

2. **カテゴリー別記事の検索**

```typescript
"技術カテゴリーで公開済みの記事を最新順に表示して"
```

3. **記事のステータス更新**

```typescript
"記事「TypeScriptのベストプラクティス」をレビュー中から公開に変更して"
```

### ユースケース3: プロジェクト管理

#### データベース構造

```
プロジェクトデータベース
- Project Name (Title)
- Status (Select: 計画中, 実行中, 完了, 保留)
- Start Date (Date)
- End Date (Date)
- Budget (Number)
- Team Members (Multi-person)
- Progress (Number: 0-100)
```

#### 操作例

1. **新しいプロジェクトの作成**

```typescript
"「顧客管理システム刷新」というプロジェクトを作成して、開始日は来月1日、予算は500万円"
```

2. **進行中のプロジェクト一覧**

```typescript
"現在実行中のプロジェクトを進捗率順に表示して"
```

3. **プロジェクトの進捗更新**

```typescript
"プロジェクト「顧客管理システム刷新」の進捗を60%に更新して"
```

内部的には：
```json
{
  "pageId": "取得したページID",
  "properties": {
    "Progress": {
      "number": 60
    }
  }
}
```

4. **プロジェクトの包括的な更新**

```typescript
"プロジェクト「顧客管理システム刷新」のステータスを「実行中」、進捗を75%、終了日を来月末に更新して"
```

内部的には：
```json
{
  "pageId": "取得したページID",
  "properties": {
    "Status": {
      "select": {
        "name": "実行中"
      }
    },
    "Progress": {
      "number": 75
    },
    "End Date": {
      "date": {
        "start": "2025-01-31"
      }
    }
  }
}
```

## 高度な使用例

### 複数データベースの連携

```typescript
// ユースケース: タスクとプロジェクトの連携
"プロジェクト「顧客管理システム刷新」に関連するタスクをすべて表示して"

// 実装イメージ：
// 1. プロジェクトを取得
// 2. プロジェクトIDに関連するタスクをクエリ
// 3. 結果を統合して表示
```

### バッチ操作

```typescript
// ユースケース: 複数タスクの一括更新
"完了したタスクをすべてアーカイブして"

// 実装イメージ：
// 1. ステータスが「完了」のタスクをクエリ
// 2. 各タスクをアーカイブ
// 3. 処理結果を報告
```

### データ集計と分析

```typescript
// ユースケース: プロジェクト統計
"各プロジェクトのタスク完了率を計算して"

// 実装イメージ：
// 1. すべてのプロジェクトを取得
// 2. 各プロジェクトのタスクをクエリ
// 3. 完了率を計算
// 4. レポートを生成
```

## エラーハンドリングの例

### 1. 存在しないページへのアクセス

```typescript
"ページ（ID: invalid123）を取得して"
// → エラー: "Page not found"
```

### 2. 無効なデータベースID

```typescript
"データベース（ID: invalid）にページを作成して"
// → エラー: "Invalid database ID format"
```

### 3. 権限エラー

```typescript
"アクセス権のないデータベースにページを作成しようとする"
// → エラー: "Failed to create page: insufficient permissions"
```

## パフォーマンス最適化の例

### ページネーション

大量のページを取得する場合：

```typescript
// 自動的にページネーションを処理
"タスクデータベースのすべてのページを取得して（1000件以上）"

// 内部的には複数回のAPIコールが自動的に実行され、
// すべての結果が統合されて返される
```

### フィルタリングとソート

```typescript
// 効率的なクエリ
"タスクデータベースから、優先度が「高」で期限が今週末までのタスクを、期限順に取得して"

// フィルターとソートをNotion API側で実行することで、
// ネットワーク転送量を削減
```

## デバッグとトラブルシューティング

### ログの確認

```bash
# 開発モードで詳細なログを出力
npm run dev
```

### テストデータの作成

```typescript
// テスト用のデータベースとページを作成
"テスト用に10個のサンプルタスクを作成して"
```

### データの整合性確認

```typescript
// データベースの統計情報を取得
"タスクデータベースの統計情報を表示して"

// 期待される応答：
{
  "database": {
    "id": "abc123",
    "title": "タスク管理"
  },
  "totalPages": 50,
  "archivedPages": 10,
  "activePages": 40
}
```

## まとめ

Notion MCP Serverを使用することで：

1. **自然言語での操作**: 複雑なAPI呼び出しを自然言語で実行
2. **効率的なデータ管理**: ページネーション、フィルタリング、ソートの自動処理
3. **エラーハンドリング**: 適切なエラーメッセージとリカバリー
4. **スケーラビリティ**: 大量データの効率的な処理

これらの機能により、Notionを使用したワークフローが大幅に改善されます。

