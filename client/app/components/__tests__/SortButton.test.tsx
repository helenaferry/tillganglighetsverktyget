import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SortButton } from '../SortButton';

describe('SortButton', () => {
  describe('Desktop button (native button)', () => {
    it('renders with button text', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      expect(button).toHaveTextContent('Namn');
    });

    it('calls onSortChange with correct sortBy value when clicked', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={5}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      await user.click(button!);

      expect(onSortChange).toHaveBeenCalledWith(5);
      expect(onSortChange).toHaveBeenCalledTimes(1);
    });

    it('applies active class when active', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          active={true}
          sortDirection="stigande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('sort-button--active');
    });

    it('does not apply active class when not active', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          active={false}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      expect(button).not.toHaveClass('sort-button--active');
    });

    it('sets aria-pressed to true when active', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          active={true}
          sortDirection="stigande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('sets aria-pressed to false when not active', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          active={false}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('has correct aria-label when not active', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Kategori"
          sortBy={1}
          active={false}
          sortDirection="stigande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Kategori - Sortera fallande');
    });

    it('has correct aria-label when active with stigande direction', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Kategori"
          sortBy={1}
          active={true}
          sortDirection="stigande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      // When active and stigande, next click will be fallande
      expect(button).toHaveAttribute('aria-label', 'Kategori - Sortera fallande');
    });

    it('has correct aria-label when active with fallande direction', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Kategori"
          sortBy={1}
          active={true}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      // When active and fallande, next click will be stigande
      expect(button).toHaveAttribute('aria-label', 'Kategori - Sortera stigande');
    });

    it('shows up caret when not active', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          active={false}
          sortDirection="stigande"
          onSortChange={onSortChange}
        />,
      );

      const upCaret = container.querySelector('digi-icon-caret-up');
      const upCaretSpan = upCaret?.parentElement;
      expect(upCaretSpan).toHaveClass('visible');
    });

    it('shows down caret when not active', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          active={false}
          sortDirection="stigande"
          onSortChange={onSortChange}
        />,
      );

      const downCaret = container.querySelector('digi-icon-caret-down');
      const downCaretSpan = downCaret?.parentElement;
      expect(downCaretSpan).toHaveClass('visible');
    });

    it('shows only down caret when active with stigande direction', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          active={true}
          sortDirection="stigande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      const spans = button?.querySelectorAll('span');
      const upCaretSpan = spans?.[0];
      const downCaretSpan = spans?.[1];

      // When stigande (ascending), show down caret
      expect(upCaretSpan).toHaveClass('invisible');
      expect(downCaretSpan).toHaveClass('visible');
    });

    it('shows only up caret when active with fallande direction', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Namn"
          sortBy={1}
          active={true}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const button = container.querySelector('button');
      const spans = button?.querySelectorAll('span');
      const upCaretSpan = spans?.[0];
      const downCaretSpan = spans?.[1];

      // When fallande (descending), show up caret
      expect(upCaretSpan).toHaveClass('visible');
      expect(downCaretSpan).toHaveClass('invisible');
    });
  });

  describe('Mobile button (DigiButton)', () => {
    it('renders DigiButton with button text', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Status"
          sortBy={2}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const digiButton = container.querySelector('digi-button');
      expect(digiButton).toBeInTheDocument();
      expect(digiButton).toHaveTextContent('Status');
    });

    it('shows sort icon when not active', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Status"
          sortBy={2}
          active={false}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const sortIcon = container.querySelector('digi-icon-sort');
      expect(sortIcon).toBeInTheDocument();
    });

    it('shows up caret icon when active with stigande direction', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Status"
          sortBy={2}
          active={true}
          sortDirection="stigande"
          onSortChange={onSortChange}
        />,
      );

      const upCaret = container.querySelector('.mobile-sort-icon--active digi-icon-caret-up');
      expect(upCaret).toBeInTheDocument();
    });

    it('shows down caret icon when active with fallande direction', () => {
      const onSortChange = vi.fn();
      const { container } = render(
        <SortButton
          buttonText="Status"
          sortBy={2}
          active={true}
          sortDirection="fallande"
          onSortChange={onSortChange}
        />,
      );

      const downCaret = container.querySelector('.mobile-sort-icon--active digi-icon-caret-down');
      expect(downCaret).toBeInTheDocument();
    });
  });
});
