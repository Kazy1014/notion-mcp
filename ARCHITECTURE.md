# アーキテクチャドキュメント

## 概要

このプロジェクトは、ドメイン駆動設計（DDD）の原則に基づいて設計されています。コードベースは、明確な責任分離と高い保守性を実現するために、複数の層に分割されています。

## レイヤー構成

```
src/
├── domain/              # ドメイン層
│   ├── entities/        # エンティティ
│   ├── repositories/    # リポジトリインターフェース
│   ├── services/        # ドメインサービス
│   └── value-objects/   # 値オブジェクト
├── infrastructure/      # インフラストラクチャ層
│   ├── notion/          # Notion APIクライアント
│   └── repositories/    # リポジトリ実装
├── application/         # アプリケーション層
│   └── use-cases/       # ユースケース
├── presentation/        # プレゼンテーション層
│   └── mcp/             # MCPサーバー
└── shared/              # 共有コード
    └── DIContainer.ts   # 依存性注入コンテナ
```

## 各層の詳細

### 1. ドメイン層 (Domain Layer)

ビジネスロジックの中核を担う層です。外部システムに依存しない、純粋なビジネスルールを表現します。

#### エンティティ (Entities)

- **Page**: Notionのページを表現
- **Database**: Notionのデータベースを表現

エンティティは一意の識別子を持ち、ライフサイクル全体を通じて同一性を保ちます。

#### 値オブジェクト (Value Objects)

- **PageId**: ページの識別子
- **DatabaseId**: データベースの識別子

値オブジェクトは不変であり、等価性は値によって判断されます。

#### リポジトリインターフェース (Repository Interfaces)

- **IPageRepository**: ページの永続化インターフェース
- **IDatabaseRepository**: データベースの永続化インターフェース

ドメイン層は具体的な実装に依存せず、インターフェースのみに依存します。

#### ドメインサービス (Domain Services)

- **NotionService**: 複数のエンティティやリポジトリにまたがる複雑なビジネスロジック

### 2. インフラストラクチャ層 (Infrastructure Layer)

外部システムとの連携を担当する層です。

#### Notion APIクライアント

- **NotionClient**: Notion公式SDKのラッパー

#### リポジトリ実装

- **NotionPageRepository**: IPageRepositoryの実装
- **NotionDatabaseRepository**: IDatabaseRepositoryの実装

データの永続化と取得の具体的な実装を提供します。

### 3. アプリケーション層 (Application Layer)

ユースケースを実装する層です。ドメインロジックを組み合わせて、アプリケーション固有の処理フローを実現します。

#### ユースケース

- **CreatePageUseCase**: ページ作成
- **GetPageUseCase**: ページ取得
- **UpdatePageUseCase**: ページ更新
- **DeletePageUseCase**: ページ削除
- **QueryPagesUseCase**: ページクエリ
- **GetDatabaseUseCase**: データベース取得
- **ListDatabasesUseCase**: データベース一覧取得
- **UpdateDatabaseUseCase**: データベース更新

各ユースケースは単一の責任を持ち、テストが容易です。

### 4. プレゼンテーション層 (Presentation Layer)

外部からの入力を受け取り、適切な出力を返す層です。

#### MCPサーバー

- **MCPServer**: Model Context Protocolサーバーの実装

CursorやClaudeからのリクエストを処理し、ユースケースを呼び出します。

## 依存性の方向

```
Presentation Layer (MCP Server)
        ↓
Application Layer (Use Cases)
        ↓
Domain Layer (Entities, Value Objects, Domain Services)
        ↑
Infrastructure Layer (Repository Implementations, API Clients)
```

重要な原則：
- 依存性は常に外側から内側（ドメイン層）に向かう
- ドメイン層は他の層に依存しない
- インフラ層はドメイン層のインターフェースを実装する

## 依存性注入 (Dependency Injection)

`DIContainer`クラスがすべての依存関係を管理します：

```typescript
const container = DIContainer.getInstance();
container.initialize(apiKey);
const server = container.getMCPServer();
```

これにより：
- テストが容易（モックの注入が簡単）
- 疎結合の実現
- 設定の一元管理

## データフロー

1. **リクエスト受信**: MCPサーバーがCursor/Claudeからリクエストを受信
2. **ユースケース呼び出し**: 適切なユースケースが呼び出される
3. **ドメインロジック実行**: エンティティとドメインサービスがビジネスロジックを実行
4. **永続化**: リポジトリが外部システム（Notion API）と連携
5. **レスポンス返却**: 結果がMCP形式で返却される

## エラーハンドリング

各層でのエラーハンドリング：

- **ドメイン層**: ビジネスルール違反時にドメイン例外をスロー
- **アプリケーション層**: ユースケース固有の検証とエラー変換
- **インフラ層**: 外部システムのエラーを適切な形式に変換
- **プレゼンテーション層**: エラーをMCP形式で返却

## テスト戦略

### 単体テスト (Unit Tests)

- ドメイン層: エンティティ、値オブジェクト、ドメインサービス
- アプリケーション層: 各ユースケース（モックリポジトリを使用）

### 統合テスト (Integration Tests)

- インフラ層: 実際のNotion APIとの連携テスト
- プレゼンテーション層: MCPサーバーのエンドツーエンドテスト

### TDDアプローチ

1. テストを先に書く
2. 最小限の実装でテストを通す
3. リファクタリング

このサイクルを繰り返すことで、高品質なコードを維持します。

## 拡張性

新しい機能の追加方法：

### 1. 新しいエンティティの追加

```typescript
// 1. domain/entities/ に新しいエンティティを作成
export class Block { /* ... */ }

// 2. 対応する値オブジェクトを作成
export class BlockId { /* ... */ }

// 3. リポジトリインターフェースを定義
export interface IBlockRepository { /* ... */ }
```

### 2. 新しいユースケースの追加

```typescript
// application/use-cases/ に新しいユースケースを作成
export class CreateBlockUseCase {
  constructor(private blockRepository: IBlockRepository) {}
  async execute(input: CreateBlockInput): Promise<Block> { /* ... */ }
}
```

### 3. MCPツールの追加

```typescript
// presentation/mcp/MCPServer.ts にハンドラーを追加
private async handleCreateBlock(args: any) { /* ... */ }
```

## パフォーマンス最適化

- **ページネーション**: 大量データの効率的な取得
- **キャッシング**: 頻繁にアクセスされるデータのキャッシュ（将来的な拡張）
- **バッチ処理**: 複数操作の最適化（将来的な拡張）

## セキュリティ

- APIキーの安全な管理（環境変数）
- 入力値の検証（値オブジェクト）
- エラーメッセージでの機密情報の非開示

## 将来的な拡張

1. **キャッシング層の追加**: Redisなどを使用した高速化
2. **イベント駆動アーキテクチャ**: ドメインイベントの実装
3. **CQRS**: コマンドとクエリの分離
4. **マイクロサービス化**: 独立したサービスへの分割

## まとめ

このアーキテクチャは以下の利点を提供します：

- **保守性**: 明確な責任分離により、変更が容易
- **テスタビリティ**: 各層が独立してテスト可能
- **拡張性**: 新機能の追加が既存コードに影響しない
- **可読性**: ビジネスロジックがドメイン層に集約
- **柔軟性**: 外部システムの変更に強い

