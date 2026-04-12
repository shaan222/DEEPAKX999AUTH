package com.authsystem.sdk;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.SerializedName;
import okhttp3.*;
import oshi.SystemInfo;
import oshi.hardware.ComputerSystem;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.hardware.NetworkIF;
import oshi.hardware.platform.mac.MacComputerSystem;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Professional-grade Java Authentication SDK with HWID-based Device Binding
 * Cross-platform support using OSHI library
 */
public class AuthClient {
    
    private static final Logger LOGGER = Logger.getLogger(AuthClient.class.getName());
    private static final long HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    private final String apiBaseUrl;
    private final String apiKey;
    private final OkHttpClient httpClient;
    private final Gson gson;
    private final HWIDGenerator hwidGenerator;
    
    private String jwtToken;
    private ScheduledExecutorService heartbeatExecutor;
    private String cachedHwid;
    
    /**
     * Private constructor - use Builder pattern
     */
    private AuthClient(Builder builder) {
        this.apiBaseUrl = builder.apiBaseUrl.replaceAll("/$", "");
        this.apiKey = builder.apiKey;
        this.httpClient = builder.httpClient != null ? builder.httpClient : createDefaultHttpClient();
        this.gson = new GsonBuilder().create();
        this.hwidGenerator = new HWIDGenerator();
    }
    
    /**
     * Get the current device HWID (cached)
     */
    public String getHWID() {
        if (cachedHwid == null) {
            cachedHwid = hwidGenerator.generate();
        }
        return cachedHwid;
    }
    
    /**
     * Register a new user account
     */
    public CompletableFuture<AuthResponse> register(
            String username,
            String password,
            String email,
            String licenseKey
    ) {
        RegisterRequest request = new RegisterRequest();
        request.apiKey = this.apiKey;
        request.username = username;
        request.password = password;
        request.email = email;
        request.licenseKey = licenseKey;
        request.hwid = getHWID();
        
        return sendRequest("POST", "/api/user/create", request, AuthResponse.class);
    }
    
    /**
     * Login with username and password
     * The server will automatically bind this device's HWID to the account
     */
    public CompletableFuture<LoginResponse> login(String username, String password) {
        LoginRequest request = new LoginRequest();
        request.apiKey = this.apiKey;
        request.username = username;
        request.password = password;
        request.hwid = getHWID();
        
        return sendRequest("POST", "/api/user/login", request, LoginResponse.class)
                .thenApply(response -> {
                    if (response.success && response.token != null) {
                        this.jwtToken = response.token;
                        startHeartbeat();
                    }
                    return response;
                });
    }
    
    /**
     * Validate a license key
     */
    public CompletableFuture<ValidationResponse> validateLicense(String licenseKey) {
        ValidateRequest request = new ValidateRequest();
        request.apiKey = this.apiKey;
        request.licenseKey = licenseKey;
        request.hwid = getHWID();
        
        return sendRequest("POST", "/api/auth/validate", request, ValidationResponse.class);
    }
    
    /**
     * Check if the current session is still valid
     */
    public CompletableFuture<SessionResponse> checkSession() {
        return sendRequest("GET", "/api/user/session", null, SessionResponse.class);
    }
    
    /**
     * Logout and invalidate the current session
     */
    public CompletableFuture<AuthResponse> logout() {
        stopHeartbeat();
        return sendRequest("POST", "/api/user/logout", null, AuthResponse.class)
                .thenApply(response -> {
                    this.jwtToken = null;
                    return response;
                });
    }
    
    /**
     * Start the session heartbeat
     */
    private void startHeartbeat() {
        stopHeartbeat();
        heartbeatExecutor = Executors.newSingleThreadScheduledExecutor();
        heartbeatExecutor.scheduleAtFixedRate(
                this::runHeartbeat,
                HEARTBEAT_INTERVAL,
                HEARTBEAT_INTERVAL,
                TimeUnit.MILLISECONDS
        );
    }
    
    /**
     * Stop the session heartbeat
     */
    private void stopHeartbeat() {
        if (heartbeatExecutor != null) {
            heartbeatExecutor.shutdown();
            heartbeatExecutor = null;
        }
    }
    
