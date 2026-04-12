# 🚀 Quick Start - Test in 2 Minutes!

## Prerequisites

1. **Install .NET SDK** (if not already installed):
   - Download from: https://dotnet.microsoft.com/download
   - Install .NET 6.0 or higher
   - Verify installation: `dotnet --version`

## Setup Steps

### Step 1: Get Your Credentials

1. Go to [https://www.licensify.space/dashboard](https://www.licensify.space/dashboard)
2. Navigate to **Applications** → Copy your **API Key** (starts with `sk_`)
3. Navigate to **Users & Clients** → Create a test user:
   - Username: `testuser`
   - Password: `TestPass123!`
   - Email: `test@example.com`

### Step 2: Configure Test Program

1. Open `TestProgram.cs`
2. Find these lines (around line 12-14):
   ```csharp
   string apiUrl = "https://www.licensify.space";
   string apiKey = "YOUR_API_KEY_HERE";  // ← CHANGE THIS
   string username = "testuser";          // ← Your username
   string password = "testpass";          // ← CHANGE THIS
   ```
3. Replace with your actual values:
   ```csharp
   string apiUrl = "https://www.licensify.space";  // ✅ Official URL
   string apiKey = "sk_abc123...";                 // Your actual API key
   string password = "TestPass123!";               // Your actual password
   ```

### Step 3: Run the Test

**Option A: Windows (Easy)**
```bash
# Just double-click this file:
build-and-run.bat
```

**Option B: Command Line**
```bash
dotnet restore
dotnet build
dotnet run
```

**Option C: Visual Studio**
1. Open `LicensifyTest.csproj` in Visual Studio
2. Press F5 to run

---

## What You Should See

### ✅ Success Output:
```
=== Licensify C# SDK Test Program ===

[1/4] Creating AuthClient...
✓ AuthClient created successfully

[2/4] Generating HWID...
✓ HWID generated: abc123def456...

[3/4] Attempting login...

✓✓✓ LOGIN SUCCESSFUL! ✓✓✓

User Information:
  Username: testuser
  HWID Locked: True
  First Login: True
```

### ❌ Common Errors and Fixes

#### Error: "NETWORK_ERROR"
**Cause:** Can't connect to the server

**Fix:**
1. Check internet connection
2. Try: `ping licensify.space`
3. Disable firewall temporarily
4. Check proxy settings

#### Error: "HTTP_401"
**Cause:** Invalid API key

**Fix:**
1. Copy API key from dashboard again
2. Make sure it starts with `sk_`
3. Remove any spaces

#### Error: "Invalid username or password"
**Cause:** Wrong credentials

**Fix:**
1. Check username/password in TestProgram.cs
2. Verify user exists in dashboard
3. Try creating a new test user

---

## Next Steps

Once the test works, integrate into your app:

```csharp
using AuthSystem.SDK;

// In your login form/method:
var authClient = new AuthClient(
    "https://www.licensify.space",
    "your-api-key"
);

try 
{
    var result = await authClient.LoginAsync(username, password);
    
    if (result.Success) 
    {
        // Login successful - show main form
        MessageBox.Show($"Welcome {result.User.Username}!");
        MainForm.Show();
    }
    else
    {
        MessageBox.Show("Login failed: " + result.Message);
    }
}
catch (AuthException ex)
{
    MessageBox.Show($"Error: {ex.Message}");
}
```

---

## Need Help?

1. **Full Documentation**: See `README.md` in this folder
2. **Online Docs**: https://www.licensify.space/docs
3. **Dashboard**: https://www.licensify.space/dashboard

---

**Happy coding! 🎉**

