# Windows/WSL - Snabbreferens för Skillnader

Snabbguide för de viktigaste skillnaderna när man utvecklar på Windows vs macOS/Linux.

## TL;DR - Vad du behöver veta

1. **Använd Docker Desktop** (rekommenderat) eller WSL2 med Docker
2. **Arbeta i WSL-filsystem** (`/home/user/`) om du använder WSL - INTE `/mnt/c/`
3. **Konfigurera Git:** `git config core.autocrlf input`
4. **Allt annat fungerar likadant** - samma kommandon, samma portar, samma workflow

## Installationsskillnader

| Aspekt | macOS/Linux | Windows |
|--------|-------------|---------|
| **Docker** | Native installation | Docker Desktop eller WSL2 |
| **Terminal** | Terminal.app / bash | PowerShell / Windows Terminal / WSL |
| **Filsystem** | Unix (/) | Windows (C:) eller WSL (/) |
| **Kommandon** | Direkt i terminal | Via Docker Desktop eller WSL |

## Kommandoskillnader

### Inga skillnader för Docker-kommandon! 🎉

```bash
# Samma på alla plattformar:
docker compose -f compose.dev.yml up -d
docker compose -f compose.dev.yml down
docker ps
docker logs tillgang-frontend-dev
```

### Sökvägar

| Scenario | macOS/Linux | Windows (PowerShell) | WSL2 |
|----------|-------------|----------------------|------|
| Hemkatalog | `/home/user` eller `~` | `C:\Users\username` | `/home/user` eller `~` |
| Projekt | `~/projects/tillgang...` | `C:\Users\...\tillgang...` | `~/projects/tillgang...` |
| Mount | `/mnt/c/Users/...` (i WSL) | - | Använd WSL-sökväg! |

## Filsystemprestanda

**VIKTIGT för WSL-användare:**

| Location | Prestanda | Användning |
|----------|-----------|------------|
| `/home/user/projekt` | ⚡ Snabbast | ✅ Använd för projekt |
| `/mnt/c/Users/...` | 🐌 10x långsammare | ❌ Undvik för utveckling |
| Windows med Docker Desktop | ✅ Bra | ✅ Fungerar bra |

## Radbrytningar (Line Endings)

**Problem:** Windows använder CRLF (`\r\n`), Linux/macOS använder LF (`\n`).

**Lösning:**
```bash
# Konfigurera Git (GÖR DETTA FÖRST!)
git config --global core.autocrlf input

# Fixa befintliga filer
git add --renormalize .
```

## Port-åtkomst

| Service | URL | Fungerar från |
|---------|-----|---------------|
| Frontend | http://localhost:5173 | Windows ✅, WSL ✅ |
| Backend | http://localhost:3000 | Windows ✅, WSL ✅ |
| Oracle | localhost:1521 | Windows ✅, WSL ✅ |

**Det funkar!** WSL2 delar nätverket med Windows automatiskt.

## IDE-rekommendationer

### Visual Studio Code (Bäst för WSL)

```powershell
# Installera i Windows
winget install Microsoft.VisualStudioCode

# Installera "Remote - WSL" extension
code --install-extension ms-vscode-remote.remote-wsl

# Öppna projekt i WSL
wsl
cd ~/tillganglighetsverktyget
code .
```

### Andra IDEs

- **IntelliJ IDEA / WebStorm:** Har WSL-stöd inbyggt
- **Fleet:** Beta, men lovande WSL-stöd
- **Vim/Neovim:** Fungerar perfekt i WSL

## Vanligaste Problem

### 1. "Permission denied" på Shell-scripts

```bash
# Lösning
chmod +x database/init/*.sh
```

### 2. Oracle Startar Inte

```bash
# Kontrollera minne
free -h

# Öka WSL-minne i %USERPROFILE%\.wslconfig:
[wsl2]
memory=8GB
```

### 3. Långsam Prestanda

```bash
# Är du i Windows-filsystemet? Flytta till WSL!
pwd  # Om det visar /mnt/c/..., flytta projektet

mv /mnt/c/projects/tillganglighetsverktyget ~/
cd ~/tillganglighetsverktyget
```

### 4. Line Ending Errors (`^M` eller `\r`)

```bash
# Fixa med dos2unix
sudo apt install dos2unix
find . -name "*.sh" -exec dos2unix {} \;

# Eller med sed
sed -i 's/\r$//' filename.sh
```

## Minnesrekommendationer

### Minimum

- **Total RAM:** 8GB
- **WSL2 tilldelat:** 4GB (standard är 50% av total)
- **Docker Desktop:** Använder WSL2, samma krav

### Rekommenderat

- **Total RAM:** 16GB
- **WSL2 tilldelat:** 8GB
- Detta ger komfortabel marginal för Oracle + backend + frontend

### Konfigurera WSL-minne

Skapa `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
memory=8GB
processors=4
swap=4GB
```

Starta om WSL:
```powershell
wsl --shutdown
```

## Checklist innan Start

- [ ] Docker Desktop installerat ELLER Docker Engine i WSL2
- [ ] Git konfigurerat: `core.autocrlf = input`
- [ ] Projekt i rätt filsystem (WSL `/home/` eller Windows med Docker Desktop)
- [ ] WSL2 har minst 8GB RAM (om du använder WSL)
- [ ] Shell-scripts är körbara (`chmod +x`)
- [ ] `.env` konfigurerad med lösenord

## När ska jag använda vad?

### Använd Docker Desktop om:
- ✅ Du vill ha enklast möjliga setup
- ✅ Du föredrar GUI över terminal
- ✅ Du är ny på containers
- ✅ Du vill arbeta i Windows-filsystemet

### Använd WSL2 med Docker om:
- ✅ Du är bekväm med Linux-terminal
- ✅ Du vill ha bästa prestanda
- ✅ Du behöver Linux-verktyg (sed, awk, grep, etc.)
- ✅ Du utvecklar primärt för Linux-miljöer

**Båda fungerar utmärkt!** Välj vad som passar din arbetsstil.

## Detaljerad Guide

För komplett installation och felsökning, se:
📖 **[WINDOWS_WSL_SETUP.md](WINDOWS_WSL_SETUP.md)**

## Snabbstart för Windows-användare

```powershell
# 1. Installera Docker Desktop från https://docs.docker.com/desktop/install/windows-install/
# 2. Klona projektet
git clone https://github.com/[org]/tillganglighetsverktyget.git
cd tillganglighetsverktyget

# 3. Konfigurera Git
git config core.autocrlf input

# 4. Konfigurera miljö
copy .env.example .env
# Redigera .env och sätt lösenord

# 5. Starta!
docker compose -f compose.dev.yml up -d

# 6. Öppna i webbläsare
start http://localhost:5173
```

**Det är allt!** 🎉
