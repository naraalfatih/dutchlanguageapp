import { expect, test, type Page } from '@playwright/test';

async function onboard(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Learn to actually speak Dutch.' })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('button', { name: 'Work' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /The Netherlands/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /I know some words/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '10 min' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  // First Dutch sentence: typed (the "Ik ben heet" mistake is caught kindly).
  await page.getByLabel('Your answer in Dutch').fill('Hallo, ik ben heet Sam.');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByText('Ik heet Sam', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('button', { name: "Let's go" }).click();
}

test('guest onboarding, plan, lesson and offline practice conversation', async ({ page }) => {
  await onboard(page);

  // Home: a plan with a reason, and the seven-destination navigation.
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Goede(morgen|middag|navond|nacht)/);
  const nav = page.getByRole('navigation', { name: 'Main' });
  for (const label of ['Home', 'Learn', 'Practice', 'AI Conversations', 'Culture', 'Progress', 'Profile']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
  await expect(page.getByText('Expression of the day')).toBeVisible();

  // Learn → first lesson opens on the situation step.
  await nav.getByRole('link', { name: 'Learn' }).click();
  await page.getByRole('heading', { name: 'A0 · Absolute beginner' }).click();
  await page
    .getByRole('link', { name: /Hallo!/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: 'The situation' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Words in context' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Close' }).click();

  // Talk → Life Simulator in practice mode (no account): complete the café scenario.
  await page.goto('/talk/scenario/daily.cafe');
  await expect(page.getByText('Your task:')).toBeVisible();
  const composer = page.getByLabel('Your answer in Dutch');
  for (const answer of ['Een cappuccino, alsjeblieft.', 'Ja, lekker! Met slagroom, graag.', 'Kan ik pinnen?']) {
    await composer.fill(answer);
    await page.getByRole('button', { name: 'Send' }).click();
  }
  await expect(page.getByText('Scenario complete')).toBeVisible();

  // Progress reflects the demonstrated can-do and the diary entry from onboarding.
  await page.goto('/progress');
  await expect(page.getByText('real-life tasks done')).toBeVisible();
  await expect(page.getByText('Saying your name: ik heet')).toBeVisible();
});

test('account: sign up keeps guest progress and conversations use the server', async ({ page }) => {
  await onboard(page);
  await page.goto('/account?mode=register');
  await page.getByLabel('Your first name').fill('Amira');
  await page.getByLabel('Email').fill(`e2e-${Date.now()}@example.com`);
  await page.getByLabel('Password').fill('een lang wachtwoord');
  await page.getByRole('button', { name: 'Create account' }).last().click();
  await expect(page.getByText('Amira')).toBeVisible();
  await expect(page.getByText(/Synced|Syncing|waiting to sync/)).toBeVisible();

  // Server-backed tutor conversation (offline provider on the server: no API key in tests).
  await page.goto('/talk/tutor');
  const composer = page.getByLabel('Your answer in Dutch');
  await composer.fill('Ik ben heet Amira en ik woon in Utrecht.');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Ik heet Amira', { exact: false }).first()).toBeVisible();

  // The diary got the mistake from the server-side events.
  await page.goto('/progress');
  await expect(page.getByText('Saying your name: ik heet')).toBeVisible();
});
