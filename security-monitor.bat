@echo off
setlocal enabledelayedexpansion

REM Automated Security Monitoring Script for Telemediscribe (Windows)
REM This script performs regular vulnerability scans and generates security reports

REM Configuration
set IMAGE_NAME=telemediscribe-telemediscribe
set REPORT_DIR=.\security-reports
set LOG_FILE=%REPORT_DIR%\security-scan.log
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=%DATE: =0%
set REPORT_FILE=%REPORT_DIR%\vulnerability-report-%DATE%.json

REM Create report directory if it doesn't exist
if not exist "%REPORT_DIR%" mkdir "%REPORT_DIR%"

REM Logging function
:log
echo [%date% %time%] %~1 >> "%LOG_FILE%"
echo [%date% %time%] %~1
goto :eof

REM Print status
:print_status
if "%2"=="SUCCESS" (
    echo ✓ %~1
) else if "%2"=="WARNING" (
    echo ⚠ %~1
) else if "%2"=="ERROR" (
    echo ✗ %~1
) else (
    echo ℹ %~1
)
goto :eof

REM Check if Docker is running
:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    call :print_status "Docker is not running" "ERROR"
    exit /b 1
)
call :print_status "Docker is running" "SUCCESS"
goto :eof

REM Check if image exists
:check_image
docker images | findstr "%IMAGE_NAME%" >nul
if errorlevel 1 (
    call :print_status "Image %IMAGE_NAME% not found. Building..." "WARNING"
    docker-compose -f docker-compose.secure.yml build
)
call :print_status "Image %IMAGE_NAME% found" "SUCCESS"
goto :eof

REM Run vulnerability scan
:run_vulnerability_scan
call :log "Starting vulnerability scan for %IMAGE_NAME%"

REM Run Docker Scout scan and save output
docker scout cves "%IMAGE_NAME%:latest" --format json > "%REPORT_FILE%" 2>nul
if errorlevel 1 (
    call :print_status "Docker Scout scan failed, trying alternative method" "WARNING"
    docker scout cves "%IMAGE_NAME%:latest" > "%REPORT_FILE%" 2>nul
    if errorlevel 1 (
        call :print_status "Vulnerability scan failed" "ERROR"
        exit /b 1
    )
)

call :print_status "Vulnerability scan completed" "SUCCESS"
call :log "Scan results saved to %REPORT_FILE%"
goto :eof

REM Analyze scan results
:analyze_results
if exist "%REPORT_FILE%" (
    REM Extract vulnerability counts (basic parsing)
    set CRITICAL=0
    set HIGH=0
    set MEDIUM=0
    set LOW=0
    
    for /f %%i in ('findstr /c:"CRITICAL" /c:"Critical" "%REPORT_FILE%" ^| find /c /v ""') do set CRITICAL=%%i
    for /f %%i in ('findstr /c:"HIGH" /c:"High" "%REPORT_FILE%" ^| find /c /v ""') do set HIGH=%%i
    for /f %%i in ('findstr /c:"MEDIUM" /c:"Medium" "%REPORT_FILE%" ^| find /c /v ""') do set MEDIUM=%%i
    for /f %%i in ('findstr /c:"LOW" /c:"Low" "%REPORT_FILE%" ^| find /c /v ""') do set LOW=%%i
    
    call :print_status "Vulnerability Summary:" "INFO"
    
    if !CRITICAL! gtr 0 (
        call :print_status "  Critical: !CRITICAL!" "ERROR"
    ) else (
        call :print_status "  Critical: !CRITICAL!" "SUCCESS"
    )
    
    if !HIGH! gtr 0 (
        call :print_status "  High: !HIGH!" "WARNING"
    ) else (
        call :print_status "  High: !HIGH!" "SUCCESS"
    )
    
    if !MEDIUM! gtr 10 (
        call :print_status "  Medium: !MEDIUM!" "WARNING"
    ) else (
        call :print_status "  Medium: !MEDIUM!" "SUCCESS"
    )
    
    call :print_status "  Low: !LOW!" "INFO"
    
    REM Log summary
    call :log "Vulnerability Summary - Critical: !CRITICAL!, High: !HIGH!, Medium: !MEDIUM!, Low: !LOW!"
    
    REM Alert if critical or high vulnerabilities found
    if !CRITICAL! gtr 0 (
        call :print_status "ALERT: Critical vulnerabilities detected!" "ERROR"
        call :log "ALERT: Critical vulnerabilities detected!"
    )
    if !HIGH! gtr 5 (
        call :print_status "ALERT: High vulnerabilities detected!" "ERROR"
        call :log "ALERT: High vulnerabilities detected!"
    )
)
goto :eof

REM Generate security report
:generate_report
call :log "Generating security report"

set REPORT_HTML=%REPORT_DIR%\security-report-%DATE%.html

(
echo ^<!DOCTYPE html^>
echo ^<html^>
echo ^<head^>
echo     ^<title^>Telemediscribe Security Report - %DATE%^</title^>
echo     ^<style^>
echo         body { font-family: Arial, sans-serif; margin: 20px; }
echo         .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
echo         .summary { margin: 20px 0; }
echo         .vulnerability { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
echo         .critical { border-left-color: #d32f2f; background: #ffebee; }
echo         .high { border-left-color: #f57c00; background: #fff3e0; }
echo         .medium { border-left-color: #fbc02d; background: #fff8e1; }
echo         .low { border-left-color: #388e3c; background: #e8f5e8; }
echo         .timestamp { color: #666; font-size: 0.9em; }
echo     ^</style^>
echo ^</head^>
echo ^<body^>
echo     ^<div class="header"^>
echo         ^<h1^>Telemediscribe Security Report^</h1^>
echo         ^<p class="timestamp"^>Generated: %date% %time%^</p^>
echo         ^<p^>Image: %IMAGE_NAME%:latest^</p^>
echo     ^</div^>
echo     
echo     ^<div class="summary"^>
echo         ^<h2^>Vulnerability Summary^</h2^>
echo         ^<p^>This report was generated by automated security monitoring.^</p^>
echo         ^<p^>For detailed vulnerability information, check the JSON report: vulnerability-report-%DATE%.json^</p^>
echo     ^</div^>
echo     
echo     ^<div class="recommendations"^>
echo         ^<h2^>Security Recommendations^</h2^>
echo         ^<ul^>
echo             ^<li^>Update base images regularly^</li^>
echo             ^<li^>Keep dependencies up to date^</li^>
echo             ^<li^>Monitor for new vulnerabilities^</li^>
echo             ^<li^>Implement automated security scanning^</li^>
echo             ^<li^>Use multi-stage builds for smaller attack surface^</li^>
echo         ^</ul^>
echo     ^</div^>
echo ^</body^>
echo ^</html^>
) > "%REPORT_HTML%"

call :print_status "Security report generated: %REPORT_HTML%" "SUCCESS"
call :log "Security report generated: %REPORT_HTML%"
goto :eof

REM Main execution
:main
call :print_status "Starting Telemediscribe Security Monitoring" "INFO"
call :log "=== Security Monitoring Started ==="

call :check_docker
if errorlevel 1 exit /b 1

call :check_image
call :run_vulnerability_scan
call :analyze_results
call :generate_report

call :print_status "Security monitoring completed" "SUCCESS"
call :log "=== Security Monitoring Completed ==="
call :print_status "Reports saved in: %REPORT_DIR%" "INFO"

goto :eof

REM Run main function
call :main 