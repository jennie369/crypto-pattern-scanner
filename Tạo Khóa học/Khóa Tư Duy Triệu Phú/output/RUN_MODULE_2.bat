@echo off
chcp 65001 >nul
echo ============================================================
echo   GEM Academy - Upload Module 2 Images
echo ============================================================
node "%~dp0..\..\..\..\scripts\importTrieuPhuImages.js" --module 2
echo.
pause
