@'
Day|Meal|Breakfast|Lunch|Dinner|Snacks|Notes
Monday|Meal|||||
Monday|Calories|||||
Tuesday|Meal|||||
Tuesday|Calories|||||
Wednesday|Meal|||||
Wednesday|Calories|||||
Thursday|Meal|||||
Thursday|Calories|||||
Friday|Meal|||||
Friday|Calories|||||
Saturday|Meal|||||
Saturday|Calories|||||
Sunday|Meal|||||
Sunday|Calories|||||
'@ | Out-File -FilePath "$env:TEMP\planner_rows.txt" -Encoding utf8 -NoNewline

$rows = Get-Content "$env:TEMP\planner_rows.txt"
$rowNum = 1
foreach ($row in $rows) {
    $range = "planner!A$rowNum:G$rowNum"
    $result = gog sheets update 13vqBhkRXpS7vpgn2wLjno3t21PKMvaakmWEyTHLw5JI $range $row --account bonifascorey2006@gmail.com 2>&1
    Write-Host "Row $rowNum : $result"
    $rowNum++
}
