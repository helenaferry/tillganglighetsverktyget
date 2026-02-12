# Windows och WSL - Installationsguide

Guide för att köra Tillgänglighetsverktyget på Windows med WSL2 och Podman.

## Innehållsförteckning

1. [Översikt](#översikt)
2. [Rekommenderad Setup](#rekommenderad-setup)
3. [Installation](#installation)
4. [Viktiga Skillnader](#viktiga-skillnader)
5. [Vanliga Problem](#vanliga-problem)
6. [Prestanda](#prestanda)
7. [Felsökning](#felsökning)

## Översikt

Det finns två huvudsakliga sätt att köra applikationen på Windows:

### Alternativ 1: Podman Desktop (Rekommenderat)

- ✅ Enklast att komma igång
- ✅ Bra prestanda
- ✅ Inbyggt GUI
- ✅ Fungerar som native Windows-applikation
- ⚠️ Kräver Hyper-V eller WSL2 backend

### Alternativ 2: WSL2 med Podman

- ✅ Mer flexibelt för avancerade användare
- ✅ Bättre integration med Linux-verktyg
- ✅ Lättare att använda med terminalen
- ⚠️ Lite mer komplext att sätta upp
- ⚠️ Kräver förståelse för WSL-filsystem

## Rekommenderad Setup

**För de flesta utvecklare:** Använd **Podman Desktop** för enklast möjliga upplevelse.

## Installation

### Alternativ 1: Podman Desktop (Rekommenderat)

#### 1. Installera Podman Desktop

```powershell
# Via winget (om du har Windows Package Manager)
winget install RedHat.Podman

# Eller ladda ner från:
# https://podman-desktop.io/downloads
```

#### 2. Första gången du startar Podman Desktop

- Öppna Podman Desktop
- Följ setup-guiden
- Välj WSL2 som backend (rekommenderat) eller Hyper-V
- Vänta tills Podman Desktop startar

#### 3. Verifiera installationen

Öppna PowerShell eller Windows Terminal:

```powershell
# Kontrollera att podman fungerar
podman --version
podman ps

# Podman Compose ingår i Podman 4.7+ - verifiera:
podman compose version
```

#### 4. Klona repositoryt

```powershell
# Via HTTPS
git clone https://github.com/[organization]/tillganglighetsverktyget.git
cd tillganglighetsverktyget

# Konfigurera Git för korrekta radbrytningar
git config core.autocrlf input
```

#### 5. Följ standardguiden

Nu kan du följa [QUICKSTART.md](../QUICKSTART.md) från steg 1 (konfigurera miljö).

**OBS:** Använd PowerShell eller Windows Terminal, inte Git Bash, för bästa kompatibilitet.

---

### Alternativ 2: WSL2 med Podman

#### 1. Installera WSL2

```powershell
# I PowerShell som administratör
wsl --install

# Detta installerar Ubuntu som standard
# Starta om datorn efter installationen
```

#### 2. Uppdatera WSL och installera Ubuntu

```powershell
# Kontrollera WSL-version
wsl --list --verbose

# Sätt WSL2 som standard
wsl --set-default-version 2

# Om du behöver uppgradera en distribution till WSL2:
wsl --set-version Ubuntu 2
```

#### 3. Installera Podman i WSL

Öppna WSL terminal (Ubuntu):

```bash
# Uppdatera paketlistan
sudo apt update && sudo apt upgrade -y

# Installera Podman (Podman 4.7+ inkluderar podman compose)
sudo apt install -y podman

# Verifiera installation (rootless Podman behöver normalt ingen daemon)
podman --version
podman compose version
```

#### 4. Starta Podman i WSL (vid behov)

```bash
# Med rootless Podman behövs normalt ingen tjänst
# Om du använder Podman Machine i WSL:
podman machine start
```

#### 5. Klona repositoryt i WSL

**VIKTIGT:** Arbeta alltid i WSL-filsystemet (`/home/username/`), INTE i Windows-filsystemet (`/mnt/c/`).

```bash
# Klona i WSL hem-katalogen
cd ~
git clone https://github.com/[organization]/tillganglighetsverktyget.git
cd tillganglighetsverktyget

# Konfigurera Git
git config core.autocrlf input
```

#### 6. Följ standardguiden

Nu kan du följa [QUICKSTART.md](../QUICKSTART.md) från steg 1 (konfigurera miljö).

## Viktiga Skillnader från macOS/Linux

### 1. Filsystem och Prestanda

#### Med Podman Desktop (Windows-filsystem)

```powershell
# Du arbetar i Windows-filsystemet
C:\Users\username\projects\tillganglighetsverktyget
```

- ✅ Enkelt att nå filer från Windows
- ✅ Fungerar med Windows-editorer (VS Code, etc.)
- ⚠️ Lite långsammare för volumes med många små filer

#### Med WSL2 (Linux-filsystem)

```bash
# Arbeta ALLTID i WSL-filsystemet för bästa prestanda
/home/username/tillganglighetsverktyget

# INTE i Windows-monterat filsystem (mycket långsammare!)
/mnt/c/Users/username/tillganglighetsverktyget  # ❌ UNDVIK
```

**Prestandaskillnad:** WSL-filsystem är ~10x snabbare än `/mnt/c/` för databasoperationer.

### 2. Radbrytningar (Line Endings)

Windows använder CRLF (`\r\n`), Linux/macOS använder LF (`\n`).

#### Konfigurera Git korrekt

```bash
# I WSL eller PowerShell
git config --global core.autocrlf input

# Verifiera
git config --get core.autocrlf
# Ska returnera: input
```

#### Fixa befintliga filer om det behövs

```bash
# Konvertera alla shell-scripts till LF
find . -name "*.sh" -exec dos2unix {} \;

# Eller med Git
git add --renormalize .
git commit -m "Normalize line endings"
```

### 3. Sökvägar i Podman

Volume mounts fungerar annorlunda:

#### Podman Desktop (Windows)

```yaml
# Automatisk konvertering av Windows-sökvägar
volumes:
  - C:\Users\username\data:/data # Fungerar
  - ./data:/data # Fungerar (relativt)
```

#### WSL2

```yaml
# Linux-sökvägar
volumes:
  - /home/username/data:/data # Fungerar
  - ./data:/data # Fungerar (relativt)
  - /mnt/c/Users/username/data:/data # ❌ Långsamt, undvik
```

### 4. Åtkomst till Applikationen

#### Från Windows (med båda alternativen)

```
http://localhost:5173      - Frontend
http://localhost:3000/api  - Backend API
http://localhost:5500/em   - Oracle EM (valfritt; ofta ej tillgängligt i container)
```

**Det fungerar!** WSL2 delar nätverket med Windows automatiskt.

#### Från WSL2-terminalen

Samma URL:er fungerar i WSL2 också.

### 5. Minnesallokering

WSL2 kan använda mycket minne. Begränsa det vid behov:

```powershell
# Skapa/redigera %USERPROFILE%\.wslconfig
[wsl2]
memory=8GB
processors=4
swap=4GB
```

Starta om WSL efter ändring:

```powershell
wsl --shutdown
```

## Prestanda

### Rekommendationer för Bästa Prestanda

#### 1. Använd Rätt Filsystem

| Scenario       | Filsystem             | Prestanda    |
| -------------- | --------------------- | ------------ |
| Podman Desktop | Windows (C:)          | ✅ Bra       |
| WSL2           | WSL (`/home/`)        | ✅✅ Utmärkt |
| WSL2           | Windows via `/mnt/c/` | ❌ Dålig     |

#### 2. Oracle-Databasen

Oracle-databasen presterar bäst med:

- **Named volumes** (inte bind mounts till Windows-filsystem)
- **WSL2 filsystem** om du använder WSL

Standardkonfigurationen i `compose.dev.yml` använder named volumes och är optimal:

```yaml
volumes:
  oracle-data: # Named volume, hanteras av Podman Desktop
```

#### 3. Node Modules

För bästa prestanda med Node.js:

```yaml
# I compose.dev.yml (redan konfigurerat)
volumes:
  - ./client:/app
  - /app/node_modules # Anonymous volume för node_modules
```

Detta förhindrar att node_modules synkas mellan Windows och container.

### Prestandajämförelse

| Operation    | Podman Desktop | WSL2 (/home) | WSL2 (/mnt/c) |
| ------------ | -------------- | ------------ | ------------- |
| Oracle start | ~2-3 min       | ~2-3 min     | ~4-5 min      |
| npm install  | ~30 sek        | ~20 sek      | ~60 sek       |
| Vite HMR     | <1 sek         | <1 sek       | 2-3 sek       |
| DB queries   | Snabb          | Snabbast     | Långsam       |

## Vanliga Problem och Lösningar

### Problem 1: "Cannot connect to Podman"

**Med Podman Desktop:**

- Starta om Podman Desktop från programmenyn (högerklicka på ikonen → Quit, sedan starta igen)

**Med WSL2:**

```bash
# Starta Podman
podman machine start
# eller
podman machine start

# Verifiera
podman ps
```

### Problem 2: "Permission denied" för shell-scripts

```bash
# Gör scripts körbara
chmod +x database/init/*.sh

# Eller för alla scripts
find . -name "*.sh" -exec chmod +x {} \;
```

### Problem 3: Radbrytningsproblem i Scripts

```bash
# Fel: /bin/bash^M: bad interpreter
# Orsak: CRLF line endings

# Lösning 1: Använd dos2unix
sudo apt install dos2unix
find . -name "*.sh" -exec dos2unix {} \;

# Lösning 2: Använd sed
sed -i 's/\r$//' database/init/*.sh
```

### Problem 4: Oracle Startar Inte

```bash
# Kontrollera tillgängligt minne
free -h

# Oracle Database Free kräver minst 2GB RAM
# Om WSL har för lite minne, öka i .wslconfig
```

### Problem 5: Port Already in Use

```powershell
# Lista vad som använder en port
netstat -ano | findstr :5173
netstat -ano | findstr :3000

# Stoppa process (använd PID från ovan)
taskkill /PID [PID] /F
```

### Problem 6: Långsam Filsynkronisering

**Symptom:** Ändringar i koden reflekteras långsamt i containern.

**Lösning för WSL2:**

```bash
# Flytta projektet till WSL-filsystem
mv /mnt/c/projects/tillganglighetsverktyget ~/
cd ~/tillganglighetsverktyget
```

**För Podman Desktop:** Detta är sällan ett problem, men om det händer:

- Stäng antivirusprogram temporärt (kan skanna filer)
- Lägg till projekt-mappen i antivirus-undantag

### Problem 7: Git Clone Långsam

```bash
# För stora repos i WSL2, klona i Windows först
# Windows (PowerShell):
cd C:\projects
git clone https://...

# Sedan kopiera till WSL
wsl
cp -r /mnt/c/projects/tillganglighetsverktyget ~/
cd ~/tillganglighetsverktyget
```

## IDE-Integration

### Visual Studio Code

**Rekommenderad Setup:**

1. Installera "Remote - WSL" extension
2. Öppna projekt i WSL:

   ```powershell
   wsl
   cd ~/tillganglighetsverktyget
   code .
   ```

3. VS Code öppnas med WSL-integration ✅

**Extensions att installera i WSL:**

- Podman (eller Docker-extension för Podman-kompatibilitet)
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

### Andra IDE:er

- **IntelliJ IDEA:** Har inbyggt WSL-stöd
- **WebStorm:** Kan ansluta till WSL
- **VS Codium:** Samma extensions som VS Code

## Snabbkommando-referens

### Podman Desktop (PowerShell)

```powershell
# Starta applikationen
podman compose -f compose.dev.yml up -d

# Stoppa applikationen
podman compose -f compose.dev.yml down

# Se loggar
podman compose -f compose.dev.yml logs -f

# Starta om en tjänst
podman compose -f compose.dev.yml restart backend-api
```

### WSL2 (Bash)

```bash
# Samma kommandon som på Linux/macOS
podman compose -f compose.dev.yml up -d
podman compose -f compose.dev.yml down
podman compose -f compose.dev.yml logs -f
```

## Checklist för Windows-utvecklare

Innan du börjar, verifiera:

- [ ] WSL2 installerat och uppdaterat (om du använder WSL)
- [ ] Podman Desktop installerat ELLER Podman i WSL
- [ ] Git konfigurerat: `core.autocrlf = input`
- [ ] Minst 8GB RAM tillgängligt för WSL2
- [ ] Portarna 5173, 3000, 1521, 5500 är lediga
- [ ] Projekt klonat i rätt filsystem (WSL `/home/` eller Windows `C:`)
- [ ] `.env` filen konfigurerad med lösenord
- [ ] Shell-scripts har LF line endings

## Sammanfattning

### ✅ Vad som fungerar bra på Windows

- Podman Desktop med WSL2 backend
- All funktionalitet fungerar identiskt som på macOS/Linux
- Hot reload och HMR fungerar
- Alla containers startar normalt
- Networking fungerar out-of-the-box

### ⚠️ Vad du behöver tänka på

- Använd WSL-filsystem, inte `/mnt/c/`, för bästa prestanda
- Konfigurera Git för LF line endings
- Se till att WSL2 har tillräckligt med minne (minst 8GB)
- Var konsekvent med vilket filsystem du arbetar i

### 🚀 Rekommenderad Workflow

1. **Installera Podman Desktop** (enklast)
2. **Klona repo** i Windows eller WSL (välj ett!)
3. **Använd VS Code med Remote WSL** (om du använder WSL)
4. **Följ standard QUICKSTART.md** - allt annat fungerar likadant

---

**Behöver du hjälp?** Öppna en issue på GitHub eller kontakta teamet.
