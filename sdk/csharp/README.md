# Licensify C# SDK

Complete C# client library for the Licensify authentication and license management system.

## Features

✅ **Hardware ID (HWID) Generation** - Automatic device fingerprinting  
✅ **User Login & Registration** - Secure authentication with device binding  
✅ **License Validation** - Verify license keys with HWID binding  
✅ **Session Management** - Automatic heartbeat and session maintenance  
✅ **Error Handling** - Comprehensive exception handling with detailed error codes  

---

## Quick Start

### 1. Installation

**Option A: Add the AuthClient.cs file to your project**
```bash
# Copy AuthClient.cs to your C# project
# Right-click your project > Add > Existing Item > Select AuthClient.cs
```

**Option B: Create a new project and add the file**
```bash
dotnet new console -n MyAuthApp
cd MyAuthApp
# Copy AuthClient.cs to the project folder
dotnet add package Newtonsoft.Json
dotnet add package System.Management
```

### 2. Install Required NuGet Packages

```bash
dotnet add package Newtonsoft.Json
dotnet add package System.Management
```

Or via Package Manager Console:
```
Install-Package Newtonsoft.Json
Install-Package System.Management
```

### 3. Basic Usage

```csharp
using System;
using System.Threading.Tasks;
using AuthSystem.SDK;

class Program
{
    static async Task Main(string[] args)
    {
        // Initialize the client
        var authClient = new AuthClient(
            "https://www.licensify.space",  // API URL
            "your-api-key-here"              // Your app's API key
        );

        try
        {
            // Login
            var loginResult = await authClient.LoginAsync("username", "password");
            
            if (loginResult.Success)
            {
                Console.WriteLine($"✓ Login successful! Welcome {loginResult.User.Username}");
                Console.WriteLine($"Device HWID: {loginResult.User.HWID}");
                
                // Your app logic here...
            }
            else
            {
                Console.WriteLine($"✗ Login failed: {loginResult.Message}");
            }
        }
        catch (AuthException ex)
        {
            Console.WriteLine($"Error [{ex.ErrorCode}]: {ex.Message}");
        }
        finally
        {
            authClient.Dispose();
        }
    }
}
```

---

## Testing the SDK

### Step 1: Get Your API Key

