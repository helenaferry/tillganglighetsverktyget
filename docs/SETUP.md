# Installationsguide - Tillgänglighetsverktyget

Denna guide hjälper dig att få igång Tillgänglighetsverktyget med Docker-containers.

## Innehållsförteckning

1. [Förutsättningar](#förutsättningar)
2. [Arkitekturöversikt](#arkitekturöversikt)
3. [Snabbstart](#snabbstart)
4. [Utvecklingsarbetsflöde](#utvecklingsarbetsflöde)
5. [Åtkomst till applikationen](#åtkomst-till-applikationen)
6. [Databashantering](#databashantering)
7. [Felsökning](#felsökning)
8. [Produktionsdistribution](#produktionsdistribution)

**💻 Windows-användare:** Se [WINDOWS_WSL_SETUP.md](WINDOWS_WSL_SETUP.md) för specifika instruktioner om Docker Desktop eller WSL2-installation.

## Förutsättningar

### Nödvändig programvara

1. **Docker**
   - **macOS:** [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/) (rekommenderat)
   - **Linux:** Pakethanterare (t.ex. `sudo apt install docker.io docker-compose-plugin`) eller [Docker Engine](https://docs.docker.com/engine/install/)
   - **Windows:** Se [WINDOWS_WSL_SETUP.md](WINDOWS_WSL_SETUP.md) för detaljerad guide
   - Allmän info: https://docs.docker.com/get-docker/

2. **Docker Compose** (för orkestrering)
   - **macOS/Windows:** Ingår i Docker Desktop
   - **Linux:** `docker compose` är en plugin; installera `docker-compose-plugin` eller `docker-compose` (standalone)
   - Verifiera: `docker compose version`

3. **Git** (för att klona repositoryt)

### macOS: Docker Desktop

**⚠️ VIKTIGT för macOS-användare:** På macOS kör Docker containers via Docker Desktop. Starta Docker Desktop och säkerställ att den körs (ikon i menyn) innan du kör compose-kommandon.

**Resurser:** I Docker Desktop → Settings → Resources kan du ställa in minne (rekommenderat minst 8GB för Oracle), CPU och disk.

### Systemkrav

- **Minimum:** 8GB RAM tillgängligt för Docker, 20GB ledigt diskutrymme
- **Rekommenderat:** 16GB RAM totalt på värdmaskinen, 50GB ledigt diskutrymme
- **⚠️ VIKTIGT:** Oracle Database Free kräver minst 2GB RAM bara för sig själv. Med bara 2GB totalt kommer Oracle **inte** att fungera!
- Docker Desktop bör konfigureras med minst 8GB RAM

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
docker compose -f compose.dev.yml up -d

# Den första starten tar 5-10 minuter:
# - Hämtar Docker-images (~2GB för Oracle)
# - Oracle-databasinitialisering (~2-3 minuter)
# - Installerar npm-beroenden
```

### 3. Övervaka starten

```bash
# Titta på loggarna (särskilt viktigt vid första körningen)
docker compose -f compose.dev.yml logs -f

# Eller övervaka specifika tjänster
docker compose -f compose.dev.yml logs -f oracle-db
docker compose -f compose.dev.yml logs -f backend-api
docker compose -f compose.dev.yml logs -f frontend
```

**Vänta på dessa meddelanden:**
- Oracle: `DATABASE IS READY TO USE!`
- Backend: `✅ Database connected successfully`
- Frontend: Vite dev server redo

### 4. Verifiera att allt fungerar

```bash
# Kontrollera tjänststatus
docker compose -f compose.dev.yml ps

# Alla tjänster bör visa "healthy" eller "running"
# Oracle tar ~2-3 minuter att bli healthy
```

Öppna din webbläsare:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/health
- **Oracle EM:** http://localhost:5500/em (användare: `system`, lösenord: från `.env`)

## Miljövariabler - Komplett guide

Projektet använder tre separata `.env`-filer för att hålla konfiguration organiserad och tydlig.

### Översikt

| Fil | Syfte | När behövs | Känslig data |
|-----|-------|------------|--------------|
| `.env` (root) | Container-orkestrering | ✅ Alltid med Docker Compose | Ja (lösenord) |
| `server/.env` | Backend-utveckling | Endast lokal backend-utveckling | Ja (lösenord) |
| `client/.env.local` | Frontend-konfiguration | ✅ Alltid (krävs av frontend) | Nej |

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
docker compose -f compose.dev.yml up
```

**Scenario 2: Lokal backend**
```bash
docker compose -f compose.dev.yml up oracle-db  # Endast databas
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
docker compose -f compose.dev.yml up -d

# Stoppa och ta bort containers (datavolumes behålls – nästa "up" återanvänder samma data)
docker compose -f compose.dev.yml down

# Stoppa och ta bort containers + volumes (nystart från scratch – all data försvinner)
docker compose -f compose.dev.yml down -v
```

**Bara stoppa** (containers kvar, starta igen med `start` eller `up -d`): `docker compose -f compose.dev.yml stop`

### Compose-kommandon – stopp och data

| Kommando | Containers | Volumes / data | När du använder det |
|----------|------------|----------------|---------------------|
| `docker compose -f compose.dev.yml stop` | Stoppade, kvar | Kvar | Bara pausa – starta igen med `start` eller `up -d`. |
| `docker compose -f compose.dev.yml down` | Borttagna | Kvar | Stoppa och städa bort containers; datan (t.ex. Oracle) ligger kvar. Nästa `up` skapar nya containers som använder samma data. |
| `docker compose -f compose.dev.yml down -v` | Borttagna | Borttagna | Nystart från scratch – all data (inkl. databas) försvinner. Använd vid felsökning eller om du vill börja om. |

### Kodändringar

**Hot-Reload är aktiverat:**
- Frontend-ändringar i `client/app/` → Automatisk webbläsaruppdatering
- Backend-ändringar i `server/src/` → Automatisk serveromstart

Ingen behov av att bygga om containers för kodändringar!

### Visa loggar

```bash
# Alla tjänster
docker compose -f compose.dev.yml logs -f

# Specifik tjänst
docker compose -f compose.dev.yml logs -f backend-api

# Sista 100 raderna
docker compose -f compose.dev.yml logs --tail=100
```

### Starta om tjänster

```bash
# Starta om alla
docker compose -f compose.dev.yml restart

# Starta om specifik tjänst
docker compose -f compose.dev.yml restart backend-api
```

### Bygg om containers

Behövs endast om du ändrar:
- `package.json` beroenden
- `Dockerfile.dev`
- Grundkonfiguration

```bash
# Bygg om och starta om
docker compose -f compose.dev.yml up -d --build

# Bygg om specifik tjänst
docker compose -f compose.dev.yml build backend-api
docker compose -f compose.dev.yml up -d backend-api
```

## Åtkomst till applikationen

### Webbgränssnitt

| Tjänst | URL | Beskrivning |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Huvudapplikation |
| Backend API | http://localhost:3000/api/reviews | REST API |
| Health Check | http://localhost:3000/health | Backend-status |
| Oracle EM | http://localhost:5500/em | Databas webbgränssnitt |

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
docker exec -it tillgang-oracle-dev bash

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
docker compose -f compose.dev.yml down

# Ta bort databasvolume
docker volume rm tillgang-oracle-data-dev

# Starta igen (skapar om från början)
docker compose -f compose.dev.yml up -d
```

#### Säkerhetskopiera databas

```bash
# Exportera data
docker exec tillgang-oracle-dev expdp \
   tillgang_user/TillgangDev2026!@FREEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=tillgang_backup.dmp \
  logfile=tillgang_backup.log

# Kopiera dumpfil från container
# Sökvägen till dumpfilen beror på DATA_PUMP_DIR i Oracle (inga dpdump under /opt/oracle/admin/FREE/ i 23ai Free).
# Hitta filen efter expdp t.ex.: docker exec tillgang-oracle-dev find /opt/oracle -name "*.dmp" -mmin -5
docker cp tillgang-oracle-dev:<sökväg-till-tillgang_backup.dmp> ./backup.dmp
```

## Felsökning

### macOS/Windows: "Cannot connect to Docker daemon"

**Problem:** Felmeddelande vid körning av `docker compose`:
```
Cannot connect to the Docker daemon...
Error: Is the docker daemon running?
```

**Orsak:** Docker Desktop är inte startad (vanligt på macOS/Windows)

**Lösning:**
- **macOS/Windows:** Starta Docker Desktop från programmenyn och vänta tills den visar att den körs (ikon i menyn)
- **Linux:** Starta Docker-tjänsten: `sudo systemctl start docker` (eller `sudo service docker start`)

**Förebyggande:** Sätt Docker Desktop att starta vid inloggning (Settings → General → "Start Docker Desktop when you sign in")

### Oracle-container startar inte

**Problem:** Oracle-containern avslutas omedelbart eller misslyckas med health check

**Lösningar:**
1. Se till att minst 8GB RAM är tillgängligt
2. Kontrollera diskutrymme: `df -h`
3. Visa loggar: `docker logs tillgang-oracle-dev`
4. Försök med ren start:
   ```bash
   docker compose -f compose.dev.yml down -v
   docker compose -f compose.dev.yml up -d
   ```

### Backend kan inte ansluta till databasen

**Problem:** Backend visar "Unable to connect to the database"

**Lösningar:**
1. Vänta tills Oracle är healthy:
   ```bash
   docker compose -f compose.dev.yml ps
   ```
2. Kontrollera Oracle-loggar för "DATABASE IS READY TO USE"
3. Verifiera uppgifter i `.env` matchar databasen
4. Starta om backend efter att Oracle är redo:
   ```bash
   docker compose -f compose.dev.yml restart backend-api
   ```

### Frontend visar nätverksfel

**Problem:** Frontend kan inte nå backend API

**Lösningar:**
1. Kontrollera att backend körs: `curl http://localhost:3000/health`
2. Verifiera VITE_API_URL i `.env` eller `client/.env.example`
3. Kontrollera webbläsarkonsol för CORS-fel
4. Starta om frontend: `docker compose -f compose.dev.yml restart frontend`

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
     - "5174:5173"  # Använd 5174 istället
   ```

### Ändringar visas inte

**Problem:** Kodändringar visas inte i applikationen

**Lösningar:**
1. Kontrollera att filen monteras korrekt:
   ```bash
   docker compose -f compose.dev.yml config
   ```
2. Hård uppdatering i webbläsare: Ctrl+Shift+R (Cmd+Shift+R på Mac)
3. Starta om tjänsten:
   ```bash
   docker compose -f compose.dev.yml restart frontend
   ```
4. Kontrollera att volume-monteringar är read-only (`:ro`) i `compose.dev.yml`

### Oracle Instant Client-fel (Backend)

**Problem:** "Error: DPI-1047: Cannot locate a 64-bit Oracle Client library"

**Lösningar:**
1. Bygg om backend-container:
   ```bash
   docker compose -f compose.dev.yml build --no-cache backend-api
   docker compose -f compose.dev.yml up -d backend-api
   ```
2. Kontrollera Oracle Instant Client-installation i container:
   ```bash
   docker exec tillgang-backend-dev ls -la /opt/oracle/instantclient_21_13
   ```

### Ren start (nukleär lösning)

Om allt är trasigt, starta om från början:

```bash
# Stoppa och ta bort allt
docker compose -f compose.dev.yml down -v

# Ta bort alla relaterade containers, volumes, nätverk
docker system prune -a --volumes

# Starta från början
docker compose -f compose.dev.yml up -d
```

## Produktionsdistribution

### Använda produktions Compose-fil

```bash
# Sätt produktionsmiljövariabler
cp .env.example .env.production
# Redigera .env.production med produktionsvärden

# Starta produktionsstack
docker compose -f compose.prod.yml --env-file .env.production up -d

# Övervaka
docker compose -f compose.prod.yml logs -f
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
2. Granska loggar: `docker compose -f compose.dev.yml logs`
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
docker compose -f compose.dev.yml up -d

# Stoppa (containers bort, data kvar)
docker compose -f compose.dev.yml down

# Loggar
docker compose -f compose.dev.yml logs -f

# Status
docker compose -f compose.dev.yml ps

# Bygg om
docker compose -f compose.dev.yml up -d --build

# Nystart (containers + volumes bort – all data borta)
docker compose -f compose.dev.yml down -v && \
docker compose -f compose.dev.yml up -d
```

### Tjänst-URL:er

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health: http://localhost:3000/health
- Oracle EM: http://localhost:5500/em
