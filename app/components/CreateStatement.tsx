import { NotificationAlertSize, NotificationAlertVariation } from '@designsystem-se/af';
import { DigiFormCheckbox, DigiNotificationAlert } from '@designsystem-se/af-react';
import { useMemo, useState } from 'react';

import { type Check, type Requirement } from '~/data/types';
import { numberRemaining } from '~/helpers';

type Props = {
  checks?: Check[];
  requirements: Requirement[];
  categories: string[];
};

export default function CreateStatement({ checks, requirements, categories }: Props) {
  const requirementsWithChecks = useMemo(() => {
    if (!requirements.length || !checks) return [];
    return requirements.map((req) => {
      const check = checks?.find((check) => String(check.requirement) === String(req.id));
      return { ...req, check };
    });
  }, [requirements, checks]);

  const failedChecks = checks
    ? checks.filter(
        (check) => check.status === 0 || check.status === null || check.status === undefined,
      )
    : [];
  const [showTitles, setShowTitles] = useState(true);
  const [showComments, setShowComments] = useState(true);

  return (
    <div className="content-container content-container--largest content-container--nomargin content-container--xpadding">
      {numberRemaining(requirementsWithChecks) > 0 && (
        <DigiNotificationAlert
          afSize={NotificationAlertSize.LARGE}
          afVariation={NotificationAlertVariation.DANGER}
          afHeading="Ofullständig granskning"
        >
          Granskningen innehåller {numberRemaining(requirementsWithChecks)} ohanterade krav. För att
          skapa en korrekt tillgänglighetsredogörelse behöver alla krav vara bedömda.
        </DigiNotificationAlert>
      )}
      <div className="content-container content-container--white content-container--ymargin">
        <h2>Underkända krav</h2>
        {failedChecks.length > 0 && (
          <>
            <p>Här följer en översikt av de underkända krav du behöver redogöra för.</p>
            <DigiFormCheckbox
              checked={showTitles}
              onAfOnChange={() => setShowTitles(!showTitles)}
              afLabel="Visa kravtitlar"
            />
            <DigiFormCheckbox
              checked={showComments}
              onAfOnChange={() => setShowComments(!showComments)}
              afLabel="Visa kommentarer"
            />
          </>
        )}
        {failedChecks.length === 0 && <p>Det finns inga underkända krav.</p>}
        {categories.map((cat) => {
          const failedInCategory = failedChecks.filter((check) => {
            const requirement = requirements.find(
              (req) => String(req.id) === String(check.requirement),
            );
            return requirement?.category === cat;
          });

          if (failedInCategory.length === 0) return null;

          return (
            <div key={cat} className="mt-4">
              <h3>{cat}</h3>
              <ul>
                {failedInCategory.map((check) => {
                  const requirement = requirements.find(
                    (req) => String(req.id) === String(check.requirement),
                  );
                  return (
                    <li key={check.id} className="mt-4">
                      {showTitles && requirement?.name}
                      {showTitles && showComments && check.comment && <>: </>}
                      {showComments && check.comment && check.comment}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
