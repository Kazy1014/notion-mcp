# 🔒 セキュリティチェックリスト

このチェックリストを使用して、コミット前、デプロイ前、定期的なセキュリティレビューを実施してください。

## ✅ コミット前チェック

実行コマンド:
```bash
# 1. 機密情報の検索
grep -r "secret_\|nint_\|sk-\|ghp_\|gho_" --exclude-dir=node_modules . 2>/dev/null || echo "✓ OK"

# 2. .envファイルのチェック
git status | grep -i "\.env" && echo "⚠️ WARNING: .env detected!" || echo "✓ OK"

# 3. ステージングされたファイルの確認
git diff --cached --name-only
```

チェック項目:
- [ ] APIキーやトークンがハードコードされていない
- [ ] `.env`ファイルがステージングに含まれていない
- [ ] パスワードやシークレットがコメントに含まれていない
- [ ] 実際のAPIキーがテストコードに使用されていない

## 🚀 デプロイ前チェック

### コード
- [ ] すべてのテストが通過する (`npm test`)
- [ ] ビルドが成功する (`npm run build`)
- [ ] 型チェックが通過する (`tsc --noEmit`)
- [ ] Lintエラーがない

### セキュリティ
- [ ] 依存関係の脆弱性チェック (`npm audit`)
- [ ] Docker イメージのスキャン (`docker scout cves`)
- [ ] 環境変数が正しく設定されている
- [ ] GitHub Secretsが正しく設定されている

### ドキュメント
- [ ] CHANGELOG.mdが更新されている
- [ ] README.mdが最新
- [ ] バージョン番号が更新されている

## 📅 定期的なセキュリティレビュー（月次）

### 依存関係
```bash
# 脆弱性チェック
npm audit

# 依存関係の更新
npm outdated

# 自動修正
npm audit fix
```

- [ ] すべての依存関係が最新か確認
- [ ] 重大な脆弱性がないか確認
- [ ] 非推奨パッケージがないか確認

### Docker
```bash
# イメージのスキャン
docker scout cves kazuyaoda/notion-mcp:latest

# または Trivy
trivy image kazuyaoda/notion-mcp:latest
```

- [ ] ベースイメージを最新に更新
- [ ] 脆弱性が修正されている
- [ ] イメージサイズが最適化されている

### アクセス制御
- [ ] 不要なGitHub Collaboratorsを削除
- [ ] Docker Hub アクセストークンをローテーション
- [ ] Notion APIキーをローテーション（必要に応じて）

### コードレビュー
- [ ] SECURITY.mdが最新
- [ ] .gitignoreが適切
- [ ] エラーメッセージに機密情報が含まれていない

## 🔐 インシデント対応チェック

セキュリティインシデント発生時：

### 即座に実行
- [ ] 影響範囲を特定
- [ ] 露出した認証情報を無効化
- [ ] 新しいAPIキー/トークンを発行
- [ ] 環境変数を更新

### 調査
- [ ] Git履歴から機密情報を検索
- [ ] アクセスログを確認
- [ ] 不正アクセスの痕跡を確認

### 修正
- [ ] 脆弱性を修正
- [ ] パッチをリリース
- [ ] ドキュメントを更新
- [ ] チームに通知

### 事後対応
- [ ] インシデントレポートを作成
- [ ] 再発防止策を実施
- [ ] プロセスを改善

## 📊 セキュリティスコアカード

現在のステータス:

| 項目 | 状態 | 最終確認日 |
|------|------|-----------|
| 依存関係の脆弱性 | ✅ 0件 | 2024-10-26 |
| Docker脆弱性 | ⏳ 未確認 | - |
| .gitignore設定 | ✅ 適切 | 2024-10-26 |
| 認証情報の露出 | ✅ なし | 2024-10-26 |
| ドキュメント | ✅ 完備 | 2024-10-26 |

## 🛠️ 便利なコマンド集

### 機密情報の検索
```bash
# コード内の機密情報を検索
grep -rn "secret_\|nint_\|sk-\|password\|api.*key" src/

# Git履歴から検索
git log -p | grep -i "secret\|password\|api.*key"

# ステージングされたファイルをチェック
git diff --cached | grep -i "secret\|password\|api.*key"
```

### 依存関係のチェック
```bash
# 本番依存関係のみ
npm audit --production

# すべての依存関係
npm audit

# 自動修正
npm audit fix

# 詳細レポート
npm audit --json > audit-report.json
```

### Dockerセキュリティ
```bash
# イメージのスキャン
docker scout cves kazuyaoda/notion-mcp:latest

# Trivyでスキャン
trivy image kazuyaoda/notion-mcp:latest

# イメージの詳細確認
docker inspect kazuyaoda/notion-mcp:latest
```

## 📞 サポート

セキュリティに関する質問：
- 一般的な質問: GitHub Discussions
- 脆弱性報告: GitHub Security Advisory
- 緊急の問題: プライベートメール

---

**このチェックリストは定期的に更新してください**

最終更新: 2024-10-26
