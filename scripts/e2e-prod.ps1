# End-to-end production API test. Usage:
#   powershell -File scripts/e2e-prod.ps1 -Base http://localhost:4100 -Email <admin> -Password <pw>
param([string]$Base = "http://localhost:4100", [string]$Email, [string]$Password)
$ErrorActionPreference = "Stop"
$pass = 0; $fail = 0
function Check($name, $cond) { if ($cond) { Write-Host "PASS $name"; $script:pass++ } else { Write-Host "FAIL $name" -ForegroundColor Red; $script:fail++ } }
function Call($method, $path, $body, $session, $headers) {
  $p = @{ Uri = "$Base$path"; Method = $method; ContentType = "application/json"; UseBasicParsing = $true }
  if ($body) { $p.Body = ($body | ConvertTo-Json -Compress) }
  if ($session) { $p.WebSession = $session }
  if ($headers) { $p.Headers = $headers }
  try { $r = Invoke-WebRequest @p; return @{ code = [int]$r.StatusCode; body = $r.Content; headers = $r.Headers } }
  catch { $resp = $_.Exception.Response; $sr = New-Object IO.StreamReader($resp.GetResponseStream()); return @{ code = [int]$resp.StatusCode; body = $sr.ReadToEnd(); headers = $resp.Headers } }
}

