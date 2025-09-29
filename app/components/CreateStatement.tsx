import { NotificationAlertSize, NotificationAlertVariation } from '@digi/arbetsformedlingen';
import { DigiFormCheckbox, DigiNotificationAlert } from '@digi/arbetsformedlingen-react';
import { useState } from 'react';

import { type Check, type Requirement, type ReviewWithApplication, Status } from '~/data/types';

type Props = {
  review: ReviewWithApplication;
  checks?: Check[];
  requirements: Requirement[];
  categories: string[];
};

export default function CreateStatement({ review, checks, requirements, categories }: Props) {
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
  const [showTitles, setShowTitles] = useState(true);
  const [showComments, setShowComments] = useState(true);

  return (
    <div className="content-container">
      {numberOfNotAssessed > 0 && (
        <DigiNotificationAlert
          afSize={NotificationAlertSize.LARGE}
          afVariation={NotificationAlertVariation.DANGER}
          afHeading="Ofullständig granskning"
        >
          Granskningen innehåller {numberOfNotAssessed} ohanterade krav. För att skapa en korrekt
          tillgänglighetsredogörelse behöver alla krav vara bedömda.
        </DigiNotificationAlert>
      )}
      <p className="pt-8">
        <b>Granskning:</b> {review.title}
      </p>
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
  );
}
