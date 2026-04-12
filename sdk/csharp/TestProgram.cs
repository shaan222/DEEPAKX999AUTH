using System;
using System.Threading.Tasks;
using AuthSystem.SDK;

namespace AuthClientTest
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("=== Licensify C# SDK Test Program ===\n");
            
            // Configuration
            string apiUrl = "https://www.licensify.space";
            string apiKey = "YOUR_API_KEY_HERE"; // Replace with your actual API key
            string username = "testuser"; // Replace with your username
            string password = "testpass"; // Replace with your password
            
            Console.WriteLine($"API URL: {apiUrl}");
            Console.WriteLine($"API Key: {apiKey.Substring(0, Math.Min(10, apiKey.Length))}...");
            Console.WriteLine($"Username: {username}\n");
            
            // Create client
            AuthClient client = null;
            
            try
            {
                Console.WriteLine("[1/4] Creating AuthClient...");
                client = new AuthClient(apiUrl, apiKey);
                Console.WriteLine("✓ AuthClient created successfully\n");
                
                Console.WriteLine("[2/4] Generating HWID...");
                string hwid = client.CurrentHWID;
                Console.WriteLine($"✓ HWID generated: {hwid.Substring(0, 16)}...\n");
                
                Console.WriteLine("[3/4] Attempting login...");
                Console.WriteLine("This may take a few seconds...\n");
                
                var loginResult = await client.LoginAsync(username, password);
                
                Console.WriteLine("[4/4] Login Result:");
                Console.WriteLine("═══════════════════════════════════════");
                Console.WriteLine($"Success: {loginResult.Success}");
                Console.WriteLine($"Message: {loginResult.Message}");
                
                if (loginResult.Success && loginResult.User != null)
                {
                    Console.WriteLine("\n✓✓✓ LOGIN SUCCESSFUL! ✓✓✓\n");
                    Console.WriteLine("User Information:");
                    Console.WriteLine($"  ID: {loginResult.User.Id}");
                    Console.WriteLine($"  Username: {loginResult.User.Username}");
                    Console.WriteLine($"  Email: {loginResult.User.Email}");
                    Console.WriteLine($"  HWID: {loginResult.User.HWID?.Substring(0, 16)}...");
                    Console.WriteLine($"  HWID Locked: {loginResult.User.HWIDLocked}");
                    Console.WriteLine($"  IP Address: {loginResult.User.IP}");
                    Console.WriteLine($"  First Login: {loginResult.User.IsFirstLogin}");
                    
                    if (loginResult.User.ExpiresAt != null)
                    {
                        Console.WriteLine($"  Expires At: {loginResult.User.ExpiresAt}");
                    }
                    
                    if (loginResult.User.IsFirstLogin)
                    {
                        Console.WriteLine("\n⚠ This is your first login - your device has been locked!");
                        Console.WriteLine("  You can only login from this device from now on.");
                    }
                }
                else
                {
                    Console.WriteLine("\n✗✗✗ LOGIN FAILED ✗✗✗");
                    Console.WriteLine($"Reason: {loginResult.Message}");
                }
                
                Console.WriteLine("═══════════════════════════════════════");
            }
            catch (AuthException ex)
            {
                Console.WriteLine("\n✗✗✗ AUTHENTICATION ERROR ✗✗✗");
                Console.WriteLine("═══════════════════════════════════════");
                Console.WriteLine($"Error Code: {ex.ErrorCode}");
                Console.WriteLine($"Message: {ex.Message}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"\nInner Exception: {ex.InnerException.Message}");
                }
                
                Console.WriteLine("\nCommon Solutions:");
                switch (ex.ErrorCode)
                {
                    case "NETWORK_ERROR":
                        Console.WriteLine("  • Check your internet connection");
                        Console.WriteLine("  • Verify the API URL is correct");
                        Console.WriteLine("  • Check if firewall is blocking the connection");
                        Console.WriteLine("  • Try disabling antivirus temporarily");
                        break;
                    case "TIMEOUT_ERROR":
                        Console.WriteLine("  • Check your internet connection");
                        Console.WriteLine("  • The server might be slow - try again");
                        break;
                    case "HWID_LOCKED":
                        Console.WriteLine("  • This account is locked to a different device");
                        Console.WriteLine("  • Contact support to reset device binding");
                        break;
                    case "HTTP_401":
                        Console.WriteLine("  • Invalid API key");
                        Console.WriteLine("  • Check your API key is correct");
                        break;
                    case "HTTP_403":
                        Console.WriteLine("  • Account is banned, paused, or expired");
                        Console.WriteLine("  • Contact support for assistance");
                        break;
                    default:
                        Console.WriteLine("  • Check the error message above for details");
                        Console.WriteLine("  • Contact support if the issue persists");
                        break;
                }
                Console.WriteLine("═══════════════════════════════════════");
            }
            catch (Exception ex)
            {
                Console.WriteLine("\n✗✗✗ UNEXPECTED ERROR ✗✗✗");
                Console.WriteLine("═══════════════════════════════════════");
                Console.WriteLine($"Exception Type: {ex.GetType().Name}");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"\nStack Trace:\n{ex.StackTrace}");
                Console.WriteLine("═══════════════════════════════════════");
            }
            finally
            {
                client?.Dispose();
            }
            
            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
    }
}

