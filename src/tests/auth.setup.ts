import { test, expect } from '../fixtures/AuthFixtures';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Authentication with POM', () => {
  test('should authenticate user successfully', async ({ loginPage }) => {
    await test.step('Navigate to application', async () => {
      await loginPage.navigateToHomepage();
      await loginPage.navigateToLogin();
    });

    await test.step('Enter credentials and login', async () => {
  
      await test.step('Fill credentials', async () => {
        await loginPage.fillCredentials(
          process.env.USER_EMAIL!,
          process.env.USER_PASSWORD!
        );
      }, { box: true });
      
      await loginPage.submitLogin();
    });

    await test.step('Verify successful authentication', async () => {
      await loginPage.verifySuccessfulLogin();
    });
  });
});