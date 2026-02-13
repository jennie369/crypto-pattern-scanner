#!/usr/bin/env python3
"""
Script to fix CSS in Tier 1 Chapters 5-10
Replaces <style>...</style> block with Master CSS from bai 3.2
"""
import re
import os
import glob
import sys

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Read master CSS from working file
master_file = os.path.join(BASE_DIR, "tier-1-bai-3.2-upu-cau-truc-3-phases.html")

print("[INFO] Reading master CSS from:", master_file)

with open(master_file, 'r', encoding='utf-8') as f:
    master_content = f.read()

# Extract the <style>...</style> block
style_match = re.search(r'<style>.*?</style>', master_content, re.DOTALL)
if not style_match:
    print("[ERROR] Could not find <style> block in master file!")
    exit(1)

master_css = style_match.group(0)
print(f"[OK] Extracted master CSS ({len(master_css)} characters)")

# Files to fix - Chapters 5 through 10
patterns = [
    "tier-1-bai-5.*.html",
    "tier-1-bai-6.*.html",
    "tier-1-bai-7.*.html",
    "tier-1-bai-8.*.html",
    "tier-1-bai-9.*.html",
    "tier-1-bai-10.*.html"
]

files_to_fix = []
for pattern in patterns:
    matched = glob.glob(os.path.join(BASE_DIR, pattern))
    files_to_fix.extend(matched)

# Sort files for consistent output
files_to_fix.sort()

print(f"\n[INFO] Found {len(files_to_fix)} files to fix:")
for f in files_to_fix:
    print(f"  - {os.path.basename(f)}")

# Fix each file
fixed_count = 0
error_count = 0

print("\n[INFO] Starting CSS replacement...")

for filepath in files_to_fix:
    filename = os.path.basename(filepath)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if file has <style> block
        if '<style>' not in content:
            print(f"[SKIP] {filename} - No <style> block found")
            continue

        # Replace <style>...</style> with master CSS
        new_content = re.sub(r'<style>.*?</style>', master_css, content, flags=re.DOTALL)

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        fixed_count += 1
        print(f"[FIXED] {filename}")

    except Exception as e:
        error_count += 1
        print(f"[ERROR] {filename}: {str(e)}")

print(f"\n" + "="*60)
print(f"[SUMMARY]")
print(f"  Total files found: {len(files_to_fix)}")
print(f"  Files fixed: {fixed_count}")
print(f"  Errors: {error_count}")
print(f"="*60)

if fixed_count > 0:
    print("\n[SUCCESS] CSS has been updated in all files!")
    print("[NEXT] Now expand content in each file to 1,200+ words")
