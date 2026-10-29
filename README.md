# MikroTik AI Assistant (STB Armbian Edition)

<div align="center">

![MikroTik AI Assistant](https://img.shields.io/badge/RouterOS-v7%20REST%20API-cyan?style=for-the-badge&logo=mikrotik)
![Armbian Linux](https://img.shields.io/badge/STB-Armbian%20AArch64-emerald?style=for-the-badge&logo=linux)
![TypeScript](https://img.shields.io/badge/TypeScript-Vite%20%2B%20React-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

*Asisten Cerdas & Dashboard Observability Dual-Router MikroTik berbasis Server STB Armbian Linux.*

</div>

---

## 🌟 Fitur Utama

- **Dual-Router Live REST API (RouterOS v7):** Memantau MikroTik 1 (PPPoE Gateway) dan MikroTik 2 (Hotspot Gateway) secara *real-time* via HTTPS/HTTP REST API.
- **Strict Read-Only Guarantee:** 100% aman (hanya melakukan HTTP `GET` query untuk metrics, traffic, sesi PPPoE/Hotspot, dan interface tanpa mengubah konfigurasi router).
- **Dashboard & Android UI Experience:** Desain modern bertema Android/RouterOS dengan dukungan *dark mode*, *circular hardware gauges* (CPU, RAM, HDD), dan *active router switcher*.
- **Live Topology Network Mapper:** Visualisasi topologi jaringan interaktif dari ISP ke router, STB, hingga klien aktif.
- **AI Assistant Integration (Google GenAI):** Asisten AI interaktif dengan konteks data riil RouterOS untuk analisis jaringan dan troubleshooting.
- **Persistent Storage:** Konfigurasi IP, port, dan kredensial router disimpan secara aman di disk STB (`routers-store.json`) dan otomatis diabaikan oleh Git agar tidak tertimpa saat *update*.

---

## ⚙️ Prasyarat Sistem

1. **Hardware STB:** STB Android (HG680P, B860H, dll.) yang sudah terinstal **Armbian Linux** (AArch64 / ARM 32-bit).
2. **Software:** Node.js v18 / v20 LTS dan npm.
3. **Router MikroTik:** RouterOS **v7.x** dengan layanan REST API aktif (`www` atau `www-ssl`).

---

## 🚀 Panduan Instalasi (Git Clone)

Jalankan perintah berikut di terminal SSH STB Armbian Anda:

### 1. Update OS & Install Node.js v20 LTS
```bash
sudo apt update && sudo apt install -y curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Clone Repository
```bash
sudo mkdir -p /opt/mikrotik-ai
sudo chown -R $USER:$USER /opt/mikrotik-ai
git clone https://github.com/USERNAME_ANDA/mikrotik-ai.git /opt/mikrotik-ai
cd /opt/mikrotik-ai
```

### 3. Install Dependencies & Build
```bash
npm install --legacy-peer-deps
npm run build
```

### 4. Jalankan dengan PM2 (Auto-Start saat Reboot)
```bash
sudo npm install -g pm2 tsx
pm2 start server.ts --name "mikrotik-ai" --interpreter tsx
pm2 save
pm2 startup
```

---

## 🔧 Konfigurasi MikroTik (RouterOS v7)

Buka **Winbox** -> masuk ke **Terminal** pada Router 1 dan Router 2, lalu jalankan skrip berikut:

```routeros
# 1. Buat Group Read-Only khusus REST API
/user group add name=read-only-api policy=read,api,rest comment="Akses STB Armbian"

# 2. Buat User Monitoring (Ganti password_anda)
/user add name=api-readonly group=read-only-api password="password_anda" comment="User STB"

# 3. Aktifkan Service REST API (HTTP Port 80 atau HTTPS Port 443)
/ip service set www disabled=no port=80
/ip service set www-ssl disabled=no port=443 tls-version=only-1.2
```

---

## 🔄 Cara Update di Masa Depan

Ketika ada pembaruan kode di GitHub, Anda cukup menjalankan satu perintah berikut di terminal STB:

```bash
cd /opt/mikrotik-ai && git pull && npm run build && pm2 restart mikrotik-ai
```
> *Catatan: File konfigurasi router Anda (`routers-store.json`) aman dan tidak akan tertimpa saat `git pull`.*

---

## 🌐 Akses Aplikasi

Buka browser dari HP atau Laptop yang terhubung ke jaringan lokal yang sama dengan STB:
```text
http://<IP-STB-ANDA>:3000
```
*(Contoh: `http://192.168.1.100:3000`)*

---

## 📄 Lisensi
Distribusi di bawah lisensi MIT. Silakan gunakan dan kembangkan untuk kebutuhan jaringan Anda.
