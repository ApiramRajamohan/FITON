# FITON - Critical Issues Quick Fix Guide

## 🚨 IMMEDIATE FIXES REQUIRED

### 1. Fix .NET Version Mismatch (BLOCKING DEPLOYMENTS)

**Problem:** GitHub workflow uses .NET 7.0.x but project uses .NET 9.0

**Fix:** Update `.github/workflows/FITON.yml`

```yaml
# Change line 11 from:
DOTNET_CORE_VERSION: 7.0.x

# To:
DOTNET_CORE_VERSION: 9.0.x
```

**Command to fix:**
```bash
cd /Users/admin/Desktop/FITON
# Edit the workflow file and change the version
```

---

### 2. Secure Exposed Secrets (SECURITY CRITICAL)

**Problem:** Sensitive data exposed in `FITON.Server/appsettings.json`

**Current Exposed Data:**
- Database connection string with password
- JWT secret key
- Gemini API key

**Immediate Actions:**

#### Step 1: Create GitHub Secrets
Add these secrets to your GitHub repository:
```
DB_CONNECTION_STRING = Server=tcp:fiton2.database.windows.net,1433;Initial Catalog=fiton22;Persist Security Info=False;User ID=apiram;Password=4P!$Aja#222;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
JWT_SECRET = supersecretkey12345sdad212318da@212
JWT_ISSUER = yourapp
JWT_AUDIENCE = yourapp
GEMINI_API_KEY = AIzaSyBX1EFcwX5dQoJB2Hh4EhZ_m5iuZ3qwXVs
APP_SECRET = sew21e@ret*secrwdat123secret44wwda4
```

#### Step 2: Update appsettings.json
Replace sensitive values with placeholders:
```json
{
  "Gemini": {
    "ApiKey": "#{GEMINI_API_KEY}#"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "#{DB_CONNECTION_STRING}#"
  },
  "Jwt": {
    "Key": "#{JWT_SECRET}#",
    "Issuer": "#{JWT_ISSUER}#",
    "Audience": "#{JWT_AUDIENCE}#"
  },
  "Secret": "#{APP_SECRET}#"
}
```

#### Step 3: Update Dockerfile for Environment Variables
Add to Dockerfile before ENTRYPOINT:
```dockerfile
# Set environment variables for runtime
ENV GEMINI__APIKEY=""
ENV CONNECTIONSTRINGS__DEFAULTCONNECTION=""
ENV JWT__KEY=""
ENV JWT__ISSUER=""
ENV JWT__AUDIENCE=""
ENV SECRET=""
```

#### Step 4: Update GitHub Workflow
Add environment variables to deployment:
```yaml
- name: Deploy to Azure Container App
  run: |
    az containerapp update \
      --name fiton \
      --resource-group CSP \
      --image registryfiton.azurecr.io/fiton-server:${{ github.sha }} \
      --set-env-vars \
        GEMINI__APIKEY="${{ secrets.GEMINI_API_KEY }}" \
        CONNECTIONSTRINGS__DEFAULTCONNECTION="${{ secrets.DB_CONNECTION_STRING }}" \
        JWT__KEY="${{ secrets.JWT_SECRET }}" \
        JWT__ISSUER="${{ secrets.JWT_ISSUER }}" \
        JWT__AUDIENCE="${{ secrets.JWT_AUDIENCE }}" \
        SECRET="${{ secrets.APP_SECRET }}"
```

---

### 3. Add Testing to Pipeline

**Problem:** No automated testing in CI/CD

**Quick Fix:** Add testing step to workflow:

```yaml
# Add this step after "Setup .NET" and before "Login to Azure Container Registry"
- name: Run Tests
  run: |
    cd FITON.Tests
    dotnet test --configuration Release --no-restore --verbosity normal
```

---

### 4. Add Frontend Build Verification

**Problem:** Frontend build not verified in CI/CD

**Quick Fix:** Add frontend build step:

```yaml
# Add this step after "Setup .NET"
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'

- name: Build Frontend
  run: |
    cd fiton.client
    npm ci
    npm run build
```

---

## 🔧 Complete Updated Workflow File

Here's the complete corrected `.github/workflows/FITON.yml`:

```yaml
name: Build and Deploy FITON Container App

on:
  push:
    branches:
      - main
permissions:
  id-token: write      
  contents: read        

env:
  DOTNET_CORE_VERSION: 9.0.x  # FIXED: Changed from 7.0.x
  CONTAINER_APP_NAME: fiton
  CONTAINER_APP_ENVIRONMENT_NAME: FITON
  RESOURCE_GROUP: CSP
  CONTAINER_REGISTRY_NAME: registryfiton
  CONTAINER_REGISTRY_LOGIN_SERVER: registryfiton.azurecr.io
  IMAGE_NAME: fiton-server

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_CORE_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Restore .NET Dependencies
        run: |
          cd FITON.Server
          dotnet restore

      - name: Build Frontend
        run: |
          cd fiton.client
          npm ci
          npm run build

      - name: Run Tests
        run: |
          cd FITON.Tests
          dotnet test --configuration Release --no-restore --verbosity normal

      - name: Login to Azure Container Registry
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
          registry: ${{ env.CONTAINER_REGISTRY_LOGIN_SERVER }}

      - name: Build Docker image
        run: |
          docker build --no-cache -f FITON.Server/Dockerfile -t ${{ env.CONTAINER_REGISTRY_LOGIN_SERVER }}/${{ env.IMAGE_NAME }}:${{ github.sha }} .

      - name: Push Docker image to ACR
        run: |
          docker push ${{ env.CONTAINER_REGISTRY_LOGIN_SERVER }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Azure Login
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.FITON_AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.FITON_AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.FITON_AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Azure Container App
        run: |
          az containerapp update \
            --name fiton \
            --resource-group CSP \
            --image registryfiton.azurecr.io/fiton-server:${{ github.sha }} \
            --set-env-vars \
              GEMINI__APIKEY="${{ secrets.GEMINI_API_KEY }}" \
              CONNECTIONSTRINGS__DEFAULTCONNECTION="${{ secrets.DB_CONNECTION_STRING }}" \
              JWT__KEY="${{ secrets.JWT_SECRET }}" \
              JWT__ISSUER="${{ secrets.JWT_ISSUER }}" \
              JWT__AUDIENCE="${{ secrets.JWT_AUDIENCE }}" \
              SECRET="${{ secrets.APP_SECRET }}"
```

---

## ✅ Verification Steps

After implementing fixes:

1. **Test local build:**
   ```bash
   cd FITON.Server
   dotnet build
   ```

2. **Test frontend build:**
   ```bash
   cd fiton.client
   npm run build
   ```

3. **Test Docker build:**
   ```bash
   docker build -f FITON.Server/Dockerfile -t test-build .
   ```

4. **Push to main and monitor workflow**

---

## 🚨 Emergency Rollback

If deployment fails after changes:

```bash
# Get last working image tag
az containerapp revision list --name fiton --resource-group CSP

# Rollback to previous version
az containerapp revision set-mode --name fiton --resource-group CSP --mode single --revision [previous-revision-name]
```

---

*Priority: FIX IMMEDIATELY - These issues are blocking production deployments*