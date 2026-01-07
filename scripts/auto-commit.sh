#!/bin/bash
# Auto-commit script for ConstructOS
# This script can be run manually or set up as a cron job/watch script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Auto-committing changes...${NC}"

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

# Get current branch
BRANCH=$(git symbolic-ref --short HEAD)

# Add all changes
git add -A

# Create commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="Auto-commit: $TIMESTAMP"

# Commit
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Committed successfully${NC}"
  echo "Commit message: $COMMIT_MSG"
  echo "Branch: $BRANCH"
  
  # Push will happen automatically via post-commit hook
else
  echo "Failed to commit. Check git status."
  exit 1
fi

