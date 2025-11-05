import {
  NotificationAlertSize,
  NotificationAlertVariation,
  ButtonVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiFormCheckbox,
  DigiFormFieldset,
  DigiFormTextarea,
  DigiNotificationAlert,
} from '@designsystem-se/af-react';
import { DigiFormInput } from '@designsystem-se/af-react';
import { useState } from 'react';

import { type Check, type Requirement, type Review, Status } from '~/data/types';

type Props = {
  review: Review;
  checks?: Check[];
  requirements: Requirement[];
};

export default function ExportTasks({ review, checks, requirements }: Props) {
  const failedChecks = checks
    ? checks.filter(
        (check) => check.status === 0 || check.status === null || check.status === undefined,
      )
    : [];
  const numberOfDone = checks
    ? checks.filter(
        (check) =>
          check.status === Status.PASS ||
          check.status === Status.FAIL ||
          check.status === Status.IRRELEVANT,
      ).length
    : 0;
  const numberOfNotAssessed = requirements.length - numberOfDone;

  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('Bugg');
  const [selectedChecks, setSelectedChecks] = useState<Set<string>>(new Set());

  const exportToCsv = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const selectedChecks = failedChecks.filter((check) => formData.has(`requirement-${check.id}`));
    const csvRows = [
      ['Rapportör', 'Ärendetyp', 'Rubrik', 'Beskrivning'],
      ...selectedChecks.map((check) => {
        const requirement = requirements.find(
          (req) => String(req.id) === String(check.requirement),
        );
        return [email, issueType, requirement?.name || '', check.comment || ''];
      }),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((e) => e.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `exporterade-uppgifter-${review.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleAll = () => {
    if (selectedChecks.size < failedChecks.length) {
      setSelectedChecks(new Set(failedChecks.map((check) => String(check.id))));
    } else {
      setSelectedChecks(new Set());
    }
  };

  return (
    <form id="export-tasks-form" onSubmit={exportToCsv}>
      {numberOfNotAssessed > 0 && failedChecks.length > 0 && (
        <div className="content-container content-container--largest content-container--nopadding">
          <DigiNotificationAlert
            afSize={NotificationAlertSize.LARGE}
            afVariation={NotificationAlertVariation.WARNING}
            afHeading="Ofullständig granskning"
          >
            Granskningen innehåller {numberOfNotAssessed} ohanterade krav. Du kan fortsätta ändå,
            men var medveten om att det kan finnas återstående uppgifter som behöver hanteras.
          </DigiNotificationAlert>
        </div>
      )}
      {failedChecks.length === 0 && numberOfNotAssessed > 0 && (
        <div className="content-container content-container--largest content-container--nopadding">
          <DigiNotificationAlert
            afSize={NotificationAlertSize.LARGE}
            afVariation={NotificationAlertVariation.DANGER}
            afHeading="Det finns inget att exportera"
          >
            Granskningen innehåller inga underkända krav, men däremot krav som inte är bedömda. För
            att gå vidare med exporten behöver du först slutföra granskningen.
          </DigiNotificationAlert>
        </div>
      )}
      {failedChecks.length === 0 && numberOfNotAssessed === 0 && (
        <div className="content-container content-container--largest content-container--nopadding">
          <DigiNotificationAlert
            afSize={NotificationAlertSize.LARGE}
            afVariation={NotificationAlertVariation.SUCCESS}
            afHeading="Allt är godkänt!"
          >
            Granskningen är slutförd men innehåller inga underkända krav. Det finns därför inget att
            exportera.
          </DigiNotificationAlert>
        </div>
      )}

      {failedChecks.length > 0 && (
        <div className="content-container content-container--largest content-container--white">
          <h2>Fyll i uppgifter till Jira</h2>
          <p>Här kan du exportera underkända krav till Jira.</p>
          <p>
            <DigiFormInput
              afLabel="E-postadress till rapportör"
              afLabelDescription="Du kan hantera detta i Jira också."
              afValue={email}
              onAfOnInput={(e) => setEmail(e.detail.target.value)}
            />
          </p>
          <p>
            <DigiFormInput
              afLabel="Ärendetyp"
              afLabelDescription="Du kan hantera detta i Jira också."
              afValue={issueType}
              onAfOnInput={(e) => setIssueType(e.detail.target.value)}
            />
          </p>
          <h2>Välj vilka krav som ska exporteras</h2>
          <p>
            Du kan välja vilka krav som ska exporteras genom att markera dem. Om du ändrar
            kommentarer så sparas det enbart i exporteringen.
          </p>
          <p>
            <DigiButton
              afType="button"
              afVariation={ButtonVariation.SECONDARY}
              onAfOnClick={handleToggleAll}
            >
              <span
                style={{ display: selectedChecks.size < failedChecks.length ? 'inline' : 'none' }}
              >
                Markera alla krav
              </span>
              <span
                style={{ display: selectedChecks.size < failedChecks.length ? 'none' : 'inline' }}
              >
                Avmarkera alla krav
              </span>
            </DigiButton>
          </p>
          {failedChecks.map((check) => {
            const requirement = requirements.find(
              (req) => String(req.id) === String(check.requirement),
            );
            return (
              <DigiFormFieldset key={check.id} afForm="export-tasks-form">
                <DigiFormCheckbox
                  afLabel={requirement?.name || 'Krav'}
                  afName={`requirement-${check.id}`}
                  afValue={String(check.id)}
                  afChecked={selectedChecks.has(String(check.id))}
                  onAfOnChange={(e) => {
                    const checked = e.detail.target.checked;
                    setSelectedChecks((prev) => {
                      const next = new Set(prev);
                      if (checked) {
                        next.add(String(check.id));
                      } else {
                        next.delete(String(check.id));
                      }
                      return next;
                    });
                  }}
                />
                <p className="!mb-4">
                  <DigiFormTextarea
                    afLabel="Kommentar"
                    afLabelDescription="Ändringar sparas endast i exporten."
                    afName={`comment-${check.id}`}
                    afValue={check.comment ?? ''}
                    onAfOnInput={(e) => {
                      check.comment = e.detail.target.value;
                    }}
                  />
                </p>
              </DigiFormFieldset>
            );
          })}
          <div className="mt-2">
            <DigiButton afType="submit">Spara som .csv</DigiButton>
          </div>
        </div>
      )}
    </form>
  );
}
