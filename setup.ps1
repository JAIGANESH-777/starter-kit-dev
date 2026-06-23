Write-Host ""
Write-Host "🚀 Starter Kit Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Step 1 - Get token
Write-Host "Step 1: Generate your GitHub token" -ForegroundColor Yellow
Write-Host "→ Go to: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "→ Create token with: read:packages + repo" -ForegroundColor White
Write-Host ""
$token = Read-Host "Paste your GitHub token here"

# Step 2 - Write .npmrc
$content = "@jaiganesh-777:registry=https://npm.pkg.github.com/`n//npm.pkg.github.com/:_authToken=$token"
[System.IO.File]::WriteAllText("$HOME\.npmrc", $content, [System.Text.UTF8Encoding]::new($false))
Write-Host ""
Write-Host "✅ .npmrc configured!" -ForegroundColor Green

# Step 3 - Install
Write-Host "⏳ Installing package..." -ForegroundColor Cyan
npm install @jaiganesh-777/starter-kit-dev

Write-Host ""
Write-Host "🎉 All done! Run the kit with:" -ForegroundColor Green
Write-Host "   npx @jaiganesh-777/starter-kit-dev" -ForegroundColor White
Write-Host ""