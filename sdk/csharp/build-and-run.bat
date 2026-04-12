@echo off
echo ============================================
echo Licensify C# SDK - Build and Test
echo ============================================
echo.

REM Check if .NET SDK is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET SDK is not installed!
    echo.
    echo Please install .NET SDK from:
    echo https://dotnet.microsoft.com/download
    echo.
    pause
    exit /b 1
)

echo [1/3] Restoring NuGet packages...
dotnet restore LicensifyTest.csproj
if errorlevel 1 (
    echo ERROR: Failed to restore packages!
    pause
    exit /b 1
)
echo.

echo [2/3] Building project...
dotnet build LicensifyTest.csproj --configuration Release
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [3/3] Running test program...
echo.
echo ============================================
echo.
dotnet run --project LicensifyTest.csproj
echo.
echo ============================================
echo.

pause

