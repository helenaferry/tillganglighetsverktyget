import type { LinksFunction } from 'react-router';

export const links: LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
];
import './app.css';

import { ErrorPageStatusCodes } from '@designsystem-se/af';
import { DigiNotificationErrorPage, DigiTypography } from '@designsystem-se/af-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, useLocation } from 'react-router';
import { useEffect } from 'react';

import type { Route } from './+types/root';
import { ClientOnly } from './clientOnly';
import Footer from './components/Footer';
import Header from './components/Header';
import SkipLink from './components/SkipLink';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import i18n from './lang/i18n';
import { getQueryClient } from './queryClient';

// Get singleton QueryClient instance
const queryClient = getQueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col gap-0">
        <ClientOnly>
          <ScrollToTopOnNavigation />
          <SkipLink />
          <Header />
          <QueryClientProvider client={queryClient}>
            <div className="bg-grayscale-100 grow">{children}</div>
          </QueryClientProvider>
          <Footer />
        </ClientOnly>
        <Scripts />
      </body>
    </html>
  );
}

function ScrollToTopOnNavigation() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search, location.hash]);

  return null;
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  const message = t('ErrorHeading');
  let details = t('UnexpectedError');
  let errorCode: ErrorPageStatusCodes = ErrorPageStatusCodes.NOT_FOUND;

  if (isRouteErrorResponse(error)) {
    errorCode = error.status as unknown as ErrorPageStatusCodes;
    details = error.status === 404 ? t('NotFound') : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <DigiTypography>
        <DigiNotificationErrorPage
          afCustomHeading={message}
          afHttpStatusCode={errorCode || ErrorPageStatusCodes.NOT_FOUND}
        >
          <p slot="bodytext">{details}</p>
        </DigiNotificationErrorPage>
      </DigiTypography>
    </main>
  );
}
