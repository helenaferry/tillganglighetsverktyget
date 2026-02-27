# API-dokumentation

Base URL: `http://localhost:3000/api` (utveckling)

## Autentisering

För närvarande är ingen autentisering implementerad. Alla endpoints är publikt tillgängliga.

## Vanliga svarskoder

- `200 OK` - Lyckad GET/PUT-begäran
- `201 Created` - Lyckad POST-begäran
- `204 No Content` - Lyckad DELETE-begäran
- `400 Bad Request` - Ogiltig input
- `404 Not Found` - Resurs hittades inte
- `500 Internal Server Error` - Serverfel

## Endpoints

### Health Check

#### GET /health

Kontrollera om API-servern körs.

**Svar:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T10:00:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

---

### Granskningar

#### GET /api/reviews

Hämta alla granskningar med sammanfattningsstatistik.

**Svar:**
```json
[
  {
    "id": 1,
    "created_at": "2026-01-23T10:00:00.000Z",
    "title": "Exempelgranskning",
    "excludedContentTypes": "video;audio",
    "objectType": "web",
    "regulatoryFramework": "dos",
    "selectedPrefillIds": "prefill1;prefill2",
    "latestUpdate": "2026-01-23T12:00:00.000Z",
    "reviewedCount": 45,
    "passCount": 30,
    "failCount": 10,
    "irrelevantCount": 5
  }
]
```

#### GET /api/reviews/:id

Hämta en enskild granskning efter ID.

**Parametrar:**
- `id` (path) - Gransknings-ID

**Svar:**
```json
{
  "id": 1,
  "created_at": "2026-01-23T10:00:00.000Z",
  "title": "Exempelgranskning",
  "excludedContentTypes": "video;audio",
  "objectType": "web",
  "regulatoryFramework": "dos",
  "selectedPrefillIds": "prefill1;prefill2"
}
```

#### POST /api/reviews

Skapa en ny granskning.

**Request Body:**
```json
{
  "title": "Min nya granskning",
  "excludedContentTypes": ["video", "audio"],
  "objectType": "web",
  "regulatoryFramework": "dos",
  "selectedPrefillIds": "prefill1"
}
```

**Svar:** `201 Created`
```json
{
  "id": 2,
  "created_at": "2026-01-23T10:00:00.000Z",
  "title": "Min nya granskning",
  "excludedContentTypes": "video;audio",
  "objectType": "web",
  "regulatoryFramework": "dos",
  "selectedPrefillIds": "prefill1"
}
```

#### PUT /api/reviews/:id

Uppdatera en befintlig granskning.

**Parametrar:**
- `id` (path) - Gransknings-ID

**Request Body:**
```json
{
  "title": "Uppdaterad rubrik",
  "excludedContentTypes": ["video"],
  "objectType": "web",
  "regulatoryFramework": "dos",
  "selectedPrefillIds": ""
}
```

**Svar:** `200 OK`
```json
{
  "id": 1,
  "created_at": "2026-01-23T10:00:00.000Z",
  "title": "Uppdaterad rubrik",
  "excludedContentTypes": "video",
  "objectType": "web",
  "regulatoryFramework": "dos",
  "selectedPrefillIds": ""
}
```

#### DELETE /api/reviews/:id

Ta bort en granskning (och alla dess kontroller via cascade).

**Parametrar:**
- `id` (path) - Gransknings-ID

**Svar:** `204 No Content`

---

### Kontroller

#### GET /api/reviews/:id/checks

Hämta alla kontroller för en specifik granskning.

**Parametrar:**
- `id` (path) - Gransknings-ID

**Svar:**
```json
[
  {
    "id": 1,
    "created_at": "2026-01-23T10:00:00.000Z",
    "updated_at": "2026-01-23T11:00:00.000Z",
    "review": 1,
    "requirement": "req-1.1.1",
    "status": 1,
    "comment": "Alla bilder har alt-text",
    "flag": 0
  }
]
```

**Statusvärden:**
- `0` - FAIL
- `1` - PASS
- `2` - IRRELEVANT
- `3` - NOT_ASSESSED

#### GET /api/reviews/:reviewId/checks/:requirementId

Hämta en specifik kontroll efter krav-ID.

**Parametrar:**
- `reviewId` (path) - Gransknings-ID
- `requirementId` (path) - Krav-ID

**Svar:** `200 OK` eller `404 Not Found`
```json
{
  "id": 1,
  "created_at": "2026-01-23T10:00:00.000Z",
  "updated_at": "2026-01-23T11:00:00.000Z",
  "review": 1,
  "requirement": "req-1.1.1",
  "status": 1,
  "comment": "Alla bilder har alt-text",
  "flag": 0
}
```

#### POST /api/reviews/:reviewId/checks

Skapa eller uppdatera en kontroll (upsert).

**Parametrar:**
- `reviewId` (path) - Gransknings-ID

**Request Body:**
```json
{
  "requirement": "req-1.1.1",
  "status": 1,
  "comment": "Alla bilder har alt-text",
  "flag": 0
}
```

**Svar:** `200 OK`
```json
{
  "id": 1,
  "created_at": "2026-01-23T10:00:00.000Z",
  "updated_at": "2026-01-23T11:00:00.000Z",
  "review": 1,
  "requirement": "req-1.1.1",
  "status": 1,
  "comment": "Alla bilder har alt-text",
  "flag": 0
}
```

#### DELETE /api/reviews/checks/:id

Ta bort en specifik kontroll.

**Parametrar:**
- `id` (path) - Kontroll-ID

**Svar:** `204 No Content`

---

### Bulk-operationer

