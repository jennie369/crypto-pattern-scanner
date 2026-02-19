@echo off
chcp 65001 >nul
echo ============================================================
echo   GEM Academy - Upload ALL Trieu Phu Images
echo ============================================================
node "%~dp0..\..\..\..\scripts\importTrieuPhuImages.js"
echo.
pause
