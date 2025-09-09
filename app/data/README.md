# Databas

Beslut om slutgiltig datahantering är inte fattat. Under utvecklingsfasen använder vi Supabase.

## Kom igång med Supabase
För att göra ändringar i databasen behöver du ett konto på Supabase kopplat till organisationen Tillgänglighetsverktyget.

TODO: Instruktioner för hur man annars kommer igång med en egen Supabase.

## Ändring av databasschemat
- Ändringar görs i Table Editor i Supabase dashboard.
- Typgenerering (för att uppdatera supabase-types.ts som används i projektet):
    - Du behöver en access token från https://supabase.com/dashboard/account/
    - I din terminal, skriv export SUPABASE_ACCESS_TOKEN=sbp_... (gäller för sessionen)
    - Kör npx supabase@latest gen types typescript --project-id siouoxdqpgykibzayejt --schema public > app/data/supabase-types.ts

## Interaktion med Supabase
- Interaktionen med Supabase ska hållas i data/reviewService. Den används sedan av useReviewData-hooken, som inte har specifik kännedom om Supabase.
- Supabase-specifika typer importeras även i data/types.ts men exporteras vidare under alias för att minska beroendet till en specifik databaslösning.
- Säkerställ att inga andra delar av applikationen pratar direkt med Supabase.