#!/bin/bash
# Re-encode ritual videos for iOS compatibility
# Run this script from the gem-mobile directory

VIDEO_DIR="assets/videos/rituals"
TEMP_DIR="assets/videos/rituals/temp"

mkdir -p "$TEMP_DIR"

echo "Re-encoding videos for iOS compatibility..."

for video in "$VIDEO_DIR"/*.mp4; do
    filename=$(basename "$video")
    echo "Processing: $filename"

    # Re-encode with H.264 (iOS compatible)
    # -c:v libx264 - H.264 video codec
    # -profile:v baseline - Most compatible iOS profile
    # -level 3.1 - Compatible with most iOS devices
    # -pix_fmt yuv420p - Standard pixel format
    # -an - No audio (videos are muted anyway)
    # -movflags +faststart - Optimize for streaming

    ffmpeg -i "$video" \
        -c:v libx264 \
        -profile:v baseline \
        -level 3.1 \
        -pix_fmt yuv420p \
        -an \
        -movflags +faststart \
        -y \
        "$TEMP_DIR/$filename"

    if [ $? -eq 0 ]; then
        mv "$TEMP_DIR/$filename" "$video"
        echo "✓ Done: $filename"
    else
        echo "✗ Failed: $filename"
    fi
done

rmdir "$TEMP_DIR" 2>/dev/null

echo ""
echo "All videos re-encoded!"
echo "Now run: eas build --platform ios --profile production --auto-submit"