#### POST /api/reviews/:reviewId/checks/bulk-disable

Inaktivera (markera som irrelevant) flera kontroller.

**Parametrar:**
- `reviewId` (path) - Gransknings-ID

**Request Body:**
```json
{
  "requirements": ["req-1.2.1", "req-1.2.2", "req-1.2.3"]
}
```

**Svar:** `200 OK`
```json
[
  {
    "id": 2,
    "review": 1,
    "requirement": "req-1.2.1",
    "status": 2,
    "comment": "",
    "flag": 0
  }
]
```

#### POST /api/reviews/:reviewId/checks/bulk-enable

Aktivera (ta bort irrelevant status) flera kontroller.

**Parametrar:**
- `reviewId` (path) - Gransknings-ID

**Request Body:**
```json
{
  "requirements": ["req-1.2.1", "req-1.2.2"]
}
```

**Svar:** `204 No Content`

#### POST /api/reviews/:reviewId/checks/bulk-delete

Ta bort flera kontroller.

**Parametrar:**
- `reviewId` (path) - Gransknings-ID

**Request Body:**
```json
{
  "requirements": ["req-1.1.1", "req-1.1.2"]
}
```

**Svar:** `204 No Content`

#### POST /api/reviews/:reviewId/checks/bulk-prefill

Bulk skapa/uppdatera kontroller med fördefinierade värden.

**Parametrar:**
- `reviewId` (path) - Gransknings-ID

**Request Body:**
```json
{
  "prefills": [
    {
      "status": "PASS",
      "ids": ["req-1.1.1", "req-1.1.2"],
      "comment": "Automatiskt godkänd"
    },
    {
      "status": "IRRELEVANT",
      "ids": ["req-2.1.1"],
      "comment": "Ej tillämpligt"
    }
  ]
}
```

**Statusvärden:**
- `"PASS"` → 1
- `"FAIL"` → 0
- `"IRRELEVANT"` → 2
- `"NOT_ASSESSED"` → 3 (standard)

**Svar:** `200 OK`
```json
[
  {
    "id": 1,
    "review": 1,
    "requirement": "req-1.1.1",
    "status": 1,
    "comment": "Automatiskt godkänd",
    "flag": 0
  }
]
```

#### POST /api/reviews/:reviewId/checks/:requirementId/toggle-flag

Växla flaggan på en kontroll.

**Parametrar:**
- `reviewId` (path) - Gransknings-ID
- `requirementId` (path) - Krav-ID

**Request Body:**
```json
{
  "flag": true
}
```

**Svar:** `200 OK`
```json
{
  "id": 1,
  "review": 1,
  "requirement": "req-1.1.1",
  "status": 3,
  "comment": null,
  "flag": 1
}
```

---

## Felsvar

Alla fel följer detta format:

```json
{
  "error": "Felmeddelande",
  "message": "Valfritt detaljerat meddelande (endast dev)"
}
```

### Exempel

**404 Not Found:**
```json
{
  "error": "Review not found"
}
```

**400 Bad Request:**
```json
{
  "error": "requirements must be an array"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Detaljerat felmeddelande (endast utveckling)"
}
```

## Datatyper

### Review Object

```typescript
{
  id: number;
  created_at: string; // ISO 8601 timestamp
  title: string | null;
  excludedContentTypes: string | null; // Semikolonseparerad
  objectType: string | null; // 'web', 'doc', 'app'
  regulatoryFramework: string | null; // t.ex. 'WCAG 2.2 AA'
  selectedPrefillIds: string | null; // Semikolonseparerad
}
```

### Check Object

```typescript
{
  id: number;
  created_at: string; // ISO 8601 timestamp
  updated_at: string | null; // ISO 8601 timestamp
  review: number; // Främmande nyckel till review
  requirement: string | null; // Krav-ID
  status: number | null; // 0=FAIL, 1=PASS, 2=IRRELEVANT, 3=NOT_ASSESSED
  comment: string | null;
  flag: number | null; // 0 eller 1 (boolean)
}
```

### ReviewSummary Object

Utökar Review med ytterligare statistik:

```typescript
{
  ...Review,
  latestUpdate: string; // ISO 8601 timestamp för senaste kontrolluppdatering
  reviewedCount: number; // Kontroller med status != NOT_ASSESSED
  passCount: number; // Kontroller med status == PASS
  failCount: number; // Kontroller med status == FAIL
  irrelevantCount: number; // Kontroller med status == IRRELEVANT
}
```

## Hastighetsbegränsning

För närvarande inte implementerad.

## CORS

Utveckling: Tillåter alla ursprung
Produktion: Konfigurera via `ALLOWED_ORIGINS` miljövariabel

## Exempel med curl

### Skapa en granskning
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Webbplatsens tillgänglighetsgranskning",
    "excludedContentTypes": ["video"],
    "objectType": "web",
    "regulatoryFramework": "WCAG 2.2 AA",
    "selectedPrefillIds": ""
  }'
```

### Hämta alla granskningar
```bash
curl http://localhost:3000/api/reviews
```

### Skapa en kontroll
```bash
curl -X POST http://localhost:3000/api/reviews/1/checks \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "req-1.1.1",
    "status": 1,
    "comment": "Alla bilder har lämplig alt-text"
  }'
```

### Bulk prefill
```bash
curl -X POST http://localhost:3000/api/reviews/1/checks/bulk-prefill \
  -H "Content-Type: application/json" \
  -d '{
    "prefills": [
      {
        "status": "PASS",
        "ids": ["req-1.1.1", "req-1.2.1"],
        "comment": "Verifierad och godkänd"
      }
    ]
  }'
```
