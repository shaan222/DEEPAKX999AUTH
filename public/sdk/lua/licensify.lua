--[[
  Licensify Lua SDK
  Lua 5.1+ with LuaSocket and JSON
  Version: 1.0.0
  License: MIT
]]

local http = require("socket.http")
local json = require("json") or require("dkjson") or require("cjson")
local ltn12 = require("ltn12")

-- Try to load crypto library
local hasOpenSSL, openssl = pcall(require, "openssl")
local hasCrypto, crypto = pcall(require, "crypto")

local LicensifyClient = {}
LicensifyClient.__index = LicensifyClient

--- Create a new Licensify client
-- @param api_key string Your API key
-- @param app_name string Your application name
-- @param base_url string Base URL (optional)
-- @return table Client instance
function LicensifyClient.new(api_key, app_name, base_url)
    local self = setmetatable({}, LicensifyClient)
    self.api_key = api_key
    self.app_name = app_name
    self.base_url = base_url or "https://www.licensify.space"
    self.base_url = self.base_url:gsub("/$", "") -- Remove trailing slash
    self.cached_hwid = nil
    return self
end

--- Generate Hardware ID
-- @return string Hardware ID hash
function LicensifyClient:generateHWID()
    if self.cached_hwid then
        return self.cached_hwid
    end

    local hwid_parts = {}
    
    -- Get hostname
    local f = io.popen("hostname")
    if f then
        local hostname = f:read("*a"):gsub("%s+", "")
        f:close()
        table.insert(hwid_parts, hostname)
    end

    -- Get OS info
    local os_info = package.config:sub(1,1) == "\\" and "windows" or "unix"
    table.insert(hwid_parts, os_info)
    
    -- Get Lua version
    table.insert(hwid_parts, _VERSION)

    -- Try to get MAC address (platform-specific)
    local mac_cmd = os_info == "windows" and "getmac" or "ifconfig"
    local mac_f = io.popen(mac_cmd)
    if mac_f then
        local mac_output = mac_f:read("*a")
        mac_f:close()
        if mac_output and #mac_output > 0 then
            table.insert(hwid_parts, mac_output:sub(1, 100)) -- Truncate to avoid huge strings
        end
    end

    local combined = table.concat(hwid_parts, "-")
    
    -- Hash the combined string
    if hasOpenSSL then
        self.cached_hwid = openssl.digest.digest("sha256", combined, false)
    elseif hasCrypto then
        self.cached_hwid = crypto.digest("sha256", combined)
    else
        -- Fallback: simple hash
        local hash = 0
        for i = 1, #combined do
            hash = ((hash * 31) + string.byte(combined, i)) % 2^32
        end
        self.cached_hwid = string.format("%08x", hash)
    end
    
    return self.cached_hwid
end

--- Send HTTP request to API
-- @param endpoint string API endpoint
-- @param payload table Request payload
-- @return table Response data
function LicensifyClient:sendRequest(endpoint, payload)
    local response_body = {}
    
    -- Encode payload as JSON
    local request_body = json.encode(payload)
    if not request_body then
        return { success = false, message = "Failed to encode payload as JSON" }
    end

    local url = self.base_url .. endpoint
    
    -- Make HTTP request
    local res, code, headers = http.request{
        url = url,
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = tostring(#request_body),
            ["User-Agent"] = "Licensify-Lua-SDK/1.0"
        },
        source = ltn12.source.string(request_body),
        sink = ltn12.sink.table(response_body)
    }

    if not res then
        return { success = false, message = "Request failed: " .. tostring(code) }
    end

    -- Decode response
    local response_str = table.concat(response_body)
    local response_data = json.decode(response_str)
    
    if not response_data then
        return { success = false, message = "Failed to decode response" }
    end

    return response_data
end

--- Login user
-- @param username string Username
-- @param password string Password
-- @param hwid string Hardware ID (optional, auto-generated if nil)
-- @return table Login response
function LicensifyClient:login(username, password, hwid)
    hwid = hwid or self:generateHWID()

    local payload = {
        apiKey = self.api_key,
        username = username,
        password = password,
        hwid = hwid
    }

    return self:sendRequest("/api/user/login", payload)
end

--- Validate license key
-- @param license_key string License key
-- @param hwid string Hardware ID (optional, auto-generated if nil)
-- @return table Validation response
function LicensifyClient:validateLicense(license_key, hwid)
    hwid = hwid or self:generateHWID()

    local payload = {
        apiKey = self.api_key,
        licenseKey = license_key,
        hwid = hwid
    }

    return self:sendRequest("/api/auth/validate", payload)
end

--- Register new user
-- @param username string Username
-- @param password string Password
-- @param email string Email
-- @param license_key string License key (optional)
-- @param hwid string Hardware ID (optional, auto-generated if nil)
-- @return table Registration response
function LicensifyClient:register(username, password, email, license_key, hwid)
    hwid = hwid or self:generateHWID()

    local payload = {
        apiKey = self.api_key,
        username = username,
        password = password,
        email = email,
        hwid = hwid
    }

    if license_key then
        payload.licenseKey = license_key
    end

    return self:sendRequest("/api/user/create", payload)
end

--- Delete user
-- @param user_id string User ID
-- @return table Delete response
function LicensifyClient:deleteUser(user_id)
    local payload = {
        apiKey = self.api_key,
        userId = user_id
    }

    return self:sendRequest("/api/user/delete", payload)
end

--- Reset user's HWID
-- @param user_id string User ID
-- @return table Reset response
function LicensifyClient:resetHWID(user_id)
    local payload = {
        apiKey = self.api_key,
        userId = user_id
    }

    return self:sendRequest("/api/user/reset-hwid", payload)
end

return LicensifyClient

--[[
===== USAGE EXAMPLE =====

local Licensify = require("licensify")

-- Initialize client
local client = Licensify.new("YOUR_API_KEY", "YOUR_APP_NAME")

-- Get HWID
local hwid = client:generateHWID()
print("Device HWID: " .. hwid)

-- Login
local login_result = client:login("john_doe", "password123")
if login_result.success then
    print("✅ Logged in: " .. login_result.user.username)
    print("Email: " .. login_result.user.email)
    print("HWID Locked: " .. tostring(login_result.user.hwidLocked))
else
    print("❌ Login failed: " .. login_result.message)
end

-- Validate license
local validate_result = client:validateLicense("LICENSE-KEY-HERE")
if validate_result.valid then
    print("✅ License valid!")
    print("Expires: " .. validate_result.license.expiresAt)
    print("Devices: " .. validate_result.license.boundDevices .. " / " .. validate_result.license.maxDevices)
else
    print("❌ License invalid: " .. validate_result.message)
end

-- Register new user
local register_result = client:register("new_user", "password123", "user@example.com", "LICENSE-KEY")
if register_result.success then
    print("✅ User registered successfully!")
else
    print("❌ Registration failed: " .. register_result.message)
end

]]

