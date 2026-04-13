# SkillBridge Backend Azure Deployment Checklist

## ✅ Completed by Developer

- [x] Certificate PDF/preview mismatch fixed (DOM-to-PDF capture)
- [x] GitHub Actions CI/CD workflow created (.github/workflows/deploy.yml)
- [x] Removed broken OIDC-based workflows
- [x] Fixed Prisma postinstall Azure errors (.npmrc, conditional hooks, deploy.sh)
- [x] Backend port configured to 5000
- [x] Frontend build validated (✓ Compiled successfully)
- [x] Backend build validated (✓ Prisma generated)
- [x] Both commits pushed to GitHub main branch
- [x] Azure Stack Settings configured (Node 20 LTS, npm start)

## ⏳ Remaining: User Must Complete in Azure Portal

### Step 1: Add Application Settings
Go to **Azure Portal** → **skillbrize** App Service → **Settings** → **Configuration** → **Application settings**

Click **+ New application setting** and add these (one by one):

| Name | Value | Source |
|------|-------|--------|
| `NODE_ENV` | `production` | Fixed value |
| `FRONTEND_URL` | `https://yourfrontend.com` OR `http://localhost:3000` | Update as needed |
| `DATABASE_URL` | From backend/.env (postgresql://...) | Copy from .env |
| `JWT_SECRET` | From backend/.env | Copy from .env |
| `JWT_RESET_SECRET` | From backend/.env | Copy from .env |
| `JWT_VERIFY_EMAIL_SECRET` | From backend/.env | Copy from .env |
| `RAZORPAY_KEY_ID` | From backend/.env | Copy from .env |
| `RAZORPAY_KEY_SECRET` | From backend/.env | Copy from .env |
| `EMAIL_USER` | From backend/.env | Copy from .env |
| `EMAIL_PASS` | From backend/.env | Copy from .env |

### Step 2: Save Settings
Click **Save** at the top of the Configuration page.

Azure will restart your app automatically (may take 30-60 seconds).

### Step 3: Verify Deployment
1. Check **Health check** section → should show **Healthy** ✅
2. Check **Overview** → "Stopped" should change to "Running"
3. Check **Log Stream** → should show `SkillBridge API listening on 0.0.0.0:5000`

### Step 4: Test API
Make a request to: `https://skillbrize.azurewebsites.net/health`

Should return: `200 OK` with health data

## 🎯 What Happens Next

1. **GitHub Push** → Triggers GitHub Actions workflow automatically
2. **Workflow runs** →
   - Checks out code from main
   - Installs dependencies (NODE_ENV=development)
   - Builds (generates Prisma client)
   - Deploys to Azure using publish-profile secret
3. **Azure restarts app** → Runs deploy.sh script which:
   - Installs prod dependencies (--no-scripts flag)
   - Generates Prisma client again
   - Starts npm start
4. **App is live** → Accessible at `https://skillbrize.azurewebsites.net`

## ⚠️ Troubleshooting

**Health check shows "Stopped":**
- Check Application Settings were saved
- Check no typos in env var names
- Restart app via Portal

**Getting "Container did not start within 230s":**
- Check DATABASE_URL is correct
- Check all JWT secrets are filled in
- Check Email credentials are valid

**Postgres connection timeouts:**
- Verify DATABASE_URL allows connections from Azure
- Check Neon/PostgreSQL firewall rules

## 📋 GitHub Actions Secret Required

You also need to add ONE secret in GitHub:

Go to: **GitHub repo** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

- **Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`
- **Value:** Contents of your Azure App Service publish profile XML file

(Download from Azure Portal → App Service → Get publish profile)

## ✨ After Completion

Once Application Settings are added and app shows "Healthy" and "Running":
- Backend API is live on Azure ✅
- GitHub Actions will auto-deploy on every push to main ✅
- Certificate PDF/preview now perfectly matched ✅
- All CI/CD is automated ✅

**Questions?** Check logs in Azure Portal → Log Stream for error details.
