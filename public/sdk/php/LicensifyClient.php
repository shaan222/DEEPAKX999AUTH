<?php
/**
 * Licensify PHP SDK
 * PHP 7.4+ with Guzzle HTTP client
 * @version 1.0.0
 * @license MIT
 */

namespace Licensify\SDK;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class LicensifyClient {
    private string $apiKey;
    private string $appName;
    private string $baseURL;
    private Client $httpClient;
    private ?string $cachedHwid = null;

    /**
     * Initialize Licensify Client
     * @param string $apiKey Your API key
     * @param string $appName Your application name
     * @param string $baseURL Base URL (default: https://www.licensify.space/)
     */
    public function __construct(string $apiKey, string $appName, string $baseURL = 'https://www.licensify.space/') {
        $this->apiKey = $apiKey;
        $this->appName = $appName;
        $this->baseURL = rtrim($baseURL, '/');
        $this->httpClient = new Client([
            'timeout' => 30,
            'headers' => [
                'User-Agent' => 'Licensify-PHP-SDK/1.0',
                'Content-Type' => 'application/json'
            ]
        ]);
    }

    /**
     * Generate Hardware ID
     * @return string Hardware ID hash
     */
    public function generateHWID(): string {
        if ($this->cachedHwid !== null) {
            return $this->cachedHwid;
        }

        $hwInfo = [
            php_uname('n'), // hostname
            php_uname('m'), // machine type
            php_uname('r'), // release
            php_uname('v'), // version
            gethostname(),
            php_uname('s')  // OS name
        ];

        // Try to get MAC address
        if (function_exists('exec')) {
            $mac = '';
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                @exec('getmac', $output);
                if (isset($output[0])) {
                    $mac = $output[0];
                }
            } else {
                @exec('ifconfig', $output);
                $mac = implode('', $output);
            }
            if ($mac) {
                $hwInfo[] = $mac;
            }
        }

        $combined = implode('-', $hwInfo);
        $this->cachedHwid = hash('sha256', $combined);
        return $this->cachedHwid;
    }

    /**
     * Login user
     * @param string $username Username
     * @param string $password Password
     * @param string|null $hwid Hardware ID (auto-generated if null)
     * @return array Login response
     */
    public function login(string $username, string $password, ?string $hwid = null): array {
        if ($hwid === null) {
            $hwid = $this->generateHWID();
        }

        $payload = [
            'apiKey' => $this->apiKey,
            'username' => $username,
            'password' => $password,
            'hwid' => $hwid
        ];

        return $this->sendRequest('POST', '/api/user/login', $payload);
    }

    /**
     * Validate License
     * @param string $licenseKey License key
     * @param string|null $hwid Hardware ID (auto-generated if null)
     * @return array Validation response
     */
    public function validateLicense(string $licenseKey, ?string $hwid = null): array {
        if ($hwid === null) {
            $hwid = $this->generateHWID();
        }

        $payload = [
            'apiKey' => $this->apiKey,
            'licenseKey' => $licenseKey,
            'hwid' => $hwid
        ];

        return $this->sendRequest('POST', '/api/auth/validate', $payload);
    }

    /**
     * Register new user
     * @param string $username Username
     * @param string $password Password
     * @param string $email Email
     * @param string|null $licenseKey License key (optional)
     * @param string|null $hwid Hardware ID (auto-generated if null)
     * @return array Registration response
     */
    public function register(string $username, string $password, string $email, ?string $licenseKey = null, ?string $hwid = null): array {
        if ($hwid === null) {
            $hwid = $this->generateHWID();
        }

        $payload = [
            'apiKey' => $this->apiKey,
            'username' => $username,
            'password' => $password,
            'email' => $email,
            'hwid' => $hwid
        ];

        if ($licenseKey !== null) {
            $payload['licenseKey'] = $licenseKey;
        }

        return $this->sendRequest('POST', '/api/user/create', $payload);
    }

    /**
     * Delete user
     * @param string $userId User ID
     * @return array Delete response
     */
    public function deleteUser(string $userId): array {
        $payload = [
            'apiKey' => $this->apiKey,
            'userId' => $userId
        ];

        return $this->sendRequest('POST', '/api/user/delete', $payload);
    }

    /**
     * Reset user's HWID
     * @param string $userId User ID
     * @return array Reset response
     */
    public function resetHWID(string $userId): array {
        $payload = [
            'apiKey' => $this->apiKey,
            'userId' => $userId
        ];

        return $this->sendRequest('POST', '/api/user/reset-hwid', $payload);
    }

    /**
     * Send HTTP request
     * @param string $method HTTP method
     * @param string $endpoint API endpoint
     * @param array $payload Request payload
     * @return array Response data
     */
    private function sendRequest(string $method, string $endpoint, array $payload): array {
        try {
            $response = $this->httpClient->request($method, $this->baseURL . $endpoint, [
                'json' => $payload
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            return [
                'success' => false,
                'message' => 'Request failed: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }
}

// ===== USAGE EXAMPLE =====
/*
require 'vendor/autoload.php';
use Licensify\SDK\LicensifyClient;

$client = new LicensifyClient('YOUR_API_KEY', 'YOUR_APP_NAME');

// Get HWID
$hwid = $client->generateHWID();
echo "Device HWID: $hwid\n";

// Login
$loginResult = $client->login('john_doe', 'password123');
if ($loginResult['success']) {
    echo "✅ Logged in: " . $loginResult['user']['username'] . "\n";
    echo "Email: " . $loginResult['user']['email'] . "\n";
    echo "HWID Locked: " . ($loginResult['user']['hwidLocked'] ? 'Yes' : 'No') . "\n";
} else {
    echo "❌ Login failed: " . $loginResult['message'] . "\n";
}

// Validate license
$validateResult = $client->validateLicense('LICENSE-KEY-HERE');
if ($validateResult['valid']) {
    echo "✅ License valid!\n";
    echo "Expires: " . $validateResult['license']['expiresAt'] . "\n";
    echo "Devices: " . $validateResult['license']['boundDevices'] . " / " . $validateResult['license']['maxDevices'] . "\n";
} else {
    echo "❌ License invalid: " . $validateResult['message'] . "\n";
}

// Register new user
$registerResult = $client->register('new_user', 'password123', 'user@example.com', 'LICENSE-KEY');
if ($registerResult['success']) {
    echo "✅ User registered successfully!\n";
} else {
    echo "❌ Registration failed: " . $registerResult['message'] . "\n";
}
*/

