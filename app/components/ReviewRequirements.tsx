import {
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';
import {
  DigiLoaderSkeleton,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@digi/arbetsformedlingen-react';
import { useMemo, useState } from 'react';

import { StyledLink } from '~/components/StyledLink';
import { ObjectType, Status } from '~/data/types';
import { formatDate } from '~/formattingHelpers';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';

import Breadcrumbs from './Breadcrumbs';
import { CardsOrTable } from './CardsOrTable';
import StatusBadge from './StatusBadge';

interface Props {
  reviewId: string;
}

export default function ReviewRequirements({ reviewId }: Props) {
  const { review: review, isLoading: reviewLoading } = useReviewById(reviewId);
  const { checks, isLoading: checksLoading } = useChecksForReview(reviewId);
  const { data: requirementsAll, isLoading: requirementsAllLoading } = useRequirements();

  const { data: categoriesWeb, isLoading: categoriesWebLoading } = useRequirementCategories(
    ObjectType.WEB,
  );
  const { data: categoriesDoc, isLoading: categoriesDocLoading } = useRequirementCategories(
    ObjectType.DOCUMENT,
  );

  const requirements = useMemo(() => {
    const reqs = requirementsAll ?? [];
    if (review?.objectType === ObjectType.DOCUMENT) {
      return reqs.filter((req) => req.objectType === ObjectType.DOCUMENT);
    }
    return reqs.filter((req) => req.objectType === ObjectType.WEB);
  }, [review, requirementsAll]);

  const categories = useMemo(() => {
    if (review?.objectType === ObjectType.DOCUMENT) {
      return categoriesDoc;
    }
    return categoriesWeb;
  }, [review, categoriesWeb, categoriesDoc]);

  const loading =
    reviewLoading ||
    checksLoading ||
    requirementsAllLoading ||
    categoriesWebLoading ||
    categoriesDocLoading;

  const requirementsWithChecks = useMemo(() => {
    if (!requirements || !checks) return [];
    return requirements.map((req) => {
      const check = checks?.find((check) => String(check.requirement) === String(req.id));
      return { ...req, check };
    });
  }, [requirements, checks]);

  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<Status[]>([]);
  const [filterFreeText, setFilterFreeText] = useState<string>('');
  const filteredRequirements = requirementsWithChecks?.filter((req) => {
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
    <div className="grid">
      {loading && (
        <DigiLoaderSkeleton
          className="m-5"
          afVariation={LoaderSkeletonVariation.SECTION}
          afCount={4}
        ></DigiLoaderSkeleton>
      )}
      <div className="bg-white">
        <DigiTypography>
          {review && (
            <div className="lg:flex justify-between mb-4 bg-white p-5">
              <div>
                <Breadcrumbs
                  currentPage={review.title || 'Granskning'}
                  pages={[{ title: 'Granskningar', href: '/' }]}
                />
                <DigiTypographyHeadingJumbo
                  className="wrap-anywhere"
                  afText={review?.title || 'Granskning'}
                  afLevel={TypographyHeadingJumboLevel.H1}
                  afVariation={TypographyHeadingJumboVariation.PRIMARY}
                ></DigiTypographyHeadingJumbo>
                <strong>Granskning startades {formatDate(review?.created_at)}</strong>

                <div className="flex flex-col md:flex-row gap-4 my-4">
                  <StyledLink
                    to={`/granskning/${review.id}/export/redogorelse`}
                    text="Sammanställ brister"
                    styleVariant="link-button"
                  />
                  <StyledLink
                    to={`/granskning/${review.id}/export/uppgifter`}
                    text="Exportera uppgifter (.csv)"
                    styleVariant="link-button"
                  />
                </div>
              </div>
            </div>
          )}
        </DigiTypography>
      </div>
      {review && (
        <div className="content-container content-container--largest">
          <div className="content-container content-container--white content-container--largest min-h-[40rem]">
            <div>
              {review && (
                <div className="container">
                  <CardsOrTable
                    headings={['Krav', 'Kategori', 'Status']}
                    rows={filteredRequirements.map((req) => [
                      <StyledLink
                        key={req.id}
                        to={'/granskning/' + review.id + '/' + req.id}
                        text={req.name}
                      />,
                      <span key={req.id + '-category'}>{req.category}</span>,
                      <StatusBadge key={req.id + '-status'} status={req.check?.status} />,
                    ])}
                    filters={[
                      {
                        type: 'freeText',
                        label: 'Sök på krav',
                        onChange: (e) => {
                          setFilterFreeText(e.detail.target.value);
                        },
                      },
                      {
                        type: 'select',
                        label: 'Filtrera på kategori',
                        options:
                          categories?.map((cat: string) => ({
                            id: cat,
                            label: cat,
                          })) || [],
                        onChange: (e) => {
                          setFilterCategories(e.detail.checked);
                        },
                      },
                      {
                        type: 'select',
                        label: 'Filtrera på status',
                        options: [
                          {
                            label: 'Godkänt',
                            id: Status.PASS.toString(),
                          },
                          {
                            label: 'Underkänt',
                            id: Status.FAIL.toString(),
                          },
                          {
                            label: 'Ej bedömt',
                            id: Status.NOT_ASSESSED.toString(),
                          },
                          {
                            label: 'Ej relevant',
                            id: Status.IRRELEVANT.toString(),
                          },
                        ],
                        onChange: (e) => {
                          setFilterStatus(
                            e.detail.checked.map((item: string) => Number(item) as Status),
                          );
                        },
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
