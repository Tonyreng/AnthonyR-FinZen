import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    retries: process.env.CI ? 2 : 0,
    use: {
        baseURL:
            process.env.PLAYWRIGHT_BASE_URL ??
            (process.env.CI ? 'http://localhost:3000' : 'http://localhost:4173'),
        trace: 'on-first-retry',
    },
    webServer: process.env.CI
        ? undefined
        : {
              command: 'pnpm preview --host 0.0.0.0 --port 4173',
              url: 'http://localhost:4173',
              reuseExistingServer: true,
          },
});
