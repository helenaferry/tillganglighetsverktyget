import { type DigiLinkButtonCustomEvent, type DigiLinkCustomEvent } from '@digi/arbetsformedlingen';
import { DigiLink, DigiLinkButton } from '@digi/arbetsformedlingen-react';
import { useNavigate } from 'react-router';

type Props = {
  to: string;
  text: string;
  isButton?: boolean;
  onClick?: (
    event: DigiLinkCustomEvent<MouseEvent> | DigiLinkButtonCustomEvent<MouseEvent>,
  ) => void;
};

export function StyledLink({ to, text, isButton, onClick, ...props }: Props) {
  const navigate = useNavigate();

  const handleLinkClick = (e: DigiLinkCustomEvent<MouseEvent>) => {
    e.preventDefault();
    onClick?.(e);
    navigate(to);
  };

  const handleButtonClick = (e: DigiLinkButtonCustomEvent<MouseEvent>) => {
    e.preventDefault();
    onClick?.(e);
    navigate(to);
  };

  return (
    <>
      {isButton ? (
        <DigiLinkButton {...props} afOverrideLink={true} onAfOnClick={handleButtonClick}>
          {text}
        </DigiLinkButton>
      ) : (
        <DigiLink afHref={to} afOverrideLink={true} onAfOnClick={handleLinkClick}>
          {text}
        </DigiLink>
      )}
    </>
  );
}
