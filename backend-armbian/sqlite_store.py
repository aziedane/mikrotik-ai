"""
SQLite Persistent Store for MikroTik Observability
Ringan & hemat memori untuk STB Armbian Linux (RAM 1.8GB)
"""

import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any

DB_PATH = os.getenv("SQLITE_PATH", "mikrotik_observability.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabel metrik berkala (CPU, RAM, Bandwidth)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS metrics_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        router_id TEXT NOT NULL,
        cpu_usage INTEGER,
        ram_percentage INTEGER,
        rx_bps INTEGER,
        tx_bps INTEGER,
        active_sessions INTEGER
    )
    """)

    # Tabel log alert kejadian
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        router_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT NOT NULL,
        is_resolved BOOLEAN DEFAULT 0
    )
    """)

    # Tabel snapshot audit jaringan
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        score INTEGER,
        findings_json TEXT
    )
    """)

    conn.commit()
    conn.close()

def record_metric(router_id: str, cpu: int, ram_pct: int, rx_bps: int, tx_bps: int, sessions: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO metrics_history (router_id, cpu_usage, ram_percentage, rx_bps, tx_bps, active_sessions)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (router_id, cpu, ram_pct, rx_bps, tx_bps, sessions))
    conn.commit()
    conn.close()

def get_recent_metrics(router_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT timestamp, cpu_usage, ram_percentage, rx_bps, tx_bps, active_sessions
        FROM metrics_history
        WHERE router_id = ?
        ORDER BY id DESC
        LIMIT ?
    """, (router_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in reversed(rows)]
