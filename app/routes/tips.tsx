import {
  ExpandableAccordionHeaderLevel,
  FormValidationMessageVariation,
  TableSize,
  TableVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@designsystem-se/af';
import {
  DigiExpandableAccordion,
  DigiFormValidationMessage,
  DigiTable,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import Process from '~/components/Process';
import i18n from '~/lang/i18n';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || i18n.t('start.defaultAppTitle');

export function meta() {
  return [
    { title: `${applicationTitle}: ${i18n.t('tips.Title')}` },
    { name: 'description', content: i18n.t('tips.MetaDescription') },
  ];
}

export default function TipsPage() {
  const { t } = useTranslation();
  return (
    <DigiTypography>
      <div className="content-container content-container--white content-container--nomargin">
        <article className="content-container content-container--largest content-container--nomargin content-container--nopadding !mb-12">
          <DigiTypographyHeadingJumbo
            afText={t('tips.Title')}
            afLevel={TypographyHeadingJumboLevel.H1}
            afVariation={TypographyHeadingJumboVariation.PRIMARY}
          ></DigiTypographyHeadingJumbo>
          <p className="!font-semibold">{t('tips.Preamble')}</p>
          <h2>Så här går en granskning till</h2>
          <p>En övergripande process hur en granskning fungerar.</p>
          <Process subHeadingElement="h3" showDescription={true} />
          <h2 className="!mt-12">Granska kod</h2>
          <p>Instruktioner hur du granskar kod i olika webbläsare.</p>
          <h3>Microsoft Edge</h3>
          <p>
            Granska koden på sidan genom att öppna webbläsarens utvecklingsverktyg genom att trycka
            på F12 eller högerklicka på ett objekt på sidan och välj ”granska”.
          </p>
          <h3>Google Chrome</h3>
          <p>
            Granska koden på sidan genom att öppna webbläsarens utvecklingsverktyg genom att trycka
            på F12 eller högerklicka på ett objekt på sidan och välj ”Inspektera”.
          </p>
          <h3>Safari</h3>
          <p>
            Granska koden på sidan genom att öppna webbläsarens utvecklingsverktyg genom att trycka
            på Option + Command + I eller högerklicka på ett objekt på sidan och välj ”granska
            element”.
          </p>
          <h4>Hur du får tillgång till verktyget för att granska sidor i Safari:</h4>
          <ol>
            <li>Gå till "Inställningar" i Safari.</li>
            <li>Klicka på "Avancerat".</li>
            <li>Välj "Visa funktioner för webbutvecklare".</li>
          </ol>
          <h2>Testa med hjälpmedel</h2>
          <p>Exempel på vanliga hjälpmedel för manuell testning:</p>
          <ul>
            <li>NVDA (gratis skärmläsare för Windows)</li>
            <li>VoiceOver (inbyggd skärmläsaren i macOS)</li>
            <li>JAWS för Windows</li>
            <li>Tangentbordstestning</li>
          </ul>
          <DigiExpandableAccordion
            afHeading="Kortkommandon med NVDA"
            afHeadingLevel={ExpandableAccordionHeaderLevel.H3}
          >
            <div className="w-p-medium">
              <DigiTable afSize={TableSize.MEDIUM} afVariation={TableVariation.PRIMARY}>
                <table>
                  <caption>
                    <h4 className="!text-lg">Snabbnavigering i webbläsare</h4>
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Funktion</th>
                      <th scope="col">Nästa</th>
                      <th scope="col">Föregående</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Landmärke</th>
                      <td>D</td>
                      <td>Skift + D</td>
                    </tr>
                    <tr>
                      <th scope="row">Rubrik</th>
                      <td>H</td>
                      <td>Skift + H</td>
                    </tr>
                    <tr>
                      <th scope="row">Länk</th>
                      <td>K</td>
                      <td>Skift + K</td>
                    </tr>
                    <tr>
                      <th scope="row">Knapp</th>
                      <td>B</td>
                      <td>Skift + B</td>
                    </tr>
                  </tbody>
                </table>
              </DigiTable>
            </div>
          </DigiExpandableAccordion>
          <DigiExpandableAccordion
            afHeading="Kortkommandon med VoiceOver"
            afHeadingLevel={ExpandableAccordionHeaderLevel.H3}
          >
            <div className="w-p-medium">
              <DigiTable afSize={TableSize.MEDIUM} afVariation={TableVariation.PRIMARY}>
                <table className="!mb-4">
                  <caption>
                    <h4 className="!text-lg">Snabbnavigering i webbläsare</h4>
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Funktion</th>
                      <th scope="col">Nästa</th>
                      <th scope="col">Föregående</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Landmärke</th>
                      <td>W</td>
                      <td>Skift + W</td>
                    </tr>
                    <tr>
                      <th scope="row">Rubrik</th>
                      <td>H</td>
                      <td>Skift + H</td>
                    </tr>
                    <tr>
                      <th scope="row">Länk</th>
                      <td>L</td>
                      <td>Skift + L</td>
                    </tr>
                    <tr>
                      <th scope="row">Knapp</th>
                      <td>B</td>
                      <td>Skift + B</td>
                    </tr>
                  </tbody>
                </table>
              </DigiTable>
              <DigiFormValidationMessage afVariation={FormValidationMessageVariation.WARNING}>
                Aktivera snabbnavigering med VO (oftast Control + Option) + Q
              </DigiFormValidationMessage>
            </div>
          </DigiExpandableAccordion>
          <DigiExpandableAccordion
            afHeading="Navigering med tangentbord"
            afHeadingLevel={ExpandableAccordionHeaderLevel.H3}
          >
            <div className="w-p-medium">
              <h4 className="!text-lg">Testa med tangentbord</h4>
              <p>
                Testa din tjänst utan mus eller pekskärm. Navigera genom alla element enbart med
                tangentbordet.
              </p>
              <h5>Navigera mellan interaktiva element</h5>
              <p>I de flesta webbläsare kan du hoppa mellan interaktiva element med:</p>
              <ul>
                <li>Tabb för nästa</li>
                <li>Shift + Tabb för föregående</li>
              </ul>
              <h5>Navigera mellan alternativ i en radiogrupp</h5>
              <p>Använd piltangenterna för att flytta mellan alternativen.</p>
              <h5>Aktivera länkar och knappar</h5>
              <p>Tryck på Enter för att aktivera länkar och knappar.</p>
              <h5>Hantera kryssrutor och rullgardinslistor</h5>
              <ul>
                <li>
                  Mellanslag för att växla markering i en kryssruta eller fälla ned en
                  rullgardinslista.
                </li>
                <li>Piltangenter för att navigera mellan alternativen i listan.</li>
                <li>Enter för att välja ett alternativ.</li>
              </ul>
            </div>
          </DigiExpandableAccordion>
        </article>
      </div>
    </DigiTypography>
  );
}
