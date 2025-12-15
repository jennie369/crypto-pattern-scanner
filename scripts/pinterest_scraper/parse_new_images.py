"""
Parse NEW image data from PHẦN 1 file
This file contains ALL data:
- Avatar nữ (lines 1-257)
- Avatar nam (lines 258-516)
- Post images by topic (lines 517+)

ONLY use images from this file - discard all old data
Filter for HIGH QUALITY images only (originals/, 736x)
"""
import re
import os
import sys

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# Source file - THE ONLY SOURCE
SOURCE_FILE = r"C:\Users\Jennie Chu\Downloads\=== PHẦN 1 AVATAR (500 hình) ===.txt"

# Output files
SEED_POST_FILE = r"C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\gem-mobile\src\services\seed\seedPostGenerator.js"
SEED_USER_FILE = r"C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\gem-mobile\src\services\seed\seedUserGenerator.js"


def is_high_quality_image(url):
    """
    Check if image URL is acceptable quality for POST IMAGES.
    Accept: 'originals/', '736x', '236x' (medium but still good for social media)
    Reject: '75x75', '150x150', '60x60', '140x140', '474x' (too small or blurry)
    """
    if not url:
        return False

    # Must contain pinimg.com
    if 'pinimg.com' not in url:
        return False

    # Reject very low quality thumbnails
    low_quality_patterns = ['75x75', '150x150', '/60x60/', '/140x140/']
    for pattern in low_quality_patterns:
        if pattern in url:
            return False

    # Accept good quality patterns (including 236x which is decent for social media)
    acceptable_patterns = ['originals/', '/736x/', '/236x/']
    for pattern in acceptable_patterns:
        if pattern in url:
            return True

    # Reject 474x (awkward size) and unknown
    return False


def is_avatar_quality(url):
    """
    For avatars, we accept 236x (medium quality) as well as high quality
    Since avatars are small, 236x is acceptable
    """
    if not url:
        return False

    if 'pinimg.com' not in url:
        return False

    # Reject very low quality
    low_quality_patterns = ['75x75', '150x150', '/60x60/', '/140x140/']
    for pattern in low_quality_patterns:
        if pattern in url:
            return False

    # Accept medium and high quality for avatars
    acceptable_patterns = ['originals/', '/736x/', '/236x/']
    for pattern in acceptable_patterns:
        if pattern in url:
            return True

    return False


def extract_urls_from_text(text, quality_filter='high'):
    """Extract all Pinterest URLs from text and filter by quality"""
    url_pattern = r"https?://[^\s'\"]+pinimg\.com[^\s'\"]*\.jpg"
    matches = re.findall(url_pattern, text)

    seen = set()
    urls = []
    rejected_count = 0

    for url in matches:
        # Clean URL
        clean_url = url.rstrip("',").rstrip('.')
        if clean_url in seen:
            continue
        seen.add(clean_url)

        # Apply quality filter
        if quality_filter == 'avatar':
            if is_avatar_quality(clean_url):
                urls.append(clean_url)
            else:
                rejected_count += 1
        else:  # high quality
            if is_high_quality_image(clean_url):
                urls.append(clean_url)
            else:
                rejected_count += 1

    return urls, rejected_count


def parse_file_by_sections(content):
    """Parse file content into sections based on keywords"""
    lines = content.split('\n')

    # Section boundaries (from grep results)
    sections = {
        'female_avatars': {'start': 0, 'end': 257, 'urls': []},
        'male_avatars': {'start': 258, 'end': 516, 'urls': []},
        'trading': {'start': 519, 'end': 684, 'urls': []},
        'crystal': {'start': 685, 'end': 940, 'urls': []},
        'loa': {'start': 941, 'end': 1093, 'urls': []},
        'education': {'start': 1094, 'end': 1352, 'urls': []},
        'wealth': {'start': 1353, 'end': 1426, 'urls': []},
        'affiliate': {'start': 1427, 'end': len(lines), 'urls': []},
    }

    return sections, lines


def extract_section_urls(lines, start, end, quality_filter='high'):
    """Extract URLs from a specific section of lines"""
    section_text = '\n'.join(lines[start:end])
    return extract_urls_from_text(section_text, quality_filter)


