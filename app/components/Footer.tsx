import { DigiFooter, DigiFooterCard } from '@designsystem-se/af-react';
import { Link } from 'react-router';

export default function Footer() {
  const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || 'Granska tillgänglighet';
  const logoUrl =
    import.meta.env.VITE_LOGO_URL || 'https://placehold.co/100x30?text=Din+logotyp+h%C3%A4r';
  const logoWidth = import.meta.env.VITE_LOGO_WIDTH || '3.5rem';
  const logoHeight = import.meta.env.VITE_LOGO_HEIGHT || 'auto';
  return (
    <DigiFooter>
      <div slot="content-top">
        <DigiFooterCard>
          <ul>
            <li>
              <a href="/">Alla granskningar</a>
            </li>
            <li>
              <a href="/granskning/skapa">Skapa ny granskning</a>
            </li>
            <li>
              <a href="/krav">Krav</a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Kommer ...');
                }}
              >
                Tillgänglighetsredogörelse
              </a>
            </li>
          </ul>
        </DigiFooterCard>
      </div>
      <div slot="content-bottom-left">
        <Link
          aria-label={`Startsida för ${applicationTitle}`}
          to="/"
          className="flex gap-4 pb-5 items-center text-white hover:text-white visited:!text-white !no-underline"
        >
          <img
            src={logoUrl}
            alt=""
            style={{ width: logoWidth, height: logoHeight }}
            className="border-r-2 border-r-white pr-4"
          />
          <span className="font-bold text-base w-full max-w-full break-words hyphens-auto">
            {applicationTitle}
          </span>
        </Link>
      </div>
    </DigiFooter>
  );
}
