# Kom igång

## Snabbstart i standalone-läge för klienten
I standalone-läge används localStorage istället för API/databas. Data sparas lokalt i webbläsaren och kräver ingen server eller databas. Perfekt för demo och enklare setup för mindre tekniska användare.

### Förutsättningar

- Node.js installerat
- npm installerat

### Steg

```bash
# 1. Gå till client-katalogen
cd client
```
1. Verifiera att STANDALONE_CLIENT är satt till true i config-filen i public/standaloneClient.js
2. Vill du starta klienten med ett par exempel-granskningar så sätt även USE_EXAMPLE_DATA till true
3. Kör:
```bash
 # Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev
```

Besök **http://localhost:5173** - klart! 🎉

---

## Fullständigt läge för Arbetsförmedlingen (med databas och server)

Än så länge har vi endast en fullständig miljö med klient, server och databas för oss på Arbetsförmedlingen.

### Steg

#### 1. Konfigurera miljö

```bash
# Kopiera miljövariabelmall
cp .env.example .env

```

#### 2. Starta tjänster

**Alternativ 1**
```bash
npm install
npm run dev
```

**Alternativ 2**

Starta två terminaler och kör följande kommandon i varje terminal:
```bash
npm install
cd ./client
npm run dev 
```

```bash
npm install
cd ./server
npm run dev 
```

Obs! Lokal utvecklingsmiljö kopplar upp sig till utvecklings-databasen, så fungerar endast på AF:s nätverk. 