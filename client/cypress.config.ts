import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Launch browser with additional flags to disable security for cross-origin access
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--disable-site-isolation-trials');
        }
        
        if (browser.family === 'firefox') {
          launchOptions.preferences['security.tls.insecure_fallback_hosts'] = 'localhost';
          launchOptions.preferences['security.fileuri.strict_origin_policy'] = false;
        }
        
        return launchOptions;
      });
    },
    // Disable web security for cross-origin iframe access (needed for Stripe)
    chromeWebSecurity: false,
    // Additional security settings
    modifyObstructiveCode: true,
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // Video and screenshot settings
    video: false,
    screenshotOnRunFailure: true,
  },
});
