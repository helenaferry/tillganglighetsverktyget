# Frontend - Client

Frontend-applikation för Tillgänglighetsverktyget.

## Snabbstart

### Standardläge (med API och databas)
1. Verifiera att STANDALONE_CLIENT är satt till false i config-filen i public/standaloneClient.js
2. Kör: 
```bash
# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev
```

### Standalone-läge (endast frontend, ingen databas)
I standalone-läge används localStorage istället för API/databas. Data sparas lokalt i webbläsaren och kräver ingen server eller databas. Perfekt för demo och enklare setup för mindre tekniska användare.

1. Verifiera att STANDALONE_CLIENT är satt till true i config-filen i public/standaloneClient.js
2. Vill du starta klienten med ett par exempel-granskningar så sätt även USE_EXAMPLE_DATA till true
3. Kör: 
```bash
 # Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev
```

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

