# Databaskonfiguration

Denna katalog innehåller Oracle-databasens initialiseringsskript och dokumentation.

## Katalogstruktur

```
database/
├── init/
│   └── 001-initial-schema.sql   # Initialt databasschema
└── README.md                     # Denna fil
```

## Databasschema

### Tabeller

#### reviews
Lagrar metadata för tillgänglighetsgranskningar.

| Kolumn | Typ | Beskrivning |
|--------|------|-------------|
| id | NUMBER | Primärnyckel (auto-increment) |
| created_at | TIMESTAMP | Skapad tidsstämpel |
| title | VARCHAR2(500) | Granskningsrubrik |
| excluded_content_types | VARCHAR2(2000) | Semikolonseparerad lista över exkluderade innehållstyper |
| object_type | VARCHAR2(50) | Typ av objekt som granskas (web, doc, app) |
| regulatory_framework | VARCHAR2(100) | Tillämpligt regelverk |
| selected_prefill_ids | VARCHAR2(2000) | Semikolonseparerad lista över prefill-ID:n |

#### checks
Lagrar individuella tillgänglighetskravkontroller för varje granskning.

| Kolumn | Typ | Beskrivning |
|--------|------|-------------|
| id | NUMBER | Primärnyckel (auto-increment) |
| created_at | TIMESTAMP | Skapad tidsstämpel |
| updated_at | TIMESTAMP | Senaste uppdateringstidsstämpel (uppdateras automatiskt) |
| review | NUMBER | Främmande nyckel till reviews.id |
| requirement | VARCHAR2(100) | Kravidentifierare |
| status | NUMBER | Kontrollstatus (0=FAIL, 1=PASS, 2=IRRELEVANT, 3=NOT_ASSESSED) |
| comment | CLOB | Kommentar/anteckningar om kontrollen |
| flag | NUMBER(1) | Boolean-flagga (0 eller 1) |

**Begränsningar:**
- Främmande nyckel: `checks.review` → `reviews.id` (ON DELETE CASCADE)
- Unik: (review, requirement) - förhindrar dubbletter av kontroller för samma krav i en granskning

### Index

- `idx_checks_review` - Index för främmande nyckel för joins
- `idx_checks_requirement` - Snabba kravsökningar
- `idx_checks_status` - Statusfiltrering
- `idx_reviews_created_at` - Sortering av granskningar efter datum

## Initialiseringsskript

Skripten i katalogen `init/` körs automatiskt när Oracle-containern startar för första gången. De måste namnges med numeriskt prefix för att kontrollera körningsordningen.

### 001-initial-schema.sql

Detta skript:
1. Skapar applikationsanvändaren `tillgang_user`
2. Skapar sekvenser för auto-increment-ID:n
3. Skapar tabellerna `reviews` och `checks`
4. Konfigurerar triggers för auto-increment och tidsstämpeluppdateringar
5. Skapar index för prestanda
6. Beviljar nödvändiga behörigheter

## Standarduppgifter

**Utvecklingsmiljö:**
- Systemanvändare: `system` / `<ORACLE_PWD från .env>`
- Applikationsanvändare: `tillgang_user` / `TillgangDev2026!`
- Databas: `XEPDB1` (Pluggable Database)

**⚠️ Produktion:** Ändra alla lösenord och använd sekretesshantering!

## Ansluta till databasen

### Från värdmaskinen

Med SQLPlus:
```bash
sqlplus tillgang_user/TillgangDev2026!@localhost:1521/XEPDB1
```

Med SQL Developer:
- Värdnamn: `localhost`
- Port: `1521`
- Tjänstnamn: `XEPDB1`
- Användarnamn: `tillgang_user`
- Lösenord: `TillgangDev2026!`

### Från containern

```bash
podman exec -it oracle-db sqlplus tillgang_user/TillgangDev2026!@XEPDB1
```

## Vanliga frågor

### Kontrollera tabellstruktur:
```sql
SELECT table_name FROM user_tables;
DESC reviews;
DESC checks;
```

### Visa data:
```sql
SELECT * FROM reviews;
SELECT * FROM checks;
```

### Återställ databas (endast utveckling):
```sql
DELETE FROM checks;
DELETE FROM reviews;
COMMIT;
```

## Säkerhetskopiering och återställning

### Exportera data:
```bash
podman exec oracle-db expdp tillgang_user/TillgangDev2026!@XEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=tillgang_backup.dmp \
  logfile=tillgang_backup.log
```

### Importera data:
```bash
podman exec oracle-db impdp tillgang_user/TillgangDev2026!@XEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=tillgang_backup.dmp \
  logfile=tillgang_import.log
```

## Migrering från Supabase

Om du har befintlig data i Supabase (PostgreSQL):

1. Exportera data från Supabase
2. Transformera dataformatet (tidsstämplar, booleska värden, etc.)
3. Använd SQL*Loader eller bulk INSERT-satser
4. Verifiera dataintegritet

Kontakta utvecklingsteamet för migreringsskript om det behövs.
