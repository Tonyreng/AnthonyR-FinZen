import { expect, test } from '@playwright/test';

test('serves the application and proxies backend health', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    const response = await request.get('/api/health');
    expect(response.ok()).toBe(true);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok' });
});
