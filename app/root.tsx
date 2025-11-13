import type { LinksFunction } from 'react-router';

export const links: LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
];
import './app.css';

import { ErrorPageStatusCodes } from '@designsystem-se/af';
import { DigiNotificationErrorPage, DigiTypography } from '@designsystem-se/af-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import { ClientOnly } from './clientOnly';
import Footer from './components/Footer';
import Header from './components/Header';
import SkipLink from './components/SkipLink';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import i18n from './lang/i18n';

const queryClient = new QueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="grid">
        <SkipLink />
        <ClientOnly>
          <Header />
          <QueryClientProvider client={queryClient}>
            <div className="bg-grayscale-100">{children}</div>
          </QueryClientProvider>
          <Footer />
        </ClientOnly>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Hoppsan!';
  let details = 'Ett oväntat fel inträffade. Försök igen senare.';
  let errorCode: ErrorPageStatusCodes = ErrorPageStatusCodes.NOT_FOUND;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Fel';
    errorCode = error.status as unknown as ErrorPageStatusCodes;
    details =
      error.status === 404 ? 'Den begärda sidan kunde inte hittas.' : error.statusText || details;
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
