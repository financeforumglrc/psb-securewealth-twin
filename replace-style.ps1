$content = Get-Content E:\DS_Financial\index-new.html -Raw
$newContent = $content -replace '(?s)<style>.*?</style>', '<link rel="stylesheet" href="design-system.css">`r`n    <link rel="stylesheet" href="home-premium.css">'
Set-Content E:\DS_Financial\index-new.html $newContent
