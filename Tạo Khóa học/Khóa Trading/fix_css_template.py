#!/usr/bin/env python3
"""
Script to fix CSS styling for GEM Trading Academy course files.
Changes black (#0a0a0f) background to navy (#0a1628) and adds proper template.
"""

import os
import re
import glob

# Correct CSS template
CORRECT_HEAD_START = '''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
'''

FONT_LINKS = '''
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
'''

CORRECT_CSS = '''
    <style>
        :root {
            --navy: #112250;
            --navy-dark: #0a1628;
            --gold: #FFBD59;
            --gold-dark: #E5A73D;
            --cyan: #00F0FF;
            --purple: #6A5BFF;
            --burgundy: #9C0612;
            --burgundy-light: #C41E2A;
            --success: #00C853;
            --error: #FF5252;
            --bg-primary: #0a1628;
            --bg-card: rgba(17, 34, 80, 0.6);
            --text-primary: #FFFFFF;
            --text-secondary: rgba(255, 255, 255, 0.85);
            --text-muted: rgba(255, 255, 255, 0.6);
            --glass-bg: rgba(17, 34, 80, 0.4);
            --glass-border: rgba(255, 189, 89, 0.2);
            --space-xs: 4px;
            --space-sm: 8px;
            --space-md: 16px;
            --space-lg: 24px;
            --space-xl: 32px;
            --radius-md: 12px;
            --radius-lg: 16px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Montserrat', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        img { max-width: 100%; height: auto; display: block; }

        .background-container {
            position: fixed;
            inset: 0;
            z-index: -1;
        }
        .bg-layer-base {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%);
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
        }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container, .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
        }
        @media (max-width: 600px) {
            .lesson-container, .container { padding: 0; }
        }

        .lesson-header {
            text-align: center;
            padding: var(--space-xl);
            margin-bottom: var(--space-xl);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        @media (max-width: 600px) {
            .lesson-header {
                padding: var(--space-lg) 16px;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }
        .lesson-badge, .tier-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm) var(--space-md);
            background: linear-gradient(135deg, var(--success), var(--cyan));
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: var(--space-md);
            color: var(--navy-dark);
        }
        .lesson-header h1, .lesson-title {
            font-size: clamp(1.75rem, 5vw, 2.5rem);
            font-weight: 800;
            margin-bottom: var(--space-md);
            background: linear-gradient(135deg, var(--text-primary), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .lesson-header p, .lesson-subtitle { color: var(--text-muted); }

        .section, .content-section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
            padding: var(--space-xl);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .section, .content-section {
                padding: var(--space-lg) 16px;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .section p, .section-content p, p {
            color: var(--text-secondary);
            margin-bottom: var(--space-md);
        }

        .section ul, .section-content ul, ul {
            color: var(--text-secondary);
            padding-left: 1.5em;
            margin-bottom: var(--space-md);
        }
        .section li, .section-content li, li { margin-bottom: var(--space-sm); color: var(--text-secondary); }
        li strong { color: var(--gold); }

        .image-placeholder, .image-container img {
            width: 100%;
            border-radius: var(--radius-md);
            margin: var(--space-lg) 0;
            border: 1px solid var(--glass-border);
        }
        @media (max-width: 600px) {
            .image-placeholder, .image-container img { border-radius: 0; border: none; margin: var(--space-md) 0; }
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05));
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .highlight-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .highlight-box h4 { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .warning-box {
            background: linear-gradient(135deg, rgba(255, 82, 82, 0.15), rgba(255, 82, 82, 0.05));
            border: 1px solid rgba(255, 82, 82, 0.3);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .warning-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--error);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .warning-box h4 { font-weight: 700; color: var(--error); margin-bottom: var(--space-sm); }
        .warning-box p { color: var(--text-secondary); margin: 0; }

        .definition-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02));
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .definition-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--cyan);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .definition-box h4 { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); }

        .success-box {
            background: linear-gradient(135deg, rgba(0, 200, 83, 0.15), rgba(0, 200, 83, 0.05));
            border: 1px solid rgba(0, 200, 83, 0.3);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .success-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--success);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .success-box h4 { font-weight: 700; color: var(--success); margin-bottom: var(--space-sm); }
        .success-box p { color: var(--text-secondary); margin: 0; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .stats-grid {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            text-align: center;
        }
        @media (max-width: 600px) {
            .stat-card { border: none; border-radius: 0; padding: var(--space-md); }
        }
        .stat-card .value {
            font-size: 1.5rem;
            font-weight: 700;
            display: block;
            margin-bottom: var(--space-xs);
            color: var(--cyan);
        }
        .stat-card .value.red { color: var(--error); }
        .stat-card .value.gold { color: var(--gold); }
        .stat-card .value.green { color: var(--success); }
        .stat-card .label { font-size: 0.85rem; color: var(--text-muted); }

        .summary-box {
            background: linear-gradient(135deg, rgba(0, 200, 83, 0.1), rgba(0, 200, 83, 0.02));
            border: 2px solid var(--success);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin: var(--space-xl) 0;
        }
        @media (max-width: 600px) {
            .summary-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--success);
                padding: var(--space-lg) 16px;
                margin: var(--space-md) 0;
            }
        }
        .summary-box h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--success);
            margin-bottom: var(--space-lg);
        }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li {
            display: flex;
            align-items: flex-start;
            gap: var(--space-sm);
            margin-bottom: var(--space-md);
            color: var(--text-secondary);
        }
        .summary-box li::before {
            content: "✓";
            color: var(--success);
            font-weight: 700;
        }

        .quiz-section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin-top: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-section {
                border: none;
                border-radius: 0;
                padding: var(--space-lg) 16px;
                margin-top: 0;
                border-top: 8px solid var(--bg-primary);
            }
        }
        .quiz-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-lg);
        }

        .quiz-question {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-question {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--purple);
                padding: var(--space-md) 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--glass-border);
            }
        }
        .quiz-question h4, .question-text {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--space-lg);
        }

        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        .quiz-option {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md);
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
            color: var(--text-secondary);
        }
        .quiz-option:hover:not(.disabled) {
            border-color: var(--gold);
            background: var(--bg-card);
        }
        .quiz-option.correct {
            border-color: var(--success) !important;
            background: rgba(0, 200, 83, 0.15) !important;
            color: var(--success);
        }
        .quiz-option.incorrect {
            border-color: var(--error) !important;
            background: rgba(255, 82, 82, 0.15) !important;
            color: var(--error);
        }

        .quiz-result {
            margin-top: var(--space-md);
            padding: var(--space-md);
            border-radius: var(--radius-md);
            display: none;
        }
        .quiz-result.show { display: block; }
        .quiz-result.correct {
            background: rgba(0, 200, 83, 0.15);
            border-left: 4px solid var(--success);
            color: var(--success);
        }
        .quiz-result.incorrect {
            background: rgba(255, 82, 82, 0.15);
            border-left: 4px solid var(--error);
            color: var(--error);
        }

        .quiz-score {
            text-align: center;
            padding: var(--space-xl);
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15), transparent);
            border: 1px solid var(--purple);
            border-radius: var(--radius-lg);
            margin-top: var(--space-lg);
            display: none;
        }
        .quiz-score.show { display: block; }
        .quiz-score h3, .quiz-score-text { color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-score p { color: var(--text-secondary); }

        .retake-btn {
            margin-top: var(--space-md);
            padding: var(--space-md) var(--space-xl);
            background: linear-gradient(135deg, var(--purple), var(--cyan));
            color: var(--navy-dark);
            border: none;
            border-radius: var(--radius-md);
            font-weight: 700;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: var(--space-xl);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            margin-top: var(--space-xl);
        }
        @media (max-width: 600px) {
            .lesson-footer {
                border: none;
                border-radius: 0;
                margin-top: 0;
                padding: var(--space-lg) 16px;
            }
        }
        .lesson-footer p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        .lesson-footer .highlight { color: var(--gold); font-weight: 600; }

        strong { color: var(--gold); }

        /* Additional classes for compatibility */
        .path-card, .whale-card, .pattern-card, .example-card, .trade-result, .phase-card, .checklist {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        .path-card h4, .whale-card h4, .pattern-card h4, .example-card h4 { color: var(--cyan); margin-bottom: var(--space-sm); }
        .path-card.gold h4 { color: var(--gold); }
        .path-card.green h4 { color: var(--success); }

        .stat-row { display: flex; justify-content: space-around; flex-wrap: wrap; gap: var(--space-md); margin: var(--space-lg) 0; }
        .stat-item { text-align: center; padding: var(--space-md); background: var(--bg-card); border-radius: var(--radius-md); flex: 1; min-width: 120px; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--cyan); }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-xs); }

        .whale-type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin: var(--space-lg) 0; }
        .whale-type { background: var(--bg-card); border-radius: var(--radius-md); padding: var(--space-lg); border-top: 3px solid var(--cyan); }
        .whale-type h4 { color: var(--text-primary); margin-bottom: var(--space-sm); }
        .whale-type .size { color: var(--gold); font-weight: 600; }

        .reason-list { background: var(--bg-card); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        .reason-item { display: flex; gap: var(--space-md); margin-bottom: var(--space-md); align-items: flex-start; }
        .reason-number { background: linear-gradient(135deg, var(--cyan), var(--purple)); color: var(--navy-dark); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .reason-content h4 { color: var(--text-primary); margin-bottom: var(--space-xs); }
    </style>
'''

