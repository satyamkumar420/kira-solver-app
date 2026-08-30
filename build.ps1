# 📦 Build Selector
# Cleans artifacts and runs the selected build command.

Write-Host "🧹 Cleaning build artifacts..."
npm run clean

# --- Build Menu ---
Write-Host "📦 Select build target:"
Write-Host "1. Windows (Portable)"
Write-Host "2. Windows"


$choice = Read-Host "Enter choice (1-4)"

# --- Execute Choice ---
switch ($choice) {
    "1" {
        Write-Host "Building for Windows (Portable)..."
        npm run build:win:portable
    }
    "2" {
        Write-Host "Building for Windows..."
        npm run build:win
    }
    default {
        Write-Host "❌ Invalid choice. Exiting."
        exit 1
    }
}

Write-Host "✅ Build completed!"