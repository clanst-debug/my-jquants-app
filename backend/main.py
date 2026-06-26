"""
J-Quants ダッシュボード バックエンド (FastAPI)

エンドポイント:
  GET  /health           死活監視
  GET  /api/stock        株価日足データ (J-Quants v2 /v2/equities/bars/daily)
  GET  /api/fins         財務サマリー (J-Quants v2 /v2/fins/summary)
  POST /api/ai-comment   Claude AI コメント生成 (claude-sonnet-4-6)
"""

import asyncio
import os
import time
from typing import Any, Dict, Optional, Tuple

import httpx
from anthropic import Anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

JQUANTS_API_KEY = os.getenv("JQUANTS_API_KEY", "")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")

JQUANTS_BASE = "https://api.jquants.com/v2"
CACHE_TTL_SECONDS = 60 * 60  # 1時間
RETRY_MAX = 3
RETRY_WAIT_SECONDS = 30

app = FastAPI(title="J-Quants Dashboard API", version="0.1.0")

# CORS: ALLOWED_ORIGINS (カンマ区切り) で本番ドメインを指定。
# 未設定なら開発用に全許可。
_allowed = os.getenv("ALLOWED_ORIGINS", "").strip()
allow_origins = [o.strip() for o in _allowed.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- インメモリキャッシュ (TTL: 1時間) ----------

_cache: Dict[str, Tuple[float, Any]] = {}


def cache_get(key: str) -> Optional[Any]:
    item = _cache.get(key)
    if item is None:
        return None
    expires_at, value = item
    if time.time() > expires_at:
        _cache.pop(key, None)
        return None
    return value


def cache_set(key: str, value: Any) -> None:
    _cache[key] = (time.time() + CACHE_TTL_SECONDS, value)


# ---------- J-Quants 呼び出し共通 ----------

async def jquants_get(path: str, params: Dict[str, str]) -> Dict[str, Any]:
    """J-Quants API を呼ぶ。429 時は 30 秒待って最大 RETRY_MAX 回までリトライ。"""
    if not JQUANTS_API_KEY:
        raise HTTPException(status_code=500, detail="JQUANTS_API_KEY が未設定です")

    url = f"{JQUANTS_BASE}{path}"
    headers = {"x-api-key": JQUANTS_API_KEY}

    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(1, RETRY_MAX + 1):
            res = await client.get(url, params=params, headers=headers)
            if res.status_code == 429:
                if attempt == RETRY_MAX:
                    raise HTTPException(status_code=429, detail="J-Quants レート制限超過")
                await asyncio.sleep(RETRY_WAIT_SECONDS)
                continue
            if res.status_code >= 400:
                raise HTTPException(
                    status_code=res.status_code,
                    detail=f"J-Quants API エラー: {res.text}",
                )
            return res.json()

    raise HTTPException(status_code=500, detail="J-Quants リトライ上限")


# ---------- /health ----------

@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


# ---------- /api/stock ----------

@app.get("/api/stock")
async def get_stock(
    code: str = Query(..., description="銘柄コード (5桁、例: 72030)"),
    date: Optional[str] = Query(None, description="日付 YYYYMMDD (省略時は直近)"),
) -> Dict[str, Any]:
    cache_key = f"stock:{code}:{date or 'latest'}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    params: Dict[str, str] = {"code": code}
    if date:
        params["date"] = date

    data = await jquants_get("/equities/bars/daily", params)
    cache_set(cache_key, data)
    return data


# ---------- /api/fins ----------

@app.get("/api/fins")
async def get_fins(
    code: str = Query(..., description="銘柄コード (5桁、例: 72030)"),
) -> Dict[str, Any]:
    cache_key = f"fins:{code}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    data = await jquants_get("/fins/summary", {"code": code})
    cache_set(cache_key, data)
    return data


# ---------- /api/ai-comment ----------

class AiCommentRequest(BaseModel):
    code: str
    stock_data: Optional[Dict[str, Any]] = None
    fins_data: Optional[Dict[str, Any]] = None


SYSTEM_PROMPT = """あなたは日本株を分析する財務アナリストです。
FP2級レベルの知識を前提に、与えられた株価・財務データから次の観点で簡潔にコメントしてください。

1. 直近の株価トレンド (上昇/下降/横ばい、変動率の目安)
2. 売上・営業利益・純利益などの財務指標から読み取れる傾向
3. 注目すべきリスクとポジティブ材料

出力は日本語で、箇条書きを交えた 250〜400 字程度。投資助言や個別銘柄の売買推奨は行わず、
あくまでデータに基づく一般的な分析にとどめてください。"""


@app.post("/api/ai-comment")
def post_ai_comment(req: AiCommentRequest) -> Dict[str, str]:
    if not CLAUDE_API_KEY:
        raise HTTPException(status_code=500, detail="CLAUDE_API_KEY が未設定です")

    client = Anthropic(api_key=CLAUDE_API_KEY)

    user_content = (
        f"銘柄コード: {req.code}\n\n"
        f"## 株価データ\n{req.stock_data}\n\n"
        f"## 財務データ\n{req.fins_data}"
    )

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    text = "".join(
        block.text for block in message.content if getattr(block, "type", None) == "text"
    )
    return {"comment": text}
