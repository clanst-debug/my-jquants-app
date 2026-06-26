# J-Quants ダッシュボード

## プロジェクト概要
J-Quants API（日本株データ）とClaude APIを組み合わせた株価分析ダッシュボード。
FastAPI（バックエンド）+ React + Vite（フロントエンド）構成。

## ディレクトリ構成
```
my-jquants-app/
├── backend/
│   ├── main.py          # FastAPIメインファイル
│   ├── requirements.txt
│   ├── Procfile
│   └── .env             # APIキー（gitignore対象）
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js       # バックエンド呼び出し関数
    │   └── components/
    │       ├── StockSearch.jsx
    │       ├── StockChart.jsx
    │       └── AiComment.jsx
    ├── package.json
    └── vite.config.js
```

## 技術スタック
- バックエンド：FastAPI / Python / httpx / anthropic SDK
- フロントエンド：React / Vite / Recharts（チャート）/ Tailwind CSS
- 外部API：J-Quants API v2 / Claude API（claude-sonnet-4-6）

## 環境変数（backend/.env）
- `JQUANTS_API_KEY`：J-Quants APIキー
- `CLAUDE_API_KEY`：Claude APIキー
- `.env`は`.gitignore`に必ず追加すること

## バックエンド仕様

### エンドポイント
| メソッド | パス | 説明 |
|---|---|---|
| GET | /api/stock | 株価日足データ取得 |
| GET | /api/fins | 財務サマリー取得 |
| POST | /api/ai-comment | Claude AIコメント生成 |
| GET | /health | 死活監視 |

### /api/stock パラメータ
- `code`：銘柄コード（5桁、例：72030）
- `date`：日付（YYYYMMDD形式、省略時は直近）

### /api/ai-comment リクエストボディ
```json
{
  "code": "72030",
  "stock_data": { ... },
  "fins_data": { ... }
}
```

### レートリミット対策
- J-Quants APIはFreeプランで5リクエスト/分
- バックエンドでインメモリキャッシュを実装（TTL：1時間）
- 429レスポンス時は30秒待機してリトライ

### CORS設定
- 開発時：`allow_origins=["*"]`
- 本番時：フロントエンドのVercel URLのみ許可

## フロントエンド仕様

### 画面構成
1. ヘッダー：アプリ名
2. 銘柄検索：コード入力 → 検索ボタン
3. チャートエリア：株価折れ線グラフ（Recharts）
4. 財務サマリー：売上・営業利益などのカード表示
5. AIコメントエリア：Claude生成テキスト表示

### API呼び出し（api.js）
- `BASE_URL`は`import.meta.env.VITE_API_BASE_URL`から取得
- 開発時は`http://localhost:8000`
- エラー時はコンソールにログ出力してUIにメッセージ表示

## 開発サーバー起動手順
```bash
# バックエンド
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# フロントエンド（別ターミナル）
cd frontend
npm install
npm run dev
```

## 注意事項
- `.env`は絶対にGitHubにpushしない
- J-Quantsのデータをそのまま外部公開・配布しない（利用規約）
- Freeプランは12週間遅延データのみ（直近データはLightプラン以上）
- 銘柄コードはJ-Quants仕様の5桁（末尾0付き）を使うこと
