#!/bin/bash

# Based on https://gist.github.com/zlbruce/883605a635df8d5964bab11ed75e46ad (svg2icns)

if [ $# -ne 2 ]; then
    echo "Usage:   svg2icns filename.svg filename.icns"
    exit 100
fi

FILENAME="$1"
NAME=${FILENAME%.*}
ext=${FILENAME##*.}
echo "processing: $NAME"
DEST="$NAME".iconset
mkdir "$DEST"

convert -background none -resize '!16x16' "$1" "$DEST/icon_16x16.png"
convert -background none -resize '!32x32' "$1" "$DEST/icon_16x16@2x.png"
cp "$DEST/icon_16x16@2x.png" "$DEST/icon_32x32.png"
convert -background none -resize '!64x64' "$1" "$DEST/icon_32x32@2x.png"
convert -background none -resize '!128x128' "$1" "$DEST/icon_128x128.png"
convert -background none -resize '!256x256' "$1" "$DEST/icon_128x128@2x.png"
cp "$DEST/icon_128x128@2x.png" "$DEST/icon_256x256.png"
convert -background none -resize '!512x512' "$1" "$DEST/icon_256x256@2x.png"
cp "$DEST/icon_256x256@2x.png" "$DEST/icon_512x512.png"
convert -background none -resize '!1024x1024' "$1" "$DEST/icon_512x512@2x.png"

iconutil -c icns "$DEST"
mv "$NAME.icns" "$2"
rm -R "$DEST"
