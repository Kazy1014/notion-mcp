# Notionプロパティ更新ガイド

このガイドでは、Notion MCP Serverを使用してNotionデータベースのレコード（ページ）の各項目（プロパティ）を更新する方法を詳しく説明します。

## 概要

`update_page`ツールを使用すると、Notionページのあらゆるプロパティを更新できます。**個別のプロパティだけを更新することも、複数のプロパティを同時に更新することも可能です。**

## 基本的な使い方

### Cursor/Claudeでの自然言語での使用

最もシンプルな方法は、自然言語で指示することです：

```
"ページ（ID: abc123）のステータスを「完了」に変更して"
"タスク「週次レポート」の優先度を「高」、進捗を75%に更新して"
"プロジェクト「新システム開発」の終了日を来月末に変更して"
```

## サポートされるプロパティタイプ

### 1. Title（タイトル）

**用途**: ページのメインタイトル

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Name": {
      "title": [
        {
          "text": {
            "content": "新しいタイトル"
          }
        }
      ]
    }
  }
}
```

**使用例**:
```
"ページのタイトルを「2024年度予算計画」に変更して"
```

---

### 2. Rich Text（リッチテキスト）

**用途**: 説明文、ノート、コメントなど

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Description": {
      "rich_text": [
        {
          "text": {
            "content": "詳細な説明をここに記述します。"
          }
        }
      ]
    }
  }
}
```

**使用例**:
```
"タスクの説明を「クライアントとの打ち合わせ議事録を作成」に更新して"
```

---

### 3. Select（セレクト）

**用途**: ステータス、優先度、カテゴリなど（単一選択）

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Status": {
      "select": {
        "name": "進行中"
      }
    }
  }
}
```

**使用例**:
```
"タスクのステータスを「進行中」に変更して"
"優先度を「高」に設定して"
```

---

### 4. Multi-select（マルチセレクト）

**用途**: タグ、ラベル、複数カテゴリなど（複数選択）

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Tags": {
      "multi_select": [
        { "name": "重要" },
        { "name": "緊急" },
        { "name": "レビュー必要" }
      ]
    }
  }
}
```

**使用例**:
```
"タグに「重要」と「緊急」を追加して"
```

---

### 5. Date（日付）

**用途**: 期限、開始日、終了日など

**単一の日付**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Due Date": {
      "date": {
        "start": "2024-12-31"
      }
    }
  }
}
```

**期間（開始日〜終了日）**:
```json
{
  "pageId": "your-page-id",
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

**日時を含む場合**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Deadline": {
      "date": {
        "start": "2024-12-31T23:59:00+09:00"
      }
    }
  }
}
```

**使用例**:
```
"期限を今週金曜日に設定して"
"プロジェクト期間を来月1日から3月31日までに設定して"
```

---

### 6. Checkbox（チェックボックス）

**用途**: 完了フラグ、確認済み、有効/無効など

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Completed": {
      "checkbox": true
    }
  }
}
```

**使用例**:
```
"完了フラグをオンにして"
"確認済みチェックボックスにチェックを入れて"
```

---

### 7. Number（数値）

**用途**: 進捗率、金額、数量、評価など

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Progress": {
      "number": 75
    },
    "Budget": {
      "number": 5000000
    }
  }
}
```

**使用例**:
```
"進捗を80%に更新して"
"予算を500万円に設定して"
```

---

### 8. URL

**用途**: ウェブサイト、ドキュメントリンクなど

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Website": {
      "url": "https://example.com"
    }
  }
}
```

**使用例**:
```
"WebサイトURLをhttps://example.comに設定して"
```

---

### 9. Email（メールアドレス）

**用途**: 連絡先メールアドレス

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Email": {
      "email": "contact@example.com"
    }
  }
}
```

**使用例**:
```
"連絡先メールをcontact@example.comに設定して"
```

---

### 10. Phone Number（電話番号）

**用途**: 連絡先電話番号

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Phone": {
      "phone_number": "03-1234-5678"
    }
  }
}
```

**使用例**:
```
"電話番号を03-1234-5678に設定して"
```

---

### 11. People（ユーザー）

