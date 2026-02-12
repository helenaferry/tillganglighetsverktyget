# Databaskonfiguration

Denna katalog innehåller Oracle-databasens initialiseringsskript och dokumentation.

## Katalogstruktur

```
database/
├── init/
│   ├── 000-create-user.sh              # Skapar användare + schema (körs av containern)
│   └── 001-initial-schema.sql.reference  # Referens/manuell körning (körs INTE av containern)
└── README.md
```

## Databasschema

### Tabeller

#### reviews

Lagrar metadata för tillgänglighetsgranskningar.

| Kolumn                 | Typ            | Beskrivning                                              |
| ---------------------- | -------------- | -------------------------------------------------------- |
| id                     | NUMBER         | Primärnyckel (auto-increment)                            |
| created_at             | TIMESTAMP      | Skapad tidsstämpel                                       |
| title                  | VARCHAR2(500)  | Granskningsrubrik                                        |
| excluded_content_types | VARCHAR2(2000) | Semikolonseparerad lista över exkluderade innehållstyper |
| object_type            | VARCHAR2(50)   | Typ av objekt som granskas (web, doc, app)               |
| regulatory_framework   | VARCHAR2(100)  | Tillämpligt regelverk                                    |
| selected_prefill_ids   | VARCHAR2(2000) | Semikolonseparerad lista över prefill-ID:n               |

#### checks

Lagrar individuella tillgänglighetskravkontroller för varje granskning.

| Kolumn      | Typ           | Beskrivning                                                   |
| ----------- | ------------- | ------------------------------------------------------------- |
| id          | NUMBER        | Primärnyckel (auto-increment)                                 |
| created_at  | TIMESTAMP     | Skapad tidsstämpel                                            |
| updated_at  | TIMESTAMP     | Senaste uppdateringstidsstämpel (uppdateras automatiskt)      |
| review      | NUMBER        | Främmande nyckel till reviews.id                              |
| requirement | VARCHAR2(100) | Kravidentifierare                                             |
| status      | NUMBER        | Kontrollstatus (0=FAIL, 1=PASS, 2=IRRELEVANT, 3=NOT_ASSESSED) |
| comment     | CLOB          | Kommentar/anteckningar om kontrollen                          |
| flag        | NUMBER(1)     | Boolean-flagga (0 eller 1)                                    |

**Begränsningar:**

- Främmande nyckel: `checks.review` → `reviews.id` (ON DELETE CASCADE)
- Unik: (review, requirement) - förhindrar dubbletter av kontroller för samma krav i en granskning

### Index

- `idx_checks_review` - Index för främmande nyckel för joins
- `idx_checks_requirement` - Snabba kravsökningar
- `idx_checks_status` - Statusfiltrering
- `idx_reviews_created_at` - Sortering av granskningar efter datum

## Initialiseringsskript

Skripten i katalogen `init/` körs automatiskt när Oracle-containern startar för första gången. Endast körbara filer (t.ex. `.sh`) och vissa `.sql`-filer körs. Filer som slutar på `.sql.reference` ignoreras av Oracle-containerns startskript, vilket gör dem säkra att använda för dokumentations- och referensändamål.

### 000-create-user.sh

Detta skript (körs av containern):

1. Skapar applikationsanvändaren `tillgang_user` med lösenord från `DB_PASSWORD`
2. Skapar sekvenser, tabellerna `reviews` och `checks`, triggers och index

### 001-initial-schema.sql.reference

Referensversion av schemat för manuell körning eller dokumentation. Körs **inte** av containern. För manuell körning: `sqlplus tillgang_user/<password>@FREEPDB1 @001-initial-schema.sql.reference`

## Uppgifter

**Utvecklingsmiljö och Produktion:**

- Systemanvändare: `system` / `<ORACLE_PWD från .env>`
- Applikationsanvändare: `tillgang_user` / `<DB_PASSWORD från .env>`
- Databas: `FREEPDB1` (Pluggable Database)

**⚠️ VIKTIGT:** Oracle Database Free använder `FREEPDB1` som tjänstnamn (inte `XEPDB1` som används i Oracle XE).

**⚠️ SÄKERHET:**

- Inga standardlösenord finns - du MÅSTE sätta ORACLE_PWD och DB_PASSWORD i .env
- För produktion: Använd starka, unika lösenord och sekretesshantering
- Använd aldrig samma lösenord i utveckling och produktion

## Ansluta till databasen

### Från värdmaskinen

Med SQLPlus:

```bash
sqlplus tillgang_user/<DITT_DB_PASSWORD>@localhost:1521/FREEPDB1
```

Med SQL Developer:

- Värdnamn: `localhost`
- Port: `1521`
- Tjänstnamn: `FREEPDB1`
- Användarnamn: `tillgang_user`
- Lösenord: `<ditt DB_PASSWORD från .env>`

### Från containern

```bash
# Använd lösenordet du satte i .env
podman exec -it tillgang-oracle-dev sqlplus tillgang_user/<DITT_DB_PASSWORD>@FREEPDB1
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
podman exec tillgang-oracle-dev expdp tillgang_user/TillgangDev2026!@FREEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=tillgang_backup.dmp \
  logfile=tillgang_backup.log
```

### Importera data:

```bash
podman exec tillgang-oracle-dev impdp tillgang_user/TillgangDev2026!@FREEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=tillgang_backup.dmp \
  logfile=tillgang_import.log
```

## Migrering från Supabase

Om du har befintlig data i Supabase (PostgreSQL):

1. Exportera data från Supabase
2. Transformera dataformatet (tidsstämplar, booleska värden, etc.)
3. Använd SQL\*Loader eller bulk INSERT-satser
4. Verifiera dataintegritet

Kontakta utvecklingsteamet för migreringsskript om det behövs.
