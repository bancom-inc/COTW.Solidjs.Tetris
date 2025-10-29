# GitHub Pages デプロイ手順

このプロジェクトをGitHub Pagesで公開するための手順です。

## 自動デプロイ設定（推奨）

PRをマージ後、以下の内容で `.github/workflows/deploy.yml` ファイルを作成してください：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

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
