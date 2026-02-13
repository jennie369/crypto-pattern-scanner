"""
Parse POST CONTENT from 6 category files
Each file contains JSON with posts array
Update SAMPLE_POSTS in seedPostGenerator.js
"""
import re
import sys
import json
from pathlib import Path

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# File paths
DOWNLOADS_DIR = Path(r"C:\Users\Jennie Chu\Downloads")
SEED_POST_FILE = r"C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\gem-mobile\src\services\seed\seedPostGenerator.js"

# Find files - handle special characters in filenames
POST_FILES = {
    'trading': r"C:\Users\Jennie Chu\Downloads\1. TRADING & CRYPTO (100 bài).txt",
    'crystal': r"C:\Users\Jennie Chu\Downloads\2. CRYSTAL & ĐÁ QUÝ (80 bài).txt",
    'loa': r"C:\Users\Jennie Chu\Downloads\3. LAW OF ATTRACTION & MANIFESTATIO.txt",
    'education': r"C:\Users\Jennie Chu\Downloads\4. EDUCATION & HỌC TẬP (80 bài).txt",
    'wealth': None,  # Will search for it
    'affiliate': r"C:\Users\Jennie Chu\Downloads\6. AFFILIATE & KINH DOANH (80 bài).txt",
}

# Find wealth file (has leading spaces in name)
for f in DOWNLOADS_DIR.glob("*WEALTH*.txt"):
    POST_FILES['wealth'] = str(f)
    break


def extract_posts_from_file(filepath, category):
    """Extract ALL posts from a category file - scan ALL "content" fields directly"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"  File not found: {filepath}")
        return []

    posts = []

    # DIRECT METHOD: Extract ALL "content" and "hashtags" pairs from the entire file
    # This works regardless of JSON structure or multiple blocks

    # Find all content strings (everything inside "content": "...")
    # Using a more robust pattern that handles nested quotes
    content_pattern = r'"content"\s*:\s*"((?:[^"\\]|\\.)*)"'
    hashtag_pattern = r'"hashtags"\s*:\s*\[((?:[^\]]*?))\]'

    content_matches = list(re.finditer(content_pattern, content, re.DOTALL))
    hashtag_matches = list(re.finditer(hashtag_pattern, content, re.DOTALL))

    print(f"    Found {len(content_matches)} content fields, {len(hashtag_matches)} hashtag fields")

    # Match each content with the nearest following hashtag
    for i, content_match in enumerate(content_matches):
        content_text = content_match.group(1)
        content_pos = content_match.end()

        # The regex captured escaped JSON content, need to keep \n as literal \n for JS
        # Don't unescape anything - keep the content exactly as it was in the JSON

        # Find the hashtag that comes right after this content
        hashtags = []
        for hashtag_match in hashtag_matches:
            if hashtag_match.start() > content_pos:
                # This is the hashtag for this content
                hashtags_str = hashtag_match.group(1)
                hashtags = re.findall(r'"([^"]+)"', hashtags_str)
                break

        # Only add if content is substantial (not just whitespace or too short)
        if len(content_text.strip()) > 20:
            posts.append({
                'category': category,
                'content': content_text,
                'hashtags': hashtags
            })

    print(f"  {category}: Found {len(posts)} posts")
    return posts


def update_sample_posts(all_posts):
    """Update SAMPLE_POSTS in seedPostGenerator.js"""
    print(f"\nReading: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Build new SAMPLE_POSTS object
    categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']
    new_sample_posts = "const SAMPLE_POSTS = {\n"

    for cat in categories:
        cat_posts = [p for p in all_posts if p.get('category') == cat]
        print(f"  {cat}: {len(cat_posts)} posts")

        new_sample_posts += f"  {cat}: [\n"
        for post in cat_posts:
            # Properly escape for JS single-quoted strings
            content_text = post.get('content', '')
            # Escape backslashes first, then single quotes, then newlines
            content_text = content_text.replace('\\', '\\\\')  # Escape backslashes
            content_text = content_text.replace("'", "\\'")    # Escape single quotes
            content_text = content_text.replace('\n', '\\n')   # Escape actual newlines
            content_text = content_text.replace('\r', '')      # Remove carriage returns

            hashtags = post.get('hashtags', [])
            hashtags_str = ', '.join([f"'{h}'" for h in hashtags])

            new_sample_posts += f"    {{\n"
            new_sample_posts += f"      content: '{content_text}',\n"
            new_sample_posts += f"      hashtags: [{hashtags_str}],\n"
            new_sample_posts += f"    }},\n"
        new_sample_posts += "  ],\n"

    new_sample_posts += "};"

    # Check if SAMPLE_POSTS exists and replace
    pattern = r'const SAMPLE_POSTS = \{[\s\S]*?\};'
    if re.search(pattern, content):
        content = re.sub(pattern, new_sample_posts, content)
        print("\n  Replaced existing SAMPLE_POSTS")
    else:
        # Insert after SAMPLE_IMAGES
        print("\n  SAMPLE_POSTS not found, inserting after SAMPLE_IMAGES")
        images_pattern = r'(const SAMPLE_IMAGES = \{[\s\S]*?\};)'
        content = re.sub(images_pattern, r'\1\n\n' + new_sample_posts, content)

    # Write back
    print(f"\nWriting: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'w', encoding='utf-8') as f:
        f.write(content)


def main():
    print("=" * 60)
    print("PARSE POST CONTENT FROM 6 CATEGORY FILES")
    print("=" * 60)

    # Read all post files
    print("\nReading post files:")
    all_posts = []

    for category, filepath in POST_FILES.items():
        if filepath is None:
            print(f"  {category}: File path is None, skipping")
            continue
        posts = extract_posts_from_file(filepath, category)
        all_posts.extend(posts)

    print(f"\nTotal posts collected: {len(all_posts)}")

    # Summary by category
    print("\n" + "=" * 60)
    print("SUMMARY BY CATEGORY")
    print("=" * 60)

    categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']
    for cat in categories:
        count = len([p for p in all_posts if p.get('category') == cat])
        print(f"  {cat}: {count} posts")

    # Update seedPostGenerator.js
    print("\n" + "=" * 60)
    print("UPDATING SAMPLE_POSTS")
    print("=" * 60)

    update_sample_posts(all_posts)

    print("\n" + "=" * 60)
    print("ALL DONE!")
    print("=" * 60)


if __name__ == '__main__':
    main()
