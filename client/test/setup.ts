import '@testing-library/jest-dom';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup efter varje test
afterEach(() => {
  cleanup();
});

beforeAll(() => {
  vi.stubEnv('VITE_STANDALONE', 'false');
  vi.stubEnv('VITE_USE_EXAMPLE_DATA', 'false');
});
