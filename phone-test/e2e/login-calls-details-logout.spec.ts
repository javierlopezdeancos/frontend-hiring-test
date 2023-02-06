import { test } from '@playwright/test';

test('GIVEN the login page WHEN user auth and comes into calls list, click into a call, see the call details and click into logout THEN he should return to login page', async ({
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

  // Click into the first call item in the calls list
  await page.getByTestId('call-item-1').click();

  // Should go to /call/{callId} screen and see its title
  await page.getByText('Call Details').waitFor();

  // Click into logout button
  await page.getByRole('button', { name: 'logout' }).click();

  // Should come back to login page again
  await page.getByRole('button', { name: 'Login' }).waitFor();
  /* eslint-enable */
});
