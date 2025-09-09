import { DigiFormInput, DigiFormSelectFilter, DigiButton, DigiFormFieldset, DigiFormCheckbox, DigiLoaderSkeleton } from "@digi/arbetsformedlingen-react";
import { useApplications, useUpsertReview, useDisableChecks, useEnableChecks, useReviewById } from "~/hooks/useReviewData";
import { useRequirements, useRequirementContentTypes } from "~/hooks/useRequirementData";
import { useState, useEffect } from "react";
import { LoaderSkeletonVariation } from "@digi/arbetsformedlingen";

type Props = {
    reviewId?: string;
}

export function ReviewForm({ reviewId }: Props) {
    const { data: applications, isLoading: isLoadingApplications } = useApplications();
    const { data: requirements, isLoading: isLoadingRequirements } = useRequirements();
    const { data: contentTypes, isLoading: isLoadingContentTypes } = useRequirementContentTypes();
    const { review, isLoading: isLoadingReview } = useReviewById(String(reviewId));
    const loading = isLoadingApplications || isLoadingRequirements || isLoadingContentTypes || isLoadingReview;

    const disableChecks = useDisableChecks();
    const enableChecks = useEnableChecks();
    const upsertReview = useUpsertReview();

    const [title, setTitle] = useState<string>("");
    const [application, setApplication] = useState<string>("");
    const [excludedContentTypes, setExcludedContentTypes] = useState<string[]>([]);

    useEffect(() => {
        if (review) {
            setTitle(review.title || "");
            setApplication(String(review.application.id) || "");
            setExcludedContentTypes(review.excludedContentTypes?.split(";") || []);
        }
    }, [review]);

    const handleContentChange = (e: CustomEvent) => {
        const selected = e.detail.target.value;
        const checked = e.detail.target.checked;
        if (checked) {
            setExcludedContentTypes(prev => [...prev, selected]);
        } else {
            setExcludedContentTypes(prev => prev.filter(type => type !== selected));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if excluded content types differ from current review's excluded content types
        const currentExcludedContentTypes = review?.excludedContentTypes?.split(";") || [];
        const addedTypes = excludedContentTypes.filter(type => !currentExcludedContentTypes.includes(type));
        const removedTypes = currentExcludedContentTypes.filter(type => !excludedContentTypes.includes(type));

        upsertReview.mutate({ id: reviewId, title, application, excludedContentTypes }, {
            onSuccess: (review) => {
                const reviewId = review.id;
                const requirementsToDisable = requirements?.filter(req => addedTypes.includes(req.contentType)).map(req => req.id);
                disableChecks.mutate({ reviewId: reviewId, requirements: requirementsToDisable || [] });
                const requirementsToEnable = requirements?.filter(req => removedTypes.includes(req.contentType)).map(req => req.id);
                enableChecks.mutate({ reviewId: reviewId, requirements: requirementsToEnable || [] });
            }
        });
    };

    return (
        <div>
            {loading && <DigiLoaderSkeleton
                afVariation={LoaderSkeletonVariation.SECTION}
                afCount={4}
            >
            </DigiLoaderSkeleton>}
            {!loading && (!reviewId || review) &&
                <form id="review-form" className="content-container" onSubmit={handleSubmit}>
                    <DigiFormInput
                        afLabel="Rubrik"
                        afValue={title}
                        onAfOnInput={e => setTitle(e.detail.target.value)} />
                    <DigiFormSelectFilter
                        afFilterButtonText="Välj produkt"
                        afFilterButtonTextLabel="Produkt som ska granskas"
                        afName="Produkt"
                        afListItems={applications?.map(app => ({ value: String(app.id), label: app.name ?? "", selected: String(app.id) === application })) ?? []}
                        onAfOnSelect={(e) => setApplication(e.detail[0].value)}
                    />
                    <h2>Exkludera irrelevanta krav</h2>
                    <p>Den totala mängden krav är stor och för att minska arbetsbelastningen är det viktigt att exkludera irrelevanta krav.
                        Bocka för innehållstyper som saknas i granskningsobjektet, så markeras relaterade krav automatiskt som irrelevanta.
                        De döljs då i granskningen, men du kan välja att visa dem för att kontrollera att de verkligen är irrelevanta
                        och återta dem till granskningen om du vill.</p>
                    <DigiFormFieldset
                        afForm="review-form"
                        afLegend="Vänligen välj de innehållstyper som inte är relevanta för granskningsobjektet"
                        afName="content"

                    >
                        {contentTypes && contentTypes.map(contentType => (
                            <DigiFormCheckbox
                                key={contentType}
                                afValue={contentType}
                                afChecked={excludedContentTypes.includes(contentType)}
                                onAfOnChange={(e) => {
                                    handleContentChange(e);
                                }} afLabel={contentType}></DigiFormCheckbox>
                        ))}
                    </DigiFormFieldset>
                    {/*
                <DigiFormFieldset
                    afForm="review-form"
                    afLegend="Andra förutsättningar"
                    afName="other"
                >
                    <DigiFormCheckbox
                        afValue="digi"
                        onAfOnChange={(e) => {
                            if (e.detail.target.checked) {
                                setExcludedContentTypes([...excludedContentTypes, "Kontraster", "Färg & form"]);
                            } else {
                                setExcludedContentTypes(excludedContentTypes.filter(type => type !== "Kontraster" && type !== "Färg & form"));
                            }
                        }} afLabel="Produkten använder enbart designsystemets komponenter och uppfyller därmed krav inom kategorierna Kontraster och Färg & form"></DigiFormCheckbox>
                </DigiFormFieldset>*/}
                    <DigiButton afType="submit">Spara</DigiButton>
                    {upsertReview.isError && <p>Fel vid sparande</p>}
                    {upsertReview.isSuccess && <p>Sparad!</p>}
                </form>}
        </div>
    );
}