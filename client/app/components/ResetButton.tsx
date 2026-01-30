import { ButtonVariation } from '@designsystem-se/af';
import { DigiButton, DigiIconRedo } from '@designsystem-se/af-react';

import i18n from '~/lang/i18n';

type Props = {
  buttonText?: string;
  onClick: () => void;
  focusOnReset: HTMLElement | null;
};

export default function ResetButton({
  buttonText = i18n.t('ResetButtonDefaultText'),
  onClick,
  focusOnReset,
}: Props) {
  const reset = () => {
    if (focusOnReset) {
      focusOnReset.focus();
    }
    if (onClick) {
      onClick();
    }
  };
  return (
    <DigiButton
      afType="reset"
      afVariation={ButtonVariation.FUNCTION}
      onAfOnClick={reset}
      afFullWidth={false}
    >
      {buttonText}
      <DigiIconRedo slot="icon" />
    </DigiButton>
  );
}
