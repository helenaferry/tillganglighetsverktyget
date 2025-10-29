interface Props {
  progress: number;
  text?: string;
}

export default function ProgressBar({ progress, text }: Props) {
  return (
    <div>
      {text && (
        <p className="!mb-2" role="alert">
          <strong>{text}</strong>
        </p>
      )}
      <div className="relative w-full h-6" aria-hidden="true">
        <div className="absolute top-0 left-0 h-full w-full border-dashed border-2 border-grayscale-700 rounded" />
        <div
          className="absolute top-0 left-0 h-full bg-stratos-500 rounded-l transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
