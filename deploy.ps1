# Vercel Deployment Script

Write-Host "Starting Vercel Deployment..." -ForegroundColor Green

# Make sure we're in the right directory
Set-Location "C:\Users\MD  FAIZAN\Pictures\GRABBER exe"

# Deploy to Vercel
npx vercel --prod --name auth-api-system

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "`nIMPORTANT: Don't forget to add environment variables in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "1. Go to your project on vercel.com" -ForegroundColor Cyan
Write-Host "2. Settings > Environment Variables" -ForegroundColor Cyan
Write-Host "3. Add these variables from your .env.local file:" -ForegroundColor Cyan
Write-Host "   - FIREBASE_PROJECT_ID" -ForegroundColor White
Write-Host "   - FIREBASE_PRIVATE_KEY" -ForegroundColor White
Write-Host "   - FIREBASE_CLIENT_EMAIL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_FIREBASE_API_KEY" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_FIREBASE_PROJECT_ID" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_FIREBASE_APP_ID" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" -ForegroundColor White

