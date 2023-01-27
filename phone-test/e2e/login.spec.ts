import { test } from '@playwright/test';

test('GIVEN the login page WHEN user fill correctly the form THEN he should login and go to calls', async ({
  page
}) => {
  // Go to /login screen
  await page.goto('http://localhost:3000/login');

  // Fill login form
  await page.getByPlaceholder('job@aircall.io').fill('javier@aircall.io');
  await page.getByLabel('Password').fill('1234');

  // TODO: review rules for eslint that has collisions with playwright api
  /* eslint-disable */

  // Click into login submit button
  await page.getByRole('button', { name: 'Login' }).click();

  // Should go to /calls screen and see its title
  await page.getByText('Calls History').waitFor();
  /* eslint-enable */
});
