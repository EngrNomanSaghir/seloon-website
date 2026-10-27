@echo off
title Maison De Beaute - Luxury Salon Web Application
echo =========================================================================
echo       MAISON DE BEAUTE - LUXURY SALON & SPA (HTML/CSS/JS)
echo =========================================================================
echo.
echo Launching Maison De Beaute in your default web browser...
echo Tech Stack: Pure HTML5, Modern CSS3 & Vanilla JavaScript (Client-Side)
echo.

set PYTHON_PATH="C:\Users\Mrcom\Python313\python.exe"

if exist %PYTHON_PATH% (
    echo Starting lightweight local server on http://127.0.0.1:8080 ...
    start "" http://127.0.0.1:8080/index.html
    %PYTHON_PATH% -m http.server 8080
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        echo Starting lightweight local server on http://127.0.0.1:8080 ...
        start "" http://127.0.0.1:8080/index.html
        python -m http.server 8080
    ) else (
        echo Opening index.html directly in your default browser...
        start "" "index.html"
    )
)

pause
