# Testguide - Tillgänglighetsverktyget

Denna guide beskriver hur du kör tester för Tillgänglighetsverktyget, både för frontend (client) och backend (server).

## Innehållsförteckning

1. [Översikt](#översikt)
2. [Frontend-tester (Client)](#frontend-tester-client)
3. [Backend-tester (Server)](#backend-tester-server)
4. [Kör alla tester](#kör-alla-tester)
5. [Coverage-rapporter](#coverage-rapporter)
6. [Felsökning](#felsökning)

## Översikt

Projektet använder **Vitest** som testramverk för både frontend och backend. Tester är organiserade i `__tests__`-kataloger nära den kod de testar.

### Teststruktur

```
client/
├── app/
│   ├── components/
│   │   └── __tests__/          # Komponenttester
│   ├── data/
│   │   └── __tests__/          # Data-lager tester
│   ├── helpers/
│   │   └── __tests__/          # Hjälpfunktionstester
│   └── hooks/
│       └── __tests__/          # Hook-tester
└── vitest.config.ts            # Frontend testkonfiguration

server/
├── src/
│   ├── logger/
│   │   └── __tests__/          # Logger-tester
│   └── middleware/
│       └── __tests__/          # Middleware-tester
└── vitest.config.ts            # Backend testkonfiguration
```

## Frontend-tester (Client)

### Förutsättningar

- Node.js installerat
- Beroenden installerade: `npm install` (från `client/`-katalogen)

### Kör tester

```bash
# Gå till client-katalogen
cd client

# Kör tester i watch-läge (rekommenderat för utveckling)
npm test

# Kör alla tester en gång
npm run test:run

# Kör tester med coverage-rapport
npm run test:coverage

# Kör tester med UI (interaktiv)
npm run test:ui
```

### Testkommandon

| Kommando | Beskrivning |
|----------|-------------|
| `npm test` | Startar Vitest i watch-läge - tester körs automatiskt vid filändringar |
| `npm run test:run` | Kör alla tester en gång och avslutar |
| `npm run test:coverage` | Kör tester och genererar coverage-rapport |
| `npm run test:ui` | Öppnar interaktiv UI för att köra och inspektera tester |

### Testtyper

Frontend-tester täcker:

- **Komponenttester**: React-komponenter med `@testing-library/react`
- **Data-lager tester**: API-klienter, localStorage-transformers, standalone-klient
- **Hjälpfunktionstester**: Formatering, utilities
- **Hook-tester**: Custom React hooks

### Exempel: Kör specifik testfil

```bash
# Kör endast en specifik testfil
npm test -- CardsOrTable.test.tsx

# Kör tester som matchar ett mönster
npm test -- CardsOrTable
```

## Backend-tester (Server)

### Förutsättningar

- Node.js installerat
- Beroenden installerade: `npm install` (från `server/`-katalogen)

### Kör tester

```bash
# Gå till server-katalogen
cd server

# Kör tester i watch-läge (rekommenderat för utveckling)
npm test

# Kör alla tester en gång
npm run test:run

# Kör tester med coverage-rapport
npm run test:coverage
```

### Testkommandon

| Kommando | Beskrivning |
|----------|-------------|
| `npm test` | Startar Vitest i watch-läge - tester körs automatiskt vid filändringar |
| `npm run test:run` | Kör alla tester en gång och avslutar |
| `npm run test:coverage` | Kör tester och genererar coverage-rapport |

### Testtyper

Backend-tester täcker:

- **Middleware-tester**: Request context extraction, header parsing
- **Logger-tester**: Audit logging functions, metadata generation

#### Request Context Middleware (`src/middleware/__tests__/requestContext.test.ts`)

Tester för middleware som extraherar användarcontext från HTTP-headers:

- `userId`-extraktion från olika header-varianter (CIAM_Sub, CIAM-Sub, case-insensitive)
- Fallback till `DEV_CIAM_SUB` i development-miljö
- `clientIp`-extraktion från `X-Forwarded-For`, `req.ip`, `req.socket.remoteAddress`
- Generering av unika `requestId`
- Attaching av komplett context till `req`

#### Logger Audit Functions (`src/logger/__tests__/logger.test.ts`)

Tester för audit logging-funktioner:

- `logReviewCreated`: Metadata, hantering av saknad `userId`, hantering av saknad titel
- `logReviewUpdated`: Loggning av endast ändrade fält, hoppa över när inga ändringar, hantering av null-värden, flera ändringar
- `logReviewDeleted`: Korrekt metadata
- `logCheckUpdated`: Skapande vs uppdatering, statusmappning till svensk text, hantering av null-status, okända krav-ID:n

### Exempel: Kör specifik testfil

```bash
# Kör endast en specifik testfil
npm test -- requestContext.test.ts

# Kör tester som matchar ett mönster
npm test -- logger
```

## Kör alla tester

För att köra alla tester i både frontend och backend:

```bash
# Från projektets root-katalog

# Frontend-tester
cd client && npm run test:run && cd ..

# Backend-tester
cd server && npm run test:run && cd ..
```

Eller med ett enkelt script:

```bash
# Kör frontend-tester
(cd client && npm run test:run)

# Kör backend-tester
(cd server && npm run test:run)
```

## Coverage-rapporter

### Frontend Coverage

```bash
cd client
npm run test:coverage
```

Coverage-rapporten genereras i `client/coverage/` och kan öppnas i webbläsaren:

```bash
# Öppna HTML-rapport (macOS)
open coverage/index.html

# Öppna HTML-rapport (Linux)
xdg-open coverage/index.html
```

### Backend Coverage

```bash
cd server
npm run test:coverage
```

Coverage-rapporten genereras i `server/coverage/` och kan öppnas i webbläsaren:

```bash
# Öppna HTML-rapport (macOS)
open coverage/index.html

# Öppna HTML-rapport (Linux)
xdg-open coverage/index.html
```

### Coverage-konfiguration

Coverage-inställningar finns i respektive `vitest.config.ts`:

- **Frontend**: `client/vitest.config.ts`
- **Backend**: `server/vitest.config.ts`

## Felsökning

### Tester hittar inte moduler

**Problem**: `Cannot find module` eller liknande import-fel.

**Lösning**: Kontrollera att:
1. Beroenden är installerade: `npm install`
2. TypeScript-konfigurationen är korrekt (`tsconfig.json`)
3. Vitest-konfigurationen är korrekt (`vitest.config.ts`)

### Mocking-problem i backend-tester

**Problem**: Winston-logger eller andra moduler mockas inte korrekt.

**Lösning**: 
- Kontrollera att mocks är definierade före import av moduler som använder dem
- Vitest hoistar `vi.mock()`-anrop, men funktioner måste definieras inuti factory-funktionen

### Tester körs inte automatiskt i watch-läge

**Problem**: Tester körs inte när filer ändras.

**Lösning**:
- Kontrollera att Vitest watch-läge är aktiverat (standard för `npm test`)
- Verifiera att filändringar sparas korrekt
- Starta om test-processen om nödvändigt

### Coverage-rapporten genereras inte

**Problem**: `npm run test:coverage` genererar ingen rapport.

**Lösning**:
- Kontrollera att `@vitest/coverage-v8` är installerat
- Verifiera coverage-konfiguration i `vitest.config.ts`
- Kontrollera att tester faktiskt körs (inga fel)

### TypeScript-fel i tester

**Problem**: TypeScript-typer fungerar inte i tester.

**Lösning**:
- Kontrollera `tsconfig.json`-inställningar
- Verifiera att `vitest.config.ts` refererar till korrekt TypeScript-konfiguration
- Kör `npm run typecheck` för att verifiera typer

## Ytterligare resurser

- **Vitest-dokumentation**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Projektets README**: [../README.md](../README.md)
- **Setup-guide**: [SETUP.md](SETUP.md)
