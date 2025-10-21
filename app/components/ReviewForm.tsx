import {
  ButtonSize,
  ButtonVariation,
  DialogSize,
  LoaderSkeletonVariation,
} from '@digi/arbetsformedlingen';
import {
  DigiButton,
  DigiDialog,
  DigiFormFieldset,
  DigiFormInput,
  DigiFormRadiobutton,
  DigiFormRadiogroup,
  DigiIconTrash,
  DigiLoaderSkeleton,
} from '@digi/arbetsformedlingen-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

// import type { PrefillRequirementSetting } from '~/data/types';
import { ObjectType } from '~/data/types';
import { useRequirementContentTypes, useRequirements } from '~/hooks/useRequirementData';
import {
  useDeleteReview,
  useDisableChecks,
  useEnableChecks,
  // usePrefillRequirements, // TODO Maybe use for category prefills?
  useReviewById,
  useUpsertReview,
} from '~/hooks/useReviewData';

type Props = {
  reviewId?: string;
};

export function ReviewForm({ reviewId }: Props) {
  const { data: allRequirements, isLoading: isLoadingRequirements } = useRequirements();
  const { data: contentTypes, isLoading: isLoadingContentTypes } = useRequirementContentTypes(
    ObjectType.WEB,
  );
  const { review, isLoading: isLoadingReview } = useReviewById(String(reviewId));
  const loading = isLoadingRequirements || isLoadingContentTypes || isLoadingReview;
  /*const allPrefillRequirements = JSON.parse(
    import.meta.env.VITE_PREFILL_REQUIREMENTS || '{}',
  ) as PrefillRequirementSetting[];*/

  const disableChecks = useDisableChecks();
  const enableChecks = useEnableChecks();
  const upsertReview = useUpsertReview();
  // const prefillChecks = usePrefillRequirements();
  const deleteReview = useDeleteReview();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [excludedContentTypes, setExcludedContentTypes] = useState<string[]>([]);
  // const [selectedPrefills, setSelectedPrefills] = useState<PrefillRequirementSetting[]>([]);
  const [objectType, setObjectType] = useState<ObjectType>(ObjectType.WEB);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [showAbortConfirmation, setShowAbortConfirmation] = useState<boolean>(false);

  const requirements = useMemo(() => {
    return allRequirements?.filter((r) => r.objectType === objectType) || [];
  }, [allRequirements, objectType]);

  const toBeReviewedRequirements = useMemo(() => {
    return requirements?.filter((r) => !excludedContentTypes.includes(r.contentType)) || [];
  }, [requirements, excludedContentTypes]);

  /*const prefillRequirements = useMemo(() => {
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
  }, [objectType, requirements, allPrefillRequirements]);*/

  useEffect(() => {
    if (review) {
      setTitle(review.title || '');
      setExcludedContentTypes(review.excludedContentTypes?.split(';') || []);
      // setSelectedPrefills(
      //   prefillRequirements.filter((p) =>
      //     review.selectedPrefillIds?.split(';').includes(String(p.id)),
      //   ) || [],
      // );
      setObjectType((review.objectType as ObjectType) || ObjectType.WEB);
    }
  }, [review]);

  const handleContentChange = (contentType: string, included: string) => {
    const excluded = included == 'false';
    if (excluded) {
      if (excludedContentTypes.includes(contentType)) return;
      setExcludedContentTypes((prev) => [...prev, contentType]);
    } else {
      setExcludedContentTypes((prev) => prev.filter((type) => type !== contentType));
    }
  };

  const handleDeleteReview = () => {
    if (!reviewId) return;
    deleteReview.mutate(Number(reviewId), {
      onSuccess: () => {
        setShowDeleteConfirmation(false);
        navigate('/');
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if excluded content types differ from current review's excluded content types
    const currentExcludedContentTypes = review?.excludedContentTypes?.split(';') || [];
    const addedTypes = excludedContentTypes.filter(
      (type: string) => !currentExcludedContentTypes.includes(type),
    );
    const removedTypes = currentExcludedContentTypes.filter(
      (type: string) => !excludedContentTypes.includes(type),
    );

    {
      /*
    // Check if selected prefill requirements differ from current review's selected prefill requirements
    const currentSelectedPrefillIds = review?.selectedPrefillIds?.split(';') || [];
    const addedPrefills = selectedPrefills.filter(
      (prefill) => !currentSelectedPrefillIds.includes(prefill.id),
    );
    const removedPrefills = currentSelectedPrefillIds.filter(
      (id: string) => !selectedPrefills.some((prefill) => prefill.id === id),
    );*/
    }

    upsertReview.mutate(
      {
        id: reviewId,
        title,
        excludedContentTypes,
        selectedPrefillIds: '', // selectedPrefills.map((p) => p.id).join(';'),
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
          /*addedPrefills.forEach((prefill) => {
            prefillChecks.mutate({ reviewId: reviewId, prefill });
          });
          removedPrefills.forEach((prefillId: string) => {
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
            });*/
          navigate(`/granskning/${review.id}`);
        },
      },
    );
  };

  const contentCategoryQuestions = [
    {
      contentCategory: 'Bilder, ikoner & grafik',
      question: 'Innehåller tjänsten bilder, ikoner eller grafik?',
    },
    {
      contentCategory: 'Formulär & inmatningsfält',
      question: 'Innehåller tjänsten formulär eller inmatningsfält?',
    },
    {
      contentCategory: 'Mediaspelare Ljud',
      question: 'Innehåller tjänsten ljud?',
    },
    {
      contentCategory: 'Mediaspelare Video',
      question: 'Innehåller tjänsten video eller filmer?',
    },
    {
      contentCategory: 'Videosamtal',
      question: 'Innehåller tjänsten röst- och videosamtal?',
    },
    {
      contentCategory: 'Innehållsskapande',
      question: 'Tillhandahåller tjänsten publiceringsverktyg för användaren?',
    },
  ];

  return (
    <div>
      {loading && (
        <DigiLoaderSkeleton
          afVariation={LoaderSkeletonVariation.SECTION}
          afCount={4}
        ></DigiLoaderSkeleton>
      )}
      {!loading && (!reviewId || review) && (
        <form id="review-form" onSubmit={handleSubmit}>
          {/* Disable option to choose between web and document for now 
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
          </DigiDialog>*/}
          <div className="sm:flex justify-between">
            <div className="max-w-[24rem] my-8">
              <DigiFormInput
                afLabel="Namn på granskning"
                afLabelDescription="Namnet visas i listan med alla granskningar så att du kan hitta din granskning igen."
                afValue={title}
                onAfOnInput={(e) => setTitle(e.detail.target.value)}
              />
            </div>
            <div className="sm:mt-6 mb-6">
              {review && (
                <DigiButton
                  afSize={ButtonSize.MEDIUM}
                  afVariation={ButtonVariation.SECONDARY}
                  afFullWidth={false}
                  onAfOnClick={() => setShowDeleteConfirmation(true)}
                >
                  <DigiIconTrash slot="icon-secondary" />
                  Radera denna granskning
                </DigiButton>
              )}
            </div>
          </div>
          {objectType === ObjectType.WEB && (
            <div>
              <h2>Vad innehåller din tjänst?</h2>
              <p>
                Svara på några frågor om vad din tjänst innehåller. Dina svar hjälper dig att
                granska relevanta krav. Du kan ändå se kraven och ändra bedömningen vid behov
                senare.
              </p>

              {contentTypes &&
                contentTypes.map((contentType) => {
                  const questionText =
                    contentCategoryQuestions.find((q) => q.contentCategory === contentType)
                      ?.question || contentType;
                  return (
                    <div className="mb-4" key={`fieldset-${contentType}`}>
                      <DigiFormFieldset
                        afForm="review-form"
                        afLegend={questionText}
                        afName={`fieldset-${contentType}`}
                      >
                        <DigiFormRadiogroup
                          afName={`radiogroup-${contentType}`}
                          key={contentType}
                          onAfOnGroupChange={(e) => {
                            const value = (e.target as HTMLInputElement)?.value;
                            handleContentChange(contentType, value);
                          }}
                        >
                          <DigiFormRadiobutton
                            afLabel="Ja"
                            afValue="true"
                            afChecked={excludedContentTypes.includes(contentType) ? false : true}
                          ></DigiFormRadiobutton>
                          <DigiFormRadiobutton
                            afLabel="Nej"
                            afValue="false"
                            afChecked={excludedContentTypes.includes(contentType) ? true : false}
                          ></DigiFormRadiobutton>
                        </DigiFormRadiogroup>
                      </DigiFormFieldset>
                    </div>
                  );
                })}
            </div>
          )}

          {/* TODO Bring back auto prefill?!! */}

          {/* Disable prefill selection for now
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
          )}*/}

          <p className="bg-[#DDF1FC] px-8 py-6 !mt-6 mb-4" role="status">
            <span className="text-4xl font-semibold">{toBeReviewedRequirements.length}</span> av{' '}
            {requirements?.length} <span className="font-semibold">krav att granska</span>
          </p>

          <div className="flex gap-4 mb-6">
            <DigiButton
              afVariation={ButtonVariation.SECONDARY}
              afType="button"
              onAfOnClick={() => {
                setShowAbortConfirmation(true);
              }}
            >
              Avbryt
            </DigiButton>
            <DigiButton afType="submit">Starta granskning</DigiButton>
          </div>
          {upsertReview.isError && <p>Fel vid sparande</p>}
          {upsertReview.isSuccess && <p>Sparad!</p>}

          <DigiDialog
            afSize={DialogSize.MEDIUM}
            afShowDialog={showAbortConfirmation}
            afHeading={`Vill du verkligen avbryta utan att spara dina ändringar?`}
            afPrimaryButtonText="Ja, avbryt"
            afSecondaryButtonText="Nej, stanna kvar"
            onAfOnClose={() => setShowAbortConfirmation(false)}
            onAfSecondaryButtonClick={() => setShowAbortConfirmation(false)}
            onAfPrimaryButtonClick={() => {
              setShowAbortConfirmation(false);
              navigate('/');
            }}
          ></DigiDialog>

          <DigiDialog
            afSize={DialogSize.MEDIUM}
            afShowDialog={showDeleteConfirmation && review !== undefined}
            afHeading={`Vill du verkligen ta bort granskningen?`}
            afPrimaryButtonText="Ja, ta bort"
            afSecondaryButtonText="Nej, avbryt"
            onAfOnClose={() => setShowDeleteConfirmation(false)}
            onAfSecondaryButtonClick={() => setShowDeleteConfirmation(false)}
            onAfPrimaryButtonClick={handleDeleteReview}
          >
            <p>
              <strong>Vald granskning:</strong> {review?.title}
            </p>
            <p>
              All information, inklusive eventuella granskade krav, kommer att tas bort och kan inte
              återställas.
            </p>
          </DigiDialog>
        </form>
      )}
    </div>
  );
}
