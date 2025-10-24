# Configure Azure App Service for Next.js Standalone Deployment
# Run this script to configure your Azure App Service settings

$appName = "ukro-recruitment"
$resourceGroup = "ukro-recruitment-rg"  # Update if different

Write-Host "🔧 Configuring Azure App Service: $appName" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
$azInstalled = Get-Command az -ErrorAction SilentlyContinue
if (-not $azInstalled) {
    Write-Host "❌ Azure CLI is not installed!" -ForegroundColor Red
    Write-Host "Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "⚠️  Not logged in to Azure. Logging in..." -ForegroundColor Yellow
    az login
}

Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host ""

# Update App Settings
Write-Host "📝 Updating App Settings..." -ForegroundColor Cyan

# Disable Oryx build during deployment
az webapp config appsettings set `
    --name $appName `
    --resource-group $resourceGroup `
    --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false `
    --output none

Write-Host "  ✅ Disabled Oryx build" -ForegroundColor Green

# Set startup command
az webapp config set `
    --name $appName `
    --resource-group $resourceGroup `
    --startup-file "node server.js" `
    --output none

Write-Host "  ✅ Set startup command: node server.js" -ForegroundColor Green

# Set Node.js version
az webapp config appsettings set `
    --name $appName `
    --resource-group $resourceGroup `
    --settings WEBSITE_NODE_DEFAULT_VERSION=22-lts `
    --output none

Write-Host "  ✅ Set Node.js version: 22-lts" -ForegroundColor Green

# Set always on (if not on Free tier)
az webapp config set `
    --name $appName `
    --resource-group $resourceGroup `
    --always-on true `
    --output none 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Enabled Always On" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Could not enable Always On (may require paid tier)" -ForegroundColor Yellow
}

# Add environment variables for Next.js
Write-Host ""
Write-Host "📝 Setting Next.js environment variables..." -ForegroundColor Cyan

az webapp config appsettings set `
    --name $appName `
    --resource-group $resourceGroup `
    --settings `
        NODE_ENV=production `
        PORT=8080 `
        HOSTNAME=0.0.0.0 `
    --output none

Write-Host "  ✅ Environment variables configured" -ForegroundColor Green

# Restart the app
Write-Host ""
Write-Host "🔄 Restarting application..." -ForegroundColor Cyan
az webapp restart `
    --name $appName `
    --resource-group $resourceGroup `
    --output none

Write-Host "  ✅ Application restarted" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Azure App Service configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Commit and push your updated workflow file" -ForegroundColor White
Write-Host "  2. Wait for GitHub Actions to complete" -ForegroundColor White
Write-Host "  3. Check your app at: https://$appName.azurewebsites.net" -ForegroundColor White
Write-Host ""
