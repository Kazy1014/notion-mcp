# Docker使用ガイド

このドキュメントでは、Notion MCP ServerをDockerで使用する方法を説明します。

## 前提条件

- Docker がインストールされていること
- Docker Compose がインストールされていること（オプション）
- Notion APIキーを取得済みであること

## クイックスタート

### 1. Docker Hubから取得して使用（推奨）

```bash
# イメージをpull
docker pull kazuyaoda/notion-mcp:latest

# 環境変数を設定して実行
docker run -it \
  -e NOTION_API_KEY=your_notion_api_key \
  kazuyaoda/notion-mcp:latest
```

### 2. ローカルでビルドして使用

```bash
# リポジトリをクローン
git clone https://github.com/kazuyaoda/notion-mcp.git
cd notion-mcp

# Dockerイメージをビルド
docker build -t notion-mcp:latest .

# 実行
docker run -it \
  -e NOTION_API_KEY=your_notion_api_key \
  notion-mcp:latest
```

## Docker Composeを使用した起動

### 1. 環境変数ファイルの作成

`.env` ファイルを作成：

```bash
NOTION_API_KEY=your_notion_api_key_here
```

### 2. Docker Composeで起動

```bash
# サービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# サービスを停止
docker-compose down
```

## Cursor/Claudeでの使用設定

### オプション1: Docker経由で直接実行

Cursorの設定ファイル（`~/.cursor/mcp_settings.json` または `.cursor/mcp_settings.json`）:

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

### オプション2: Docker Composeを使用

```json
{
  "mcpServers": {
    "notion": {
      "command": "docker-compose",
      "args": [
        "-f",
        "/path/to/notion-mcp/docker-compose.yml",
        "run",
        "--rm",
        "notion-mcp"
      ],
      "env": {
        "NOTION_API_KEY": "your_notion_api_key"
      }
    }
  }
}
```

### オプション3: スクリプトラッパーを使用

`notion-mcp.sh` を作成：

```bash
#!/bin/bash
docker run -i --rm \
  -e NOTION_API_KEY="${NOTION_API_KEY}" \
  kazuyaoda/notion-mcp:latest
```

実行権限を付与：

```bash
chmod +x notion-mcp.sh
```

Cursor設定：

```json
{
  "mcpServers": {
    "notion": {
      "command": "/path/to/notion-mcp.sh",
      "env": {
        "NOTION_API_KEY": "your_notion_api_key"
      }
    }
  }
}
```

## 高度な使用方法

### カスタムネットワークでの実行

```bash
# カスタムネットワークを作成
docker network create mcp-network

# ネットワークに接続して実行
docker run -it \
  --network mcp-network \
  -e NOTION_API_KEY=your_api_key \
  notion-mcp:latest
```

### ボリュームマウント（ログやキャッシュ用）

```bash
docker run -it \
  -v $(pwd)/data:/app/data \
  -e NOTION_API_KEY=your_api_key \
  notion-mcp:latest
```

### デバッグモード

```bash
# ビルド時にデバッグ情報を含める
docker build --build-arg NODE_ENV=development -t notion-mcp:debug .

# デバッグモードで実行
docker run -it \
  -e NOTION_API_KEY=your_api_key \
  -e NODE_ENV=development \
  notion-mcp:debug
```

## イメージのビルドとプッシュ

### ローカルでビルド

```bash
# 基本的なビルド
docker build -t notion-mcp:latest .

# タグ付きビルド
docker build -t notion-mcp:1.0.0 -t notion-mcp:latest .

# マルチプラットフォームビルド（Apple Silicon対応）
docker buildx build --platform linux/amd64,linux/arm64 -t notion-mcp:latest .
```

### Docker Hubにプッシュ

```bash
# Docker Hubにログイン
docker login

# タグ付け
docker tag notion-mcp:latest kazuyaoda/notion-mcp:latest
docker tag notion-mcp:latest kazuyaoda/notion-mcp:1.0.0

# プッシュ
docker push kazuyaoda/notion-mcp:latest
docker push kazuyaoda/notion-mcp:1.0.0
```

## トラブルシューティング

### イメージのサイズが大きい

マルチステージビルドを使用しているため、本番イメージは最適化されています：

```bash
# イメージサイズを確認
docker images notion-mcp

# 不要なイメージを削除
docker image prune -a
```

### コンテナが起動しない

```bash
# ログを確認
docker logs notion-mcp-server

# コンテナ内でシェルを実行
docker run -it --entrypoint /bin/sh notion-mcp:latest

# 環境変数を確認
docker run -it --rm notion-mcp:latest env
```

### APIキーが認識されない

環境変数が正しく設定されているか確認：

```bash
# 環境変数をテスト
docker run -it --rm \
  -e NOTION_API_KEY=test_key \
  notion-mcp:latest \
  node -e "console.log('API Key:', process.env.NOTION_API_KEY)"
```

### ビルドが失敗する

```bash
# キャッシュなしで再ビルド
docker build --no-cache -t notion-mcp:latest .

# ビルドログを詳細表示
docker build --progress=plain -t notion-mcp:latest .
```

## セキュリティのベストプラクティス

### 1. APIキーの管理

環境変数やシークレット管理ツールを使用：

```bash
# Docker Secretsを使用（Docker Swarm）
echo "your_api_key" | docker secret create notion_api_key -

docker service create \
  --name notion-mcp \
  --secret notion_api_key \
  notion-mcp:latest
```

### 2. 非rootユーザーでの実行

Dockerfileでは既に非rootユーザー（`notion`）で実行するように設定されています。

### 3. 読み取り専用ファイルシステム

```bash
docker run -it --read-only \
  -e NOTION_API_KEY=your_api_key \
  notion-mcp:latest
```

## パフォーマンス最適化

### イメージサイズの最小化

- Alpine Linuxをベースイメージとして使用
- マルチステージビルドで本番用ファイルのみを含める
- `.dockerignore`で不要なファイルを除外

### ビルドキャッシュの活用

```bash
# BuildKitを有効化（Docker 23.0+）
export DOCKER_BUILDKIT=1
docker build -t notion-mcp:latest .
```

## CI/CD統合

### GitHub Actions例

`.github/workflows/docker-publish.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            kazuyaoda/notion-mcp:latest
            kazuyaoda/notion-mcp:${{ github.ref_name }}
```

## まとめ

Docker化により以下の利点があります：

✅ **環境の一貫性**: どの環境でも同じように動作  
✅ **簡単なデプロイ**: 1コマンドで起動可能  
✅ **依存関係の管理**: 全ての依存関係がコンテナに含まれる  
✅ **セキュリティ**: 隔離された環境で実行  
✅ **スケーラビリティ**: 複数インスタンスの起動が容易  

ご質問やサポートが必要な場合は、GitHubのIssuesまでお願いします。

