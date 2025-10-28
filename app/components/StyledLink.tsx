import {
  type DigiLinkButtonCustomEvent,
  type DigiLinkCustomEvent,
  LinkButtonSize,
  LinkButtonVariation,
} from '@designsystem-se/af';
import { DigiLink, DigiLinkButton } from '@designsystem-se/af-react';
import { useNavigate } from 'react-router';

type Props = {
  to: string;
  text: string;
  ariaLabel?: string;
  styleVariant?:
    | 'link-button'
    | 'link-button-secondary'
    | 'primary-button'
    | 'secondary-button'
    | 'link';
  onClick?: (event: CustomEvent) => void;
};

export function StyledLink({ to, text, ariaLabel, styleVariant = 'link', onClick }: Props) {
  const navigate = useNavigate();

  const handleClick = (
    e:
      | DigiLinkCustomEvent<MouseEvent>
      | DigiLinkButtonCustomEvent<MouseEvent>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    onClick?.(e as CustomEvent);
    navigate(to);
  };

  const handleAnchorClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    onClick?.(e as unknown as CustomEvent);
    navigate(to);
  };

  switch (styleVariant) {
    case 'link-button':
    case 'link-button-secondary':
      return (
        <DigiLinkButton
          afHref={to}
          afOverrideLink={true}
          onAfOnClick={handleClick}
          afSize={LinkButtonSize.MEDIUMLARGE}
          afVariation={
            styleVariant === 'link-button'
              ? LinkButtonVariation.PRIMARY
              : LinkButtonVariation.SECONDARY
          }
        >
          {text}
        </DigiLinkButton>
      );
    case 'primary-button':
      return (
        <a
          href={to}
          aria-label={ariaLabel}
          onClick={handleAnchorClick}
          className="bg-stratos-500 border-2 border-stratos-500 !text-white !no-underline text-center sm:text-left !font-bold cursor-pointer
          font-(family-name:--digi--typography-meta--font-family)
          hover:bg-[var(--digi--color--background--inverted-6)]
          hover:border-[var(--digi--color--background--inverted-6)]
          p-[var(--digi--button--padding--medium)] 
          min-h-[var(--digi--button--min-height--small)] 
          rounded-[var(--digi--border-radius--button)]"
        >
          {text}
        </a>
      );
    case 'secondary-button':
      return (
        <a
          href={to}
          aria-label={ariaLabel}
          onClick={handleAnchorClick}
          className="bg-white border-2 border-stratos-500 !text-stratos-500 !no-underline text-center sm:text-left !font-bold cursor-pointer
          font-(family-name:--digi--typography-meta--font-family)
          hover:bg-[var(--digi--color--background--inverted-5)]
          p-[var(--digi--button--padding--medium)] 
          min-h-[var(--digi--button--min-height--small)] 
          rounded-[var(--digi--border-radius--button)]"
        >
          {text}
        </a>
      );
    case 'link':
    default:
      return (
        <DigiLink
          afHref={to}
          afAriaLabel={ariaLabel}
          afOverrideLink={true}
          onAfOnClick={handleClick}
        >
          {text}
        </DigiLink>
      );
  }
}
