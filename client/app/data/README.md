# Data Layer

Denna mapp innehåller all datahantering för klienten. Applikationen använder en REST API-backend för att hantera granskningar och kontroller.

## Arkitektur

- **apiClient.ts** - Generisk HTTP-klient för REST API-anrop till backend
- **requirementService.ts** - Hämtar krav från extern källa (JSON)
- **reviewService.ts** - Hanterar granskningar och kontroller via REST API
- **types.ts** - Delade TypeScript-typer för data

## API-konfiguration

Backend-API:et konfigureras via miljövariabeln `VITE_API_URL`:

- Development: `http://localhost:3000/api` (standard)
- Production: `/api` (nginx proxar till backend)

Kravdata hämtas från URL:en i `VITE_REQUIREMENTS_URL` (extern JSON-fil).

## Service Layer

Alla API-anrop ska gå genom service-lagret:

- **ReviewService** - Använder `apiClient` för att interagera med backend
- **RequirementService** - Hämtar krav från extern källa

Service-lagret används sedan av React-hooks (t.ex. `useReviewData`, `useRequirementData`) som inte har kännedom om den underliggande API-implementationen.

## Typer

- **types.ts** - Definierar alla delade typer (Review, Check, Requirement, etc.)
- Typer exporteras med alias för att minska beroendet till specifik backend-implementation
- Säkerställ att inga andra delar av applikationen pratar direkt med API-klienten utanför service-lagret

## Databasschema

Backend använder Oracle Database Free. För information om databasschemat och schemaändringar, se:

- `database/README.md` - Databasschema och struktur
- `server/src/models/` - Sequelize-modeller som mappar till databasen

Schemaändringar görs på backend/server-sidan, inte i klienten.
