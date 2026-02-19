@echo off
chcp 65001 >nul
echo ============================================================
echo   GEM Academy - Upload Module 3 Images
echo ============================================================
node "%~dp0..\..\..\..\scripts\importTrieuPhuImages.js" --module 3
echo.
pause
