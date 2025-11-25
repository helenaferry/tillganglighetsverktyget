import {
  ButtonVariation,
  FormValidationMessageVariation,
  NotificationAlertSize,
  NotificationAlertVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiFormValidationMessage,
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLinkInternal,
  DigiNotificationAlert,
} from '@designsystem-se/af-react';
import { useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { type Check, type Requirement, type Review } from '~/data/types';
import { numberRemaining } from '~/helpers';
import ScreenReaderAlert from './ScreenReaderAlert';
import { useTranslation } from 'react-i18next';

type Props = {
  review: Review;
  checks?: Check[];
  requirements: Requirement[];
  categories: string[];
};

export default function Export({ review, checks, requirements, categories }: Props) {
  const { t } = useTranslation();
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
  const summaryRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyFailure, setCopyFailure] = useState(false);
  const [copiedTimestamp, setCopiedTimestamp] = useState<number>(0);

  const copyToClipboard = async () => {
    const el = summaryRef.current;
    const text = el?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setCopiedTimestamp(Date.now());
    } catch (err) {
      console.log(err);
      setCopyFailure(true);
      setCopiedTimestamp(Date.now());
    }
  };

  const exportToCsv = () => {
    const csvRows = [
      ['Issue Type', 'Summary', 'Description'],
      ...failedChecks.map((check) => {
        const requirement = requirements.find(
          (req) => String(req.id) === String(check.requirement),
        );
        return ['Bug', requirement?.name || '', check.comment || ''];
      }),
    ];
    const csvContent = csvRows
      .map((e) => e.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exporterade-uppgifter-${review.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DigiLayoutContainer afVerticalPadding={true}>
      {numberRemaining(requirementsWithChecks) > 0 && (
        <p className="mb-6">
          <DigiNotificationAlert
            afSize={NotificationAlertSize.LARGE}
            afVariation={NotificationAlertVariation.DANGER}
            afHeading={t('failed.IncompleteTitle')}
          >
            {t('failed.IncompleteDescription', {
              numberRemaining: numberRemaining(requirementsWithChecks),
            })}
          </DigiNotificationAlert>
        </p>
      )}
      <DigiLayoutBlock afVerticalPadding={true}>
        <h2>{t('failed.SubTitle')}</h2>
        {failedChecks.length > 0 && <p>{t('failed.FailedDescription')}</p>}
        {failedChecks.length === 0 && <p>{t('failed.NoFailedChecks')}</p>}
        {failedChecks.length > 0 && (
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
                  {failedInCategory.map((check) => {
                    const requirement = requirements.find(
                      (req) => String(req.id) === String(check.requirement),
                    );
                    return (
                      <div key={check.id} className="mt-8">
                        <p>
                          <DigiLinkInternal
                            afHref={`/granskning/${review.id}/${requirement?.id}/#krav`}
                          >
                            {requirement?.name}
                          </DigiLinkInternal>
                        </p>
                        {check.comment && <ReactMarkdown>{check.comment || ''}</ReactMarkdown>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
        {failedChecks.length > 0 && (
          <div>
            <div className="mt-8 mb-4 flex gap-4">
              <DigiButton afVariation={ButtonVariation.SECONDARY} onAfOnClick={copyToClipboard}>
                {t('failed.CopyButtonText')}
              </DigiButton>
              <DigiButton afVariation={ButtonVariation.SECONDARY} onAfOnClick={exportToCsv}>
                {t('failed.SaveCsvButtonText')}
              </DigiButton>
            </div>
            <ScreenReaderAlert updateOnChange={copiedTimestamp}>
              {copySuccess && (
                <DigiFormValidationMessage afVariation={FormValidationMessageVariation.SUCCESS}>
                  {t('failed.CopySuccessMessage')}
                </DigiFormValidationMessage>
              )}
              {copyFailure && (
                <DigiFormValidationMessage afVariation={FormValidationMessageVariation.ERROR}>
                  {t('failed.CopyFailMessage')}
                </DigiFormValidationMessage>
              )}
            </ScreenReaderAlert>
          </div>
        )}
      </DigiLayoutBlock>
    </DigiLayoutContainer>
  );
}
