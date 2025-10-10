# FITON DevOps - Technical Runbook

## 🚨 Emergency Procedures

### Pipeline Failure Recovery
```bash
# Check pipeline status
gh workflow list
gh run list --workflow=FITON.yml

# Manual deployment if pipeline fails
cd /path/to/FITON
docker build -f FITON.Server/Dockerfile -t registryfiton.azurecr.io/fiton-server:emergency .
docker push registryfiton.azurecr.io/fiton-server:emergency

# Deploy emergency build
az containerapp update \
  --name fiton \
  --resource-group CSP \
  --image registryfiton.azurecr.io/fiton-server:emergency
```

### Database Connection Issues
```bash
# Test database connectivity
az sql db show --name fiton22 --server fiton2 --resource-group CSP

# Check connection strings in Key Vault (once configured)
az keyvault secret show --vault-name [vault-name] --name ConnectionString
```

### Container App Troubleshooting
```bash
# Check container app status
az containerapp show --name fiton --resource-group CSP

# View logs
az containerapp logs show --name fiton --resource-group CSP --follow

# Restart container app
az containerapp restart --name fiton --resource-group CSP
```

---

## 🔧 Common Maintenance Tasks

### Update Dependencies
```bash
# Backend dependencies
cd FITON.Server
dotnet list package --outdated
dotnet add package [PackageName] --version [Version]

# Frontend dependencies
cd fiton.client
npm audit
npm update
```

### Database Migrations
```bash
cd FITON.Server
dotnet ef migrations add [MigrationName]
dotnet ef database update
```

### Secrets Rotation
```bash
# Generate new JWT secret
openssl rand -base64 32

# Update in Azure Key Vault
az keyvault secret set --vault-name [vault] --name JwtSecret --value [new-secret]
```

---

## 📊 Monitoring Commands

### Health Checks
```bash
# Application health
curl https://fiton.azurecontainerapps.io/health

# Database health
az sql db show-usage --name fiton22 --server fiton2 --resource-group CSP
```

### Performance Monitoring
```bash
# Container resource usage
az containerapp show --name fiton --resource-group CSP --query "properties.template.scale"

# Database performance
az sql db show-usage --name fiton22 --server fiton2 --resource-group CSP
```

---

## 🛠️ Development Support

### Local Development Issues
```bash
# Reset local environment
cd FITON.Server
dotnet clean
dotnet restore
dotnet build

cd ../fiton.client
rm -rf node_modules package-lock.json
npm install
```

### Branch Management
```bash
# Create feature branch
git checkout dev
git pull origin dev
git checkout -b feature/[feature-name]

# Merge to dev
git checkout dev
git merge feature/[feature-name]
git push origin dev
```

---

## 🔒 Security Checklist

### Monthly Security Review
- [ ] Review exposed secrets in code
- [ ] Check dependency vulnerabilities
- [ ] Review Azure access logs
- [ ] Validate certificate expiration dates
- [ ] Check for unused Azure resources

### Incident Response
1. **Identify** the scope of the security issue
2. **Contain** by temporarily blocking affected systems
3. **Investigate** logs and access patterns
4. **Remediate** by applying fixes
5. **Document** lessons learned

---

## 📈 Scaling Guidelines

### Horizontal Scaling
```bash
# Scale container app
az containerapp update \
  --name fiton \
  --resource-group CSP \
  --min-replicas 2 \
  --max-replicas 10
```

### Database Scaling
```bash
# Scale database tier
az sql db update \
  --name fiton22 \
  --server fiton2 \
  --resource-group CSP \
  --service-objective S2
```

---

## 🏗️ Infrastructure as Code (Future)

### Recommended Tools
- **Bicep/ARM templates** for Azure resources
- **Terraform** for multi-cloud scenarios
- **Helm charts** for Kubernetes migration

### Current Manual Resources
```
Resource Group: CSP
Container Registry: registryfiton
Container App: fiton
SQL Server: fiton2
Database: fiton22
```

---

## 📞 Escalation Matrix

### Level 1: Application Issues
- Check application logs
- Restart container app
- Verify database connectivity

### Level 2: Infrastructure Issues
- Check Azure service status
- Review resource quotas
- Contact Azure support if needed

### Level 3: Security Incidents
- Follow incident response plan
- Contact security team
- Document all actions taken

---

## 🔄 Backup & Recovery

### Database Backups
```bash
# Manual backup
az sql db export \
  --admin-user apiram \
  --admin-password [password] \
  --storage-key [key] \
  --storage-key-type StorageAccessKey \
  --storage-uri https://[storage].blob.core.windows.net/backups/backup.bacpac \
  --name fiton22 \
  --server fiton2 \
  --resource-group CSP
```

### Application State Backup
- Container images are stored in ACR
- Configuration should be in version control
- Secrets should be in Key Vault

---

## 📋 Change Management

### Pre-deployment Checklist
- [ ] Code reviewed and approved
- [ ] Tests passing locally
- [ ] Database migration tested
- [ ] Rollback plan prepared
- [ ] Stakeholders notified

### Post-deployment Verification
- [ ] Application health check passes
- [ ] Key user journeys working
- [ ] No error spikes in logs
- [ ] Performance metrics normal
- [ ] Database connections stable

---

## 📚 Additional Resources

### Documentation Links
- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [.NET 9 Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [React Documentation](https://react.dev/)

### Useful Commands Reference
```bash
# Azure CLI login
az login

# Docker commands
docker ps
docker logs [container-id]
docker exec -it [container-id] /bin/bash

# Git commands
git status
git log --oneline -10
git branch -a
```

---

*Last Updated: October 10, 2025*  
*Next Review: [Set monthly review date]*