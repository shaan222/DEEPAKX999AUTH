# Test API with Specific Credentials
$API_KEY = 'sk_e2772202de33423aa45a87681c5cc677'
$BASE_URL = 'http://localhost:3000/api'
$USERNAME = '1'
$PASSWORD = '1'

Write-Host "Testing Auth API with your credentials..." -ForegroundColor Cyan
Write-Host ""
Write-Host "API Key: $API_KEY" -ForegroundColor Gray
Write-Host "Base URL: $BASE_URL" -ForegroundColor Gray
Write-Host "Username: $USERNAME" -ForegroundColor Gray
Write-Host "Password: $PASSWORD" -ForegroundColor Gray
Write-Host ""

# Test 1: User Registration
Write-Host "[1] Testing User Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        apiKey = $API_KEY
        username = $USERNAME
        password = $PASSWORD
        email = "$USERNAME@test.com"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/user/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop

    Write-Host "SUCCESS! Registration worked!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $registerResponse | ConvertTo-Json -Depth 10
} catch {
    Write-Host "FAILED - Registration error" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Yellow
        
        if ($responseBody -like "*Username already exists*") {
            Write-Host ""
            Write-Host "User already exists, will try login instead..." -ForegroundColor Cyan
        }
    } else {
        Write-Host "Connection Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host ""

# Test 2: User Login
Write-Host "[2] Testing User Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        apiKey = $API_KEY
        username = $USERNAME
        password = $PASSWORD
        hwid = 'test-device-123'
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/user/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "SUCCESS! Login worked!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $loginResponse | ConvertTo-Json -Depth 10
    
    if ($loginResponse.success) {
        Write-Host ""
        Write-Host "User authenticated successfully!" -ForegroundColor Green
        Write-Host "User ID: $($loginResponse.user.id)" -ForegroundColor Gray
        Write-Host "Username: $($loginResponse.user.username)" -ForegroundColor Gray
    }
} catch {
    Write-Host "FAILED - Login error" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Yellow
        
        $errorObj = $responseBody | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorObj.message) {
            Write-Host ""
            Write-Host "Error Details: $($errorObj.message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Connection Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Make sure the dev server is running (npm run dev)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host ""

# Test 3: Check Server Connection
Write-Host "[3] Testing Server Connection..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "SUCCESS! Server is running on localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "FAILED - Server is NOT accessible" -ForegroundColor Red
    Write-Host "Please start the dev server: npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All Tests Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - If registration worked: User was created successfully" -ForegroundColor White
Write-Host "  - If login worked: Authentication is working correctly" -ForegroundColor White
Write-Host "  - Check Firebase Firestore appUsers collection to verify data" -ForegroundColor White
