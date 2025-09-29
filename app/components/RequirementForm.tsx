import { FormTextareaVariation } from '@digi/arbetsformedlingen';
import {
  DigiFormRadiobutton,
  DigiFormRadiogroup,
  DigiFormTextarea,
} from '@digi/arbetsformedlingen-react';
import { useEffect, useState } from 'react';

import { Status, type UpsertCheckInput } from '~/data/types';
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
              console.error('Could not save check:', err);
            },
          });
        }}
      >
        <DigiFormRadiobutton
          value={Status.NOT_ASSESSED.toString()}
          afLabel="Ej granskat"
          afChecked={!check}
        />
        <DigiFormRadiobutton
          value={Status.PASS.toString()}
          afLabel="Godkänt"
          afChecked={check?.status === Status.PASS}
        />
        <DigiFormRadiobutton
          value={Status.FAIL.toString()}
          afLabel="Underkänt"
          afChecked={check?.status === Status.FAIL}
        />
        <DigiFormRadiobutton
          value={Status.IRRELEVANT.toString()}
          afLabel="Irrelevant"
          afChecked={check?.status === Status.IRRELEVANT}
        />
      </DigiFormRadiogroup>
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
              console.error('Could not save check:', err);
            },
          });
        }}
      />
      {upsertCheck.isError ? 'Fel vid sparande' : ''}
    </form>
  );
}
