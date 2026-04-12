# Licensify SDK Library 💻

Production-ready authentication SDKs for 11+ programming languages. Download, integrate, and ship in minutes.

## 📦 Available SDKs

| Language | Version | Installation | File |
|----------|---------|-------------|------|
| **JavaScript** | 1.0.0 | `npm install licensify-sdk` | [licensify-client.js](./javascript/licensify-client.js) |
| **TypeScript** | 1.0.0 | `npm install licensify-sdk` | [licensify-client.ts](./typescript/licensify-client.ts) |
| **Python** | 1.0.0 | `pip install licensify-sdk` | [auth_client.py](./python/auth_client.py) |
| **C#** | 1.0.0 | `dotnet add package Licensify.SDK` | [AuthClient.cs](./csharp/AuthClient.cs) |
| **Java** | 1.0.0 | Maven/Gradle | [AuthClient.java](./java/AuthClient.java) |
| **PHP** | 1.0.0 | `composer require licensify/sdk` | [LicensifyClient.php](./php/LicensifyClient.php) |
| **C++** | 1.0.0 | Build from source | [licensify_client.hpp](./cpp/licensify_client.hpp) |
| **Go** | 1.0.0 | `go get github.com/licensify/sdk` | [licensify.go](./go/licensify.go) |
| **Rust** | 1.0.0 | `cargo add licensify-sdk` | [licensify.rs](./rust/licensify.rs) |
| **Ruby** | 1.0.0 | `gem install licensify-sdk` | [licensify_client.rb](./ruby/licensify_client.rb) |
| **Lua** | 1.0.0 | `luarocks install licensify` | [licensify.lua](./lua/licensify.lua) |

## 🚀 Quick Start

### JavaScript / TypeScript

```bash
npm install licensify-sdk
```

```javascript
import LicensifyClient from 'licensify-sdk';

const client = new LicensifyClient('YOUR_API_KEY', 'YOUR_APP_NAME');

// Login
const result = await client.login('username', 'password');
if (result.success) {
  console.log('✅ Logged in:', result.user);
}

// Validate license
const validation = await client.validateLicense('LICENSE-KEY-HERE');
if (validation.valid) {
  console.log('✅ License valid!');
}
```

### Python

```bash
pip install licensify-sdk
```

```python
from licensify_sdk import LicensifyClient

async with LicensifyClient('YOUR_API_KEY', 'YOUR_APP_NAME') as client:
    # Login
    result = await client.login('username', 'password')
    if result['success']:
        print('✅ Logged in:', result['user'])
    
    # Validate license
    validation = await client.validate_license('LICENSE-KEY-HERE')
    if validation['valid']:
        print('✅ License valid!')
```

### C#

```bash
dotnet add package Licensify.SDK
```

```csharp
using Licensify.SDK;

var client = new LicensifyClient("YOUR_API_KEY", "YOUR_APP_NAME");

// Login
var result = await client.LoginAsync("username", "password");
if (result.Success)
{
    Console.WriteLine($"✅ Logged in: {result.User.Username}");
}

// Validate license
var validation = await client.ValidateLicenseAsync("LICENSE-KEY-HERE");
if (validation.Valid)
{
    Console.WriteLine("✅ License valid!");
}
```

### PHP

```bash
composer require licensify/sdk
```

```php
<?php
use Licensify\SDK\LicensifyClient;

$client = new LicensifyClient('YOUR_API_KEY', 'YOUR_APP_NAME');

// Login
$result = $client->login('username', 'password123');
if ($result['success']) {
    echo "✅ Logged in: " . $result['user']['username'];
}

// Validate license
$validation = $client->validateLicense('LICENSE-KEY-HERE');
if ($validation['valid']) {
    echo "✅ License valid!";
}
```

### Go

```bash
go get github.com/licensify/sdk
```

