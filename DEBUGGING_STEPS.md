# Debugging White Screen Issue

## Issue
The application shows a white/empty page when running.

## Fixes Applied

### 1. Fixed VirtualTryOnPage.jsx Import Path
**Problem**: Importing from wrong path
```javascript
// ❌ Wrong
import api from '../../services/api';

// ✅ Correct  
import api from '../../utils/api';
```

### 2. Fixed API Endpoint URLs
**Problem**: Double `/api` in URLs
```javascript
// ❌ Wrong (baseURL already has /api)
await api.get('/api/wardrobe');
await api.get('/api/avatar/measurements/retrieve');
await api.post('/api/virtual-try-on/generate', ...);

// ✅ Correct
await api.get('/wardrobe');
await api.get('/avatar/measurements/retrieve');
await api.post('/virtual-try-on/generate', ...);
```

## How to Debug

### Step 1: Check Browser Console
1. Open the app in browser: https://localhost:4404/
2. Open DevTools (F12 or Right-click → Inspect)
3. Go to Console tab
4. Look for any red error messages

### Step 2: Check Network Tab
1. Open DevTools Network tab
2. Refresh the page
3. Check if JavaScript files are loading
4. Look for failed requests (red)

### Step 3: Common White Screen Causes

#### A. JavaScript Runtime Error
- **Symptom**: Console shows error
- **Solution**: Fix the error in the component

#### B. Import Error
- **Symptom**: "Failed to resolve module" or "Cannot find module"
- **Solution**: Check all import paths are correct

#### C. CSS Not Loading
- **Symptom**: Content visible but unstyled
- **Solution**: Check if Tailwind CSS is compiling

#### D. Backend Not Running
- **Symptom**: Network errors in console
- **Solution**: Start the backend server

### Step 4: Start Both Servers

#### Backend (Terminal 1)
```bash
cd /Users/admin/Desktop/FITON/FITON.Server
dotnet run
```
Expected: Server running on http://localhost:5230

#### Frontend (Terminal 2)
```bash
cd /Users/admin/Desktop/FITON/fiton.client
npm run dev
```
Expected: Vite server running on https://localhost:4404/

### Step 5: Test the App
1. Navigate to: https://localhost:4404/
2. You should see the login page
3. If still white screen, check console for errors

## Quick Test Commands

### Kill processes on ports (if ports are in use)
```bash
# Kill process on port 5230 (backend)
lsof -ti:5230 | xargs kill -9

# Kill process on port 4404 (frontend)
lsof -ti:4404 | xargs kill -9
```

### Check what's running on ports
```bash
lsof -i:5230  # Backend
lsof -i:4404  # Frontend
```

### Rebuild Frontend
```bash
cd /Users/admin/Desktop/FITON/fiton.client
rm -rf node_modules
npm install
npm run dev
```

## Specific Errors to Look For

### Console Errors:
1. **"useAuth must be used within an AuthProvider"**
   - Check App.jsx wraps everything in AuthProvider

2. **"Cannot read properties of undefined"**
   - Check component props and state initialization

3. **"Failed to fetch"**
   - Backend not running or wrong URL

4. **Module resolution errors**
   - Import paths incorrect

### Network Errors:
1. **401 Unauthorized**
   - Token issues (normal on first load, should redirect to login)

2. **404 Not Found**
   - API endpoint doesn't exist

3. **500 Server Error**
   - Backend error, check server console

## Most Likely Cause

Based on the fixes applied, the white screen was likely caused by:
1. **Import error** in VirtualTryOnPage (importing from wrong path)
2. **Module resolution failure** preventing the app from loading

The fixes should resolve the white screen. If it persists:
1. Check browser console for the specific error
2. Temporarily comment out the VirtualTryOnPage import in App.jsx
3. Test if other pages load correctly

## Test Without Virtual Try-On

If you want to temporarily disable the Virtual Try-On feature to test:

```jsx
// In App.jsx, comment out these lines:
// import { VirtualTryOnPage } from './components/virtualtryon/VirtualTryOnPage';

// And comment out this route:
/*
<Route
  path="/virtual-try-on"
  element={
    <ProtectedRoute>
      <VirtualTryOnPage />
    </ProtectedRoute>
  }
/>
*/
```

This will help identify if the Virtual Try-On component is causing the issue.
