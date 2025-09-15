import { NotificationAlertSize, NotificationAlertVariation } from '@digi/arbetsformedlingen';
import {
  DigiButton,
  DigiFormCheckbox,
  DigiFormFieldset,
  DigiFormTextarea,
  DigiNotificationAlert,
} from '@digi/arbetsformedlingen-react';
import { Status, type Check, type Requirement, type ReviewWithApplication } from '~/data/types';
import { DigiFormInput } from '@digi/arbetsformedlingen-react';
import { useState } from 'react';

type Props = {
  review: ReviewWithApplication;
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
    link.setAttribute('download', `export-tasks-review-${review.id}.csv`);
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
    <form className="content-container" id="export-tasks-form" onSubmit={exportToCsv}>
      {numberOfNotAssessed > 0 && failedChecks.length > 0 && (
        <DigiNotificationAlert
          afSize={NotificationAlertSize.LARGE}
          afVariation={NotificationAlertVariation.WARNING}
          afHeading="Ofullständig granskning"
        >
          Granskningen innehåller {numberOfNotAssessed} ohanterade krav. Du kan fortsätta ändå, men
          var medveten om att det kan finnas återstående uppgifter som behöver hanteras.
        </DigiNotificationAlert>
      )}
      {failedChecks.length === 0 && numberOfNotAssessed > 0 && (
        <DigiNotificationAlert
          afSize={NotificationAlertSize.LARGE}
          afVariation={NotificationAlertVariation.DANGER}
          afHeading="Det finns inget att exportera"
        >
          Granskningen innehåller inga underkända krav, men däremot krav som inte är bedömda. För
          att gå vidare med exporten behöver du först slutföra granskningen.
        </DigiNotificationAlert>
      )}
      {failedChecks.length === 0 && numberOfNotAssessed === 0 && (
        <DigiNotificationAlert
          afSize={NotificationAlertSize.LARGE}
          afVariation={NotificationAlertVariation.SUCCESS}
          afHeading="Allt är godkänt!"
        >
          Granskningen är slutförd men innehåller inga underkända krav. Det finns därför inget att
          exportera.
        </DigiNotificationAlert>
      )}
      <p className="pt-8">
        <b>Granskning:</b> {review.title}
      </p>

      {failedChecks.length > 0 && (
        <>
          <h2>Fyll i uppgifter till Jira</h2>
          <DigiFormInput
            afLabel="E-postadress till rapportör"
            afLabelDescription="Går bra att lämna tomt och i stället hantera i Jira."
            afValue={email}
            onAfOnInput={(e) => setEmail(e.detail.target.value)}
          />
          <DigiFormInput
            afLabel="Ärendetyp"
            afLabelDescription="Går bra att lämna tomt och i stället hantera i Jira."
            afValue={issueType}
            onAfOnInput={(e) => setIssueType(e.detail.target.value)}
          />
          <h2>Välj vilka krav som ska exporteras</h2>
          <p>
            Du kan välja vilka krav som ska exporteras genom att markera dem nedan. Ändrar du
            kommentaren här kommer den inte sparas i tillgänglighetsverktyget utan endast användas i
            exporten.
          </p>
          <p>
            <DigiButton afType="button" onAfOnClick={handleToggleAll}>
              <span
                style={{ display: selectedChecks.size < failedChecks.length ? 'inline' : 'none' }}
              >
                Markera alla
              </span>
              <span
                style={{ display: selectedChecks.size < failedChecks.length ? 'none' : 'inline' }}
              >
                Avmarkera alla
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
                <DigiFormTextarea
                  afLabel="Kommentar (ändringar sparas inte i tillgänglighetsverktyget)"
                  afName={`comment-${check.id}`}
                  afValue={check.comment ?? ''}
                  onAfOnInput={(e) => {
                    check.comment = e.detail.target.value;
                  }}
                />
              </DigiFormFieldset>
            );
          })}
          <DigiButton afType="submit">Spara som .csv</DigiButton>
        </>
      )}
    </form>
  );
}
