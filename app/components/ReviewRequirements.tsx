import {
  DigiFormInput,
  DigiFormSelectFilter,
  DigiTable,
  DigiTag,
} from '@digi/arbetsformedlingen-react';
import { useState } from 'react';

import { type RequirementWithCheck, type Review, Status } from '~/data/types';

import StatusBadge from './StatusBadge';
import { StyledLink } from './StyledLink';

type Props = {
  requirements: RequirementWithCheck[];
  review: Review;
  categories?: string[];
};

export default function ReviewRequirements({ review, requirements, categories }: Props) {
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<Status[]>([]);
  const [filterFreeText, setFilterFreeText] = useState<string>('');
  const filteredRequirements = requirements?.filter((req) => {
    const filters = [
      filterCategories.length === 0 ? true : filterCategories.includes(req.category),
      filterStatus.length === 0
        ? true
        : filterStatus.includes(req.check?.status ?? Status.NOT_ASSESSED),
      filterFreeText && filterFreeText.length === 0
        ? true
        : req.name.toLowerCase().includes(filterFreeText.toLowerCase()),
    ];
    return filters.every(Boolean);
  });

  return (
    <div>
      {review && (
        <>
          <div className="md:flex md:gap-4 p-5">
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
                afListItems={
                  categories?.map((cat: string) => ({
                    label: cat,
                    value: cat,
                    selected: filterCategories.includes(cat),
                  })) || []
                }
                onAfOnSubmitFilters={(e) => {
                  setFilterCategories(e.detail.map((item: { value: string }) => item.value));
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
                afListItems={[
                  {
                    label: 'Godkänt',
                    value: Status.PASS.toString(),
                    selected: filterStatus.includes(Status.PASS),
                  },
                  {
                    label: 'Underkänt',
                    value: Status.FAIL.toString(),
                    selected: filterStatus.includes(Status.FAIL),
                  },
                  {
                    label: 'Ej bedömt',
                    value: Status.NOT_ASSESSED.toString(),
                    selected: filterStatus.includes(Status.NOT_ASSESSED),
                  },
                  {
                    label: 'Ej relevant',
                    value: Status.IRRELEVANT.toString(),
                    selected: filterStatus.includes(Status.IRRELEVANT),
                  },
                ]}
                onAfOnSubmitFilters={(e) => {
                  setFilterStatus(
                    e.detail.map((item: { value: string }) => Number(item.value) as Status),
                  );
                }}
              />
            </div>
          </div>
          <div className="container">
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
                  {filteredRequirements.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <StyledLink
                          to={'/granskning/' + review.id + '/' + req.id}
                          text={req.name}
                        />
                      </td>
                      <td>
                        <DigiTag
                          afText={req.category}
                          afNoIcon={true}
                          onAfOnClick={() => setFilterCategories([req.category])}
                        />
                      </td>
                      <td>
                        <StatusBadge status={req.check?.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DigiTable>
          </div>
        </>
      )}
    </div>
  );
}
