# Code Review Prompt för Gemini – efter senaste Oracle- och startfixar

## Projektkontext

**Tillgänglighetsverktyget** är en webbapplikation för att hantera tillgänglighetsgranskningar. Projektet har:

- **Databas:** Oracle (FREEPDB1), init via skript i `database/init/`
- **API:** Express REST API med Sequelize (Oracle-dialekt)
- **Körning:** Podman Compose (dev/prod)

## Granskningsstatus

**Detta är en granskning efter de senaste fixarna för Oracle-init, backend-startordning och typsäkerhet.**

Följande fem commits har lagts till och ska granskas särskilt:

1. **Fixa Express req.params-typ (string | string[]) i backend** – paramString-hjälp, användning i reviewController och validation
2. **Init-skript: robustare 000-create-user.sh** – DBMS_OUTPUT i block, felkontroll (ORA-00000/SP2), användar-/tabellverifiering, fallbacks
3. **Compose: healthcheck med appanvändare så backend väntar på init** – tillgang_user/DB_PASSWORD i healthcheck, start_period 300s, retries 20
4. **Backend: retry vid ORA-01109 och ORA-01017** – tillfälliga fel, retry tills init är klar
5. **Referens-schema: byt namn så containern inte kör 001-initial-schema** – 001-initial-schema.sql → .sql.reference, README/TROUBLESHOOTING uppdaterade

## Omfattning av de senaste ändringarna

### 1. Backend – Express params och typsäkerhet

- **Problem som åtgärdats:** `req.params.id` (och liknande) har typen `string | string[]` i Express, vilket gav TypeScript-fel vid `parseInt(id, 10)`.
- **Lösning:** Hjälpfunktionen `paramString(value: string | string[] | undefined): string` används överallt där params läses (reviewController, validation).
- **Filer:** `server/src/controllers/reviewController.ts`, `server/src/middleware/validation.ts`

### 2. Backend – getAllReviews vid tom tabell och felhantering

- **Problem som åtgärdats:** Fel vid anrop till GET /api/reviews när det inte finns några granskningar (t.ex. GROUP BY på tom tabell eller liknande).
- **Lösning:** Kortslutning med `Review.findOne({ attributes: ['id'], raw: true })` – om inget finns returneras `[]` utan att köra den aggregerade frågan. I dev returneras `detail` med felmeddelande i 500-svar.
- **Filer:** `server/src/controllers/reviewController.ts`

### 3. Init-skript – 000-create-user.sh

- **Problem som åtgärdats:** DBMS_OUTPUT.PUT_LINE utan PL/SQL-block (SQL\*Plus-fel), för bred ORA-felkontroll (inkl. ORA-00000), bräcklig verifiering av användare/tabeller (sqlplus-utdata med mellanslag/banners).
- **Lösning:**
  - DBMS_OUTPUT i `BEGIN ... END; /`
  - Felkontroll: endast ORA-XXXXX (exkl. ORA-00000), plus SP2-fel vid schema
  - Verifiering: grep på rader som ser ut som tal, trim, tail; fallback om loggen visar "User tillgang_user created successfully" / "Schema created successfully" och "Table created." så fortsätter skriptet i stället för att avbryta
- **Filer:** `database/init/000-create-user.sh`

### 4. Compose – healthcheck och startordning

- **Problem som åtgärdats:** Backend startade innan Oracle-init (användare/schema) var klar, vilket gav ORA-01017 eller ORA-01109 och krävde manuell omstart.
- **Lösning:** Healthcheck använder appanvändaren: `$$DB_USER/$$DB_PASSWORD@FREEPDB1` i stället för system. Backend har `depends_on: oracle-db: condition: service_healthy`. start_period 300s, retries 20.
- **Filer:** `compose.dev.yml`

### 5. Backend – databasanslutning och retry

- **Problem som åtgärdats:** ORA-01109 (database not open) och ORA-01017 (invalid credential) avbröt backend direkt; ORA-01017 kan uppstå under kort race medan init skriptet fortfarande körs.
- **Lösning:** Båda behandlas som tillfälliga fel med retry (samma exponential backoff som övriga). Efter maxRetries kastas fortfarande fel vid ORA-01017 med tydligt meddelande.
- **Filer:** `server/src/database/database.ts`

### 6. Referens-schema – undvika att containern kör 001-initial-schema

- **Problem som åtgärdats:** Containern körde `001-initial-schema.sql` utan anslutningssträng → ORA-12162 (TNS:net service name is incorrectly specified). Schemat skapas redan i 000-create-user.sh.
- **Lösning:** Filen bytt namn till `001-initial-schema.sql.reference` så att startskriptet inte kör den. README och TROUBLESHOOTING uppdaterade.
- **Filer:** `database/init/001-initial-schema.sql.reference` (ny), `database/init/001-initial-schema.sql` (borttagen), `database/README.md`, `database/init/TROUBLESHOOTING.md`

---

## Fokus för granskningen

