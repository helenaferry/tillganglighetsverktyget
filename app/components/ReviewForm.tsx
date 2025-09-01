import { DigiFormInput, DigiFormSelectFilter, DigiButton, DigiFormFieldset, DigiFormCheckbox } from "@digi/arbetsformedlingen-react";
import { useApplications, useRequirementsData, useUpsertReview, useDisableChecks } from "~/hooks/useReviewData";
import { useState } from "react";

export function ReviewForm() {
    const { data: applications } = useApplications();
    const { data: requirements } = useRequirementsData();
    const disableChecks = useDisableChecks();
    const upsertReview = useUpsertReview();
    const [title, setTitle] = useState("");
    const [application, setApplication] = useState("");
    const allContentTypes = ["Ikoner & bilder", "Ljud", "Video", "Formulär", "Komponenter - Länkar", "Komponenter - Knappar", "Komponenter - Listor", "Komponenter - Tabeller", "Komponenter - Iframes", "Felhantering"];
    const [excludedContentTypes, setExcludedContentTypes] = useState<string[]>(allContentTypes);

    const handleContentChange = (e: CustomEvent) => {
        const selected = e.detail.target.value;
        const checked = e.detail.target.checked;
        if (checked) {
            setExcludedContentTypes(prev => prev.filter(type => type !== selected));
        } else {
            setExcludedContentTypes(prev => [...prev, selected]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        upsertReview.mutate({ title, application, excludedContentTypes }, {
            onSuccess: (review) => {
                const reviewId = review.id;
                const matchingRequirements = requirements?.filter(req => excludedContentTypes.includes(req.category)).map(req => req.id);
                disableChecks.mutate({ reviewId: reviewId, requirements: matchingRequirements || [] });
            }
        });

    };

    return (
        <form id="review-form" onSubmit={handleSubmit}>
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
            <DigiFormFieldset
                afForm="review-form"
                afLegend="Ange alla innehållstyper som finns i den granskade produkten (krav som specifikt rör ej valda typer kommer att filtreras bort)"
                afName="content"

            >
                {allContentTypes.map(contentType => (
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