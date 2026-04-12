# PowerShell API Test Script with Help
$BASE_URL = 'http://localhost:3000/api'

Write-Host "🧪 Testing Auth API...`n" -ForegroundColor Cyan
Write-Host "⚠️  IMPORTANT: Make sure you're using the actual API KEY from your dashboard," -ForegroundColor Yellow
Write-Host "   not the Application ID. API keys start with 'sk_'`n" -ForegroundColor Yellow

# Get API key from user
$API_KEY = Read-Host "Enter your API Key (starts with 'sk_')"

if ($API_KEY -notlike "sk_*") {
    Write-Host "`n⚠️  Warning: API keys usually start with 'sk_'" -ForegroundColor Yellow
    Write-Host "   If you're using Application ID instead, please get the API Key from:" -ForegroundColor Yellow
    Write-Host "   Dashboard > Applications > Select App > View Details`n" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit
    }
}

Write-Host "`n"

# Test 1: User Registration
Write-Host "1️⃣ Testing User Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        apiKey = $API_KEY
        username = 'testuser_' + [DateTimeOffset]::Now.ToUnixTimeSeconds()
        password = 'testpass123'
        email = "test_$([DateTimeOffset]::Now.ToUnixTimeSeconds())@example.com"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/user/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop

    Write-Host "✅ Register Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $registerResponse | ConvertTo-Json -Depth 10
    
    $registeredUsername = $registerResponse.user.username
} catch {
    Write-Host "❌ Register Failed" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error: $responseBody" -ForegroundColor Red
        
        if ($responseBody -like "*Invalid API key*") {
            Write-Host "`n💡 Tip: Make sure:" -ForegroundColor Yellow
            Write-Host "   1. You're using the API KEY (starts with 'sk_'), not the Application ID" -ForegroundColor Yellow
            Write-Host "   2. The API key exists in your Firebase database" -ForegroundColor Yellow
            Write-Host "   3. The application is active in your dashboard" -ForegroundColor Yellow
        }
    }
    exit
}

Write-Host "`n"

# Test 2: User Login
Write-Host "2️⃣ Testing User Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        apiKey = $API_KEY
        username = $registeredUsername
        password = 'testpass123'
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/user/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "✅ Login Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $loginResponse | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Login Failed" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n✅ API Testing Complete!" -ForegroundColor Cyan
Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Check your Firebase Firestore 'appUsers' collection to see the registered user" -ForegroundColor White
Write-Host "   2. Try testing with a license key validation if you have one" -ForegroundColor White

