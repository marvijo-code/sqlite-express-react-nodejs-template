#!pwsh
try {
    Write-Host "Starting servers... Press Ctrl+C to stop"
    
    # Change to script directory first
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $scriptPath

    # Start backend
    Set-Location -Path "backend"
    npm run dev &

    # Start frontend
    Set-Location -Path "../frontend"
    npm run dev
}
finally {
    if ($backendProcess) { 
        Write-Host "Stopping backend..."
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        Get-Process | Where-Object { $_.Name -eq 'node' -and $_.Path -like '*backend*' } | Stop-Process -Force
    }
    if ($frontendProcess) {
        Write-Host "Stopping frontend..."
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Servers stopped"
}
