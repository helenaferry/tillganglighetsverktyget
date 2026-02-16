import { DigiNavigationBreadcrumbs } from '@designsystem-se/af-react';
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
          <a
            key={`${page.href}-${index}`}
            href={page.href}
            onClick={(e) => {
              e.preventDefault();
              navigate(page.href);
            }}
          >
            {page.title}
          </a>
        ))}
      </DigiNavigationBreadcrumbs>
    </div>
  );
}
