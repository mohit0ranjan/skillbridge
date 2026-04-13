#!/bin/bash
# Azure App Service Application Settings Setup Script
# This script documents the exact settings needed for the SkillBridge backend
# Run this as a reference when adding settings in Azure Portal

# NOTE: You cannot run this script directly - Azure Portal doesn't accept automated CLI setup
# without additional authentication. This is provided as a reference for manual entry.

# Install Azure CLI if needed: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# Option 1: Using Azure CLI (requires authentication)
# Uncomment and customize these commands if you have Azure CLI installed locally

# az login
# az webapp config appsettings set --resource-group "your-resource-group" --name "skillbrize" --settings \
#   NODE_ENV="production" \
#   FRONTEND_URL="http://localhost:3000" \
#   DATABASE_URL="postgresql://neondb_owner:npg_HWiRUo0r1gmI@ep-delicate-water-amvcyw1x-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
#   JWT_SECRET="YcF5i2qzFTNje3RhFHPoe1Uf1MFMmEq7J8k4xEjNADn" \
#   JWT_RESET_SECRET="Rk9pXmT2LwVnQ8dHjB3sYeA6uZcFgI0oNxW7rU5lKbMh" \
#   JWT_VERIFY_EMAIL_SECRET="Ev4mJqD9aXsP1hLkN6wC0tRyG8fZbU2oI3eVxMjS5rWn" \
#   RAZORPAY_KEY_ID="rzp_test_SbtFr7pwkrPTMr" \
#   RAZORPAY_KEY_SECRET="3vCFhl5U26iZoYfy1paAXdV5" \
#   EMAIL_USER="ytmohitranjan@gmail.com" \
#   EMAIL_PASS="fcicuocpqkpesqta"

# Option 2: Manual entry in Azure Portal (recommended for security)
# Follow these steps in Azure Portal:
# 1. Navigate to: Azure App Service > skillbrize > Configuration > Application settings
# 2. Click "+ New application setting"
# 3. Enter each setting below one by one
# 4. Click Save at the top

echo "SkillBridge Backend - Required Application Settings"
echo "=================================================="
echo ""
echo "Add these settings to Azure App Service > Configuration > Application settings:"
echo ""
echo "1. NODE_ENV = production"
echo "2. FRONTEND_URL = http://localhost:3000"
echo "3. DATABASE_URL = postgresql://neondb_owner:npg_HWiRUo0r1gmI@ep-delicate-water-amvcyw1x-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo "4. JWT_SECRET = YcF5i2qzFTNje3RhFHPoe1Uf1MFMmEq7J8k4xEjNADn"
echo "5. JWT_RESET_SECRET = Rk9pXmT2LwVnQ8dHjB3sYeA6uZcFgI0oNxW7rU5lKbMh"
echo "6. JWT_VERIFY_EMAIL_SECRET = Ev4mJqD9aXsP1hLkN6wC0tRyG8fZbU2oI3eVxMjS5rWn"
echo "7. RAZORPAY_KEY_ID = rzp_test_SbtFr7pwkrPTMr"
echo "8. RAZORPAY_KEY_SECRET = 3vCFhl5U26iZoYfy1paAXdV5"
echo "9. EMAIL_USER = ytmohitranjan@gmail.com"
echo "10. EMAIL_PASS = fcicuocpqkpesqta"
echo ""
echo "After adding all settings:"
echo "1. Click Save at the top of the Configuration page"
echo "2. Azure will restart your app (30-60 seconds)"
echo "3. Check Health check section - should show Healthy ✓"
echo "4. Test: curl https://skillbrize.azurewebsites.net/health"
echo ""
echo "Setup complete!"
