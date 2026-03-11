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

# 4. Om du vill förpopulera localStorage med exempelgranskningar
# Redigera .env.local och sätt:
# VITE_USE_EXAMPLE_DATA=true

# 5. Installera beroenden
npm install

# 6. Starta utvecklingsserver
npm run dev
```

Besök **http://localhost:5173** - klart! 🎉

**Obs:** I standalone-läge sparas all data i webbläsarens localStorage. Data är lokal för varje webbläsare/enhet.

---

## Fullständigt läge (med databas och server) - TODO: behöver uppdatera denna efter alla ändringar 

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

```