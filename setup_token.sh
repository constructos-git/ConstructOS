#!/bin/bash
# Setup script to configure git with the token
# Usage: ./setup_token.sh
# This script will prompt you for your token

read -sp "Enter your GitHub token: " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
  echo "❌ No token provided. Exiting."
  exit 1
fi

# Store token securely in macOS keychain
printf "protocol=https\nhost=github.com\nusername=constructos-git\npassword=${TOKEN}\n" | git credential-osxkeychain store

echo "✅ Token stored in keychain. Trying push..."
git push -u origin main

