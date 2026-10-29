"""
RouterOS v7 REST API Client (Strict READ-ONLY)
Target Hardware: MikroTik RB450Gx4 (RouterOS 7.20.4)
Server: STB Armbian Linux

Keamanan:
- Hanya mengeksekusi method GET HTTP (BACA-SAJA).
- Dilarang keras melakukan POST, PUT, PATCH, DELETE ke router.
"""

import httpx
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("routeros_client")

class RouterOSClient:
    def __init__(self, host: str, port: int = 443, username: str = "api-readonly", password: str = "", use_tls: bool = True):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.use_tls = use_tls
        self.protocol = "https" if use_tls else "http"
        self.base_url = f"{self.protocol}://{self.host}:{self.port}/rest"

    def _get_auth(self):
        return (self.username, self.password)

    async def _safe_get(self, endpoint: str) -> List[Dict[str, Any]]:
        """Hanya mengizinkan metode GET ke RouterOS REST API"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        async with httpx.AsyncClient(verify=False, timeout=8.0) as client:
            try:
                response = await client.get(url, auth=self._get_auth())
                response.raise_for_status()
                data = response.json()
                if isinstance(data, dict):
                    return [data]
                return data
            except httpx.HTTPError as e:
                logger.error(f"Gagal mengambil data dari RouterOS {url}: {e}")
                raise e

    async def get_system_resource(self) -> Dict[str, Any]:
        """Ambil CPU, RAM, Uptime, Versi RouterOS"""
        res = await self._safe_get("system/resource")
        return res[0] if res else {}

    async def get_interfaces(self) -> List[Dict[str, Any]]:
        """Ambil seluruh interface fisik dan virtual beserta status link"""
        return await self._safe_get("interface")

    async def get_pppoe_active(self) -> List[Dict[str, Any]]:
        """Ambil sesi PPPoE aktif pada Router Utama"""
        return await self._safe_get("ppp/active")

    async def get_hotspot_active(self) -> List[Dict[str, Any]]:
        """Ambil pengguna Hotspot aktif pada Router Hotspot"""
        return await self._safe_get("ip/hotspot/active")

    async def get_ip_routes(self) -> List[Dict[str, Any]]:
        """Ambil tabel routing aktif"""
        return await self._safe_get("ip/route")

    async def get_firewall_filter(self) -> List[Dict[str, Any]]:
        """Ambil aturan firewall filter"""
        return await self._safe_get("ip/firewall/filter")

    async def get_firewall_nat(self) -> List[Dict[str, Any]]:
        """Ambil aturan firewall NAT"""
        return await self._safe_get("ip/firewall/nat")
