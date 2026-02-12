# Migreringsguide från Supabase till Oracle

Denna guide förklarar hur man migrerar befintlig data från Supabase (PostgreSQL) till den nya Oracle Database Free containeriserade installationen.

## Översikt

Applikationen har migrerats från:

- **Database:** Supabase (PostgreSQL) → Oracle Database Free 23ai
- **API:** Supabase auto-genererad → Anpassad Express REST API
- **Distribution:** Molntjänst → Självhostade containers

## Schemajämförelse

### Supabase (PostgreSQL) Schema

```sql
-- reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  title TEXT,
  "excludedContentTypes" TEXT,
  "objectType" TEXT,
  "regulatoryFramework" TEXT,
  "selectedPrefillIds" TEXT
);

-- checks table
CREATE TABLE checks (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  review INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  requirement TEXT,
  status INTEGER,
  comment TEXT,
  flag BOOLEAN DEFAULT FALSE,
  UNIQUE(review, requirement)
);
```

### Oracle Database Free Schema

```sql
-- reviews table
CREATE TABLE reviews (
  id NUMBER PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  title VARCHAR2(500),
  excluded_content_types VARCHAR2(2000),
  object_type VARCHAR2(50),
  regulatory_framework VARCHAR2(100),
  selected_prefill_ids VARCHAR2(2000)
);

-- checks table
CREATE TABLE checks (
  id NUMBER PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  review NUMBER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  requirement VARCHAR2(100),
  status NUMBER,
  comment CLOB,
  flag NUMBER(1) DEFAULT 0,
  UNIQUE(review, requirement)
);
```

## Viktiga skillnader

| Aspekt         | PostgreSQL | Oracle                      | Anteckningar                     |
| -------------- | ---------- | --------------------------- | -------------------------------- |
| Auto-increment | SERIAL     | NUMBER + SEQUENCE + TRIGGER | Oracle använder sekvenser        |
| Boolean        | BOOLEAN    | NUMBER(1)                   | 0=false, 1=true                  |
| Text           | TEXT       | VARCHAR2/CLOB               | Oracle har storleksbegränsningar |
| Kolumnnamn     | camelCase  | snake_case                  | Konventionsskillnad              |
| Tidsstämplar   | NOW()      | CURRENT_TIMESTAMP           | Funktionsnamn                    |

## Migreringssteg

### Steg 1: Exportera data från Supabase

#### Alternativ A: Använda Supabase Dashboard

1. Gå till Supabase dashboard
2. Navigera till "Table Editor"
3. Exportera varje tabell som CSV

#### Alternativ B: Använda pg_dump

```bash
# Hämta anslutningssträng från Supabase dashboard
pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
  --table=reviews --table=checks \
  --data-only --column-inserts \
  > supabase_data.sql
```

#### Alternativ C: Använda Supabase API

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function exportData() {
  // Exportera granskningar
  const { data: reviews } = await supabase.from('reviews').select('*');

  // Exportera kontroller
  const { data: checks } = await supabase.from('checks').select('*');

  fs.writeFileSync('reviews.json', JSON.stringify(reviews, null, 2));
  fs.writeFileSync('checks.json', JSON.stringify(checks, null, 2));
}

exportData();
```

### Steg 2: Transformera data

Skapa ett transformationsskript för att konvertera PostgreSQL-data till Oracle-format:

```javascript
// transform-data.js
const fs = require('fs');

// Läs exporterad data
const reviews = JSON.parse(fs.readFileSync('reviews.json'));
const checks = JSON.parse(fs.readFileSync('checks.json'));

// Transformera granskningar
const transformedReviews = reviews.map((review) => ({
  id: review.id,
  created_at: review.created_at,
  title: review.title,
  excluded_content_types: review.excludedContentTypes, // camelCase → snake_case
  object_type: review.objectType,
  regulatory_framework: review.regulatoryFramework,
  selected_prefill_ids: review.selectedPrefillIds,
}));

// Transformera kontroller
const transformedChecks = checks.map((check) => ({
  id: check.id,
  created_at: check.created_at,
  updated_at: check.updated_at,
  review: check.review,
  requirement: check.requirement,
  status: check.status,
  comment: check.comment,
  flag: check.flag ? 1 : 0, // boolean → number
}));

