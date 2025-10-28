import { DigiNavigationBreadcrumbs } from '@designsystem-se/af-react';
import { useNavigate } from 'react-router';

type Props = {
  currentPage?: string;
  pages?: { title: string; href: string }[];
};

export default function Breadcrumbs({ currentPage, pages }: Props) {
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    navigate(href);
  };
  return (
    <div className="mb-4">
      <DigiNavigationBreadcrumbs afCurrentPage={currentPage}>
        {pages?.map((page, index) => (
          <a
            key={`${page.href}-${index}`}
            href={page.href}
            onClick={(e) => handleClick(e, page.href)}
          >
            {page.title}
          </a>
        ))}
      </DigiNavigationBreadcrumbs>
    </div>
  );
}
