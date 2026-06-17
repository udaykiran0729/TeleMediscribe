#!/bin/bash

# Automated Security Monitoring Script for Telemediscribe
# This script performs regular vulnerability scans and generates security reports

set -e

# Configuration
IMAGE_NAME="telemediscribe-telemediscribe"
REPORT_DIR="./security-reports"
LOG_FILE="$REPORT_DIR/security-scan.log"
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/vulnerability-report-$DATE.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create report directory if it doesn't exist
mkdir -p "$REPORT_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Print colored output
print_status() {
    case $2 in
        "SUCCESS") echo -e "${GREEN}✓ $1${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠ $1${NC}" ;;
        "ERROR") echo -e "${RED}✗ $1${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ $1${NC}" ;;
    esac
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_status "Docker is not running" "ERROR"
        exit 1
    fi
    print_status "Docker is running" "SUCCESS"
}

# Check if image exists
check_image() {
    if ! docker images | grep -q "$IMAGE_NAME"; then
        print_status "Image $IMAGE_NAME not found. Building..." "WARNING"
        docker-compose -f docker-compose.secure.yml build
    fi
    print_status "Image $IMAGE_NAME found" "SUCCESS"
}

# Run vulnerability scan with Docker Scout
run_vulnerability_scan() {
    log "Starting vulnerability scan for $IMAGE_NAME"
    
    # Run Docker Scout scan and save output
    docker scout cves "$IMAGE_NAME:latest" --format json > "$REPORT_FILE" 2>/dev/null || {
        print_status "Docker Scout scan failed, trying alternative method" "WARNING"
        # Alternative: Use docker scout with different format
        docker scout cves "$IMAGE_NAME:latest" > "$REPORT_FILE" 2>/dev/null || {
            print_status "Vulnerability scan failed" "ERROR"
            return 1
        }
    }
    
    print_status "Vulnerability scan completed" "SUCCESS"
    log "Scan results saved to $REPORT_FILE"
}

# Analyze scan results
analyze_results() {
    if [ -f "$REPORT_FILE" ]; then
        # Extract vulnerability counts (basic parsing)
        CRITICAL=$(grep -c "CRITICAL\|Critical" "$REPORT_FILE" || echo "0")
        HIGH=$(grep -c "HIGH\|High" "$REPORT_FILE" || echo "0")
        MEDIUM=$(grep -c "MEDIUM\|Medium" "$REPORT_FILE" || echo "0")
        LOW=$(grep -c "LOW\|Low" "$REPORT_FILE" || echo "0")
        
        print_status "Vulnerability Summary:" "INFO"
        print_status "  Critical: $CRITICAL" "$([ $CRITICAL -gt 0 ] && echo "ERROR" || echo "SUCCESS")"
        print_status "  High: $HIGH" "$([ $HIGH -gt 0 ] && echo "WARNING" || echo "SUCCESS")"
        print_status "  Medium: $MEDIUM" "$([ $MEDIUM -gt 10 ] && echo "WARNING" || echo "SUCCESS")"
        print_status "  Low: $LOW" "INFO"
        
        # Log summary
        log "Vulnerability Summary - Critical: $CRITICAL, High: $HIGH, Medium: $MEDIUM, Low: $LOW"
        
        # Alert if critical or high vulnerabilities found
        if [ $CRITICAL -gt 0 ] || [ $HIGH -gt 5 ]; then
            print_status "ALERT: Critical or high vulnerabilities detected!" "ERROR"
            log "ALERT: Critical or high vulnerabilities detected!"
        fi
    fi
}

# Check for outdated base images
check_base_images() {
    log "Checking for outdated base images"
    
    # Check Python base image
    CURRENT_PYTHON=$(docker images | grep "python.*3.11-slim" | head -1 | awk '{print $2}')
    if [ -n "$CURRENT_PYTHON" ]; then
        print_status "Current Python base image: $CURRENT_PYTHON" "INFO"
        
        # Check for newer version
        docker pull python:3.11-slim >/dev/null 2>&1
        NEW_PYTHON=$(docker images | grep "python.*3.11-slim" | head -1 | awk '{print $2}')
        
        if [ "$CURRENT_PYTHON" != "$NEW_PYTHON" ]; then
            print_status "Newer Python base image available" "WARNING"
            log "Newer Python base image available: $NEW_PYTHON"
        else
            print_status "Python base image is up to date" "SUCCESS"
        fi
    fi
}

# Generate security report
generate_report() {
    log "Generating security report"
    
    REPORT_HTML="$REPORT_DIR/security-report-$DATE.html"
    
    cat > "$REPORT_HTML" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Telemediscribe Security Report - $DATE</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .vulnerability { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .critical { border-left-color: #d32f2f; background: #ffebee; }
        .high { border-left-color: #f57c00; background: #fff3e0; }
        .medium { border-left-color: #fbc02d; background: #fff8e1; }
        .low { border-left-color: #388e3c; background: #e8f5e8; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Telemediscribe Security Report</h1>
        <p class="timestamp">Generated: $(date)</p>
        <p>Image: $IMAGE_NAME:latest</p>
    </div>
    
    <div class="summary">
        <h2>Vulnerability Summary</h2>
        <p>This report was generated by automated security monitoring.</p>
        <p>For detailed vulnerability information, check the JSON report: $(basename "$REPORT_FILE")</p>
    </div>
    
    <div class="recommendations">
        <h2>Security Recommendations</h2>
        <ul>
            <li>Update base images regularly</li>
            <li>Keep dependencies up to date</li>
            <li>Monitor for new vulnerabilities</li>
            <li>Implement automated security scanning</li>
            <li>Use multi-stage builds for smaller attack surface</li>
        </ul>
    </div>
</body>
</html>
EOF
    
    print_status "Security report generated: $REPORT_HTML" "SUCCESS"
    log "Security report generated: $REPORT_HTML"
}

# Clean up old reports (keep last 10)
cleanup_old_reports() {
    log "Cleaning up old reports"
    
    # Keep only the last 10 reports
    ls -t "$REPORT_DIR"/vulnerability-report-*.json 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    ls -t "$REPORT_DIR"/security-report-*.html 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    print_status "Old reports cleaned up" "SUCCESS"
}

# Main execution
main() {
    print_status "Starting Telemediscribe Security Monitoring" "INFO"
    log "=== Security Monitoring Started ==="
    
    check_docker
    check_image
    run_vulnerability_scan
    analyze_results
    check_base_images
    generate_report
    cleanup_old_reports
    
    print_status "Security monitoring completed" "SUCCESS"
    log "=== Security Monitoring Completed ==="
    print_status "Reports saved in: $REPORT_DIR" "INFO"
}

# Run main function
main "$@" 