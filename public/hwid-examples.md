# Hardware ID (HWID) Generation Examples

This document provides code examples for generating hardware identifiers across different platforms for use with the Licensify System.

## Important Notes

- **Privacy**: HWIDs should be hashed before transmission for user privacy
- **Stability**: Choose hardware components that remain stable across reboots
- **Uniqueness**: Combine multiple hardware identifiers to ensure uniqueness
- **Fallback**: Implement fallback mechanisms for devices without certain hardware

---

## 1. Node.js / Electron Applications

### Using `node-machine-id` Package (Recommended)

```javascript
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');

/**
 * Generate a hardware ID using machine-id
 * This is the most reliable method for Node.js applications
 */
function generateHWID() {
  try {
    // Get unique machine ID (persists across reboots)
    const machineId = machineIdSync();
    
    // Hash it for privacy
    const hwid = crypto.createHash('sha256')
      .update(machineId)
      .digest('hex');
    
    return hwid;
  } catch (error) {
    console.error('Failed to generate HWID:', error);
    // Fallback to a generated UUID stored in local config
    return getFallbackHWID();
  }
}

/**
 * Fallback HWID generation and storage
 */
function getFallbackHWID() {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  const configPath = path.join(os.homedir(), '.myapp-hwid');
  
  try {
    // Try to read existing HWID
    if (fs.existsSync(configPath)) {
      return fs.readFileSync(configPath, 'utf8').trim();
    }
    
    // Generate new HWID
    const newHWID = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(configPath, newHWID);
    return newHWID;
  } catch (error) {
    // Last resort: generate temporary HWID
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = { generateHWID };
```

### Custom Multi-Component HWID (Advanced)

```javascript
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');

/**
 * Generate HWID from multiple hardware components
 * More robust but requires elevated permissions on some systems
 */
function generateDetailedHWID() {
  const components = [];
  
  // 1. CPU Information
  const cpus = os.cpus();
  if (cpus.length > 0) {
    components.push(cpus[0].model);
  }
  
  // 2. Network Interface MAC Addresses
  const networks = os.networkInterfaces();
  for (const name in networks) {
    for (const net of networks[name]) {
      if (net.mac && net.mac !== '00:00:00:00:00:00') {
        components.push(net.mac);
      }
    }
  }
  
  // 3. Platform-Specific Identifiers
  try {
    if (process.platform === 'win32') {
      // Windows: Get motherboard serial
      const wmic = execSync('wmic baseboard get serialnumber', { encoding: 'utf8' });
      const serial = wmic.split('\n')[1]?.trim();
      if (serial) components.push(serial);
    } else if (process.platform === 'darwin') {
      // macOS: Get hardware UUID
      const uuid = execSync('system_profiler SPHardwareDataType | grep UUID', { encoding: 'utf8' });
      const hardware = uuid.split(':')[1]?.trim();
      if (hardware) components.push(hardware);
    } else if (process.platform === 'linux') {
      // Linux: Get machine ID
      const machineId = execSync('cat /etc/machine-id || cat /var/lib/dbus/machine-id', { encoding: 'utf8' });
      if (machineId) components.push(machineId.trim());
    }
  } catch (error) {
    console.warn('Could not get platform-specific ID:', error.message);
  }
  
  // Combine all components and hash
  const combined = components.join('|');
  return crypto.createHash('sha256').update(combined).digest('hex');
}

module.exports = { generateDetailedHWID };
```

---

## 2. Browser / Web Applications

### Browser Fingerprinting

