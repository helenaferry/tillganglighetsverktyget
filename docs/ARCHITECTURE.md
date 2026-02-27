# Arkitekturdokumentation

## Översikt

Tillgänglighetsverktyget är en containeriserad webbapplikation för hantering av tillgänglighetsgranskningar. Den består av tre huvudkomponenter som körs i separata containers och kommunicerar över ett privat nätverk.

## Systemarkitektur

```
┌──────────────────────────────────────────────────────────────┐
│                     Podman Host                     │
│                                                             │
│  ┌──────────────────┐                                      │
│  │    Frontend      │                                      │
│  │   Container      │                                      │
│  │                  │                                      │
│  │  • React Router  │                                      │
│  │  • Vite (dev)    │                                      │
│  │  • Nginx (prod)  │                                      │
│  │  • Port: 5173    │                                      │
│  └────────┬─────────┘                                      │
│           │ HTTP/REST                                      │
│           ▼                                                │
│  ┌──────────────────┐                                      │
│  │    Backend       │                                      │
│  │   Container      │                                      │
│  │                  │                                      │
│  │  • Express API   │                                      │
│  │  • Sequelize ORM │                                      │
│  │  • TypeScript    │                                      │
│  │  • Port: 3000    │                                      │
│  └────────┬─────────┘                                      │
│           │ Oracle Protocol                                │
│           ▼                                                │
│  ┌──────────────────┐                                      │
│  │    Database      │                                      │
│  │   Container      │                                      │
│  │                  │                                      │
│  │  • Oracle Database Free 23ai │                                      │
│  │  • Port: 1521    │                                      │
│  │  • Volume Mount  │                                      │
│  └──────────────────┘                                      │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

## Komponentdetaljer

### Frontend Container

**Teknologistack:**

- React 19 med React Router 7
- TypeScript
- Vite (utveckling) / Nginx (produktion)
- TailwindCSS för styling
- Arbetsförmedlingens Design System

**Ansvar:**

- Användargränssnittsrendering
- Klientsidans routing
- API-kommunikation via REST
- Formulärvalidering
- Tillståndshantering

**Containerkonfiguration:**

- **Utveckling:** Node.js med Vite dev server
- **Produktion:** Multi-stage build med Nginx
- **Port:** 5173 (dev), 80 (prod)
- **Volume Mounts (dev):** Källkod för hot-reload

### Backend Container

**Teknologistack:**

- Node.js 20
- Express 5
- TypeScript
- Sequelize ORM
- Oracle Instant Client

**Ansvar:**

- REST API endpoints
- Affärslogik
- Datavalidering
- Databasanslutningshantering
- CORS-hantering

**API Endpoints:**

- `GET /api/reviews` - Lista alla granskningar
- `GET /api/reviews/:id` - Hämta en granskning
- `POST /api/reviews` - Skapa granskning
- `PUT /api/reviews/:id` - Uppdatera granskning
- `DELETE /api/reviews/:id` - Ta bort granskning
- `GET /api/reviews/:id/checks` - Hämta kontroller för granskning
- `POST /api/reviews/:reviewId/checks` - Upsert kontroll
- Plus bulk-operationer för kontroller

**Containerkonfiguration:**

- **Utveckling:** ts-node-dev för hot-reload
- **Produktion:** Kompilerad JavaScript
- **Port:** 3000
- **Volume Mounts (dev):** Källkod för hot-reload

### Database Container

**Teknologi:**

- Oracle Database Free 23ai

**Schema:**

- `reviews` tabell - Granskningsmetadata
- `checks` tabell - Individuella kravkontroller
- Sekvenser för auto-increment-ID:n
- Triggers för tidsstämplar

**Containerkonfiguration:**

- **Image:** Oracle officiella container registry
- **Port:** 1521 (databas), 5500 (Enterprise Manager Express, valfritt – ofta ej tillgängligt i container)
- **Volume:** Persisterande datalagring
- **Init Scripts:** Kör SQL automatiskt vid första starten

## Dataflöde

### Skapa en granskning

```
Användare → Frontend → Backend API → Database
 1. Fyll i formulär
 2. Skicka      → POST /api/reviews
                  3. Validera data
                  4. INSERT INTO reviews
                                  5. Lagra i Oracle
                  6. Returnera granskningsobjekt
 7. Visa ← 8. JSON-svar
```

### Visa granskningar

```
Användare → Frontend → Backend API → Database
 1. Navigera
 2. Begäran    → GET /api/reviews
                  3. Fråga granskningar & kontroller
                                  4. SELECT med JOINs
                  5. Beräkna statistik
                  6. Returnera sammanfattningar
 7. Rendera ← 8. JSON-svar
