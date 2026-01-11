/**
 * Avatar Assets - Placeholder Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Add avatar images to this folder:
 *    - default.png (fallback avatar)
 *    - sufu.png (Su Phu - spiritual guide)
 *    - cogiao.png (Co Giao - crystal expert)
 *    - banthan.png (Ban Than - friendly companion)
 *
 * 2. Image requirements:
 *    - Portrait orientation (9:16 aspect ratio recommended)
 *    - Minimum 512x912 pixels
 *    - PNG format with transparent background recommended
 *    - Face centered and visible for lip-sync
 *
 * 3. For MuseTalk server:
 *    - Copy same images to C:\Projects\MuseTalk\avatars\
 *    - Name format: sufu.png, cogiao.png, banthan.png
 */

// Placeholder exports - replace with actual images
// export { default as sufu } from './sufu.png';
// export { default as cogiao } from './cogiao.png';
// export { default as banthan } from './banthan.png';
// export { default as defaultAvatar } from './default.png';

// For now, use a fallback approach in components
export const AVATAR_PLACEHOLDER = {
  sufu: null,
  cogiao: null,
  banthan: null,
  default: null,
};

export default AVATAR_PLACEHOLDER;