def update_seed_post_generator(post_images):
    """Update SAMPLE_IMAGES in seedPostGenerator.js"""
    print(f"\nReading: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Build new SAMPLE_IMAGES object
    new_sample_images = "const SAMPLE_IMAGES = {\n"
    categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']

    for cat in categories:
        urls = post_images.get(cat, [])
        new_sample_images += f"  {cat}: [\n"
        for url in urls:
            new_sample_images += f"    '{url}',\n"
        new_sample_images += "  ],\n"
    new_sample_images += "};"

    # Replace SAMPLE_IMAGES in file
    pattern = r'const SAMPLE_IMAGES = \{[\s\S]*?\};'
    if re.search(pattern, content):
        content = re.sub(pattern, new_sample_images, content)
        print("Replaced existing SAMPLE_IMAGES")
    else:
        print("ERROR: Could not find SAMPLE_IMAGES in file")
        return

    # Write back
    print(f"Writing: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'w', encoding='utf-8') as f:
        f.write(content)


def update_seed_user_generator(female_avatars, male_avatars):
    """Update avatar arrays in seedUserGenerator.js"""
    print(f"\nReading: {SEED_USER_FILE}")
    with open(SEED_USER_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Build new VIETNAMESE_FEMALE_AVATARS
    new_female = "const VIETNAMESE_FEMALE_AVATARS = [\n"
    for url in female_avatars:
        new_female += f"  '{url}',\n"
    new_female += "];"

    # Build new VIETNAMESE_MALE_AVATARS
    new_male = "const VIETNAMESE_MALE_AVATARS = [\n"
    for url in male_avatars:
        new_male += f"  '{url}',\n"
    new_male += "];"

    # Replace in content
    female_pattern = r'const VIETNAMESE_FEMALE_AVATARS = \[[\s\S]*?\];'
    male_pattern = r'const VIETNAMESE_MALE_AVATARS = \[[\s\S]*?\];'

    if re.search(female_pattern, content):
        content = re.sub(female_pattern, new_female, content)
        print(f"Replaced VIETNAMESE_FEMALE_AVATARS with {len(female_avatars)} URLs")
    else:
        print("ERROR: Could not find VIETNAMESE_FEMALE_AVATARS")

    if re.search(male_pattern, content):
        content = re.sub(male_pattern, new_male, content)
        print(f"Replaced VIETNAMESE_MALE_AVATARS with {len(male_avatars)} URLs")
    else:
        print("ERROR: Could not find VIETNAMESE_MALE_AVATARS")

    # Write back
    print(f"Writing: {SEED_USER_FILE}")
    with open(SEED_USER_FILE, 'w', encoding='utf-8') as f:
        f.write(content)


def main():
    print("=" * 60)
    print("PARSE NEW IMAGES FROM PHẦN 1 FILE")
    print("=" * 60)

    # Read source file
    print(f"\nReading: {SOURCE_FILE}")
    try:
        with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"ERROR: File not found: {SOURCE_FILE}")
        return

    sections, lines = parse_file_by_sections(content)

    # Extract avatars (allow 236x quality)
    print("\n" + "=" * 60)
    print("EXTRACTING AVATARS")
    print("=" * 60)

    female_urls, female_rejected = extract_section_urls(
        lines,
        sections['female_avatars']['start'],
        sections['female_avatars']['end'],
        'avatar'
    )
    print(f"  Female avatars: {len(female_urls)} URLs (rejected {female_rejected})")

    male_urls, male_rejected = extract_section_urls(
        lines,
        sections['male_avatars']['start'],
        sections['male_avatars']['end'],
        'avatar'
    )
    print(f"  Male avatars: {len(male_urls)} URLs (rejected {male_rejected})")

    # Extract post images (high quality only)
    print("\n" + "=" * 60)
    print("EXTRACTING POST IMAGES (HIGH QUALITY ONLY)")
    print("=" * 60)

    post_categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']
    post_images = {}

    for cat in post_categories:
        urls, rejected = extract_section_urls(
            lines,
            sections[cat]['start'],
            sections[cat]['end'],
            'high'
        )
        post_images[cat] = urls
        print(f"  {cat}: {len(urls)} high-quality URLs (rejected {rejected})")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Female avatars: {len(female_urls)}")
    print(f"  Male avatars: {len(male_urls)}")
    for cat in post_categories:
        print(f"  {cat} images: {len(post_images[cat])}")

    total_post_images = sum(len(urls) for urls in post_images.values())
    print(f"\n  TOTAL POST IMAGES: {total_post_images}")
    print(f"  TOTAL AVATARS: {len(female_urls) + len(male_urls)}")

    # Update files
    print("\n" + "=" * 60)
    print("UPDATING FILES")
    print("=" * 60)

    update_seed_post_generator(post_images)
    update_seed_user_generator(female_urls, male_urls)

    print("\n" + "=" * 60)
    print("ALL DONE!")
    print("=" * 60)


if __name__ == '__main__':
    main()
