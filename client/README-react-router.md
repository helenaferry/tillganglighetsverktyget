# Välkommen

## Kom igång

### Sätt upp env-variabler

Följ instruktionerna i `.env.local.example` filen.

### Installation

Installera dependencies:

```bash
npm install
```

### Development

Starta utvecklingsserver med HMR:

```bash
npm run dev
```

Applikationen blir tillgänglig på `http://localhost:5173`.

## Bygg för produktion

Skapa en produktions-bygge:

```bash
npm run build
```

Bygget skapas i `build/client/` (statiska filer) och `build/server/` (SSR server).

## Deployment

För deployment-information, se:

- **[QUICKSTART.md](../../QUICKSTART.md)** - Snabbstartsguide med Podman Compose
- **[docs/SETUP.md](../../docs/SETUP.md)** - Fullständig installationsguide
- **[compose.prod.yml](../../compose.prod.yml)** - Produktionskonfiguration

Applikationen är designad att köras som en del av en containeriserad stack med backend API och databas. Se huvudprojektets dokumentation för deployment-instruktioner.

## Styling

Detta projekt använder [Tailwind CSS](https://tailwindcss.com/) för styling tillsammans med Arbetsförmedlingens designsystem.
