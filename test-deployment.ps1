# Test Azure Deployment Script
# Wait for GitHub Actions to complete (~5-7 minutes)

$url = "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net"

Write-Host "`n=== Testing Azure Deployment ===`n" -ForegroundColor Cyan

# Test 1: Basic connectivity
Write-Host "1. Testing basic connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 30
    Write-Host "   ✅ Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n   Possible causes:" -ForegroundColor Yellow
    Write-Host "   - Build still in progress (check GitHub Actions)" -ForegroundColor White
    Write-Host "   - Azure still deploying (check Azure Portal logs)" -ForegroundColor White
    exit 1
}

# Test 2: Get full page
Write-Host "`n2. Testing full page load..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 30
    $contentLength = $response.Content.Length
    Write-Host "   ✅ Content loaded: $contentLength bytes" -ForegroundColor Green
    
    if ($response.Content -match "<!DOCTYPE html>") {
        Write-Host "   ✅ Valid HTML document" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error loading page: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check for common routes
Write-Host "`n3. Testing API endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "/api/health",
    "/admin/login",
    "/interviewer/login"
)

foreach ($endpoint in $endpoints) {
    try {
        $testUrl = "$url$endpoint"
        $response = Invoke-WebRequest -Uri $testUrl -Method GET -TimeoutSec 10
        Write-Host "   ✅ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "   ⚠️  $endpoint - Not found (might not exist)" -ForegroundColor Yellow
        } elseif ($statusCode -eq 405) {
            Write-Host "   ✅ $endpoint - Exists (Method not allowed is OK)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $endpoint - Error: $statusCode" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host "`n=== Deployment Test Summary ===`n" -ForegroundColor Cyan
Write-Host "Application URL: $url" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Open URL in browser to verify UI" -ForegroundColor White
Write-Host "2. Test registration form" -ForegroundColor White
Write-Host "3. Check admin login" -ForegroundColor White
Write-Host "4. Monitor Application Insights for errors`n" -ForegroundColor White

# Open in default browser
$openBrowser = Read-Host "Open in browser? (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process $url
}
