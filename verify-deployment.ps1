# Quick Verification Script After Startup Command Fix
# Run this after updating Azure startup command and restart

$url = "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net"

Write-Host "`n=== VERIFYING AZURE DEPLOYMENT FIX ===`n" -ForegroundColor Cyan

# Wait for restart
Write-Host "Waiting 30 seconds for app to restart..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Test 1: Basic connectivity
Write-Host "`n[1/5] Testing basic connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 30
    Write-Host "   ✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    $test1 = $true
} catch {
    Write-Host "   ❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    $test1 = $false
}

# Test 2: Homepage content
Write-Host "`n[2/5] Testing homepage content..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 30
    if ($response.Content -match "<!DOCTYPE html>") {
        Write-Host "   ✅ SUCCESS - Valid HTML returned" -ForegroundColor Green
        $test2 = $true
    } else {
        Write-Host "   ❌ FAILED - No HTML content" -ForegroundColor Red
        $test2 = $false
    }
} catch {
    Write-Host "   ❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    $test2 = $false
}

# Test 3: Check if it's Next.js
Write-Host "`n[3/5] Checking for Next.js indicators..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 30
    if ($response.Content -match "next" -or $response.Content -match "__NEXT_DATA__") {
        Write-Host "   ✅ SUCCESS - Next.js detected" -ForegroundColor Green
        $test3 = $true
    } else {
        Write-Host "   ⚠️  WARNING - Next.js markers not found (might still be OK)" -ForegroundColor Yellow
        $test3 = $true
    }
} catch {
    Write-Host "   ❌ FAILED" -ForegroundColor Red
    $test3 = $false
}

# Test 4: Response time
Write-Host "`n[4/5] Testing response time..." -ForegroundColor Yellow
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 30
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 5000) {
        Write-Host "   ✅ SUCCESS - Response time: $responseTime ms (Good!)" -ForegroundColor Green
        $test4 = $true
    } elseif ($responseTime -lt 10000) {
        Write-Host "   ⚠️  OK - Response time: $responseTime ms (Acceptable)" -ForegroundColor Yellow
        $test4 = $true
    } else {
        Write-Host "   ⚠️  SLOW - Response time: $responseTime ms (Too slow!)" -ForegroundColor Yellow
        $test4 = $false
    }
} catch {
    Write-Host "   ❌ FAILED" -ForegroundColor Red
    $test4 = $false
}

# Test 5: Check common routes
Write-Host "`n[5/5] Testing common routes..." -ForegroundColor Yellow
$routes = @("/", "/form", "/admin/login", "/interviewer/login")
$routesPassed = 0

foreach ($route in $routes) {
    try {
        $testUrl = "$url$route"
        $response = Invoke-WebRequest -Uri $testUrl -Method HEAD -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ✅ $route - OK" -ForegroundColor Green
        $routesPassed++
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "   ⚠️  $route - 404 (route might not exist)" -ForegroundColor Yellow
        } elseif ($statusCode -eq 405) {
            Write-Host "   ✅ $route - 405 (Method not allowed - route exists!)" -ForegroundColor Green
            $routesPassed++
        } else {
            Write-Host "   ❌ $route - Error: $statusCode" -ForegroundColor Red
        }
    }
}

$test5 = ($routesPassed -ge 2)

# Summary
Write-Host "`n=== SUMMARY ===`n" -ForegroundColor Cyan

$totalTests = 5
$passedTests = 0
if ($test1) { $passedTests++ }
if ($test2) { $passedTests++ }
if ($test3) { $passedTests++ }
if ($test4) { $passedTests++ }
if ($test5) { $passedTests++ }

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 ALL TESTS PASSED! ($passedTests/$totalTests)" -ForegroundColor Green
    Write-Host "`nYour application is LIVE and working!" -ForegroundColor Green
    Write-Host "URL: $url`n" -ForegroundColor Cyan
    
    # Ask to open browser
    $openBrowser = Read-Host "Open in browser? (Y/N)"
    if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Start-Process $url
    }
} elseif ($passedTests -ge 3) {
    Write-Host "⚠️  PARTIAL SUCCESS ($passedTests/$totalTests tests passed)" -ForegroundColor Yellow
    Write-Host "`nApplication is accessible but some issues detected." -ForegroundColor Yellow
    Write-Host "Check Azure logs for details:`n" -ForegroundColor Yellow
    Write-Host "az webapp log tail --name ukro-recruitment --resource-group ukro-recruitment-rg`n" -ForegroundColor White
} else {
    Write-Host "❌ FAILED ($passedTests/$totalTests tests passed)" -ForegroundColor Red
    Write-Host "`nApplication is NOT working properly." -ForegroundColor Red
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Check Azure Portal logs (App Service → Monitoring → Log stream)" -ForegroundColor White
    Write-Host "2. Verify startup command is set correctly" -ForegroundColor White
    Write-Host "3. Check if GitHub Actions deployment completed" -ForegroundColor White
    Write-Host "4. Review docs/ULTIMATE-FIX.md for alternative solutions`n" -ForegroundColor White
}

# Additional info
Write-Host "`n=== USEFUL COMMANDS ===`n" -ForegroundColor Cyan
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  az webapp log tail --name ukro-recruitment --resource-group ukro-recruitment-rg`n" -ForegroundColor White

Write-Host "Restart app:" -ForegroundColor Yellow
Write-Host "  az webapp restart --name ukro-recruitment --resource-group ukro-recruitment-rg`n" -ForegroundColor White

Write-Host "SSH to container:" -ForegroundColor Yellow
Write-Host "  az webapp ssh --name ukro-recruitment --resource-group ukro-recruitment-rg`n" -ForegroundColor White
