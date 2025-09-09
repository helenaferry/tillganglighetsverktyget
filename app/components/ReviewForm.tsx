import { DigiFormInput, DigiFormSelectFilter, DigiButton, DigiFormFieldset, DigiFormCheckbox } from "@digi/arbetsformedlingen-react";
import { useApplications, useUpsertReview, useDisableChecks } from "~/hooks/useReviewData";
import { useRequirements, useRequirementContentTypes } from "~/hooks/useRequirementData";
import { useState } from "react";

export function ReviewForm() {
    const { data: applications } = useApplications();
    const { data: requirements } = useRequirements();
    const { data: contentTypes } = useRequirementContentTypes();
    const disableChecks = useDisableChecks();
    const upsertReview = useUpsertReview();
    const [title, setTitle] = useState("");
    const [application, setApplication] = useState("");
    const [excludedContentTypes, setExcludedContentTypes] = useState<string[]>([]);

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
        upsertReview.mutate({ title, application, excludedContentTypes }, {
            onSuccess: (review) => {
                const reviewId = review.id;
                const matchingRequirements = requirements?.filter(req => excludedContentTypes.includes(req.contentType)).map(req => req.id);
                disableChecks.mutate({ reviewId: reviewId, requirements: matchingRequirements || [] });
            }
        });
    };

    return (
        <form id="review-form" className="content-container" onSubmit={handleSubmit}>
            <DigiFormInput
                afLabel="Rubrik"
                afValue={title}
                onAfOnInput={e => setTitle(e.detail.target.value)} />
            <DigiFormSelectFilter // TODO How set value?
                afFilterButtonText="Välj produkt"
                afFilterButtonTextLabel="Produkt som ska granskas"
                afName="Produkt"
                afListItems={applications?.map(app => ({ value: String(app.id), label: app.name ?? "" })) ?? []}
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
                        // afChecked={!excludedContentTypes.includes(contentType)} TODO handle this when we implement edit
                        onAfOnChange={(e) => {
                            handleContentChange(e);
                        }} afLabel={contentType}></DigiFormCheckbox>
                ))}
            </DigiFormFieldset>
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
            </DigiFormFieldset>
            <DigiButton afType="submit">Spara</DigiButton>
            {upsertReview.isError && <p>Fel vid sparande</p>}
            {upsertReview.isSuccess && <p>Sparad!</p>}
        </form>
    );
}