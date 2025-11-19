@echo off
REM =====================================================
REM Deploy Shopify Webhook to Supabase
REM Run this script AFTER installing Supabase CLI
REM =====================================================

echo.
echo ========================================
echo   DEPLOYING SHOPIFY WEBHOOK
echo ========================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Supabase CLI not found!
    echo.
    echo Please install Supabase CLI first:
    echo   1. Install Scoop: https://scoop.sh/
    echo   2. Run: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    echo   3. Run: scoop install supabase
    echo.
    pause
    exit /b 1
)

echo [1/5] Checking Supabase CLI version...
supabase --version

echo.
echo [2/5] Linking to Supabase project...
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"
supabase link --project-ref pgfkbcnzqozzkohwbgbk

if %errorlevel% neq 0 (
    echo [ERROR] Failed to link project!
    pause
    exit /b 1
)

echo.
echo [3/5] Setting secrets...
supabase secrets set SHOPIFY_WEBHOOK_SECRET=c5b5e7caaf2ccf17beb14cfa1ef93502d81095c4f204a8fe5ba98ead75c51ddd
supabase secrets set SUPABASE_URL=https://pgfkbcnzqozzkohwbgbk.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg

if %errorlevel% neq 0 (
    echo [ERROR] Failed to set secrets!
    pause
    exit /b 1
)

echo.
echo [4/5] Deploying Edge Function...
supabase functions deploy shopify-webhook --no-verify-jwt

if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy function!
    pause
    exit /b 1
)

echo.
echo [5/5] Testing endpoint...
curl -X GET https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook

echo.
echo.
echo ========================================
echo   DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Webhook URL:
echo   https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
echo.
echo Next Steps:
echo   1. Copy the webhook URL above
echo   2. Go to Shopify Admin -^> Settings -^> Notifications -^> Webhooks
echo   3. The webhook should already be configured
echo   4. Test by making a purchase!
echo.
pause
