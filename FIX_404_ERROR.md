# Fix 404 Error for Attender Endpoints

## Problem
Getting 404 error when accessing `/api/v1/attender/staff`:
```
[AllExceptionsFilter] GET /api/v1/attender/staff - 404
```

## Root Cause
The backend process is running an old version of the code. The AttenderModule was added but the backend hasn't been restarted with the new code.

## Solution

### Step 1: Stop the Backend
If the backend is running, stop it:
```bash
# Press Ctrl+C in the terminal where backend is running
```

### Step 2: Clean Build
```bash
cd backend-hostel-management

# Remove old build
rm -rf dist

# Clean install
npm install

# Build fresh
npm run build
```

### Step 3: Start Backend
```bash
npm run start:dev
```

### Step 4: Verify
Check the logs for:
```
[Nest] 12345  - 05/02/2026, 3:05:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [InstanceLoader] AttenderModule dependencies initialized
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutesResolver] AttenderController {/attender}:
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff, post} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff, get} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff/:id, get} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff/:id, put} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff/:id, delete} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff/:id/toggle-status, put} route
```

### Step 5: Test Endpoint
```bash
curl -X GET http://localhost:3001/api/v1/attender/staff \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "message": "Attenders fetched successfully",
  "data": []
}
```

---

## Detailed Steps for Windows

### Using PowerShell

```powershell
# 1. Navigate to backend
cd backend-hostel-management

# 2. Stop any running process (if needed)
# Press Ctrl+C in the terminal

# 3. Clean build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm install
npm run build

# 4. Start backend
npm run start:dev

# 5. In another terminal, test
curl -X GET http://localhost:3001/api/v1/attender/staff `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Command Prompt

```cmd
# 1. Navigate to backend
cd backend-hostel-management

# 2. Stop any running process (if needed)
# Press Ctrl+C in the terminal

# 3. Clean build
rmdir /s /q dist
npm install
npm run build

# 4. Start backend
npm run start:dev
```

---

## Verification Checklist

- [ ] Backend stopped
- [ ] dist folder deleted
- [ ] npm install completed
- [ ] npm run build completed successfully
- [ ] npm run start:dev started
- [ ] Logs show AttenderModule initialized
- [ ] Logs show all 6 routes mapped
- [ ] Test endpoint returns 200 (not 404)
- [ ] Response contains "Attenders fetched successfully"

---

## If Still Getting 404

### Check 1: Verify Module is Imported
```bash
grep -n "AttenderModule" src/app.module.ts
```
Should show:
```
import { AttenderModule } from './modules/attender/attender.module';
...
AttenderModule,
```

### Check 2: Verify Controller Exists
```bash
ls -la src/modules/attender/
```
Should show:
```
attender.controller.ts
attender.service.ts
attender.module.ts
dto/
```

### Check 3: Check Build Output
```bash
npm run build 2>&1 | grep -i attender
```
Should show no errors

### Check 4: Check Running Process
```bash
# Check if backend is actually running
curl http://localhost:3001/api/v1/auth/profile
```
If this returns 401 (not 404), backend is running

### Check 5: Check Port
```bash
# Verify backend is on port 3001
netstat -ano | findstr :3001  # Windows
lsof -i :3001                  # Mac/Linux
```

---

## Common Issues

### Issue 1: "Cannot find module"
**Solution:** Run `npm install` again

### Issue 2: "Port 3001 already in use"
**Solution:** Kill the process on port 3001 and restart

### Issue 3: Build fails
**Solution:** 
```bash
rm -rf node_modules
npm install
npm run build
```

### Issue 4: Still getting 404 after restart
**Solution:** 
1. Check if you're using correct URL: `/api/v1/attender/staff`
2. Check if token is valid
3. Check backend logs for errors
4. Try other endpoints to verify backend is working

---

## Quick Fix Script

### For Windows PowerShell
```powershell
# Save as fix-backend.ps1
$ErrorActionPreference = "Continue"

Write-Host "Stopping backend..." -ForegroundColor Yellow
# Kill any node process on port 3001
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Cleaning build..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Building..." -ForegroundColor Yellow
npm run build

Write-Host "Starting backend..." -ForegroundColor Green
npm run start:dev
```

Run with:
```powershell
.\fix-backend.ps1
```

### For Mac/Linux
```bash
#!/bin/bash

echo "Stopping backend..."
pkill -f "node.*start:dev"

echo "Cleaning build..."
rm -rf dist node_modules

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Starting backend..."
npm run start:dev
```

Save as `fix-backend.sh` and run:
```bash
chmod +x fix-backend.sh
./fix-backend.sh
```

---

## Expected Behavior After Fix

### Logs Should Show
```
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [InstanceLoader] AttenderModule dependencies initialized
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutesResolver] AttenderController {/attender}:
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff, post} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff, get} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff/:id, get} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff/:id, put} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff/:id, delete} route
[Nest] 12345  - 05/02/2026, 3:05:01 PM     LOG [RoutersResolver] Mapped {/attender/staff/:id/toggle-status, put} route
```

### API Should Return
```bash
$ curl -X GET http://localhost:3001/api/v1/attender/staff \
  -H "Authorization: Bearer eyJhbGc..."

{
  "message": "Attenders fetched successfully",
  "data": []
}
```

---

## Summary

The 404 error is because the backend process is running old code. Simply:

1. **Stop** the backend (Ctrl+C)
2. **Rebuild** (`npm run build`)
3. **Restart** (`npm run start:dev`)
4. **Test** the endpoint

That's it! The endpoints should now work. 🚀
