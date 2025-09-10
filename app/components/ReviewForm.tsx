import {
  DigiFormInput,
  DigiFormSelectFilter,
  DigiButton,
  DigiFormFieldset,
  DigiFormCheckbox,
  DigiLoaderSkeleton,
} from '@digi/arbetsformedlingen-react';
import {
  useApplications,
  useUpsertReview,
  useDisableChecks,
  useEnableChecks,
  useReviewById,
  usePrefillRequirements,
} from '~/hooks/useReviewData';
import { useRequirements, useRequirementContentTypes } from '~/hooks/useRequirementData';
import { useState, useEffect } from 'react';
import { LoaderSkeletonVariation } from '@digi/arbetsformedlingen';
import type { PrefillRequirement } from '~/data/types';

type Props = {
  reviewId?: string;
};

export function ReviewForm({ reviewId }: Props) {
  const { data: applications, isLoading: isLoadingApplications } = useApplications();
  const { data: requirements, isLoading: isLoadingRequirements } = useRequirements();
  const { data: contentTypes, isLoading: isLoadingContentTypes } = useRequirementContentTypes();
  const { review, isLoading: isLoadingReview } = useReviewById(String(reviewId));
  const loading =
    isLoadingApplications || isLoadingRequirements || isLoadingContentTypes || isLoadingReview;
  const prefillRequirements = JSON.parse(
    import.meta.env.VITE_PREFILL_REQUIREMENTS || '{}',
  ) as PrefillRequirement[];

  const disableChecks = useDisableChecks();
  const enableChecks = useEnableChecks();
  const upsertReview = useUpsertReview();
  const prefillChecks = usePrefillRequirements();

  const [title, setTitle] = useState<string>('');
  const [application, setApplication] = useState<string>('');
  const [excludedContentTypes, setExcludedContentTypes] = useState<string[]>([]);
  const [selectedPrefills, setSelectedPrefills] = useState<PrefillRequirement[]>([]);

  useEffect(() => {
    if (review) {
      setTitle(review.title || '');
      setApplication(String(review.application.id) || '');
      setExcludedContentTypes(review.excludedContentTypes?.split(';') || []);
      setSelectedPrefills(
        prefillRequirements.filter((p) => review.selectedPrefillIds?.split(';').includes(p.id)) ||
          [],
      );
    }
  }, [review]);

  const handleContentChange = (e: CustomEvent) => {
    const selected = e.detail.target.value;
    const checked = e.detail.target.checked;
    if (checked) {
      setExcludedContentTypes((prev) => [...prev, selected]);
    } else {
      setExcludedContentTypes((prev) => prev.filter((type) => type !== selected));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if excluded content types differ from current review's excluded content types
    const currentExcludedContentTypes = review?.excludedContentTypes?.split(';') || [];
    const addedTypes = excludedContentTypes.filter(
      (type) => !currentExcludedContentTypes.includes(type),
    );
    const removedTypes = currentExcludedContentTypes.filter(
      (type) => !excludedContentTypes.includes(type),
    );

    // Check if selected prefill requirements differ from current review's selected prefill requirements
    const currentSelectedPrefillIds = review?.selectedPrefillIds?.split(';') || [];
    const addedPrefills = selectedPrefills.filter(
      (prefill) => !currentSelectedPrefillIds.includes(prefill.id),
    );
    const removedPrefills = currentSelectedPrefillIds.filter(
      (id) => !selectedPrefills.some((prefill) => prefill.id === id),
    );

    upsertReview.mutate(
      {
        id: reviewId,
        title,
        application,
        excludedContentTypes,
        selectedPrefillIds: selectedPrefills.map((p) => p.id).join(';'),
      },
      {
        onSuccess: (review) => {
          const reviewId = review.id;
          const requirementsToDisable = requirements
            ?.filter((req) => addedTypes.includes(req.contentType))
            .map((req) => req.id);
          disableChecks.mutate({ reviewId: reviewId, requirements: requirementsToDisable || [] });
          const requirementsToEnable = requirements
            ?.filter((req) => removedTypes.includes(req.contentType))
            .map((req) => req.id);
          enableChecks.mutate({ reviewId: reviewId, requirements: requirementsToEnable || [] });
          addedPrefills.forEach((prefill) => {
            prefillChecks.mutate({ reviewId: reviewId, prefill });
          });
          removedPrefills.forEach((prefillId) => {
            const prefill = prefillRequirements.find((p) => p.id === prefillId);
            if (prefill) {
              const reqIds = prefill.requirements
                .split(',')
                .map((r) => r.trim())
                .filter((r) => r !== '');
              enableChecks.mutate({ reviewId: reviewId, requirements: reqIds });
            }
          });
          // Automatic prefill requirements
          prefillRequirements
            .filter((prefill) => prefill.automatic === 'true')
            .forEach((prefill) => {
              prefillChecks.mutate({ reviewId: reviewId, prefill });
            });
        },
      },
    );
  };

  return (
    <div>
      {loading && (
        <DigiLoaderSkeleton
          afVariation={LoaderSkeletonVariation.SECTION}
          afCount={4}
        ></DigiLoaderSkeleton>
      )}
      {!loading && (!reviewId || review) && (
        <form id="review-form" className="content-container" onSubmit={handleSubmit}>
          <DigiFormInput
            afLabel="Rubrik"
            afValue={title}
            onAfOnInput={(e) => setTitle(e.detail.target.value)}
          />
          <DigiFormSelectFilter
            afFilterButtonText="Välj granskningsobjekt"
            afFilterButtonTextLabel="Granskningsobjekt"
            afName="Granskningsobjekt"
            afListItems={
              applications?.map((app) => ({
                value: String(app.id),
                label: app.name ?? '',
                selected: String(app.id) === application,
              })) ?? []
            }
            onAfOnSelect={(e) => setApplication(e.detail[0].value)}
          />
          <h2>Exkludera irrelevanta krav</h2>
          <p>
            Den totala mängden krav är stor och för att minska arbetsbelastningen är det viktigt att
            exkludera irrelevanta krav. Bocka för innehållstyper som saknas i granskningsobjektet,
            så markeras relaterade krav automatiskt som irrelevanta. De döljs då i granskningen, men
            du kan välja att visa dem för att kontrollera att de verkligen är irrelevanta och återta
            dem till granskningen om du vill.
          </p>
          <DigiFormFieldset
            afForm="review-form"
            afLegend="Vänligen välj de innehållstyper som inte är relevanta för granskningsobjektet"
            afName="content"
          >
            {contentTypes &&
              contentTypes.map((contentType) => (
                <DigiFormCheckbox
                  key={contentType}
                  afValue={contentType}
                  afChecked={excludedContentTypes.includes(contentType)}
                  onAfOnChange={(e) => {
                    handleContentChange(e);
                  }}
                  afLabel={contentType}
                ></DigiFormCheckbox>
              ))}
          </DigiFormFieldset>

          {prefillRequirements.find(
            (prefill: PrefillRequirement) => prefill.automatic === 'false',
          ) && (
            <DigiFormFieldset afForm="review-form" afLegend="Andra förutsättningar" afName="other">
              {prefillRequirements
                .filter((prefill: PrefillRequirement) => prefill.automatic === 'false')
                .map((prefill: PrefillRequirement) => (
                  <DigiFormCheckbox
                    key={prefill.id}
                    afValue="digi"
                    checked={selectedPrefills.some((p) => p.id === prefill.id)}
                    onAfOnChange={(e) => {
                      if (e.detail.target.checked) {
                        setSelectedPrefills([...selectedPrefills, prefill]);
                      } else {
                        setSelectedPrefills(selectedPrefills.filter((p) => p.id !== prefill.id));
                      }
                    }}
                    afLabel={prefill.activateText}
                  ></DigiFormCheckbox>
                ))}
            </DigiFormFieldset>
          )}

          <DigiButton afType="submit">Spara</DigiButton>
          {upsertReview.isError && <p>Fel vid sparande</p>}
          {upsertReview.isSuccess && <p>Sparad!</p>}
        </form>
      )}
    </div>
  );
}
