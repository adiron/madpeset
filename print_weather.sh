#!/usr/bin/env bash
cd ~/madpeset/
ansiweather -a false -u metric -l 293397 | sed 's/ - /\n/g' | ./mktext.sh
