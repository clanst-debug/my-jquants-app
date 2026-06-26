# タスク一覧

## ステータス凡例
- [ ] 未着手
- [x] 完了
- [-] 進行中

---

## フェーズ1：バックエンド基盤

- [x] 1-1. `backend/main.py` を作成する
  - FastAPIアプリの初期化
  - CORSMiddlewareの設定
  - `.env`からAPIキーを読み込む（python-dotenv）
  - `/health` エンドポイントの実装

- [x] 1-2. インメモリキャッシュを実装する
  - `dict`ベースのシンプルなキャッシュ
  - TTL（有効期限）を1時間に設定
  - キャッシュヒット時はAPIを叩かずに返す

- [x] 1-3. `/api/stock` エンドポイントを実装する
  - J-Quants API v2 `/v2/equities/bars/daily` を呼び出す
  - `x-api-key`ヘッダーで認証
  - 429エラー時は30秒待機してリトライ（最大3回）
  - レスポンスをキャッシュに保存

- [x] 1-4. `/api/fins` エンドポイントを実装する
  - J-Quants API v2 `/v2/fins/summary` を呼び出す
  - 売上・営業利益・純利益を取得
  - レスポンスをキャッシュに保存

- [x] 1-5. `/api/ai-comment` エンドポイントを実装する
  - リクエストボディから株価・財務データを受け取る
  - Claude API（claude-sonnet-4-6）を呼び出す
  - システムプロンプト：FP2知識をベースにした財務分析の指示
  - 生成テキストをそのままレスポンスとして返す

- [x] 1-6. バックエンド動作確認
  - `uvicorn main:app --reload` で起動
  - `/health` にcurlでアクセスして200が返るか確認
  - `/api/stock?code=72030` で株価データが返るか確認

---

## フェーズ2：フロントエンド基盤

- [x] 2-1. Reactプロジェクトを初期化する
  ```bash
  cd frontend
  npm create vite@latest . -- --template react
  npm install
  npm install recharts axios
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

- [x] 2-2. `vite.config.js` を設定する
  - 開発時のプロキシ設定（`/api` → `http://localhost:8000`）
  - 環境変数 `VITE_API_BASE_URL` の設定

- [x] 2-3. `src/api.js` を作成する
  - `fetchStock(code)` 関数
  - `fetchFins(code)` 関数
  - `fetchAiComment(code, stockData, finsData)` 関数
  - エラーハンドリング（try/catch）

- [x] 2-4. `StockSearch.jsx` を作成する
  - 銘柄コード入力フォーム
  - 検索ボタン（クリックで親コンポーネントにcodeを渡す）
  - ローディング状態の表示

- [x] 2-5. `StockChart.jsx` を作成する
  - Rechartsの`LineChart`で株価折れ線グラフを表示
  - X軸：日付、Y軸：終値（AdjClose）
  - データなし時はメッセージ表示

- [x] 2-6. `AiComment.jsx` を作成する
  - AIコメントのテキスト表示エリア
  - ローディング中はスピナー表示
  - 「AIコメントを生成」ボタン

- [x] 2-7. `App.jsx` を作成する
  - 各コンポーネントを組み合わせる
  - stateの管理（code / stockData / finsData / aiComment）
  - 検索実行時に stock → fins → ai-comment の順で呼び出す

- [ ] 2-8. フロントエンド動作確認
  - `npm run dev` で起動
  - 銘柄コードを入力して株価チャートが表示されるか確認
  - AIコメントが生成されるか確認

---

## フェーズ3：デプロイ

- [ ] 3-1. `.gitignore` を作成する
  - `backend/.env` を必ず含める
  - `node_modules/` `__pycache__/` `.DS_Store` なども追加

- [ ] 3-2. GitHubにpushする
  ```bash
  git init
  git add .
  git commit -m "initial commit"
  git remote add origin GitHubのリポジトリURL
  git push -u origin main
  ```

- [ ] 3-3. Railwayにバックエンドをデプロイする
  - GitHubリポジトリを連携
  - Root Directoryを `backend` に設定
  - 環境変数（`JQUANTS_API_KEY` / `CLAUDE_API_KEY`）を設定
  - デプロイ完了後、URLを控える

- [ ] 3-4. Vercelにフロントエンドをデプロイする
  - GitHubリポジトリを連携
  - Root Directoryを `frontend` に設定
  - 環境変数 `VITE_API_BASE_URL` にRailwayのURLを設定
  - デプロイ完了後、動作確認

- [ ] 3-5. 本番CORS設定を更新する
  - `main.py` の `allow_origins` をVercelのURLに変更
  - GitHubにpushしてRailwayが自動再デプロイするのを確認

---

## フェーズ4：仕上げ

- [ ] 4-1. エラーハンドリングを強化する
  - 存在しない銘柄コード入力時のメッセージ
  - API障害時のフォールバック表示

- [ ] 4-2. UIを整える
  - Tailwind CSSでスタイリング
  - レスポンシブ対応（スマホでも見られる）

- [ ] 4-3. READMEを書く
  - プロジェクト概要
  - ローカル起動手順
  - 使用技術の説明（ポートフォリオ向け）
