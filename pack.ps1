# Pack the extension folder into a ZIP for sharing
param(
  [string]$Destination = "..\react-inspector-extension.zip"
)

Write-Host "Creating ZIP package at: $Destination"
# Include everything in the current folder except common VCS and node_modules folders
$items = Get-ChildItem -Path . -Force | Where-Object { $_.Name -ne '.git' -and $_.Name -ne 'node_modules' -and $_.Name -notlike '*.zip' }
Compress-Archive -Path $items -DestinationPath $Destination -Force -CompressionLevel Optimal
Write-Host "Done. Package created: $Destination"
