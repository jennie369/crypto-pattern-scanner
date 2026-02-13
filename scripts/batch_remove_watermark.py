"""
Batch Watermark Remover + Optimizer
Xoa watermark Gemini/AI o goc phai duoi, resize, optimize va convert sang WebP

Usage:
    python batch_remove_watermark.py
    python batch_remove_watermark.py "D:\\Claude Projects\\ANH LANDING PAGE GEMRAL"
    python batch_remove_watermark.py --width 80 --height 35 --max-width 1200
"""

import cv2
import numpy as np
import os
import sys
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Default folder
DEFAULT_FOLDER = r"D:\Claude Projects\ẢNH LANDING PAGE GEMRAL"

def get_watermark_position(img_width, img_height, wm_percent=3.5, padding_percent=1.0, corner='bottom_right'):
    """
    Tính toán vị trí watermark dựa trên PERCENTAGE của ảnh

    Gemini watermark: ngôi sao vàng nhỏ ở góc phải dưới
    - Kích thước: khoảng 2-4% chiều rộng ảnh
    - Padding: khoảng 0.5-1.5% từ mép

    Args:
        img_width, img_height: Kích thước ảnh
        wm_percent: Kích thước watermark theo % của chiều nhỏ nhất (default 3.5%)
        padding_percent: Padding từ mép theo % (default 1.0%)
        corner: 'bottom_right', 'bottom_left', 'top_right', 'top_left'

    Returns:
        (x1, y1, x2, y2, corner): Coordinates của vùng watermark
    """
    # Tính kích thước watermark theo % của chiều nhỏ nhất
    min_dimension = min(img_width, img_height)
    wm_size = int(min_dimension * wm_percent / 100)
    padding = int(min_dimension * padding_percent / 100)

    # Watermark Gemini thường là hình vuông (ngôi sao)
    wm_width = wm_size
    wm_height = wm_size

    # Tính coordinates
    if corner == 'bottom_right':
        x1 = img_width - wm_width - padding
        y1 = img_height - wm_height - padding
        x2 = img_width - padding
        y2 = img_height - padding
    elif corner == 'bottom_left':
        x1 = padding
        y1 = img_height - wm_height - padding
        x2 = wm_width + padding
        y2 = img_height - padding
    elif corner == 'top_right':
        x1 = img_width - wm_width - padding
        y1 = padding
        x2 = img_width - padding
        y2 = wm_height + padding
    else:  # top_left
        x1 = padding
        y1 = padding
        x2 = wm_width + padding
        y2 = wm_height + padding

    return x1, y1, x2, y2, corner, wm_size


