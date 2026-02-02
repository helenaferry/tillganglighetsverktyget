# Kom igång med tillgänglighetsverktyget

## Sätt upp env-variabler

Följ instruktionerna i [QUICKSTART.md](QUICKSTART.md) eller [docs/SETUP.md](docs/SETUP.md). Kopiera `.env.example` till `.env` (root) och `client/.env.example` till `client/.env.local`, och sätt lösenord (ORACLE_PWD, DB_PASSWORD).

## Installation

Installera dependencies:

```bash
npm install
```

## Development

Starta utvecklare-server med HMR:

```bash
npm run dev
```

Applikationen blir tillgänglig `http://localhost:5173`.

## Bygg för produktion

Skapa en produktions-bygge:

```bash
npm run build
```

## Deployment

### Podman Deployment

To build and run using Podman:

```bash
podman build -t my-app .

# Run the container
podman run -p 3000:3000 my-app
```

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.
