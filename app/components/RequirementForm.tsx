import {
  ButtonVariation,
  ExpandableAccordionHeaderLevel,
  FormTextareaVariation,
  InfoCardHeadingLevel,
  InfoCardVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiExpandableAccordion,
  DigiFormFieldset,
  DigiFormRadiobutton,
  DigiFormRadiogroup,
  DigiFormTextarea,
  DigiIconCopy,
  DigiInfoCard,
} from '@designsystem-se/af-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Status, StatusText, type UpsertCheckInput } from '~/data/types';
import { useCheck, useDeleteCheck, useUpsertCheck } from '~/hooks/useReviewData';

type Props = {
  requirementId: string;
  reviewId: string;
  textSuggestions: string[];
};

export default function RequirementForm({ requirementId, reviewId, textSuggestions }: Props) {
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
  const useText = (text: string) => () => {
    const currentValue = localComment.trim();
    const newComment = currentValue + (currentValue.length > 0 ? '\n\n' + text : text);

    setLocalComment(newComment);

    const textArea = document.getElementById('motivation') as HTMLTextAreaElement | null;
    textArea?.focus();

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
      <DigiInfoCard
        afVariation={InfoCardVariation.SECONDARY}
        afHeading={t('RequirementForm.Heading')}
        afHeadingLevel={InfoCardHeadingLevel.H3}
      >
        <div className="flex flex-col xl:flex-row xl:gap-6">
          <div className="basis-[14rem] shrink-0">
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
          </div>
          <div>
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

            {textSuggestions && textSuggestions.length > 0 && (
              <DigiExpandableAccordion
                afHeading={t('RequirementForm.SuggestionsHeading')}
                afHeadingLevel={ExpandableAccordionHeaderLevel.H3}
              >
                <div>
                  <p>{t('RequirementForm.SuggestionsDescription')}</p>
                  {textSuggestions.map((text, index) => (
                    <div
                      key={index}
                      className="flex flex-col xl:flex-row xl:items-center xl:gap-2 my-6 xl:my-4 max-w-p-medium"
                    >
                      <div aria-hidden="true" className="bg-white py-2 px-4 rounded">
                        {text}
                      </div>
                      <div>
                        <DigiButton
                          afVariation={ButtonVariation.FUNCTION}
                          onAfOnClick={useText(text)}
                          afAriaLabel={t('RequirementForm.CopyTextAriaDescription', { text })}
                        >
                          <DigiIconCopy slot="icon" />
                          {t('RequirementForm.CopyButtonText')}
                        </DigiButton>
                      </div>
                    </div>
                  ))}
                </div>
              </DigiExpandableAccordion>
            )}
          </div>
        </div>
      </DigiInfoCard>
    </form>
  );
}
