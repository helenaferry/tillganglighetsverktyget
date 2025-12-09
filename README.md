![Granska tillgänglighet](./public/logoHeader.svg)

Granska tillgänglighet är ett verktyg från Arbetsförmedlingen för att underlätta granskning av webbtjänsters tillgänglighet och skapa tillgänglighetsredogörelser.

## Om verktyget

Granska tillgänglighet är skapat för att vägleda användare utan expertkunskaper genom processen att granska en webbtjänst mot tillgänglighetskrav och skapa en tillgänglighetsredogörelse. Verktyget baseras på EN 301 549 och WCAG 2.2 nivå AA. Arbetsförmedlingen har gjort en egen bearbetning och sammanställning av dessa krav.

### Funktioner

- **Vägledda granskningar** – Information och vägledning för varje tillgänglighetskrav.
- **Strukturerad dokumentation** – Samla alla granskningsresultat på ett ställe.
- **Tillgänglighetsredogörelser** – Hjälp att formulera tillgänglighetsredogörelser.
- **Exportfunktion** – Skapa buggar i Jira från en exportfil.

<table style="width:100%; table-layout:fixed;">
<thead>
<th style="width:25%; vertical-align:top;">Startsida</th><th style="width:25%; vertical-align:top;">Skapa granskning</th><th style="width:25%; vertical-align:top;">Granskningsöversikt</th><th style="width:25%; vertical-align:top;">Granskningsvy</th>
</thead>
<tbody>
<tr>
<td style="vertical-align:top;"><ul><li>Visa alla granskningar</li>
<li>Sök efter en granskning</li>
<li>Spara favoritgranskningar i din webbläsare</li>
</ul></td>
<td style="vertical-align:top;">Minska mängden krav att granska genom att ange vad din tjänst innehåller.</td>
<td style="vertical-align:top;">Sök fram krav och se status för granskningen som helhet.</td>
<td style="vertical-align:top;">Få stöd i att bedöma varje krav.</td>
</tr>
<tr>
<td style="vertical-align:top;">
<img src="./public/screenshots/granska-tillganglighet-startsida.png" alt="Granska tillgänglighet - startsida">

</td>
<td style="vertical-align:top;"><img src="./public/screenshots/granska-tillganglighet-skapa.png" alt="Granska tillgänglighet - skapa granskning"></td>
<td style="vertical-align:top;"><img src="./public/screenshots/granska-tillganglighet-kravoversikt.png" alt="Granska tillgänglighet - översikt"></td>
<td style="vertical-align:top;"><img src="./public/screenshots/granska-tillganglighet-granskningsvy.png" alt="Granska tillgänglighet - översikt"></td>
</tr>
</tbody>
</table>

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
- **Arbetsförmedlingens designsystem** - Design och komponenter
- **Tailwind CSS** – Styling
- **i18next** – Internationalisering
- **Supabase** – Databas och backend KOMMER ATT BYTAS UT

## Licens

Detta projekt är licensierat under Apache License 2.0 - se [LICENSE](LICENSE) för detaljer.

## Kontakt

Arbetsförmedlingen - [designsystem@arbetsformedlingen.se](mailto:designsystem@arbetsformedlingen.se)
