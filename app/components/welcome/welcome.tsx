import { DigiButton } from '@digi/arbetsformedlingen-react';
import {
  ButtonVariation
} from '@digi/arbetsformedlingen';

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <DigiButton
        afVariation={ButtonVariation.PRIMARY}
        onAfOnClick={() => console.log('Hallå världen!')}
      >Testknapp</DigiButton>
    </main>
  );
}