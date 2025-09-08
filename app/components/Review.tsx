import { DigiTable, DigiFormSelectFilter, DigiTag, DigiFormInput } from "@digi/arbetsformedlingen-react";
import { StyledLink } from './StyledLink';
import { Status, type RequirementWithCheck, type Review } from '~/data/types';
import { useRequirementCategories } from "~/hooks/useReviewData";
import { useState } from "react";
import StatusBadge from "./StatusBadge";

type Props = {
    requirements: RequirementWithCheck[];
    review: Review;
};

export default function Review({ review, requirements }: Props) {
    const { data: categories } = useRequirementCategories();
    const [filterCategories, setFilterCategories] = useState<string[]>([]);
    const [filterStatus, setFilterStatus] = useState<Status[]>([Status.PASS, Status.FAIL, Status.NOT_ASSESSED]);
    const [filterFreeText, setFilterFreeText] = useState<string>("");
    const filteredRequirements = requirements?.filter(req => {
        const filters = [
            filterCategories.length === 0 ? true : filterCategories.includes(req.category),
            filterStatus.length === 0 ? true : filterStatus.includes(req.check?.status ?? Status.NOT_ASSESSED),
            (filterFreeText && filterFreeText.length === 0) ? true : req.topic.toLowerCase().includes(filterFreeText.toLowerCase()),
        ];
        return filters.every(Boolean);
    });

    return (
        <div>
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
                                afListItems={[{ label: 'Godkänd', value: Status.PASS.toString(), selected: filterStatus.includes(Status.PASS) }, { label: 'Underkänd', value: Status.FAIL.toString(), selected: filterStatus.includes(Status.FAIL) }, { label: 'Ej bedömd', value: Status.NOT_ASSESSED.toString(), selected: filterStatus.includes(Status.NOT_ASSESSED) }, { label: 'Ej relevant', value: Status.IRRELEVANT.toString(), selected: filterStatus.includes(Status.IRRELEVANT) },]}
                                onAfOnSubmitFilters={(e) => {
                                    setFilterStatus(e.detail.map((item: any) => Number(item.value) as Status));
                                }}
                            />
                        </div>
                    </div>
                    <div className="content-container">
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
                                        <tr key={req.id}>
                                            <td>
                                                <StyledLink to={"/review/" + review.id + "/" + req.id} text={`${req.id}. ${req.topic}`} />
                                            </td>
                                            <td>
                                                <DigiTag afText={req.category} afNoIcon={true} />
                                            </td>
                                            <td>
                                                <StatusBadge status={req.check?.status} />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </DigiTable></div>
                </>
            }
        </div>
    );
}
