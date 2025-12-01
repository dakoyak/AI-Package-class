@echo off
echo Starting server debug... > debug_log.txt
cd backend
echo Current directory: %CD% >> ..\debug_log.txt
node server.cjs >> ..\debug_log.txt 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Server failed with error code %ERRORLEVEL% >> ..\debug_log.txt
)
