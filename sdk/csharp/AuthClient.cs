using System;
using System.Collections.Generic;
using System.Linq;
using System.Management;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net.NetworkInformation;

namespace DEEPAKX999AUTH.SDK
{
    /// <summary>
    /// Main authentication client for HWID-based device binding
    /// </summary>
    public class AuthClient : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiBaseUrl;
        private readonly string _apiKey;
        private string _jwtToken;
        private Timer _heartbeatTimer;
        private string _cachedHwid;

        public string CurrentHWID => _cachedHwid ?? (_cachedHwid = GenerateHWID());

        /// <summary>
        /// Initialize the authentication client
        /// </summary>
        /// <param name="apiBaseUrl">Base URL of the authentication API</param>
        /// <param name="apiKey">Your application's API key</param>
        public AuthClient(string apiBaseUrl, string apiKey)
        {
            _apiBaseUrl = apiBaseUrl.TrimEnd('/');
            _apiKey = apiKey;
            
            // Create HttpClientHandler with proper configuration
            var handler = new HttpClientHandler
            {
                // Allow all SSL certificates (for testing - remove in production!)
                ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true,
                // Enable automatic decompression
                AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate
            };
            
            _httpClient = new HttpClient(handler)
            {
                Timeout = TimeSpan.FromSeconds(30)
            };
            
            // Set proper headers
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "DEEPAKX999AUTH-CSharp-SDK/1.0");
            _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
            _httpClient.DefaultRequestHeaders.ConnectionClose = false; // Keep-alive
        }

        #region HWID Generation

        /// <summary>
        /// Generates a unique Hardware ID for the current device
        /// Uses Windows SID → Processor ID + Motherboard SN → MAC Address (in order of preference)
        /// </summary>
        /// <returns>SHA-256 hashed hardware identifier</returns>
        public string GenerateHWID()
        {
            try
            {
                // Primary: Windows User SID
                try
                {
                    WindowsIdentity identity = WindowsIdentity.GetCurrent();
                    if (identity?.User != null)
                    {
                        string sid = identity.User.Value;
                        return HashString(sid);
                    }
                }
                catch { /* Fallback to next method */ }

                // Secondary: Processor ID + Motherboard Serial
                try
                {
                    string processorId = GetWMIValue("Win32_Processor", "ProcessorId");
                    string motherboardSerial = GetWMIValue("Win32_BaseBoard", "SerialNumber");
                    
                    if (!string.IsNullOrEmpty(processorId) && !string.IsNullOrEmpty(motherboardSerial))
                    {
                        return HashString($"{processorId}-{motherboardSerial}");
                    }
                }
                catch { /* Fallback to next method */ }

                // Tertiary: MAC Address
                string macAddress = GetMacAddress();
                if (!string.IsNullOrEmpty(macAddress))
                {
                    return HashString(macAddress);
                }

                // Final fallback: Machine name + User name
                return HashString($"{Environment.MachineName}-{Environment.UserName}");
            }
            catch (Exception ex)
            {
                throw new AuthException("Failed to generate HWID", "HWID_GENERATION_ERROR", ex);
            }
        }

        private string GetWMIValue(string wmiClass, string wmiProperty)
        {
            try
            {
                using (ManagementObjectSearcher searcher = new ManagementObjectSearcher($"SELECT {wmiProperty} FROM {wmiClass}"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        object value = obj[wmiProperty];
                        if (value != null)
                            return value.ToString().Trim();
                    }
                }
            }
            catch { }
            return null;
        }

        private string GetMacAddress()
        {
            try
            {
                return NetworkInterface
                    .GetAllNetworkInterfaces()
                    .Where(nic => nic.OperationalStatus == OperationalStatus.Up 
                                  && nic.NetworkInterfaceType != NetworkInterfaceType.Loopback)
                    .Select(nic => nic.GetPhysicalAddress().ToString())
                    .FirstOrDefault(address => !string.IsNullOrEmpty(address));
            }
            catch
            {
                return null;
            }
        }

        private string HashString(string input)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
                return BitConverter.ToString(bytes).Replace("-", "").ToLower();
            }
        }

        #endregion

        #region Authentication Methods

        /// <summary>
        /// Register a new user account
        /// </summary>
        public async Task<AuthResponse> RegisterAsync(string username, string password, string email, string licenseKey = null)
        {
            var payload = new
            {
                apiKey = _apiKey,
                username,
                password,
                email,
                licenseKey,
                hwid = CurrentHWID
            };

            return await SendRequestAsync<AuthResponse>("POST", "/api/user/create", payload);
        }

        /// <summary>
        /// Login with username and password
        /// The server will automatically bind this device's HWID to the account
        /// </summary>
        public async Task<LoginResponse> LoginAsync(string username, string password)
        {
            var payload = new
            {
                apiKey = _apiKey,
                username,
                password,
                hwid = CurrentHWID
            };

            var response = await SendRequestAsync<LoginResponse>("POST", "/api/user/login", payload);

            if (response.Success)
            {
                _jwtToken = response.Token;
                StartHeartbeat();
            }

            return response;
        }

        /// <summary>
        /// Validate the current license
        /// </summary>
        public async Task<ValidationResponse> ValidateLicenseAsync(string licenseKey)
        {
            var payload = new
            {
                apiKey = _apiKey,
                licenseKey,
                hwid = CurrentHWID
            };

            return await SendRequestAsync<ValidationResponse>("POST", "/api/auth/validate", payload);
        }

        /// <summary>
        /// Check if the current session is still valid
        /// </summary>
        public async Task<SessionResponse> CheckSessionAsync()
        {
            return await SendRequestAsync<SessionResponse>("GET", "/api/user/session");
        }

        /// <summary>
        /// Logout and invalidate the current session
        /// </summary>
        public async Task<AuthResponse> LogoutAsync()
        {
            StopHeartbeat();
            var response = await SendRequestAsync<AuthResponse>("POST", "/api/user/logout");
            _jwtToken = null;
            return response;
        }

        #endregion

        #region Session Management

        private void StartHeartbeat()
        {
            StopHeartbeat();
            _heartbeatTimer = new Timer(async _ =>
            {
                try
                {
                    await CheckSessionAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Heartbeat failed: {ex.Message}");
                }
            }, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
        }

        private void StopHeartbeat()
        {
            _heartbeatTimer?.Dispose();
            _heartbeatTimer = null;
        }

        #endregion

        #region HTTP Communication

        private async Task<T> SendRequestAsync<T>(string method, string endpoint, object payload = null) where T : BaseResponse
        {
            HttpRequestMessage request = null;
            HttpResponseMessage response = null;
            string responseBody = null;
            
            try
            {
                string fullUrl = $"{_apiBaseUrl}{endpoint}";
                Console.WriteLine($"[AuthClient] Making {method} request to: {fullUrl}");
                
                request = new HttpRequestMessage(
                    new HttpMethod(method),
                    fullUrl
                );

                // Add HWID header
                request.Headers.Add("X-HWID", CurrentHWID);

                // Add JWT token if available
                if (!string.IsNullOrEmpty(_jwtToken))
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _jwtToken);
                }

                // Add payload if present
                if (payload != null)
                {
                    string json = JsonConvert.SerializeObject(payload);
                    Console.WriteLine($"[AuthClient] Request payload: {json}");
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");
                }

                response = await _httpClient.SendAsync(request);
                responseBody = await response.Content.ReadAsStringAsync();
                
                Console.WriteLine($"[AuthClient] Response status: {(int)response.StatusCode} {response.StatusCode}");
                Console.WriteLine($"[AuthClient] Response body: {responseBody}");

                if (!response.IsSuccessStatusCode)
                {
                    // Try to parse error response
                    try
                    {
                        var errorResponse = JsonConvert.DeserializeObject<ErrorResponse>(responseBody);
                        throw new AuthException(
                            errorResponse?.Message ?? $"Request failed with status {response.StatusCode}",
                            errorResponse?.ErrorCode ?? $"HTTP_{(int)response.StatusCode}"
                        );
                    }
                    catch (JsonException)
                    {
                        // If JSON parsing fails, use raw response
                        throw new AuthException(
                            $"Request failed: {responseBody}",
                            $"HTTP_{(int)response.StatusCode}"
                        );
                    }
                }

                return JsonConvert.DeserializeObject<T>(responseBody);
            }
            catch (AuthException)
            {
                throw;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"[AuthClient] HTTP Request Exception: {ex.Message}");
                Console.WriteLine($"[AuthClient] Inner Exception: {ex.InnerException?.Message}");
                throw new AuthException(
                    $"Network error: {ex.Message}. Check your internet connection and API URL.", 
                    "NETWORK_ERROR", 
                    ex
                );
            }
            catch (TaskCanceledException ex)
            {
                Console.WriteLine($"[AuthClient] Request Timeout: {ex.Message}");
                throw new AuthException(
                    "Request timed out. Please try again.", 
                    "TIMEOUT_ERROR", 
                    ex
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AuthClient] Unexpected Exception: {ex.GetType().Name}");
                Console.WriteLine($"[AuthClient] Exception Message: {ex.Message}");
                Console.WriteLine($"[AuthClient] Stack Trace: {ex.StackTrace}");
                throw new AuthException(
                    $"Unexpected error: {ex.Message}", 
                    "UNEXPECTED_ERROR", 
                    ex
                );
            }
        }

        #endregion

        public void Dispose()
        {
            StopHeartbeat();
            _httpClient?.Dispose();
        }
    }

    #region Response Models

    public class BaseResponse
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }
    }

    public class AuthResponse : BaseResponse
    {
        [JsonProperty("userId")]
        public string UserId { get; set; }
    }

    public class LoginResponse : BaseResponse
    {
        [JsonProperty("token")]
        public string Token { get; set; }

        [JsonProperty("user")]
        public UserInfo User { get; set; }
    }

    public class UserInfo
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("username")]
        public string Username { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("hwid")]
        public string HWID { get; set; }

        [JsonProperty("hwidLocked")]
        public bool HWIDLocked { get; set; }

        [JsonProperty("ip")]
        public string IP { get; set; }

        [JsonProperty("isFirstLogin")]
        public bool IsFirstLogin { get; set; }

        [JsonProperty("expiresAt")]
        public string ExpiresAt { get; set; }
    }

    public class ValidationResponse : BaseResponse
    {
        [JsonProperty("valid")]
        public bool Valid { get; set; }

        [JsonProperty("expiresAt")]
        public string ExpiresAt { get; set; }
    }

    public class SessionResponse : BaseResponse
    {
        [JsonProperty("valid")]
        public bool Valid { get; set; }

        [JsonProperty("user")]
        public UserInfo User { get; set; }
    }

    public class ErrorResponse
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("errorCode")]
        public string ErrorCode { get; set; }
    }

    #endregion

    #region Custom Exceptions

    public class AuthException : Exception
    {
        public string ErrorCode { get; }

        public AuthException(string message, string errorCode) : base(message)
        {
            ErrorCode = errorCode;
        }

        public AuthException(string message, string errorCode, Exception innerException)
            : base(message, innerException)
        {
            ErrorCode = errorCode;
        }
    }

    #endregion
}

