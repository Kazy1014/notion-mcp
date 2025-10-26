# 🚀 クイック公開ガイド - kazuyaoda版

このガイドでは、kazuyaodaさんがNotion MCP ServerをDocker Hubに公開する最速の手順を説明します。

## 📋 必要なもの

- [x] Docker Desktop（既にインストール済み✓）
- [ ] Docker Hubアカウント
- [ ] Docker Hubアクセストークン
- [ ] GitHubリポジトリ（オプション：自動公開用）

## 🎯 方法1: 手動公開（5分で完了）

### ステップ1: Docker Hubにログイン

```bash
docker login
# Username: kazuyaoda
# Password: （Docker Hubのパスワードまたはアクセストークン）
```

### ステップ2: ビルド＆プッシュ

```bash
cd /Users/kazy/Development/MCP/notion-mcp

# マルチプラットフォームビルド＆プッシュ（推奨）
./scripts/docker-build.sh --multi-platform --push --username kazuyaoda
```

**完了！** これで `kazuyaoda/notion-mcp:latest` がDocker Hubで公開されます。

### 確認

```bash
# Docker Hubで確認
open https://hub.docker.com/r/kazuyaoda/notion-mcp

# 誰でもプルできるかテスト
docker pull kazuyaoda/notion-mcp:latest
```

## 🤖 方法2: 自動公開（GitHub Actions）

### ステップ1: Docker Hubアクセストークンを取得

1. https://hub.docker.com/ にログイン
2. `Account Settings` → `Security` → `New Access Token`
3. トークン名: `github-actions`
4. 権限: `Read, Write, Delete`
5. トークンをコピー（後で使います）

### ステップ2: GitHub Secretsを設定

あなたのGitHubリポジトリで：

1. `Settings` → `Secrets and variables` → `Actions`
2. `New repository secret` をクリック
3. 以下の2つを追加：

```
Name: DOCKERHUB_USERNAME
Secret: kazuyaoda

Name: DOCKERHUB_TOKEN
Secret: （ステップ1でコピーしたトークン）
```

### ステップ3: コードをプッシュ

```bash
cd /Users/kazy/Development/MCP/notion-mcp

git add .
git commit -m "feat: configure for kazuyaoda Docker Hub"
git push origin main
```

### ステップ4: GitHub Actionsを確認

1. GitHubリポジトリの `Actions` タブを開く
2. ワークフローが実行されているのを確認
3. 完了したら Docker Hub で確認

**自動完了！** 以降、mainブランチにプッシュするたびに自動更新されます。

## 📱 使用方法（公開後）

### 自分で使う

```bash
export NOTION_API_KEY=your_notion_api_key
docker run -it kazuyaoda/notion-mcp:latest
```

### 他の人が使う

```bash
docker pull kazuyaoda/notion-mcp:latest
docker run -it -e NOTION_API_KEY=their_key kazuyaoda/notion-mcp:latest
```

### Cursor/Claudeで使う

`~/.cursor/mcp_settings.json` または `.cursor/mcp_settings.json` に追加：

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

## 🏷️ バージョン管理

新しいバージョンをリリース：

```bash
# バージョンタグを作成
git tag v1.0.0 -m "Initial release"
git push origin v1.0.0

# GitHub Actionsが自動的に以下をビルド：
# - kazuyaoda/notion-mcp:latest
# - kazuyaoda/notion-mcp:1.0.0
# - kazuyaoda/notion-mcp:1.0
# - kazuyaoda/notion-mcp:1
```

## 🔧 トラブルシューティング

### ビルドが失敗する

```bash
# キャッシュをクリア
docker builder prune -a

# 再度ビルド
./scripts/docker-build.sh --multi-platform --push --username kazuyaoda
```

### プッシュが失敗する

```bash
# 再ログイン
docker logout
docker login

# 権限を確認
docker push kazuyaoda/notion-mcp:latest
```

### GitHub Actionsが失敗する

1. Secretsが正しく設定されているか確認
2. `Actions` タブでエラーログを確認
3. 必要に応じてワークフローを再実行

## ✅ チェックリスト

公開前の最終確認：

- [ ] Docker Hubアカウントにログインできる
- [ ] ローカルでイメージがビルドできる（`docker build -t notion-mcp:latest .`）
- [ ] テストが全て通過する（`npm test`）
- [ ] README.mdに正しいユーザー名が記載されている（kazuyaoda）
- [ ] Docker Hubにプッシュできる
- [ ] プルして実行できる

公開後の確認：

- [ ] Docker Hubでイメージが見える
- [ ] 他のマシンからプルできる
- [ ] Cursor/Claudeで動作する
- [ ] ドキュメントが最新

## 📚 参考リンク

- **あなたのDocker Hub**: https://hub.docker.com/r/kazuyaoda/notion-mcp
- **詳細な公開ガイド**: [PUBLISH.md](./PUBLISH.md)
- **Docker使用ガイド**: [DOCKER.md](./DOCKER.md)
- **プロジェクトREADME**: [README.md](./README.md)

## 🎉 完了したら

おめでとうございます！あなたのNotion MCP Serverは：

✅ 世界中の開発者が使えるようになりました  
✅ Cursor/Claudeで簡単に統合できます  
✅ 自動更新システムが整っています  
✅ プロフェッショナルな品質を持っています

次は、コミュニティにシェアしましょう！

- Twitter/X でシェア
- Reddit で投稿
- GitHub Discussions で紹介
- ブログ記事を書く

あなたのプロジェクトが多くの人の役に立つことを願っています！🚀