1. Go to [https://www.licensify.space](https://www.licensify.space)
2. Register/Login to your account
3. Navigate to **Dashboard > Applications**
4. Create a new application or use an existing one
5. Copy the **API Key** (starts with `sk_`)

### Step 2: Create a Test User

1. In the dashboard, go to **Users & Clients**
2. Click **Create User**
3. Fill in:
   - Username: `testuser`
   - Password: `TestPass123!`
   - Email: `test@example.com`
   - Select your application
4. Click **Create**

### Step 3: Run the Test Program

1. Open `TestProgram.cs`
2. Replace the configuration values:
   ```csharp
   string apiUrl = "https://www.licensify.space";
   string apiKey = "sk_YOUR_ACTUAL_API_KEY";  // ← Change this
   string username = "testuser";               // ← Your test username
   string password = "TestPass123!";           // ← Your test password
   ```
3. Build and run:
   ```bash
   dotnet build
   dotnet run
   ```

### Expected Output (Success)

```
=== Licensify C# SDK Test Program ===

API URL: https://www.licensify.space
API Key: sk_xxxxxx...
Username: testuser

[1/4] Creating AuthClient...
✓ AuthClient created successfully

[2/4] Generating HWID...
✓ HWID generated: abc123def456...

[3/4] Attempting login...
This may take a few seconds...

[AuthClient] Making POST request to: https://www.licensify.space/api/user/login
[AuthClient] Request payload: {"apiKey":"sk_xxx...","username":"testuser","password":"***","hwid":"abc123..."}
[AuthClient] Response status: 200 OK
[AuthClient] Response body: {"success":true,"message":"Login successful",...}

[4/4] Login Result:
═══════════════════════════════════════
Success: True
Message: Login successful

✓✓✓ LOGIN SUCCESSFUL! ✓✓✓

User Information:
  ID: user123
  Username: testuser
  Email: test@example.com
  HWID: abc123def456...
  HWID Locked: True
  IP Address: 192.168.1.100
  First Login: True

⚠ This is your first login - your device has been locked!
  You can only login from this device from now on.
═══════════════════════════════════════
```

---

## Troubleshooting

### ❌ Network Error

**Symptoms:**
```
✗✗✗ AUTHENTICATION ERROR ✗✗✗
Error Code: NETWORK_ERROR
Message: Network error: ...
```

**Solutions:**
1. ✅ Check your internet connection
2. ✅ Verify the API URL is correct: `https://www.licensify.space`
3. ✅ Check if your firewall is blocking HTTPS connections
4. ✅ Try disabling antivirus/firewall temporarily
5. ✅ Check if you're behind a proxy (configure HttpClient if needed)
6. ✅ Ping the server: `ping licensify.space`

### ❌ SSL Certificate Error

**Symptoms:**
```
Inner Exception: The SSL connection could not be established
```

**Solutions:**
1. The current SDK already bypasses SSL validation for testing
2. For production, remove the `ServerCertificateCustomValidationCallback` line
3. Or install the certificate properly on your system

### ❌ Invalid API Key (HTTP 401)

**Symptoms:**
```
Error Code: HTTP_401
Message: Invalid API key
```

**Solutions:**
1. ✅ Copy your API key from the dashboard
2. ✅ Make sure it starts with `sk_`
3. ✅ Check for extra spaces or quotes
4. ✅ Verify your application is **Active** in the dashboard

### ❌ HWID Locked Error

**Symptoms:**
```
Error Code: HWID_LOCKED
Message: Hardware ID mismatch. This account is locked to a different device.
```

**Solutions:**
1. This account was previously logged in from a different device
2. Go to **Dashboard > Users** and click **Reset HWID** for this user
3. Try logging in again

### ❌ Timeout Error

**Symptoms:**
```
Error Code: TIMEOUT_ERROR
Message: Request timed out
```

**Solutions:**
1. ✅ Check your internet speed
2. ✅ The server might be slow - try again
3. ✅ Increase timeout in `AuthClient` constructor:
   ```csharp
   _httpClient = new HttpClient(handler)
   {
       Timeout = TimeSpan.FromSeconds(60)  // Increased from 30
   };
   ```

---

## API Methods

### 🔐 Login

```csharp
var result = await authClient.LoginAsync("username", "password");

if (result.Success)
{
    Console.WriteLine($"User ID: {result.User.Id}");
    Console.WriteLine($"Username: {result.User.Username}");
    Console.WriteLine($"Email: {result.User.Email}");
    Console.WriteLine($"HWID: {result.User.HWID}");
    Console.WriteLine($"HWID Locked: {result.User.HWIDLocked}");
    Console.WriteLine($"IP: {result.User.IP}");
    Console.WriteLine($"First Login: {result.User.IsFirstLogin}");
}
```

### 📝 Register

```csharp
var result = await authClient.RegisterAsync(
    username: "johndoe",
    password: "SecurePass123!",
    email: "john@example.com",
    licenseKey: "XXXX-XXXX-XXXX-XXXX" // Optional
);
```

### 🔑 Validate License

```csharp
var result = await authClient.ValidateLicenseAsync("XXXX-XXXX-XXXX-XXXX");

if (result.Valid)
{
    Console.WriteLine($"License is valid until: {result.ExpiresAt}");
}
```

### 🔍 Check Session

```csharp
var result = await authClient.CheckSessionAsync();

if (result.Valid)
{
    Console.WriteLine("Session is still active");
}
```

### 🚪 Logout

```csharp
var result = await authClient.LogoutAsync();
```

---

## Advanced Features

### Get Device HWID

```csharp
string hwid = authClient.CurrentHWID;
Console.WriteLine($"Device HWID: {hwid}");
```

### Manual HWID Generation

```csharp
string hwid = authClient.GenerateHWID();
```

### Automatic Session Heartbeat

The SDK automatically maintains the session with a heartbeat every 5 minutes after successful login. No action needed!

---

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `NETWORK_ERROR` | Network connection failed | Check internet, firewall, API URL |
| `TIMEOUT_ERROR` | Request timed out | Check connection, try again |
| `HWID_LOCKED` | Device mismatch | Reset HWID in dashboard |
| `HWID_GENERATION_ERROR` | Failed to generate HWID | Run as administrator |
| `HTTP_401` | Invalid API key | Check API key |
| `HTTP_403` | Account banned/paused/expired | Contact support |
| `HTTP_426` | Outdated client version | Update your app |
| `INVALID_CREDENTIALS` | Wrong username/password | Check credentials |

---

## Production Deployment

### ⚠️ Before deploying to production:

1. **Remove SSL bypass** (optional - if you want strict SSL):
   ```csharp
   // Remove this line in AuthClient constructor:
   ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true,
   ```

2. **Remove debug console logs** (optional):
   ```csharp
   // Comment out or remove Console.WriteLine statements in SendRequestAsync
   ```

3. **Secure your API key**:
   ```csharp
   // Don't hardcode - use config file or environment variables
   string apiKey = ConfigurationManager.AppSettings["LicensifyApiKey"];
   ```

4. **Add proper error handling**:
   ```csharp
   try
   {
       var result = await authClient.LoginAsync(username, password);
       // Handle result...
   }
   catch (AuthException ex)
   {
       // Log to file, show user-friendly message
       LogError($"Auth failed: {ex.ErrorCode} - {ex.Message}");
       MessageBox.Show("Login failed. Please try again.");
   }
   ```

---

## Requirements

- **.NET Framework**: 4.6.1 or higher
- **.NET Core**: 3.1 or higher
- **.NET**: 5.0 or higher

### NuGet Dependencies:
- `Newtonsoft.Json` (12.0.3 or higher)
- `System.Management` (For HWID generation on Windows)

---

## Support

- **Documentation**: https://www.licensify.space/docs
- **Dashboard**: https://www.licensify.space/dashboard
- **API Reference**: https://www.licensify.space/dashboard/docs/api

---

## License

MIT License - Free to use in commercial and personal projects.

---

**Built with ❤️ for Licensify by MD. FAIZAN & Shivam Jnath**

