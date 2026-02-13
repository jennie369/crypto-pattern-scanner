# =====================================================
# AUTO DEPLOY SHOPIFY WEBHOOK
# Tự động cài Supabase CLI và deploy Edge Function
# =====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AUTO DEPLOY SHOPIFY WEBHOOK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# =====================================================
# STEP 1: Check if Supabase CLI is installed
# =====================================================
Write-Host "[1/6] Checking Supabase CLI..." -ForegroundColor Yellow

$supabaseExists = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseExists) {
    Write-Host "Supabase CLI not found. Installing..." -ForegroundColor Yellow

    # Check if Scoop is installed
    $scoopExists = Get-Command scoop -ErrorAction SilentlyContinue

    if (-not $scoopExists) {
        Write-Host "Installing Scoop package manager..." -ForegroundColor Yellow

        # Set execution policy
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

        # Install Scoop
        Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install Scoop!" -ForegroundColor Red
            Write-Host "Please install manually: https://scoop.sh" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }

        Write-Host "✅ Scoop installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✅ Scoop already installed" -ForegroundColor Green
    }

    # Add Supabase bucket
    Write-Host "Adding Supabase bucket to Scoop..." -ForegroundColor Yellow
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

    # Install Supabase CLI
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    scoop install supabase

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install Supabase CLI!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "✅ Supabase CLI installed!" -ForegroundColor Green

    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Host "✅ Supabase CLI already installed" -ForegroundColor Green
}

# Verify installation
Write-Host ""
Write-Host "Verifying Supabase CLI version:" -ForegroundColor Yellow
supabase --version

Write-Host ""

# =====================================================
# STEP 2: Login to Supabase
# =====================================================
Write-Host "[2/6] Logging in to Supabase..." -ForegroundColor Yellow

supabase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to login to Supabase!" -ForegroundColor Red
    Write-Host "Please run 'supabase login' manually" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Logged in successfully!" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 3: Link project
# =====================================================
Write-Host "[3/6] Linking to Supabase project..." -ForegroundColor Yellow

Set-Location "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

supabase link --project-ref pgfkbcnzqozzkohwbgbk

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to link project!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Project linked successfully!" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 4: Set secrets
# =====================================================
Write-Host "[4/6] Setting environment secrets..." -ForegroundColor Yellow

supabase secrets set SHOPIFY_WEBHOOK_SECRET=c5b5e7caaf2ccf17beb14cfa1ef93502d81095c4f204a8fe5ba98ead75c51ddd

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to set SHOPIFY_WEBHOOK_SECRET!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

supabase secrets set SUPABASE_URL=https://pgfkbcnzqozzkohwbgbk.supabase.co

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to set SUPABASE_URL!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to set SUPABASE_SERVICE_ROLE_KEY!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ All secrets set successfully!" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 5: Deploy Edge Function
# =====================================================
Write-Host "[5/6] Deploying Edge Function..." -ForegroundColor Yellow
Write-Host "This may take a minute..." -ForegroundColor Gray

supabase functions deploy shopify-webhook --no-verify-jwt

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to deploy Edge Function!" -ForegroundColor Red
    Write-Host "Check logs: supabase functions logs shopify-webhook" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Edge Function deployed successfully!" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 6: Test endpoint
# =====================================================
Write-Host "[6/6] Testing webhook endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook" -Method GET -ErrorAction Stop
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray

    if ($response.Content -like '*Unauthorized*') {
        Write-Host "✅ Endpoint is working! (Unauthorized is expected)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected response, but endpoint is reachable" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Endpoint is working! (401 Unauthorized is expected)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Endpoint returned status: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""

# =====================================================
# SUCCESS
# =====================================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Webhook URL:" -ForegroundColor Cyan
Write-Host "   https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. ✅ Database migration - DONE" -ForegroundColor Green
Write-Host "   2. ✅ Edge Function deployed - DONE" -ForegroundColor Green
Write-Host "   3. ⚠️  Fix 3 SKUs in Shopify (see FIX_SHOPIFY_SKUS.md)" -ForegroundColor Yellow
Write-Host "   4. 🧪 Test by making a purchase!" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔍 Check logs:" -ForegroundColor Cyan
Write-Host "   supabase functions logs shopify-webhook" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
