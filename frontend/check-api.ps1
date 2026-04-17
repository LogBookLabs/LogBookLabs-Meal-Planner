try {
    $x = Invoke-WebRequest -Uri 'http://localhost:3001/api/sheet?sheetId=16mWtkk5bQ5G1Eoi7rIzNJzAAtdLoU-jGFobTjKFSWq4&range=recipes!A1:K5' -UseBasicParsing -TimeoutSec 8
    $x.Content
} catch {
    $_.Exception.Message
}
