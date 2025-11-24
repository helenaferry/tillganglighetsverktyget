type Props = {
  children: React.ReactNode;
  updateOnChange: string | number;
  className?: string;
};

export default function ScreenReaderAlert({ children, updateOnChange, className }: Props) {
  return (
    <div role="alert" key={updateOnChange} className={className}>
      {children}
    </div>
  );
}
