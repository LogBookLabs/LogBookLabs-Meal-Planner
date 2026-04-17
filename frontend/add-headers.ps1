$body = @'
[["name","ingredients","servings","calories","protein","cuisine","diet","cookTime","prepTime","instructions","imageUrl","category","submittedBy","dateAdded"]]
'@

$result = gog sheets update 13vqBhkRXpS7vpgn2wLjno3t21PKMvaakmWEyTHLw5JI "my-recipes!A1:N1" --values-json $body --account bonifascorey2006@gmail.com 2>&1
Write-Host $result
