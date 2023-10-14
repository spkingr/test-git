#!/usr/bin/env bash

# use for download multiple files in one command
# usage: ./shell_script m3u8_file_1 m3u8_file_2 ... [folder_number]

echo args count: $#

kts_script="download.main.kts"
num_args=$#
last_arg=${!num_args}
if [[ $last_arg =~ ^[0-9]+$ ]]; then
  n=$((last_arg))
  num_args=$((num_args - 1))
else
  n=0
fi

for ((i = 1; i <= num_args; i++)); do
  file=${!i}
  if [ -f "$file" ]; then
    echo "$file" exists ["${n}"]
    n=$((n + 1))
    echo "start running kts script, for downloading: $file"
    kotlinc -script "${kts_script}" "$file" :folder "$n" :h
  else
    echo "$file not exists, skipped"
  fi
done
