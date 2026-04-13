// DEEPAKX999AUTH C# SDK
// .NET Framework 4.5+ and .NET Core 2.0+

using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Management;
using Newtonsoft.Json;

namespace DEEPAKX999AUTH.SDK
{
    public class DEEPAKX999AUTHClient : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _appName;
        private readonly string _baseURL;
        private string _cachedHwid;

        public DEEPAKX999AUTHClient(string apiKey, string appName, string baseURL = "https://deepakx-999-auth.vercel.app/")
        {
            _apiKey = apiKey;
            _appName = appName;
            _baseURL = baseURL.TrimEnd('/');
            _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "DEEPAKX999AUTH-CSharp-SDK/1.0");
        }

        // Generate Hardware ID
        public string GenerateHWID()
        {
            if (!string.IsNullOrEmpty(_cachedHwid))
                return _cachedHwid;

            try
            {
                // Try to get Processor ID
                string processorId = GetWMIValue("Win32_Processor", "ProcessorId");
                string motherboardSerial = GetWMIValue("Win32_BaseBoard", "SerialNumber");
                
                if (!string.IsNullOrEmpty(processorId) && !string.IsNullOrEmpty(motherboardSerial))
                {
                    _cachedHwid = HashString($"{processorId}-{motherboardSerial}");
                    return _cachedHwid;
                }
                
                // Fallback to machine name
                _cachedHwid = HashString(Environment.MachineName + Environment.UserName);
                return _cachedHwid;
            }
            catch
            {
                _cachedHwid = HashString(Guid.NewGuid().ToString());
                return _cachedHwid;
            }
        }

        private string GetWMIValue(string wmiClass, string wmiProperty)
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher($"SELECT {wmiProperty} FROM {wmiClass}"))
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

        private string HashString(string input)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
                return BitConverter.ToString(bytes).Replace("-", "").ToLower();
            }
        }

        // Login
        public async Task<LoginResponse> LoginAsync(string username, string password, string hwid = null)
        {
            if (string.IsNullOrEmpty(hwid))
                hwid = GenerateHWID();

            var payload = new
            {
                apiKey = _apiKey,
                appName = _appName,
                version = "1.0.0",
                username,
                password,
                hwid
            };

            return await SendRequestAsync<LoginResponse>("POST", "/api/user/login", payload);
        }

        // Validate License
        public async Task<ValidateResponse> ValidateLicenseAsync(string licenseKey, string hwid = null)
        {
            if (string.IsNullOrEmpty(hwid))
                hwid = GenerateHWID();

            var payload = new
            {
                apiKey = _apiKey,
                licenseKey,
                hwid
            };

            return await SendRequestAsync<ValidateResponse>("POST", "/api/auth/validate", payload);
        }

        // Register
        public async Task<RegisterResponse> RegisterAsync(string username, string password, string email, string licenseKey = null, string hwid = null)
        {
            if (string.IsNullOrEmpty(hwid))
                hwid = GenerateHWID();

            var payload = new
            {
                apiKey = _apiKey,
                username,
                password,
                email,
                licenseKey,
                hwid
            };

            return await SendRequestAsync<RegisterResponse>("POST", "/api/user/create", payload);
        }

        private async Task<T> SendRequestAsync<T>(string method, string endpoint, object payload)
        {
            try
            {
                var request = new HttpRequestMessage(new HttpMethod(method), $"{_baseURL}{endpoint}");
                
                if (payload != null)
                {
                    string json = JsonConvert.SerializeObject(payload);
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");
                }

                var response = await _httpClient.SendAsync(request);
                string responseBody = await response.Content.ReadAsStringAsync();
                
                return JsonConvert.DeserializeObject<T>(responseBody);
            }
            catch (Exception ex)
            {
                throw new Exception($"Request failed: {ex.Message}", ex);
            }
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }

    // Response Models
    public class LoginResponse
    {
        [JsonProperty("success")] public bool Success { get; set; }
        [JsonProperty("message")] public string Message { get; set; }
        [JsonProperty("user")] public UserInfo User { get; set; }
    }

    public class UserInfo
    {
        [JsonProperty("id")] public string Id { get; set; }
        [JsonProperty("username")] public string Username { get; set; }
        [JsonProperty("email")] public string Email { get; set; }
        [JsonProperty("hwid")] public string HWID { get; set; }
        [JsonProperty("hwidLocked")] public bool HWIDLocked { get; set; }
    }

    public class ValidateResponse
    {
        [JsonProperty("valid")] public bool Valid { get; set; }
        [JsonProperty("message")] public string Message { get; set; }
        [JsonProperty("license")] public LicenseInfo License { get; set; }
    }

    public class LicenseInfo
    {
        [JsonProperty("key")] public string Key { get; set; }
        [JsonProperty("appName")] public string AppName { get; set; }
        [JsonProperty("expiresAt")] public string ExpiresAt { get; set; }
    }

    public class RegisterResponse
    {
        [JsonProperty("success")] public bool Success { get; set; }
        [JsonProperty("message")] public string Message { get; set; }
    }
}

// ===== USAGE EXAMPLE =====
// var client = new DEEPAKX999AUTHClient("YOUR_API_KEY", "YOUR_APP_NAME");
// var loginResult = await client.LoginAsync("john_doe", "password123");
// if (loginResult.Success) { Console.WriteLine("✅ Logged in!"); }
