# Snabbstartsguide

Få igång applikationen på två sätt: **Standalone-läge** (enklast, ingen databas) eller **Fullständigt läge** (med databas och server).

## Snabbstart: Standalone-läge (rekommenderat för demo)

Det enklaste sättet att komma igång - kräver ingen databas eller server!

### Förutsättningar

- Node.js installerat
- npm installerat

### Steg

```bash
# 1. Gå till client-katalogen
cd client

# 2. Kopiera miljövariabler
cp .env.example .env.local

# 3. Aktivera standalone-läge
# Redigera .env.local och sätt:
# VITE_STANDALONE=true

# 4. Installera beroenden
npm install

# 5. Starta utvecklingsserver
npm run dev
```

Besök **http://localhost:5173** - klart! 🎉

**Obs:** I standalone-läge sparas all data i webbläsarens localStorage. Data är lokal för varje webbläsare/enhet.

---

## Fullständigt läge (med databas och server)

För produktionsliknande miljö med Oracle-databas och backend API.

### Förutsättningar

- Podman installerat
- 8GB+ RAM tillgängligt
- 20GB+ ledigt diskutrymme

**💻 Windows-användare?** Se [docs/WINDOWS_WSL_SETUP.md](docs/WINDOWS_WSL_SETUP.md) för detaljerade instruktioner om Podman Desktop eller WSL2.

