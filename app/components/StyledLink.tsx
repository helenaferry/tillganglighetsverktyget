import { useNavigate } from 'react-router';
import { DigiLink, DigiLinkButton } from '@digi/arbetsformedlingen-react';
import { type DigiLinkButtonCustomEvent, type DigiLinkCustomEvent } from '@digi/arbetsformedlingen';

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

  const handleButtonClick = (event: DigiLinkButtonCustomEvent<MouseEvent>) => {
    event.preventDefault();
    onClick?.(event);
    navigate(to);
  };

  return (
    <>
      {isButton ? (
        <DigiLinkButton {...props} afOverrideLink={true} onAfOnClick={handleButtonClick}>
          {text}
        </DigiLinkButton>
      ) : (
        <DigiLink {...props} afOverrideLink={true} onAfOnClick={handleLinkClick}>
          {text}
        </DigiLink>
      )}
    </>
  );
}
