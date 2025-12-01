import { ExpandableAccordionHeaderLevel, FormTextareaVariation } from '@designsystem-se/af';
import {
  DigiExpandableAccordion,
  DigiFormFieldset,
  DigiFormRadiobutton,
  DigiFormRadiogroup,
  DigiFormTextarea,
} from '@designsystem-se/af-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Status, StatusText, type UpsertCheckInput } from '~/data/types';
import { useCheck, useDeleteCheck, useUpsertCheck } from '~/hooks/useReviewData';

type Props = {
  requirementId: string;
  reviewId: string;
};

export default function RequirementForm({ requirementId, reviewId }: Props) {
  const { t } = useTranslation();
  const upsertCheck = useUpsertCheck();
  const deleteCheck = useDeleteCheck();
  const { check } = useCheck(reviewId, requirementId);
  const [localStatus, setLocalStatus] = useState<number | undefined>(check?.status ?? undefined);
  const [localComment, setLocalComment] = useState<string>(check?.comment ?? '');

  useEffect(() => {
    setLocalStatus(check?.status ?? undefined);
    setLocalComment(check?.comment ?? '');
  }, [check]);

  const useText = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const button = e.currentTarget;
    const copiedText = button.innerText;
    const currentValue = localComment.trim();
    const newComment = currentValue + (currentValue.length > 0 ? '\n\n' + copiedText : copiedText);

    setLocalComment(newComment);

    const input: UpsertCheckInput = {
      reviewId: Number(reviewId),
      requirement: requirementId,
      status: localStatus ?? check?.status ?? Status.NOT_ASSESSED,
      comment: newComment,
    };
    upsertCheck.mutate(input, {
      onError: (err) => {
        console.error('Fel vid sparande:', err);
      },
    });
  };

  return (
    <form id="requirement-form">
      <DigiFormFieldset afForm="requirement-form" afLegend={t('RequirementForm.Legend')}>
        <DigiFormRadiogroup
          afName="fulfillment"
          onAfOnGroupChange={(e: CustomEvent) => {
            const status = Number(e.detail.target.value);
            setLocalStatus(status);
            if (status === Status.NOT_ASSESSED && check && !check.comment) {
              deleteCheck.mutate(String(check.id));
            }
            const input: UpsertCheckInput = {
              reviewId: Number(reviewId),
              requirement: requirementId,
              status,
              comment: check?.comment ?? '',
            };
            upsertCheck.mutate(input, {
              onError: (err) => {
                console.error('Fel vid sparande:', err);
              },
            });
          }}
        >
          <DigiFormRadiobutton
            value={Status.NOT_ASSESSED.toString()}
            afLabel={StatusText.NOT_ASSESSED}
            afChecked={!check || check.status === Status.NOT_ASSESSED}
          />
          <DigiFormRadiobutton
            value={Status.PASS.toString()}
            afLabel={StatusText.PASS}
            afChecked={check?.status === Status.PASS}
          />
          <DigiFormRadiobutton
            value={Status.FAIL.toString()}
            afLabel={StatusText.FAIL}
            afChecked={check?.status === Status.FAIL}
          />
          <DigiFormRadiobutton
            value={Status.IRRELEVANT.toString()}
            afLabel={StatusText.IRRELEVANT}
            afChecked={check?.status === Status.IRRELEVANT}
          />
        </DigiFormRadiogroup>
      </DigiFormFieldset>
      <DigiFormTextarea
        afId="motivation"
        afValue={localComment}
        afLabel={t('RequirementForm.Label')}
        afLabelDescription={t('RequirementForm.LabelDescription')}
        afVariation={FormTextareaVariation.LARGE}
        onAfOnInput={(event) => {
          setLocalComment(event.detail.target.value);
        }}
        onBlur={() => {
          const input: UpsertCheckInput = {
            reviewId: Number(reviewId),
            requirement: String(requirementId),
            status: localStatus ?? Status.NOT_ASSESSED,
            comment: localComment,
          };
          upsertCheck.mutate(input, {
            onError: (err) => {
              console.error('Fel vid sparande:', err);
            },
          });
        }}
      />
      {upsertCheck.isError ? t('RequirementForm.SaveError') : ''}
      <DigiExpandableAccordion
        afHeading={t('RequirementForm.SuggestionsHeading')}
        afHeadingLevel={ExpandableAccordionHeaderLevel.H3}
      >
        <div>
          <p>{t('RequirementForm.SuggestionsDescription')}</p>
          {[
            '[Tillgänglighetsfunktion] går inte att aktivera utan [funktionsförmåga].',
            'Identifiering är bara möjlig med [biometrisk metod].',
            'Tjänsten har tvåvägs röstkommunikation men saknar stöd för kommunikation genom realtidstext.',
            'Det finns knappar med samma text men som utför olika funktion på olika sidor. Det finns också knappar med samma funktion på flera sidor där knapptexterna är olika.',
          ].map((text, index) => (
            <button
              aria-description={t('RequirementForm.CopyTextAriaDescription')}
              key={index}
              className="bg-grayscale-100 w-full p-3 mb-3 rounded text-stratos-500 hover:underline text-left"
              onClick={useText}
            >
              {text}
            </button>
          ))}
          <p className="italic text-sm text-grayscale-600">
            (Just nu är detta ett slumpmässigt urval av Annas texter och samma texter ligger för
            alla krav.)
          </p>
        </div>
      </DigiExpandableAccordion>
    </form>
  );
}
