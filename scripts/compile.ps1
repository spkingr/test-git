<#
.SYNOPSIS
Complie modules

.DESCRIPTION
Modules compiler
#>

param(
    $projectPath = "D:\Documents\Workspace\IntelliJ IDEA\Test\selenium\test4-module-system",
    $modulePath = "mods",
    $mainModule = "monitor",
    $mainClass = "monitor.Main",
    [switch]$overrideJar
);

javac --version
Write-Host -ForegroundColor Green "Start..."
Set-Location $projectPath

$dirs = Get-ChildItem $projectPath -Directory | Where { Get-ChildItem $_.FullName | Where-Object Name -EQ "src"} | Select-Object Name,FullName

$out = ""
$dirs | foreach {$out += $_.name + " | "}
Write-Host -ForegroundColor Green "`t[Debug] dirs = $out"

$count = 0
$dirs | foreach {
    Write-Host "------------------------"

    $count ++
    $current = $_.Name
    Write-Host -ForegroundColor Green "`t[Debug] start from folder = $current"
    $path = $_.FullName
    $javas = Get-ChildItem $path -Recurse -File | Where { $_.Name -like "*.java" } | foreach {Resolve-Path -Path $_.FullName -Relative}
    $cmd = "javac --module-path $modulePath -d $current/target/classes $javas"
    Write-Host -ForegroundColor Green "`t[Debug] command = $cmd"
    
    javac --module-path $modulePath -d $current/target/classes $javas
    if($?) {
        # success
        $jar = $modulePath + "/" + $current + ".jar"
        $cmd = "jar --create -f $jar -C $current/target/classes ."
        if((Test-Path $jar) -and -not $overrideJar) {
            Write-Host -ForegroundColor Green "`t[Debug] jar exists and skipped"
        } else {
            Write-Host -ForegroundColor Green "`t[Debug] jar command = $cmd"
            jar --create -f $jar -C $current/target/classes .
        }
    } else {
        Write-Error "`t[Warn] error compile module: $current"
    }
}

Write-Host "------------------------"

Write-Host -ForegroundColor Green "`t[Debug] create main jar..."
jar --create -f $modulePath/${mainModule}.jar --main-class $mainClass -C ${mainModule}/target/classes .

Write-Host -ForegroundColor Green "`t[Debug] run the module $mainModule..."
java --module-path $modulePath --module $mainModule

Write-Host -ForegroundColor Green "Done with $count modules!"
