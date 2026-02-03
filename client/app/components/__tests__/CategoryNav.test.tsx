import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { type Category, ObjectType, Status } from '../../data/types';
import svenska from '../../lang/svenska.json';

import CategoryNav from '../CategoryNav';

i18next.use(initReactI18next).init({
  lng: 'sv',
  resources: {
    sv: { translation: svenska },
  },
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18next}>{ui}</I18nextProvider>
    </BrowserRouter>,
  );
};

describe('CategoryNav', () => {
  const mockCategories: Category[] = [
    {
      category: 'Kategori 1',
      requirements: [
        {
          id: 'req1',
          name: 'Krav 1',
          check: {
            status: Status.PASS,
            id: 1,
            requirement: 'req1',
            review: 1,
            comment: '',
            flag: null,
            created_at: '',
            updated_at: '',
          },
          regulatoryFramework: 'wcag',
          wcag: '1.1.1',
          en301549: '',
          contentType: 'text',
          category: 'Kategori 1',
          objectType: ObjectType.WEB,
          statement: '',
          why: '',
          howToTest: '',
        },
        {
          id: 'req2',
          name: 'Krav 2',
          check: {
            status: Status.FAIL,
            id: 2,
            requirement: 'req2',
            review: 1,
            comment: '',
            flag: null,
            created_at: '',
            updated_at: '',
          },
          regulatoryFramework: 'wcag',
          wcag: '1.1.2',
          en301549: '',
          contentType: 'text',
          category: 'Kategori 1',
          objectType: ObjectType.WEB,
          statement: '',
          why: '',
          howToTest: '',
        },
        {
          id: 'req3',
          name: 'Krav 3',
          check: undefined,
          regulatoryFramework: 'wcag',
          wcag: '1.1.3',
          en301549: '',
          contentType: 'text',
          category: 'Kategori 1',
          objectType: ObjectType.WEB,
          statement: '',
          why: '',
          howToTest: '',
        },
      ],
    },
    {
      category: 'Kategori 2',
      requirements: [
        {
          id: 'req4',
          name: 'Krav 4',
          check: {
            status: Status.PASS,
            id: 4,
            requirement: 'req4',
            review: 1,
            comment: '',
            flag: null,
            created_at: '',
            updated_at: '',
          },
          regulatoryFramework: 'wcag',
          wcag: '1.2.1',
          en301549: '',
          contentType: 'text',
          category: 'Kategori 2',
          objectType: ObjectType.WEB,
          statement: '',
          why: '',
          howToTest: '',
        },
        {
          id: 'req5',
          name: 'Krav 5',
          check: {
            status: Status.IRRELEVANT,
            id: 5,
            requirement: 'req5',
            review: 1,
            comment: '',
            flag: null,
            created_at: '',
            updated_at: '',
          },
          regulatoryFramework: 'wcag',
          wcag: '1.2.2',
          en301549: '',
          contentType: 'text',
          category: 'Kategori 2',
          objectType: ObjectType.WEB,
          statement: '',
          why: '',
          howToTest: '',
        },
      ],
    },
  ];

  describe('rendering', () => {
    it('renders category navigation heading', () => {
      renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 1"
          selectedRequirement="req1"
        />,
      );
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders all category buttons', () => {
      renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 1"
          selectedRequirement="req1"
        />,
      );
      expect(screen.getByText('Kategori 1')).toBeInTheDocument();
      expect(screen.getByText('Kategori 2')).toBeInTheDocument();
    });

    it('renders empty state when no categories', () => {
      renderWithRouter(
        <CategoryNav reviewId="1" categories={[]} selectedCategory="" selectedRequirement="" />,
      );
      expect(screen.getByText(svenska.CategoryNav.NoCategoriesAvailable)).toBeInTheDocument();
    });
  });

  describe('category status', () => {
    it('shows correct checked count for category with mixed statuses', () => {
      const { container } = renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 1"
          selectedRequirement="req1"
        />,
      );
      // Kategori 1 has 2 checked (PASS, FAIL) out of 3
      expect(container.textContent).toContain('2/3');
    });

    it('shows all checked when all requirements are done', () => {
      const { container } = renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 2"
          selectedRequirement="req4"
        />,
      );
      // Kategori 2 has 2 checked (PASS, IRRELEVANT) out of 2
      expect(container.textContent).toContain('2/2');
    });

    it('applies done styling when all requirements checked', () => {
      const { container } = renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 2"
          selectedRequirement="req4"
        />,
      );
      const statusBadge = container.querySelector('span[aria-label*="2 av 2 krav granskade"]');
      expect(statusBadge).toHaveClass('bg-natthimmel-800');
    });
  });

  describe('expansion state', () => {
    it('expands selected category by default', () => {
      renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 1"
          selectedRequirement="req1"
        />,
      );
      const expandButton = screen.getByRole('button', { name: /Kategori 1/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses category when not selected', () => {
      renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 1"
          selectedRequirement="req1"
        />,
      );
      const expandButton = screen.getByRole('button', { name: /Kategori 2/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggles category expansion on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 1"
          selectedRequirement="req1"
        />,
      );
      const expandButton = screen.getByRole('button', { name: /Kategori 2/i });

      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows requirements list when category is expanded', () => {
      renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 1"
          selectedRequirement="req1"
        />,
      );
      // Kategori 1 is expanded, so requirements should be visible
      expect(screen.getByText('Krav 1')).toBeInTheDocument();
      expect(screen.getByText('Krav 2')).toBeInTheDocument();
      expect(screen.getByText('Krav 3')).toBeInTheDocument();
    });
  });

  describe('requirement links', () => {
    it('applies selected styling to current requirement', () => {
      const { container } = renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 1"
          selectedRequirement="req1"
        />,
      );
      const selectedLink = container.querySelector('a[href="/granskning/1/req1/#krav"]');
      expect(selectedLink).toHaveClass('bg-natthimmel-800');
    });

    it('applies line-through to irrelevant requirements', () => {
      renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={mockCategories}
          selectedCategory="Kategori 2"
          selectedRequirement="req4"
        />,
      );
      const irrelevantReq = screen.getByText('Krav 5');
      expect(irrelevantReq).toHaveClass('line-through');
    });
  });

  describe('empty requirements', () => {
    it('shows empty state when category has no requirements', () => {
      const emptyCategories: Category[] = [
        {
          category: 'Tom kategori',
          requirements: [],
        },
      ];
      renderWithRouter(
        <CategoryNav
          reviewId="1"
          categories={emptyCategories}
          selectedCategory="Tom kategori"
          selectedRequirement=""
        />,
      );
      expect(screen.getByText(svenska.CategoryNav.NoRequirementsAvailable)).toBeInTheDocument();
    });
  });
});
