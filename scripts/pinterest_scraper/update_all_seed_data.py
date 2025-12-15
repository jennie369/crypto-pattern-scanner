"""
Parse all seed data files:
1. Update SAMPLE_IMAGES from PHẦN 1 + PHẦN 2 files (combined)
2. Parse 500 posts from 6 category files
3. Update seedPostGenerator.js with new content
"""
import re
import os
import sys
import json
from pathlib import Path

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# File paths - PHẦN 1 has loa/education/affiliate, PHẦN 2 has trading/crystal/wealth
IMAGES_FILE_1 = r"C:\Users\Jennie Chu\Downloads\=== PHẦN 1 AVATAR (500 hình) ===.txt"
IMAGES_FILE_2 = r"C:\Users\Jennie Chu\Downloads\=== PHẦN 2 HÌNH POST (800 hình) ===.txt"

# Find Wealth file with leading spaces in name
DOWNLOADS_DIR = Path(r"C:\Users\Jennie Chu\Downloads")
WEALTH_FILE = None
for f in DOWNLOADS_DIR.glob("*WEALTH*.txt"):
    WEALTH_FILE = str(f)
    break

POST_FILES = {
    'trading': r"C:\Users\Jennie Chu\Downloads\1. TRADING & CRYPTO (100 bài).txt",
    'crystal': r"C:\Users\Jennie Chu\Downloads\2. CRYSTAL & ĐÁ QUÝ (80 bài).txt",
    'loa': r"C:\Users\Jennie Chu\Downloads\3. LAW OF ATTRACTION & MANIFESTATIO.txt",
    'education': r"C:\Users\Jennie Chu\Downloads\4. EDUCATION & HỌC TẬP (80 bài).txt",
    'wealth': WEALTH_FILE,
    'affiliate': r"C:\Users\Jennie Chu\Downloads\6. AFFILIATE & KINH DOANH (80 bài).txt",
}
SEED_POST_FILE = r"C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\gem-mobile\src\services\seed\seedPostGenerator.js"

def is_high_quality_image(url):
    """
    Check if image URL is high quality.
    High quality patterns: 'originals/', '736x'
    Low quality patterns: '236x', '75x75', '474x', '150x150'
    """
    # Must be high quality
    high_quality_patterns = ['originals/', '/736x/']
    # Reject low quality
    low_quality_patterns = ['75x75', '150x150', '236x/', '474x/', '/60x60/', '/140x140/']

    # Check for low quality first (reject)
    for pattern in low_quality_patterns:
        if pattern in url:
            return False

    # Check for high quality (accept)
    for pattern in high_quality_patterns:
        if pattern in url:
            return True

    # Default: reject unknown quality
    return False

def extract_category_urls(content, category):
    """Extract URLs for a specific SAMPLE_IMAGES category - ONLY HIGH QUALITY"""
    pattern = rf'{category}:\s*\['
    match = re.search(pattern, content)
    if not match:
        print(f"Could not find category: {category}")
        return []

    start_idx = match.end()
    bracket_count = 1
    end_idx = start_idx
    while bracket_count > 0 and end_idx < len(content):
        if content[end_idx] == '[':
            bracket_count += 1
        elif content[end_idx] == ']':
            bracket_count -= 1
        end_idx += 1

    section = content[start_idx:end_idx-1]
    url_pattern = r"https?://[^\s'\"]+pinimg\.com[^\s'\"]*"
    matches = re.findall(url_pattern, section)

    seen = set()
    urls = []
    rejected_count = 0
    for url in matches:
        clean_url = url.rstrip("',")
        if clean_url not in seen:
            seen.add(clean_url)
            # Filter for high quality only
            if is_high_quality_image(clean_url):
                urls.append(clean_url)
            else:
                rejected_count += 1

    if rejected_count > 0:
        print(f"    (rejected {rejected_count} low-quality images)")

    return urls

def extract_posts_from_file(filepath, category):
    """Extract posts from a category file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"  File not found: {filepath}")
        return []

    # Find JSON in the file
    json_start = content.find('{')
    if json_start == -1:
        print(f"  No JSON found in {filepath}")
        return []

    # Find matching closing brace
    brace_count = 0
    json_end = json_start
    for i, char in enumerate(content[json_start:], json_start):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                json_end = i + 1
                break

    json_str = content[json_start:json_end]

    try:
        data = json.loads(json_str)
        posts = data.get('posts', [])
        print(f"  {category}: Found {len(posts)} posts")
        return posts
    except json.JSONDecodeError as e:
        print(f"  JSON parse error in {filepath}: {e}")
        # Try to extract posts manually
        return extract_posts_manually(content, category)

def extract_posts_manually(content, category):
    """Fallback: Extract posts using regex"""
    posts = []

    # Pattern to match individual post objects
    pattern = r'\{\s*"category"\s*:\s*"[^"]+"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hashtags"\s*:\s*\[(.*?)\]\s*\}'

    matches = re.findall(pattern, content, re.DOTALL)

    for match in matches:
        content_text = match[0]
        hashtags_str = match[1]

        # Parse hashtags
        hashtags = re.findall(r'"([^"]+)"', hashtags_str)

        posts.append({
            'category': category,
            'content': content_text,
            'hashtags': hashtags
        })

    print(f"  {category}: Extracted {len(posts)} posts manually")
    return posts

def update_images(images_content_1, images_content_2, post_content):
    """Update SAMPLE_IMAGES in seedPostGenerator.js from both source files"""
    print("\n" + "=" * 60)
    print("UPDATING POST IMAGES")
    print("=" * 60)

    categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']
    category_urls = {}

    # PHẦN 2 has: trading, crystal, wealth
    # PHẦN 1 has: loa, education, affiliate (also has trading/crystal but fewer)
    for cat in categories:
        # Try PHẦN 2 first for trading/crystal/wealth
        urls = extract_category_urls(images_content_2, cat)
        # If not found or empty, try PHẦN 1
        if not urls:
            urls = extract_category_urls(images_content_1, cat)
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

def update_posts_content(all_posts, post_content):
    """Update SAMPLE_POSTS in seedPostGenerator.js"""
    print("\n" + "=" * 60)
    print("UPDATING POST CONTENT")
    print("=" * 60)

    # Build new SAMPLE_POSTS object
    new_sample_posts = "const SAMPLE_POSTS = {\n"

    categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']

    for cat in categories:
        cat_posts = [p for p in all_posts if p.get('category') == cat]
        print(f"  {cat}: {len(cat_posts)} posts")

        new_sample_posts += f"  {cat}: [\n"
        for post in cat_posts:
            # Properly escape for JS single-quoted strings
            content = post.get('content', '')
            content = content.replace('\\', '\\\\')  # Escape backslashes first
            content = content.replace("'", "\\'")    # Escape single quotes
            content = content.replace('\n', '\\n')   # Escape newlines
            content = content.replace('\r', '\\r')   # Escape carriage returns
            hashtags = post.get('hashtags', [])
            hashtags_str = ', '.join([f"'{h}'" for h in hashtags])

            new_sample_posts += f"    {{\n"
            new_sample_posts += f"      content: '{content}',\n"
            new_sample_posts += f"      hashtags: [{hashtags_str}],\n"
            new_sample_posts += f"    }},\n"
        new_sample_posts += "  ],\n"

    new_sample_posts += "};"

    # Check if SAMPLE_POSTS exists
    if 'const SAMPLE_POSTS' in post_content:
        pattern = r'const SAMPLE_POSTS = \{[\s\S]*?\};'
        post_content = re.sub(pattern, new_sample_posts, post_content)
    else:
        # Insert after SAMPLE_IMAGES
        insert_point = post_content.find('const SAMPLE_IMAGES')
        if insert_point != -1:
            # Find end of SAMPLE_IMAGES
            end_pattern = r'const SAMPLE_IMAGES = \{[\s\S]*?\};'
            match = re.search(end_pattern, post_content)
            if match:
                insert_pos = match.end()
                post_content = post_content[:insert_pos] + '\n\n' + new_sample_posts + post_content[insert_pos:]

    print(f"Updated with {len(all_posts)} total posts")
    return post_content

def main():
    print("=" * 60)
    print("UPDATE ALL SEED DATA")
    print("=" * 60)

    # 1. Read BOTH images files
    print(f"\nReading images file 1 (avatars + some post images): {IMAGES_FILE_1}")
    try:
        with open(IMAGES_FILE_1, 'r', encoding='utf-8') as f:
            images_content_1 = f.read()
    except FileNotFoundError:
        print("Images file 1 not found!")
        images_content_1 = ""

    print(f"Reading images file 2 (post images): {IMAGES_FILE_2}")
    try:
        with open(IMAGES_FILE_2, 'r', encoding='utf-8') as f:
            images_content_2 = f.read()
    except FileNotFoundError:
        print("Images file 2 not found!")
        images_content_2 = ""

    # 2. Read all post files
    print("\nReading post files:")
    all_posts = []
    for category, filepath in POST_FILES.items():
        if filepath is None:
            print(f"  {category}: File path is None, skipping")
            continue
        posts = extract_posts_from_file(filepath, category)
        all_posts.extend(posts)

    print(f"\nTotal posts collected: {len(all_posts)}")

    # 3. Read seedPostGenerator.js
    print(f"\nReading: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'r', encoding='utf-8') as f:
        seed_post_content = f.read()

    # 4. Update images from BOTH files
    if images_content_1 or images_content_2:
        seed_post_content = update_images(images_content_1, images_content_2, seed_post_content)

    # 5. Update posts content
    if all_posts:
        seed_post_content = update_posts_content(all_posts, seed_post_content)

    # 6. Write back
    print(f"\nWriting: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'w', encoding='utf-8') as f:
        f.write(seed_post_content)

    print("\n" + "=" * 60)
    print("ALL DONE!")
    print("=" * 60)

if __name__ == '__main__':
    main()
