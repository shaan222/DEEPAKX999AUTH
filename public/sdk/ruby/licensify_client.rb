# Licensify Ruby SDK
# Ruby 2.7+ with HTTParty
# Version: 1.0.0
# License: MIT

require 'httparty'
require 'digest'
require 'socket'

module Licensify
  class Client
    include HTTParty

    attr_reader :api_key, :app_name, :base_url

    # Initialize Licensify Client
    # @param api_key [String] Your API key
    # @param app_name [String] Your application name
    # @param base_url [String] Base URL (default: https://www.licensify.space/)
    def initialize(api_key, app_name, base_url = 'https://www.licensify.space/')
      @api_key = api_key
      @app_name = app_name
      @base_url = base_url.chomp('/')
      @cached_hwid = nil
      
      self.class.base_uri @base_url
      self.class.headers 'User-Agent' => 'Licensify-Ruby-SDK/1.0'
      self.class.headers 'Content-Type' => 'application/json'
    end

    # Generate hardware ID for the current machine
    # @return [String] Hardware ID hash
    def generate_hwid
      return @cached_hwid if @cached_hwid

      hostname = Socket.gethostname
      os_info = "#{RbConfig::CONFIG['host_os']}-#{RbConfig::CONFIG['host_cpu']}"
      ruby_version = RUBY_VERSION
      platform = RUBY_PLATFORM
      
      # Try to get MAC address
      mac_address = ''
      begin
        if RbConfig::CONFIG['host_os'] =~ /mswin|mingw|cygwin/
          mac_output = `getmac`
          mac_address = mac_output if $?.success?
        else
          mac_output = `ifconfig 2>/dev/null || ip link show`
          mac_address = mac_output if $?.success?
        end
      rescue
        # Ignore errors
      end

      combined = "#{hostname}-#{os_info}-#{ruby_version}-#{platform}-#{mac_address}"
      @cached_hwid = Digest::SHA256.hexdigest(combined)
    end

    # Login user with username and password
    # @param username [String] Username
    # @param password [String] Password
    # @param hwid [String, nil] Hardware ID (auto-generated if nil)
    # @return [Hash] Login response
    def login(username, password, hwid = nil)
      hwid ||= generate_hwid

      payload = {
        apiKey: @api_key,
        username: username,
        password: password,
        hwid: hwid
      }

      send_request('/api/user/login', payload)
    end

    # Validate license key
    # @param license_key [String] License key
    # @param hwid [String, nil] Hardware ID (auto-generated if nil)
    # @return [Hash] Validation response
    def validate_license(license_key, hwid = nil)
      hwid ||= generate_hwid

      payload = {
        apiKey: @api_key,
        licenseKey: license_key,
        hwid: hwid
      }

      send_request('/api/auth/validate', payload)
    end

    # Register new user
    # @param username [String] Username
    # @param password [String] Password
    # @param email [String] Email
    # @param license_key [String, nil] License key (optional)
    # @param hwid [String, nil] Hardware ID (auto-generated if nil)
    # @return [Hash] Registration response
    def register(username, password, email, license_key = nil, hwid = nil)
      hwid ||= generate_hwid

      payload = {
        apiKey: @api_key,
        username: username,
        password: password,
        email: email,
        hwid: hwid
      }

      payload[:licenseKey] = license_key if license_key

      send_request('/api/user/create', payload)
    end

    # Delete user account
    # @param user_id [String] User ID
    # @return [Hash] Delete response
    def delete_user(user_id)
      payload = {
        apiKey: @api_key,
        userId: user_id
      }

      send_request('/api/user/delete', payload)
    end

    # Reset user's HWID
    # @param user_id [String] User ID
    # @return [Hash] Reset response
    def reset_hwid(user_id)
      payload = {
        apiKey: @api_key,
        userId: user_id
      }

      send_request('/api/user/reset-hwid', payload)
    end

    private

    # Send HTTP request to API
    # @param endpoint [String] API endpoint
    # @param payload [Hash] Request payload
    # @return [Hash] Response data
    def send_request(endpoint, payload)
      response = self.class.post(endpoint, body: payload.to_json)
      JSON.parse(response.body)
    rescue => e
      { 'success' => false, 'message' => "Request failed: #{e.message}" }
    end
  end
end

# ===== USAGE EXAMPLE =====

=begin

require 'licensify'

# Initialize client
client = Licensify::Client.new('YOUR_API_KEY', 'YOUR_APP_NAME')

# Get HWID
hwid = client.generate_hwid
puts "Device HWID: #{hwid}"

# Login
login_result = client.login('john_doe', 'password123')
if login_result['success']
  puts "✅ Logged in: #{login_result['user']['username']}"
  puts "Email: #{login_result['user']['email']}"
  puts "HWID Locked: #{login_result['user']['hwidLocked']}"
else
  puts "❌ Login failed: #{login_result['message']}"
end

# Validate license
validate_result = client.validate_license('LICENSE-KEY-HERE')
if validate_result['valid']
  puts "✅ License valid!"
  puts "Expires: #{validate_result['license']['expiresAt']}"
  puts "Devices: #{validate_result['license']['boundDevices']} / #{validate_result['license']['maxDevices']}"
else
  puts "❌ License invalid: #{validate_result['message']}"
end

# Register new user
register_result = client.register('new_user', 'password123', 'user@example.com', 'LICENSE-KEY')
if register_result['success']
  puts "✅ User registered successfully!"
else
  puts "❌ Registration failed: #{register_result['message']}"
end

=end

