import { DigiLink, DigiNavigationBreadcrumbs } from '@designsystem-se/af-react';
import { useNavigate } from 'react-router';

type Props = {
  currentPage?: string;
  pages?: { title: string; href: string }[];
};

export default function Breadcrumbs({ currentPage, pages }: Props) {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      <DigiNavigationBreadcrumbs afCurrentPage={currentPage} afAriaLabel="Brödsmulor">
        {pages?.map((page, index) => (
          <DigiLink
            key={`${page.href}-${index}`}
            afHref={page.href}
            afOverrideLink={true}
            onAfOnClick={(e) => {
              e.preventDefault();
              navigate(page.href);
            }}
          >
            {page.title}
          </DigiLink>
        ))}
      </DigiNavigationBreadcrumbs>
    </div>
  );
}
