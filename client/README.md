# Frontend - Client

Frontend-applikation för Tillgänglighetsverktyget.

## Snabbstart

```bash
# Kopiera miljövariabler
cp .env.example .env.local

# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev
```

## Miljövariabler

Applikationen kräver att `.env.local` finns. Kopiera från `.env.example` och anpassa efter behov.

```bash
cp .env.example .env.local
```

Se `.env.example` för dokumentation om alla tillgängliga variabler.

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

### Minify-verktyg

Dessa verktyg extraherar och minifierar JSON-konfiguration från `.env.local`:

```bash
npm run minify:additions   # Minifiera VITE_REQUIREMENT_ADDITIONS
npm run minify:footer      # Minifiera VITE_FOOTER_LINKS
npm run minify:prefill     # Minifiera VITE_PREFILL_REQUIREMENTS
```

**Användning:**
1. Redigera motsvarande variabel i `.env.local`
2. Kör relevant minify-script
3. Den minifierade JSON:en kopieras till urklipp
4. Klistra in där den behövs (t.ex. CI/CD-konfiguration)

**Exempel:**
```bash
# Redigera VITE_FOOTER_LINKS i .env.local med nya länkar
npm run minify:footer
# Kopiera från urklipp till deployment-config
```

## Teknisk Stack

- **React Router 7** - Routing och server-side rendering
- **TypeScript** - Typsäkerhet
- **Vite** - Byggverktyg och dev-server
- **Tailwind CSS 4** - Styling
- **i18next** - Internationalisering
- **@designsystem-se/af** - Arbetsförmedlingens designsystem

## Projektstruktur

```
client/
├── app/                      # React Router app
│   ├── components/           # React-komponenter
│   ├── data/                 # API-klienter och datahantering
│   ├── helpers/              # Hjälpfunktioner
│   ├── hooks/                # Custom React hooks
│   ├── lang/                 # i18n-filer
│   ├── routes/               # Route-komponenter
│   └── root.tsx              # Root-layout
├── public/                   # Statiska filer (logotyper, bilder)
├── .env.example              # Mall för miljövariabler
├── minifyEnv*.cjs            # Minify-verktyg för konfiguration
├── package.json              # Dependencies och scripts
├── react-router.config.ts    # React Router konfiguration
├── tsconfig.json             # TypeScript konfiguration
└── vite.config.ts            # Vite konfiguration
```

## API-integration

Frontend kommunicerar med backend via REST API. API-klienten finns i:

```typescript
// app/data/apiClient.ts
export const apiClient = {
  get: (path: string) => fetch(`${API_URL}${path}`),
  post: (path: string, data: any) => fetch(`${API_URL}${path}`, {...}),
  // ...
}
```

API URL konfigureras i `.env.local`:
```bash
VITE_API_URL=http://localhost:3000/api
```

## Utveckling i Container

Frontend kan köras både lokalt och i container:

**Lokal utveckling:**
```bash
npm run dev
# → http://localhost:5173
```

**Container-utveckling:**
```bash
# Från root-katalogen
docker compose -f compose.dev.yml up frontend
# → http://localhost:5173
```

Båda metoderna har hot module replacement (HMR) aktiverat.

## Byggprocess

### Utveckling
```bash
npm run dev
# Vite dev server med HMR
# Port 5173 (standard)
```

### Produktion
```bash
npm run build
# Bygger till build/client/ (statiska filer)
# och build/server/ (SSR server)

npm start
# Startar produktionsserver
```

### Container (Produktion)
```dockerfile
# Multi-stage build i Dockerfile.prod:
# 1. Bygg React-appen med Vite
# 2. Servera med Nginx
```

## Hot Module Replacement (HMR)

HMR fungerar både lokalt och i container tack vare:

```yaml
# compose.dev.yml
volumes:
  - ./client:/app              # Synka källkod
  - /app/node_modules          # Isolera node_modules
```

Ändringar i källkoden reflekteras omedelbart i webbläsaren.

## Felsökning

### Port redan används
```bash
# Hitta process som använder port 5173
lsof -i :5173

# Stoppa processen
kill -9 <PID>
```

### TypeScript-fel
```bash
# Kör type-checking
npm run typecheck

# Generera nya router-typer
npx react-router typegen
```

### HMR fungerar inte i container
```bash
# Kontrollera att volumes är korrekt monterade
docker compose -f compose.dev.yml config

# Starta om frontend-containern
docker compose -f compose.dev.yml restart frontend
```

### .env.local saknas
```bash
# Kopiera från mall
cp .env.example .env.local

# Verifiera att filen finns
ls -la .env.local
```

## Mer Information

- **Setup-guide:** [../docs/SETUP.md](../docs/SETUP.md)
- **API-dokumentation:** [../docs/API.md](../docs/API.md)
- **Arkitektur:** [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
