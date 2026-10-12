try {
    $res = Invoke-WebRequest -Uri 'https://yanat.roiclients.co.in/api/packages' -Method Get -UseBasicParsing
    Write-Host "PACKAGES STATUS:" $res.StatusCode
    Write-Host "PACKAGES CONTENT:" $res.Content.Substring(0, [Math]::Min(200, $res.Content.Length))
} catch {
    Write-Host "PACKAGES ERROR:" $_.Exception.Message
}

try {
    $res2 = Invoke-WebRequest -Uri 'https://yanat.roiclients.co.in/admin/login' -Method Get -UseBasicParsing
    Write-Host "LOGIN PAGE STATUS:" $res2.StatusCode
    Write-Host "LOGIN PAGE CONTENT:" $res2.Content.Substring(0, [Math]::Min(200, $res2.Content.Length))
} catch {
    Write-Host "LOGIN PAGE ERROR:" $_.Exception.Message
}
