<#
.SYNOPSIS
Move videos in the current folder correspondingly 
to the parent folder specified and renamed if neccessary 

.DESCRIPTION
Search the video files in the current directory, 
but exclude the files from the current directory, 
then move it to the next level of subdirectories in current directory separately, 
and rename the file if neccessary
#>
param(
    $StartDir = 'E:\Zhuojing\¡ı«ÏŒƒ'
)

Set-Location $StartDir
Get-ChildItem -Path $StartDir -Attributes Directory | foreach {
    $ParentDir = $_.FullName
    $Count = 1
    Write-Host -ForegroundColor Green "search folder: $_"
    Get-ChildItem -Path $ParentDir -Recurse | foreach {
        if ($_.DirectoryName -ne $ParentDir -and $_.Name -match ".*\.(mp4|mkv|flv)") {
            $DestinationPath = Join-Path $ParentDir $_.Name
            if (Test-Path $DestinationPath) {
                $NewName = $_.BaseName + $Count + $_.Extension
                $DestinationPath = Join-Path $ParentDir $NewName
                $Count ++
            }
            Write-Output "`tmove item: $_ to $DestinationPath"
            Move-Item -Path $_.FullName -Destination $DestinationPath
        }
    }
    Write-Host -ForegroundColor Green 'Done!'
}




