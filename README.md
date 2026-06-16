# FX 急変ポスト・ジェネレーター

相場が急に動いたとき用の、Xポスト作成ツールです。
価格・動いた方向・自分のスタンスを入れて「作成する」を押すと、
「結論先出し → なぜ動いた → この後どうする」の構成で文章を生成します。
APIは使いません（すべてブラウザ内のテンプレート処理）。

## ローカルで動かす

```bash
npm install
npm run dev
```

表示された http://localhost:5173 を開きます。

## ビルド

```bash
npm run build      # dist/ に出力
npm run preview    # ビルド結果を確認
```

## Netlify にデプロイ

### A. GitHub 連携（おすすめ）
1. このフォルダをそのまま GitHub リポジトリに push
2. Netlify で「Add new site → Import an existing project」からリポジトリを選択
3. ビルド設定は netlify.toml が読まれるので変更不要
   - Build command: `npm run build`
   - Publish directory: `dist`

### B. 手動アップロード
1. `npm install && npm run build`
2. 生成された `dist/` フォルダを Netlify の「Deploy manually」にドラッグ＆ドロップ

## 構成

```
.
├── index.html
├── netlify.toml
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    └── App.jsx   ← 本体（入力フォーム＋生成ロジック）
```
