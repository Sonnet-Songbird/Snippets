@echo off
setlocal enabledelayedexpansion

set "currentDir=%cd%"

echo curruntDir: %currentDir%
echo List:

for /d %%d in ("%currentDir%\*") do (
    echo %%~nxd
)

endlocal
pause
