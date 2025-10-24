# Azure App Service Deployment Fix Guide

## Problem

Your Next.js app is failing to start on Azure App Service with error:

- Container exits during startup
- "didn't respond to HTTP pings on port: 8080"
- Oryx is interfering with standalone deployment

## Root Causes

1. **Oryx build interference**: Azure is trying to rebuild the app instead of running the standalone build
2. **Missing startup configuration**: App Service doesn't know how to start the Next.js server
3. **Incorrect deployment structure**: Static files or server.js not properly deployed

## Solution Steps

### Step 1: Update GitHub Actions Workflow ✅ DONE

The workflow has been updated to:

- Create a proper standalone deployment structure
- Include web.config to prevent Oryx interference
- Add .deployment file to disable Oryx build
- Create optimized package.json for production

### Step 2: Configure Azure App Service Settings

Run the PowerShell script to configure Azure:

```powershell
.\configure-azure-app-service.ps1
```

This script will:

- Disable Oryx build (`SCM_DO_BUILD_DURING_DEPLOYMENT=false`)
- Set startup command (`node server.js`)
- Configure Node.js version (22-lts)
- Set required environment variables
- Restart the application

### Step 3: Redeploy

```bash
# Commit the updated workflow
git add .github/workflows/main_ukro-recruitment.yml
git commit -m "Fix Azure deployment: Prevent Oryx interference and configure standalone mode"
git push origin main
```

### Step 4: Monitor Deployment

Watch the GitHub Actions workflow:
https://github.com/MIkhsanPasaribu/ititanix-recruitment/actions

Then check Azure logs:

1. Go to Azure Portal → Your App Service
2. Navigate to "Log stream" or "Advanced Tools" → "Log stream"
3. Look for successful startup message

### Expected Success Logs

You should see:

```
✓ Starting...
✓ Ready in XXXms
- Local:        http://localhost:8080
- Network:      http://0.0.0.0:8080
```

## Alternative: Manual Azure Configuration

If you prefer to configure manually instead of using the script:

### Via Azure Portal:

1. **Go to Configuration → Application Settings**
   Add these settings:

   - `SCM_DO_BUILD_DURING_DEPLOYMENT` = `false`
   - `WEBSITE_NODE_DEFAULT_VERSION` = `22-lts`
   - `NODE_ENV` = `production`
   - `PORT` = `8080`
   - `HOSTNAME` = `0.0.0.0`

2. **Go to Configuration → General Settings**

   - Startup Command: `node server.js`
   - Stack: Node
   - Major version: 22 LTS
   - Minor version: 22-lts

3. **Save and Restart**

### Via Azure CLI:

```bash
# Login
az login

# Set variables
$appName = "ukro-recruitment"
$resourceGroup = "ukro-recruitment"

# Configure settings
az webapp config appsettings set `
    --name $appName `
    --resource-group $resourceGroup `
    --settings `
        SCM_DO_BUILD_DURING_DEPLOYMENT=false `
        WEBSITE_NODE_DEFAULT_VERSION=22-lts `
        NODE_ENV=production `
        PORT=8080 `
        HOSTNAME=0.0.0.0

# Set startup command
az webapp config set `
    --name $appName `
    --resource-group $resourceGroup `
    --startup-file "node server.js"

# Restart
az webapp restart --name $appName --resource-group $resourceGroup
```

## Verification

After deployment, verify:

1. **Check if app is running:**

   ```bash
   curl https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net/api/health
   ```

2. **Check Azure logs:**

   - Azure Portal → App Service → Log stream
   - Look for "✓ Ready in XXXms"

3. **Check deployment structure:**
   - Azure Portal → App Service → Advanced Tools → File Manager
   - Verify: `server.js`, `.next/`, `public/` exist

## Troubleshooting

### Issue: Still getting Oryx logs

**Solution:** Check that `.deployment` file is in root of deployed package

- Verify web.config exists
- Ensure SCM_DO_BUILD_DURING_DEPLOYMENT=false

### Issue: "Cannot find module 'next'"

**Solution:** Standalone build should include all dependencies

- Verify .next/standalone contains node_modules
- Check that copy steps in workflow succeeded

### Issue: Port binding errors

**Solution:** Ensure app listens on PORT environment variable

- Next.js standalone automatically uses process.env.PORT
- Default is 3000, but Azure requires 8080

### Issue: Static files not loading

**Solution:** Verify .next/static and public folders

- Check workflow copy steps
- Ensure paths are correct in deployment

## Key Changes Made

### 1. GitHub Workflow Updates

- ✅ Added web.config for IIS node configuration
- ✅ Created .deployment file to disable Oryx
- ✅ Optimized package.json for production
- ✅ Added verification step to check deployment structure

### 2. Azure Configuration (via script)

- ✅ Disabled Oryx build system
- ✅ Set proper startup command
- ✅ Configured Node.js version
- ✅ Added required environment variables

## Next Steps After Successful Deployment

1. **Add health check endpoint** (if not exists):
   Create `src/app/api/health/route.ts`:

   ```typescript
   import { NextResponse } from "next/server";

   export async function GET() {
     return NextResponse.json({
       status: "healthy",
       timestamp: new Date().toISOString(),
     });
   }
   ```

2. **Configure custom domain** (optional)

3. **Set up Application Insights** for monitoring

4. **Configure environment-specific settings** in Azure

## Additional Resources

- [Next.js Standalone Mode](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Azure App Service Node.js](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)
- [Disable Oryx Build](https://github.com/microsoft/Oryx/blob/main/doc/configuration.md)

## Support

If issues persist:

1. Check GitHub Actions logs for build errors
2. Check Azure "Deployment Center" for deployment logs
3. Check Azure "Log stream" for runtime errors
4. Verify all files deployed correctly in Kudu/SCM site
