# Run this script to simulate incoming logs!

# 1. Simulate an SSH Brute Force
Write-Host "🚨 Simulating SSH Brute Force Attack..." -ForegroundColor Red
1..6 | ForEach-Object {
    $log = "May 16 12:00:00 server sshd[1234]: Failed password for invalid user root from 192.168.1.100 port 22 ssh2"
    Add-Content -Path "auth.log" -Value $log
    Start-Sleep -Milliseconds 100
}

Write-Host "✅ Brute Force Logs Generated." -ForegroundColor Green
Start-Sleep -Seconds 2

# 2. Simulate a Web Scan Attack (Nginx)
Write-Host "🚨 Simulating Web Scan Attack..." -ForegroundColor Red
$paths = @("/admin", "/wp-admin", "/.env", "/config.php", "/backup.zip", "/phpmyadmin")
foreach ($path in $paths) {
    $log = "10.0.0.50 - - [16/May/2026:12:00:00 +0000] `"GET $path HTTP/1.1`" 404 153 `"-`" `"curl/7.68.0`""
    Add-Content -Path "access.log" -Value $log
    Start-Sleep -Milliseconds 100
}

Write-Host "✅ Web Scan Logs Generated." -ForegroundColor Green
Write-Host "🎯 Check your Kafka UI and SentinelX Dashboard!" -ForegroundColor Cyan
