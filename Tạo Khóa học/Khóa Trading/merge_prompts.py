#!/usr/bin/env python3
"""
Script to merge all prompt files into one complete file
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Read the original file (first 1400 lines - before summaries)
original_file = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_COMPLETE.txt")
ch4_upd = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_CH4_UPD.txt")
ch5_dpu = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_CH5_DPU.txt")
ch6_classic = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_CH6_CLASSIC.txt")
tier1_ch7_10 = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_TIER1_CH7_10.txt")
tier1_ch9_10 = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_TIER1_CH9_10.txt")
tier2_complete = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_TIER2_COMPLETE.txt")
tier3_complete = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_TIER3_COMPLETE.txt")
output_file = os.path.join(BASE_DIR, "PROMPTS_HINH_ANH_CANVA_ALL_COMPLETE.txt")

print("[INFO] Starting merge process...")

# Read original file
with open(original_file, 'r', encoding='utf-8') as f:
    original_content = f.read()

# Find the position where summaries start (now looking for Chapter 4 summaries)
lines = original_content.split('\n')
cut_line = 0

# Look for "BÀI 4.2" summary section (where detailed prompts end for Chapter 3)
for i, line in enumerate(lines):
    if "BÀI 4.2 - 4.6: UPD PATTERN" in line or "BÀI 4.2:" in line:
        # Go back a few lines to include the separator
        cut_line = i - 3
        break

if cut_line == 0:
    # Alternative: look for end of Chapter 3 content (after BÀI 3.6)
    for i, line in enumerate(lines):
        if "CHƯƠNG 4: UPD" in line or "CHUONG 4: UPD" in line:
            cut_line = i - 2
            break

if cut_line == 0:
    # Look for old marker
    for i, line in enumerate(lines):
        if "CHƯƠNG 7-10: TIER 1" in line or "CHUONG 7-10: TIER 1" in line:
            cut_line = i - 2
            break

# If still not found, use a safe default (cut before chapter 4)
if cut_line == 0:
    cut_line = 1200

print(f"[INFO] Cutting original file at line {cut_line}")

# Get the header portion
header_content = '\n'.join(lines[:cut_line])

# Read new content files
new_contents = []

# Chapter 4 UPD
try:
    with open(ch4_upd, 'r', encoding='utf-8') as f:
        new_contents.append(f.read())
    print("[OK] Read Chapter 4 UPD prompts")
except FileNotFoundError:
    print("[SKIP] Chapter 4 UPD file not found")

# Chapter 5 DPU
try:
    with open(ch5_dpu, 'r', encoding='utf-8') as f:
        new_contents.append(f.read())
    print("[OK] Read Chapter 5 DPU prompts")
except FileNotFoundError:
    print("[SKIP] Chapter 5 DPU file not found")

# Chapter 6 Classic Patterns
try:
    with open(ch6_classic, 'r', encoding='utf-8') as f:
        new_contents.append(f.read())
    print("[OK] Read Chapter 6 Classic Patterns prompts")
except FileNotFoundError:
    print("[SKIP] Chapter 6 Classic Patterns file not found")

# Tier 1 Chapter 7-10
try:
    with open(tier1_ch7_10, 'r', encoding='utf-8') as f:
        new_contents.append(f.read())
    print("[OK] Read Tier 1 Chapter 7-10 prompts")
except FileNotFoundError:
    print("[SKIP] Tier 1 Chapter 7-10 file not found")

# Tier 1 Chapter 9-10 (Module A/B)
try:
    with open(tier1_ch9_10, 'r', encoding='utf-8') as f:
        new_contents.append(f.read())
    print("[OK] Read Tier 1 Chapter 9-10 prompts")
except FileNotFoundError:
    print("[SKIP] Tier 1 Chapter 9-10 file not found")

# Tier 2 Complete
try:
    with open(tier2_complete, 'r', encoding='utf-8') as f:
        new_contents.append(f.read())
    print("[OK] Read Tier 2 complete prompts")
except FileNotFoundError:
    print("[SKIP] Tier 2 file not found")

# Tier 3 Complete
try:
    with open(tier3_complete, 'r', encoding='utf-8') as f:
        new_contents.append(f.read())
    print("[OK] Read Tier 3 complete prompts")
except FileNotFoundError:
    print("[SKIP] Tier 3 file not found")

# Combine all content
final_content = header_content + "\n\n" + "\n\n".join(new_contents)

# Add footer
footer = """

================================================================================
                              KET THUC FILE PROMPTS
================================================================================

Tong so hinh anh: ~440 hinh
- TIER 1 Chapter 3: ~25 hinh (UPU Pattern)
- TIER 1 Chapter 4: 16 hinh (UPD Pattern)
- TIER 1 Chapter 5: 18 hinh (DPU Pattern)
- TIER 1 Chapter 6: 19 hinh (Classic Patterns)
- TIER 1 Chapter 7-10: ~48 hinh (Paper Trading, AI, Module A/B)
- TIER 2: ~130 hinh (43 bai x 3 hinh)
- TIER 3: ~110 hinh (37 bai x 3 hinh)

Moi hinh deu co:
- ENFORCE notes ve size ratio va font
- DESIGN SYSTEM GENERAL table
- NOI DUNG HINH chi tiet
- QUY TAC VE NEN CANDLESTICK (cho cac hinh co chart)

GEM TRADING ACADEMY - 2025
"""

final_content += footer

# Write output file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(final_content)

print(f"[OK] Successfully created: {output_file}")
print(f"[INFO] Total lines: {len(final_content.split(chr(10)))}")
