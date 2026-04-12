@echo off
echo ========================================
echo   Licensify - Project Rebuild
echo ========================================
echo.

echo [1/2] Cleaning previous build...
if exist .next (
    rmdir /s /q .next
    echo   - Removed .next directory
)

echo.
echo [2/2] Building project...
call npm run build

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   Build completed successfully!
    echo ========================================
) else (
    echo ========================================
    echo   Build failed! Check errors above.
    echo ========================================
    exit /b %ERRORLEVEL%
)

pause

