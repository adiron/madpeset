#!/bin/bash
inptmp=$(mktemp ./tmp/print-text-XXXXXXX.txt)
tmp=$(mktemp ./tmp/print-XXXXXXX.png)
cat > $inptmp
pango-view --no-display --output $tmp --dpi=203 --margin=2,2,232,2 -w 180 $inptmp
lp -d thermal $tmp -o orientation-requested=3
echo $tmp
echo $inptmp
# rm $tmp
