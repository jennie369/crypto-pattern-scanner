@echo off
chcp 65001 >nul
echo ============================================================
echo   GEM Academy - Upload Module 6 Images
echo ============================================================
node "%~dp0..\..\..\..\scripts\importTrieuPhuImages.js" --module 6
echo.
pause