def remove_watermark_and_optimize(input_path, output_path=None,
                                   corner='bottom_right',
                                   wm_percent=5.0,
                                   padding_percent=0.3,
                                   inpaint_radius=20,
                                   max_width=1200,
                                   max_height=None,
                                   webp_quality=85):
    """
    Xóa watermark Gemini (ngôi sao vàng), resize và optimize thành WebP

    Args:
        input_path: Đường dẫn file ảnh
        output_path: Đường dẫn output (None = auto tạo .webp)
        corner: Vị trí watermark ('bottom_right', 'bottom_left', 'top_right', 'top_left')
        wm_percent: Kích thước watermark theo % của ảnh (default 3.5%)
        padding_percent: Padding từ mép theo % (default 1.0%)
        inpaint_radius: Bán kính inpainting
        max_width: Chiều rộng tối đa sau resize (None = không resize)
        max_height: Chiều cao tối đa sau resize (None = tự tính theo tỷ lệ)
        webp_quality: Chất lượng WebP (0-100, 85 là tốt)
    """
    try:
        # Đọc ảnh - workaround cho Unicode path trên Windows
        # cv2.imread không hỗ trợ Unicode path, dùng numpy để đọc
        try:
            img = cv2.imdecode(np.fromfile(input_path, dtype=np.uint8), cv2.IMREAD_UNCHANGED)
        except Exception:
            img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

        if img is None:
            return False, f"Cannot read: {input_path}", 0, 0

        original_size = os.path.getsize(input_path)
        h, w = img.shape[:2]

        # ========== STEP 1: REMOVE WATERMARK ==========
        # Tạo mask cho vùng watermark
        mask = np.zeros((h, w), dtype=np.uint8)

        # Xác định vị trí watermark (percentage-based)
        x1, y1, x2, y2, detected_corner, wm_size = get_watermark_position(
            w, h, wm_percent, padding_percent, corner
        )

        # Đảm bảo coordinates hợp lệ
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)

        # Vẽ mask (vùng trắng = vùng cần xóa)
        mask[y1:y2, x1:x2] = 255

        # Xử lý ảnh có alpha channel (PNG với transparency)
        has_alpha = len(img.shape) == 3 and img.shape[2] == 4

        if has_alpha:
            bgr = img[:, :, :3]
            alpha = img[:, :, 3]
            # Step 1: Inpaint to remove watermark
            result_bgr = cv2.inpaint(bgr, mask, inpaint_radius, cv2.INPAINT_NS)
            # Step 2: Apply extra blur and darken the watermark area
            blur_region = result_bgr[y1:y2, x1:x2].astype(np.float32)
            blurred = cv2.GaussianBlur(blur_region, (21, 21), 0)
            # Darken slightly to remove glow
            darkened = (blurred * 0.85).clip(0, 255).astype(np.uint8)
            result_bgr[y1:y2, x1:x2] = darkened
            result = cv2.merge([result_bgr[:,:,0], result_bgr[:,:,1], result_bgr[:,:,2], alpha])
        else:
            # Step 1: Inpaint to remove watermark
            result = cv2.inpaint(img, mask, inpaint_radius, cv2.INPAINT_NS)
            # Step 2: Apply extra blur and darken the watermark area
            blur_region = result[y1:y2, x1:x2].astype(np.float32)
            blurred = cv2.GaussianBlur(blur_region, (21, 21), 0)
            # Darken slightly to remove glow
            darkened = (blurred * 0.85).clip(0, 255).astype(np.uint8)
            result[y1:y2, x1:x2] = darkened

        # ========== STEP 2: RESIZE ==========
        if max_width and w > max_width:
            scale = max_width / w
            new_w = max_width
            new_h = int(h * scale)
            result = cv2.resize(result, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        elif max_height and h > max_height:
            scale = max_height / h
            new_h = max_height
            new_w = int(w * scale)
            result = cv2.resize(result, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

        # ========== STEP 3: CONVERT TO WEBP & OPTIMIZE ==========
        if output_path is None:
            base = os.path.splitext(input_path)[0]
            output_path = f"{base}.webp"

        # Encode và save WebP - dùng imencode + tofile để hỗ trợ Unicode path
        # cv2.imwrite không hỗ trợ Unicode path trên Windows
        encode_params = [cv2.IMWRITE_WEBP_QUALITY, webp_quality]
        success_encode, encoded = cv2.imencode('.webp', result, encode_params)

        if not success_encode:
            return False, f"Failed to encode WebP: {input_path}", 0, 0

        # Ghi file bằng numpy tofile để hỗ trợ Unicode path
        encoded.tofile(output_path)

        new_size = os.path.getsize(output_path)
        reduction = ((original_size - new_size) / original_size) * 100

        return True, output_path, original_size, new_size

    except Exception as e:
        return False, str(e), 0, 0


def format_size(size_bytes):
    """Format bytes to human readable"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"


def batch_process(folder_path=None, pattern="*.*",
                  output_folder=None,
                  corner='bottom_right',
                  wm_percent=5.0,
                  padding_percent=0.3,
                  max_width=1200,
                  webp_quality=85,
                  delete_original=False,
                  max_workers=4):
    """
    Xử lý batch: Xóa watermark Gemini + Resize + Optimize WebP

    Args:
        folder_path: Thư mục chứa ảnh (default: ẢNH LANDING PAGE GEMRAL)
        pattern: Pattern tìm file (e.g., "Gemini_*.png", "*.jpg")
        output_folder: Thư mục output (None = cùng folder, thay đổi extension)
        corner: Vị trí watermark ('bottom_right', 'bottom_left', etc.)
        wm_percent: Kích thước watermark theo % của ảnh (default 3.5%)
        padding_percent: Padding từ mép theo % (default 1.0%)
        max_width: Chiều rộng tối đa (resize nếu lớn hơn)
        webp_quality: Chất lượng WebP (0-100)
        delete_original: Xóa file gốc sau khi convert
        max_workers: Số thread xử lý song song
    """

    # Use default folder if not specified
    if folder_path is None:
        folder_path = DEFAULT_FOLDER

    folder = Path(folder_path)
    if not folder.exists():
        print(f"Error: Folder not found: {folder_path}")
        return

    # Tìm tất cả file ảnh (không phải webp đã convert)
    image_extensions = ['*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG']
    files = []

    if pattern and pattern != "*.*":
        files = list(folder.glob(pattern))
    else:
        for ext in image_extensions:
            files.extend(folder.glob(ext))

    # Loại bỏ file đã là webp
    files = [f for f in files if f.suffix.lower() != '.webp']

    if not files:
        print(f"No image files found in: {folder_path}")
        return

    print(f"\n{'='*65}")
    print(f"  BATCH GEMINI WATERMARK REMOVER + OPTIMIZER")
    print(f"{'='*65}")
    print(f"  Folder: {folder_path}")
    print(f"  Files found: {len(files)}")
    print(f"  Watermark: {corner} ({wm_percent}% size, {padding_percent}% padding)")
    print(f"  Max width: {max_width}px")
    print(f"  WebP quality: {webp_quality}")
    print(f"  Output: .webp (same folder)")
    print(f"{'='*65}\n")

    # Stats
    total_original = 0
    total_new = 0
    success_count = 0
    fail_count = 0
    results = []

    def process_file(file_path):
        # Output sẽ là file .webp cùng tên, cùng folder
        if output_folder:
            out_dir = Path(output_folder)
            out_dir.mkdir(parents=True, exist_ok=True)
            output_path = str(out_dir / (file_path.stem + '.webp'))
        else:
            output_path = str(file_path.with_suffix('.webp'))

        return remove_watermark_and_optimize(
            str(file_path),
            output_path,
            corner=corner,
            wm_percent=wm_percent,
            padding_percent=padding_percent,
            max_width=max_width,
            webp_quality=webp_quality
        ), file_path

    # Parallel processing
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_file = {executor.submit(process_file, f): f for f in files}

        for i, future in enumerate(as_completed(future_to_file), 1):
            (success, result, orig_size, new_size), file_path = future.result()

            if success:
                success_count += 1
                total_original += orig_size
                total_new += new_size
                reduction = ((orig_size - new_size) / orig_size * 100) if orig_size > 0 else 0

                print(f"  [{i}/{len(files)}] ✓ {file_path.name}")
                print(f"            {format_size(orig_size)} → {format_size(new_size)} (-{reduction:.1f}%)")

                # Xóa file gốc nếu được yêu cầu
                if delete_original and file_path.exists():
                    file_path.unlink()
            else:
                fail_count += 1
                print(f"  [{i}/{len(files)}] ✗ {file_path.name} - {result}")

    # Summary
    total_reduction = ((total_original - total_new) / total_original * 100) if total_original > 0 else 0

    print(f"\n{'='*65}")
    print(f"  COMPLETED!")
    print(f"{'='*65}")
    print(f"  Success: {success_count}/{len(files)}")
    if fail_count > 0:
        print(f"  Failed: {fail_count}")
    print(f"  Total original: {format_size(total_original)}")
    print(f"  Total optimized: {format_size(total_new)}")
    print(f"  Total saved: {format_size(total_original - total_new)} (-{total_reduction:.1f}%)")
    print(f"{'='*65}\n")


def main():
    parser = argparse.ArgumentParser(
        description='Batch remove Gemini watermarks + resize + optimize to WebP',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Examples:
  # Chạy với folder mặc định
  python batch_remove_watermark.py

  # Chỉ định folder khác
  python batch_remove_watermark.py "D:\\My Images"

  # Tùy chỉnh kích thước vùng watermark (percentage)
  python batch_remove_watermark.py --wm-percent 4.0 --padding-percent 1.5

  # Resize nhỏ hơn và chất lượng cao hơn
  python batch_remove_watermark.py --max-width 1000 --quality 90

  # Xóa file gốc sau khi convert
  python batch_remove_watermark.py --delete-original

Default folder: {DEFAULT_FOLDER}
        """
    )

    parser.add_argument('folder', nargs='?', default=None,
                        help=f'Folder containing images (default: {DEFAULT_FOLDER})')
    parser.add_argument('--pattern', '-p', default='*.*',
                        help='File pattern (default: *.* for all PNG/JPG)')
    parser.add_argument('--output', '-o', default=None,
                        help='Output folder (default: same folder as .webp)')
    parser.add_argument('--corner', '-c', default='bottom_right',
                        choices=['bottom_right', 'bottom_left', 'top_right', 'top_left'],
                        help='Watermark corner position (default: bottom_right)')
    parser.add_argument('--wm-percent', type=float, default=5.0,
                        help='Watermark size as %% of image (default: 5.0)')
    parser.add_argument('--padding-percent', type=float, default=0.3,
                        help='Padding from edge as %% of image (default: 0.3)')
    parser.add_argument('--max-width', '-mw', type=int, default=1200,
                        help='Max image width after resize (default: 1200)')
    parser.add_argument('--quality', '-q', type=int, default=85,
                        help='WebP quality 0-100 (default: 85)')
    parser.add_argument('--delete-original', '-d', action='store_true',
                        help='Delete original files after conversion')
    parser.add_argument('--workers', '-w', type=int, default=4,
                        help='Number of parallel workers (default: 4)')

    args = parser.parse_args()

    batch_process(
        folder_path=args.folder,
        pattern=args.pattern,
        output_folder=args.output,
        corner=args.corner,
        wm_percent=args.wm_percent,
        padding_percent=args.padding_percent,
        max_width=args.max_width,
        webp_quality=args.quality,
        delete_original=args.delete_original,
        max_workers=args.workers
    )


if __name__ == "__main__":
    # Fix encoding for Windows console
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    # Nếu không có arguments, chạy với folder mặc định
    if len(sys.argv) == 1:
        print("""
===================================================================
      BATCH WATERMARK REMOVER + OPTIMIZER -> WebP
===================================================================
  * Remove watermark AI (Gemini, etc.) using inpainting
  * Resize image to max 1200px width
  * Convert to WebP (reduce 60-80% file size)
===================================================================
        """)
        print(f"  Default folder: {DEFAULT_FOLDER}")
        print("===================================================================")
        print("  Running with default folder...")
        print("===================================================================\n")
        batch_process()
    else:
        main()
