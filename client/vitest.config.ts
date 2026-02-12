import path from 'node:path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '.react-router/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'build/',
        // Framework/infrastructure files
        'app/routes/**', // Route components
        'app/routes.ts', // Route configuration
        'app/root.tsx', // Framework infrastructure
        'app/test-setup.ts', // Test setup
        'app/clientOnly.tsx', // Simple utility wrapper
        'app/favicon-link.ts', // Simple utility wrapper
        'app/data/apiClient.ts', // REST API client (backend integration)
        'app/data/supabase-types.ts', // Legacy/generated types (no logic to cover)
        // Large route-like/complex components (integration test candidates)
        'app/components/RequirementForm.tsx',
        'app/components/ReviewForm.tsx',
        'app/components/ReviewRequirement.tsx',
        'app/components/ReviewRequirements.tsx',
        // Mostly presentational components
        'app/components/Breadcrumbs.tsx',
        'app/components/CategoryOverview.tsx',
        'app/components/FilledFlag.tsx',
        'app/components/Footer.tsx',
        'app/components/Header.tsx',
        'app/components/InfoCard.tsx',
        'app/components/PageTitle.tsx',
        'app/components/Process.tsx',
        'app/components/RequirementDetails.tsx',
        'app/components/RequirementLegal.tsx',
        'app/components/SkipLink.tsx',
        // Env var formatters
        'minifyEnvAdd.cjs',
        'minifyEnvFooterLinks.cjs',
        'minifyEnvPrefill.cjs',
      ],
    },
  },
});
