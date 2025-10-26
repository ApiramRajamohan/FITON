# FITON Virtual Try-On - Complete Setup Guide

## Current Status
❌ **Error:** "Your default credentials were not found"
✅ **Solution:** Install gcloud CLI and authenticate (5 minutes)

---

## Step-by-Step Fix

### Step 1: Install Google Cloud SDK

**Using Homebrew (Recommended):**
```bash
brew install --cask google-cloud-sdk
```

**Or Download Installer:**
1. Go to: https://cloud.google.com/sdk/docs/install
2. Download the macOS installer
3. Run the installer
4. Follow the prompts

**After Installation:**
```bash
# Initialize gcloud
gcloud init
```

---

### Step 2: Authenticate with Google Cloud

```bash
# Set your project
gcloud config set project fiton-476022

# Authenticate (this will open your browser)
gcloud auth application-default login
```

**What happens:**
1. Browser opens
2. Sign in with your Google account (the one with access to fiton-476022)
3. Grant permissions
4. Credentials saved automatically to:
   `~/.config/gcloud/application_default_credentials.json`

---

### Step 3: Verify Setup

```bash
# Check if authentication worked
gcloud auth application-default print-access-token
```

If you see a long token string, **you're authenticated!** ✅

---

### Step 4: Restart Your Server

```bash
cd /Users/admin/Desktop/FITON/FITON.Server
dotnet run
```

---

### Step 5: Test Virtual Try-On

1. Open app: `https://localhost:4403/`
2. Log in
3. Go to Virtual Try-On
4. Select an outfit
5. Click "Generate Virtual Try-On"
6. **Wait 5-15 seconds**
7. **See your AI-generated image!** 🎉

---

## Alternative: Service Account JSON (Advanced)

If you prefer using a service account key file:

### 1. Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin > Service Accounts
3. Create service account with "Vertex AI User" role
4. Create and download JSON key

### 2. Set Environment Variable
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-key.json"

# Make it permanent:
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-key.json"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Restart Server
```bash
cd /Users/admin/Desktop/FITON/FITON.Server
dotnet run
```

---

## Expected Behavior After Setup

### ✅ Success Logs
```
Generated Prompt: Full body, professional studio photograph of a person...
Calling Vertex AI Imagen at: projects/fiton-476022/locations/us-central1/publishers/google/models/imagegeneration@006
Image generated successfully
```

### ✅ User Experience
- User selects outfit
- Clicks generate
- Sees loading spinner
- **Real AI-generated image appears in 5-15 seconds**
- Image shows person wearing the selected outfit
- Based on their body measurements
- Photorealistic quality

---

## Troubleshooting

### Error: "gcloud: command not found"
**Fix:** Install Google Cloud SDK (see Step 1)

### Error: "Project fiton-476022 not found"
**Fix 1:** Verify you're signed in with the correct Google account
**Fix 2:** Check project permissions in Google Cloud Console

### Error: "Permission denied"
**Fix:** Make sure your account has "Vertex AI User" role in the project

### Error: "API not enabled"
**Fix:** Enable Vertex AI API:
```bash
gcloud services enable aiplatform.googleapis.com
```

---

## Cost Information

- **Per Image:** ~$0.02 (standard quality)
- **Generation Time:** 5-15 seconds
- **Free Tier:** First 500 images may be free
- **Monthly Examples:**
  - 10 images/day = ~$6/month
  - 50 images/day = ~$30/month

---

## Quick Reference

### Install gcloud
```bash
brew install --cask google-cloud-sdk
```

### Authenticate
```bash
gcloud config set project fiton-476022
gcloud auth application-default login
```

### Verify
```bash
gcloud auth application-default print-access-token
```

### Restart Server
```bash
cd /Users/admin/Desktop/FITON/FITON.Server
dotnet run
```

### Test
Open: `https://localhost:4403/virtual-try-on`

---

## Summary

✅ **What You Need to Do:**
1. Install gcloud CLI (2 minutes)
2. Run `gcloud auth application-default login` (1 minute)
3. Restart server (30 seconds)
4. Test the feature (30 seconds)

✅ **Total Time:** ~5 minutes

✅ **After Setup:**
- Authentication persists
- No need to repeat
- Works automatically
- Real AI image generation! 🚀

---

## Next Steps

1. **Install gcloud:**
   ```bash
   brew install --cask google-cloud-sdk
   ```

2. **Authenticate:**
   ```bash
   gcloud auth application-default login
   ```

3. **Test:**
   Restart server and try Virtual Try-On!

---

## Need Help?

- **Google Cloud Docs:** https://cloud.google.com/docs/authentication
- **gcloud Install Guide:** https://cloud.google.com/sdk/docs/install
- **Vertex AI Docs:** https://cloud.google.com/vertex-ai/docs

---

## That's It!

Once you complete the authentication, the Virtual Try-On feature will generate real AI images automatically. No code changes needed! 🎉
