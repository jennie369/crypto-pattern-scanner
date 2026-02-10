/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    GEM MASTER SCREEN - LAYOUT CONSTANTS                       ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  ⚠️  CẢNH BÁO: KHÔNG ĐƯỢC THAY ĐỔI CÁC GIÁ TRỊ NÀY!                          ║
 * ║                                                                              ║
 * ║  Các giá trị này đã được calibrate cẩn thận cho keyboard positioning.        ║
 * ║  Nếu thay đổi sẽ gây ra lỗi hiển thị input field.                           ║
 * ║                                                                              ║
 * ║  Last calibrated: 2024-12-18                                                 ║
 * ║  Tested on: Android Samsung (keyboard height ~329px)                         ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * CÁCH HOẠT ĐỘNG:
 * ===============
 * Input area sử dụng `position: absolute` với `bottom: X`
 *
 * - Khi keyboard ĐÓNG: bottom = KEYBOARD_CLOSED_BOTTOM
 *   → Input nằm trên tab bar
 *
 * - Khi keyboard MỞ: bottom = keyboardHeight + KEYBOARD_OPEN_OFFSET
 *   → Input nằm sát trên keyboard, không có gap
 *
 * TROUBLESHOOTING:
 * ================
 *
 * ❌ Input bị tab bar che (keyboard đóng):
 *    → Tăng KEYBOARD_CLOSED_BOTTOM
 *
 * ❌ Input bị keyboard che (keyboard mở):
 *    → Tăng KEYBOARD_OPEN_OFFSET
 *
 * ❌ Có gap giữa input và keyboard (keyboard mở):
 *    → Giảm KEYBOARD_OPEN_OFFSET
 *
 * ❌ Input bị cắt 1-2 pixel:
 *    → Tăng giá trị tương ứng thêm 5-10
 */

import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD POSITIONING - ĐÃ CALIBRATE, KHÔNG THAY ĐỔI!
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vị trí bottom khi keyboard ĐÓNG
 *
 * Android: 110 = Tab bar height (~100px) + margin (~10px)
 * iOS: 78 = GlassBottomTab top (bottom:6 + height:76 = 82) - 4px overlap
 *
 * GlassBottomTab: position absolute, bottom: 6, height: 76
 * → pill top = 82px from screen bottom
 * react-native-shadow-2 v7 uses absolute SVGs → no layout padding
 * Input must overlap tab bar by a few px to prevent any visible gap
 */
export const KEYBOARD_CLOSED_BOTTOM = Platform.OS === 'ios' ? 78 : 110;

/**
 * Offset thêm vào keyboard height khi keyboard MỞ
 * Formula: bottom = keyboardHeight + KEYBOARD_OPEN_OFFSET
 *
 * Android: 35 (Samsung keyboard ~329px)
 * iOS: 0 (iOS reports full keyboard height including safe area)
 */
export const KEYBOARD_OPEN_OFFSET = Platform.OS === 'ios' ? 0 : 35;

// ═══════════════════════════════════════════════════════════════════════════════
// OTHER LAYOUT VALUES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Padding cho FlatList content (inverted list nên dùng paddingTop)
 * Để chat content không bị input area che mất
 *
 * iOS: Lower because KEYBOARD_CLOSED_BOTTOM is 78 (vs Android 110)
 */
export const CHAT_CONTENT_BOTTOM_PADDING = Platform.OS === 'ios' ? 188 : 220;

/**
 * Padding khi keyboard MỞ (cần nhiều hơn để scroll được đến cuối)
 * = Input area height + keyboard height offset + extra space
 */
export const CHAT_CONTENT_KEYBOARD_PADDING = 180;

/**
 * Vị trí scroll-to-bottom button khi keyboard ĐÓNG
 * Increased from 210 to 260 to avoid being covered by sticky suggestion chips
 *
 * iOS: Lower to match KEYBOARD_CLOSED_BOTTOM = 78
 */
export const SCROLL_BUTTON_BOTTOM_CLOSED = Platform.OS === 'ios' ? 228 : 260;

/**
 * Offset cho scroll button khi keyboard MỞ
 * Formula: bottom = keyboardHeight + SCROLL_BUTTON_KEYBOARD_OFFSET
 */
export const SCROLL_BUTTON_KEYBOARD_OFFSET = 140;

/**
 * Background color cho input area
 * PHẢI là solid color để chat content không xuyên qua
 * Màu phải match với bottom của GRADIENTS.background ('#0F1030')
 */
export const INPUT_AREA_BACKGROUND = '#0F1030';

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  // Keyboard positioning (QUAN TRỌNG)
  KEYBOARD_CLOSED_BOTTOM,
  KEYBOARD_OPEN_OFFSET,

  // Other layout
  CHAT_CONTENT_BOTTOM_PADDING,
  CHAT_CONTENT_KEYBOARD_PADDING,
  SCROLL_BUTTON_BOTTOM_CLOSED,
  SCROLL_BUTTON_KEYBOARD_OFFSET,
  INPUT_AREA_BACKGROUND,
};
