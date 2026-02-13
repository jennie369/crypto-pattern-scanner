@echo off
echo.
echo ========================================
echo   DEPLOY SHOPIFY WEBHOOK TO SUPABASE
echo ========================================
echo.

REM Check if token is in environment
if "%SUPABASE_ACCESS_TOKEN%"=="" (
    echo [WARNING] SUPABASE_ACCESS_TOKEN not found in environment
    echo.
    echo Please get your access token from:
    echo https://supabase.com/dashboard/account/tokens
    echo.
    set /p SUPABASE_ACCESS_TOKEN="Enter your Supabase Access Token: "
    echo.
)

REM Verify token was provided
if "%SUPABASE_ACCESS_TOKEN%"=="" (
    echo [ERROR] No token provided. Exiting...
    pause
    exit /b 1
)

echo [INFO] Deploying function to Supabase...
echo.

REM Deploy function
npx supabase functions deploy shopify-webhook --project-ref pgfkbcnzqozzkohwbgbk

echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Webhook URL:
    echo https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
    echo.
    echo Next steps:
    echo 1. Verify deployment in Supabase Dashboard
    echo 2. Test with a Shopify test order
    echo 3. Monitor logs for any issues
    echo.
) else (
    echo.
    echo ========================================
    echo   DEPLOYMENT FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above
    echo.
)

pause
