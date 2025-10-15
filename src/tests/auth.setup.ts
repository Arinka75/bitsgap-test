import { test, expect } from '../fixtures/AuthFixtures';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

test.describe('Authentication with POM', () => {
  test('should authenticate user successfully', async ({ loginPage, page }) => {
    
    await test.step('Clean up old authentication state', async () => {
      if (fs.existsSync('storageState.json')) {
        fs.unlinkSync('storageState.json');
      }
    });

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

    await test.step('Save authentication state', async () => {
      await page.context().storageState({ 
        path: 'storageState.json' 
      });
    });
  });
});