import {
  DigiFormInput,
  DigiFormSelectFilter,
  DigiButton,
  DigiFormFieldset,
  DigiFormCheckbox,
  DigiLoaderSkeleton,
  DigiFormRadiobutton,
  DigiFormRadiogroup,
  DigiDialog,
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
import { useState, useEffect, useMemo } from 'react';
import { DialogSize, LoaderSkeletonVariation } from '@digi/arbetsformedlingen';
import type { PrefillRequirementSetting } from '~/data/types';
import { ObjectType } from '~/data/types';

type Props = {
  reviewId?: string;
};

export function ReviewForm({ reviewId }: Props) {
  const { data: applications, isLoading: isLoadingApplications } = useApplications();
  const { data: requirements, isLoading: isLoadingRequirements } = useRequirements(ObjectType.WEB);
  const { data: contentTypes, isLoading: isLoadingContentTypes } = useRequirementContentTypes(
    ObjectType.WEB,
  );
  const { review, isLoading: isLoadingReview } = useReviewById(String(reviewId));
  const loading =
    isLoadingApplications || isLoadingRequirements || isLoadingContentTypes || isLoadingReview;
  const allPrefillRequirements = JSON.parse(
    import.meta.env.VITE_PREFILL_REQUIREMENTS || '{}',
  ) as PrefillRequirementSetting[];

  const disableChecks = useDisableChecks();
  const enableChecks = useEnableChecks();
  const upsertReview = useUpsertReview();
  const prefillChecks = usePrefillRequirements();

  const [title, setTitle] = useState<string>('');
  const [application, setApplication] = useState<string>('');
  const [excludedContentTypes, setExcludedContentTypes] = useState<string[]>([]);
  const [selectedPrefills, setSelectedPrefills] = useState<PrefillRequirementSetting[]>([]);
  const [objectType, setObjectType] = useState<ObjectType>(ObjectType.WEB);
  const [showDocumentInfo, setShowDocumentInfo] = useState<boolean>(false);

  const prefillRequirements = useMemo(() => {
    if (!objectType || !requirements) return [];
    return allPrefillRequirements
      .map((setting) => {
        const filteredPrefills = setting.prefillRequirements.filter((prefill) => {
          const req = requirements.find((r) => r.id === prefill.id);
          return req && req.objectType === objectType;
        });
        return {
          ...setting,
          prefillRequirements: filteredPrefills,
        };
      })
      .filter((setting) => setting.prefillRequirements.length > 0);
  }, [objectType, requirements, allPrefillRequirements]);

  useEffect(() => {
    if (review) {
      setTitle(review.title || '');
      setApplication(String(review.application.id) || '');
      setExcludedContentTypes(review.excludedContentTypes?.split(';') || []);
      setSelectedPrefills(
        prefillRequirements.filter((p) =>
          review.selectedPrefillIds?.split(';').includes(String(p.id)),
        ) || [],
      );
      setObjectType((review.objectType as ObjectType) || ObjectType.WEB);
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
        objectType: objectType ?? ObjectType.WEB,
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
              const reqIds = prefill.prefillRequirements.map((r) => r.id);
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
    <div className="content-container content-container--white content-container--largest">
      {loading && (
        <DigiLoaderSkeleton
          afVariation={LoaderSkeletonVariation.SECTION}
          afCount={4}
        ></DigiLoaderSkeleton>
      )}
      {!loading && (!reviewId || review) && (
        <form id="review-form" className="content-container" onSubmit={handleSubmit}>
          <DigiFormFieldset afForm="review-form" afLegend="Typ av granskningsobjekt" afName="typ">
            <DigiFormRadiogroup afName="type">
              <DigiFormRadiobutton
                afLabel="Webbsida eller webbtjänst"
                afValue={ObjectType.WEB}
                onAfOnInput={() => {
                  console.log('web');
                  setObjectType(ObjectType.WEB);
                }}
                afChecked={objectType === ObjectType.WEB}
              ></DigiFormRadiobutton>
              <DigiFormRadiobutton
                afLabel="Dokument"
                afValue={ObjectType.DOCUMENT}
                onAfOnInput={() => {
                  console.log('doc');
                  setObjectType(ObjectType.DOCUMENT);
                }}
                afChecked={objectType === ObjectType.DOCUMENT}
              ></DigiFormRadiobutton>
            </DigiFormRadiogroup>
          </DigiFormFieldset>
          <DigiButton afType="button" onClick={() => setShowDocumentInfo(true)}>
            Vad menas med dokument?
          </DigiButton>
          <DigiDialog
            afSize={DialogSize.MEDIUM}
            afShowDialog={showDocumentInfo}
            afHeading="Dokument som inte är webb, enligt avsnitt 10 i EN 301 549"
            afPrimaryButtonText="Stäng"
            onAfOnClose={() => setShowDocumentInfo(false)}
            onAfPrimaryButtonClick={() => setShowDocumentInfo(false)}
          >
            Krav i avsnitt 10 gäller för:
            <ul>
              <li>dokument som inte är webbsidor,</li>
              <li>dokument som inte är inbäddade i webbsidor, och</li>
              <li>
                dokument som tillhandahålls tillsammans med webbsidor men som varken är inbäddade
                eller återges tillsammans med den webbsida från vilken de tillhandahålls (dvs. detta
                avsnitt gäller för nedladdningsbara dokument).
              </li>
            </ul>
            <p>
              Exempel på dokument är brev, kalkylblad, e-post, böcker, bilder, presentationer och
              filmer.
            </p>
            <p>
              Framgångskriterierna i avsnitt 10 är avsedda att harmonisera med W3C:s WCAG2ICT Task
              Force:s arbetsdokument [i.26].
            </p>
            <p>
              Krav i avsnitt 10 gäller även dokument som skyddats med mekanismer som digitala
              signaturer, kryptering, lösenordsskydd och vattenstämplar när de presenteras för
              användaren.
            </p>
          </DigiDialog>
          <p>
            <DigiFormInput
              afLabel="Rubrik"
              afValue={title}
              onAfOnInput={(e) => setTitle(e.detail.target.value)}
            />
          </p>
          <p>
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
          </p>
          {objectType === ObjectType.WEB && (
            <div>
              <h2>Exkludera irrelevanta krav</h2>
              <p>
                Den totala mängden krav är stor och för att minska arbetsbelastningen är det viktigt
                att exkludera irrelevanta krav. Bocka för innehållstyper som saknas i
                granskningsobjektet, så markeras relaterade krav automatiskt som irrelevanta. De
                döljs då i granskningen, men du kan välja att visa dem för att kontrollera att de
                verkligen är irrelevanta och återta dem till granskningen om du vill.
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
            </div>
          )}

          {prefillRequirements.find(
            (prefill: PrefillRequirementSetting) => prefill.automatic === 'false',
          ) && (
            <DigiFormFieldset afForm="review-form" afLegend="Andra förutsättningar" afName="other">
              {prefillRequirements
                .filter((prefill: PrefillRequirementSetting) => prefill.automatic === 'false')
                .map((prefill: PrefillRequirementSetting) => (
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