// Generera Oracle SQL INSERT-satser
function generateInserts(table, data) {
  const inserts = data.map((row) => {
    const columns = Object.keys(row).join(', ');
    const values = Object.values(row)
      .map((v) => {
        if (v === null) return 'NULL';
        if (typeof v === 'number') return v;
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        if (v instanceof Date) return `TIMESTAMP '${v.toISOString()}'`;
        return `'${v}'`;
      })
      .join(', ');
    return `INSERT INTO ${table} (${columns}) VALUES (${values});`;
  });
  return inserts.join('\n');
}

const reviewInserts = generateInserts('reviews', transformedReviews);
const checkInserts = generateInserts('checks', transformedChecks);

// Skriv till fil
fs.writeFileSync(
  'oracle-import.sql',
  `
-- Importskript för Oracle
-- Genererat från Supabase-export

${reviewInserts}

${checkInserts}

COMMIT;
`,
);

console.log('Genererat oracle-import.sql');
```

Kör skriptet:

```bash
node transform-data.js
```

### Steg 3: Importera till Oracle

#### Alternativ A: Använda SQL\*Plus

```bash
# Starta Oracle-container
podman compose -f compose.dev.yml up -d oracle-db

# Vänta tills databasen är redo
podman compose -f compose.dev.yml logs -f oracle-db
# Vänta på "DATABASE IS READY TO USE!"

# Kopiera importfil till container
podman cp oracle-import.sql tillgang-oracle-dev:/tmp/

# Importera data
podman exec -it tillgang-oracle-dev sqlplus tillgang_user/TillgangDev2026!@FREEPDB1 <<EOF
@/tmp/oracle-import.sql
EXIT;
EOF
```

#### Alternativ B: Använda SQL Developer

1. Anslut till Oracle:
   - Värd: localhost
   - Port: 1521
   - Tjänst: FREEPDB1
   - Användare: tillgang_user
   - Lösenord: TillgangDev2026!

**⚠️ VIKTIGT:** Oracle Database Free använder `FREEPDB1` som tjänstnamn (inte `XEPDB1` som används i Oracle XE).

2. Öppna `oracle-import.sql`
3. Kör som skript

### Steg 4: Verifiera data

```bash
# Anslut till Oracle
podman exec -it tillgang-oracle-dev sqlplus tillgang_user/TillgangDev2026!@FREEPDB1

# Verifiera antal
SELECT COUNT(*) FROM reviews;
SELECT COUNT(*) FROM checks;

# Verifiera exempeldata
SELECT * FROM reviews WHERE ROWNUM <= 5;
SELECT * FROM checks WHERE ROWNUM <= 5;

