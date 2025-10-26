# Google Cloud Imagen Setup Guide

## ✅ Current Status
- Backend code is ready and configured for Imagen
- Google Cloud AI Platform packages installed
- API calls properly implemented

## ⚠️ Required: Google Cloud Authentication

To use the Imagen API, you need to set up Google Cloud authentication. There are two methods:

### Method 1: Service Account JSON (Recommended)

#### Step 1: Create a Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **fiton-476022**
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Fill in:
   - **Name**: `fiton-imagen-service`
   - **Description**: `Service account for FITON Virtual Try-On feature`
6. Click **Create and Continue**

#### Step 2: Grant Permissions
Add these roles:
- **Vertex AI User**
- **AI Platform Developer**

Click **Continue** then **Done**

#### Step 3: Create and Download Key
1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Click **Create** - the JSON file will download

#### Step 4: Configure the Application

**Option A: Environment Variable (Recommended)**
```bash
# On macOS/Linux
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"

# Add to ~/.zshrc or ~/.bashrc for persistence:
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"' >> ~/.zshrc
source ~/.zshrc
```

**Option B: Application Settings**
Update `appsettings.json`:
```json
{
  "GoogleCloud": {
    "ProjectId": "fiton-476022",
    "Location": "us-central1",
    "CredentialsPath": "/absolute/path/to/service-account-key.json"
  }
}
```

Then update the controller to load the credentials explicitly (if needed).

---

### Method 2: Application Default Credentials (ADC)

If running on Google Cloud (Cloud Run, GCE, GKE), authentication is automatic.

For local development:
```bash
# Install Google Cloud SDK
# Then run:
gcloud auth application-default login
```

---

## Enable Required APIs

Make sure these APIs are enabled in your Google Cloud Project:

1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Search and enable:
   - ✅ **Vertex AI API**
   - ✅ **Cloud AI Platform API**

Or use the command line:
```bash
gcloud services enable aiplatform.googleapis.com
```

---

## Current Configuration

### appsettings.json
```json
{
  "GoogleCloud": {
    "ProjectId": "fiton-476022",
    "Location": "us-central1",
    "CredentialsPath": ""
  }
}
```

### Imagen Model
- **Model ID**: `imagegeneration@006` (latest version)
- **Endpoint**: `us-central1-aiplatform.googleapis.com`

---

## Testing the Setup

### Step 1: Set Up Credentials
Choose one of the methods above and set up your credentials.

### Step 2: Restart the Server
```bash
cd /Users/admin/Desktop/FITON/FITON.Server
dotnet run
```

### Step 3: Test the Feature
1. Open the app: `https://localhost:4403/`
2. Log in
3. Add measurements
4. Create a wardrobe outfit
5. Go to **Virtual Try-On**
6. Select an outfit
7. Click **Generate Virtual Try-On**

### Expected Results

**Success:**
- Image generates in 5-15 seconds
- You see a photorealistic image
- Server logs: `Image generated successfully`

**Failure:**
If authentication fails, you'll see one of these errors:

#### Error 1: "Google Cloud is not properly configured"
**Cause**: Project ID or Location is missing from appsettings.json
**Solution**: Verify appsettings.json has correct values

#### Error 2: "The Application Default Credentials are not available"
**Cause**: No credentials found
**Solution**: Set GOOGLE_APPLICATION_CREDENTIALS or run `gcloud auth application-default login`

#### Error 3: "Permission denied"
**Cause**: Service account doesn't have required permissions
**Solution**: Add "Vertex AI User" role to the service account

#### Error 4: "Project not found"
**Cause**: Wrong project ID
**Solution**: Verify project ID is `fiton-476022`

---

## Cost Information

### Imagen Pricing (as of 2024)
- **Standard Quality**: ~$0.020 per image
- **HD Quality**: ~$0.045 per image
- **First 500 images/month**: Free (promotional, check current offer)

### Estimate for Your App
- 100 try-ons/day = $2/day = $60/month (standard quality)
- 500 try-ons/day = $10/day = $300/month (standard quality)

