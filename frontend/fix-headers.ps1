$tokenCmd = "gog auth token --account bonifascorey2006@gmail.com --plain 2>&1"
$token = Invoke-Expression $tokenCmd | ForEach-Object { $_.Trim() } | Select-Object -First 1
Write-Host "Token: $($token.Substring(0, [Math]::Min(20, $token.Length)))..."

$headers = @("name", "ingredients", "servings", "calories", "protein", "cuisine", "diet", "cookTime", "prepTime", "instructions", "imageUrl", "category", "submittedBy", "dateAdded")
$cols = @("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N")

$body = @{
    values = @(@($headers))
} | ConvertTo-Json -Compress

$encoded = [System.Text.Encoding]::UTF8.GetBytes($token + ":")
$authHeader = "Bearer $token"

$uri = "https://sheets.googleapis.com/v4/spreadsheets/13vqBhkRXpS7vpgn2wLjno3t21PKMvaakmWEyTHLw5JI/values/my-recipes!A1:N1?valueInputOption=RAW"
$r = Invoke-WebRequest -Uri $uri -Method PUT -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
} -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -UseBasicParsing

Write-Host "Status: $($r.StatusCode)"
Write-Host "Response: $($r.Content)"
