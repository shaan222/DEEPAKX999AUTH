/**
 * Licensify JavaScript SDK
 * Works in Node.js and modern browsers
 * @version 1.0.0
 * @license MIT
 */

class LicensifyClient {
  constructor(apiKey, appName, baseURL = 'https://www.licensify.space/') {
    this.apiKey = apiKey;
    this.appName = appName;
    this.baseURL = baseURL;
    this._cachedHWID = null;
  }

  /**
   * Generate browser-based HWID (fingerprint)
   * @returns {Promise<string>} Hardware ID hash
   */
  async generateHWID() {
    if (this._cachedHWID) return this._cachedHWID;

    if (typeof window !== 'undefined') {
      // Browser environment
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser HWID', 2, 2);
      
      const fingerprint = canvas.toDataURL();
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const language = navigator.language;
      const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const combined = `${fingerprint}${userAgent}${platform}${language}${screen}${timezone}`;
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(combined));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      this._cachedHWID = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment
      const crypto = require('crypto');
      const os = require('os');
      
      const cpus = os.cpus().map(cpu => cpu.model).join('');
      const platform = os.platform() + os.arch();
      const hostname = os.hostname();
      const combined = `${cpus}${platform}${hostname}`;
      
      this._cachedHWID = crypto.createHash('sha256').update(combined).digest('hex');
    }
    
    return this._cachedHWID;
  }

  /**
   * Login user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @param {string} [hwid] - Optional hardware ID (auto-generated if not provided)
   * @returns {Promise<Object>} Login response
   */
  async login(username, password, hwid = null) {
    if (!hwid) hwid = await this.generateHWID();
    
    const response = await fetch(`${this.baseURL}api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        username,
        password,
        hwid
      })
    });
    
    return await response.json();
  }

  /**
   * Validate license key
   * @param {string} licenseKey - License key to validate
   * @param {string} [hwid] - Optional hardware ID (auto-generated if not provided)
   * @returns {Promise<Object>} Validation response
   */
  async validateLicense(licenseKey, hwid = null) {
    if (!hwid) hwid = await this.generateHWID();
    
    const response = await fetch(`${this.baseURL}api/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        licenseKey,
        hwid
      })
    });
    
    return await response.json();
  }

  /**
   * Register new user
   * @param {string} username - Desired username
   * @param {string} password - User's password
   * @param {string} email - User's email
   * @param {string} [licenseKey] - Optional license key
   * @param {string} [hwid] - Optional hardware ID (auto-generated if not provided)
   * @returns {Promise<Object>} Registration response
   */
  async register(username, password, email, licenseKey = null, hwid = null) {
    if (!hwid) hwid = await this.generateHWID();
    
    const payload = {
      apiKey: this.apiKey,
      username,
      password,
      email,
      hwid
    };

    if (licenseKey) payload.licenseKey = licenseKey;
    
    const response = await fetch(`${this.baseURL}api/user/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    return await response.json();
  }

  /**
   * Delete user account
   * @param {string} userId - User ID to delete
   * @returns {Promise<Object>} Delete response
   */
  async deleteUser(userId) {
    const response = await fetch(`${this.baseURL}api/user/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        userId
      })
    });
    
    return await response.json();
  }

  /**
   * Reset user's HWID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Reset response
   */
  async resetHWID(userId) {
    const response = await fetch(`${this.baseURL}api/user/reset-hwid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        userId
      })
    });
    
    return await response.json();
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LicensifyClient;
}

// ===== USAGE EXAMPLE =====
/*
// Browser or Node.js
const client = new LicensifyClient('YOUR_API_KEY', 'YOUR_APP_NAME');

// Login
const loginResult = await client.login('john_doe', 'password123');
if (loginResult.success) {
  console.log('✅ Logged in:', loginResult.user);
  console.log('Username:', loginResult.user.username);
  console.log('Email:', loginResult.user.email);
  console.log('HWID Locked:', loginResult.user.hwidLocked);
} else {
  console.error('❌ Login failed:', loginResult.message);
}

// Validate license
const validateResult = await client.validateLicense('LICENSE-KEY-HERE');
if (validateResult.valid) {
  console.log('✅ License valid!', validateResult.license);
  console.log('Expires:', validateResult.license.expiresAt);
  console.log('Devices:', validateResult.license.boundDevices, '/', validateResult.license.maxDevices);
} else {
  console.error('❌ License invalid:', validateResult.message);
}

// Register new user
const registerResult = await client.register('new_user', 'password123', 'user@example.com', 'LICENSE-KEY');
if (registerResult.success) {
  console.log('✅ User registered successfully!');
} else {
  console.error('❌ Registration failed:', registerResult.message);
}
*/

