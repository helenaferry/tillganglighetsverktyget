import { DigiFormInput, DigiFormSelectFilter, DigiButton } from "@digi/arbetsformedlingen-react";
import { useApplications, useUpsertReview } from "~/hooks/useReviewData";
import { useState } from "react";

export function ReviewForm() {
    const { data: applications } = useApplications();
    const upsertReview = useUpsertReview();
    const [title, setTitle] = useState("");
    const [application, setApplication] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        upsertReview.mutate({ title, application });
    };

    return (
        <form onSubmit={handleSubmit}>
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
            <DigiButton afType="submit">Spara</DigiButton>
            {upsertReview.isError && <p>Fel vid sparande</p>}
            {upsertReview.isSuccess && <p>Sparad!</p>}
        </form>
    );
}