/**
 * Licensify License Validation Integration Example
 * 
 * Simple KeyAuth-style integration for your applications
 */

class KeyAuth {
  constructor({ apiKey, appName, baseUrl = 'https://your-domain.com' }) {
    this.apiKey = apiKey;
    this.appName = appName;
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize and validate license
   * @param {string} licenseKey - The license key to validate
   * @returns {Promise<boolean>} - Returns true if valid
   */
  async init(licenseKey) {
    try {
      const hwid = this.getHWID();
      
      const response = await fetch(`${this.baseUrl}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          licenseKey: licenseKey,
          hwid: hwid,
        }),
      });

      const data = await response.json();
      
      if (data.valid) {
        console.log('✓ Successfully authenticated!');
        return true;
      } else {
        console.log(`Authentication failed: ${data.message}`);
        return false;
      }
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  /**
   * Get unique hardware/device ID
   * @returns {string} Hardware ID
   */
  getHWID() {
    // For web applications - use localStorage
    let hwid = localStorage.getItem('hwid');
    if (!hwid) {
      hwid = 'web_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('hwid', hwid);
    }
    return hwid;
  }
}

// ===============================================
// Usage Example (Browser/Web)
// ===============================================

// 1. Initialize KeyAuth
const KeyAuthApp = new KeyAuth({
  apiKey: "sk_your_api_key_here",
  appName: "My Application"
});

// 2. Get license from user
const userLicenseKey = prompt('Enter your license key:');

// 3. Validate and initialize
(async () => {
  if (await KeyAuthApp.init(userLicenseKey)) {
    console.log('Starting application...');
    // Your application code here
    startApplication();
  } else {
    alert('Failed to authenticate. Please check your license key.');
    blockApplication();
  }
})();

// ===============================================
// Node.js / Electron Example
// ===============================================

/*
const axios = require('axios');
const { machineId } = require('node-machine-id');

class KeyAuth {
  constructor({ apiKey, appName, baseUrl = 'https://your-domain.com' }) {
    this.apiKey = apiKey;
    this.appName = appName;
    this.baseUrl = baseUrl;
  }

  async init(licenseKey) {
    try {
      const hwid = await machineId();
      
      const response = await axios.post(`${this.baseUrl}/api/auth/validate`, {
        apiKey: this.apiKey,
        licenseKey: licenseKey,
        hwid: hwid,
      });

      if (response.data.valid) {
        console.log('✓ Successfully authenticated!');
        return true;
      } else {
        console.log(`Authentication failed: ${response.data.message}`);
        return false;
      }
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }
}

// Usage
const KeyAuthApp = new KeyAuth({
  apiKey: "sk_your_api_key_here",
  appName: "My Application"
});

const userLicenseKey = process.argv[2] || 'XXXX-XXXX-XXXX-XXXX';

if (await KeyAuthApp.init(userLicenseKey)) {
  console.log('Starting application...');
  // Your application code here
} else {
  console.log('Failed to authenticate. Exiting...');
  process.exit(1);
}
*/

