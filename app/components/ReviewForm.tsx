import {
  ButtonSize,
  ButtonVariation,
  DialogSize,
  FormInputValidation,
  FormValidationMessageVariation,
  LoaderSkeletonVariation,
  LoaderSpinnerSize,
  NotificationAlertSize,
  NotificationAlertVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiDialog,
  DigiFormFieldset,
  DigiFormInput,
  DigiFormRadiobutton,
  DigiFormRadiogroup,
  DigiFormValidationMessage,
  DigiIconTrash,
  DigiLoaderSkeleton,
  DigiLoaderSpinner,
  DigiNotificationAlert,
} from '@designsystem-se/af-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { ObjectType, type PrefillRequirement, type PrefillRequirementSetting } from '~/data/types';
import contentTypeTexts from '~/helpers/contentTypeTexts';
import { useRequirementContentTypes, useRequirements } from '~/hooks/useRequirementData';
import {
  useDeleteChecksForReview,
  useDeleteReview,
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
  const allPrefillRequirements = JSON.parse(
    import.meta.env.VITE_PREFILL_REQUIREMENTS || '{}',
  ) as PrefillRequirementSetting[];

  const upsertReview = useUpsertReview();
  const prefillChecks = usePrefillRequirements();
  const deleteChecks = useDeleteChecksForReview();
  const deleteReview = useDeleteReview();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [excludedContentTypes, setExcludedContentTypes] = useState<string[]>([]);
  const [selectedPrefills, setSelectedPrefills] = useState<PrefillRequirementSetting[]>([]);
  const [objectType, setObjectType] = useState<ObjectType>(ObjectType.WEB);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [showAbortConfirmation, setShowAbortConfirmation] = useState<boolean>(false);
  const [showRemovePrefillConfirmation, setShowRemovePrefillConfirmation] =
    useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [nameValidation, setNameValidation] = useState<FormInputValidation>(
    FormInputValidation.NEUTRAL,
  );
  const [contentTypePrefillsUpdated, setContentTypePrefillsUpdated] = useState<boolean>(
    reviewId ? false : true,
  );
  const [configPrefillsUpdated, setConfigPrefillsUpdated] = useState<boolean>(
    reviewId ? false : true,
  );

  const requirements = useMemo(() => {
    return allRequirements?.filter((r) => r.objectType === objectType) || [];
  }, [allRequirements, objectType]);

  const contentTypePrefills: PrefillRequirement[] = useMemo(() => {
    return excludedContentTypes
      .map((contentType) => {
        const req = requirements.filter((r) => r.contentType === contentType);
        if (req.length > 0) {
          return {
            ids: req.map((r) => r.id),
            status: 'IRRELEVANT',
            comment:
              contentTypeTexts.find((q) => q.contentType === contentType)?.prefillComment ||
              'Kravet har förifyllts som irrelevant eftersom tjänsten, enligt tidigare ifyllda uppgifter, saknar följande innehåll: ' +
                contentType,
          };
        }
        return undefined;
      })
      .filter(Boolean) as unknown as PrefillRequirement[];
  }, [requirements, excludedContentTypes]);

  const prefillRequirements = useMemo(() => {
    if (!objectType || !requirements) return [];
    return allPrefillRequirements
      .map((setting) => {
        const filteredPrefills = setting.prefillRequirements.filter((prefill) => {
          const req = requirements.find(
            (r) => prefill.ids.includes(r.id) && r.objectType === objectType,
          );
          return req;
        });
        return {
          ...setting,
          prefillRequirements: filteredPrefills,
        };
      })
      .filter((setting) => setting.prefillRequirements.length > 0);
  }, [objectType, requirements, allPrefillRequirements]);

  const automaticPrefillSettings = useMemo(() => {
    return prefillRequirements.filter(
      (prefill: PrefillRequirementSetting) => prefill.automatic === 'true',
    );
  }, [prefillRequirements]);

  const numberAutomaticPrefillRequirements = useMemo(() => {
    return automaticPrefillSettings.flatMap((p) => p.prefillRequirements).flatMap((p) => p.ids)
      .length;
  }, [automaticPrefillSettings]);

  const toBeReviewedRequirements = useMemo(() => {
    const selectedPrefillIds = selectedPrefills.flatMap((p) =>
      p.prefillRequirements.flatMap((r) => r.ids),
    );
    const autoPrefillIds = automaticPrefillSettings
      .flatMap((p) => p.prefillRequirements)
      .flatMap((r) => r.ids);
    return (
      requirements
        ?.filter((r) => !excludedContentTypes.includes(r.contentType))
        .filter((r) => !selectedPrefillIds.includes(r.id) && !autoPrefillIds.includes(r.id)) || []
    );
  }, [requirements, excludedContentTypes, selectedPrefills, automaticPrefillSettings]);

  const activePrefills = useMemo(() => {
    // Use an object to ensure later entries overwrite earlier ones for the same id
    const active: Record<string, PrefillRequirement> = {};

    // First, find prefills for content types - IF these have been changed
    if (contentTypePrefillsUpdated) {
      contentTypePrefills.forEach((p) => {
        p.ids.forEach((id) => {
          active[id] = { ids: [id], status: p.status, comment: p.comment };
        });
      });
    }
    // Second, find user selected prefills - these override content type prefills
    selectedPrefills.forEach((prefillSetting) => {
      prefillSetting.prefillRequirements.forEach((prefill) => {
        prefill.ids.forEach((id) => {
          active[id] = { ids: [id], status: prefill.status, comment: prefill.comment };
        });
      });
    });
    // Third, find automatic prefills - these override both content type and user selected prefills
    automaticPrefillSettings.forEach((prefillSetting) => {
      prefillSetting.prefillRequirements.forEach((prefill) => {
        prefill.ids.forEach((id) => {
          active[id] = { ids: [id], status: prefill.status, comment: prefill.comment };
        });
      });
    });
    return Object.values(active);
  }, [contentTypePrefills, selectedPrefills, automaticPrefillSettings]);

  useEffect(() => {
    if (review) {
      setTitle(review.title || '');
      setExcludedContentTypes(
        (review.excludedContentTypes?.split(';').filter((s) => s !== '') as string[]) || [],
      );
      setSelectedPrefills(
        prefillRequirements.filter((p) =>
          (review.selectedPrefillIds?.split(';').filter((s) => s !== '') as string[]).includes(
            String(p.id),
          ),
        ) || [],
      );
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
    setContentTypePrefillsUpdated(true);
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

    // If updating, check if any prefills should be removed
    let removePrefillsForRequirements: string[] = [];
    if (review) {
      // Check removed excluded content types
      const removedExcludedContentTypes =
        (review?.excludedContentTypes?.split(';').filter((s) => s !== '') ?? []).filter(
          (type) => !excludedContentTypes.includes(type),
        ) || [];

      removePrefillsForRequirements = requirements
        ?.filter((r) => removedExcludedContentTypes.includes(r.contentType))
        .map((r) => r.id);

      // Check removed selected prefills
      const removedSelectedPrefills = prefillRequirements.filter((prefill) =>
        (review?.selectedPrefillIds?.split(';').filter((s) => s !== '') ?? [])
          .filter((id) => !selectedPrefills.some((p) => p.id === id))
          .includes(prefill.id),
      );

      removedSelectedPrefills.forEach((prefillSetting) => {
        if (requirements) {
          prefillSetting.prefillRequirements.forEach((prefill) => {
            removePrefillsForRequirements.push(
              ...requirements.filter((r) => prefill.ids.includes(r.id)).map((r) => r.id),
            );
          });
        }
      });

      // Remove any ids that are being set by activePrefills
      removePrefillsForRequirements = removePrefillsForRequirements.filter(
        (id) => !activePrefills.some((p) => p.ids.includes(id)),
      );
    }
    upsertReview.mutate(
      {
        id: reviewId,
        title,
        excludedContentTypes,
        selectedPrefillIds: selectedPrefills.map((p) => p.id).join(';'),
        objectType: objectType ?? ObjectType.WEB,
      },
      {
        onSuccess: (review) => {
          // If no prefills were changed, we're done.
          if (!configPrefillsUpdated && !contentTypePrefillsUpdated) {
            runIfSuccess(true, review.id);
            return;
          }
          const reviewId = review.id;

          let activePrefillsSuccess = activePrefills.length === 0;
          let removePrefillsSuccess = removePrefillsForRequirements.length === 0;

          if (activePrefills.length > 0) {
            prefillChecks.mutate(
              {
                reviewId: reviewId,
                prefills: activePrefills,
              },
              {
                onSuccess: () => {
                  activePrefillsSuccess = true;
                  runIfSuccess(activePrefillsSuccess && removePrefillsSuccess, reviewId);
                },
              },
            );
          }

          if (removePrefillsForRequirements.length > 0) {
            deleteChecks.mutate(
              {
                reviewId: reviewId,
                requirementIds: removePrefillsForRequirements,
              },
              {
                onSuccess: () => {
                  removePrefillsSuccess = true;
                  runIfSuccess(activePrefillsSuccess && removePrefillsSuccess, reviewId);
                },
              },
            );
          }
        },
        onError: () => {
          setSaving(false);
        },
      },
    );
  };

  const runIfSuccess = (success: boolean, reviewId: number) => {
    if (success) {
      setSaving(false);
      navigate(`/granskning/${reviewId}`);
    }
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
          {objectType === ObjectType.WEB && (
            <div>
              <h2>Vad innehåller din tjänst?</h2>
              <p>
                Svara nej på det innehåll som inte finns i din tjänst. Relaterade krav markeras då
                som irrelevanta, men du kan fortfarande se och ändra kraven under granskningen.
              </p>

              {review && (
                <p className="mt-4">
                  <strong>Observera!</strong> Ändringar i en påbörjad granskning kan påverka krav
                  som redan har bedömts.
                </p>
              )}
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

          {prefillRequirements
            .filter((prefill: PrefillRequirementSetting) => prefill.automatic === 'false')
            .map((prefill: PrefillRequirementSetting) => (
              <div key={prefill.id} className="mb-4">
                {prefill.heading && <h2>{prefill.heading}</h2>}
                {prefill.description && <p>{prefill.description}</p>}
                <DigiFormFieldset
                  afForm="review-form"
                  afLegend={prefill.activateText || ''}
                  afName={`fieldset-${prefill.id}`}
                >
                  <DigiFormRadiogroup
                    afName={`radiogroup-${prefill.id}`}
                    key={prefill.id}
                    onAfOnGroupChange={(e) => {
                      setConfigPrefillsUpdated(true);
                      const value = (e.target as HTMLInputElement)?.value;
                      if (value === 'true') {
                        setShowRemovePrefillConfirmation(false);
                        setSelectedPrefills([...selectedPrefills, prefill]);
                      } else {
                        if (review) {
                          setShowRemovePrefillConfirmation(true);
                        }
                        setSelectedPrefills(selectedPrefills.filter((p) => p.id !== prefill.id));
                      }
                    }}
                  >
                    <DigiFormRadiobutton
                      afLabel="Ja"
                      afValue="true"
                      afChecked={selectedPrefills.some((p) => p.id === prefill.id)}
                    ></DigiFormRadiobutton>
                    <DigiFormRadiobutton
                      afLabel="Nej"
                      afValue="false"
                      afChecked={!selectedPrefills.some((p) => p.id === prefill.id)}
                      afAriaDescribedby="prefill-warning-message"
                    ></DigiFormRadiobutton>
                  </DigiFormRadiogroup>
                </DigiFormFieldset>
              </div>
            ))}

          <div role="alert" id="prefill-warning-message">
            {showRemovePrefillConfirmation && (
              <DigiFormValidationMessage afVariation={FormValidationMessageVariation.WARNING}>
                Denna ändring kan påverka tidigare granskade krav. Om du går vidare kommer status
                för alla krav relaterade till detta val att nollställas.
              </DigiFormValidationMessage>
            )}
          </div>

          <p className="bg-[#DDF1FC] px-8 py-6 !mt-6 mb-4" role="status">
            <span className="text-4xl font-semibold">{toBeReviewedRequirements.length}</span> av{' '}
            {requirements?.length} <span className="font-semibold">krav att granska</span>
            <span className="block">
              {numberAutomaticPrefillRequirements} krav hanteras automatiskt av din organisation.
            </span>
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
              {review ? 'Spara ändring' : 'Starta granskning'}
            </DigiButton>
            {review && (
              <DigiButton
                afSize={ButtonSize.MEDIUM}
                afVariation={ButtonVariation.FUNCTION}
                afFullWidth={false}
                onAfOnClick={() => setShowDeleteConfirmation(true)}
              >
                <DigiIconTrash slot="icon" />
                Radera granskning
              </DigiButton>
            )}
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
          <DigiLoaderSpinner afSize={LoaderSpinnerSize.LARGE} afText="Sparar" />
        </div>
      )}
    </div>
  );
}
