<#
.SYNOPSIS
Concat all the ts files into one, and convert into mp4 video

.DESCRIPTION
For converting this .bat code to powershell script:
'ffmpeg -i part1.flv -vcodec copy -acodec copy -vbsf h264_mp4toannexb 1.ts && ffmpeg -i part2.flv -vcodec copy -acodec copy -vbsf h264_mp4toannexb 2.ts ... && ffmpeg -i "concat:1.ts|2.ts|3.ts|4.ts" -acodec copy -vcodec copy -absf aac_adtstoasc out.mp4 && rm *.ts'
#>
param($count = 0, $target = 'out')

Write-Output 'Start...'

if($count -le 0) {
	$count = Read-Host 'input the video(flv files) count'
}
if($target.length -eq 0) {
	$target = 'out'
}

# Write-Output "[debug] count = $count"
# Write-Output "[debug] target = $target"

$concat = 'concat:'
Write-Output '- start convertion...'
for($i = 1; $i -le $count; $i ++) {
	$video = "part${i}.flv"
	$out = "${i}.ts"
	Write-Output "`tconvert the ${video} file to ${out}:"
	ffmpeg -i $video -vcodec copy -acodec copy -vbsf h264_mp4toannexb $out
	
	$concat += $out
	if($i -lt $count) {
		$concat += '|'
	}
}
# Write-Output "[debug] concat = $concat"

Write-Output "- done with convertion, will concat all to one video [${target}.mp4]..."
ffmpeg -i $concat -acodec copy -vcodec copy -absf aac_adtstoasc ${target}.mp4

Write-Output "- done with cancatation, removing the .ts files..."
Remove-Item *.ts

Write-Output "Done!"
