# Test Shopify Webhook Deployment
Write-Host "🧪 Testing Shopify Webhook..." -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook"

Write-Host "📍 Webhook URL: $webhookUrl" -ForegroundColor Green
Write-Host ""

# Test 1: Check if endpoint responds
Write-Host "Test 1: Checking endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $webhookUrl -Method GET -ErrorAction SilentlyContinue
    Write-Host "✅ Endpoint is live" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Endpoint is live - returns 401 Unauthorized as expected" -ForegroundColor Green
    } else {
        Write-Host "Endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Deployment Info:" -ForegroundColor Cyan
Write-Host "Project: pgfkbcnzqozzkohwbgbk"
Write-Host "Function: shopify-webhook"
Write-Host "Region: US East"
Write-Host ""

Write-Host "📝 Changes in latest version:" -ForegroundColor Yellow
Write-Host "  Payment status check - lines 83-101"
Write-Host "  Only process orders with financial_status = paid"
Write-Host "  Pending orders saved but not processed"
Write-Host ""

Write-Host "🔍 How to verify deployment:" -ForegroundColor Cyan
Write-Host "1. Go to: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions"
Write-Host "2. Click 'shopify-webhook'"
Write-Host "3. Check 'Deployments' tab for latest version"
Write-Host "4. Check timestamp matches today"
Write-Host ""

Read-Host "Press Enter to exit"
