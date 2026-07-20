Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('C:\WFMS\Workforce Management System PRD.docx')
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$text = [System.Text.RegularExpressions.Regex]::Replace($xml, '<[^>]+>', ' ')
$text = [System.Text.RegularExpressions.Regex]::Replace($text, '\s+', ' ')
$text.Trim() | Out-File -FilePath 'C:\WFMS\prd_text.txt' -Encoding utf8
