import {
  type DigiLinkButtonCustomEvent,
  type DigiLinkCustomEvent,
  LinkButtonSize,
  LinkButtonVariation,
} from '@designsystem-se/af';
import { DigiLink, DigiLinkButton } from '@designsystem-se/af-react';
import { useNavigate } from 'react-router';

type Props = {
  id?: string;
  to: string;
  children: React.ReactNode;
  ariaLabel?: string;
  styleVariant?:
    | 'link-button'
    | 'link-button-secondary'
    | 'primary-button'
    | 'secondary-button'
    | 'link'
    | 'plain';
  hideIcon?: boolean;
  className?: string;
  overrideLink?: boolean;
};

export function StyledLink({
  id,
  to,
  children,
  ariaLabel,
  styleVariant = 'link',
  hideIcon,
  className,
  overrideLink = false,
}: Props) {
  const navigate = useNavigate();

  const handleClick = (
    e:
      | DigiLinkCustomEvent<MouseEvent>
      | DigiLinkButtonCustomEvent<MouseEvent>
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (overrideLink) {
      overrideClick(e);
    } else {
      window.scrollTo(0, 0);
      window.location.href = to; // Non-SPA navigation
    }
  };

  const overrideClick = (
    e:
      | DigiLinkCustomEvent<MouseEvent>
      | DigiLinkButtonCustomEvent<MouseEvent>
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate(to);
  };

  switch (styleVariant) {
    case 'link-button':
    case 'link-button-secondary':
      return (
        <DigiLinkButton
          id={id}
          afHref={to}
          afOverrideLink={overrideLink}
          onAfOnClick={handleClick}
          afSize={LinkButtonSize.MEDIUM}
          afVariation={
            styleVariant === 'link-button'
              ? LinkButtonVariation.PRIMARY
              : LinkButtonVariation.SECONDARY
          }
          afHideIcon={hideIcon}
        >
          {children}
        </DigiLinkButton>
      );
    case 'primary-button':
      return (
        <a
          id={id}
          href={to}
          aria-label={ariaLabel}
          onClick={handleClick}
          className={`bg-natthimmel-800 border-2 border-natthimmel-800 !text-white !no-underline text-center sm:text-left !font-semibold cursor-pointer
          font-(family-name:--digi--typography-meta--font-family)
          hover:bg-[var(--digi--color--background--inverted-6)]
          hover:border-[var(--digi--color--background--inverted-6)]
          p-[var(--digi--button--padding--medium)] 
          min-h-[var(--digi--button--min-height--small)] 
          rounded-[var(--digi--border-radius--button)] ${className || ''}`}
        >
          {children}
        </a>
      );
    case 'secondary-button':
      return (
        <a
          id={id}
          href={to}
          aria-label={ariaLabel}
          onClick={handleClick}
          className={`bg-white border-2 border-natthimmel-800 !text-natthimmel-800 !no-underline text-center sm:text-left !font-semibold cursor-pointer
          font-(family-name:--digi--typography-meta--font-family)
          hover:bg-[var(--digi--color--background--inverted-5)]
          p-[var(--digi--button--padding--medium)] 
          min-h-[var(--digi--button--min-height--small)] 
          rounded-[var(--digi--border-radius--button)] ${className || ''}`}
        >
          {children}
        </a>
      );
    case 'plain':
      return (
        <a
          id={id}
          href={to}
          aria-label={ariaLabel}
          onClick={handleClick}
          className={`!no-underline ${className || ''}`}
        >
          {children}
        </a>
      );
    case 'link':
    default:
      return (
        <DigiLink
          id={id}
          afHref={to}
          afAriaLabel={ariaLabel}
          afOverrideLink={overrideLink}
          onAfOnClick={handleClick}
        >
          {children}
        </DigiLink>
      );
  }
}