### 1. Senaste fixarna – korrekthet och sidoeffekter

- Är `paramString` konsekvent använd överallt där `req.params` används till siffror/strängar? Finns kvarvarande `string | string[]`-problem?
- Är kortslutningen vid tom tabell i getAllReviews korrekt (ingen risk för felaktig tom array eller fel i andra fall)?
- Init-skript: Är ORA-filterna och fallbacks säkra (ingen falsk positiv/falsk negativ)? Är verifieringskommandona (USER_EXISTS, TABLES_COUNT) robusta på olika sqlplus-utdata?
- Healthcheck: Är kommandot och miljövariablerna (DB_USER/DB_PASSWORD) korrekt tillgängliga i oracle-db-containern? Kan healthcheck ge falskt positiv (t.ex. innan 000-create-user.sh kört)?
- Retry-logik: Är det rimligt att ORA-01017 retryas (t.ex. max antal försök, risk för att dölja verkligt fel lösenord)? Är loggmeddelandena tydliga?
- Referens-schema: Är det tydligt i dokumentationen att bara 000-create-user.sh skapar schemat och att .sql.reference är för manuell/referensbruk?

### 2. Säkerhet och bästa praxis

- Läcker några felmeddelanden (t.ex. `detail` i dev) känslig information i produktion?
- Är healthcheck-kommandot säkert (ingen lösenordsloggning, inget onödigt exponerat)?
- Init-skript: Hanteras lösenord och specialtecken säkert i CREATE USER / anslutningar?

### 3. Databas och API (befintlig + ny kod)

- Oracle-syntax (sequences, triggers, quoted identifiers) i 000-create-user.sh – stämmer det med Sequelize-modellerna?
- REST API: statuskoder, felformat, kantfall (tomma listor, null, ogiltiga id:n) – särskilt för GET /api/reviews och felvägar i reviewController.

### 4. Containrar och startordning

- Är start_period och retries tillräckliga för långsamma Oracle-starter? Finns risk för att backend ändå startar för tidigt eller för sent?
- Dokumentation (README, TROUBLESHOOTING, SETUP): Stämmer kommandon, filnamn (t.ex. 001-initial-schema.sql.reference) och beskrivningar med nuvarande beteende?

### 5. Kodkvalitet och underhåll

- TypeScript: Finns kvarvarande `any`, osäkra type assertions eller bristande null/undefined-hantering i de ändrade filerna?
- Felhantering: Är catch-block och loggning konsekventa och användbara för felsökning?
- Kommentarer och namn: Är de nya funktionerna (t.ex. paramString, retry-logik) tillräckligt beskrivna?

---

## Filer att granska (prioriterat)

**Högsta prioritet (senaste ändringar):**

- `server/src/controllers/reviewController.ts` – paramString, getAllReviews, felmeddelanden
- `server/src/middleware/validation.ts` – paramString
- `server/src/database/database.ts` – retry ORA-01109/ORA-01017
- `database/init/000-create-user.sh` – hela skriptet
- `compose.dev.yml` – healthcheck, depends_on
- `database/init/001-initial-schema.sql.reference` – att den är referens (containern kör den inte)
- `database/README.md`, `database/init/TROUBLESHOOTING.md` – filnamn och beskrivningar

**Relevanta (sammanhang):**

- `server/src/routes/reviewRoutes.ts` – användning av params/validation
- `server/src/database/CONFIG.ts` – DB\_\*-variabler
- `docs/SETUP.md` – Oracle/backend-start, miljövariabler

---

## Önskat utdataformat

Ange för varje fynd:

1. **Kritisk:** Säkerhet, dataförlust, krasch eller fel startordning som kan blockera deployment.
2. **Stor:** Felaktig logik, prestandaproblem, bristande felhantering som påverkar användare eller drift.
3. **Mindre:** Kodkvalitet, dokumentation, namngivning, möjliga förbättringar.
4. **Förslag:** Alternativ lösning, bästa praxis, förenklingar.

För varje punkt:

- **Fil och (om möjligt) rad**
- **Beskrivning**
- **Förslag till åtgärd**
- **Prioritet (Kritisk / Stor / Mindre / Förslag)**

Avsluta gärna med en kort sammanfattning: Är de senaste fixarna i linje med intentionen, och finns något som bör åtgärdas innan nästa release eller merge?

---

## Kontext som inte behöver granskas igen

- Tidigare code review-fixar (CORS, N+1, transaktioner, Joi, Helmet, Nginx non-root) – de antas fortfarande gälla.
- Frontend-specifika saker (API-klient, Zod, type assertions) – utom om de påverkas direkt av backend- eller miljöändringar.

Fokusera på **backend, Oracle-init, Compose/healthcheck och de senaste commitarna** enligt listan ovan.

---

**Notis:** Dokumentation och commit-meddelanden är på svenska; kod och kommentarer är på engelska/svenska. Granska tekniska beslut, säkerhet och korrekthet – språkval i UI/docs är sekundärt.
