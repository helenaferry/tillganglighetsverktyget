import {
  ButtonType,
  ButtonVariation,
  FormInputSearchVariation,
  FormInputType,
  LayoutBlockVariation,
  LayoutContainerVariation,
  LoaderSkeletonVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiFormCategoryFilter,
  DigiFormInputSearch,
  DigiIconRedo,
  DigiIconShareAlt,
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLoaderSkeleton,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import PageTitle from '~/components/PageTitle';
import RequirementDetails from '~/components/RequirementDetails';
import RequirementLegal from '~/components/RequirementLegal';
import { ObjectType, type Requirement, type RequirementAdditionsSetting } from '~/data/types';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || 'Granska tillgänglighet';
const regulatoryFrameworkEnv = import.meta.env.VITE_REGULATORY_FRAMEWORK || '';

export function meta() {
  return [{ title: `${applicationTitle}: Krav` }, { name: 'description', content: 'Krav' }];
}

export default function RequirementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { data: requirementsAll, isLoading: requirementsAllLoading } =
    useRequirements(regulatoryFrameworkEnv);

  const { data: categories, isLoading: isLoadingCategories } = useRequirementCategories(
    ObjectType.WEB,
  );

  const isLoading = requirementsAllLoading || isLoadingCategories;

  const requirementAdditions = JSON.parse(
    import.meta.env.VITE_REQUIREMENT_ADDITIONS || '{}',
  ) as RequirementAdditionsSetting;

  const [showObjectType] = useState<ObjectType>(ObjectType.WEB);
  const [filterFreeText, setFilterFreeText] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(true);
  const selectedRequirements = useMemo(() => {
    return showObjectType === ObjectType.WEB
      ? requirementsAll?.filter((req) => req.objectType === ObjectType.WEB)
      : requirementsAll?.filter((req) => req.objectType === ObjectType.DOCUMENT);
  }, [showObjectType, requirementsAll]);

  const searchMatches = (requirement: Requirement, search: string) => {
    const nameMatch = requirement.name.toLowerCase().includes(search.toLowerCase());
    const wcagMatch =
      requirement.wcag?.match(/\d+\.\d+\.\d+/g)?.some((num) => num.includes(search)) ?? false;
    const enMatch = requirement.en301549
      .split(',')
      .map((num) => num.trim())
      .some((num) => num.includes(search));
    return nameMatch || wcagMatch || enMatch;
  };

  const filteredRequirements = useMemo(() => {
    if (!selectedRequirements) return [];
    return selectedRequirements.filter((req) => {
      if (filterCategories.length > 0 && !filterCategories.includes(req.category)) return false;
      if (filterFreeText && !searchMatches(req, filterFreeText)) return false;
      return true;
    });
  }, [requirementsAll, filterCategories, filterFreeText, requirementAdditions]);

  const categoryFilterOptions = useMemo(() => {
    return categories?.map((category) => {
      return {
        name: category,
        hits:
          selectedRequirements
            ?.filter((req) => searchMatches(req, filterFreeText))
            .filter((req) => req.category === category).length || 0,
        selected: !showAllCategories && filterCategories.includes(category),
      };
    });
  }, [selectedRequirements, categories, filterCategories, filterFreeText]);

  useEffect(() => {
    if (id) {
      const requirement = requirementsAll?.find((req) => String(req.id) === String(id));
      if (requirement) setFilterFreeText(requirement.name);
    }
  }, [id, requirementsAll]);

  useEffect(() => {
    const categoriesSearchParam = searchParams.get('kategorier');
    const searchSearchParam = searchParams.get('sok');
    if (!categoriesSearchParam) {
      setFilterCategories([]);
    } else {
      setFilterCategories(categoriesSearchParam.split(','));
    }
    if (!searchSearchParam) {
      setFilterFreeText('');
    } else {
      setFilterFreeText(searchSearchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (filterCategories.length === 0 || filterCategories.length === categories?.length) {
      setShowAllCategories(true);
    } else {
      setShowAllCategories(false);
    }
  }, [filterCategories, categories]);

  const setUrlParams = (search: string, categories: string[]) => {
    const params: Record<string, string> = {};
    if (search) params.sok = search;
    if (categories.length > 0) params.kategorier = categories.join(',');
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${new URLSearchParams(params).toString()}`,
    );
  };

  return (
    <main>
      <DigiTypography>
        <div>
          {isLoading && <DigiLoaderSkeleton afVariation={LoaderSkeletonVariation.SECTION} />}

          <PageTitle
            h1Text="Tillgänglighets&shy;krav"
            preamble="Här hittar du alla tillgänglighetskrav samlade i en lista. Du kan söka efter specifika
            krav och läsa mer om dem för att lära dig hur du bygger tillgängliga tjänster."
          >
            <form id="requirement-filters" className="mt-12" onSubmit={(e) => e.preventDefault()}>
              {!isLoading && categories && (
                <>
                  {/* Hide type filter for now <p>
              <DigiFormFieldset afForm="requirement-filters" afLegend="Visa krav för" afName="typ">
                <DigiFormRadiogroup afName="type">
                  <DigiFormRadiobutton
                    afLabel="Webbsida eller webbtjänst"
                    afValue="web"
                    afChecked={showObjectType === ObjectType.WEB}
                    onAfOnChange={() => setShowObjectType(ObjectType.WEB)}
                  ></DigiFormRadiobutton>
                  <DigiFormRadiobutton
                    afLabel="Dokument"
                    afValue="doc"
                    afChecked={showObjectType === ObjectType.DOCUMENT}
                    onAfOnChange={() => setShowObjectType(ObjectType.DOCUMENT)}
                  ></DigiFormRadiobutton>
                </DigiFormRadiogroup>
              </DigiFormFieldset>
            </p>*/}
                  <p>
                    <DigiFormInputSearch
                      afLabel="Sök på krav"
                      afVariation={FormInputSearchVariation.MEDIUM}
                      afType={FormInputType.SEARCH}
                      afButtonText="Sök"
                      afValue={filterFreeText}
                      afButtonType={ButtonType.BUTTON}
                      onAfOnSubmitSearch={(e) => {
                        setFilterFreeText(e.detail);
                        setUrlParams(e.detail, filterCategories);
                      }}
                    ></DigiFormInputSearch>
                  </p>
                  <div>
                    <DigiFormCategoryFilter
                      key={filterFreeText + showAllCategories.toString()} // To make sure component re-renders when these change
                      afCategories={categoryFilterOptions || []}
                      afAllCategoriesSelected={showAllCategories}
                      afAllCategoriesText="Alla kravkategorier"
                      afHideToggle={true}
                      onAfOnSelectedCategoryChange={(e) => {
                        console.log(e.detail);
                        if (e.detail.length === 0 || e.detail.length === categories?.length) {
                          setShowAllCategories(true);
                          setFilterCategories([]);
                          setUrlParams(filterFreeText, []);
                          return;
                        }
                        setShowAllCategories(false);
                        setFilterCategories(e.detail);
                        setUrlParams(filterFreeText, e.detail);
                      }}
                    ></DigiFormCategoryFilter>
                  </div>
                </>
              )}
            </form>
          </PageTitle>
        </div>
        <DigiLayoutBlock afVariation={LayoutBlockVariation.TRANSPARENT}>
          <p role="status" className="flex items-center h-[3rem] ml-1">
            <strong>
              Visar {filteredRequirements.length === selectedRequirements?.length ? 'alla' : ''}{' '}
              {filteredRequirements.length} krav{' '}
            </strong>
            {filteredRequirements.length < (selectedRequirements?.length || 0) && (
              <span className="inline-flex md:ml-4">
                <DigiButton
                  afVariation={ButtonVariation.FUNCTION}
                  onAfOnClick={() => {
                    setFilterFreeText('');
                    setFilterCategories([]);
                    setSearchParams({});
                    setShowAllCategories(true);
                  }}
                  afFullWidth={false}
                >
                  Rensa dina val
                  <DigiIconRedo slot="icon" />
                </DigiButton>
              </span>
            )}
          </p>
        </DigiLayoutBlock>
        <DigiLayoutContainer afNoGutter={true} afVariation={LayoutContainerVariation.FLUID}>
          {!isLoading && filteredRequirements && (
            <DigiLayoutBlock afVariation={LayoutBlockVariation.TRANSPARENT} className="-mb-5 pb-5">
              <div
                className="skip-target"
                data-skip-link-text="Hoppa till kravlista"
                id="kravlista"
              >
                {filteredRequirements.length === 0 && (
                  <div className="">
                    <p>
                      Din sökning &quot;{filterFreeText}&quot; gav inget resultat. Försök med andra
                      sökord eller annan filtrering.
                    </p>
                  </div>
                )}
                {filteredRequirements.map((requirement) => (
                  <DigiLayoutBlock
                    key={requirement.id}
                    afVerticalPadding={true}
                    afMarginBottom={true}
                  >
                    <div className="border-b-1 border-grayscale-400 pb-5 mb-8">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                          <p
                            className="text-grayscale-700 !mb-2"
                            aria-hidden="true"
                            id={`cat-${requirement.id}`}
                          >
                            Kravkategori: {requirement.category}
                          </p>
                          <h2 aria-describedby={`cat-${requirement.id}`}>{requirement.name}</h2>
                        </div>
                        <div className="flex flex-col sm:items-end mb-4 sm:mb-0">
                          <DigiButton
                            afVariation={ButtonVariation.FUNCTION}
                            afType="button"
                            afAriaLabel={`Dela länk till krav: ${requirement.name}`}
                            onAfOnClick={() => {
                              const target = document.querySelector(`#share-${requirement.id}`);
                              if (target) {
                                target.innerHTML = `<a href="${window.location.origin}${window.location.pathname}?id=${requirement.id}">Länk kopierad till urklipp</a>`;
                              }
                              navigator.clipboard.writeText(
                                window.location.origin +
                                  window.location.pathname +
                                  `?id=${requirement.id}`,
                              );
                            }}
                          >
                            Dela <DigiIconShareAlt slot="icon" />
                          </DigiButton>
                          <p
                            className="!text-xs h-2"
                            id={`share-${requirement.id}`}
                            role="status"
                          ></p>
                        </div>
                      </div>
                      <RequirementLegal requirement={requirement} headingLevel="h3" />
                    </div>
                    <RequirementDetails
                      requirement={requirement}
                      headingLevel="h3"
                      twoCols
                    ></RequirementDetails>
                  </DigiLayoutBlock>
                ))}
              </div>
            </DigiLayoutBlock>
          )}
        </DigiLayoutContainer>
      </DigiTypography>
    </main>
  );
}
