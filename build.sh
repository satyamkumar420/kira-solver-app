#!/bin/bash

# ️ Build Selector
echo "🧹 Cleaning build artifacts..."
npm run clean

echo "📦 Select build target:"
echo "1. Windows (Portable)"
echo "2. Windows"
echo "3. MacOS"
echo "4. Linux"

read -p "Enter choice (1-4): " choice

case $choice in
  1) npm run build:win:portable ;;
  2) npm run build:win ;;
  3) npm run build:mac ;;
  4) npm run build:linux ;;
  *) echo "❌ Invalid choice" && exit 1 ;;
esac

echo "✅ Build completed!"