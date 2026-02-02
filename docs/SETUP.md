# Installationsguide - Tillgänglighetsverktyget

Denna guide hjälper dig att få igång Tillgänglighetsverktyget med Podman-containers.

## Innehållsförteckning

1. [Förutsättningar](#förutsättningar)
2. [Arkitekturöversikt](#arkitekturöversikt)
3. [Snabbstart](#snabbstart)
4. [Utvecklingsarbetsflöde](#utvecklingsarbetsflöde)
5. [Åtkomst till applikationen](#åtkomst-till-applikationen)
6. [Databashantering](#databashantering)
7. [Felsökning](#felsökning)
8. [Produktionsdistribution](#produktionsdistribution)

**💻 Windows-användare:** Se [WINDOWS_WSL_SETUP.md](WINDOWS_WSL_SETUP.md) för specifika instruktioner om Podman Desktop eller WSL2-installation.

## Förutsättningar

### Nödvändig programvara

1. **Podman**
   - **macOS:** [Podman Desktop](https://podman-desktop.io/downloads) eller [Podman install](https://podman.io/docs/installation) (rekommenderat: Podman 4.7+ för `podman compose`)
   - **Linux:** Pakethanterare (t.ex. `sudo apt install podman` eller `sudo dnf install podman`) – Podman 4.7+ inkluderar `podman compose`
   - **Windows:** Se [WINDOWS_WSL_SETUP.md](WINDOWS_WSL_SETUP.md) för detaljerad guide
   - Allmän info: https://podman.io/docs/installation

2. **Podman Compose** (för orkestrering)
   - **macOS/Windows:** Ingår i Podman Desktop, eller använd `podman compose` (Podman 4.7+)
   - **Linux:** `podman compose` ingår i Podman 4.7+
   - Verifiera: `podman compose version`

3. **Git** (för att klona repositoryt)

### macOS: Podman Desktop / Podman Machine

**⚠️ VIKTIGT för macOS-användare:** På macOS kör Podman containers via en Linux-VM (Podman Machine) eller Podman Desktop. Du måste ha en startad Podman Machine innan du kör `podman compose` eller `./scripts/dev-up.sh`.

#### Initiera och starta Podman Machine

Om du använder Podman från terminalen (t.ex. `brew install podman`) behöver du skapa och starta en maskin en gång:

1. **Skapa maskinen (behövs bara en gång)**  
   Skapa en maskin med tillräckligt minne (minst 8 GB för Oracle):

   ```bash
   podman machine init --cpus 4 --memory 8192 --disk-size 50
   ```

   Om du redan har en maskin men med för lite minne kan du ta bort och skapa om (data i containrar på maskinen går förlorad):

   ```bash
   podman machine stop
   podman machine rm
   podman machine init --cpus 4 --memory 8192 --disk-size 50
   ```

2. **Starta maskinen**  
   Innan du kör compose eller dev-up:

   ```bash
   podman machine start
   ```

3. **Kontrollera att maskinen kör**
   ```bash
   podman machine list
   ```
   Du ska se en rad med tillståndet **Running**.

**Med Podman Desktop:** Öppna Podman Desktop – den skapar och startar normalt en maskin åt dig. Kontrollera i gränssnittet att maskinen är startad innan du kör kommandon i terminalen.

**Resurser:** I Podman Desktop → Settings → Resources kan du ställa in minne (rekommenderat minst 8 GB för Oracle), CPU och disk. Vid CLI-installation använd `--memory` och `--cpus` vid `podman machine init` som ovan.

### Systemkrav

- **Minimum:** 8GB RAM tillgängligt för Podman, 20GB ledigt diskutrymme
- **Rekommenderat:** 16GB RAM totalt på värdmaskinen, 50GB ledigt diskutrymme
- **⚠️ VIKTIGT:** Oracle Database Free kräver minst 2GB RAM bara för sig själv. Med bara 2GB totalt kommer Oracle **inte** att fungera!
- Podman Machine / Podman Desktop bör konfigureras med minst 8GB RAM

## Arkitekturöversikt

Applikationen består av tre huvudtjänster:

```
┌─────────────────────────────────────────────────────────┐
│                    Din dator                           │
│                                                         │
│  ┌─────────────┐      ┌──────────────┐     ┌────────┐ │
│  │  Frontend   │─────▶│  Backend API │────▶│ Oracle │ │
│  │  (React)    │      │  (Express)   │     │   XE   │ │
│  │  Port 5173  │      │  Port 3000   │     │  1521  │ │
│  └─────────────┘      └──────────────┘     └────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tjänster

1. **Oracle Database (oracle-db)**
   - Oracle Database Free 23ai
   - Persisterande datalagring via volumes
   - Initialiserar schema automatiskt vid första starten

2. **Backend API (backend-api)**
   - Express + TypeScript + Sequelize
   - REST API för hantering av granskningar och kontroller
   - Hot-reload i utvecklingsläge

3. **Frontend (frontend)**
   - React Router + Vite
   - Hot Module Replacement (HMR) i utveckling
   - Nginx statisk server i produktion

## Snabbstart

### 1. Klona och konfigurera

```bash
# Klona repositoryt
git clone <repository-url>
cd tillganglighetsverktyget

# Kopiera miljövariabelfil
cp .env.example .env

# VIKTIGT: Redigera .env och sätt OBLIGATORISKA lösenord
# ORACLE_PWD och DB_PASSWORD har INGA standardvärden av säkerhetsskäl
```

**⚠️ KRITISKT:** Före start måste du sätta lösenord i `.env`:

```bash
# Redigera .env och sätt:
ORACLE_PWD=DittSakraOracleLösenord123!
DB_PASSWORD=DittSakraAppLösenord456!
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Konfigurera frontend:**

```bash
# Kopiera frontend-konfiguration (KRÄVS)
cp client/.env.example client/.env.local
# Redigera client/.env.local för att anpassa logotyper, texter, länkar etc.
# Se client/.env.example för alla tillgängliga alternativ
```

### 2. Starta applikationen

```bash
# Starta alla tjänster (utvecklingsläge)
podman compose -f compose.dev.yml up -d

# Den första starten tar 5-10 minuter:
# - Hämtar container-images (~2GB för Oracle)
# - Oracle-databasinitialisering (~2-3 minuter)
# - Installerar npm-beroenden
```

### 3. Övervaka starten

```bash
# Titta på loggarna (särskilt viktigt vid första körningen)
podman compose -f compose.dev.yml logs -f

# Eller övervaka specifika tjänster
podman compose -f compose.dev.yml logs -f oracle-db
podman compose -f compose.dev.yml logs -f backend-api
podman compose -f compose.dev.yml logs -f frontend
```

**Vänta på dessa meddelanden:**

- Oracle: `DATABASE IS READY TO USE!`
- Backend: `✅ Database connected successfully`
- Frontend: Vite dev server redo

### 4. Verifiera att allt fungerar

```bash
# Kontrollera tjänststatus
podman compose -f compose.dev.yml ps

# Alla tjänster bör visa "healthy" eller "running"
# Oracle tar ~2-3 minuter att bli healthy
```

Öppna din webbläsare:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/health
- **Oracle EM (valfritt):** http://localhost:5500/em – webbgränssnitt för databasen (användare: `system`, lösenord: från `.env`). EM Express ingår inte i alla Oracle-containeravbildningar och är ofta inte tillgängligt i dev; använd sqlplus eller appen för att arbeta med databasen.

## Miljövariabler - Komplett guide

Projektet använder tre separata `.env`-filer för att hålla konfiguration organiserad och tydlig.

### Översikt

| Fil                 | Syfte                  | När behövs                      | Känslig data  |
| ------------------- | ---------------------- | ------------------------------- | ------------- |
| `.env` (root)       | Container-orkestrering | ✅ Alltid med Podman Compose    | Ja (lösenord) |
| `server/.env`       | Backend-utveckling     | Endast lokal backend-utveckling | Ja (lösenord) |
| `client/.env.local` | Frontend-konfiguration | ✅ Alltid (krävs av frontend)   | Nej           |

### 1. Root `.env` - Container-orkestrering

**Kopieras från:** `.env.example`  
**Används av:** `compose.dev.yml`, `compose.prod.yml`

```bash
cp .env.example .env
```

**Viktiga variabler:**

- `ORACLE_PWD` - Oracle SYSTEM-lösenord (KRÄVS)
- `DB_PASSWORD` - App-databas lösenord (KRÄVS)
- `ALLOWED_ORIGINS` - CORS tillåtna domäner
- `VITE_API_URL` - API URL för frontend

### 2. Server `.env` - Backend-utveckling

**Kopieras från:** `server/.env.example`  
**Används av:** Node.js backend direkt

```bash
cd server && cp .env.example .env
```

**När:** Endast vid lokal backend-utveckling utan containers

### 3. Client `.env.local` - Frontend-konfiguration

**Kopieras från:** `client/.env.example`  
**Används av:** React + Vite  
**Krävs:** ✅ Ja (frontend kräver denna fil)

```bash
cd client && cp .env.example .env.local
```

**Innehåller:** Applikationstitel, logotyper, footer-länkar, förifyllningskonfiguration  
**OBS:** Alla `VITE_*` variabler är publika - lagra aldrig hemligheter här!

### Vanliga scenarier

**Scenario 1: Containers (vanligast)**

```bash
cp .env.example .env                        # Orkestrering
cp client/.env.example client/.env.local    # Frontend
# Redigera båda filerna
podman compose -f compose.dev.yml up
```

**Scenario 2: Lokal backend**

```bash
podman compose -f compose.dev.yml up oracle-db  # Endast databas
cd server && cp .env.example .env  # Konfigurera backend
npm run dev
```

**Scenario 3: Anpassad frontend**

```bash
cd client && cp .env.example .env.local  # Anpassa branding
# Ändra logotyper, texter etc
```

## Utvecklingsarbetsflöde

### Daglig utveckling

```bash
# Starta tjänster
podman compose -f compose.dev.yml up -d

# Stoppa och ta bort containers (datavolumes behålls – nästa "up" återanvänder samma data)
podman compose -f compose.dev.yml down

# Stoppa och ta bort containers + volumes (nystart från scratch – all data försvinner)
podman compose -f compose.dev.yml down -v
```

**Bara stoppa** (containers kvar, starta igen med `start` eller `up -d`): `podman compose -f compose.dev.yml stop`

### Compose-kommandon – stopp och data

| Kommando                                    | Containers     | Volumes / data | När du använder det                                                                                                           |
| ------------------------------------------- | -------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `podman compose -f compose.dev.yml stop`    | Stoppade, kvar | Kvar           | Bara pausa – starta igen med `start` eller `up -d`.                                                                           |
| `podman compose -f compose.dev.yml down`    | Borttagna      | Kvar           | Stoppa och städa bort containers; datan (t.ex. Oracle) ligger kvar. Nästa `up` skapar nya containers som använder samma data. |
| `podman compose -f compose.dev.yml down -v` | Borttagna      | Borttagna      | Nystart från scratch – all data (inkl. databas) försvinner. Använd vid felsökning eller om du vill börja om.                  |

### Kodändringar

**Hot-Reload är aktiverat:**

- Frontend-ändringar i `client/app/` → Automatisk webbläsaruppdatering
- Backend-ändringar i `server/src/` → Automatisk serveromstart

Ingen behov av att bygga om containers för kodändringar!

### Visa loggar

```bash
# Alla tjänster
podman compose -f compose.dev.yml logs -f

# Specifik tjänst
podman compose -f compose.dev.yml logs -f backend-api

# Sista 100 raderna
podman compose -f compose.dev.yml logs --tail=100
```

### Starta om tjänster

```bash
# Starta om alla
podman compose -f compose.dev.yml restart

# Starta om specifik tjänst
podman compose -f compose.dev.yml restart backend-api
```

### Bygg om containers

Behövs endast om du ändrar:

- `package.json` beroenden
- `Dockerfile.dev`
- Grundkonfiguration

```bash
# Bygg om och starta om
podman compose -f compose.dev.yml up -d --build

# Bygg om specifik tjänst
podman compose -f compose.dev.yml build backend-api
podman compose -f compose.dev.yml up -d backend-api
```

## Åtkomst till applikationen

### Webbgränssnitt

| Tjänst               | URL                               | Beskrivning                                                       |
| -------------------- | --------------------------------- | ----------------------------------------------------------------- |
| Frontend             | http://localhost:5173             | Huvudapplikation                                                  |
| Backend API          | http://localhost:3000/api/reviews | REST API                                                          |
| Health Check         | http://localhost:3000/health      | Backend-status                                                    |
| Oracle EM (valfritt) | http://localhost:5500/em          | Databas webbgränssnitt – ofta inte tillgängligt i containerbilder |

### API-exempel

```bash
# Hämta alla granskningar
curl http://localhost:3000/api/reviews

# Hämta specifik granskning
curl http://localhost:3000/api/reviews/1

# Skapa granskning
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Review",
    "excludedContentTypes": ["video"],
    "objectType": "web",
    "regulatoryFramework": "WCAG 2.2 AA",
    "selectedPrefillIds": ""
  }'
```

## Databashantering

### Ansluta till databasen

#### Från värdmaskinen

Med SQLPlus:

```bash
# Anslut som systemanvändare
sqlplus system/OraclePassword123!@localhost:1521/FREEPDB1

# Anslut som applikationsanvändare
sqlplus tillgang_user/TillgangDev2026!@localhost:1521/FREEPDB1
```

Med SQL Developer eller DBeaver:

- **Värd:** localhost
- **Port:** 1521
- **Tjänstnamn:** FREEPDB1
- **Användarnamn:** tillgang_user
- **Lösenord:** TillgangDev2026!

**⚠️ VIKTIGT:** Oracle Database Free använder `FREEPDB1` som tjänstnamn (inte `XEPDB1` som används i Oracle XE).

#### Från containern

```bash
# Anslut till container
podman exec -it tillgang-oracle-dev bash

# Använd sedan sqlplus
sqlplus tillgang_user/TillgangDev2026!@FREEPDB1
```

### Vanliga databasuppgifter

#### Visa tabeller och data

```sql
-- Lista alla tabeller
SELECT table_name FROM user_tables;

-- Visa data
SELECT * FROM reviews;
SELECT * FROM checks;

-- Räkna poster
SELECT COUNT(*) FROM reviews;
SELECT COUNT(*) FROM checks;
```

#### Återställ databas (utveckling)

```bash
# Stoppa alla tjänster
podman compose -f compose.dev.yml down

# Ta bort databasvolume
podman volume rm tillgang-oracle-data-dev

# Starta igen (skapar om från början)
podman compose -f compose.dev.yml up -d
```

#### Säkerhetskopiera databas

```bash
# Exportera data
podman exec tillgang-oracle-dev expdp \
   tillgang_user/TillgangDev2026!@FREEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=tillgang_backup.dmp \
  logfile=tillgang_backup.log

# Kopiera dumpfil från container
# Sökvägen till dumpfilen beror på DATA_PUMP_DIR i Oracle (inga dpdump under /opt/oracle/admin/FREE/ i 23ai Free).
# Hitta filen efter expdp t.ex.: podman exec tillgang-oracle-dev find /opt/oracle -name "*.dmp" -mmin -5
podman cp tillgang-oracle-dev:<sökväg-till-tillgang_backup.dmp> ./backup.dmp
```

## Felsökning

### macOS/Windows: "Cannot connect to Podman"

**Problem:** Felmeddelande vid körning av `podman compose`:

```
Error: cannot connect to Podman...
```

**Orsak:** Podman Machine / Podman Desktop är inte startad (vanligt på macOS/Windows)

**Lösning:**

- **macOS/Windows:** Starta Podman Desktop från programmenyn, eller kör `podman machine start`, och vänta tills Podman är redo
- **Linux:** Podman behöver normalt ingen daemon; om du använder system-Podman, kontrollera att socketen är aktiv

**Förebyggande:** Sätt Podman Desktop att starta vid inloggning, eller starta Podman Machine vid behov

### Oracle-container startar inte

**Problem:** Oracle-containern avslutas omedelbart eller misslyckas med health check

**Lösningar:**

1. Se till att minst 8GB RAM är tillgängligt
2. Kontrollera diskutrymme: `df -h`
3. Visa loggar: `podman logs tillgang-oracle-dev`
4. Försök med ren start:
   ```bash
   podman compose -f compose.dev.yml down -v
   podman compose -f compose.dev.yml up -d
   ```

### Backend kan inte ansluta till databasen

**Problem:** Backend visar "Unable to connect to the database"

**Lösningar:**

1. Vänta tills Oracle är healthy:
   ```bash
   podman compose -f compose.dev.yml ps
   ```
2. Kontrollera Oracle-loggar för "DATABASE IS READY TO USE"
3. Verifiera uppgifter i `.env` matchar databasen
4. Starta om backend efter att Oracle är redo:
   ```bash
   podman compose -f compose.dev.yml restart backend-api
   ```

### Frontend visar nätverksfel

**Problem:** Frontend kan inte nå backend API

**Lösningar:**

1. Kontrollera att backend körs: `curl http://localhost:3000/health`
2. Verifiera VITE_API_URL i `.env` eller `client/.env.example`
3. Kontrollera webbläsarkonsol för CORS-fel
4. Starta om frontend: `podman compose -f compose.dev.yml restart frontend`

### Port redan i användning

**Problem:** "Address already in use"-fel

**Lösningar:**

1. Kontrollera vad som använder porten:

   ```bash
   # macOS/Linux
   lsof -i :5173  # eller :3000, :1521

   # Döda processen
   kill -9 <PID>
   ```

2. Ändra port i `compose.dev.yml`:
   ```yaml
   ports:
     - '5174:5173' # Använd 5174 istället
   ```

### Ändringar visas inte

**Problem:** Kodändringar visas inte i applikationen

**Lösningar:**

1. Kontrollera att filen monteras korrekt:
   ```bash
   podman compose -f compose.dev.yml config
   ```
2. Hård uppdatering i webbläsare: Ctrl+Shift+R (Cmd+Shift+R på Mac)
3. Starta om tjänsten:
   ```bash
   podman compose -f compose.dev.yml restart frontend
   ```
4. Kontrollera att volume-monteringar är read-only (`:ro`) i `compose.dev.yml`

### Oracle Instant Client-fel (Backend)

**Problem:** "Error: DPI-1047: Cannot locate a 64-bit Oracle Client library"

**Lösningar:**

1. Bygg om backend-container:
   ```bash
   podman compose -f compose.dev.yml build --no-cache backend-api
   podman compose -f compose.dev.yml up -d backend-api
   ```
2. Kontrollera Oracle Instant Client-installation i container:
   ```bash
   podman exec tillgang-backend-dev ls -la /opt/oracle/instantclient_21_13
   ```

### Ren start (nukleär lösning)

Om allt är trasigt, starta om från början:

```bash
# Stoppa och ta bort allt
podman compose -f compose.dev.yml down -v

# Ta bort alla relaterade containers, volumes, nätverk
podman system prune -a --volumes

# Starta från början
podman compose -f compose.dev.yml up -d
```

## Produktionsdistribution

### Använda produktions Compose-fil

```bash
# Sätt produktionsmiljövariabler
cp .env.example .env.production
# Redigera .env.production med produktionsvärden

# Starta produktionsstack
podman compose -f compose.prod.yml --env-file .env.production up -d

# Övervaka
podman compose -f compose.prod.yml logs -f
```

### Produktionschecklista

- [ ] Ändra alla standardlösenord i `.env`
- [ ] Sätt `NODE_ENV=production`
- [ ] Konfigurera korrekta SSL/TLS-certifikat
- [ ] Sätt upp brandväggsregler (exponera endast portar 80/443)
- [ ] Konfigurera regelbundna databassäkerhetskopior
- [ ] Sätt upp övervakning och loggning
- [ ] Granska resursbegränsningar i `compose.prod.yml`
- [ ] Använd sekretesshantering (Kubernetes secrets, HashiCorp Vault, etc.)
- [ ] Testa katastrofåterställningsprocedurer

### Produktionsskillnader

- Frontend serveras av Nginx (inte Vite dev server)
- Nginx proxar `/api/*` till backend (ingen CORS behövs)
- Ingen hot-reload eller dev tools
- Optimerade byggstorlekar
- Health checks aktiverade
- Resursbegränsningar tillämpade

## Ytterligare resurser

- [Database README](../database/README.md) - Databasschema och frågor
- [Backend README](../server/README.md) - API-dokumentation
- [Main README](../README.md) - Projektöversikt

## Få hjälp

Om du stöter på problem:

1. Kontrollera denna felsökningsguide
2. Granska loggar: `podman compose -f compose.dev.yml logs`
3. Sök efter befintliga issues på GitHub
4. Skapa ett nytt issue med:
   - Felmeddelanden
   - Steg för att återskapa
   - Loggutdata
   - Systeminformation

## Snabbreferens

### Viktiga kommandon

```bash
# Starta
podman compose -f compose.dev.yml up -d

# Stoppa (containers bort, data kvar)
podman compose -f compose.dev.yml down

# Loggar
podman compose -f compose.dev.yml logs -f

# Status
podman compose -f compose.dev.yml ps

# Bygg om
podman compose -f compose.dev.yml up -d --build

# Nystart (containers + volumes bort – all data borta)
podman compose -f compose.dev.yml down -v && \
podman compose -f compose.dev.yml up -d
```

### Tjänst-URL:er

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health: http://localhost:3000/health
- Oracle EM (valfritt, ofta ej tillgängligt i container): http://localhost:5500/em