**用途**: 担当者、レビュアー、チームメンバーなど

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Assignee": {
      "people": [
        { "id": "user-id-12345" }
      ]
    }
  }
}
```

**複数ユーザー**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Team": {
      "people": [
        { "id": "user-id-12345" },
        { "id": "user-id-67890" }
      ]
    }
  }
}
```

**使用例**:
```
"担当者を山田さんに設定して"
"チームメンバーに佐藤さんと鈴木さんを追加して"
```

---

### 12. Relation（関連ページ）

**用途**: 他のデータベースページとのリレーション

**JSON形式**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Related Project": {
      "relation": [
        { "id": "related-page-id-123" }
      ]
    }
  }
}
```

**複数の関連ページ**:
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Related Tasks": {
      "relation": [
        { "id": "task-id-123" },
        { "id": "task-id-456" }
      ]
    }
  }
}
```

**使用例**:
```
"関連プロジェクトに「新システム開発」を設定して"
```

---

## 複数プロパティの同時更新

### 例1: タスクの包括的な更新

```
"タスク「API設計」のステータスを「進行中」、優先度を「高」、進捗を50%、期限を明日に更新して"
```

**内部的なJSON**:
```json
{
  "pageId": "task-id-123",
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
    },
    "Due Date": {
      "date": {
        "start": "2024-12-27"
      }
    }
  }
}
```

### 例2: プロジェクト情報の更新

```
"プロジェクト「顧客管理システム」のステータスを「実行中」、進捗を75%、終了予定日を来月末、担当者に田中さんを追加して"
```

**内部的なJSON**:
```json
{
  "pageId": "project-id-456",
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
    },
    "Team Members": {
      "people": [
        { "id": "user-tanaka-id" }
      ]
    }
  }
}
```

---

## 実践的なワークフロー例

### ワークフロー1: 朝のタスク確認と更新

```
1. "今日が期限のタスクを表示して"
2. "タスク「週次レポート」のステータスを「進行中」、進捗を30%に更新して"
3. "完了したタスクをすべて確認して"
4. "タスク「クライアント打ち合わせ」を完了に設定して"
```

### ワークフロー2: プロジェクト進捗報告

```
1. "プロジェクト「新システム開発」の情報を取得して"
2. "プロジェクトの進捗を80%に更新して"
3. "関連するタスクの完了率を確認して"
4. "プロジェクトにメモ「順調に進行中。次週デプロイ予定」を追加して"
```

### ワークフロー3: 週次レビュー

```
1. "今週完了したタスクをすべて表示して"
2. "完了したタスクをアーカイブして"
3. "来週のタスクに優先度を設定して"
4. "高優先度タスクの担当者を確認して"
```

---

## よくある質問

### Q1: プロパティ名がわからない場合は？

**A**: まずデータベース情報を取得してください：
```
"データベース（ID: db-id-123）の構造を表示して"
```

### Q2: 複数のプロパティを更新したいが、一部だけ変更したい場合は？

**A**: 変更したいプロパティだけを指定すればOKです。他のプロパティは変更されません。

### Q3: プロパティの値を空にしたい場合は？

**A**: プロパティタイプによって異なります：
- Text/Rich Text: 空の配列 `[]`
- Select: `null`
- Checkbox: `false`
- Number: `null`

```json
{
  "pageId": "your-page-id",
  "properties": {
    "Description": {
      "rich_text": []
    },
    "Status": {
      "select": null
    }
  }
}
```

### Q4: 日付を削除したい場合は？

**A**: `null`を設定します：
```json
{
  "pageId": "your-page-id",
  "properties": {
    "Due Date": {
      "date": null
    }
  }
}
```

### Q5: エラーが発生した場合は？

**A**: よくあるエラーと対処法：

1. **"Property not found"**: プロパティ名が正確か確認
2. **"Invalid property type"**: プロパティのタイプが正しいか確認
3. **"Invalid date format"**: ISO 8601形式（YYYY-MM-DD）を使用
4. **"Page not found"**: ページIDが正しいか確認

---

## まとめ

Notion MCP Serverの`update_page`機能により：

✅ **あらゆるプロパティタイプに対応**
✅ **個別または一括更新が可能**
✅ **自然言語で簡単に指示**
✅ **型安全で信頼性の高い更新**
✅ **エラーハンドリングが充実**

詳細な使用例は [EXAMPLES.md](./EXAMPLES.md) を参照してください。

