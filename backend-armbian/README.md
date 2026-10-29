# PANDUAN DEPLOYMENT MIKROTIK AI ASSISTANT PADA STB ARMBIAN LINUX

Dokumen ini berisi panduan teknis pemasangan aplikasi **MikroTik AI Assistant** pada perangkat STB (Set-Top Box) berbasis Armbian Linux (RAM ~1.8GB) dan konfigurasi RouterOS v7.20.4 pada dua router MikroTik RB450Gx4 (Router Utama PPPoE & Router Hotspot).

---

## 1. Topologi Jaringan & Peran Perangkat

```text
[ INTERNET / ISP ]
       │
       ▼ (ether1-wan: IP Publik / PPPoE Client)
┌──────────────────────────────────────────────┐
│  MikroTik 1: Router Utama (RB450Gx4)         │
│  Peran: PPPoE Server Concentrator & NAT      │
│  IP Manajemen: 192.168.1.1/24                │
│  IP Inter-router: 172.16.1.1/30              │
└──────────────────────┬───────────────────────┘
                       │ ether3 (172.16.1.0/30)
                       ▼ ether1
┌──────────────────────────────────────────────┐
│  MikroTik 2: Router Hotspot (RB450Gx4)       │
│  Peran: Captive Portal / Hotspot Gateway     │
│  IP Inter-router: 172.16.1.2/30              │
│  Subnet Hotspot: 192.168.88.0/23             │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[ Access Point Warga ]     [ Klien Hotspot & Voucher ]
```

**Server STB Armbian**:
- Terhubung ke port manajemen `ether4` pada Router Utama (IP: `192.168.1.100/24`).
- Menjalankan backend FastAPI (port 8000) dan frontend web dashboard (port 3000).

---

## 2. Konfigurasi Akun READ-ONLY pada Kedua Router MikroTik (RouterOS v7)

Jalankan perintah berikut di Terminal Winbox atau SSH pada **kedua router**:

### A. Buat Group Hak Akses Khusus BACA-SAJA (Read-Only)
```routeros
/user group
add name=read-only-api policy=read,api,rest comment="Hak akses baca saja untuk MikroTik AI Assistant"
```

> **Keamanan**: Policy `write`, `policy`, `test`, `password`, `reboot`, `sensitive` sengaja **TIDAK** diaktifkan agar aplikasi tidak dapat mengubah konfigurasi atau memutus pelanggan secara sepihak.

### B. Buat Akun Pengguna API
```routeros
/user
add name=api-readonly group=read-only-api password="GANTI_DENGAN_PASSWORD_KUAT_ANDA" comment="User monitoring STB Armbian"
```

### C. Aktifkan Service REST API & SSL (HTTPS)
```routeros
/ip service
set www-ssl disabled=no port=443 tls-version=only-1.2
set api-ssl disabled=no port=8729
```

---

## 3. Instalasi pada STB Armbian Linux

### Langkah 1: Update & Install Dependensi
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git curl sqlite3
```

### Langkah 2: Siapkan Direktori & Virtual Environment
```bash
sudo mkdir -p /opt/mikrotik-ai-backend
sudo cp -r backend-armbian/* /opt/mikrotik-ai-backend/
cd /opt/mikrotik-ai-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Langkah 3: Konfigurasi File Environment (.env)
```bash
cat << 'EOF' > /opt/mikrotik-ai-backend/.env
# Gemini API Key untuk diagnosa cerdas AI
GEMINI_API_KEY=AIzaSy...

# Konfigurasi Router 1 (MikroTik Utama)
ROUTER1_HOST=192.168.1.1
ROUTER1_PORT=443
ROUTER1_USER=api-readonly
ROUTER1_PASS=GANTI_DENGAN_PASSWORD_KUAT_ANDA

# Konfigurasi Router 2 (MikroTik Hotspot)
ROUTER2_HOST=172.16.1.2
ROUTER2_PORT=443
ROUTER2_USER=api-readonly
ROUTER2_PASS=GANTI_DENGAN_PASSWORD_KUAT_ANDA

SQLITE_PATH=/opt/mikrotik-ai-backend/mikrotik_observability.db
EOF
```

### Langkah 4: Aktifkan Service Otomatis (Systemd)
```bash
sudo cp mikrotik-ai.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mikrotik-ai.service
sudo systemctl start mikrotik-ai.service
sudo systemctl status mikrotik-ai.service
```

---

## 4. Pengujian Baca-Saja (Testing Read-Only)

Uji respon REST API RouterOS dari terminal Armbian:
```bash
curl -k -u api-readonly:PASSWORD_ANDA https://192.168.1.1/rest/system/resource
```
Jika mengembalikan JSON resource CPU dan RAM, integrasi siap digunakan!
