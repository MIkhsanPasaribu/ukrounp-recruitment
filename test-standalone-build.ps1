# Test Build Locally - Verify Standalone Mode
# Run this BEFORE pushing to GitHub

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧪 TESTING STANDALONE BUILD LOCALLY                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Clean previous builds
Write-Host "📦 Step 1: Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✅ Removed .next folder" -ForegroundColor Green
}
if (Test-Path "deploy") {
    Remove-Item -Recurse -Force deploy
    Write-Host "   ✅ Removed deploy folder" -ForegroundColor Green
}

# Step 2: Install dependencies
Write-Host "`n📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green

# Step 3: Build Next.js
Write-Host "`n🔨 Step 3: Building Next.js with standalone mode..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Build completed" -ForegroundColor Green

# Step 4: Verify standalone output
Write-Host "`n🔍 Step 4: Verifying standalone output..." -ForegroundColor Yellow

$checks = @()

# Check 1: .next/standalone folder exists
if (Test-Path ".next/standalone") {
    Write-Host "   ✅ .next/standalone folder exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ❌ .next/standalone folder NOT found!" -ForegroundColor Red
    Write-Host "      → Check next.config.ts has output: 'standalone'" -ForegroundColor Yellow
    $checks += $false
}

# Check 2: server.js exists
if (Test-Path ".next/standalone/server.js") {
    Write-Host "   ✅ server.js exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ❌ server.js NOT found!" -ForegroundColor Red
    $checks += $false
}

# Check 3: .next/static exists
if (Test-Path ".next/static") {
    Write-Host "   ✅ .next/static folder exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ❌ .next/static folder NOT found!" -ForegroundColor Red
    $checks += $false
}

# Check 4: public folder exists
if (Test-Path "public") {
    Write-Host "   ✅ public folder exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ⚠️  public folder not found (optional)" -ForegroundColor Yellow
    $checks += $true
}

# Step 5: Simulate deployment preparation
Write-Host "`n📦 Step 5: Simulating deployment preparation..." -ForegroundColor Yellow

try {
    # Create deploy folder
    New-Item -ItemType Directory -Force -Path "deploy" | Out-Null
    
    # Copy standalone files
    Copy-Item -Path ".next/standalone/*" -Destination "deploy/" -Recurse -Force
    Write-Host "   ✅ Copied standalone files" -ForegroundColor Green
    
    # Create .next/static in deploy
    New-Item -ItemType Directory -Force -Path "deploy/.next/static" | Out-Null
    Copy-Item -Path ".next/static/*" -Destination "deploy/.next/static/" -Recurse -Force
    Write-Host "   ✅ Copied static assets" -ForegroundColor Green
    
    # Copy public if exists
    if (Test-Path "public") {
        Copy-Item -Path "public" -Destination "deploy/" -Recurse -Force
        Write-Host "   ✅ Copied public folder" -ForegroundColor Green
    }
    
    # Copy package.json
    Copy-Item -Path "package.json" -Destination "deploy/" -Force
    Write-Host "   ✅ Copied package.json" -ForegroundColor Green
    
    $checks += $true
} catch {
    Write-Host "   ❌ Deployment preparation failed: $_" -ForegroundColor Red
    $checks += $false
}

# Step 6: Verify deploy structure
Write-Host "`n🔍 Step 6: Verifying deploy structure..." -ForegroundColor Yellow

if (Test-Path "deploy/server.js") {
    Write-Host "   ✅ deploy/server.js exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ❌ deploy/server.js NOT found!" -ForegroundColor Red
    $checks += $false
}

if (Test-Path "deploy/.next/static") {
    Write-Host "   ✅ deploy/.next/static exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "   ❌ deploy/.next/static NOT found!" -ForegroundColor Red
    $checks += $false
}

# Step 7: Calculate sizes
Write-Host "`n📊 Step 7: Deployment size analysis..." -ForegroundColor Yellow

if (Test-Path "deploy") {
    $deploySize = (Get-ChildItem -Path "deploy" -Recurse | Measure-Object -Property Length -Sum).Sum
    $deploySizeMB = [math]::Round($deploySize / 1MB, 2)
    Write-Host "   📦 Deploy folder size: $deploySizeMB MB" -ForegroundColor Cyan
    
    if (Test-Path ".next") {
        $nextSize = (Get-ChildItem -Path ".next" -Recurse | Measure-Object -Property Length -Sum).Sum
        $nextSizeMB = [math]::Round($nextSize / 1MB, 2)
        Write-Host "   📦 Full .next size: $nextSizeMB MB" -ForegroundColor Cyan
        
        $savings = [math]::Round((1 - ($deploySize / $nextSize)) * 100, 1)
        Write-Host "   💰 Size reduction: $savings%" -ForegroundColor Green
    }
}

# Step 8: Test local server (optional)
Write-Host "`n🚀 Step 8: Test local server? (Optional)" -ForegroundColor Yellow
Write-Host "   To test standalone server locally, run:" -ForegroundColor White
Write-Host "   cd deploy" -ForegroundColor Cyan
Write-Host "   node server.js" -ForegroundColor Cyan
Write-Host "   Then open: http://localhost:3000`n" -ForegroundColor Cyan

# Final Summary
Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                   📊 TEST RESULTS                        ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

$passedChecks = ($checks | Where-Object { $_ -eq $true }).Count
$totalChecks = $checks.Count

Write-Host "Checks passed: $passedChecks / $totalChecks" -ForegroundColor Cyan

if ($passedChecks -eq $totalChecks) {
    Write-Host "`n✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "`n🎉 Standalone build is working correctly!" -ForegroundColor Green
    Write-Host "📤 Ready to push to GitHub!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. git add ." -ForegroundColor White
    Write-Host "2. git commit -m 'Implement Next.js standalone build (best practice)'" -ForegroundColor White
    Write-Host "3. git push origin main" -ForegroundColor White
    Write-Host "4. Update Azure Portal startup command to: node server.js" -ForegroundColor White
    Write-Host "5. Wait 3-5 minutes for deployment" -ForegroundColor White
    Write-Host "6. Test application!`n" -ForegroundColor White
} else {
    Write-Host "`n❌ SOME CHECKS FAILED!" -ForegroundColor Red
    Write-Host "`n🔧 Please fix the issues above before pushing to GitHub." -ForegroundColor Yellow
    Write-Host "`nCommon fixes:" -ForegroundColor Yellow
    Write-Host "- Verify next.config.ts has: output: 'standalone'" -ForegroundColor White
    Write-Host "- Run: npm run build again" -ForegroundColor White
    Write-Host "- Check for build errors in console`n" -ForegroundColor White
}

# Cleanup option
Write-Host "`n🧹 Cleanup test files?" -ForegroundColor Yellow
$cleanup = Read-Host "Remove deploy folder? (y/n)"
if ($cleanup -eq 'y') {
    Remove-Item -Recurse -Force deploy -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned up test files" -ForegroundColor Green
}

Write-Host ""
