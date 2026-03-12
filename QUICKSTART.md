# Snabbstartsguide

I standalone-läge används localStorage istället för API/databas. Data sparas lokalt i webbläsaren och kräver ingen server eller databas. Perfekt för demo och enklare setup för mindre tekniska användare.
### Förutsättningar

- Node.js installerat
- npm installerat

### Steg

```bash
# 1. Gå till client-katalogen
cd client
```
1. Verifiera att STANDALONE_CLIENT är satt till true i config-filen i public/standaloneClient.js
2. Vill du starta klienten med ett par exempel-granskningar så sätt även USE_EXAMPLE_DATA till true
3. Kör:
```bash
 # Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev
```


Besök **http://localhost:5173** - klart! 🎉

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

#### 2. Starta tjänster

**Rekommenderat:** Använd dev-up-scriptet – det startar tjänsterna och väntar tills Database, API och Client är redo. Du får tydlig status (spinner medan tjänster startar, grön bock när redo) och slutligen URL:er samt kommandon för att stoppa.

```bash
./scripts/dev-up.sh
```

Scriptet kräver att `curl` och `nc` (netcat) finns installerade. Vid första starten kan Oracle ta 2–3 minuter.

**Manuellt:** Om du föredrar att starta utan scriptet:
