"""
Parse avatar URLs and post images from text file
Update seedUserGenerator.js and seedPostGenerator.js
"""
import re
import os
import sys

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# File paths
DATA_FILE = r"C:\Users\Jennie Chu\Downloads\=== PHẦN 1 AVATAR (500 hình) ===.txt"
SEED_USER_FILE = r"C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\gem-mobile\src\services\seed\seedUserGenerator.js"
SEED_POST_FILE = r"C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\gem-mobile\src\services\seed\seedPostGenerator.js"

def extract_urls(content, start_marker, end_marker='];'):
    """Extract URLs between markers"""
    urls = []

    # Find the section
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print(f"Could not find marker: {start_marker}")
        return urls

    # Find the end of the array
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        end_idx = len(content)

    section = content[start_idx:end_idx]

    # Extract all URLs (pinimg.com URLs)
    url_pattern = r"https?://[^\s'\"]+pinimg\.com[^\s'\"]*"
    matches = re.findall(url_pattern, section)

    # Clean up URLs and deduplicate
    seen = set()
    for url in matches:
        clean_url = url.rstrip("',")
        if clean_url not in seen:
            seen.add(clean_url)
            urls.append(clean_url)

    return urls

def extract_category_urls(content, category):
    """Extract URLs for a specific SAMPLE_IMAGES category"""
    # Find the category start
    pattern = rf'{category}:\s*\['
    match = re.search(pattern, content)
    if not match:
        print(f"Could not find category: {category}")
        return []

    start_idx = match.end()

    # Find the closing bracket for this array
    bracket_count = 1
    end_idx = start_idx
    while bracket_count > 0 and end_idx < len(content):
        if content[end_idx] == '[':
            bracket_count += 1
        elif content[end_idx] == ']':
            bracket_count -= 1
        end_idx += 1

    section = content[start_idx:end_idx-1]

    # Extract URLs
    url_pattern = r"https?://[^\s'\"]+pinimg\.com[^\s'\"]*"
    matches = re.findall(url_pattern, section)

    # Clean and deduplicate
    seen = set()
    urls = []
    for url in matches:
        clean_url = url.rstrip("',")
        if clean_url not in seen:
            seen.add(clean_url)
            urls.append(clean_url)

    return urls

def update_avatars(content, seed_content):
    """Update avatar URLs in seedUserGenerator.js"""
    print("\n" + "=" * 60)
    print("UPDATING AVATARS")
    print("=" * 60)

    # Extract female and male URLs
    female_urls = extract_urls(content, 'VIETNAMESE_FEMALE_AVATARS')
    male_urls = extract_urls(content, 'VIETNAMESE_MALE_AVATARS')

    print(f"Found {len(female_urls)} female avatar URLs")
    print(f"Found {len(male_urls)} male avatar URLs")

    if len(female_urls) == 0 or len(male_urls) == 0:
        print("ERROR: Could not extract avatar URLs!")
        return seed_content

    # Generate new arrays
    female_array = "const VIETNAMESE_FEMALE_AVATARS = [\n"
    for url in female_urls:
        female_array += f"  '{url}',\n"
    female_array += "];"

    male_array = "const VIETNAMESE_MALE_AVATARS = [\n"
    for url in male_urls:
        male_array += f"  '{url}',\n"
    male_array += "];"

    # Replace the arrays in the file
    female_pattern = r'const VIETNAMESE_FEMALE_AVATARS = \[[\s\S]*?\];'
    seed_content = re.sub(female_pattern, female_array, seed_content)

    male_pattern = r'const VIETNAMESE_MALE_AVATARS = \[[\s\S]*?\];'
    seed_content = re.sub(male_pattern, male_array, seed_content)

    print(f"Updated with {len(female_urls)} female + {len(male_urls)} male avatars")

    return seed_content

def update_post_images(content, post_content):
    """Update SAMPLE_IMAGES in seedPostGenerator.js"""
    print("\n" + "=" * 60)
    print("UPDATING POST IMAGES")
    print("=" * 60)

    categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']
    category_urls = {}

    for cat in categories:
        urls = extract_category_urls(content, cat)
        category_urls[cat] = urls
        print(f"  {cat}: {len(urls)} URLs")

    # Build new SAMPLE_IMAGES object
    new_sample_images = "const SAMPLE_IMAGES = {\n"
    for cat in categories:
        new_sample_images += f"  {cat}: [\n"
        for url in category_urls[cat]:
            new_sample_images += f"    '{url}',\n"
        new_sample_images += "  ],\n"
    new_sample_images += "};"

    # Replace in file
    pattern = r'const SAMPLE_IMAGES = \{[\s\S]*?\};'
    post_content = re.sub(pattern, new_sample_images, post_content)

    total = sum(len(urls) for urls in category_urls.values())
    print(f"Updated with {total} total post images")

    return post_content

def main():
    print("=" * 60)
    print("UPDATE PINTEREST IMAGES")
    print("=" * 60)

    # Read data file
    print(f"\nReading: {DATA_FILE}")
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data_content = f.read()

    # Update avatars
    print(f"\nReading: {SEED_USER_FILE}")
    with open(SEED_USER_FILE, 'r', encoding='utf-8') as f:
        seed_user_content = f.read()

    seed_user_content = update_avatars(data_content, seed_user_content)

    print(f"\nWriting: {SEED_USER_FILE}")
    with open(SEED_USER_FILE, 'w', encoding='utf-8') as f:
        f.write(seed_user_content)

    # Update post images
    print(f"\nReading: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'r', encoding='utf-8') as f:
        seed_post_content = f.read()

    seed_post_content = update_post_images(data_content, seed_post_content)

    print(f"\nWriting: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'w', encoding='utf-8') as f:
        f.write(seed_post_content)

    print("\n" + "=" * 60)
    print("ALL DONE!")
    print("=" * 60)

if __name__ == '__main__':
    main()
