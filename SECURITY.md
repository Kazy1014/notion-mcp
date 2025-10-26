# セキュリティガイド

このドキュメントでは、Notion MCP Serverのセキュリティに関するベストプラクティスと、セキュリティ問題の報告方法について説明します。

## 🔒 セキュリティ原則

### 1. 認証情報の管理

#### ✅ 推奨される方法

**環境変数を使用**
```bash
export NOTION_API_KEY=your_notion_api_key
```

**Dockerで実行時**
```bash
docker run -it -e NOTION_API_KEY=your_key kazuyaoda/notion-mcp:latest
```

**GitHub Actions Secretsを使用**
```yaml
env:
  NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
```

#### ❌ 避けるべき方法

- コード内にAPIキーをハードコード
- `.env`ファイルをGitにコミット
- ログにAPIキーを出力
- URLパラメータでAPIキーを渡す

### 2. .gitignoreの設定

以下のファイルは**絶対に**Gitにコミットしないでください：

```
.env
.env.local
.env.*.local
*.key
*.pem
*.cert
secrets/
```

現在の`.gitignore`は適切に設定されています。

### 3. Docker使用時のセキュリティ

#### ベストプラクティス

1. **非rootユーザーで実行**（既に実装済み✓）
   ```dockerfile
   USER notion
   ```

2. **環境変数で機密情報を渡す**
   ```bash
   docker run -e NOTION_API_KEY="${NOTION_API_KEY}" ...
   ```

3. **Docker Secretsを使用（本番環境）**
   ```bash
   echo "your_api_key" | docker secret create notion_api_key -
   ```

4. **イメージに機密情報を含めない**
   - `.dockerignore`が適切に設定されている✓

### 4. GitHub Actionsのセキュリティ

#### Secretsの保護

1. **リポジトリSecretsを使用**
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
   - `NOTION_API_KEY`（テスト用）

2. **Secretsをログに出力しない**
   ```yaml
   # ❌ 避ける
   - run: echo ${{ secrets.NOTION_API_KEY }}
   
   # ✅ 推奨
   - run: echo "API key is set"
     env:
       NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
   ```

3. **PRからSecretsにアクセスさせない**
   ```yaml
   if: github.event_name != 'pull_request'
   ```

### 5. コードレビューチェックリスト

プルリクエストやコミット前に確認：

- [ ] APIキーやトークンがハードコードされていない
- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] パスワードやシークレットがコメントに含まれていない
- [ ] ログ出力に機密情報が含まれていない
- [ ] テストコードに実際のAPIキーが使用されていない

## 🔍 セキュリティ監査

### 定期的なチェック

```bash
# 1. Git履歴から機密情報を検索
git log -p | grep -i "api.*key\|secret\|password"

# 2. 現在のファイルから機密情報を検索
grep -r "secret_\|nint_\|sk-" --exclude-dir=node_modules .

# 3. .envファイルがGitに含まれていないか確認
git ls-files | grep -i "\.env"

# 4. コミットされたファイルを確認
git ls-files
```

### 自動セキュリティスキャン

#### Git Hooksの設定（オプション）

`.git/hooks/pre-commit`:
```bash
#!/bin/bash
# 機密情報のチェック
if git diff --cached | grep -i "NOTION_API_KEY=secret_\|password=\|token="; then
    echo "Error: Potential secret detected in commit!"
    exit 1
fi
```

#### GitHub Secretスキャニング

GitHubのSecret Scanningは自動的に有効化されています。
検出されたシークレットは即座に通知されます。

## 🚨 セキュリティ脆弱性の報告

### 脆弱性を発見した場合

**公開のIssueを作成しないでください！**

代わりに、以下の方法で報告してください：

1. **GitHubのSecurity Advisory**
   - リポジトリの`Security`タブ
   - `Report a vulnerability`をクリック

2. **プライベートな連絡**
   - メール: [メールアドレスを設定]
   - 件名: `[SECURITY] Notion MCP Vulnerability`

3. **報告に含める情報**
   - 脆弱性の詳細な説明
   - 再現手順
   - 影響範囲
   - 可能であれば修正案

### 対応プロセス

1. **確認**: 24時間以内に受領確認
2. **評価**: 72時間以内に影響範囲を評価
3. **修正**: 重大度に応じて1-7日以内に修正
4. **公開**: 修正後、適切な時期に公開

## 🛡️ セキュリティ機能

### 実装済みのセキュリティ対策

✅ **入力検証**
- PageIdとDatabaseIdの形式検証
- 値オブジェクトによる型安全性

✅ **エラーハンドリング**
- 機密情報をエラーメッセージに含めない
- 適切なエラーレベルでのログ記録

✅ **依存関係の管理**
- 定期的な依存関係の更新
- 脆弱性スキャン

✅ **最小権限の原則**
- Dockerでの非rootユーザー実行
- 必要最小限の依存関係のみインストール

✅ **コンテナセキュリティ**
- マルチステージビルド
- 最小限のベースイメージ（Alpine）
- 定期的なイメージ更新

## 📚 参考リソース

### セキュリティツール

- **npm audit**: 依存関係の脆弱性チェック
  ```bash
  npm audit
  npm audit fix
  ```

- **Docker Scout**: コンテナイメージのスキャン
  ```bash
  docker scout cves kazuyaoda/notion-mcp:latest
  ```

- **Trivy**: 包括的なセキュリティスキャナ
  ```bash
  trivy image kazuyaoda/notion-mcp:latest
  ```

### セキュリティベストプラクティス

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 🔐 監査ログ

### セキュリティ関連の変更履歴

| 日付 | 変更内容 | バージョン |
|------|---------|-----------|
| 2024-10-26 | 初期セキュリティ設定 | 1.0.0 |
| 2024-10-26 | .gitignore強化 | 1.0.0 |
| 2024-10-26 | SECURITY.md作成 | 1.0.0 |

## ✅ セキュリティチェックリスト

デプロイ前の最終確認：

### コード
- [ ] APIキーがハードコードされていない
- [ ] 環境変数が適切に使用されている
- [ ] エラーメッセージに機密情報が含まれていない
- [ ] 入力検証が実装されている

### 設定
- [ ] .gitignoreが適切に設定されている
- [ ] .envファイルがGitに含まれていない
- [ ] Docker Secretsが使用されている（該当する場合）

### CI/CD
- [ ] GitHub Secretsが正しく設定されている
- [ ] Secretsがログに出力されていない
- [ ] PRからSecretsにアクセスできない

### Docker
- [ ] 非rootユーザーで実行されている
- [ ] 機密情報がイメージに含まれていない
- [ ] 最新のベースイメージを使用している

### ドキュメント
- [ ] セキュリティガイドが最新
- [ ] 脆弱性報告方法が明確
- [ ] ベストプラクティスが文書化されている

## 📞 サポート

セキュリティに関する質問がある場合：

- GitHub Discussions（一般的な質問）
- Security Advisory（脆弱性報告）
- プライベートメール（機密情報）

---

**最終更新**: 2024-10-26  
**次回レビュー**: 2025-01-26