$h = Call GET "/api/health"; Check "health 200" ($h.code -eq 200)
$rd = Call GET "/api/ready"; Check "ready 200 (database up)" ($rd.code -eq 200 -and $rd.body -match '"database":"up"')
$spa = Call GET "/admin/login"; Check "/admin/login serves SPA (direct load/refresh)" ($spa.code -eq 200 -and $spa.body -match "<div id=`"root`"")
$bad = Call POST "/api/auth/login" @{ email = $Email; password = "wrong-password" }; Check "invalid credentials -> 401" ($bad.code -eq 401)
$empty = Call POST "/api/auth/login" @{ email = ""; password = "" }; Check "empty input -> 400" ($empty.code -eq 400)
$anon = Call GET "/api/admin/faqs"; Check "admin API without cookie -> 401" ($anon.code -eq 401)
$anonMe = Call GET "/api/auth/me"; Check "me without cookie -> 401" ($anonMe.code -eq 401)

# Test Subdomain CORS
$subCors = Call OPTIONS "/api/auth/login" $null $null @{ "Origin" = "https://admin.yanaindia.com"; "Access-Control-Request-Method" = "POST" }
Check "subdomain CORS (admin.yanaindia.com) allowed" ($subCors.headers["Access-Control-Allow-Origin"] -eq "https://admin.yanaindia.com")
$roiCors = Call OPTIONS "/api/auth/login" $null $null @{ "Origin" = "https://yanat.roiclients.co.in"; "Access-Control-Request-Method" = "POST" }
Check "subdomain CORS (yanat.roiclients.co.in) allowed" ($roiCors.headers["Access-Control-Allow-Origin"] -eq "https://yanat.roiclients.co.in")

$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$ok = Call POST "/api/auth/login" @{ email = $Email; password = $Password } $s
Check "valid credentials -> 200" ($ok.code -eq 200)
$loginJson = $ok.body | ConvertFrom-Json
Check "valid credentials -> returns session token" ($null -ne $loginJson.token)
$setCookie = "$($ok.headers['Set-Cookie'])"
Check "cookie HttpOnly" ($setCookie -match "HttpOnly")
Check "cookie SameSite configured" ($setCookie -match "SameSite=(Lax|None)")

# Test Bearer token auth (for cross-subdomain / Safari without cookies)
$bearerMe = Call GET "/api/auth/me" $null $null @{ "Authorization" = "Bearer $($loginJson.token)" }
Check "bearer token authentication succeeds (/api/auth/me 200)" ($bearerMe.code -eq 200 -and $bearerMe.body -match $Email)

# Local test runs over plain http, so a Secure cookie isn't re-sent by the client; copy it manually.
if ($setCookie -match "yana_admin=([^;]+)") {
  $c = New-Object System.Net.Cookie("yana_admin", $Matches[1], "/", ([Uri]$Base).Host); $s.Cookies.Add($c)
}
$me = Call GET "/api/auth/me" $null $s; Check "session persists (me 200)" ($me.code -eq 200)
$dash = Call GET "/api/admin/dashboard" $null $s; Check "dashboard API 200" ($dash.code -eq 200)

# Test Curated Themes in PostgreSQL
$themes = Call GET "/api/admin/curated_themes" $null $s
Check "admin curated_themes module 200" ($themes.code -eq 200)
$pubThemes = Call GET "/api/public/themes"
Check "public themes API returns seeded themes" ($pubThemes.code -eq 200 -and $pubThemes.body -match "Mountains & the North")

$tag = "E2E-TEST-" + [guid]::NewGuid().ToString("N").Substring(0, 8)
$cr = Call POST "/api/admin/faqs/save" @{ question = $tag; answer = "temp"; category = "General" } $s
Check "create FAQ 200" ($cr.code -eq 200)
$list = (Call GET "/api/admin/faqs" $null $s).body | ConvertFrom-Json
$item = @($list.items + $list) | Where-Object { $_.question -eq $tag } | Select-Object -First 1
Check "created row read back from PostgreSQL" ($null -ne $item)
$pub = Call GET "/api/public/faqs"; Check "public API (anonymous session) shows new FAQ" ($pub.body -match $tag)
Check "public API Cache-Control no-store" ("$($pub.headers['Cache-Control'])" -match "no-store")
if ($item) {
  $ed = Call POST "/api/admin/faqs/save" @{ id = $item.id; question = "$tag-EDITED"; answer = "temp2"; category = "General" } $s
  Check "edit FAQ 200" ($ed.code -eq 200)
  Check "public shows edit" ((Call GET "/api/public/faqs").body -match "$tag-EDITED")
  $del = Call DELETE "/api/admin/faqs/$($item.id)" $null $s; Check "delete FAQ 200" ($del.code -eq 200)
  Check "public no longer shows FAQ" (-not ((Call GET "/api/public/faqs").body -match $tag))
}

# Test Package CRUD via PostgreSQL
$pkgSlug = "e2e-test-pkg-" + [guid]::NewGuid().ToString("N").Substring(0, 8)
$pkgData = @{
  title = "E2E Test Tour Package";
  slug = $pkgSlug;
  scope = "domestic";
  tour_type = "group";
  category_name = "Group Tours";
  theme_name = "Mountains & the North";
  destination_name = "Himachal";
  country = "India";
  duration_days = 5;
  duration_nights = 4;
  overview = "Testing PostgreSQL package insertion and retrieval.";
  highlights = @("Mountain pass", "Valley view");
  inclusions = @("Hotel", "Meals");
  exclusions = @("Airfare");
  price_amount = 19999;
  taxes_info = "GST 5% extra";
  hero_image_url = "/packages/himachal-shimla-manali-5n6d.jpg";
  is_featured = $true;
  is_active = $true;
  status = "published";
  itinerary = @(@{ day_number = 1; title = "Arrival"; description = "Day 1 itinerary" })
}
$createPkg = Call POST "/api/admin/packages" @{ id = $null; data = $pkgData } $s
Check "create package 200" ($createPkg.code -eq 200)
$createPkgJson = $createPkg.body | ConvertFrom-Json
Check "created package returned slug" ($createPkgJson.slug -eq $pkgSlug)

$adminPkgs = (Call GET "/api/admin/packages" $null $s).body | ConvertFrom-Json
$createdItem = @($adminPkgs.items) | Where-Object { $_.slug -eq $pkgSlug } | Select-Object -First 1
Check "new package listed in admin packages" ($null -ne $createdItem)

if ($createdItem) {
  $singlePkg = (Call GET "/api/admin/packages/$($createdItem.id)" $null $s).body | ConvertFrom-Json
  Check "get single package by id matches theme_name" ($singlePkg.theme_name -eq "Mountains & the North")

  # Update package
  $pkgData.title = "E2E Test Tour Package (Updated)"
  $updatePkg = Call POST "/api/admin/packages" @{ id = $createdItem.id; data = $pkgData } $s
  Check "update package 200" ($updatePkg.code -eq 200)

  # Check public API
  $pubPkg = Call GET "/api/packages/$pkgSlug"
  Check "public package details API shows updated title" ($pubPkg.code -eq 200 -and $pubPkg.body -match "Updated")

  # Delete package
  $delPkg = Call DELETE "/api/admin/packages/$($createdItem.id)" $null $s
  Check "delete package 200" ($delPkg.code -eq 200)

  # Verify deleted
  $verifyDel = Call GET "/api/packages/$pkgSlug"
  Check "deleted package no longer found on public API" ($verifyDel.code -eq 404)
}

$lo = Call POST "/api/auth/logout" $null $s; Check "logout 200" ($lo.code -eq 200)
Write-Host "`n$pass passed, $fail failed"
if ($fail) { exit 1 }