```javascript
/**
 * Generate a browser fingerprint for web applications
 * Note: Browser fingerprints are less stable than native HWIDs
 * Use with caution and implement fallback mechanisms
 */
class BrowserHWID {
  static async generate() {
    const components = [];
    
    // 1. Canvas Fingerprint
    components.push(await this.getCanvasFingerprint());
    
    // 2. WebGL Fingerprint
    components.push(await this.getWebGLFingerprint());
    
    // 3. Screen Information
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    
    // 4. Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // 5. Language
    components.push(navigator.language);
    
    // 6. Platform
    components.push(navigator.platform);
    
    // 7. Hardware Concurrency (CPU cores)
    components.push(navigator.hardwareConcurrency || 'unknown');
    
    // 8. Device Memory (if available)
    if ('deviceMemory' in navigator) {
      components.push(navigator.deviceMemory);
    }
    
    // Combine and hash
    const combined = components.join('|');
    return await this.sha256(combined);
  }
  
  static async getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const text = 'BrowserHWID';
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(text, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(text, 4, 17);
    
    return canvas.toDataURL();
  }
  
  static async getWebGLFingerprint() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'no-webgl';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';
    
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return `${vendor}~${renderer}`;
  }
  
  static async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Store fingerprint in localStorage for consistency
  static async getOrGenerateHWID() {
    const stored = localStorage.getItem('app_hwid');
    if (stored) return stored;
    
    const hwid = await this.generate();
    localStorage.setItem('app_hwid', hwid);
    return hwid;
  }
}

// Usage
const hwid = await BrowserHWID.getOrGenerateHWID();
console.log('Browser HWID:', hwid);
```

---

## 3. React Native / Mobile Applications

### React Native HWID

```javascript
import DeviceInfo from 'react-native-device-info';
import * as Crypto from 'expo-crypto';

/**
 * Generate HWID for React Native applications
 * Requires: react-native-device-info
 */
export async function generateMobileHWID() {
  try {
    // Get unique device ID (best option)
    const uniqueId = await DeviceInfo.getUniqueId();
    
    // Hash it for privacy
    const hwid = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      uniqueId
    );
    
    return hwid;
  } catch (error) {
    console.error('Failed to generate HWID:', error);
    throw error;
  }
}

/**
 * Generate detailed mobile HWID with multiple components
 */
export async function generateDetailedMobileHWID() {
  const components = [];
  
  // Device unique ID
  components.push(await DeviceInfo.getUniqueId());
  
  // Device brand and model
  components.push(await DeviceInfo.getBrand());
  components.push(await DeviceInfo.getModel());
  
  // System version
  components.push(await DeviceInfo.getSystemVersion());
  
  // Device type (Handset, Tablet, etc.)
  components.push(await DeviceInfo.getDeviceType());
  
  // Combine and hash
  const combined = components.join('|');
  const hwid = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
  
  return hwid;
}

// Usage
const hwid = await generateMobileHWID();
console.log('Mobile HWID:', hwid);
```

---

## 4. Python Applications

```python
import hashlib
import uuid
import platform
import subprocess

def generate_hwid():
    """
    Generate a hardware ID for Python applications
    Combines multiple hardware identifiers for uniqueness
    """
    components = []
    
    # 1. Machine UUID (most reliable)
    try:
        machine_uuid = str(uuid.getnode())
        components.append(machine_uuid)
    except Exception:
        pass
    
    # 2. Platform information
    components.append(platform.machine())
    components.append(platform.processor())
    
    # 3. Platform-specific identifiers
    system = platform.system()
    
    if system == 'Windows':
        try:
            # Get Windows machine GUID
            result = subprocess.check_output(
                'wmic csproduct get uuid',
                shell=True,
                text=True
            )
            uuid_line = result.split('\n')[1].strip()
            components.append(uuid_line)
        except Exception:
            pass
            
    elif system == 'Darwin':  # macOS
        try:
            result = subprocess.check_output(
                ['system_profiler', 'SPHardwareDataType'],
                text=True
            )
            for line in result.split('\n'):
                if 'Hardware UUID' in line:
                    hw_uuid = line.split(':')[1].strip()
                    components.append(hw_uuid)
        except Exception:
            pass
            
    elif system == 'Linux':
        try:
            with open('/etc/machine-id', 'r') as f:
                machine_id = f.read().strip()
                components.append(machine_id)
        except Exception:
            try:
                with open('/var/lib/dbus/machine-id', 'r') as f:
                    machine_id = f.read().strip()
                    components.append(machine_id)
            except Exception:
                pass
    
    # Combine all components and hash
    combined = '|'.join(components)
    hwid = hashlib.sha256(combined.encode()).hexdigest()
    
    return hwid

# Usage
hwid = generate_hwid()
print(f"HWID: {hwid}")
```

---

