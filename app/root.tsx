import type { LinksFunction } from 'react-router';

export const links: LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
];
import './app.css';

import { DigiTypography } from '@designsystem-se/af-react';
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
        <ClientOnly>
          <Header />
          <QueryClientProvider client={queryClient}>
            <div className="bg-[var(--digi--grayscale-100)]">{children}</div>
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
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Fel';
    details =
      error.status === 404 ? 'Den begärda sidan kunde inte hittas.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <DigiTypography>
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </DigiTypography>
    </main>
  );
}
