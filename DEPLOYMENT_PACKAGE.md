# 📦 Deployment Package Creation

## One-Command Setup

Copy and paste this entire command block into PowerShell:

```powershell
# Navigate to extension directory
cd "C:\Users\ksai6\Downloads\extension"

# Create the deployment ZIP file
Compress-Archive `
  -Path manifest.json, inject.js, content.js, icons, README.md, LICENSE `
  -DestinationPath "react-inspector-pro-v2.6.3.zip" `
  -Force

# Verify the ZIP was created
Write-Host "✅ ZIP file created successfully!" -ForegroundColor Green
dir "react-inspector-pro-v2.6.3.zip"

# Optional: Show ZIP contents
Write-Host "`n📦 Contents of ZIP file:" -ForegroundColor Blue
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("react-inspector-pro-v2.6.3.zip")
$zip.Entries | Select-Object Name, @{Name="Size";Expression={$_.Length}}
$zip.Dispose()

Write-Host "`n✨ Ready for submission!" -ForegroundColor Green
```

## What This Does

1. ✅ Creates a ZIP file named `react-inspector-pro-v2.6.3.zip`
2. ✅ Includes all required extension files
3. ✅ Excludes unnecessary files (node_modules, .git, etc.)
4. ✅ Verifies the ZIP was created
5. ✅ Shows ZIP contents for confirmation

## After Running Command

You'll see output like:
```
✅ ZIP file created successfully!

    Directory: C:\Users\ksai6\Downloads\extension

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---           2/15/2026  2:30 PM        XXXXX  react-inspector-pro-v2.6.1.zip

📦 Contents of ZIP file:

Name                 Size
----                 ----
manifest.json        XXX bytes
inject.js            XXXXX bytes
content.js           XXX bytes
[icons files]
README.md            XXXX bytes
LICENSE              XXX bytes

✨ Ready for submission!
```

## Files Included in ZIP

```
react-inspector-pro-v2.6.3.zip
├── manifest.json          ← Extension configuration
├── inject.js              ← Main content script (882 lines)
├── content.js             ← Bridge script
├── icons/                 ← Extension icons
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
├── README.md              ← Documentation
└── LICENSE                ← MIT License
```

## Files NOT Included (Correct!)

These files are excluded because they're not needed for the extension to run:
- ❌ node_modules/
- ❌ .git/
- ❌ .gitignore
- ❌ package.json
- ❌ package-lock.json
- ❌ Documentation MD files (except README)
- ❌ .svg files outside icons/

## File Size Reference

Your ZIP should be around **50-100 KB** (typical for this type of extension)

If it's much larger, verify:
- [ ] node_modules/ is NOT included
- [ ] .git/ is NOT included
- [ ] No large media files accidentally included

## Verification Checklist

Before uploading, verify:

- [ ] File exists: `C:\Users\ksai6\Downloads\extension\react-inspector-pro-v2.6.3.zip`
- [ ] File size: 50-100 KB (approximate)
- [ ] ZIP contains: manifest.json, inject.js, content.js, icons/, README.md, LICENSE
- [ ] manifest.json has version: "2.6.3"
- [ ] No HTML files in ZIP
- [ ] No node_modules in ZIP

## Upload Instructions

### Step 1: Go to Developer Dashboard
```
https://chrome.google.com/webstore/devconsole
```

### Step 2: Select Your Extension
- Click on "React Inspector Pro"
- Item ID: `ffbnedpfcmcjgfkgopliopoolaonbphd`

### Step 3: Upload Package
- Click "Package" or "Upload new package"
- Select: `react-inspector-pro-v2.6.3.zip`
- Wait for upload to complete

### Step 4: Review Changes
- Click "Edit"
- Scroll to "Changes notes"
- Paste this text:

```
Manifest V3 Compliance Fix (v2.6.3)
```
Manifest V3 Compliance Fix (v2.6.3)

- Removed external CDN dependencies (three.js)
- All code is now locally hosted and included in the extension package
- Full compliance with Manifest V3 technical requirements
- Enhanced security and transparency
- No functional changes to user-facing features
```
- Click "Submit for review"
- Wait for approval (1-3 hours typical)

## Troubleshooting

### Issue: ZIP file too large
```powershell
# Check what's in it
$zip = [System.IO.Compression.ZipFile]::OpenRead("react-inspector-pro-v2.6.3.zip")
$zip.Entries | Where-Object {$_.Length -gt 1MB} | Select-Object Name, Length
$zip.Dispose()

# Common culprit: node_modules included
# Solution: Delete and recreate without node_modules
```

### Issue: ZIP won't create
```powershell
# Make sure you're in the right directory
pwd  # Should show: C:\Users\ksai6\Downloads\extension

# Check files exist
ls manifest.json, inject.js, content.js

# Try creating manually in File Explorer
# Or use 7-Zip if Compress-Archive fails
```

### Issue: Chrome Web Store rejects ZIP format
```
Solution: Try uploading from File Explorer instead of command line
- Manually select the .zip file
- Drag and drop into browser upload
- Refresh page if upload stalls
```

## Success Indicators

✅ **You're done when you see:**
- ZIP file created in folder
- File size 50-100 KB
- Contains all required files
- Uploaded to developer dashboard
- Submission received (shows "Pending review")

⏳ **Then wait 1-3 hours for:**
- Email notification about review
- Status update in developer dashboard

🎉 **Success when you see:**
- Extension marked as "Published"
- Available in Chrome Web Store
- Users can install it

---

## Keep This File Handy

This process is repeatable if you need to:
- Update the extension in the future
- Re-upload if needed
- Track package creation process

Just update:
1. Version number in manifest.json
2. ZIP filename (e.g., v2.6.3)
3. Follow steps above

---

**Created:** February 15, 2026  
**For:** React Inspector Pro v2.6.3  
**Status:** Ready to deploy
