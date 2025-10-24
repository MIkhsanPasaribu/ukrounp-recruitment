# Test URL setelah deployment
Write-Host "Tunggu 5 menit, lalu jalankan command ini:`n" -ForegroundColor Yellow

$url = "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net"

Write-Host "Invoke-WebRequest -Uri '$url' -Method HEAD" -ForegroundColor Cyan
Write-Host "`natau buka di browser:`n$url" -ForegroundColor Green
