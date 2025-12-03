![Granska tillgänglighet](./public/logoHeader.svg)

Granska tillgänglighet är ett verktyg från Arbetsförmedlingen för att underlätta granskning av webbtjänsters tillgänglighet och skapa tillgänglighetsredogörelser.

## Om verktyget

Granska tillgänglighet är skapat för att vägleda användare utan expertkunskaper genom processen att granska en webbtjänst mot tillgänglighetskrav och skapa en tillgänglighetsredogörelse. Verktyget baseras på EN 301 549 och WCAG 2.2 nivå AA. Arbetsförmedlingen har gjort en egen bearbetning och sammanställning av dessa krav.

<table>
<thead>
<th>Startsida</th><th>Skapa granskning</th>
</thead>
<tbody>
<tr>
<td>
<img src="./public/screenshots/granska-tillganglighet-startsida.png" alt="Granska tillgänglighet - startsida" width="400">
</td>
<td>[screenshot]<br/>Minska mängden krav att granska genom att ange vad din tjänst innehåller.</td>
</tr>
</tbody>
</table>

### Funktioner

- **Vägledda granskningar** – Information och vägledning för varje tillgänglighetskrav
- **Strukturerad dokumentation** – Samla alla granskningsresultat på ett ställe
- **Tillgänglighetsredogörelser** – Hjälp att formulera tillgänglighetsredogörelser
- **Exportfunktion** – Exportera dina resultat som .csv för att till exempel importera som buggar i Jira

### Användning och flexibilitet

För att använda verktyget behöver du installera det i en driftmiljö och sätta upp en databas. Mer om detta kommer.

Du kan använda verktyget i sin grundversion, eller göra en egen fork och anpassa efter dina egna behov.

Arbetsförmedlingen tillhandahåller kravdata baserat på tillgänglighetslagarna, men du kan också peka på en helt annan datakälla för att skapa ett bedömningsverktyg för valfria andra krav.

## Kom igång

Mer om detta när vi har en färdig lösning.

## Teknisk stack

- **React Router** – Routing och navigering
- **TypeScript** – Typsäkerhet
- **Vite** – Byggverktyg
- **Tailwind CSS** – Styling
- **i18next** – Internationalisering
- **Supabase** – Databas och backend KOMMER ATT BYTAS UT

## Licens

Detta projekt är licensierat under Apache License 2.0 - se [LICENSE](LICENSE) för detaljer.

## Kontakt

Arbetsförmedlingen
