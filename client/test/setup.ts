import '@testing-library/jest-dom';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup efter varje test
afterEach(() => {
  cleanup();
});

// Set environment variables BEFORE any modules are imported
// This ensures runtime client selection works correctly in tests
beforeAll(() => {
  vi.stubEnv('VITE_STANDALONE', 'false');
  vi.stubEnv('VITE_USE_EXAMPLE_DATA', 'false');
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
    VITE_STANDALONE: 'false', // Default to non-standalone mode for tests
    VITE_USE_EXAMPLE_DATA: 'false', // Disable example data in tests
  },
}));
