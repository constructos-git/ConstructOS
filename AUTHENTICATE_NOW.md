# 🔐 Quick Authentication Guide

## Option 1: Personal Access Token (5 minutes)

### Step 1: Get Token
1. **Open this link**: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: `ConstructOS Local`
4. Check **`repo`** scope (gives full repository access)
5. Click **"Generate token"** at bottom
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push Your Code
```bash
git push -u origin main
```

When asked:
- **Username**: `constructos-git` (or your GitHub username)
- **Password**: Paste the token (NOT your GitHub password)

---

## Option 2: GitHub CLI (Easier - Recommended!)

This handles everything automatically:

```bash
# Install GitHub CLI
brew install gh

# Authenticate (opens browser automatically)
gh auth login

# Follow prompts:
# - GitHub.com
# - HTTPS
# - Login with web browser
# - Authorize in browser

# Then push
git push -u origin main
```

This is much easier - no token copying needed!

---

## Can't Find Tokens Section?

**Direct Link**: https://github.com/settings/tokens

**Or navigate manually**:
1. Click your profile picture (top right)
2. Click "Settings"
3. Scroll down left sidebar
4. Click "Developer settings" (at bottom)
5. Click "Personal access tokens" → "Tokens (classic)"
6. Click "Generate new token" → "Generate new token (classic)"

---

## After Authentication

Once you push successfully, all future commits will auto-push to GitHub! 🎉