/*
 * EXAMPLE USAGE:
 * 
 * using AuthSystem.SDK;
 * 
 * // Initialize the client
 * var authClient = new AuthClient(
 *     "https://www.licensify.space",
 *     "your-api-key-here"
 * );
 * 
 * try
 * {
 *     // Get the current device HWID
 *     string hwid = authClient.CurrentHWID;
 *     Console.WriteLine($"Device HWID: {hwid}");
 *     
 *     // Register a new user
 *     var registerResult = await authClient.RegisterAsync(
 *         "johndoe",
 *         "SecurePassword123",
 *         "john@example.com",
 *         "LICENSE-KEY-123"
 *     );
 *     
 *     if (registerResult.Success)
 *     {
 *         Console.WriteLine("Registration successful!");
 *     }
 *     
 *     // Login (first time - device will be locked)
 *     var loginResult = await authClient.LoginAsync("johndoe", "SecurePassword123");
 *     
 *     if (loginResult.Success)
 *     {
 *         Console.WriteLine($"Login successful! Welcome {loginResult.User.Username}");
 *         
 *         if (loginResult.User.IsFirstLogin)
 *         {
 *             Console.WriteLine("This device has been locked to your account!");
 *         }
 *         
 *         // Validate license
 *         var validateResult = await authClient.ValidateLicenseAsync("LICENSE-KEY-123");
 *         Console.WriteLine($"License valid: {validateResult.Valid}");
 *         
 *         // Session is automatically maintained with heartbeat
 *         await Task.Delay(TimeSpan.FromMinutes(10));
 *         
 *         // Logout
 *         await authClient.LogoutAsync();
 *     }
 * }
 * catch (AuthException ex)
 * {
 *     Console.WriteLine($"Authentication error [{ex.ErrorCode}]: {ex.Message}");
 *     
 *     // Handle specific errors
 *     switch (ex.ErrorCode)
 *     {
 *         case "HWID_LOCKED":
 *             Console.WriteLine("This account is locked to a different device!");
 *             break;
 *         case "INVALID_CREDENTIALS":
 *             Console.WriteLine("Wrong username or password!");
 *             break;
 *         case "LICENSE_EXPIRED":
 *             Console.WriteLine("Your license has expired!");
 *             break;
 *     }
 * }
 * finally
 * {
 *     authClient.Dispose();
 * }
 */

