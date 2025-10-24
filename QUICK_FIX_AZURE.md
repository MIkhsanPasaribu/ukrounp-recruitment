# Quick Fix: Manual Azure Portal Configuration

Since Azure CLI is not installed, follow these steps in Azure Portal:

## Step 1: Configure Application Settings

1. **Open Azure Portal**: https://portal.azure.com
2. **Navigate to**: Your App Service "ukro-recruitment"
3. **Go to**: Configuration → Application Settings
4. **Click**: "+ New application setting" and add each:

### Required Settings:

```
Name: SCM_DO_BUILD_DURING_DEPLOYMENT
Value: false
```

```
Name: WEBSITE_NODE_DEFAULT_VERSION
Value: 22-lts
```

```
Name: NODE_ENV
Value: production
```

```
Name: PORT
Value: 8080
```

```
Name: HOSTNAME
Value: 0.0.0.0
```

5. **Click**: "Save" at the top

## Step 2: Configure Startup Command

1. **Still in Configuration**, go to: **General settings** tab
2. **Find**: "Startup Command" field
3. **Enter**: `node server.js`
4. **Verify**:
   - Stack: Node
   - Major version: 22
   - Minor version: 22-lts
5. **Click**: "Save" at the top

## Step 3: Restart Application

1. **Go back to**: Overview page
2. **Click**: "Restart" at the top
3. **Wait**: 30-60 seconds for restart

## Step 4: Push Updated Workflow

Now push your code changes:

```powershell
git push origin main
```

## Step 5: Monitor Deployment

1. **Watch GitHub Actions**:

   - Go to: https://github.com/MIkhsanPasaribu/ititanix-recruitment/actions
   - Wait for workflow to complete (5-10 minutes)

2. **Check Azure Logs**:

   - Azure Portal → App Service → Log stream
   - Look for: "✓ Ready in XXXms"

3. **Test Application**:
   - Open: https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net
   - Should load without "Application Error"

## Expected Success Indicators

✅ **In Log Stream:**

```
✓ Starting...
✓ Ready in XXXms
- Local:        http://localhost:8080
```

✅ **In Browser:**

- Homepage loads correctly
- No "Application Error" message

## If Still Having Issues

1. **Check Deployment Center**:

   - Azure Portal → App Service → Deployment Center
   - Verify latest deployment succeeded

2. **Check File Structure** (Advanced Tools):

   - Azure Portal → App Service → Advanced Tools → Go
   - Click "Debug console" → CMD
   - Navigate to: `site/wwwroot`
   - Verify files exist:
     - ✅ server.js
     - ✅ .next/ folder
     - ✅ public/ folder
     - ✅ web.config
     - ✅ .deployment

3. **View Runtime Logs**:
   - Azure Portal → App Service → Diagnose and solve problems
   - Click "Application Logs"

## Settings Summary Screenshot Reference

Your Application Settings should look like:

| Name                           | Value        |
| ------------------------------ | ------------ |
| SCM_DO_BUILD_DURING_DEPLOYMENT | false        |
| WEBSITE_NODE_DEFAULT_VERSION   | 22-lts       |
| NODE_ENV                       | production   |
| PORT                           | 8080         |
| HOSTNAME                       | 0.0.0.0      |
| NEXT_PUBLIC_SUPABASE_URL       | (your value) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY  | (your value) |
| SUPABASE_SERVICE_ROLE_KEY      | (your value) |
| JWT_SECRET                     | (your value) |

**Startup Command**: `node server.js`

---

⏱️ **Estimated Time**: 5 minutes for Azure config + 10 minutes for deployment

🎯 **Success**: App loads at https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net
