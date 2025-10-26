# Quick Fix: Google Cloud Authentication

## The Error You're Seeing
```
Your default credentials were not found. To set up Application Default Credentials, 
see https://cloud.google.com/docs/authentication/external/set-up-adc.
```

## Solution (2 Minutes)

### Option 1: Automated Setup (Easiest)

Run the setup script:
```bash
cd /Users/admin/Desktop/FITON
./setup-google-auth.sh
```

This will:
1. Check if gcloud is installed
2. Guide you through authentication
3. Set up the correct project
4. Test your credentials

### Option 2: Manual Setup (If script doesn't work)

**Step 1: Install gcloud CLI (if not installed)**
```bash
brew install --cask google-cloud-sdk
```

**Step 2: Authenticate**
```bash
gcloud config set project fiton-476022
gcloud auth application-default login
```

This will:
- Open your browser
- Ask you to sign in with Google
- Save credentials to `~/.config/gcloud/application_default_credentials.json`

**Step 3: Restart your server**
```bash
cd /Users/admin/Desktop/FITON/FITON.Server
dotnet run
```

## What Happens After Authentication

✅ **Before:** Error about missing credentials
✅ **After:** Image generation works automatically

The .NET application will automatically find and use the credentials from:
```
~/.config/gcloud/application_default_credentials.json
```

## Testing

1. Complete authentication (above)
2. Restart server: `dotnet run`
3. Go to Virtual Try-On page
4. Select an outfit
5. Click "Generate Virtual Try-On"
6. Wait 5-15 seconds
7. **See your AI-generated image!**

## Troubleshooting

### "gcloud: command not found"
**Solution:** Install Google Cloud SDK
```bash
brew install --cask google-cloud-sdk
# Then run the authentication commands
```

### "Permission denied"
**Solution:** Make sure you're using the correct Google account that has access to project `fiton-476022`

### "Project not found"
**Solution:** Verify the project ID is correct:
```bash
gcloud projects list
# Look for fiton-476022
```

## Expected Server Logs After Fix

```
Generated Prompt: Full body, professional studio photograph...
Calling Vertex AI Imagen at: projects/fiton-476022/locations/us-central1/...
Image generated successfully
```

## No Restart Needed!

Once you authenticate:
- Credentials persist
- Work across reboots
- Valid until you logout
- Server automatically detects them

## One-Time Setup

You only need to do this ONCE. After authentication:
- ✅ Works forever (until you logout)
- ✅ No environment variables needed
- ✅ Automatic detection by Google libraries
- ✅ Secure credential storage

---

## Quick Command Summary

```bash
# Install gcloud (if needed)
brew install --cask google-cloud-sdk

# Authenticate
gcloud config set project fiton-476022
gcloud auth application-default login

# Restart server
cd /Users/admin/Desktop/FITON/FITON.Server
dotnet run

# That's it! 🎉
```

---

## Ready in 2 Minutes!

Run these 3 commands and you're done:
```bash
gcloud config set project fiton-476022
gcloud auth application-default login
dotnet run
```

The Virtual Try-On feature will start working immediately! 🚀
