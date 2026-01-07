# Step-by-Step: Creating a GitHub Personal Access Token

## Method 1: Direct Link (Easiest)

**Click this link to go directly to tokens:**
👉 https://github.com/settings/tokens

Then click **"Generate new token"** → **"Generate new token (classic)"**

## Method 2: Manual Navigation

1. **Go to GitHub.com** and sign in
2. **Click your profile picture** (top right corner)
3. **Click "Settings"** (bottom of dropdown menu)
4. **Scroll down** in the left sidebar
5. **Click "Developer settings"** (at the very bottom)
6. **Click "Personal access tokens"** → **"Tokens (classic)"**
7. **Click "Generate new token"** → **"Generate new token (classic)"**

## Creating the Token

1. **Note**: Give it a name like "ConstructOS Local"
2. **Expiration**: Choose how long it should last (90 days, 1 year, or no expiration)
3. **Select scopes**: Check the box for **`repo`** (this gives full repository access)
   - This will automatically check all sub-options under `repo`
4. **Scroll down** and click **"Generate token"**
5. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Using the Token

Once you have the token, run:

```bash
git push -u origin main
```

When prompted:
- **Username**: `constructos-git` (or your GitHub username)
- **Password**: Paste the token you just copied (not your GitHub password!)

## Alternative: Use GitHub CLI (Easier)

If you prefer, you can use GitHub CLI which handles authentication automatically:

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Authenticate (opens browser)
gh auth login

# Select: GitHub.com → HTTPS → Login with web browser
# Follow the prompts in your browser

# Then push
git push -u origin main
```

This is often easier than managing tokens manually!

