# Docker Hub公開ガイド

このドキュメントでは、Notion MCP ServerをDocker Hubに公開する手順を説明します。

## 前提条件

1. Docker Hubアカウントを持っていること
2. リポジトリの管理者権限があること
3. GitHub SecretsにDocker Hub認証情報を設定していること

## 手動公開

### 1. Docker Hubにログイン

```bash
docker login
```

ユーザー名とパスワード（またはアクセストークン）を入力します。

### 2. イメージをビルド

```bash
# 単一プラットフォーム
docker build -t kazuyaoda/notion-mcp:latest .

# マルチプラットフォーム（推奨）
docker buildx create --use --name multiarch-builder
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t kazuyaoda/notion-mcp:latest \
  -t kazuyaoda/notion-mcp:1.0.0 \
  --push \
  .
```

### 3. イメージをプッシュ

単一プラットフォームの場合：

```bash
docker push kazuyaoda/notion-mcp:latest
docker push kazuyaoda/notion-mcp:1.0.0
```

### 4. 便利スクリプトの使用

```bash
# ビルドのみ
./scripts/docker-build.sh

# ビルド＆プッシュ
./scripts/docker-build.sh --push --username kazuyaoda

# マルチプラットフォームビルド＆プッシュ
./scripts/docker-build.sh --multi-platform --push --username kazuyaoda
```

## 自動公開（GitHub Actions）

### 1. GitHub Secretsの設定

GitHubリポジトリの `Settings > Secrets and variables > Actions` で以下を設定：

- `DOCKERHUB_USERNAME`: Docker Hubのユーザー名
- `DOCKERHUB_TOKEN`: Docker Hubのアクセストークン

#### Docker Hubアクセストークンの取得方法

1. [Docker Hub](https://hub.docker.com/)にログイン
2. `Account Settings` > `Security` > `New Access Token`
3. トークン名を入力（例：`github-actions`）
4. 権限を選択（`Read, Write, Delete`）
5. トークンをコピーしてGitHub Secretsに保存

### 2. ワークフローのトリガー

#### mainブランチへのプッシュ

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

自動的に以下のタグでビルド＆プッシュされます：
- `latest`
- `main`

#### バージョンタグのプッシュ

```bash
# タグを作成
git tag v1.0.0
git push origin v1.0.0
```

自動的に以下のタグでビルド＆プッシュされます：
- `latest`
- `1.0.0`
- `1.0`
- `1`

### 3. ワークフローの確認

GitHub リポジトリの `Actions` タブでビルド状況を確認できます。

## バージョニング戦略

セマンティックバージョニング（Semantic Versioning）を採用：

- **MAJOR (v1.0.0)**: 破壊的変更
- **MINOR (v1.1.0)**: 後方互換性のある機能追加
- **PATCH (v1.1.1)**: 後方互換性のあるバグ修正

### タグ例

```bash
# パッチバージョン
git tag v1.0.1 -m "Fix: bug in page creation"
git push origin v1.0.1

# マイナーバージョン
git tag v1.1.0 -m "Feature: add block support"
git push origin v1.1.0

# メジャーバージョン
git tag v2.0.0 -m "Breaking: new API structure"
git push origin v2.0.0
```

## Docker Hubリポジトリの設定

### 1. リポジトリの作成

1. [Docker Hub](https://hub.docker.com/)にログイン
2. `Create Repository` をクリック
3. 以下を入力：
   - **Name**: `notion-mcp`
   - **Description**: `Notion MCP Server for Cursor and Claude integration`
   - **Visibility**: `Public` または `Private`

### 2. README の設定

Docker HubのREADMEは、GitHub Actionsワークフローで自動更新されます（`DOCKER.md`の内容）。

手動で更新する場合：

1. Docker Hubのリポジトリページに移動
2. `Description` タブをクリック
3. `DOCKER.md` の内容を貼り付け

### 3. Automated Buildsの設定（オプション）

GitHub Actionsを使用しているため、通常は不要ですが、Docker Hub側でも自動ビルドを設定できます。

## マルチアーキテクチャ対応

### サポートするプラットフォーム

- `linux/amd64` - Intel/AMD 64ビット
- `linux/arm64` - Apple Silicon (M1/M2)、ARM 64ビット

### プラットフォーム固有のビルド

特定のプラットフォームのみビルドする場合：

```bash
# AMD64のみ
docker buildx build --platform linux/amd64 -t notion-mcp:amd64 .

# ARM64のみ
docker buildx build --platform linux/arm64 -t notion-mcp:arm64 .
```

## セキュリティ

### 脆弱性スキャン

```bash
# Docker Scoutでスキャン
docker scout cves notion-mcp:latest

# Trivyでスキャン
trivy image notion-mcp:latest
```

### イメージの署名

```bash
# Docker Content Trustを有効化
export DOCKER_CONTENT_TRUST=1

# プッシュ時に自動的に署名される
docker push kazuyaoda/notion-mcp:latest
```

## トラブルシューティング

### ビルドが失敗する

```bash
# キャッシュをクリア
docker builder prune -a

# 再ビルド
docker build --no-cache -t notion-mcp:latest .
```

### プッシュが失敗する

```bash
# 認証情報を確認
docker login

# レジストリのステータスを確認
# https://status.docker.com/

# タグを確認
docker images notion-mcp
```

### マルチプラットフォームビルドが失敗する

```bash
# QEMUを再インストール
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

# Buildxビルダーを再作成
docker buildx rm multiarch-builder
docker buildx create --use --name multiarch-builder
docker buildx inspect --bootstrap
```

## モニタリングと分析

### Docker Hub Analytics

Docker Hubダッシュボードで以下を確認できます：

- プル数
- スター数
- プラットフォーム別の使用状況

### カスタム分析

```bash
# イメージのプル統計を取得（Docker Hub API）
curl -s "https://hub.docker.com/v2/repositories/kazuyaoda/notion-mcp/" | jq '.pull_count'
```

## ベストプラクティス

1. **タグ戦略**: `latest` + バージョンタグを使用
2. **マルチアーキテクチャ**: 複数プラットフォームをサポート
3. **自動化**: GitHub Actionsで自動ビルド＆プッシュ
4. **セキュリティ**: 定期的な脆弱性スキャン
5. **ドキュメント**: Docker Hubの説明を最新に保つ
6. **サイズ最適化**: マルチステージビルドを使用
7. **キャッシュ**: GitHub Actionsのキャッシュを活用

## 公開チェックリスト

リリース前に以下を確認してください：

- [ ] すべてのテストが通過
- [ ] ビルドが成功
- [ ] ドキュメントが最新
- [ ] バージョン番号が正しい
- [ ] CHANGELOGが更新されている
- [ ] セキュリティスキャンが完了
- [ ] マルチプラットフォーム対応
- [ ] Docker Hubの説明が更新されている
- [ ] GitHubのリリースノートが作成されている

## サポート

問題が発生した場合は、以下をご利用ください：

- **Issues**: GitHubのIssuesで報告
- **Discussions**: GitHubのDiscussionsで質問
- **Docker Hub**: フィードバックをコメント

## 関連リソース

- [Docker Hub公式ドキュメント](https://docs.docker.com/docker-hub/)
- [GitHub Actions ドキュメント](https://docs.github.com/actions)
- [Docker Buildx ドキュメント](https://docs.docker.com/buildx/working-with-buildx/)

