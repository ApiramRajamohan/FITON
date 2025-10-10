# FITON Project - DevOps Handover Document

## 📋 Project Overview

**Project Name:** FITON  
**Repository:** https://github.com/ApiramRajamohan/FITON  
**Current Branch:** dev (main development branch)  
**Technology Stack:** .NET 9 (Backend) + React/Vite (Frontend)  
**Deployment Platform:** Azure Container Apps  
**Date of Handover:** October 10, 2025

---

## 🏗️ Architecture Overview

### Application Components
```
FITON/
├── FITON.Server/          # .NET 9 Web API Backend
├── fiton.client/          # React/Vite Frontend
├── FITON.Tests/           # Unit Tests (xUnit)
└── .github/workflows/     # CI/CD Pipeline
```

### Technology Stack
- **Backend:** .NET 9.0, Entity Framework Core, JWT Authentication
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Radix UI
- **Database:** Azure SQL Database
- **Container Registry:** Azure Container Registry (registryfiton.azurecr.io)
- **Hosting:** Azure Container Apps
- **CI/CD:** GitHub Actions

---

## 🚀 Current CI/CD Pipeline Status

### Pipeline Configuration
- **File:** `.github/workflows/FITON.yml`
- **Trigger:** Push to `main` branch
- **Current Status:** ⚠️ **PARTIALLY WORKING - NEEDS FIXES**

### Known Issues (CRITICAL - FIX IMMEDIATELY)

#### 1. Version Mismatch (BLOCKING DEPLOYMENT)
```yaml
# Current (WRONG):
env:
  DOTNET_CORE_VERSION: 7.0.x

# Should be:
env:
  DOTNET_CORE_VERSION: 9.0.x
```

#### 2. Security Vulnerabilities
- **CRITICAL:** Sensitive data exposed in `FITON.Server/appsettings.json`
- Database credentials, JWT secrets, and API keys are hardcoded
- **Action Required:** Move to Azure Key Vault or GitHub Secrets

#### 3. Missing Pipeline Components
- No automated testing in CI/CD
- No frontend build verification
- No security scanning
- No code quality checks

---

## 🔧 Current Infrastructure

### Azure Resources
- **Resource Group:** CSP
- **Container Registry:** registryfiton.azurecr.io
- **Container App:** fiton
- **Environment:** FITON
- **Database:** Azure SQL (fiton2.database.windows.net)

### Required Secrets (GitHub Repository Secrets)
```
ACR_USERNAME                    # Azure Container Registry Username
ACR_PASSWORD                    # Azure Container Registry Password
FITON_AZURE_CLIENT_ID          # Azure Service Principal Client ID
FITON_AZURE_TENANT_ID          # Azure Tenant ID
FITON_AZURE_SUBSCRIPTION_ID    # Azure Subscription ID
```

---

## 📂 Branch Strategy

### Current Branch Structure
```
main                    # Production branch (deploys to Azure)
├── dev                # Main development branch ⭐ ACTIVE
├── clothes            # Feature: Wardrobe/Clothes functionality
├── wardrobe           # Legacy wardrobe implementation
├── avatar-generate    # Feature: Avatar generation
├── measurements_input # Feature: Measurements input
└── [other features]   # Various feature branches
```

### Recent Development Activity
```
fdfc897 - clothes done
545d186 - change feature name wardrobe to clothes
f85b061 - Merge pull request #9 D J N Dissanayaka
```

---

## 🛠️ Development Workflow

### Local Development Setup
```bash
# Backend Setup
cd FITON.Server
dotnet restore
dotnet run

# Frontend Setup
cd fiton.client
npm install
npm run dev
```

### Docker Development
```bash
# Build container
docker build -f FITON.Server/Dockerfile -t fiton-app .

# Run container
docker run -p 8080:8080 fiton-app
```

---

## 🧪 Testing Strategy

### Current Test Setup
- **Framework:** xUnit
- **Location:** `FITON.Tests/`
- **Coverage:** Basic controller tests
- **Status:** ⚠️ Not integrated in CI/CD pipeline

