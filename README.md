# FX 急変ポスト・ジェネレーター（フラット構成）

すべてのファイルがルート直下にあります。
GitHubに個別アップロードしても構造が崩れません。

## ファイル一覧（ぜんぶルートに置く）
- index.html
- main.jsx
- App.jsx        ← 本体。「App.jsx」という名前であること！
- package.json
- package-lock.json
- vite.config.js
- netlify.toml
- .gitignore

## ローカル確認
```bash
npm install
npm run dev
```

## ビルド
```bash
npm run build
```

## Netlify
GitHub連携なら netlify.toml が読まれるので設定不要。
- Build command: npm run build
- Publish directory: dist
