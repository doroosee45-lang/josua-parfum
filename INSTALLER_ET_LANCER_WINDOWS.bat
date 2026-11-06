@echo off
chcp 65001 >nul
title JOSHUA PARFUM - Installation Propre & Lancement (Windows)
echo ==============================================================
echo   JOSHUA PARFUM - Nettoyage et Installation Propre Windows
echo ==============================================================
echo.

cd /d "%~dp0"

echo [1/4] Nettoyage des anciens caches et verrous Linux...
if exist "package-lock.json" del /f /q "package-lock.json"
if exist "backend\package-lock.json" del /f /q "backend\package-lock.json"
if exist "frontend\package-lock.json" del /f /q "frontend\package-lock.json"
if exist "frontend\node_modules" rmdir /s /q "frontend\node_modules"
if exist "frontend\.vite" rmdir /s /q "frontend\.vite"

echo [2/4] Installation de la racine...
call npm install

echo [3/4] Installation du Backend (Port 5000)...
cd /d "%~dp0backend"
call npm install

echo [4/4] Installation propre du Frontend (Vite + PostCSS + Tailwind)...
cd /d "%~dp0frontend"
call npm cache verify
call npm install

echo.
echo ==============================================================
echo   Installation terminee ! Demarrage Backend + Frontend...
echo   Ouvrez ensuite : http://localhost:5173
echo ==============================================================
cd /d "%~dp0"
call npm run dev
pause
