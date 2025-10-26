# GitHub Actions セットアップガイド

このガイドでは、GitHub ActionsでDocker Hubへの自動デプロイを設定する手順を説明します。

## 🎯 目的

mainブランチへのプッシュ時に、自動的に以下を実行：

1. ✅ テスト実行
2. ✅ TypeScriptビルド
3. ✅ Dockerイメージビルド（マルチプラットフォーム）
4. ✅ Docker Hubへプッシュ
5. ✅ Docker Hub説明の更新

## ⚠️ 必須: GitHub Secretsの設定

### ステップ1: Docker Hubアクセストークンを生成

1. **Docker Hubにログイン**: https://hub.docker.com/
2. **Account Settings** → **Security** タブ
3. **New Access Token** をクリック
4. 設定：
   - Description: `GitHub Actions`
   - Permissions: **Read, Write, Delete**
5. **Generate** をクリック
6. ⚠️ **トークンをコピー**（再表示されません！）

### ステップ2: GitHubにSecretsを追加

#### 方法1: Web UI（推奨）

1. GitHubリポジトリに移動: `https://github.com/kazuyaoda/notion-mcp`
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** をクリック

**追加するSecrets:**

| Name | Value | 説明 |
|------|-------|------|
| `DOCKERHUB_USERNAME` | `kazuyaoda` | Docker Hubユーザー名 |
| `DOCKERHUB_TOKEN` | `dckr_pat_xxx...` | 生成したアクセストークン |

#### 方法2: GitHub CLI

```bash
# GitHub CLIでSecretsを追加
gh secret set DOCKERHUB_USERNAME --body "kazuyaoda"
gh secret set DOCKERHUB_TOKEN --body "your-token-here"
```

### 設定確認

**Settings** → **Secrets and variables** → **Actions** で以下が表示されるはず：

- ✅ `DOCKERHUB_USERNAME`
- ✅ `DOCKERHUB_TOKEN`

## 🚀 使用方法

### 自動デプロイのトリガー

```bash
# mainブランチにプッシュ
git add .
git commit -m "Update tests to fix GitHub Actions"
git push origin main
```

### 手動で再実行

1. **Actions** タブに移動
2. 失敗したワークフローをクリック
3. **Re-run jobs** → **Re-run all jobs**

## 📊 ワークフローの確認

### 成功時の流れ

```
✅ Run Tests
   ↓
✅ Build TypeScript
   ↓
✅ Build and Push Docker Image
   ├── Set up QEMU
   ├── Set up Docker Buildx
   ├── Log in to Docker Hub
   ├── Extract metadata
   ├── Build and push (linux/amd64, linux/arm64)
   └── Update Docker Hub description
```

### 生成されるDockerタグ

- `kazuyaoda/notion-mcp:latest` (mainブランチ)
- `kazuyaoda/notion-mcp:main` (mainブランチ)
- `kazuyaoda/notion-mcp:1.0.0` (v1.0.0タグをプッシュ時)
- `kazuyaoda/notion-mcp:1.0` (v1.0.0タグをプッシュ時)
- `kazuyaoda/notion-mcp:1` (v1.0.0タグをプッシュ時)

## 🐛 トラブルシューティング

### エラー: "Username and password required"

**原因**: GitHub Secretsが設定されていない

**解決方法**:
1. Docker Hubでアクセストークンを生成
2. GitHubに`DOCKERHUB_USERNAME`と`DOCKERHUB_TOKEN`を設定

### エラー: "denied: requested access to the resource is denied"

**原因**: トークンの権限が不足、またはユーザー名が間違っている

**解決方法**:
1. `DOCKERHUB_USERNAME`が`kazuyaoda`であることを確認
2. トークンに**Read, Write, Delete**権限があることを確認

### エラー: Test failures

**原因**: テストが失敗している

**解決方法**:
```bash
# ローカルでテストを実行して確認
npm test
npm run build
```

### ワークフローが実行されない

**確認事項**:
- `.github/workflows/docker-publish.yml`が存在するか
- mainブランチにプッシュしているか
- Actions機能が有効になっているか（Settings → Actions）

## 🔒 セキュリティのベストプラクティス

### ✅ 推奨

- パスワードではなくアクセストークンを使用
- トークンに必要最小限の権限を付与
- 定期的にトークンをローテーション（3-6ヶ月）
- GitHub Secretsで安全に管理

### ❌ 避けるべき

- トークンをコードにコミット
- トークンをログに出力
- トークンを環境変数として公開
- 過度に広い権限を付与

## 📚 参考リンク

### 公式ドキュメント

- [Docker Hub - Manage access tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [GitHub - Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions - docker/login-action](https://github.com/docker/login-action)
- [GitHub Actions - docker/build-push-action](https://github.com/docker/build-push-action)

### プロジェクト内ドキュメント

- [PUBLISH.md](./PUBLISH.md) - 詳細な公開ガイド
- [DOCKER.md](./DOCKER.md) - Docker使用方法
- [SECURITY.md](./SECURITY.md) - セキュリティガイド

## 📝 ワークフローファイル

現在のワークフロー設定: `.github/workflows/docker-publish.yml`

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: ['v*.*.*']

env:
  DOCKER_IMAGE_NAME: notion-mcp

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          platforms: linux/amd64,linux/arm64
          push: true
```

## ✅ チェックリスト

設定完了前の確認：

- [ ] Docker Hubアカウントを作成した
- [ ] Docker Hubでアクセストークンを生成した
- [ ] GitHub Secretsに`DOCKERHUB_USERNAME`を追加した
- [ ] GitHub Secretsに`DOCKERHUB_TOKEN`を追加した
- [ ] Secrets設定を確認した
- [ ] `.github/workflows/docker-publish.yml`が存在する
- [ ] ローカルでテストが通ることを確認した
- [ ] mainブランチにプッシュした

すべて完了したら、GitHub Actionsが自動的にDockerイメージをビルド・公開します！🚀

