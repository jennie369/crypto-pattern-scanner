# Deploy Shopify Webhook to Supabase
Write-Host "🚀 Deploying Shopify Webhook..." -ForegroundColor Cyan
Write-Host ""

# Check for access token
$SUPABASE_TOKEN = $env:SUPABASE_ACCESS_TOKEN

if (-not $SUPABASE_TOKEN) {
    Write-Host "⚠️  SUPABASE_ACCESS_TOKEN not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please get your access token from:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/account/tokens" -ForegroundColor Cyan
    Write-Host ""
    $SUPABASE_TOKEN = Read-Host "Enter your Supabase Access Token"

    if (-not $SUPABASE_TOKEN) {
        Write-Host ""
        Write-Host "❌ No token provided. Exiting..." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Set environment variable for this session
$env:SUPABASE_ACCESS_TOKEN = $SUPABASE_TOKEN

# Deploy function
Write-Host ""
Write-Host "📦 Deploying function to Supabase..." -ForegroundColor Green
Write-Host ""

npx supabase functions deploy shopify-webhook --project-ref pgfkbcnzqozzkohwbgbk

# Check result
Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Webhook URL:" -ForegroundColor Cyan
    Write-Host "https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update this URL in Shopify webhook settings"
    Write-Host "2. Test with a test order"
    Write-Host "3. Monitor logs in Supabase Dashboard"
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above"
}

Write-Host ""
Read-Host "Press Enter to exit"
