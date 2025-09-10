import { FormTextareaVariation } from '@digi/arbetsformedlingen';
import {
  DigiFormRadiogroup,
  DigiFormRadiobutton,
  DigiFormTextarea,
} from '@digi/arbetsformedlingen-react';
import { Status, type UpsertCheckInput } from '~/data/types';
import { useUpsertCheck, useDeleteCheck, useCheck } from '~/hooks/useReviewData';

type Props = {
  requirementId: string;
  reviewId: string;
};

export default function RequirementForm({ requirementId, reviewId }: Props) {
  const upsertCheck = useUpsertCheck();
  const deleteCheck = useDeleteCheck();
  const { check } = useCheck(reviewId, requirementId);

  return (
    <form id="requirement-form">
      <DigiFormRadiogroup
        afName="fulfillment"
        onAfOnGroupChange={(e: CustomEvent) => {
          const status = e.detail.target.value;
          if (status === Status.NOT_ASSESSED.toString() && check && !check.comment) {
            deleteCheck.mutate(String(check.id));
          }
          const input: UpsertCheckInput = {
            reviewId: Number(reviewId),
            requirement: requirementId,
            status: Number(status),
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
          afLabel="Kravet är ej bedömt"
          afChecked={!check}
        />
        <DigiFormRadiobutton
          value={Status.PASS.toString()}
          afLabel="Kravet uppfylls"
          afChecked={check?.status === Status.PASS}
        />
        <DigiFormRadiobutton
          value={Status.FAIL.toString()}
          afLabel="Kravet uppfylls inte"
          afChecked={check?.status === Status.FAIL}
        />
        <DigiFormRadiobutton
          value={Status.IRRELEVANT.toString()}
          afLabel="Kravet är ej relevant"
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
            status: check?.status || Status.NOT_ASSESSED,
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
