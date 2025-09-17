import {
  DigiButton,
  DigiFormInput,
  DigiFormSelectFilter,
  DigiIconChevronDown,
  DigiIconChevronUp,
  DigiLayoutContainer,
  DigiLoaderSkeleton,
  DigiTable,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@digi/arbetsformedlingen-react';
import {
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
  LoaderSkeletonVariation,
  ButtonVariation,
} from '@digi/arbetsformedlingen';
import {
  useRequirements,
  useRequirementCategories,
  useRequirementContentTypes,
} from '~/hooks/useRequirementData';
import { type PrefillRequirementSetting, type RequirementAdditionsSetting } from '~/data/types';
import RequirementDetails from '~/components/RequirementDetails';
import { useMemo, useState } from 'react';

export function meta() {
  return [{ title: 'Tillgänglighetsverktyget: Krav' }, { name: 'description', content: 'Krav' }];
}

export default function RequirementsPage() {
  const { data: requirements, isLoading: isLoadingRequirements } = useRequirements();
  const { data: categories, isLoading: isLoadingCategories } = useRequirementCategories();
  const { data: contentTypes, isLoading: isLoadingContentTypes } = useRequirementContentTypes();
  const isLoading = isLoadingRequirements || isLoadingCategories || isLoadingContentTypes;

  const prefillRequirements = JSON.parse(
    import.meta.env.VITE_PREFILL_REQUIREMENTS || '{}',
  ) as PrefillRequirementSetting[];
  const requirementAdditions = JSON.parse(
    import.meta.env.VITE_REQUIREMENT_ADDITIONS || '{}',
  ) as RequirementAdditionsSetting;

  const [expandedRequirements, setExpandedRequirements] = useState<string[]>([]);

  const hasRequirementAdditions = useMemo(() => {
    return requirementAdditions.items.length > 0;
  }, [requirements, requirementAdditions]);

  const [filterFreeText, setFilterFreeText] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterContentTypes, setFilterContentTypes] = useState<string[]>([]);
  const [filterPrefill, setFilterPrefill] = useState<string[]>([]);
  const [filterHasAdditions, setFilterHasAdditions] = useState<string[]>([]);
  const filteredRequirements = useMemo(() => {
    if (!requirements) return [];
    return requirements.filter((req) => {
      if (filterCategories.length > 0 && !filterCategories.includes(req.category)) return false;
      if (filterFreeText && !req.name.toLowerCase().includes(filterFreeText.toLowerCase()))
        return false;
      if (filterContentTypes.length > 0 && !filterContentTypes.includes(req.contentType))
        return false;
      if (filterHasAdditions.length === 1) {
        const hasAddition = requirementAdditions.items.some((item) => item.id === req.id);
        if (filterHasAdditions[0] === 'yes' && !hasAddition) return false;
        if (filterHasAdditions[0] === 'no' && hasAddition) return false;
      }
      if (filterPrefill.length > 0) {
        const found = prefillRequirements.some(
          (item) =>
            filterPrefill.includes(String(item.id)) &&
            item.prefillRequirements.some((r) => r.id === req.id),
        );
        if (!found) return false;
      }
      return true;
    });
  }, [
    requirements,
    filterCategories,
    filterFreeText,
    filterContentTypes,
    filterPrefill,
    filterHasAdditions,
    prefillRequirements,
    requirementAdditions,
  ]);
  if (!requirements) return null;
  return (
    <DigiLayoutContainer afVerticalPadding>
      <DigiTypography>
        <div>
          <DigiTypographyHeadingJumbo
            afText="Krav"
            afLevel={TypographyHeadingJumboLevel.H1}
            afVariation={TypographyHeadingJumboVariation.PRIMARY}
          ></DigiTypographyHeadingJumbo>

          <p>
            Här kan du se de tillgänglighetskrav som finns i verktyget och vilka inställningar för
            förifyllnad och tillägg som är gjorda i din verktygskonfiguration.
          </p>
          <h2>Förifyllnad</h2>
          <p>
            Förifyllnad styrs av <strong>Innehållstyp</strong> och systemkonfiguration för{' '}
            <strong>Förifyllnad</strong>.
          </p>
          <p>
            <strong>Innehållstyp:</strong> När du startar en granskning kan du välja bort krav som
            märkts med en specifik innehållstyp. Denna märkning finns i grunddatat.
          </p>
          <p>
            <strong>Förifyllnad</strong> kan vara antingen valbar eller automatisk. I din
            konfiguration finns:
          </p>

          {prefillRequirements.map((item) => (
            <p key={item.id} className="ml-4">
              <strong>{item.automatic === 'true' ? 'Automatisk-' : 'Valbar-'}</strong>
              {item.id} {item.activateText}
            </p>
          ))}
          <p>
            Kolumnen <strong>Förifyllnad</strong> i tabellen visar vilka krav som förifylls av
            respektive förifyllnad och med vilken status.
          </p>

          {isLoading && <DigiLoaderSkeleton afVariation={LoaderSkeletonVariation.SECTION} />}
          {!isLoading && filteredRequirements && (
            <div>
              <div className="md:flex md:gap-4">
                <div className="md:w-1/5">
                  <DigiFormInput
                    afLabel="Sök"
                    value={filterFreeText}
                    onAfOnInput={(e) => setFilterFreeText(e.detail.target.value)}
                  />
                </div>
                <div className="md:w-1/5">
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
                <div className="md:w-1/5">
                  <DigiFormSelectFilter
                    afFilterButtonTextLabel="Innehållstyp"
                    afFilterButtonText="Visa alla"
                    afName="Sök innehållstyp"
                    afSubmitButtonText="Filtrera"
                    afMultipleItems={true}
                    sortAlphabetically={false}
                    afListItems={
                      contentTypes?.map((type: string) => ({
                        label: type,
                        value: type,
                        selected: filterContentTypes.includes(type),
                      })) || []
                    }
                    onAfOnSubmitFilters={(e) => {
                      setFilterContentTypes(e.detail.map((item: { value: string }) => item.value));
                    }}
                  />
                </div>
                <div className="md:w-1/5">
                  <DigiFormSelectFilter
                    afFilterButtonTextLabel="Förifyllnad"
                    afFilterButtonText="Visa alla"
                    afName="Sök förifyllnad"
                    afSubmitButtonText="Filtrera"
                    afMultipleItems={true}
                    sortAlphabetically={false}
                    afListItems={
                      prefillRequirements?.map((item) => ({
                        label: `${item.automatic === 'true' ? 'Automatisk-' : 'Valbar-'}${item.id} ${item.activateText} `,
                        value: String(item.id),
                        selected: filterPrefill.includes(String(item.id)),
                      })) || []
                    }
                    onAfOnSubmitFilters={(e) => {
                      setFilterPrefill(e.detail.map((item: { value: string }) => item.value));
                    }}
                  />
                </div>
                <div className="md:w-1/5">
                  <DigiFormSelectFilter
                    afFilterButtonTextLabel="Har tillägg"
                    afFilterButtonText="Visa alla"
                    afName="Sök tillägg"
                    afSubmitButtonText="Filtrera"
                    afMultipleItems={true}
                    sortAlphabetically={false}
                    afListItems={[
                      { label: 'Ja', value: 'yes', selected: filterHasAdditions.includes('yes') },
                      { label: 'Nej', value: 'no', selected: filterHasAdditions.includes('no') },
                    ]}
                    onAfOnSubmitFilters={(e) => {
                      setFilterHasAdditions(e.detail.map((item: { value: string }) => item.value));
                    }}
                  />
                </div>
              </div>
              <div className="content-container">
                <DigiTable>
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Krav - Visar {filteredRequirements.length} av {requirements.length}{' '}
                        </th>
                        <th>Kategori</th>
                        <th>Innehållstyp</th>
                        <th>Förifyllnad</th>
                        {hasRequirementAdditions && <th>Tillägg</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequirements.map((req) => (
                        <>
                          <tr key={req.id}>
                            <td className="max-w-[20rem] overflow-hidden">
                              <DigiButton
                                afVariation={ButtonVariation.FUNCTION}
                                afAriaControls={req.id}
                                afAriaExpanded={expandedRequirements.includes(req.id)}
                                onClick={() =>
                                  setExpandedRequirements((prev) =>
                                    prev.includes(req.id)
                                      ? prev.filter((id) => id !== req.id)
                                      : [...prev, req.id],
                                  )
                                }
                              >
                                <span slot="icon">
                                  {expandedRequirements.find((id) => id === req.id) ? (
                                    <DigiIconChevronUp />
                                  ) : (
                                    <DigiIconChevronDown />
                                  )}
                                </span>
                                {req.name}
                              </DigiButton>
                            </td>
                            <td>{req.category}</td>
                            <td>{req.contentType}</td>
                            <td>
                              {prefillRequirements.map((item) => {
                                return item.prefillRequirements.find((r) => r.id === req.id)
                                  ? item.automatic === 'true'
                                    ? 'Automatisk-' +
                                      item.id +
                                      ' ' +
                                      item.prefillRequirements.find((r) => r.id === req.id)
                                        ?.status +
                                      ' '
                                    : 'Valbar-' +
                                      item.id +
                                      ' ' +
                                      item.prefillRequirements.find((r) => r.id === req.id)
                                        ?.status +
                                      ' '
                                  : '';
                              })}
                            </td>
                            {hasRequirementAdditions && (
                              <td>
                                {requirementAdditions.items.find((item) => item.id === req.id)
                                  ? 'Ja'
                                  : ''}
                              </td>
                            )}
                          </tr>
                          {expandedRequirements.includes(req.id) && (
                            <tr id={req.id}>
                              <td colSpan={4}>
                                <h2>{req.name}</h2>
                                <p>
                                  <strong>ID: </strong>
                                  {req.id}
                                </p>
                                <RequirementDetails requirement={req} />
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </DigiTable>
              </div>
            </div>
          )}
        </div>
      </DigiTypography>
    </DigiLayoutContainer>
  );
}
