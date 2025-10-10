export default function SkipLink() {
  const h1 = document.querySelector('h1');
  if (h1) {
    h1.id = 'h1';
  }
  return (
    <a
      href="#h1"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white focus:px-4 focus:py-2 focus:rounded-md focus:z-50 transition"
    >
      Hoppa till huvudinnehåll
    </a>
  );
}
