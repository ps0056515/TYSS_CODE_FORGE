#!/bin/bash

cd /home/ubuntu/TYSS_CODE_FORGE || exit

echo "==== $(date) Starting deployment ===="

# Pull latest code
git pull origin main

# Install dependencies (optional but recommended)
npm install

# Start app
npm run dev > web.log
