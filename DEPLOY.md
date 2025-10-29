# GitHub Pages デプロイ手順

このプロジェクトをGitHub Pagesで公開するための手順です。

## 自動デプロイ設定（推奨）

GitHub Actions ワークフローファイルの内容は `github-actions-workflow.yml` に保存されています。

GitHub UIから手動でワークフローファイルを作成する必要があります：
1. リポジトリの **Actions** タブ → **Set up a workflow yourself** をクリック
2. ファイル名を `.github/workflows/deploy.yml` に設定
3. `github-actions-workflow.yml` の内容をコピー＆ペースト
4. mainブランチにコミット

設定後、mainブランチにプッシュすると自動的にビルドとデプロイが実行されます。

## GitHub Pages 有効化

1. リポジトリの **Settings** → **Pages** へ移動
2. **Source** で **GitHub Actions** を選択
3. mainブランチにプッシュすると自動的にデプロイされます

## 公開URL

https://bancom-inc.github.io/COTW.Solidjs.Tetris/

## 手動デプロイ（代替方法）

GitHub Actionsを使用しない場合：

```bash
npm install
npm run build
npm run deploy
```

注: この方法では `gh-pages` パッケージを使用します。
