import { DigiTable, DigiIconCheck, DigiIconExclamationTriangleFilled, DigiFormSelectFilter, DigiTag, DigiFormInput } from "@digi/arbetsformedlingen-react";
import { StyledLink } from './StyledLink';
import type { FullReview } from '~/data/types';
import { useRequirementCategories } from "~/hooks/useReviewData";
import { useState } from "react";

type Props = {
    review: FullReview;
};

export default function Review({ review }: Props) {
    const { data: categories } = useRequirementCategories();
    const [filterCategories, setFilterCategories] = useState<string[]>([]);
    const [filterStatus, setFilterStatus] = useState<string[]>(["pass", "fail", "not_assessed"]);
    const [filterFreeText, setFilterFreeText] = useState<string>("");
    const filteredRequirements = review?.requirements?.filter(req => {
        const filters = [
            filterCategories.length === 0 ? true : filterCategories.includes(req.category),
            filterStatus.length === 0 ? true : filterStatus.includes(req.check?.status ?? "not_assessed"),
            (filterFreeText && filterFreeText.length === 0) ? true : req.topic.toLowerCase().includes(filterFreeText.toLowerCase()),
        ];
        return filters.every(Boolean);
    });
    const styleFromStatus = (status: string | undefined) => {
        switch (status) {
            case 'pass':
                return "bg-[var(--digi--leaf-100)]";
            case 'fail':
                return "bg-[var(--digi--rose-50)]";
            case 'irrelevant':
                return 'bg-[var(--digi--grayscale-200)]';
            default:
                return '';
        }
    };

    return (
        <>
            {review &&
                <>
                    <div className="md:flex md:gap-4">
                        <div className="md:w-1/4">
                            <DigiFormInput
                                afLabel="Sök"
                                value={filterFreeText}
                                onAfOnInput={(e) => setFilterFreeText(e.detail.target.value)}
                            />
                        </div>
                        <div className="md:w-1/4">
                            <DigiFormSelectFilter
                                afFilterButtonTextLabel="Kategori"
                                afFilterButtonText="Visa alla"
                                afName="Sök kategori"
                                afSubmitButtonText="Filtrera"
                                afMultipleItems={true}
                                sortAlphabetically={false}
                                afListItems={categories?.map((cat: string) => ({ label: cat, value: cat })) || []}
                                onAfOnSubmitFilters={(e) => {
                                    setFilterCategories(e.detail.map((item: any) => item.value));
                                }}
                            />
                        </div>
                        <div className="md:w-1/4">
                            <DigiFormSelectFilter
                                afFilterButtonTextLabel="Status"
                                afFilterButtonText="Visa alla"
                                afName="Sök status"
                                afSubmitButtonText="Filtrera"
                                afMultipleItems={true}
                                sortAlphabetically={false}
                                afListItems={[{ label: 'Godkänd', value: 'pass', selected: filterStatus.includes('pass') }, { label: 'Underkänd', value: 'fail', selected: filterStatus.includes('fail') }, { label: 'Ej bedömd', value: 'not_assessed', selected: filterStatus.includes('not_assessed') }, { label: 'Ej relevant', value: 'irrelevant', selected: filterStatus.includes('irrelevant') },]}
                                onAfOnSubmitFilters={(e) => {
                                    setFilterStatus(e.detail.map((item: any) => item.value));
                                }}
                            />
                        </div>
                    </div>
                    <DigiTable>
                        <table>
                            <thead>
                                <tr>
                                    <th scope="col">Krav - visar {filteredRequirements.length}</th>
                                    <th scope="col">Kategori</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequirements.map(req =>
                                    <tr key={req.id} className={styleFromStatus(req.check?.status ?? undefined)}>
                                        <td>
                                            <StyledLink to={"/review/" + review.id + "/" + req.id} text={`${req.id}. ${req.topic}`} />
                                        </td>
                                        <td>
                                            <DigiTag afText={req.category} afNoIcon={true} />
                                        </td>
                                        <td>
                                            {req.check?.status === 'pass' && <span className="flex items-center gap-2"><DigiIconCheck style={{ "--digi--icon--color": "var(--digi--leaf-600)" } as React.CSSProperties} /> Godkänd</span>}
                                            {req.check?.status === 'fail' && <span className="flex items-center gap-2"><span className="block w-[1.5rem]"><DigiIconExclamationTriangleFilled style={{ "--digi--icon--color": "var(--digi--color--text--danger)" } as React.CSSProperties} /></span> Underkänd</span>}
                                            {req.check?.status === 'irrelevant' && <span className="flex items-center gap-2">Ej relevant</span>}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </DigiTable>
                </>
            }
        </>
    );
}
