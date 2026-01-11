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

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD POSITIONING - ĐÃ CALIBRATE, KHÔNG THAY ĐỔI!
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vị trí bottom khi keyboard ĐÓNG
 * = Tab bar height (~100px) + margin (~10px)
 *
 * Giá trị đúng: 110
 */
export const KEYBOARD_CLOSED_BOTTOM = 110;

/**
 * Offset thêm vào keyboard height khi keyboard MỞ
 * Formula: bottom = keyboardHeight + KEYBOARD_OPEN_OFFSET
 *
 * Giá trị đúng: 35
 * (Đã test: -10 bị che, +15 bị che nửa, +55 có gap, +35 vừa khít)
 */
export const KEYBOARD_OPEN_OFFSET = 35;

// ═══════════════════════════════════════════════════════════════════════════════
// OTHER LAYOUT VALUES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Padding cho FlatList content (inverted list nên dùng paddingTop)
 * Để chat content không bị input area che mất
 */
export const CHAT_CONTENT_BOTTOM_PADDING = 220;

/**
 * Padding khi keyboard MỞ (cần nhiều hơn để scroll được đến cuối)
 * = Input area height + keyboard height offset + extra space
 */
export const CHAT_CONTENT_KEYBOARD_PADDING = 180;

/**
 * Vị trí scroll-to-bottom button khi keyboard ĐÓNG
 * Increased from 210 to 260 to avoid being covered by sticky suggestion chips
 */
export const SCROLL_BUTTON_BOTTOM_CLOSED = 260;

/**
 * Offset cho scroll button khi keyboard MỞ
 * Formula: bottom = keyboardHeight + SCROLL_BUTTON_KEYBOARD_OFFSET
 */
export const SCROLL_BUTTON_KEYBOARD_OFFSET = 140;

/**
 * Background color cho input area
 * PHẢI là solid color để chat content không xuyên qua
 */
export const INPUT_AREA_BACKGROUND = '#0F1629';

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
