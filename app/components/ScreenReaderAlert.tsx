type Props = {
  children: React.ReactNode;
  updateOnChange: string | number;
  className?: string;
};

export default function ScreenReaderAlert({ children, updateOnChange, className }: Props) {
  return (
    <p role="alert" key={updateOnChange} className={className}>
      {children}
    </p>
  );
}
