import '@testing-library/jest-dom';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup efter varje test
afterEach(() => {
  cleanup();
});

// Mock import.meta.env (New Client vars; see client/.env.example)
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://localhost:3000/api',
    VITE_REQUIREMENTS_URL: '/krav.json',
    VITE_APPLICATION_TITLE: 'Granska tillgänglighet',
    VITE_LOGO: '{}',
    VITE_FOOTER_LINKS: '[]',
    VITE_REGULATORY_FRAMEWORK: 'dos',
  },
}));
