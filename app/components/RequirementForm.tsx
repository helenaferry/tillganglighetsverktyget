import { FormTextareaVariation } from '@designsystem-se/af';
import {
  DigiFormFieldset,
  DigiFormRadiobutton,
  DigiFormRadiogroup,
  DigiFormTextarea,
} from '@designsystem-se/af-react';
import { useEffect, useState } from 'react';

import { Status, StatusText, type UpsertCheckInput } from '~/data/types';
import { useCheck, useDeleteCheck, useUpsertCheck } from '~/hooks/useReviewData';

type Props = {
  requirementId: string;
  reviewId: string;
};

export default function RequirementForm({ requirementId, reviewId }: Props) {
  const upsertCheck = useUpsertCheck();
  const deleteCheck = useDeleteCheck();
  const { check } = useCheck(reviewId, requirementId);
  const [localStatus, setLocalStatus] = useState<number | undefined>(check?.status ?? undefined);

  useEffect(() => {
    setLocalStatus(check?.status ?? undefined);
  }, [check]);

  return (
    <form id="requirement-form">
      <DigiFormFieldset afForm="requirement-form" afLegend="Status för krav">
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
        afValue={check?.comment ?? ''}
        afLabel="Kommentar"
        afVariation={FormTextareaVariation.LARGE}
        onChange={(event) => {
          const input: UpsertCheckInput = {
            reviewId: Number(reviewId),
            requirement: String(requirementId),
            status: localStatus ?? Status.NOT_ASSESSED,
            comment: (event.target as HTMLInputElement).value,
          };
          upsertCheck.mutate(input, {
            onError: (err) => {
              console.error('Fel vid sparande:', err);
            },
          });
        }}
      />
      {upsertCheck.isError ? 'Fel vid sparande' : ''}
    </form>
  );
}
