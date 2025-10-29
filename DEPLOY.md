# GitHub Pages デプロイ手順

このプロジェクトをGitHub Pagesで公開するための手順です。

## 自動デプロイ設定（推奨）

`.github/workflows/deploy.yml` ファイルがすでに設定されています。mainブランチにプッシュすると自動的にビルドとデプロイが実行されます。

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
