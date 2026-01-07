# Git Workflow & Remote Access Setup

## GitHub Repository Setup

Your repository is now connected to: https://github.com/constructos-git/ConstructOS

### Current Setup

- **Remote**: `origin` → `https://github.com/constructos-git/ConstructOS.git`
- **Default Branch**: `main`
- **Auto-push**: Enabled via post-commit hook

## Auto-Commit Workflow

### Automatic Push on Commit

A `post-commit` hook has been set up that automatically pushes to GitHub after each commit. This means:

1. When you commit: `git commit -m "your message"`
2. The hook automatically runs: `git push origin main`

### Manual Auto-Commit Script

For automated commits, use the script:

```bash
./scripts/auto-commit.sh
```

This will:
- Stage all changes
- Create a commit with timestamp
- Auto-push via the post-commit hook

### Setting Up Watch Mode (Optional)

To auto-commit on file changes, you can use a file watcher:

```bash
# Install watchman (if not installed)
brew install watchman

# Or use nodemon
npm install -g nodemon
nodemon --watch . --exec './scripts/auto-commit.sh' --ignore node_modules
```

## Working with Git

### Standard Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit (auto-pushes via hook)
git commit -m "Your commit message"

# Or use the auto-commit script
./scripts/auto-commit.sh
```

### Pulling Latest Changes

```bash
git pull origin main
```

## iOS/Mobile Access Options

**Note**: Cursor is a desktop IDE and doesn't have an iOS app. Here are alternatives for working on your iPhone:

### Option 1: GitHub Codespaces (Recommended)
- Access your code via web browser on iOS
- Full VS Code experience in the cloud
- Free tier available
- Steps:
  1. Go to https://github.com/constructos-git/ConstructOS
  2. Click "Code" → "Codespaces" → "Create codespace"
  3. Access from any device with a browser

### Option 2: GitHub Mobile App
- View and edit files directly on iOS
- Make commits and push changes
- Limited editing capabilities
- Download: GitHub app from App Store

### Option 3: Remote Desktop
- Use a remote desktop app (e.g., Jump Desktop, Microsoft Remote Desktop)
- Access your Mac from iPhone
- Full desktop experience
- Requires Mac to be on and accessible

### Option 4: VS Code for Web
- Use GitHub.dev: `https://github.dev/constructos-git/ConstructOS`
- Lightweight editing in browser
- Works on iOS Safari

### Option 5: Working Copy (iOS Git Client)
- Full Git client for iOS
- Edit code, commit, push
- Sync with GitHub
- Download from App Store

## Recommended Setup for Mobile Work

1. **Primary**: Use GitHub Codespaces for full development
2. **Quick edits**: Use GitHub Mobile app or GitHub.dev
3. **Full access**: Use remote desktop to your Mac

## Authentication Setup

### Option 1: Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Use the token as your password when pushing

```bash
# Push will prompt for username and token
git push origin main
# Username: constructos-git
# Password: <your-personal-access-token>
```

### Option 2: SSH Keys (More Secure)

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Update remote to use SSH
git remote set-url origin git@github.com:constructos-git/ConstructOS.git
```

### Option 3: GitHub CLI

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# This will set up authentication automatically
```

## Troubleshooting

### If auto-push fails:
```bash
# Check remote connection
git remote -v

# Test push manually
git push origin main

# Check authentication (may need GitHub token)
git config --global credential.helper osxkeychain

# If using HTTPS, you may need to update credentials
git credential-osxkeychain erase
host=github.com
protocol=https
# Press Enter twice, then try push again
```

### If hooks don't run:
```bash
# Make sure hooks are executable
chmod +x .git/hooks/post-commit
chmod +x .git/hooks/pre-push
```

## Security Notes

- The post-commit hook will push to GitHub automatically
- Make sure your GitHub credentials are set up securely
- Consider using SSH keys instead of HTTPS for better security
- Review commits before pushing (the hook runs after commit, so you can amend if needed)

