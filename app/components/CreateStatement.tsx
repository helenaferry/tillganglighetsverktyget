import {
  ButtonVariation,
  FormValidationMessageVariation,
  NotificationAlertSize,
  NotificationAlertVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiFormCheckbox,
  DigiFormFieldset,
  DigiFormValidationMessage,
  DigiIconRedo,
  DigiLinkInternal,
  DigiNotificationAlert,
} from '@designsystem-se/af-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { type Check, type Requirement } from '~/data/types';
import { numberRemaining } from '~/helpers';

type Props = {
  reviewId: number;
  checks?: Check[];
  requirements: Requirement[];
  categories: string[];
};

export default function CreateStatement({ reviewId, checks, requirements, categories }: Props) {
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
  const [showCategories, setShowCategories] = useState(true);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [showTitles, setShowTitles] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyFailure, setCopyFailure] = useState(false);

  const reset = () => {
    setShowCategories(true);
    setShowTitles(true);
    setShowComments(true);
    const focusElement = document.getElementById('checkbox-show-categories');
    focusElement?.focus();
  };

  const copyToClipboard = async () => {
    const el = summaryRef.current;
    const text = el?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
    } catch (err) {
      console.log(err);
      setCopyFailure(true);
    }
  };

  useEffect(() => {
    setCopySuccess(false);
    setCopyFailure(false);
  }, [showCategories, showTitles, showComments]);

  return (
    <div className="content-container content-container--largest content-container--nomargin content-container--xpadding">
      {numberRemaining(requirementsWithChecks) > 0 && (
        <p className="mb-6">
          <DigiNotificationAlert
            afSize={NotificationAlertSize.LARGE}
            afVariation={NotificationAlertVariation.DANGER}
            afHeading="Ofullständig granskning"
          >
            Granskningen innehåller {numberRemaining(requirementsWithChecks)} ohanterade krav. För
            att skapa en korrekt tillgänglighetsredogörelse behöver alla krav vara bedömda.
          </DigiNotificationAlert>
        </p>
      )}
      <div className="content-container content-container--white content-container--nomargin !mb-6">
        <h2>Sammanställning av brister vid granskning</h2>
        {failedChecks.length > 0 && (
          <form name="Innehållsval">
            <p>
              Här följer en översikt av de underkända krav du behöver redogöra för i din
              tillgänglighetsredogörelse.
            </p>
            <DigiFormFieldset
              afForm="Innehållsval"
              afLegend="Välj innehåll som ska inkluderas i sammanställningen"
              afName="Innehållsval"
            >
              <DigiFormCheckbox
                checked={showCategories}
                onAfOnChange={() => setShowCategories(!showCategories)}
                afLabel="Visa kravkategorier"
                afId="checkbox-show-categories"
              />
              <DigiFormCheckbox
                checked={showTitles}
                onAfOnChange={() => setShowTitles(!showTitles)}
                afLabel="Visa kravtitlar"
                afId="checkbox-show-titles"
              />
              <DigiFormCheckbox
                checked={showComments}
                onAfOnChange={() => setShowComments(!showComments)}
                afLabel="Visa kommentarer"
                afId="checkbox-show-comments"
              />
            </DigiFormFieldset>
            <div role="alert">
              {!showCategories && !showTitles && !showComments && (
                <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>Dina val döljer all information.</span>
                  <span className="inline-flex">
                    <DigiButton
                      afVariation={ButtonVariation.FUNCTION}
                      onAfOnClick={reset}
                      afFullWidth={false}
                    >
                      Rensa dina val
                      <DigiIconRedo slot="icon" />
                    </DigiButton>
                  </span>
                </p>
              )}
            </div>
          </form>
        )}
        {failedChecks.length === 0 && <p>Det finns inga underkända krav.</p>}
        {(showCategories || showTitles || showComments) && (
          <div ref={summaryRef}>
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
                  {showCategories && <h3>{cat}</h3>}

                  {failedInCategory.map((check) => {
                    const requirement = requirements.find(
                      (req) => String(req.id) === String(check.requirement),
                    );
                    return (
                      <div key={check.id} className="mt-8">
                        {showTitles && (
                          <p>
                            <DigiLinkInternal
                              afHref={`/granskning/${reviewId}/${requirement?.id}/#krav`}
                            >
                              {requirement?.name}
                            </DigiLinkInternal>
                          </p>
                        )}
                        {showComments && check.comment && (
                          <ReactMarkdown>{check.comment || ''}</ReactMarkdown>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
        {failedChecks.length > 0 && (showCategories || showTitles || showComments) && (
          <div className="my-8 flex flex-col gap-4">
            <DigiButton afVariation={ButtonVariation.PRIMARY} onAfOnClick={copyToClipboard}>
              Kopiera till urklipp
            </DigiButton>
            <div role="alert">
              {copySuccess && (
                <DigiFormValidationMessage afVariation={FormValidationMessageVariation.SUCCESS}>
                  Texten har kopierats till urklipp.
                </DigiFormValidationMessage>
              )}
              {copyFailure && (
                <DigiFormValidationMessage afVariation={FormValidationMessageVariation.ERROR}>
                  Kunde inte kopiera texten.
                </DigiFormValidationMessage>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
