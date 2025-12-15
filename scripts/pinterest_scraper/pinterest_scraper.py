"""
Pinterest Image URL Scraper
Scrapes image URLs from Pinterest search results for Vietnamese/Asian Douyin-style images
"""

import time
import json
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Configuration
SCROLL_PAUSE_TIME = 2
MAX_SCROLLS = 50
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Search queries for different categories
SEARCH_QUERIES = {
    # Avatar searches - Female (need 250)
    'avatar_female': [
        'vietnamese girl selfie aesthetic',
        'asian girl selfie douyin',
        'cô gái việt nam đẹp',
        'gái xinh việt nam selfie',
        'chinese girl selfie aesthetic',
        'korean girl selca aesthetic',
    ],
    # Avatar searches - Male (need 250)
    'avatar_male': [
        'vietnamese boy handsome aesthetic',
        'asian boy selfie douyin',
        'trai đẹp việt nam',
        'handsome chinese boy aesthetic',
        'korean boy selca aesthetic',
    ],
    # Post images by category (need ~800 total)
    'post_trading': [
        'asian woman working laptop',
        'vietnamese business woman',
        'asian entrepreneur aesthetic',
    ],
    'post_crystal': [
        'asian woman meditation',
        'vietnamese girl yoga',
        'asian wellness aesthetic',
    ],
    'post_loa': [
        'happy asian woman aesthetic',
        'vietnamese girl happy lifestyle',
        'asian girl positive vibes',
    ],
    'post_education': [
        'asian student studying',
        'vietnamese girl reading book',
        'asian learning aesthetic',
    ],
    'post_wealth': [
        'asian woman success lifestyle',
        'vietnamese girl luxury aesthetic',
        'asian wealthy lifestyle',
    ],
    'post_affiliate': [
        'asian influencer product',
        'vietnamese girl review',
        'asian beauty blogger',
    ],
}


def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--disable-notifications')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
    chrome_options.add_experimental_option('useAutomationExtension', False)

    # User agent to avoid detection
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # Remove webdriver flag
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    return driver


def scroll_page(driver, num_scrolls=MAX_SCROLLS):
    """Scroll page to load more images"""
    last_height = driver.execute_script("return document.body.scrollHeight")

    for i in range(num_scrolls):
        # Scroll down
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(SCROLL_PAUSE_TIME)

        # Check if we've reached the bottom
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            print(f"  Reached bottom after {i+1} scrolls")
            break
        last_height = new_height

        if (i + 1) % 10 == 0:
            print(f"  Scrolled {i+1} times...")


def extract_image_urls(driver):
    """Extract image URLs from Pinterest page"""
    urls = set()

    # Try multiple selectors for Pinterest images
    selectors = [
        'img[src*="pinimg.com"]',
        'img[srcset*="pinimg.com"]',
        'div[data-test-id="pin"] img',
        'div[data-grid-item] img',
    ]

    for selector in selectors:
        try:
            images = driver.find_elements(By.CSS_SELECTOR, selector)
            for img in images:
                # Try src first
                src = img.get_attribute('src')
                if src and 'pinimg.com' in src:
                    # Get highest quality version
                    url = src.replace('/236x/', '/736x/').replace('/474x/', '/736x/')
                    urls.add(url)

                # Try srcset
                srcset = img.get_attribute('srcset')
                if srcset and 'pinimg.com' in srcset:
                    # Parse srcset and get largest
                    parts = srcset.split(',')
                    for part in parts:
                        url = part.strip().split(' ')[0]
                        if 'pinimg.com' in url:
                            url = url.replace('/236x/', '/736x/').replace('/474x/', '/736x/')
                            urls.add(url)
        except Exception as e:
            print(f"  Error with selector {selector}: {e}")

    return list(urls)


def search_pinterest(driver, query, target_count=100):
    """Search Pinterest and collect image URLs"""
    print(f"\nSearching: {query}")

    # Navigate to Pinterest search
    search_url = f"https://www.pinterest.com/search/pins/?q={query.replace(' ', '%20')}"
    driver.get(search_url)

    # Wait for page to load
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'img[src*="pinimg.com"]'))
        )
    except:
        print(f"  Timeout waiting for images")
        return []

    time.sleep(2)

    # Scroll to load more images
    all_urls = set()
    scroll_count = 0

    while len(all_urls) < target_count and scroll_count < MAX_SCROLLS:
        # Extract URLs
        new_urls = extract_image_urls(driver)
        all_urls.update(new_urls)

        print(f"  Found {len(all_urls)} images so far...")

        if len(all_urls) >= target_count:
            break

        # Scroll more
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(SCROLL_PAUSE_TIME)
        scroll_count += 1

    urls_list = list(all_urls)[:target_count]
    print(f"  Collected {len(urls_list)} URLs from '{query}'")

    return urls_list


