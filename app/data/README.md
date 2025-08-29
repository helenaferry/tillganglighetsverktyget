# Databas

Beslut om slutgiltig datahantering är inte fattat. Under utvecklingsfasen använder vi lokal instans av PocketBase.

## Kom igång med PocketBase

- Ladda ner PocketBase: https://pocketbase.io/docs/
- Starta PocketBase med kommandot ./pocketbase serve i mappen med din exekverbara pocketbase-fil.
    - För Mac-användare: Om du inte tillåts köra filen kan detta hjälpa: xattr -d com.apple.quarantine ./pocketbases
- Dashboard: http://127.0.0.1:8090/_/
- Gå till Settings -> Import collections och ladda in filen pb_schema.json.

## Ändring av databasschemat

- Ändringar görs enkelt via dashboarden.
- Vid ändringar behöver du uppdatera pb_types och pb_schema i data-mappen:
    - För typgenerering, kör i projektroten: npx pocketbase-typegen --url=http://127.0.0.1:8090 --out=./data/pb_types.ts --email=YOUR_USER --password=YOUR_PASSWORD
    - För schemauppdatering, exportera en ny pb_schema.json via dashboarden och byt ut den i data-mappen.

## Interaktion med PocketBase

- Interaktionen med PocketBase ska hållas i data/reviewService. Den används sedan av useReviewData-hooken, som inte har specifik kännedom om PocketBase.
- PocketBase-specifika typer importeras även i data/types.ts men exporteras vidare under alias för att minska beroendet till en specifik databaslösning.
- Säkerställ att inga andra delar av applikationen pratar direkt med PocketBase.