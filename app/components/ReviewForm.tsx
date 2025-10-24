import {
  ButtonSize,
  ButtonVariation,
  DialogSize,
  FormInputValidation,
  LoaderSkeletonVariation,
  LoaderSpinnerSize,
  NotificationAlertSize,
  NotificationAlertVariation,
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
  DigiLoaderSpinner,
  DigiNotificationAlert,
} from '@digi/arbetsformedlingen-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { ObjectType, type PrefillRequirement } from '~/data/types';
import contentTypeTexts from '~/helpers/contentTypeTexts';
import { useRequirementContentTypes, useRequirements } from '~/hooks/useRequirementData';
import {
  useDeleteReview,
  useEnableChecks,
  usePrefillRequirements,
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

  const enableChecks = useEnableChecks();
  const upsertReview = useUpsertReview();
  const prefillChecks = usePrefillRequirements();
  const deleteReview = useDeleteReview();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [excludedContentTypes, setExcludedContentTypes] = useState<string[]>([]);
  // const [selectedPrefills, setSelectedPrefills] = useState<PrefillRequirementSetting[]>([]);
  const [objectType, setObjectType] = useState<ObjectType>(ObjectType.WEB);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [showAbortConfirmation, setShowAbortConfirmation] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingText, setSavingText] = useState<string>('Sparar information om granskningen');
  const [nameValidation, setNameValidation] = useState<FormInputValidation>(
    FormInputValidation.NEUTRAL,
  );

  const requirements = useMemo(() => {
    return allRequirements?.filter((r) => r.objectType === objectType) || [];
  }, [allRequirements, objectType]);

  const toBeReviewedRequirements = useMemo(() => {
    return requirements?.filter((r) => !excludedContentTypes.includes(r.contentType)) || [];
  }, [requirements, excludedContentTypes]);

  const contentTypePrefills: PrefillRequirement[] = useMemo(() => {
    return excludedContentTypes
      .map((contentType) => {
        const req = requirements.filter((r) => r.contentType === contentType);
        if (req.length > 0) {
          return {
            ids: req.map((r) => r.id),
            status: 'IRRELEVANT',
            comment: contentTypeTexts.find((q) => q.contentType === contentType)?.prefillComment,
          };
        }
        return undefined;
      })
      .filter(Boolean) as unknown as PrefillRequirement[];
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
      setExcludedContentTypes(
        (review.excludedContentTypes?.split(';').filter((s) => s !== '') as string[]) || [],
      );
      // setSelectedPrefills(
      //   prefillRequirements.filter((p) =>
      //     review.selectedPrefillIds?.split(';').includes(String(p.id)),
      //   ) || [],
      // );
      setObjectType((review.objectType as ObjectType) || ObjectType.WEB);
    }
  }, [review]);

  useEffect(() => {
    if (saving) {
      document.querySelector('body')?.classList.add('overflow-hidden');
    } else {
      document.querySelector('body')?.classList.remove('overflow-hidden');
    }
  }, [saving]);

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
    const form = e.target as HTMLFormElement;
    const isValid = form.checkValidity();
    const nameField = form.querySelector('#reviewName') as HTMLInputElement;
    if (!nameField.validity.valid) {
      setNameValidation(FormInputValidation.ERROR);
      nameField.focus();
    }
    if (!isValid) return;

    setSaving(true);

    // Check if user has removed any excluded content types
    const currentExcludedContentTypes = review?.excludedContentTypes?.split(';') || [];
    const removedTypes = currentExcludedContentTypes
      .filter((type: string) => !excludedContentTypes.includes(type))
      .filter((type: string) => type !== '');
    const hasTypesToRemove = removedTypes.length > 0;
    const hasContentTypePrefills = contentTypePrefills.length > 0;

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

          if (removedTypes.length > 0 || contentTypePrefills.length > 0) {
            setSavingText('Förifyller krav baserat på dina val');
          } else {
            setSavingText('Sparar information om granskningen');
            setSaving(false);
          }

          // enableChecks deletes checks if they have status irrelevant, otherwise leaves them be:
          if (hasTypesToRemove) {
            const requirementsToEnable = requirements
              ?.filter((req) => removedTypes.includes(req.contentType))
              .map((req) => req.id);
            enableChecks.mutate({ reviewId: reviewId, requirements: requirementsToEnable || [] });
          }

          // Prefill checks based on content types
          if (hasContentTypePrefills) {
            prefillChecks.mutate(
              {
                reviewId: reviewId,
                prefills: contentTypePrefills,
              },
              {
                onSuccess: () => {
                  setSaving(false);
                  navigate(`/granskning/${review.id}`);
                },
              },
            );
          }

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

          if (!hasTypesToRemove && !hasContentTypePrefills) {
            setSaving(false);
            navigate(`/granskning/${review.id}`);
          }
        },
        onError: () => {
          setSaving(false);
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
        <form id="review-form" onSubmit={handleSubmit} noValidate>
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
                afId="reviewName"
                afLabel="Namn på granskning"
                afLabelDescription="Namnet visas i listan med alla granskningar så att du kan hitta din granskning igen."
                afValue={title}
                onAfOnInput={(e) => {
                  const value = e.detail.target.value;
                  if (value.trim().length > 0) {
                    setNameValidation(FormInputValidation.NEUTRAL);
                  }
                  setTitle(value);
                }}
                afRequired={true}
                afValidationText="Ange ett namn för granskningen"
                afValidation={nameValidation}
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
                    contentTypeTexts.find((q) => q.contentType === contentType)?.question ||
                    contentType;
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
            <DigiButton afType="submit">
              {review ? 'Ändra uppgifter' : 'Starta granskning'}
            </DigiButton>
          </div>
          {upsertReview.isError && (
            <DigiNotificationAlert
              afSize={NotificationAlertSize.LARGE}
              afVariation={NotificationAlertVariation.DANGER}
              afHeading="Fel vid sparande"
            >
              Det gick inte att spara granskningen. Försök igen senare.
            </DigiNotificationAlert>
          )}

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
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
          <DigiLoaderSpinner afSize={LoaderSpinnerSize.LARGE} afText={savingText} />
        </div>
      )}
    </div>
  );
}
