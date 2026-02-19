@echo off
chcp 65001 >nul
echo ============================================================
echo   GEM Academy - Upload Module 5 Images
echo ============================================================
node "%~dp0..\..\..\..\scripts\importTrieuPhuImages.js" --module 5
echo.
pause
