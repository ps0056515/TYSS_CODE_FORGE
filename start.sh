#!/bin/bash

set -e  # fail if any command fails

cd /home/ubuntu/TYSS_CODE_FORGE || exit

echo "==== $(date) Starting deployment ===="

# Load NVM (IMPORTANT if using nvm)
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Start app (NO redirection here)
exec npm run dev