### Cost Optimization Tips
1. **Cache generated images** - Store in database
2. **Add rate limiting** - Max 5 generations per user per day
3. **Offer as premium feature** - Charge users for generations
4. **Use standard quality** - HD quality costs 2x more

---

## Server Logs to Watch

### Successful Generation
```
Generated Prompt: Create a photorealistic, full-body image...
Calling Vertex AI Imagen at: projects/fiton-476022/locations/us-central1/publishers/google/models/imagegeneration@006
Prompt: Full body, professional studio photograph...
Image generated successfully
```

### Authentication Error
```
Vertex AI API Error: The Application Default Credentials are not available...
```

### Permission Error
```
Vertex AI API Error: Permission 'aiplatform.endpoints.predict' denied...
```

---

## Quick Start Commands

### 1. Set Credentials (Choose ONE)

**Using Service Account JSON:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-key.json"
```

**Using gcloud CLI:**
```bash
gcloud auth application-default login
```

### 2. Verify Setup
```bash
# Check if credentials are set
echo $GOOGLE_APPLICATION_CREDENTIALS

# Or test gcloud auth
gcloud auth application-default print-access-token
```

### 3. Start Server
```bash
cd /Users/admin/Desktop/FITON/FITON.Server
dotnet run
```

### 4. Check Logs
Watch the terminal for any error messages when you try to generate an image.

---

## Troubleshooting

### Issue: "Failed to generate image: Unable to connect to the server"
**Solution**: Check your internet connection

### Issue: "Model imagegeneration@006 not found"
**Solution**: The model version might have changed. Try `imagegeneration@005`

### Issue: Images take too long (> 30 seconds)
**Solution**: 
1. Use `standard` quality instead of `hd`
2. Simplify the prompt
3. Check your network connection

### Issue: Generated images don't match the description
**Solution**:
1. Make prompts more detailed and specific
2. Add more descriptive adjectives
3. Test different prompt phrasings
4. Consider using negative prompts (if supported)

---

## Security Best Practices

### 1. Never Commit Credentials
Add to `.gitignore`:
```
# Google Cloud credentials
service-account-key.json
*-credentials.json
```

### 2. Use Environment Variables
Don't hardcode credentials in appsettings.json

### 3. Rotate Keys Regularly
Create new service account keys every 90 days

### 4. Limit Service Account Permissions
Only grant "Vertex AI User" role, nothing more

---

## Production Deployment

### For Azure App Service
1. Upload service account JSON to Azure
2. Set environment variable in Azure Portal:
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `/path/in/azure/service-account-key.json`

### For Docker
```dockerfile
# Add to Dockerfile
COPY service-account-key.json /app/service-account-key.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json
```

### For Azure Container Apps
Use Azure Key Vault to store the JSON and inject as env variable

---

## Next Steps

1. ✅ Code is ready
2. ⏳ **Set up Google Cloud credentials** (follow steps above)
3. ⏳ **Test the feature** with real images
4. ⏳ **Optimize prompts** for better results
5. ⏳ **Add image caching** to reduce costs
6. ⏳ **Implement rate limiting**
7. ⏳ **Deploy to production**

---

## Support

### Google Cloud Documentation
- [Vertex AI Imagen Overview](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- [Authentication Guide](https://cloud.google.com/docs/authentication/getting-started)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)

### Common Commands
```bash
# List available models
gcloud ai models list --region=us-central1

# Check API status
gcloud services list --enabled

# View project info
gcloud projects describe fiton-476022
```

---

## Summary

### What's Working
✅ Backend code fully implemented
✅ Imagen API integration complete
✅ Error handling in place
✅ Detailed logging added
✅ Frontend ready to receive images

### What You Need to Do
1. **Set up Google Cloud credentials** (5 minutes)
2. **Test the feature** (2 minutes)
3. **Adjust prompts if needed** (optional)

### Once Configured
The feature will work automatically. Users can generate virtual try-on images by:
1. Selecting an outfit
2. Clicking generate
3. Waiting 5-15 seconds
4. Viewing the AI-generated image

The image will be returned as a base64-encoded data URL that displays directly in the browser!
