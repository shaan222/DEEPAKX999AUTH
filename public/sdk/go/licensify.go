// DEEPAKX999AUTH Go SDK
// Go 1.18+ module
// Version: 1.0.0
// License: MIT

package deepakx999auth

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"
)

// Client represents the DEEPAKX999AUTH API client
type Client struct {
	APIKey     string
	AppName    string
	BaseURL    string
	httpClient *http.Client
	cachedHWID string
}

// NewClient creates a new DEEPAKX999AUTH client
func NewClient(apiKey, appName, baseURL string) *Client {
	if baseURL == "" {
		baseURL = "https://deepakx-999-auth.vercel.app/"
	}
	return &Client{
		APIKey:  apiKey,
		AppName: appName,
		BaseURL: strings.TrimSuffix(baseURL, "/"),
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GenerateHWID generates a hardware ID for the current machine
func (c *Client) GenerateHWID() string {
	if c.cachedHWID != "" {
		return c.cachedHWID
	}

	hostname, _ := os.Hostname()
	osInfo := runtime.GOOS + "-" + runtime.GOARCH
	cpuInfo := runtime.NumCPU()
	combined := fmt.Sprintf("%s-%s-%d", hostname, osInfo, cpuInfo)

	hash := sha256.Sum256([]byte(combined))
	c.cachedHWID = hex.EncodeToString(hash[:])
	return c.cachedHWID
}

// LoginResponse represents login API response
type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	User    *struct {
		ID         string `json:"id"`
		Username   string `json:"username"`
		Email      string `json:"email"`
		HWID       string `json:"hwid"`
		HWIDLocked bool   `json:"hwidLocked"`
		IP         string `json:"ip"`
		ExpiresAt  string `json:"expiresAt,omitempty"`
	} `json:"user,omitempty"`
}

// ValidateResponse represents license validation response
type ValidateResponse struct {
	Valid   bool   `json:"valid"`
	Message string `json:"message"`
	License *struct {
		Key          string `json:"key"`
		AppName      string `json:"appName"`
		ExpiresAt    string `json:"expiresAt"`
		MaxDevices   int    `json:"maxDevices"`
		BoundDevices int    `json:"boundDevices"`
		DeviceLabel  string `json:"deviceLabel,omitempty"`
	} `json:"license,omitempty"`
	ErrorCode string `json:"errorCode,omitempty"`
}

// RegisterResponse represents registration API response
type RegisterResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	UserID  string `json:"userId,omitempty"`
}

// DeleteResponse represents delete API response
type DeleteResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// ResetHWIDResponse represents reset HWID API response
type ResetHWIDResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// Login authenticates a user
func (c *Client) Login(username, password, hwid string) (*LoginResponse, error) {
	if hwid == "" {
		hwid = c.GenerateHWID()
	}

	payload := map[string]interface{}{
		"apiKey":   c.APIKey,
		"username": username,
		"password": password,
		"hwid":     hwid,
	}

	var response LoginResponse
	err := c.sendRequest("/api/user/login", payload, &response)
	return &response, err
}

// ValidateLicense validates a license key
func (c *Client) ValidateLicense(licenseKey, hwid string) (*ValidateResponse, error) {
	if hwid == "" {
		hwid = c.GenerateHWID()
	}

	payload := map[string]interface{}{
		"apiKey":     c.APIKey,
		"licenseKey": licenseKey,
		"hwid":       hwid,
	}

	var response ValidateResponse
	err := c.sendRequest("/api/auth/validate", payload, &response)
	return &response, err
}

// Register creates a new user account
func (c *Client) Register(username, password, email, licenseKey, hwid string) (*RegisterResponse, error) {
	if hwid == "" {
		hwid = c.GenerateHWID()
	}

	payload := map[string]interface{}{
		"apiKey":   c.APIKey,
		"username": username,
		"password": password,
		"email":    email,
		"hwid":     hwid,
	}

	if licenseKey != "" {
		payload["licenseKey"] = licenseKey
	}

	var response RegisterResponse
	err := c.sendRequest("/api/user/create", payload, &response)
	return &response, err
}

// DeleteUser deletes a user account
func (c *Client) DeleteUser(userID string) (*DeleteResponse, error) {
	payload := map[string]interface{}{
		"apiKey": c.APIKey,
		"userId": userID,
	}

	var response DeleteResponse
	err := c.sendRequest("/api/user/delete", payload, &response)
	return &response, err
}

// ResetHWID resets a user's HWID
func (c *Client) ResetHWID(userID string) (*ResetHWIDResponse, error) {
	payload := map[string]interface{}{
		"apiKey": c.APIKey,
		"userId": userID,
	}

	var response ResetHWIDResponse
	err := c.sendRequest("/api/user/reset-hwid", payload, &response)
	return &response, err
}

func (c *Client) sendRequest(endpoint string, payload interface{}, result interface{}) error {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", c.BaseURL+endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Licensify-Go-SDK/1.0")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if err := json.Unmarshal(body, result); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return nil
}

/* ===== USAGE EXAMPLE =====

package main

import (
	"fmt"
	"log"
	"github.com/licensify/sdk"
)

func main() {
	// Initialize client
	client := licensify.NewClient("YOUR_API_KEY", "YOUR_APP_NAME", "")

	// Get HWID
	hwid := client.GenerateHWID()
	fmt.Printf("Device HWID: %s\n", hwid)

	// Login
	loginResult, err := client.Login("john_doe", "password123", "")
	if err != nil {
		log.Fatal(err)
	}
	if loginResult.Success && loginResult.User != nil {
		fmt.Printf("✅ Logged in: %s\n", loginResult.User.Username)
		fmt.Printf("Email: %s\n", loginResult.User.Email)
		fmt.Printf("HWID Locked: %v\n", loginResult.User.HWIDLocked)
	} else {
		fmt.Printf("❌ Login failed: %s\n", loginResult.Message)
	}

	// Validate license
	validateResult, err := client.ValidateLicense("LICENSE-KEY-HERE", "")
	if err != nil {
		log.Fatal(err)
	}
	if validateResult.Valid && validateResult.License != nil {
		fmt.Printf("✅ License valid!\n")
		fmt.Printf("Expires: %s\n", validateResult.License.ExpiresAt)
		fmt.Printf("Devices: %d / %d\n", validateResult.License.BoundDevices, validateResult.License.MaxDevices)
	} else {
		fmt.Printf("❌ License invalid: %s\n", validateResult.Message)
	}

	// Register new user
	registerResult, err := client.Register("new_user", "password123", "user@example.com", "LICENSE-KEY", "")
	if err != nil {
		log.Fatal(err)
	}
	if registerResult.Success {
		fmt.Printf("✅ User registered! ID: %s\n", registerResult.UserID)
	} else {
		fmt.Printf("❌ Registration failed: %s\n", registerResult.Message)
	}
}

*/

