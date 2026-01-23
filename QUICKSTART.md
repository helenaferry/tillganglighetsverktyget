# Snabbstartsguide

Få igång applikationen i 3 steg!

## Förutsättningar

- Podman eller Docker installerat
- 8GB+ RAM tillgängligt
- 20GB+ ledigt diskutrymme

## Steg

### 1. Konfigurera miljö

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

### 2. Starta tjänster

```bash
# Starta alla containers
podman compose -f compose.dev.yml up -d

# Övervaka startloggar (rekommenderas vid första körningen)
podman compose -f compose.dev.yml logs -f
```

**Vänta på:**
- Oracle: "DATABASE IS READY TO USE!" (~2-3 minuter vid första starten)
- Backend: "✅ Database connected successfully"
- Frontend: "Local: http://localhost:5173/"

### 3. Öppna webbläsare

Besök: **http://localhost:5173**

Klart! 🎉

## Daglig användning

```bash
# Starta
podman compose -f compose.dev.yml up -d

# Stoppa
podman compose -f compose.dev.yml down

# Visa loggar
podman compose -f compose.dev.yml logs -f

# Nystart (tar bort all data)
podman compose -f compose.dev.yml down -v
podman compose -f compose.dev.yml up -d
```

## Åtkomstpunkter

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/reviews
- **Health Check:** http://localhost:3000/health
- **Oracle EM:** http://localhost:5500/em (användare: system, lösenord från .env)

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

## Nästa steg

1. Skapa din första granskning på http://localhost:5173
2. Utforska API:et på http://localhost:3000/api/reviews
3. Anslut till databasen med SQL Developer (localhost:1521/XEPDB1)
4. Läs den fullständiga dokumentationen i `docs/`

Behöver du hjälp? Kolla [docs/SETUP.md](docs/SETUP.md) för detaljerad felsökning.