## 5. C# / .NET Applications

```csharp
using System;
using System.Management;
using System.Security.Cryptography;
using System.Text;

public class HWIDGenerator
{
    /// <summary>
    /// Generate a hardware ID for .NET applications
    /// Combines multiple hardware identifiers
    /// </summary>
    public static string GenerateHWID()
    {
        var components = new StringBuilder();
        
        try
        {
            // CPU ID
            components.Append(GetCPUID());
            components.Append("|");
            
            // Motherboard Serial
            components.Append(GetMotherboardSerial());
            components.Append("|");
            
            // Disk Serial
            components.Append(GetDiskSerial());
            components.Append("|");
            
            // MAC Address
            components.Append(GetMACAddress());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating HWID: {ex.Message}");
        }
        
        // Hash the combined string
        return HashString(components.ToString());
    }
    
    private static string GetCPUID()
    {
        return GetWMIValue("Win32_Processor", "ProcessorId");
    }
    
    private static string GetMotherboardSerial()
    {
        return GetWMIValue("Win32_BaseBoard", "SerialNumber");
    }
    
    private static string GetDiskSerial()
    {
        return GetWMIValue("Win32_DiskDrive", "SerialNumber");
    }
    
    private static string GetMACAddress()
    {
        return GetWMIValue("Win32_NetworkAdapter", "MACAddress", "PhysicalAdapter = True");
    }
    
    private static string GetWMIValue(string wmiClass, string property, string condition = null)
    {
        try
        {
            string query = $"SELECT {property} FROM {wmiClass}";
            if (!string.IsNullOrEmpty(condition))
            {
                query += $" WHERE {condition}";
            }
            
            using (var searcher = new ManagementObjectSearcher(query))
            {
                foreach (ManagementObject obj in searcher.Get())
                {
                    var value = obj[property]?.ToString();
                    if (!string.IsNullOrEmpty(value))
                    {
                        return value;
                    }
                }
            }
        }
        catch (Exception)
        {
            // Ignore errors and continue
        }
        
        return "unknown";
    }
    
    private static string HashString(string input)
    {
        using (var sha256 = SHA256.Create())
        {
            byte[] bytes = Encoding.UTF8.GetBytes(input);
            byte[] hash = sha256.ComputeHash(bytes);
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}

// Usage
string hwid = HWIDGenerator.GenerateHWID();
Console.WriteLine($"HWID: {hwid}");
```

---

## Integration Example with Licensify

```javascript
const fetch = require('node-fetch');
const { generateHWID } = require('./hwid-generator');

// Example: Validate license with HWID
async function validateLicense(apiKey, licenseKey) {
  const hwid = generateHWID();
  
  const response = await fetch('https://www.licensify.space/api/auth/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: apiKey,
      licenseKey: licenseKey,
      hwid: hwid,  // Send HWID for device binding
    }),
  });
  
  const data = await response.json();
  
  if (data.valid) {
    console.log('✅ License valid!');
    console.log('Bound devices:', data.license.boundDevices);
    console.log('Max devices:', data.license.maxDevices);
    return true;
  } else {
    console.error('❌ License invalid:', data.message);
    if (data.errorCode === 'DEVICE_LIMIT_REACHED') {
      console.error('Device limit reached. Contact support to reset devices.');
    }
    return false;
  }
}
```

---

## Best Practices

1. **Always hash HWIDs** before sending to the server
2. **Implement fallback mechanisms** for hardware without certain components
3. **Store HWIDs locally** to maintain consistency across app restarts
4. **Test on multiple devices** to ensure uniqueness and stability
5. **Handle errors gracefully** - don't fail app startup if HWID generation fails
6. **Respect user privacy** - inform users about device binding in your terms
7. **Provide reset mechanism** - allow legitimate users to unbind old devices

---

## NPM Packages for HWID Generation

- **node-machine-id**: `npm install node-machine-id`
- **react-native-device-info**: `npm install react-native-device-info`
- **fingerprintjs**: `npm install @fingerprintjs/fingerprintjs` (Browser)
- **uuid**: `npm install uuid` (Fallback UUIDs)

---

For questions or support, visit: https://www.licensify.space