```go
package main

import (
    "fmt"
    "github.com/licensify/sdk"
)

func main() {
    client := licensify.NewClient("YOUR_API_KEY", "YOUR_APP_NAME", "")
    
    // Login
    result, _ := client.Login("username", "password123", "")
    if result.Success {
        fmt.Printf("✅ Logged in: %s\n", result.User.Username)
    }
    
    // Validate license
    validation, _ := client.ValidateLicense("LICENSE-KEY-HERE", "")
    if validation.Valid {
        fmt.Println("✅ License valid!")
    }
}
```

## ✨ Key Features

- **🔐 Secure Authentication** - HWID binding and secure password handling
- **⚡ Auto HWID Generation** - Automatic hardware ID generation for device binding
- **🔄 License Validation** - Validate license keys with device tracking
- **📊 Full Type Safety** - Strongly typed responses (TypeScript, C#, Java, Go, Rust)
- **🌐 Cross-Platform** - Works on Windows, macOS, Linux, and browsers
- **📝 Comprehensive Docs** - Full API documentation and examples
- **🚀 Production Ready** - Battle-tested in production applications
- **💯 Error Handling** - Robust error handling and detailed error messages

## 📚 API Methods

All SDKs support the following methods:

### `login(username, password, hwid?)`
Authenticate a user with username and password.

**Parameters:**
- `username` (string) - User's username
- `password` (string) - User's password
- `hwid` (string, optional) - Hardware ID (auto-generated if not provided)

**Returns:**
- `success` (boolean) - Whether login was successful
- `user` (object) - User information (id, username, email, hwid, hwidLocked)
- `message` (string) - Success or error message

### `validateLicense(licenseKey, hwid?)`
Validate a license key and bind it to a device.

**Parameters:**
- `licenseKey` (string) - License key to validate
- `hwid` (string, optional) - Hardware ID (auto-generated if not provided)

**Returns:**
- `valid` (boolean) - Whether license is valid
- `license` (object) - License information (key, appName, expiresAt, maxDevices, boundDevices)
- `message` (string) - Success or error message
- `errorCode` (string) - Error code if validation failed

### `register(username, password, email, licenseKey?, hwid?)`
Register a new user account.

**Parameters:**
- `username` (string) - Desired username
- `password` (string) - Account password
- `email` (string) - User's email
- `licenseKey` (string, optional) - License key to associate with account
- `hwid` (string, optional) - Hardware ID (auto-generated if not provided)

**Returns:**
- `success` (boolean) - Whether registration was successful
- `message` (string) - Success or error message
- `userId` (string) - Created user ID

### `generateHWID()`
Generate a unique hardware ID for the current device.

**Returns:**
- `hwid` (string) - SHA-256 hash of device information

## 🔒 HWID Generation

All SDKs automatically generate unique Hardware IDs based on:

- **Windows**: User SID → Processor ID + Motherboard Serial → MAC Address
- **Linux**: Machine ID → DMI UUID → MAC Address
- **macOS**: Hardware UUID → Serial Number → MAC Address
- **Browser**: Canvas fingerprint + User Agent + Platform + Screen + Timezone

## 📖 Documentation

- [API Reference](https://www.licensify.space/dashboard/docs/api)
- [HWID Examples](https://www.licensify.space/dashboard/docs/hwid)
- [Integration Guide](https://www.licensify.space/docs)
- [SDK Examples](https://www.licensify.space/dashboard/sdk)

## 🆘 Support

- **Documentation**: [https://www.licensify.space/docs](https://www.licensify.space/docs)
- **Dashboard**: [https://www.licensify.space/dashboard](https://www.licensify.space/dashboard)
- **Issues**: Report bugs and request features through your dashboard

## 📄 License

All SDKs are released under the MIT License.

## 🔄 Version History

### 1.0.0 (2024)
- Initial release
- Support for 11 programming languages
- HWID-based authentication
- License validation
- User management
- Cross-platform support

---

## 👥 Team

**Founder & Developer:** MD. FAIZAN  
**CTO:** Shivam Jnath

---

Made with ❤️ by Licensify
