# DEEPAKX999AUTH SDK Libraries

Comprehensive client authentication libraries with HWID-based device binding for multiple platforms.

## 🌟 Features

- **Automatic HWID Generation**: Hardware-based device fingerprinting
- **Device Binding**: Lock accounts to specific devices automatically on first login
- **Cross-Platform**: Works on Windows, Linux, and macOS
- **Session Management**: Automatic heartbeat to keep sessions alive
- **Async/Await**: Modern asynchronous patterns
- **Type-Safe**: Strong typing with proper error handling
- **Security**: SHA-256 hashing, JWT token management

## 📁 Available SDKs

### C# SDK (`csharp/AuthClient.cs`)

**Requirements:**
- .NET Framework 4.7.2+ or .NET Core 3.1+
- NuGet Packages:
  - `Newtonsoft.Json` (13.0.3+)
  - `System.Management` (for WMI queries)

**Quick Start:**
```csharp
using DEEPAKX999AUTH.SDK;

var client = new AuthClient(
    "https://www.deepakx999auth.space",
    "your-api-key"
);

var loginResult = await client.LoginAsync("username", "password");
if (loginResult.Success) {
    Console.WriteLine($"Logged in! HWID: {loginResult.User.HWID}");
}
```

**HWID Generation:**
1. Windows User SID (Primary)
2. Processor ID + Motherboard Serial (Fallback)
3. MAC Address (Last resort)

---

### Python SDK (`python/auth_client.py`)

**Requirements:**
- Python 3.8+
- Dependencies:
  ```bash
  pip install aiohttp
  # Optional for Windows:
  pip install pywin32 wmi
  ```

**Quick Start:**
```python
from auth_client import AuthClient
import asyncio

async def main():
    async with AuthClient(
        "https://www.deepakx999auth.space",
        "your-api-key"
    ) as client:
        login_result = await client.login("username", "password")
        if login_result.success:
            print(f"Logged in! HWID: {login_result.user.hwid}")

asyncio.run(main())
```

**HWID Generation:**
- **Windows**: User SID → System UUID → Processor ID
- **Linux**: Machine ID → DMI UUID → MAC Address
- **macOS**: Hardware UUID → MAC Address → Serial Number

---

### Java SDK (`java/AuthClient.java`)

**Requirements:**
- Java 8+
- Dependencies (Maven):
  ```xml
  <dependencies>
      <dependency>
          <groupId>com.squareup.okhttp3</groupId>
          <artifactId>okhttp</artifactId>
          <version>4.12.0</version>
      </dependency>
      <dependency>
          <groupId>com.google.code.gson</groupId>
          <artifactId>gson</artifactId>
          <version>2.10.1</version>
      </dependency>
      <dependency>
          <groupId>com.github.oshi</groupId>
          <artifactId>oshi-core</artifactId>
          <version>6.4.6</version>
      </dependency>
  </dependencies>
  ```

**Quick Start:**
```java
import com.deepakx999auth.sdk.AuthClient;

AuthClient client = new AuthClient.Builder()
        .apiBaseUrl("https://www.deepakx999auth.space")
        .apiKey("your-api-key")
        .build();

client.login("username", "password")
        .thenAccept(response -> {
            if (response.success) {
                System.out.println("Logged in! HWID: " + response.user.hwid);
            }
        })
        .exceptionally(throwable -> {
            System.err.println("Login failed: " + throwable.getMessage());
            return null;
        });
```

**HWID Generation:**
- System UUID + Serial Number
- Processor Identifier
- MAC Address (first physical adapter)
- Cross-platform using OSHI library

---

## 🔒 How Device Binding Works

### First Login
```
User logs in → Server auto-generates/uses client HWID → Saves & locks account
```

### Subsequent Logins
```
Same device → ✅ Success (HWID matches)
Different device → ❌ Blocked (HWID mismatch)
```

### API Behavior

**Client sends HWID (recommended):**
- Server uses the client-provided hardware ID
- More accurate device fingerprinting

**Client doesn't send HWID:**
- Server auto-generates HWID from IP + User Agent
- Still provides device binding (less precise)

## 🚀 Usage Flow

1. **Initialize Client**
   ```
   client = new AuthClient(apiUrl, apiKey)
   ```

2. **Register User** (optional)
   ```
   client.register(username, password, email, licenseKey)
   ```

3. **Login** (auto-locks device on first login)
   ```
   response = client.login(username, password)
   ```

4. **Session Management**
   - Automatic heartbeat every 5 minutes
   - JWT token refresh
   - Session validation

5. **Logout**
   ```
   client.logout()
   ```

## 🛡️ Error Handling

All SDKs provide comprehensive error codes:

- `HWID_LOCKED`: Account locked to different device
- `INVALID_CREDENTIALS`: Wrong username/password
- `LICENSE_EXPIRED`: License has expired
- `NETWORK_ERROR`: Connection issues
- `HWID_REQUIRED`: HWID missing (server-side)

### Example Error Handling

**C#:**
```csharp
try {
    await client.LoginAsync("user", "pass");
} catch (AuthException ex) {
    if (ex.ErrorCode == "HWID_LOCKED") {
        Console.WriteLine("This account is locked to another device!");
    }
}
```

**Python:**
```python
try:
    await client.login("user", "pass")
except AuthException as e:
    if e.error_code == "HWID_LOCKED":
        print("This account is locked to another device!")
```

**Java:**
```java
client.login("user", "pass")
    .exceptionally(throwable -> {
        if (throwable.getCause() instanceof AuthClient.AuthException) {
            AuthClient.AuthException ex = (AuthClient.AuthException) throwable.getCause();
            if (ex.getErrorCode().equals("HWID_LOCKED")) {
                System.out.println("This account is locked to another device!");
            }
        }
        return null;
    });
```

## 📝 License

These SDK libraries are provided as part of the DEEPAKX999AUTH System.
Modify and use according to your needs.

## 🆘 Support

For issues or questions:
1. Check the inline documentation in each SDK file
2. Review the example usage sections
3. Examine the API endpoint responses

---

## 👥 Team

**Founder & Developer:** MD. FAIZAN  
**CTO:** Shivam Jnath

---

**Built with ❤️ for secure authentication**