### Test Files
```
FITON.Tests/
├── AuthControllerTests.cs
├── AuthControllerJwtTests.cs
└── UnitTest1.cs
```

---

## 🔒 Security Considerations

### Current Security Issues
1. **Exposed Secrets** in appsettings.json:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=tcp:fiton2.database.windows.net,1433;..."
     },
     "Jwt": {
       "Key": "supersecretkey12345sdad212318da@212"
     }
   }
   ```

2. **Missing Security Scanning** in pipeline
3. **No dependency vulnerability checks**

### Recommended Security Improvements
- Implement Azure Key Vault integration
- Add Dependabot for dependency updates
- Add SAST/DAST scanning in pipeline
- Implement proper secrets rotation

---

## 📊 Monitoring & Logging

### Current State
- **Application Insights:** Not configured
- **Logging:** Basic ASP.NET Core logging
- **Monitoring:** Manual Azure portal checks

### Recommended Improvements
- Set up Application Insights
- Configure structured logging
- Implement health checks
- Set up alerts for critical failures

---

## 🚨 Immediate Action Items (Priority Order)

### 🔥 CRITICAL (Fix Today)
1. **Fix .NET version mismatch** in GitHub workflow
2. **Secure exposed secrets** in appsettings.json
3. **Test current deployment pipeline**

### ⚠️ HIGH (This Week)
1. Add automated testing to CI/CD pipeline
2. Implement proper secret management
3. Add frontend build verification to pipeline
4. Set up Application Insights monitoring

### 📈 MEDIUM (Next Sprint)
1. Add security scanning (SAST/DAST)
2. Implement dependency vulnerability scanning
3. Add code quality gates
4. Set up staging environment

---

## 📞 Key Contacts & Resources

### Azure Resources
- **Subscription:** [Subscription ID from secrets]
- **Resource Group:** CSP
- **Region:** [Document current region]

### Third-Party Services
- **Google AI (Gemini):** Used for AI features
- **Azure SQL:** Database hosting

### Documentation
- **API Documentation:** [Add Swagger/OpenAPI link if available]
- **Database Schema:** Check `FITON.Server/Migrations/` for current schema

---

## 🔄 Deployment Process

### Current Deployment Flow
```
1. Push to main branch
2. GitHub Actions triggers
3. Build .NET application
4. Build Docker image
5. Push to Azure Container Registry
6. Deploy to Azure Container Apps
```

### Manual Deployment (Emergency)
```bash
# Build and push manually
docker build -f FITON.Server/Dockerfile -t registryfiton.azurecr.io/fiton-server:manual .
docker push registryfiton.azurecr.io/fiton-server:manual

# Deploy via Azure CLI
az containerapp update \
  --name fiton \
  --resource-group CSP \
  --image registryfiton.azurecr.io/fiton-server:manual
```

---

## 🏁 Next Steps for New DevOps Engineer

### Week 1 Priorities
1. **Fix the version mismatch** - this is blocking deployments
2. **Review and secure all secrets**
3. **Test the full deployment pipeline**
4. **Document any missing configurations**

### Week 2 Priorities
1. **Add comprehensive testing to pipeline**
2. **Set up proper monitoring**
3. **Implement security scanning**

### Month 1 Goals
1. **Establish staging environment**
2. **Implement proper RBAC**
3. **Set up disaster recovery plan**
4. **Create runbooks for common issues**

---

## 📝 Notes from Previous DevOps Engineer

### What's Working Well
- Docker containerization is solid
- Azure integration is mostly configured
- Development team follows feature branch workflow

### Known Pain Points
- Frontend and backend dependency management can be tricky
- Azure costs need monitoring
- Some developers bypass the normal git flow

### Recommendations
- Consider implementing branch protection rules
- Set up automated cost alerts in Azure
- Regular security reviews should be scheduled monthly

---

## 📧 Contact Information

**Previous DevOps Engineer:** [Your contact information]  
**Handover Date:** October 10, 2025  
**Emergency Contact:** [Backup contact for critical issues]

---

*This document should be updated regularly as the infrastructure evolves. Next review date: [Set date]*