    /**
     * Run a single heartbeat check
     */
    private void runHeartbeat() {
        checkSession()
                .thenAccept(response -> LOGGER.fine("Heartbeat successful"))
                .exceptionally(throwable -> {
                    LOGGER.warning("Heartbeat failed: " + throwable.getMessage());
                    return null;
                });
    }
    
    /**
     * Send HTTP request to the API
     */
    private <T> CompletableFuture<T> sendRequest(
            String method,
            String endpoint,
            Object payload,
            Class<T> responseClass
    ) {
        CompletableFuture<T> future = new CompletableFuture<>();
        
        try {
            String url = apiBaseUrl + endpoint;
            Request.Builder requestBuilder = new Request.Builder().url(url);
            
            // Add HWID header
            requestBuilder.addHeader("X-HWID", getHWID());
            
            // Add JWT token if available
            if (jwtToken != null && !jwtToken.isEmpty()) {
                requestBuilder.addHeader("Authorization", "Bearer " + jwtToken);
            }
            
            // Add payload if present
            if (payload != null) {
                String json = gson.toJson(payload);
                RequestBody body = RequestBody.create(
                        json,
                        MediaType.get("application/json; charset=utf-8")
                );
                requestBuilder.method(method, body);
            } else {
                requestBuilder.method(method, null);
            }
            
            Request request = requestBuilder.build();
            
            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    future.completeExceptionally(
                            new AuthException("Network request failed", "NETWORK_ERROR", e)
                    );
                }
                
                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    try {
                        String responseBody = response.body().string();
                        
                        if (!response.isSuccessful()) {
                            ErrorResponse error = gson.fromJson(responseBody, ErrorResponse.class);
                            future.completeExceptionally(
                                    new AuthException(
                                            error.message != null ? error.message : "Request failed",
                                            error.errorCode != null ? error.errorCode : "REQUEST_FAILED"
                                    )
                            );
                        } else {
                            T result = gson.fromJson(responseBody, responseClass);
                            future.complete(result);
                        }
                    } catch (Exception e) {
                        future.completeExceptionally(
                                new AuthException("Failed to parse response", "PARSE_ERROR", e)
                        );
                    } finally {
                        response.close();
                    }
                }
            });
            
        } catch (Exception e) {
            future.completeExceptionally(
                    new AuthException("Failed to create request", "REQUEST_ERROR", e)
            );
        }
        
        return future;
    }
    
    /**
     * Create default HTTP client with proper configuration
     */
    private OkHttpClient createDefaultHttpClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(new LoggingInterceptor())
                .build();
    }
    
    /**
     * Cleanup resources
     */
    public void close() {
        stopHeartbeat();
        if (httpClient != null) {
            httpClient.dispatcher().executorService().shutdown();
            httpClient.connectionPool().evictAll();
        }
    }
    
    // ==================== Builder Pattern ====================
    
    public static class Builder {
        private String apiBaseUrl;
        private String apiKey;
        private OkHttpClient httpClient;
        
        public Builder apiBaseUrl(String apiBaseUrl) {
            this.apiBaseUrl = apiBaseUrl;
            return this;
        }
        
        public Builder apiKey(String apiKey) {
            this.apiKey = apiKey;
            return this;
        }
        
        public Builder httpClient(OkHttpClient httpClient) {
            this.httpClient = httpClient;
            return this;
        }
        
        public AuthClient build() {
            if (apiBaseUrl == null || apiBaseUrl.isEmpty()) {
                throw new IllegalArgumentException("API base URL is required");
            }
            if (apiKey == null || apiKey.isEmpty()) {
                throw new IllegalArgumentException("API key is required");
            }
            return new AuthClient(this);
        }
    }
    
    // ==================== HWID Generator ====================
    
    /**
     * Cross-platform Hardware ID generator using OSHI
     */
    private static class HWIDGenerator {
        
        private final SystemInfo systemInfo;
        
        public HWIDGenerator() {
            this.systemInfo = new SystemInfo();
        }
        
        /**
         * Generate unique HWID using multiple hardware identifiers
         */
        public String generate() {
            try {
                HardwareAbstractionLayer hardware = systemInfo.getHardware();
                StringBuilder hwidBuilder = new StringBuilder();
                
                // Primary: System UUID and Serial
                try {
                    ComputerSystem computerSystem = hardware.getComputerSystem();
                    String uuid = computerSystem.getHardwareUUID();
                    String serial = computerSystem.getSerialNumber();
                    
                    if (uuid != null && !uuid.isEmpty()) {
                        hwidBuilder.append(uuid).append("-");
                    }
                    if (serial != null && !serial.isEmpty()) {
                        hwidBuilder.append(serial).append("-");
                    }
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Failed to get system UUID", e);
                }
                
                // Secondary: Processor ID
                try {
                    String processorId = hardware.getProcessor().getProcessorIdentifier().getProcessorID();
                    if (processorId != null && !processorId.isEmpty()) {
                        hwidBuilder.append(processorId).append("-");
                    }
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Failed to get processor ID", e);
                }
                
                // Tertiary: MAC Address
                try {
                    List<NetworkIF> networkIFs = hardware.getNetworkIFs();
                    for (NetworkIF net : networkIFs) {
                        if (net.getMacaddr() != null && !net.getMacaddr().isEmpty() &&
                                !net.getMacaddr().equals("00:00:00:00:00:00")) {
                            hwidBuilder.append(net.getMacaddr());
                            break;
                        }
                    }
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Failed to get MAC address", e);
                }
                
                // Fallback
                if (hwidBuilder.length() == 0) {
                    String fallback = System.getProperty("user.name") + "-" +
                            System.getProperty("os.name") + "-" +
                            System.getProperty("os.arch");
                    hwidBuilder.append(fallback);
                }
                
                return hashString(hwidBuilder.toString());
                
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "HWID generation failed", e);
                // Ultimate fallback
                return hashString(System.getProperty("user.name") + "-" + System.currentTimeMillis());
            }
        }
        
        /**
         * Hash a string using SHA-256
         */
        private String hashString(String input) {
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
                
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                return hexString.toString();
                
            } catch (NoSuchAlgorithmException e) {
                // Fallback to Base64 if SHA-256 not available
                return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
            }
        }
    }
    
    // ==================== Request Models ====================
    
    private static class RegisterRequest {
        String apiKey;
        String username;
        String password;
        String email;
        String licenseKey;
        String hwid;
    }
    
    private static class LoginRequest {
        String apiKey;
        String username;
        String password;
        String hwid;
    }
    
    private static class ValidateRequest {
        String apiKey;
        String licenseKey;
        String hwid;
    }
    
    // ==================== Response Models ====================
    
    public static class AuthResponse {
        @SerializedName("success")
        public boolean success;
        
        @SerializedName("message")
        public String message;
        
        @SerializedName("userId")
        public String userId;
    }
    
    public static class LoginResponse {
        @SerializedName("success")
        public boolean success;
        
        @SerializedName("message")
        public String message;
        
        @SerializedName("token")
        public String token;
        
        @SerializedName("user")
        public UserInfo user;
    }
    
    public static class UserInfo {
        @SerializedName("id")
        public String id;
        
        @SerializedName("username")
        public String username;
        
        @SerializedName("email")
        public String email;
        
        @SerializedName("hwid")
        public String hwid;
        
        @SerializedName("hwidLocked")
        public boolean hwidLocked;
        
        @SerializedName("ip")
        public String ip;
        
        @SerializedName("isFirstLogin")
        public boolean isFirstLogin;
        
        @SerializedName("expiresAt")
        public String expiresAt;
    }
    
    public static class ValidationResponse {
        @SerializedName("success")
        public boolean success;
        
        @SerializedName("message")
        public String message;
        
        @SerializedName("valid")
        public boolean valid;
        
        @SerializedName("expiresAt")
        public String expiresAt;
    }
    
    public static class SessionResponse {
        @SerializedName("success")
        public boolean success;
        
        @SerializedName("message")
        public String message;
        
        @SerializedName("valid")
        public boolean valid;
        
        @SerializedName("user")
        public UserInfo user;
    }
    
    private static class ErrorResponse {
        @SerializedName("success")
        public boolean success;
        
        @SerializedName("message")
        public String message;
        
        @SerializedName("errorCode")
        public String errorCode;
    }
    
    // ==================== Custom Exception ====================
    
    public static class AuthException extends Exception {
        private final String errorCode;
        
        public AuthException(String message, String errorCode) {
            super(message);
            this.errorCode = errorCode;
        }
        
        public AuthException(String message, String errorCode, Throwable cause) {
            super(message, cause);
            this.errorCode = errorCode;
        }
        
        public String getErrorCode() {
            return errorCode;
        }
    }
    
    // ==================== Logging Interceptor ====================
    
    private static class LoggingInterceptor implements Interceptor {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            
            LOGGER.fine("Request: " + request.method() + " " + request.url());
            
            long startTime = System.nanoTime();
            Response response = chain.proceed(request);
            long endTime = System.nanoTime();
            
            LOGGER.fine("Response: " + response.code() + " in " +
                    (endTime - startTime) / 1_000_000 + "ms");
            
            return response;
        }
    }
}

