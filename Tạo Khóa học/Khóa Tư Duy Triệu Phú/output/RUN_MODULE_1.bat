@echo off
chcp 65001 >nul
echo ============================================================
echo   GEM Academy - Upload Module 1 Images
echo ============================================================
node "%~dp0..\..\..\..\scripts\importTrieuPhuImages.js" --module 1
echo.
pause
