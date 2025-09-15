import type { LinksFunction } from 'react-router';

export const links: LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
];
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { useLocation } from 'react-router-dom';
import type { Route } from './+types/root';
import './app.css';
import { ClientOnly } from './clientOnly';
import {
  DigiHeader,
  DigiFooter,
  DigiLogo,
  DigiHeaderNavigation,
  DigiHeaderNavigationItem,
} from '@digi/arbetsformedlingen-react';
import {
  FooterVariation,
  HeaderCenterContentWidth,
  LogoColor,
  LogoVariation,
} from '@digi/arbetsformedlingen';

const queryClient = new QueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ClientOnly>
          <DigiHeader
            afSystemName="Tillgänglighetsverktyget"
            afCentered={HeaderCenterContentWidth.WIDTH_1400}
          >
            <Link slot="header-logo" aria-label="Tillgänglighetsverktygets startsida" to="/"></Link>
            <div slot="header-navigation">
              <DigiHeaderNavigation
                afCloseButtonText="Stäng"
                afCloseButtonAriaLabel="Stäng meny"
                afNavAriaLabel="Huvudmeny"
                afCentered={HeaderCenterContentWidth.WIDTH_1400}
              >
                <DigiHeaderNavigationItem afCurrentPage={location.pathname === '/'}>
                  <Link to="/">Granskningar</Link>
                </DigiHeaderNavigationItem>
                <DigiHeaderNavigationItem afCurrentPage={location.pathname === '/add'}>
                  <Link to="/add">Skapa ny granskning</Link>
                </DigiHeaderNavigationItem>
              </DigiHeaderNavigation>
            </div>
          </DigiHeader>
          <QueryClientProvider client={queryClient}>
            <div className="!bg-[var(--digi--grayscale-100)]">{children}</div>
          </QueryClientProvider>
          <DigiFooter afVariation={FooterVariation.LARGE}>
            <div slot="content-bottom-left">
              <Link to="https://www.arbetsformedlingen.se">
                <DigiLogo
                  afVariation={LogoVariation.LARGE}
                  afColor={LogoColor.SECONDARY}
                ></DigiLogo>
              </Link>
            </div>
          </DigiFooter>
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
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
