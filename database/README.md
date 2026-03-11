# Databaskonfiguration

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
