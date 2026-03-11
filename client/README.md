# Frontend - Client

Frontend-applikation för Tillgänglighetsverktyget.

## Snabbstart

### Standardläge (med API och databas)

```bash
# Kopiera miljövariabler
cp .env.example .env.local

# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev
```

### Standalone-läge (endast frontend, ingen databas)

För snabbare setup utan behov av Podman och databas:

```bash
# Kopiera miljövariabler
cp .env.example .env.local

# Aktivera standalone-läge
# Redigera .env.local och sätt:
# VITE_STANDALONE=true

# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev
```

I standalone-läge används localStorage istället för API/databas. Data sparas lokalt i webbläsaren och kräver ingen server eller databas. Perfekt för demo och enklare setup för mindre tekniska användare.

**Obs:** Data i standalone-läge är specifik för varje webbläsare och dator. Data delas inte mellan olika enheter.

### Exempeldata i standalone-läge

För att automatiskt importera exempeldata vid första körningen:

```bash
# Aktivera både standalone-läge och exempeldata
# Redigera .env.local och sätt:
# VITE_STANDALONE=true
# VITE_USE_EXAMPLE_DATA=true
```

När båda variablerna är `true` och localStorage är tom, kommer applikationen automatiskt att importera två exempelgranskningar med förifyllda kontroller vid första användningen. Detta är användbart för demo och för att visa applikationens funktionalitet direkt.

**Viktigt:**

- Exempeldata importeras endast om localStorage är tom (överskriver inte befintlig data)
- Fungerar endast när `VITE_STANDALONE=true`
- Data importeras vid första användning av applikationen (lazy loading)

## Miljövariabler

Applikationen kräver att `.env.local` finns. Kopiera från `.env.example` och anpassa efter behov.

```bash
cp .env.example .env.local
```

Se `.env.example` för dokumentation om alla tillgängliga variabler.

### Standalone-läge

Sätt `VITE_STANDALONE=true` i `.env.local` för att köra applikationen utan server/databas. I detta läge:

- Data sparas i webbläsarens localStorage
- Ingen server eller databas krävs
- Perfekt för demo och enklare setup
- Data är lokal för varje webbläsare/enhet

### Exempeldata

Sätt `VITE_USE_EXAMPLE_DATA=true` i `.env.local` för att automatiskt importera exempeldata vid första körningen (kräver `VITE_STANDALONE=true`):

- Importerar två exempelgranskningar med förifyllda kontroller
- Fungerar endast om localStorage är tom (överskriver inte befintlig data)
- Användbart för demo och snabb onboarding

## Scripts

### Utveckling

```bash
npm run dev          # Starta utvecklingsserver (port 5173)
npm run build        # Bygg för produktion
npm start            # Starta produktionsserver
```

### Kodkvalitet

```bash
npm run lint         # Kör linter
npm run lint-fix     # Fixa linter-problem automatiskt
npm run format       # Formatera kod med Prettier
npm run typecheck    # TypeScript type-checking
```

### Tester

```bash
npm test             # Kör tester i watch-läge
npm run test:run     # Kör alla tester en gång
npm run test:coverage # Kör tester med coverage-rapport
npm run test:ui      # Öppna interaktiv test-UI
```

Se [../docs/TESTING.md](../docs/TESTING.md) för fullständig testdokumentation.

### Minify-verktyg

Dessa verktyg extraherar och minifierar JSON-konfiguration från `.env.local`:

## Teknisk Stack

- **React Router 7** - Routing och server-side rendering
- **TypeScript** - Typsäkerhet
- **Vite** - Byggverktyg och dev-server
- **Tailwind CSS 4** - Styling
- **i18next** - Internationalisering
- **@designsystem-se/af** - Arbetsförmedlingens designsystem