BACKGROUND_CONTAINER = '''
    <div class="background-container">
        <div class="bg-layer-base"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>
'''

def fix_file(filepath):
    """Fix CSS in a single HTML file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if file has wrong CSS (black background)
        if '#0a0a0f' not in content and 'background: #0a0a0f' not in content:
            return False, "Already correct"

        # Extract title
        title_match = re.search(r'<title>(.*?)</title>', content)
        title = title_match.group(1) if title_match else "GEM Trading Academy"

        # Extract body content (everything between <body> and </body>)
        body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
        if not body_match:
            return False, "No body found"

        body_content = body_match.group(1)

        # Check if background container exists
        if 'background-container' not in body_content:
            # Add background container at the beginning of body
            body_content = BACKGROUND_CONTAINER + body_content

        # Build new file
        new_content = (
            CORRECT_HEAD_START +
            f'    <title>{title}</title>\n' +
            FONT_LINKS +
            CORRECT_CSS +
            '</head>\n<body>\n' +
            body_content +
            '\n</body>\n</html>\n'
        )

        # Write fixed file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return True, "Fixed"

    except Exception as e:
        return False, str(e)

def main():
    """Main function to fix all files."""
    base_path = os.path.dirname(os.path.abspath(__file__))

    # Find all HTML files
    patterns = [
        os.path.join(base_path, 'Tier-1-Co-ban', '*.html'),
        os.path.join(base_path, 'Tier-2-Nang-cao', '*.html'),
        os.path.join(base_path, 'Tier-3-Elite', '*.html'),
    ]

    fixed_count = 0
    skipped_count = 0
    error_count = 0

    for pattern in patterns:
        files = glob.glob(pattern)
        tier_name = os.path.basename(os.path.dirname(pattern))
        print(f"\n{'='*50}")
        print(f"Processing {tier_name}: {len(files)} files")
        print('='*50)

        for filepath in sorted(files):
            filename = os.path.basename(filepath)
            success, message = fix_file(filepath)

            if success:
                print(f"[OK] Fixed: {filename}")
                fixed_count += 1
            elif message == "Already correct":
                print(f"[--] Skipped (already correct): {filename}")
                skipped_count += 1
            else:
                print(f"[ERR] Error: {filename} - {message}")
                error_count += 1

    print(f"\n{'='*50}")
    print("SUMMARY")
    print('='*50)
    print(f"Fixed: {fixed_count}")
    print(f"Skipped (already correct): {skipped_count}")
    print(f"Errors: {error_count}")
    print(f"Total processed: {fixed_count + skipped_count + error_count}")

if __name__ == '__main__':
    main()
