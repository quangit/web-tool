@echo off
REM Lint and Format Script
REM This script runs linting and formatting commands in sequence

echo Starting lint and format process...

REM Step 1: Run linting
echo.
echo === Running linting...
call pnpm run lint
if errorlevel 1 (
    echo Linting found issues. Proceeding to fix...
)

REM Step 2: Fix linting issues
echo.
echo === Fixing linting issues...
call pnpm run lint:fix
if errorlevel 1 (
    echo Error fixing linting issues!
    exit /b %errorlevel%
)

REM Step 3: Format code
echo.
echo === Formatting code...
call pnpm run format
if errorlevel 1 (
    echo Error formatting code!
    exit /b %errorlevel%
)

REM Step 4: Check code formatting
echo.
echo === Checking code formatting...
call pnpm run format:check
if errorlevel 1 (
    echo Format check failed!
    exit /b %errorlevel%
)

echo.
echo === All steps completed successfully!
