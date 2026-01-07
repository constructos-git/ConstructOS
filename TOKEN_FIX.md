# Token Permission Issue

## Problem
Your current token only has **read** access, but we need **write** access to push code.

## Solution: Regenerate Token with Write Permissions

1. **Go to**: https://github.com/settings/tokens
2. **Find your token** (or delete the old one and create a new one)
3. **Click "Generate new token (classic)"**
4. **IMPORTANT**: Make sure to check the **`repo`** scope
   - This gives full repository access (read AND write)
   - It will automatically check all sub-options
5. **Generate** and copy the new token
6. **Update the token** in your setup

## Quick Fix Script

Once you have a new token with `repo` scope, run:

```bash
# Replace NEW_TOKEN_HERE with your new token
printf "protocol=https\nhost=github.com\nusername=constructos-git\npassword=NEW_TOKEN_HERE\n" | git credential-osxkeychain store

# Then push
git push -u origin main
```

## Verify Token Has Write Access

You can test if your token has write access:

```bash
curl -X PATCH \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test"}' \
  https://api.github.com/repos/constructos-git/ConstructOS
```

If this succeeds, your token has write access. If it returns 403, the token is read-only.

## Current Status

✅ Repository exists on GitHub  
✅ Local git is configured  
✅ Token is stored in keychain  
⚠️ Token needs `repo` scope for write access

Once you update the token with `repo` scope, everything will work automatically!