# Kontrollera relationer
SELECT r.id, r.title, COUNT(c.id) as check_count
FROM reviews r
LEFT JOIN checks c ON c.review = r.id
GROUP BY r.id, r.title;
```

### Steg 5: Testa applikationen

1. Starta alla tjänster:

   ```bash
   podman compose -f compose.dev.yml up -d
   ```

2. Öppna frontend: http://localhost:5173

3. Verifiera:
   - Alla granskningar är synliga
   - Kontroller laddas korrekt
   - Statistik är korrekt
   - Skapa nya granskningar fungerar
   - Uppdatera kontroller fungerar

## Frontend-ändringar

Frontend-koden har uppdaterats för att använda det nya REST API:et, men gränssnittet förblir detsamma:

### Före (Supabase)

```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
const { data } = await supabase.from('reviews').select('*');
```

### Efter (REST API)

```typescript
import { apiClient } from './apiClient';
const data = await apiClient.reviews.getAll();
```

**Inga ändringar behövs i React-komponenter** - `ReviewService`-gränssnittet förblir identiskt!

## API-mappning

### Supabase → Express API

| Supabase-operation                        | Nytt API-endpoint              |
| ----------------------------------------- | ------------------------------ |
| `from('reviews').select()`                | `GET /api/reviews`             |
| `from('reviews').select().eq('id', x)`    | `GET /api/reviews/:id`         |
| `from('reviews').insert()`                | `POST /api/reviews`            |
| `from('reviews').update()`                | `PUT /api/reviews/:id`         |
| `from('reviews').delete()`                | `DELETE /api/reviews/:id`      |
| `from('checks').select().eq('review', x)` | `GET /api/reviews/:id/checks`  |
| `from('checks').upsert()`                 | `POST /api/reviews/:id/checks` |

## Återställningsplan

Om migreringen misslyckas kan du snabbt återställa:

1. Stoppa nya containers:

   ```bash
   podman compose -f compose.dev.yml down
   ```

2. Återställ git-ändringar:

   ```bash
   git checkout main  # eller tidigare branch
   ```

3. Återställ Supabase-anslutning:
   - Uppdatera miljövariabler
   - Starta om gamla applikationen

## Prestandaöverväganden

### Supabase (Hanterad PostgreSQL)

- Automatiska säkerhetskopior
- Hanterade uppdateringar
- Inbyggd anslutningspoolning
- Real-time-prenumerationer

### Oracle Database Free (Självhostad)

- Manuella säkerhetskopior krävs
- Manuella uppdateringar
- Konfigurera anslutningspoolning i Sequelize
- Ingen real-time (kan lägga till WebSockets om det behövs)

## Kostnadsjämförelse

### Supabase

- Gratis nivå: 500MB databas, 2GB bandbredd
- Pro: $25/månad (8GB databas, 50GB bandbredd)
- Ytterligare: $0.125/GB databas, $0.09/GB bandbredd

### Oracle Database Free (Självhostad)

- Gratis programvarulicens (Express Edition)
- Endast infrastrukturkostnader (server/moln)
- Inga per-GB-avgifter
- Fullständiga Oracle-funktioner (inom XE-begränsningar)

## Felsökning av migrering

### Problem: Datatyper matchar inte

**Lösning:** Uppdatera transformationsskript för att hantera:

- Boolean → Number (0/1)
- NULL-hantering
- Strängescaping (enkla citattecken)
- Tidsstämpelformat

### Problem: Sekvenser är inte synkroniserade

Efter import med explicita ID:n, återställ sekvenser:

```sql
-- Hitta max ID
SELECT MAX(id) FROM reviews;
-- Om max är 100, sätt sekvens till 101
DROP SEQUENCE reviews_seq;
CREATE SEQUENCE reviews_seq START WITH 101;

-- Samma för checks
SELECT MAX(id) FROM checks;
DROP SEQUENCE checks_seq;
CREATE SEQUENCE checks_seq START WITH 201;
```

### Problem: Främmande nyckelöverträdelser

Se till att granskningar importeras före kontroller:

```sql
-- Importordning spelar roll!
-- 1. Infoga alla granskningar
INSERT INTO reviews ...
-- 2. Infoga sedan kontroller
INSERT INTO checks ...
```

### Problem: Teckenkodningsproblem

Sätt korrekt teckenuppsättning i anslutningen:

```javascript
// I database.ts
dialectOptions: {
  connectString: '...',
  charset: 'UTF8'
}
```

## Efter-migreringschecklista

- [ ] Alla granskningar importerade korrekt
- [ ] Alla kontroller importerade korrekt
- [ ] Främmande nyckelrelationer intakta
- [ ] Statistik beräknad korrekt
- [ ] Applikationen laddas utan fel
- [ ] Skapa ny data fungerar
- [ ] Uppdatera befintlig data fungerar
- [ ] Ta bort data fungerar
- [ ] Sekvenser är korrekt inställda
- [ ] Säkerhetskopieringsprocedur etablerad
- [ ] Övervakning konfigurerad

## Support

Om du stöter på problem under migreringen:

1. Kontrollera [SETUP.md](SETUP.md) felsökningssektion
2. Verifiera att Oracle-container är healthy
3. Kontrollera backend-loggar: `podman logs tillgang-backend-dev`
4. Granska databasschema: `DESC reviews; DESC checks;`
5. Testa API direkt: `curl http://localhost:3000/api/reviews`

## Framgångskriterier

Migreringen är klar när:
✅ All data synlig i Oracle
✅ Frontend laddas och visar data
✅ Alla CRUD-operationer fungerar
✅ Statistik är korrekt
✅ Inga konsolfel
✅ Tester passerar (om några)
