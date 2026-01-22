import { DigiTypography } from '@designsystem-se/af-react';

interface Props {
  progress: number;
  text?: string;
}

export default function ProgressBar({ progress, text }: Props) {
  return (
    <div>
      <DigiTypography>
        {text && (
          <p className="!mb-2" role="alert">
            <strong>{text}</strong>
          </p>
        )}
      </DigiTypography>
      <div className="relative w-full h-6" aria-hidden="true">
        <div className="absolute top-0 left-0 h-full w-full border-dashed border-2 border-grayscale-700 rounded" />
        <div
          className={`absolute top-0 left-0 h-full bg-stratos-500 rounded-l transition-all duration-500 ${progress === 100 ? 'rounded-r' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
