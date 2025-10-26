#!/bin/bash

# FITON - Google Cloud Authentication Setup Script
# This script helps you set up authentication for the Virtual Try-On feature

echo "=========================================="
echo "FITON - Google Cloud Authentication Setup"
echo "=========================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "⚠️  gcloud CLI is not installed"
    echo ""
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    echo ""
    echo "Or use Homebrew:"
    echo "  brew install --cask google-cloud-sdk"
    exit 1
fi

echo "✅ gcloud CLI is installed"
echo ""

# Check current authentication status
echo "Checking authentication status..."
if gcloud auth application-default print-access-token &> /dev/null; then
    echo "✅ You are already authenticated!"
    echo ""
    echo "Current credentials location:"
    echo "  ~/.config/gcloud/application_default_credentials.json"
    echo ""
    
    # Show current project
    current_project=$(gcloud config get-value project 2>/dev/null)
    echo "Current project: $current_project"
    echo "Required project: fiton-476022"
    echo ""
    
    if [ "$current_project" != "fiton-476022" ]; then
        echo "⚠️  Warning: Current project doesn't match required project"
        echo ""
        read -p "Do you want to switch to project 'fiton-476022'? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gcloud config set project fiton-476022
            echo "✅ Project set to fiton-476022"
        fi
    fi
else
    echo "⚠️  Not authenticated yet"
    echo ""
    echo "Setting up Application Default Credentials..."
    echo ""
    echo "This will open a browser window for authentication."
    echo "Please sign in with your Google Cloud account."
    echo ""
    read -p "Press Enter to continue..."
    
    # Set project first
    gcloud config set project fiton-476022
    
    # Authenticate
    gcloud auth application-default login
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Authentication successful!"
    else
        echo ""
        echo "❌ Authentication failed"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "Testing the setup..."
echo "=========================================="
echo ""

# Test if credentials work
if gcloud auth application-default print-access-token &> /dev/null; then
    echo "✅ Credentials are valid"
    echo ""
    echo "Credentials location:"
    echo "  ~/.config/gcloud/application_default_credentials.json"
    echo ""
    echo "=========================================="
    echo "✅ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. The .NET server should automatically detect these credentials"
    echo "2. Restart your server if it's already running:"
    echo "   cd /Users/admin/Desktop/FITON/FITON.Server"
    echo "   dotnet run"
    echo "3. Test the Virtual Try-On feature in the app"
    echo ""
    echo "No need to set GOOGLE_APPLICATION_CREDENTIALS!"
    echo "The Application Default Credentials are ready to use."
    echo ""
else
    echo "❌ Credentials test failed"
    echo ""
    echo "Please try running manually:"
    echo "  gcloud auth application-default login"
    exit 1
fi
