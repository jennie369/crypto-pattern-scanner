# Auto Deploy Shopify Webhook Edge Function
# Run with: powershell -ExecutionPolicy Bypass -File deploy-edge-function.ps1

Write-Host ""
Write-Host "========================================"
Write-Host "  DEPLOYING SHOPIFY WEBHOOK"
Write-Host "========================================"
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "[1/5] Checking Supabase CLI..."
$supabaseExists = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseExists) {
    Write-Host "ERROR: Supabase CLI not found!"
    Write-Host ""
    Write-Host "Please install first:"
    Write-Host "  1. Open PowerShell as Admin"
    Write-Host "  2. Run: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"
    Write-Host "  3. Run: iwr -useb get.scoop.sh | iex"
    Write-Host "  4. Run: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    Write-Host "  5. Run: scoop install supabase"
    Write-Host ""
    exit 1
}

Write-Host "OK: Supabase CLI found"
supabase --version
Write-Host ""

# Change to project directory
Write-Host "[2/5] Changing to project directory..."
Set-Location "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"
Write-Host "OK"
Write-Host ""

# Link project
Write-Host "[3/5] Linking to Supabase project pgfkbcnzqozzkohwbgbk..."
supabase link --project-ref pgfkbcnzqozzkohwbgbk

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to link project!"
    Write-Host "You may need to run: supabase login"
    exit 1
}

Write-Host "OK: Project linked"
Write-Host ""

# Set secrets
Write-Host "[4/5] Setting secrets..."
supabase secrets set SHOPIFY_WEBHOOK_SECRET=c5b5e7caaf2ccf17beb14cfa1ef93502d81095c4f204a8fe5ba98ead75c51ddd
supabase secrets set SUPABASE_URL=https://pgfkbcnzqozzkohwbgbk.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to set secrets!"
    exit 1
}

Write-Host "OK: All secrets set"
Write-Host ""

# Deploy Edge Function
Write-Host "[5/5] Deploying Edge Function..."
Write-Host "This may take a minute..."
supabase functions deploy shopify-webhook --no-verify-jwt

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy!"
    exit 1
}

Write-Host "OK: Deployed successfully!"
Write-Host ""

# Test endpoint
Write-Host "Testing endpoint..."
try {
    $response = Invoke-WebRequest -Uri "https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook" -Method GET -ErrorAction Stop
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "OK: Endpoint working (401 Unauthorized is expected)"
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "  DEPLOYMENT COMPLETED!"
Write-Host "========================================"
Write-Host ""
Write-Host "Webhook URL:"
Write-Host "  https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook"
Write-Host ""
Write-Host "Next: Fix 3 SKUs in Shopify (see FIX_SHOPIFY_SKUS.md)"
Write-Host ""
