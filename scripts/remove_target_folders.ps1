<#
.SYNOPSIS
Remove the target folder

.Description
Confirm and remove the target directory
#>

$path = "D:\Documents\Work\Zhuojing\课程"
Write-Output "Searching the folder: $path"
Get-ChildItem -Path $path -Recurse -Depth 4 | Select-Object | foreach {
    if($_.Name -like "*target*") {
        $n = $_.Name
        $fn = $_.FullName
        Write-Output "Found: [$n] [$fn]"
        Remove-Item -Confirm -Path $fn
    }
}
Write-Output "Done!"