**🍎 macOS-användare?** Efter installation av Podman måste du initiera och starta Podman Machine (eller starta Podman Desktop) innan du kör compose-kommandon. Se [docs/SETUP.md](docs/SETUP.md#macos-podman-desktop--podman-machine) för steg-för-steg (initiera, starta, resurser).

### Steg

#### 1. Konfigurera miljö

```bash
# Kopiera miljövariabelmall
cp .env.example .env

# VIKTIGT: Redigera .env och sätt lösenord
# ORACLE_PWD och DB_PASSWORD MÅSTE sättas (inga standardvärden av säkerhetsskäl)
# För lokal utveckling, använd valfria säkra lösenord
```

**⚠️ SÄKERHET:** Du MÅSTE sätta lösenord i `.env` innan du startar. Exempel:

```bash
ORACLE_PWD=MinSakraOracle123!
DB_PASSWORD=MinSakraApp456!
```

**Konfigurera frontend:**

```bash
# Kopiera frontend-konfiguration
cp client/.env.example client/.env.local
# Redigera client/.env.local för att anpassa logotyper, texter, länkar etc.
# (Kan användas med standardvärden, men filen måste finnas)
# 
# För standalone-läge: Sätt VITE_STANDALONE=true i client/.env.local
# (Då behöver du inte starta podman-containers)
```

#### 2. Starta tjänster

**Rekommenderat:** Använd dev-up-scriptet – det startar tjänsterna och väntar tills Database, API och Client är redo. Du får tydlig status (spinner medan tjänster startar, grön bock när redo) och slutligen URL:er samt kommandon för att stoppa.

```bash
./scripts/dev-up.sh
```

Scriptet kräver att `curl` och `nc` (netcat) finns installerade. Vid första starten kan Oracle ta 2–3 minuter.

**Standalone-läge:** Om `VITE_STANDALONE=true` är satt i `client/.env.local` kommer scriptet automatiskt att hoppa över podman-setup och bara starta frontend-servern.

**Manuellt:** Om du föredrar att starta utan scriptet:

```bash
# Starta alla containers
podman compose -f compose.dev.yml up -d

# Övervaka startloggar (rekommenderas vid första körningen)
podman compose -f compose.dev.yml logs -f
```

**Vänta på (vid manuell start):**

- Oracle: "DATABASE IS READY TO USE!" (~2-3 minuter vid första starten)
- Backend: "✅ Database connected successfully"
- Frontend: "Local: http://localhost:5173/"

#### 3. Öppna webbläsare

Besök: **http://localhost:5173**

Klart! 🎉

## Daglig användning

```bash
# Starta (rekommenderat: väntar tills alla tjänster är redo)
./scripts/dev-up.sh

# Eller starta utan att vänta på status
podman compose -f compose.dev.yml up -d

# Stoppa (containers tas bort, datavolumes behålls – nästa "up" återanvänder samma data)
podman compose -f compose.dev.yml down

# Visa loggar
podman compose -f compose.dev.yml logs -f

# Nystart från scratch (tar bort containers och alla datavolumes – all data försvinner)
podman compose -f compose.dev.yml down -v
podman compose -f compose.dev.yml up -d
```

**Alternativ:** Vill du bara stoppa utan att ta bort containers? Använd `podman compose -f compose.dev.yml stop`. Starta igen med `start` eller `up -d`.

## Åtkomstpunkter

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/reviews
- **Health Check:** http://localhost:3000/health
- **Oracle EM (valfritt):** http://localhost:5500/em – webbgränssnitt för databasen; ingår ofta inte i Oracle-containerbilder, använd sqlplus eller appen för dev.

## Felsökning

### Oracle startar inte

- Se till att du har 8GB+ RAM tillgängligt
- Vänta längre (~3-5 minuter vid första starten)
- Kontrollera loggar: `podman logs tillgang-oracle-dev`

### Backend kan inte ansluta

- Vänta tills Oracle är helt redo
- Starta om backend: `podman compose -f compose.dev.yml restart backend-api`

### Frontend visar nätverksfel

- Kontrollera att backend körs: `curl http://localhost:3000/health`
- Verifiera VITE_API_URL i .env: `http://localhost:3000/api`

### Starta om från början

```bash
podman compose -f compose.dev.yml down -v
podman system prune -a --volumes
podman compose -f compose.dev.yml up -d
```

## Mer dokumentation

- **Fullständig installationsguide:** [docs/SETUP.md](docs/SETUP.md)
- **Arkitektur:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API-referens:** [docs/API.md](docs/API.md)
- **Databasinfo:** [database/README.md](database/README.md)

## Utveckling

Kodändringar laddas om automatiskt:

- **Frontend:** Ändringar i `client/app/` → omedelbar uppdatering i webbläsaren
- **Backend:** Ändringar i `server/src/` → servern startar om automatiskt

Ingen behov av att bygga om containers för kodändringar!

## Miljövariabler - Översikt

Projektet använder tre olika `.env`-filer för olika ändamål:

### `.env` (root) - Container-orkestrering

**När:** Alltid vid användning av Podman Compose  
**Innehåller:** Databaslösenord, portar, grundläggande konfiguration  
**Krävs:** ✅ Ja, för att starta containers

### `server/.env` - Backend-utveckling

**När:** Lokal backend-utveckling utan containers  
**Innehåller:** Databasanslutning, CORS, server-konfiguration  
**Krävs:** Endast vid lokal backend-utveckling

### `client/.env.local` - Frontend-konfiguration

**När:** Alltid (även med containers)  
**Innehåller:** Applikationstitel, logotyper, footer-länkar, förifyllningskonfiguration  
**Krävs:** ✅ Ja, frontend kräver denna fil

**Regel:** För de flesta fall räcker root `.env`-filen!

## Nästa steg

1. Skapa din första granskning på http://localhost:5173
2. Utforska API:et på http://localhost:3000/api/reviews
3. Anslut till databasen med SQL Developer (localhost:1521/FREEPDB1)
   - **⚠️ VIKTIGT:** Oracle Database Free använder `FREEPDB1` som tjänstnamn
   - Användarnamn: `tillgang_user`
   - Lösenord: Värdet från `DB_PASSWORD` i `.env`
4. Läs den fullständiga dokumentationen i `docs/`

Behöver du hjälp? Kolla [docs/SETUP.md](docs/SETUP.md) för detaljerad felsökning.
