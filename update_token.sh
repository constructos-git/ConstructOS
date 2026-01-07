#!/bin/bash
# Script to update the GitHub token

echo "🔐 GitHub Token Update Script"
echo ""
echo "This script will update your stored GitHub token."
echo ""
read -p "Enter your new token (with repo scope): " NEW_TOKEN

if [ -z "$NEW_TOKEN" ]; then
  echo "❌ No token provided. Exiting."
  exit 1
fi

# Store new token in keychain
printf "protocol=https\nhost=github.com\nusername=constructos-git\npassword=${NEW_TOKEN}\n" | git credential-osxkeychain store

echo ""
echo "✅ Token updated in keychain!"
echo ""
echo "Testing connection..."
if git ls-remote origin > /dev/null 2>&1; then
  echo "✅ Connection successful!"
  echo ""
  echo "Pushing to GitHub..."
  if git push -u origin main; then
    echo ""
    echo "🎉 Success! Your code has been pushed to GitHub!"
    echo "   View it at: https://github.com/constructos-git/ConstructOS"
  else
    echo ""
    echo "⚠️  Push failed. The token might still not have write permissions."
    echo "   Make sure the token has the 'repo' scope enabled."
  fi
else
  echo "❌ Connection failed. Please check your token."
fi

