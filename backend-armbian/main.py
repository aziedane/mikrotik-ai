"""
MikroTik AI Assistant — FastAPI Backend
Target Platform: STB Armbian Linux (Allwinner H6 / Amlogic S905X / Rockchip RK3318)
RAM Usage: ~60-90 MB (Ringan & Cepat)
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

from routeros_client import RouterOSClient
from sqlite_store import init_db, record_metric, get_recent_metrics
from ai_agent import MikroTikAIAssistant

load_dotenv()

app = FastAPI(
    title="MikroTik AI Assistant Backend",
    description="Backend observability & AI diagnosis jaringan MikroTik (RouterOS v7) untuk gateway PPPoE & Hotspot.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

ai_assistant = MikroTikAIAssistant()

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": "MikroTik AI Assistant (FastAPI / Armbian)",
        "readOnlyMode": True,
        "sqliteActive": True
    }

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

@app.post("/api/assistant/chat")
async def chat_with_assistant(payload: ChatMessage):
    # Snapshot data konteks
    context = {
        "isDemo": True,
        "routers": [
            {"id": "router-1", "name": "MikroTik Utama", "role": "PPPoE Gateway", "model": "RB450Gx4", "cpu": 28, "ram": 36, "pppoe": 42},
            {"id": "router-2", "name": "MikroTik Hotspot", "role": "Hotspot Gateway", "model": "RB450Gx4", "cpu": 19, "ram": 28, "hotspot": 68}
        ]
    }
    result = await ai_assistant.analyze(payload.message, context)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
