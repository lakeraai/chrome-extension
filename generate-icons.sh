image="Lakera.png"

convert \
  -background transparent +antialias \
  $image \
  -resize 64x64 -background transparent -gravity center -extent 64x64 \
  -define "icon:auto-resize=64,48,32,16" \
  public/favicon.ico

# If you change the dimensions used here, make sure public/manifest.json is updated too.
for size in 16 19 38 48 128; do
  convert \
    -background transparent +antialias \
    $image \
    -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} \
    public/icon-${size}.png
done
