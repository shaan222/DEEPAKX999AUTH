/**
 * DEEPAKX999AUTH TypeScript SDK
 * Type-safe authentication client
 * @version 1.0.0
 * @license MIT
 */

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    hwid: string;
    hwidLocked: boolean;
    ip: string;
    expiresAt?: string;
    isFirstLogin?: boolean;
  };
}

interface ValidateResponse {
  valid: boolean;
  message?: string;
  license?: {
    key: string;
    appName: string;
    expiresAt: string;
    maxDevices: number;
    boundDevices: number;
    deviceLabel?: string;
    gracePeriodActive?: boolean;
  };
  errorCode?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

interface ResetHWIDResponse {
  success: boolean;
  message: string;
}

class DEEPAKX999AUTHClient {
  private apiKey: string;
  private appName: string;
  private baseURL: string;
  private _cachedHWID: string | null = null;

  constructor(apiKey: string, appName: string, baseURL: string = 'https://deepakx-999-auth.vercel.app/') {
    this.apiKey = apiKey;
    this.appName = appName;
    this.baseURL = baseURL;
  }

  /**
   * Generate browser-based HWID
   */
  async generateHWID(): Promise<string> {
    if (this._cachedHWID) return this._cachedHWID;

    if (typeof window !== 'undefined') {
      // Browser environment
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
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
      const crypto = await import('crypto');
      const os = await import('os');
      
      const cpus = os.cpus().map(cpu => cpu.model).join('');
      const platformInfo = os.platform() + os.arch();
      const hostname = os.hostname();
      const combined = `${cpus}${platformInfo}${hostname}`;
      
      this._cachedHWID = crypto.createHash('sha256').update(combined).digest('hex');
    }
    
    return this._cachedHWID;
  }

  /**
   * Login user
   */
  async login(username: string, password: string, hwid?: string): Promise<LoginResponse> {
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
   * Validate license
   */
  async validateLicense(licenseKey: string, hwid?: string): Promise<ValidateResponse> {
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
   */
  async register(
    username: string,
    password: string,
    email: string,
    licenseKey?: string,
    hwid?: string
  ): Promise<RegisterResponse> {
    if (!hwid) hwid = await this.generateHWID();
    
    const payload: any = {
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
   */
  async deleteUser(userId: string): Promise<DeleteResponse> {
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
   */
  async resetHWID(userId: string): Promise<ResetHWIDResponse> {
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

export default DEEPAKX999AUTHClient;

// ===== USAGE EXAMPLE =====
/*
import DEEPAKX999AUTHClient from './deepakx999auth-client';

const client = new DEEPAKX999AUTHClient('YOUR_API_KEY', 'YOUR_APP_NAME');

// Login with type safety
const loginResult: LoginResponse = await client.login('john_doe', 'password123');
if (loginResult.success && loginResult.user) {
  console.log('✅ Logged in:', loginResult.user.username);
  console.log('HWID Locked:', loginResult.user.hwidLocked);
  console.log('IP Address:', loginResult.user.ip);
}

// Validate license with type safety
const validateResult: ValidateResponse = await client.validateLicense('LICENSE-KEY-HERE');
if (validateResult.valid && validateResult.license) {
  console.log('✅ License valid until:', validateResult.license.expiresAt);
  console.log('Devices:', validateResult.license.boundDevices, '/', validateResult.license.maxDevices);
}

// Register new user
const registerResult: RegisterResponse = await client.register(
  'new_user',
  'password123',
  'user@example.com',
  'LICENSE-KEY'
);
if (registerResult.success) {
  console.log('✅ User registered! ID:', registerResult.userId);
}
*/

