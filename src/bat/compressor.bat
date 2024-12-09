::incomplete

@echo off
setlocal enabledelayedexpansion

set /p SOURCE_FILE="Enter file path: "

if not exist "%SOURCE_FILE%" (
    echo No such file: %SOURCE_FILE%
    exit /b 1
)

for %%F in ("%SOURCE_FILE%") do (
    set "FILENAME=%%~nF"
    set "EXTENSION=%%~xF"
)

set "DEST_FILE=%FILENAME%_compressed%EXTENSION%"

set "RESULT="

for /f "delims=" %%A in (%SOURCE_FILE%) do (
    set "LINE=%%A"
    set "RESULT=!RESULT!!LINE!"
)

echo !RESULT! > "%DEST_FILE%"

endlocal
echo  Done: %DEST_FILE%
pause