def scrape_category(driver, category, queries, target_per_query=50):
    """Scrape images for a category"""
    print(f"\n{'='*60}")
    print(f"CATEGORY: {category}")
    print(f"{'='*60}")

    all_urls = []

    for query in queries:
        urls = search_pinterest(driver, query, target_per_query)
        all_urls.extend(urls)

        # Delay between searches
        time.sleep(3)

    # Remove duplicates
    unique_urls = list(set(all_urls))
    print(f"\nTotal unique URLs for {category}: {len(unique_urls)}")

    return unique_urls


def main():
    """Main scraping function"""
    print("="*60)
    print("PINTEREST IMAGE URL SCRAPER")
    print("For Vietnamese/Asian Douyin-style images")
    print("="*60)

    # Results storage
    results = {
        'avatar_female': [],
        'avatar_male': [],
        'post_trading': [],
        'post_crystal': [],
        'post_loa': [],
        'post_education': [],
        'post_wealth': [],
        'post_affiliate': [],
    }

    # Target counts
    targets = {
        'avatar_female': 250,
        'avatar_male': 250,
        'post_trading': 150,
        'post_crystal': 150,
        'post_loa': 150,
        'post_education': 100,
        'post_wealth': 100,
        'post_affiliate': 150,
    }

    driver = None

    try:
        print("\nSetting up Chrome driver...")
        driver = setup_driver()
        print("Driver ready!")

        # Scrape each category
        for category, queries in SEARCH_QUERIES.items():
            target = targets.get(category, 100)
            per_query = target // len(queries) + 20  # Extra buffer

            urls = scrape_category(driver, category, queries, per_query)
            results[category] = urls[:target]

            # Save progress after each category
            save_results(results)

            # Longer delay between categories
            time.sleep(5)

        print("\n" + "="*60)
        print("SCRAPING COMPLETE!")
        print("="*60)

        # Print summary
        print("\nSUMMARY:")
        total = 0
        for category, urls in results.items():
            count = len(urls)
            total += count
            print(f"  {category}: {count} URLs")
        print(f"\nTOTAL: {total} URLs")

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if driver:
            driver.quit()
            print("\nBrowser closed.")

        # Final save
        save_results(results)


def save_results(results):
    """Save results to JSON file"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Save combined JSON
    output_file = os.path.join(OUTPUT_DIR, f'pinterest_urls_{timestamp}.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nSaved to: {output_file}")

    # Also save latest version
    latest_file = os.path.join(OUTPUT_DIR, 'pinterest_urls_latest.json')
    with open(latest_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Generate JavaScript code for easy copy-paste
    js_output = os.path.join(OUTPUT_DIR, 'image_urls_for_code.js')
    with open(js_output, 'w', encoding='utf-8') as f:
        f.write("// Pinterest Image URLs for GEM Mobile Seed Content\n")
        f.write(f"// Generated: {timestamp}\n\n")

        f.write("// Female Avatars\n")
        f.write("const VIETNAMESE_FEMALE_AVATARS = [\n")
        for url in results.get('avatar_female', []):
            f.write(f"  '{url}',\n")
        f.write("];\n\n")

        f.write("// Male Avatars\n")
        f.write("const VIETNAMESE_MALE_AVATARS = [\n")
        for url in results.get('avatar_male', []):
            f.write(f"  '{url}',\n")
        f.write("];\n\n")

        f.write("// Post Images by Category\n")
        f.write("const SAMPLE_IMAGES = {\n")
        for category in ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate']:
            key = f'post_{category}'
            urls = results.get(key, [])
            f.write(f"  {category}: [\n")
            for url in urls:
                f.write(f"    '{url}',\n")
            f.write("  ],\n")
        f.write("};\n")

    print(f"Generated JS code: {js_output}")


if __name__ == '__main__':
    main()