```

## Nätverksarkitektur

### Utveckling (compose.dev.yml)

```
┌─────────────────────────────────────────┐
│       tillgang-network-dev               │
│                                          │
│  frontend:5173 ←→ backend-api:3000     │
│                        ↕                 │
│                   oracle-db:1521         │
└─────────────────────────────────────────┘
         ↕
   Värdmaskin (portar exponerade)
   - 5173 → frontend
   - 3000 → backend-api
   - 1521 → oracle-db
   - 5500 → oracle-db (EM Express, om tillgängligt)
```

### Produktion (compose.prod.yml)

```
┌─────────────────────────────────────────┐
│       tillgang-network-prod             │
│                                          │
│  nginx:80 → /api/* → backend-api:3000   │
│                            ↕             │
│                       oracle-db:1521     │
└─────────────────────────────────────────┘
         ↕
   Värdmaskin (endast port 80 exponerad)
   - 80 → nginx (serverar frontend + proxar backend)
```

## Lagringsarkitektur

### Volumes

**oracle-data**

- Syfte: Persisterande databaslagring
- Plats: `/opt/oracle/oradata` i container
- Livscykel: Överlever containeromstarter/omskapningar
- Storlek: Växer med data (typiskt 2-10GB)

**Utvecklings Volume Mounts**

- Frontend: `./client/app` → `/app/app`
- Backend: `./server/src` → `/app/src`
- Syfte: Aktivera hot-reload utan att bygga om containers

## Säkerhetsarkitektur

### Utveckling

- Standardlösenord (acceptabelt för lokal utveckling)
- Alla portar exponerade för felsökning
- CORS aktiverat för localhost
- Ingen SSL/TLS
- Verbos loggning

### Produktion

- Miljöbaserade sekretess
- Endast port 80/443 exponerad
- CORS begränsat till specifika ursprung
- SSL/TLS-terminering vid nginx
- Resursbegränsningar tillämpade
- Icke-root containeranvändare
- Skrivskyddade filsystem där möjligt

## Distributionsarkitektur

### Container Images

**Frontend:**

- Dev: `node:20-slim` + källkodsmount
- Prod: Multi-stage (build + nginx runtime)

**Backend:**

- Dev: `node:20-slim` + Oracle Instant Client + källkodsmount
- Prod: Multi-stage (build + runtime med kompilerad JS)

**Database:**

- Båda: Officiell Oracle Database Free image från Oracle Container Registry

### Health Checks

**Oracle Database:**

```bash
sqlplus system/$ORACLE_PWD@FREEPDB1 -S "SELECT 1 FROM DUAL"
```

**Backend API:**

```bash
curl http://localhost:3000/health
```

**Frontend (prod):**

```bash
wget --spider http://localhost/
```

## Skalbarhetsöverväganden

### Nuvarande begränsningar

- Enskild databasinstans (ingen klustring)
- Enskild backendinstans (ingen lastbalansering)
- Tillståndsfulla sessioner i backend

### Framtida förbättringar

1. **Database:**
   - Oracle RAC för hög tillgänglighet
   - Läsrepliker för skalning av läsningar
   - Anslutningspooloptimering

2. **Backend:**
   - Flera backendrepliker
   - Lastbalanserare (nginx/HAProxy)
   - Tillståndslös autentisering (JWT)

3. **Frontend:**
   - CDN för statiska tillgångar
   - Nginx-cachning
   - Flera nginx-repliker

## Övervakning & Observerbarhet

### Loggar

- **Frontend:** Nginx access/error logs
- **Backend:** Applikationsloggar (console)
- **Database:** Oracle alert logs

Åtkomst via:

```bash
podman compose -f compose.dev.yml logs -f [service]
```

### Mätvärden (Framtid)

- Prometheus för mätvärdesinsamling
- Grafana för visualisering
- Oracle Enterprise Manager för DB-övervakning

### Health Endpoints

- Backend: `GET /health`
- Database: Health check i compose-fil
- Frontend: HTTP 200 på `/`

## Utvecklingsarbetsflöde

### Lokalt utvecklingsloop

1. Starta containers: `podman compose -f compose.dev.yml up -d`
2. Redigera kod i `client/app/` eller `server/src/`
3. Ändringar laddas om automatiskt (HMR för frontend, ts-node-dev för backend)
4. Testa i webbläsare på http://localhost:5173
5. Kontrollera loggar om det behövs
6. Committa ändringar

### Lägga till beroenden

**Frontend:**

```bash
cd client
npm install <package>
# Bygg om container för att installera i container
podman compose -f compose.dev.yml build frontend
podman compose -f compose.dev.yml up -d frontend
```

**Backend:**

```bash
cd server
npm install <package>
# Bygg om container för att installera i container
podman compose -f compose.dev.yml build backend-api
podman compose -f compose.dev.yml up -d backend-api
```

## Databasschema

### Entity Relationship Diagram

```
┌─────────────────────┐
│      reviews        │
│─────────────────────│
│ id (PK)            │
│ created_at          │
│ title               │
│ excluded_content... │
│ object_type         │
│ regulatory_frame... │
│ selected_prefill... │
└──────────┬──────────┘
           │ 1
           │
           │ N
┌──────────▼──────────┐
│      checks         │
│─────────────────────│
│ id (PK)            │
│ created_at          │
│ updated_at          │
│ review (FK)         │◄── ON DELETE CASCADE
│ requirement         │
│ status              │
│ comment             │
│ flag                │
└─────────────────────┘

UNIQUE(review, requirement)
```

### Status Enum

```typescript
enum Status {
  FAIL = 0,
  PASS = 1,
  IRRELEVANT = 2,
  NOT_ASSESSED = 3,
}
```

## API-arkitektur

### RESTful Design

- Resursbaserade URL:er
- HTTP-metoder (GET, POST, PUT, DELETE)
- JSON request/response
- Standard HTTP-statuskoder

### Felhantering

```json
{
  "error": "Felmeddelande",
  "status": 400,
  "details": "Valfria detaljer"
}
```

### Request/Response-exempel

**Skapa granskning:**

```http
POST /api/reviews
Content-Type: application/json

{
  "title": "Min granskning",
  "excludedContentTypes": ["video", "audio"],
  "objectType": "web",
  "regulatoryFramework": "dos",
  "selectedPrefillIds": ""
}

Response: 201 Created
{
  "id": 1,
  "created_at": "2026-01-23T10:00:00Z",
  "title": "Min granskning",
  ...
}
```

## Konfigurationshantering

### Miljövariabler

**Database:**

- `ORACLE_PWD` - Systemlösenord
- `DB_USER` - Applikationsanvändare
- `DB_PASSWORD` - Applikationslösenord

**Backend:**

- `NODE_ENV` - development/production
- `PORT` - Serverport
- `DB_HOST`, `DB_PORT`, `DB_SERVICE` - Databasanslutning

**Frontend:**

- `VITE_API_URL` - Backend API URL

### Konfigurationsfiler

- `.env` - Miljövariabler (gitignorerad)
- `.env.example` - Mall
- `compose.dev.yml` - Utvecklingsorkestrering
- `compose.prod.yml` - Produktionsorkestrering

## Säkerhetskopiering & Återställning

### Databassäkerhetskopiering

```bash
# Exportera (använd container-namn: tillgang-oracle-dev för dev, tillgang-oracle-prod för prod)
podman exec tillgang-oracle-dev expdp \
  tillgang_user/password@FREEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=backup.dmp

# Kopiera ut (DATA_PUMP_DIR-plats varierar; hitta filen t.ex. med: podman exec tillgang-oracle-dev find /opt/oracle -name "*.dmp" -mmin -5)
podman cp tillgang-oracle-dev:<sökväg-till-dumpfil> ./backup.dmp
```

### Volume-säkerhetskopiering

Podman har inte inbyggda `volume export`/`import`-kommandon. Använd tillfällig container med tar:

```bash
# Säkerhetskopiera volume (stoppa containern först om du behöver konsekvent data)
podman run --rm -v tillgang-oracle-data-dev:/data -v "$(pwd)":/backup ubuntu tar -czf /backup/oracle-data-backup.tar.gz -C /data .

# Återställ till nytt volume
podman volume create tillgang-oracle-data-dev-new
podman run --rm -v tillgang-oracle-data-dev-new:/data -v "$(pwd)":/backup ubuntu tar -xzf /backup/oracle-data-backup.tar.gz -C /data
```

## Teknologibeslut

### Varför Oracle Database Free?

- Krav från projektintressenter
- Gratis för utveckling
- Produktionsredo (med korrekt licensiering)
- Robust och mogen

### Varför Sequelize?

- TypeScript-stöd
- Oracle-dialektstöd
- Aktivt underhåll
- Bra dokumentation

### Varför Podman Compose?

- Enkel orkestrering
- Lätt lokal utveckling
- Produktionsredo
- Portabel mellan miljöer
