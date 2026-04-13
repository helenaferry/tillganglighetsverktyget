import {
  ButtonType,
  ButtonVariation,
  FormInputSearchVariation,
  FormInputType,
  FormValidationMessageVariation,
  LayoutBlockVariation,
  LayoutContainerVariation,
  LoaderSkeletonVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiFormCategoryFilter,
  DigiFormFieldset,
  DigiFormInputSearch,
  DigiFormRadiobutton,
  DigiFormRadiogroup,
  DigiFormValidationMessage,
  DigiIconShareAlt,
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLoaderSkeleton,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import PageTitle from '~/components/PageTitle';
import RequirementDetails from '~/components/RequirementDetails';
import RequirementLegal from '~/components/RequirementLegal';
import ResetButton from '~/components/ResetButton';
import ScreenReaderAlert from '~/components/ScreenReaderAlert';
import { ObjectType, type Requirement } from '~/data/types';
import { organizationConfigurations } from '~/helpers/helpers';
import { useRequirements } from '~/hooks/useRequirementData';
import i18n from '~/lang/i18n';

const applicationTitle = organizationConfigurations().applicationTitle;
const regulatoryFrameworkEnv = organizationConfigurations().regulatoryFramework;

export function meta() {
  return [
    { title: `${i18n.t('requirements.Title')} - ${applicationTitle}` },
    { name: 'description', content: i18n.t('requirements.MetaDescription') },
  ];
}

export default function RequirementsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [showObjectType, setShowObjectType] = useState<ObjectType>(ObjectType.WEB);

  const { data: requirementsAll, isLoading: requirementsAllLoading } =
    useRequirements(regulatoryFrameworkEnv);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        (requirementsAll ?? [])
          .filter((req) => req.objectType === showObjectType)
          .map((req) => req.category),
      ),
    );
  }, [requirementsAll, showObjectType]);

  const isLoading = requirementsAllLoading;

  const requirementAdditions = organizationConfigurations().requirementAdditions;

  const [timesFiltered, setTimesFiltered] = useState(0);
  const [filterFreeText, setFilterFreeText] = useState('');
  const [filterSpecific, setFilterSpecific] = useState<Requirement>();
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(true);
  const selectedRequirements = useMemo(() => {
    return showObjectType === ObjectType.WEB
      ? requirementsAll?.filter((req) => req.objectType === ObjectType.WEB)
      : requirementsAll?.filter((req) => req.objectType === ObjectType.DOCUMENT);
  }, [showObjectType, requirementsAll]);
  const [shareMessage, setShareMessage] = useState('');
  const [shareId, setShareId] = useState('');
  const [shareCount, setShareCount] = useState(0);

  const searchMatches = (requirement: Requirement, search: string) => {
    const nameMatch = requirement.name.toLowerCase().includes(search.toLowerCase());
    const wcagMatch =
      requirement.wcag?.match(/\d+\.\d+\.\d+/g)?.some((num) => num === search) ?? false;
    const enMatch = (requirement.en301549 ?? '')
      .split(',')
      .map((num) => num.trim())
      .some((num) => num === search);
    return nameMatch || wcagMatch || enMatch;
  };

  const filteredRequirements = useMemo(() => {
    if (!selectedRequirements) return [];
    if (filterSpecific) return [filterSpecific];
    return selectedRequirements.filter((req) => {
      if (filterCategories.length > 0 && !filterCategories.includes(req.category)) return false;
      if (filterFreeText && !searchMatches(req, filterFreeText)) return false;
      return true;
    });
  }, [selectedRequirements, filterSpecific, filterCategories, filterFreeText, requirementAdditions]);

  const categoryFilterOptions = useMemo(() => {
    return categories?.map((category) => {
      return {
        name: category,
        hits:
          selectedRequirements
            ?.filter((req) => (filterSpecific ? req.id === filterSpecific.id : true))
            ?.filter((req) => (filterFreeText ? searchMatches(req, filterFreeText) : true))
            .filter((req) => req.category === category).length || 0,
        selected: !showAllCategories && filterCategories.includes(category),
      };
    });
  }, [
    selectedRequirements,
    categories,
    filterCategories,
    filterFreeText,
    filterSpecific,
    showAllCategories,
  ]);

  useEffect(() => {
    if (id) {
      const requirement = requirementsAll?.find((req) => String(req.id) === String(id));
      if (requirement) setFilterSpecific(requirement);
      setShowObjectType(requirement?.objectType ?? ObjectType.WEB);
    }
  }, [id, requirementsAll]);

  useEffect(() => {
    const categoriesSearchParam = searchParams.get('kategorier');
    const searchSearchParam = searchParams.get('sok');
    const typeSearchParam = searchParams.get('type');
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
    if (typeSearchParam === ObjectType.DOCUMENT) {
      setShowObjectType(ObjectType.DOCUMENT);
    } else {
      setShowObjectType(ObjectType.WEB);
    }
  }, [searchParams]);

  useEffect(() => {
    if (filterCategories.length === 0 || filterCategories.length === categories?.length) {
      setShowAllCategories(true);
    } else {
      setShowAllCategories(false);
    }
  }, [filterCategories, categories]);

  const setUrlParams = (search: string, categories: string[], objectType: ObjectType) => {
    const params: Record<string, string> = {};
    if (search) params.sok = search;
    if (categories.length > 0) params.kategorier = categories.join(',');
    if (objectType !== ObjectType.WEB) params.type = objectType;
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
          <PageTitle h1Text={t('requirements.Title')} preamble={t('requirements.Preamble')}>
            <form id="requirement-filters" className="mt-12" onSubmit={(e) => e.preventDefault()}>
              {isLoading && <DigiLoaderSkeleton afVariation={LoaderSkeletonVariation.SECTION} />}
              {!isLoading && categories && (
                <>
                  <p>
                    <DigiFormFieldset
                      afForm="requirement-filters"
                      afLegend="Visa krav för"
                      afName="typ"
                    >
                      <DigiFormRadiogroup afName="type">
                        <DigiFormRadiobutton
                          afLabel="Webbsida eller webbtjänst"
                          afValue="web"
                          afChecked={showObjectType === ObjectType.WEB}
                          onAfOnChange={() => {
                            setShowObjectType(ObjectType.WEB);
                            setUrlParams(filterFreeText, filterCategories, ObjectType.WEB);
                          }}
                        ></DigiFormRadiobutton>
                        <DigiFormRadiobutton
                          afLabel="Dokument"
                          afValue="doc"
                          afChecked={showObjectType === ObjectType.DOCUMENT}
                          onAfOnChange={() => {
                            setShowObjectType(ObjectType.DOCUMENT);
                            setUrlParams(filterFreeText, filterCategories, ObjectType.DOCUMENT);
                          }}
                        ></DigiFormRadiobutton>
                      </DigiFormRadiogroup>
                    </DigiFormFieldset>
                  </p>
                  <p>
                    <DigiFormInputSearch
                      afId="requirement-search"
                      afLabel={t('requirements.SearchLabel')}
                      afVariation={FormInputSearchVariation.MEDIUM}
                      afType={FormInputType.SEARCH}
                      afButtonText={t('requirements.SearchButtonText')}
                      afValue={filterSpecific ? filterSpecific.name : filterFreeText}
                      afButtonType={ButtonType.BUTTON}
                      onAfOnSubmitSearch={(e) => {
                        setFilterFreeText(e.detail);
                        setUrlParams(e.detail, filterCategories, showObjectType);
                        setTimesFiltered(timesFiltered + 1);
                      }}
                    ></DigiFormInputSearch>
                  </p>
                  <div>
                    <DigiFormCategoryFilter
                      key={filterFreeText + showAllCategories.toString()} // To make sure component re-renders when these change
                      afCategories={categoryFilterOptions || []}
                      afAllCategoriesSelected={showAllCategories}
                      afAllCategoriesText={t('requirements.AllCategories')}
                      afHideToggle={true}
                      onAfOnSelectedCategoryChange={(e) => {
                        if (e.detail.length === 0 || e.detail.length === categories?.length) {
                          setShowAllCategories(true);
                          setFilterCategories([]);
                          setUrlParams(filterFreeText, [], showObjectType);
                          return;
                        }
                        setShowAllCategories(false);
                        setFilterCategories(e.detail);
                        setUrlParams(filterFreeText, e.detail, showObjectType);
                        setTimesFiltered(timesFiltered + 1);
                      }}
                    ></DigiFormCategoryFilter>
                  </div>
                </>
              )}
            </form>
          </PageTitle>
        </div>
        <DigiLayoutBlock afVariation={LayoutBlockVariation.TRANSPARENT}>
          <div>
            <ScreenReaderAlert
              updateOnChange={timesFiltered}
              className="flex items-center h-[3rem] ml-1"
            >
              <strong>
                {t('requirements.Showing', {
                  all:
                    filteredRequirements.length === selectedRequirements?.length
                      ? t('requirements.all')
                      : '',
                  count: filteredRequirements.length,
                })}
              </strong>
              {filteredRequirements.length < (selectedRequirements?.length || 0) && (
                <span className="inline-flex md:ml-4">
                  <ResetButton
                    onClick={() => {
                      setFilterFreeText('');
                      setFilterSpecific(undefined);
                      setFilterCategories([]);
                      window.history.replaceState({}, '', window.location.pathname);
                      setShowAllCategories(true);
                    }}
                    focusOnReset={document.getElementById('requirement-search')}
                  ></ResetButton>
                </span>
              )}
            </ScreenReaderAlert>
          </div>
        </DigiLayoutBlock>
        <DigiLayoutContainer afNoGutter={true} afVariation={LayoutContainerVariation.FLUID}>
          {!isLoading && filteredRequirements && (
            <DigiLayoutBlock afVariation={LayoutBlockVariation.TRANSPARENT} className="-mb-5 pb-5">
              <div
                className="skip-target"
                data-skip-link-text={t('requirements.skipLink')}
                id="kravlista"
              >
                {filteredRequirements.length === 0 && (
                  <DigiLayoutBlock afVerticalPadding={true} afMarginBottom={true}>
                    <p>{t('requirements.noResults', { search: filterFreeText })}</p>
                  </DigiLayoutBlock>
                )}
                {filteredRequirements.map((requirement) => (
                  <DigiLayoutBlock
                    key={requirement.id}
                    afVerticalPadding={true}
                    afMarginBottom={true}
                  >
                    <article>
                      <div className="border-b-1 border-grayscale-400 pb-5 mb-8">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div>
                            <p
                              className="text-grayscale-700 !mb-2"
                              aria-hidden="true"
                              id={`cat-${requirement.id}`}
                            >
                              {t('requirements.category')}
                              {requirement.category}
                            </p>
                            <h2 aria-describedby={`cat-${requirement.id}`}>{requirement.name}</h2>
                          </div>
                          <div className="flex flex-col sm:items-end mb-4 sm:mb-0">
                            <DigiButton
                              afVariation={ButtonVariation.FUNCTION}
                              afType="button"
                              afAriaLabel={`${t('requirements.Share')} ${requirement.name}`}
                              onAfOnClick={() => {
                                setShareMessage(t('requirements.LinkCopied'));
                                setShareId(String(requirement.id));
                                setShareCount(shareCount + 1);
                                navigator.clipboard.writeText(
                                  window.location.origin +
                                    window.location.pathname +
                                    `?id=${requirement.id}`,
                                );
                              }}
                            >
                              {t('requirements.ShareButton')}
                              <DigiIconShareAlt slot="icon" />
                            </DigiButton>
                            <ScreenReaderAlert updateOnChange={shareMessage + shareId + shareCount}>
                              {shareMessage && shareId === requirement.id && (
                                <DigiFormValidationMessage
                                  afVariation={FormValidationMessageVariation.SUCCESS}
                                >
                                  {shareMessage}
                                </DigiFormValidationMessage>
                              )}
                            </ScreenReaderAlert>
                          </div>
                        </div>
                        <RequirementLegal requirement={requirement} headingLevel="h3" />
                      </div>
                      <RequirementDetails
                        requirement={requirement}
                        headingLevel="h3"
                        textSuggestions={requirement.textSuggestions || []}
                      ></RequirementDetails>
                    </article>
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
