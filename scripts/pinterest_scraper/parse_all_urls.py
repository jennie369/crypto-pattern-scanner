"""
Parse ALL URL FEED POSTS.txt file
Extract avatars (male/female) and post images by category
Update seedUserGenerator.js and seedPostGenerator.js

File structure (by line numbers from grep):
- Line 4-273: VIETNAMESE_FEMALE_AVATARS
- Line 274-632: VIETNAMESE_MALE_AVATARS
- Line 633-860: trading
- Line 861-1026: crystal
- Line 1027-1416: loa
- Line 1417-1754: education
- Line 1755-1928: wealth
- Line 1929+: affiliate
"""
import re
import sys

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# File paths
SOURCE_FILE = r"C:\Users\Jennie Chu\Downloads\ALL URL FEED POSTS.txt"
SEED_USER_FILE = r"C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\gem-mobile\src\services\seed\seedUserGenerator.js"
SEED_POST_FILE = r"C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\gem-mobile\src\services\seed\seedPostGenerator.js"

# Section boundaries (from grep results - approximate, we'll parse more carefully)
SECTIONS = {
    'female_avatars': {'start_keyword': 'VIETNAMESE_FEMALE_AVATARS', 'end_keyword': 'VIETNAMESE_MALE_AVATARS'},
    'male_avatars': {'start_keyword': 'VIETNAMESE_MALE_AVATARS', 'end_keyword': 'trading:'},
    'trading': {'start_keyword': 'trading:', 'end_keyword': 'crystal:'},
    'crystal': {'start_keyword': 'crystal:', 'end_keyword': 'loa:'},
    'loa': {'start_keyword': 'loa:', 'end_keyword': 'education:'},
    'education': {'start_keyword': 'education:', 'end_keyword': 'wealth:'},
    'wealth': {'start_keyword': 'wealth:', 'end_keyword': 'affiliate:'},
    'affiliate': {'start_keyword': 'affiliate:', 'end_keyword': None},  # Until end of file
}


def extract_urls_from_text(text):
    """Extract all Pinterest URLs from text"""
    url_pattern = r"https?://i\.pinimg\.com[^\s'\"]+\.jpg"
    matches = re.findall(url_pattern, text)

    seen = set()
    urls = []
    for url in matches:
        # Clean URL
        clean_url = url.rstrip("',].;")
        if clean_url not in seen:
            seen.add(clean_url)
            urls.append(clean_url)

    return urls


def is_high_quality(url):
    """Check if URL is high quality (736x or originals)"""
    return '/736x/' in url or '/originals/' in url


def parse_sections(content):
    """Parse content into sections based on keywords"""
    results = {}

    for section_name, config in SECTIONS.items():
        start_keyword = config['start_keyword']
        end_keyword = config['end_keyword']

        # Find start position
        start_idx = content.find(start_keyword)
        if start_idx == -1:
            print(f"Warning: Could not find {start_keyword}")
            results[section_name] = []
            continue

        # Find end position
        if end_keyword:
            end_idx = content.find(end_keyword, start_idx + len(start_keyword))
            if end_idx == -1:
                end_idx = len(content)
        else:
            end_idx = len(content)

        # Extract section text
        section_text = content[start_idx:end_idx]

        # Extract URLs
        urls = extract_urls_from_text(section_text)

        # Filter for high quality
        high_quality_urls = [url for url in urls if is_high_quality(url)]

        results[section_name] = high_quality_urls
        print(f"  {section_name}: {len(high_quality_urls)} high-quality URLs (from {len(urls)} total)")

    return results


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
        print(f"  Replaced VIETNAMESE_FEMALE_AVATARS with {len(female_avatars)} URLs")
    else:
        print("  ERROR: Could not find VIETNAMESE_FEMALE_AVATARS")

    if re.search(male_pattern, content):
        content = re.sub(male_pattern, new_male, content)
        print(f"  Replaced VIETNAMESE_MALE_AVATARS with {len(male_avatars)} URLs")
    else:
        print("  ERROR: Could not find VIETNAMESE_MALE_AVATARS")

    # Write back
    print(f"Writing: {SEED_USER_FILE}")
    with open(SEED_USER_FILE, 'w', encoding='utf-8') as f:
        f.write(content)


def update_seed_post_generator(post_images):
    """Update SAMPLE_IMAGES in seedPostGenerator.js"""
    print(f"\nReading: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Build new SAMPLE_IMAGES object
    categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']
    new_sample_images = "const SAMPLE_IMAGES = {\n"

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
        print("  Replaced existing SAMPLE_IMAGES")
    else:
        print("  ERROR: Could not find SAMPLE_IMAGES in file")
        return

    # Write back
    print(f"Writing: {SEED_POST_FILE}")
    with open(SEED_POST_FILE, 'w', encoding='utf-8') as f:
        f.write(content)


def main():
    print("=" * 60)
    print("PARSE ALL URL FEED POSTS FILE")
    print("=" * 60)

    # Read source file
    print(f"\nReading: {SOURCE_FILE}")
    try:
        with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"ERROR: File not found: {SOURCE_FILE}")
        return

    print(f"File size: {len(content)} characters")

    # Parse sections
    print("\n" + "=" * 60)
    print("PARSING SECTIONS")
    print("=" * 60)

    sections = parse_sections(content)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    female_avatars = sections.get('female_avatars', [])
    male_avatars = sections.get('male_avatars', [])

    print(f"  Female avatars: {len(female_avatars)}")
    print(f"  Male avatars: {len(male_avatars)}")

    post_categories = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']
    post_images = {cat: sections.get(cat, []) for cat in post_categories}

    for cat in post_categories:
        print(f"  {cat} images: {len(post_images[cat])}")

    total_post = sum(len(post_images[cat]) for cat in post_categories)
    print(f"\n  TOTAL POST IMAGES: {total_post}")
    print(f"  TOTAL AVATARS: {len(female_avatars) + len(male_avatars)}")

    # Update files
    print("\n" + "=" * 60)
    print("UPDATING FILES")
    print("=" * 60)

    update_seed_user_generator(female_avatars, male_avatars)
    update_seed_post_generator(post_images)

    print("\n" + "=" * 60)
    print("ALL DONE!")
    print("=" * 60)


if __name__ == '__main__':
    main()
