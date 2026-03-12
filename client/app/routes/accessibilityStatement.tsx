import {
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLinkExternal,
  DigiLinkInternal,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import PageTitle from '~/components/PageTitle';
import { organizationConfigurations } from '~/helpers/helpers';

const applicationTitle = organizationConfigurations().applicationTitle;

export function meta() {
  return [
    { title: `Tillgänglighetsredogörelse - ${applicationTitle}` },
    { name: 'description', content: `Tillgänglighetsredogörelse för ${applicationTitle}` },
  ];
}

export default function AccessibilityStatementPage() {
  const { t } = useTranslation();
  return (
    <DigiTypography>
      <main>
        <article>
          <PageTitle
            h1Text="Tillgänglighetsredogörelse"
            preamble="Arbetsförmedlingen är ägare till den här webbplatsen. Vi vill att alla ska kunna använda webbplatsen, oavsett behov. Här redogör vi hur arbetsformedlingen.se uppfyller lagen om tillgänglighet till digital offentlig service, eventuella kända tillgänglighetsproblem och hur du kan rapportera brister till oss så att vi kan åtgärda dem."
            breadcrumbsPages={[{ title: t('Home.Title'), href: '/' }]}
            breadcrumbsCurrentPage="Tillgänglighetsredogörelse"
          />
          <DigiLayoutContainer afVerticalPadding={true}>
            <DigiLayoutBlock afVerticalPadding={true}>
              <h2>Hur tillgänglig är webbplatsen?</h2>
              <p>
                Vi är medvetna om att delar av webbplatsen inte är helt tillgängliga. På den här
                sidan hittar du listor där vi redovisar kända brister i tillgänglighet.
              </p>
              <h2>Kontakta oss om du hittar fler brister</h2>
              <p>
                Vi strävar hela tiden efter att förbättra webbplatsens tillgänglighet. Om du
                upptäcker problem som inte är beskrivna, eller om du anser att vi inte uppfyller
                lagens krav, meddela oss så att vi får veta att problemet finns.
              </p>
              <p>
                <DigiLinkInternal afHref="https://arbetsformedlingen.se/kontakt/ge-oss-tips-och-synpunkter/synpunkter-pa-digital-tillganglighet">
                  Lämna synpunkter på digital tillgänglighet
                </DigiLinkInternal>
              </p>
              <h2>Kontakta tillsynsmyndigheten</h2>
              <p>
                Myndigheten för digital förvaltning har ansvaret för tillsyn för lagen om
                tillgänglighet till digital offentlig service. Om du inte är nöjd med hur vi
                hanterar dina synpunkter kan du kontakta Myndigheten för digital förvaltning, DIGG,
                och berätta det.
              </p>
              <p>
                <DigiLinkExternal afTarget="_blank" afHref="https://www.digg.se/tdosanmalan">
                  Digg
                </DigiLinkExternal>
              </p>
              <h2>Teknisk information om webbplatsens tillgänglighet</h2>
              <p>
                Den här webbplatsen är inte förenlig med lagen om tillgänglighet till digital
                offentlig service, på grund av de brister som beskrivs nedan.
              </p>
              <ul>
                <li>
                  Webbplatsen respekterar inte användares behov vid nedsatt synförmåga då det inte
                  går att använda mörkt läge. Vår ambition är att mörkt läge ska gå att använda
                  under 2026.
                </li>
              </ul>
              <h2>Hur vi har testat webbplatsen</h2>
              <p>Vi har gjort en självskattning (intern testning) av arbetsformedlingen.se.</p>
              <h2>Hur vi jobbar med digital tillgänglighet</h2>
              <p>
                Vi strävar efter att Arbetsförmedlingens webbplatser ska kunna uppfattas, hanteras
                och förstås av alla användare, oavsett behov eller funktionsnedsättning och
                oberoende av vilka hjälpmedel du använder. Vi ska åtminstone uppnå grundläggande
                tillgänglighet genom att följa WCAG 2.1 på nivå AA.
              </p>
              <p>
                <DigiLinkExternal afTarget="_blank" afHref="https://webbriktlinjer.se">
                  Kriterier WCAG (webbriktlinjer.se)
                </DigiLinkExternal>
              </p>
              <p>
                Arbetsförmedlingens arbete med digital tillgänglighet utvecklas löpande. Myndigheten
                arbetar aktivt för att alla oavsett förutsättningar ska kunna ta del av våra
                digitala stöd och tjänster på lika villkor. Det omfattar alla som har kontakt med
                eller arbetar på myndigheten.
              </p>
              <p>Den här sidan uppdaterades 27 november 2025.</p>
            </DigiLayoutBlock>
          </DigiLayoutContainer>
        </article>
      </main>
    </DigiTypography>
  );
}
