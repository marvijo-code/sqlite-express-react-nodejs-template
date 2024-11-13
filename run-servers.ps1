$backendJob = Start-Job -ScriptBlock {
    Set-Location -Path "backend"
    npm run dev
}

$frontendJob = Start-Job -ScriptBlock {
    Set-Location -Path "frontend"
    npm run dev
}

try {
    Write-Host "Starting servers... Press Ctrl+C to stop"
    Receive-Job -Job $backendJob, $frontendJob -Wait
}
finally {
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
}
