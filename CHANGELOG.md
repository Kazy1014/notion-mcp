# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-26

### Added

- 初回リリース
- DDD（ドメイン駆動設計）アーキテクチャの実装
- TDD（テスト駆動開発）による高品質なコードベース
- Notion APIとの完全統合
- MCPサーバーの実装（Cursor/Claude対応）
- ページCRUD操作の完全サポート
- データベース管理機能
- 高度なクエリ機能（フィルター、ソート、ページネーション）
- Docker対応（マルチアーキテクチャサポート）
- 包括的なテストスイート（48テスト、ドメイン層100%カバレッジ）
- 詳細なドキュメント
  - README.md - 基本的な使用方法
  - ARCHITECTURE.md - アーキテクチャ詳細
  - DOCKER.md - Docker使用ガイド
  - EXAMPLES.md - 実践的な使用例
  - INTEGRATION_TEST.md - 統合テストガイド
  - PUBLISH.md - Docker Hub公開ガイド

### Features

#### Domain Layer
- `Page` エンティティ（ページの作成、更新、アーカイブ）
- `Database` エンティティ（データベースの管理）
- `PageId` と `DatabaseId` 値オブジェクト
- `NotionService` ドメインサービス

#### Infrastructure Layer
- Notion APIクライアント実装
- ページリポジトリ実装
- データベースリポジトリ実装

#### Application Layer
- CreatePageUseCase - ページ作成
- GetPageUseCase - ページ取得
- UpdatePageUseCase - ページ更新
- DeletePageUseCase - ページ削除
- QueryPagesUseCase - ページクエリ
- GetDatabaseUseCase - データベース取得
- ListDatabasesUseCase - データベース一覧
- UpdateDatabaseUseCase - データベース更新

#### Presentation Layer
- MCPサーバー実装
- 8つのMCPツール
- エラーハンドリング
- 型安全なAPI

### Docker

- マルチステージビルドによる最適化（228MB）
- マルチアーキテクチャサポート（amd64、arm64）
- Docker Composeサポート
- 便利なスクリプト（docker-run.sh、docker-build.sh）
- GitHub Actions自動ビルド＆公開

### Documentation

- 5つの詳細なドキュメント
- 実践的な使用例
- トラブルシューティングガイド
- 統合テストガイド

## [Unreleased]

### Planned

- [ ] キャッシング機能の追加
- [ ] ブロック操作のサポート
- [ ] コメント機能
- [ ] ページ関係性の管理
- [ ] バッチ操作の最適化
- [ ] WebSocketサポート
- [ ] メトリクス＆モニタリング
- [ ] CLI ツールの追加

---

[1.0.0]: https://github.com/kazuyaoda/notion-mcp/releases/tag/v1.0.0