/*
 * EXAMPLE USAGE:
 * 
 * import com.authsystem.sdk.AuthClient;
 * 
 * public class Example {
 *     public static void main(String[] args) {
 *         // Initialize the client using builder pattern
 *         AuthClient client = new AuthClient.Builder()
 *                 .apiBaseUrl("https://www.licensify.space")
 *                 .apiKey("your-api-key-here")
 *                 .build();
 *         
 *         try {
 *             // Get the current device HWID
 *             String hwid = client.getHWID();
 *             System.out.println("Device HWID: " + hwid);
 *             
 *             // Register a new user
 *             client.register("johndoe", "SecurePassword123", "john@example.com", "LICENSE-KEY-123")
 *                     .thenAccept(response -> {
 *                         if (response.success) {
 *                             System.out.println("Registration successful!");
 *                         }
 *                     })
 *                     .exceptionally(throwable -> {
 *                         System.err.println("Registration failed: " + throwable.getMessage());
 *                         return null;
 *                     })
 *                     .get(); // Wait for completion
 *             
 *             // Login (first time - device will be locked)
 *             client.login("johndoe", "SecurePassword123")
 *                     .thenAccept(response -> {
 *                         if (response.success) {
 *                             System.out.println("Login successful! Welcome " + response.user.username);
 *                             
 *                             if (response.user.isFirstLogin) {
 *                                 System.out.println("This device has been locked to your account!");
 *                             }
 *                             
 *                             System.out.println("HWID Locked: " + response.user.hwidLocked);
 *                             System.out.println("Current IP: " + response.user.ip);
 *                         }
 *                     })
 *                     .exceptionally(throwable -> {
 *                         if (throwable.getCause() instanceof AuthClient.AuthException) {
 *                             AuthClient.AuthException authEx = (AuthClient.AuthException) throwable.getCause();
 *                             System.err.println("Auth error [" + authEx.getErrorCode() + "]: " + authEx.getMessage());
 *                             
 *                             // Handle specific errors
 *                             switch (authEx.getErrorCode()) {
 *                                 case "HWID_LOCKED":
 *                                     System.err.println("This account is locked to a different device!");
 *                                     break;
 *                                 case "INVALID_CREDENTIALS":
 *                                     System.err.println("Wrong username or password!");
 *                                     break;
 *                                 case "LICENSE_EXPIRED":
 *                                     System.err.println("Your license has expired!");
 *                                     break;
 *                             }
 *                         }
 *                         return null;
 *                     })
 *                     .get(); // Wait for completion
 *             
 *             // Validate license
 *             client.validateLicense("LICENSE-KEY-123")
 *                     .thenAccept(response -> {
 *                         System.out.println("License valid: " + response.valid);
 *                     })
 *                     .get();
 *             
 *             // Session is automatically maintained with heartbeat
 *             Thread.sleep(10000);
 *             
 *             // Check session
 *             client.checkSession()
 *                     .thenAccept(response -> {
 *                         System.out.println("Session valid: " + response.valid);
 *                     })
 *                     .get();
 *             
 *             // Logout
 *             client.logout()
 *                     .thenAccept(response -> {
 *                         System.out.println("Logout successful");
 *                     })
 *                     .get();
 *             
 *         } catch (Exception e) {
 *             e.printStackTrace();
 *         } finally {
 *             // Cleanup
 *             client.close();
 *         }
 *     }
 * }
 */

