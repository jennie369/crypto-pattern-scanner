@echo off
echo ===============================================
echo SHOPIFY + SUPABASE DEPLOYMENT SCRIPT
echo ===============================================
echo.

REM Store credentials
set SHOPIFY_DOMAIN=yinyang-masters.myshopify.com
set SHOPIFY_ADMIN_TOKEN=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
set SHOPIFY_STOREFRONT_TOKEN=5c70b78ecf59c54097b7cd21d162d463
set SHOPIFY_WEBHOOK_SECRET=5h4u9xE84SwcN6BpGCk6szOuKa8dKdbVVs66aXFKWHw=
set SUPABASE_PROJECT_REF=pgfkbcnzqozzkohwbgbk

echo Credentials loaded:
echo - Domain: %SHOPIFY_DOMAIN%
echo - Project: %SUPABASE_PROJECT_REF%
echo.

echo ===============================================
echo STEP 1: Login to Supabase
echo ===============================================
npx supabase login
if errorlevel 1 (
    echo ERROR: Failed to login. Please try again.
    pause
    exit /b 1
)
echo.

echo ===============================================
echo STEP 2: Link Supabase Project
echo ===============================================
npx supabase link --project-ref %SUPABASE_PROJECT_REF%
if errorlevel 1 (
    echo WARNING: Project already linked or error occurred.
)
echo.

echo ===============================================
echo STEP 3: Set Supabase Secrets
echo ===============================================
echo Setting SHOPIFY_DOMAIN...
npx supabase secrets set SHOPIFY_DOMAIN=%SHOPIFY_DOMAIN% --project-ref %SUPABASE_PROJECT_REF%

echo Setting SHOPIFY_ADMIN_TOKEN...
npx supabase secrets set SHOPIFY_ADMIN_TOKEN=%SHOPIFY_ADMIN_TOKEN% --project-ref %SUPABASE_PROJECT_REF%

echo Setting SHOPIFY_STOREFRONT_TOKEN...
npx supabase secrets set SHOPIFY_STOREFRONT_TOKEN=%SHOPIFY_STOREFRONT_TOKEN% --project-ref %SUPABASE_PROJECT_REF%

echo Setting SHOPIFY_WEBHOOK_SECRET...
npx supabase secrets set SHOPIFY_WEBHOOK_SECRET=%SHOPIFY_WEBHOOK_SECRET% --project-ref %SUPABASE_PROJECT_REF%

echo.
echo Verifying secrets...
npx supabase secrets list --project-ref %SUPABASE_PROJECT_REF%
echo.

echo ===============================================
echo STEP 4: Run Database Migration
echo ===============================================
npx supabase db push --project-ref %SUPABASE_PROJECT_REF%
if errorlevel 1 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)
echo.

echo ===============================================
echo STEP 5: Deploy Edge Functions
echo ===============================================

echo Deploying shopify-products...
npx supabase functions deploy shopify-products --project-ref %SUPABASE_PROJECT_REF% --no-verify-jwt
if errorlevel 1 (
    echo WARNING: shopify-products deployment failed
)

echo Deploying shopify-cart...
npx supabase functions deploy shopify-cart --project-ref %SUPABASE_PROJECT_REF% --no-verify-jwt
if errorlevel 1 (
    echo WARNING: shopify-cart deployment failed
)

echo Deploying shopify-webhook...
npx supabase functions deploy shopify-webhook --project-ref %SUPABASE_PROJECT_REF% --no-verify-jwt
if errorlevel 1 (
    echo WARNING: shopify-webhook deployment failed
)

echo.

echo ===============================================
echo STEP 6: List Deployed Functions
echo ===============================================
npx supabase functions list --project-ref %SUPABASE_PROJECT_REF%
echo.

echo ===============================================
echo DEPLOYMENT COMPLETE!
echo ===============================================
echo.
echo Next steps:
echo 1. Test products API: http://localhost:5176/shop
echo 2. Register Shopify webhooks (see SHOPIFY_DEPLOYMENT_GUIDE.md)
echo 3. Sync initial products
echo.
echo Function URLs:
echo - https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-products
echo - https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-cart
echo - https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
echo.

pause
