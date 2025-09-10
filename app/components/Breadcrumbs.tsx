import { DigiNavigationBreadcrumbs } from '@digi/arbetsformedlingen-react';
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
        {pages?.map((page) => (
          <a key={page.href} href={page.href} onClick={(e) => handleClick(e, page.href)}>
            {page.title}
          </a>
        ))}
      </DigiNavigationBreadcrumbs>
    </div>
  );
}
