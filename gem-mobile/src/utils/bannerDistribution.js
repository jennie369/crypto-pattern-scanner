/**
 * Banner Distribution Utility
 *
 * Distributes sponsor banners evenly throughout content
 * instead of showing all banners clustered at the top.
 *
 * Algorithm:
 * - Calculate positions based on content count and banner count
 * - Banners are spread evenly: position = Math.floor(contentCount / (bannerCount + 1)) * (bannerIndex + 1)
 * - Example: 10 sections, 4 banners -> positions: 2, 4, 6, 8
 */

/**
 * Calculate banner positions for even distribution
 * @param {number} contentCount - Total number of content items (sections, products, posts)
 * @param {number} bannerCount - Number of banners to distribute
 * @param {object} options - Distribution options
 * @param {number} options.minGap - Minimum gap between banners (default: 2)
 * @param {number} options.startAfter - Show first banner after this many items (default: 1)
 * @returns {number[]} Array of positions where banners should be inserted
 */
export function calculateBannerPositions(contentCount, bannerCount, options = {}) {
  const { minGap = 2, startAfter = 1 } = options;

  if (bannerCount === 0 || contentCount === 0) {
    return [];
  }

  const positions = [];

  // Available space for distribution (after startAfter point)
  const availableSpace = contentCount - startAfter;

  if (availableSpace <= 0) {
    // Not enough content, just put first banner after startAfter if possible
    if (contentCount >= startAfter) {
      positions.push(startAfter);
    }
    return positions.slice(0, bannerCount);
  }

  // Calculate interval between banners
  // interval = availableSpace / (bannerCount + 1) ensures banners don't cluster at end
  const interval = Math.max(minGap, Math.floor(availableSpace / (bannerCount + 1)));

  for (let i = 0; i < bannerCount; i++) {
    const position = startAfter + (i + 1) * interval;

    // Don't place banner beyond content
    if (position <= contentCount) {
      positions.push(position);
    }
  }

  return positions;
}

/**
 * Interleave banners with content items
 * @param {Array} content - Array of content items (sections, products, posts)
 * @param {Array} banners - Array of banner objects
 * @param {object} options - Distribution options
 * @returns {Array} Mixed array with content and banners
 */
export function interleaveBannersWithContent(content, banners, options = {}) {
  if (!banners || banners.length === 0) {
    return content.map(item => ({ type: 'content', data: item }));
  }

  if (!content || content.length === 0) {
    // DON'T show banners when content is empty (e.g., during loading/refresh)
    // Banners should only appear mixed with actual content
    return [];
  }

  const positions = calculateBannerPositions(content.length, banners.length, options);
  const result = [];
  let bannerIndex = 0;

  content.forEach((item, index) => {
    // Add content item
    result.push({ type: 'content', data: item });

    // Check if we should insert a banner after this item
    if (bannerIndex < banners.length && positions[bannerIndex] === index + 1) {
      result.push({ type: 'banner', data: banners[bannerIndex] });
      bannerIndex++;
    }
  });

  // Add any remaining banners at the end (if not enough content)
  while (bannerIndex < banners.length) {
    result.push({ type: 'banner', data: banners[bannerIndex] });
    bannerIndex++;
  }

  return result;
}

/**
 * Get banner positions for a specific screen type
 * Different screens may have different distribution strategies
 * @param {string} screenType - Type of screen (shop, forum, scanner, etc.)
 * @param {number} contentCount - Number of content items
 * @param {number} bannerCount - Number of banners
 * @returns {number[]} Array of positions
 */
export function getScreenBannerPositions(screenType, contentCount, bannerCount) {
  switch (screenType) {
    case 'shop':
      // Shop: Show first banner after 1 section, then every 2 sections
      return calculateBannerPositions(contentCount, bannerCount, {
        minGap: 2,
        startAfter: 1
      });

    case 'forum':
    case 'home':
      // Forum/Home: Show first banner after 3 posts, then every 5 posts
      return calculateBannerPositions(contentCount, bannerCount, {
        minGap: 5,
        startAfter: 3
      });

    case 'scanner':
      // Scanner: Show first banner after 2 items, then every 3 items
      return calculateBannerPositions(contentCount, bannerCount, {
        minGap: 3,
        startAfter: 2
      });

    case 'wallet':
    case 'account':
      // Wallet/Account: Show first banner after 1 section, then every 2 sections
      return calculateBannerPositions(contentCount, bannerCount, {
        minGap: 2,
        startAfter: 1
      });

    default:
      // Default: Even distribution
      return calculateBannerPositions(contentCount, bannerCount, {
        minGap: 2,
        startAfter: 1
      });
  }
}

/**
 * Create a render list that includes banners distributed among sections
 * @param {Array} sections - Array of section configs
 * @param {Array} banners - Array of banner objects
 * @param {string} screenType - Type of screen for distribution strategy
 * @returns {Array} Array of { type: 'section' | 'banner', data: object, key: string }
 */
export function createDistributedRenderList(sections, banners, screenType = 'default') {
  if (!sections || sections.length === 0) {
    // DON'T show banners when sections are empty (e.g., during loading/refresh)
    // Banners should only appear mixed with actual content
    return [];
  }

  if (!banners || banners.length === 0) {
    return sections.map((section, index) => ({
      type: 'section',
      data: section,
      key: `section-${section.id || index}`,
    }));
  }

  const positions = getScreenBannerPositions(screenType, sections.length, banners.length);
  const result = [];
  let bannerIndex = 0;

  sections.forEach((section, index) => {
    // Add section
    result.push({
      type: 'section',
      data: section,
      key: `section-${section.id || index}`,
    });

    // Check if we should insert a banner after this section
    if (bannerIndex < banners.length && positions[bannerIndex] === index + 1) {
      result.push({
        type: 'banner',
        data: banners[bannerIndex],
        key: `banner-${banners[bannerIndex].id || bannerIndex}`,
      });
      bannerIndex++;
    }
  });

  // Add any remaining banners at the end
  while (bannerIndex < banners.length) {
    result.push({
      type: 'banner',
      data: banners[bannerIndex],
      key: `banner-${banners[bannerIndex].id || bannerIndex}`,
    });
    bannerIndex++;
  }

  return result;
}

/**
 * Inject sponsor banners into a FlatList feed (like Facebook/Instagram)
 * Ensures ALL banners are shown, distributed evenly among content items
 * @param {Array} feedItems - Array of feed items (posts, ads, etc.) with { type, data }
 * @param {Array} banners - Array of sponsor banner objects
 * @param {object} options - Configuration options
 * @param {number} options.firstBannerAfter - Show first banner after N items (default: 3)
 * @param {number} options.bannerInterval - Gap between banners (default: 8)
 * @returns {Array} Feed items with banners injected
 */
export function injectBannersIntoFeed(feedItems, banners, options = {}) {
  const { firstBannerAfter = 3, bannerInterval = 8 } = options;

  if (!banners || banners.length === 0) {
    return feedItems;
  }

  if (!feedItems || feedItems.length === 0) {
    // DON'T show banners when feed is empty (e.g., during loading/refresh)
    // Banners should only appear mixed with actual content
    return [];
  }

  const result = [...feedItems];
  let bannerIndex = 0;
  let insertCount = 0;

  // Calculate positions for ALL banners
  for (let i = 0; i < banners.length; i++) {
    // Position: firstBannerAfter, then every bannerInterval items
    const position = firstBannerAfter + i * bannerInterval + insertCount;

    if (position <= result.length) {
      result.splice(position, 0, {
        type: 'sponsor_banner',
        data: banners[i],
        key: `sponsor-banner-${banners[i].id || i}`,
      });
      insertCount++;
    } else {
      // If position exceeds array length, append at the end
      result.push({
        type: 'sponsor_banner',
        data: banners[i],
        key: `sponsor-banner-${banners[i].id || i}`,
      });
    }
  }

  return result;
}

/**
 * For ScrollView screens (Shop, Wallet, etc.) - distribute banners among sections
 * with smart positioning to show ALL banners
 * @param {Array} sections - Array of section configs
 * @param {Array} banners - Array of sponsor banner objects
 * @param {object} options - Configuration options
 * @returns {Array} Array of { type: 'section' | 'banner', data, key }
 */
export function distributeBannersAmongSections(sections, banners, options = {}) {
  const { minGap = 1, maxBannersPerGap = 2 } = options;

  if (!sections || sections.length === 0) {
    // DON'T show banners when sections are empty (e.g., during loading/refresh)
    // Banners should only appear mixed with actual content
    return [];
  }

  if (!banners || banners.length === 0) {
    return sections.map((section, index) => ({
      type: 'section',
      data: section,
      key: `section-${section.id || index}`,
    }));
  }

  const result = [];
  const totalBanners = banners.length;
  const totalSections = sections.length;

  // Calculate how many gaps we have (including after last section)
  const totalGaps = totalSections; // After each section

  // Distribute banners evenly across gaps
  // Each gap gets ceil(totalBanners / totalGaps) banners
  const bannersPerGap = Math.ceil(totalBanners / totalGaps);

  let bannerIndex = 0;

  sections.forEach((section, sectionIndex) => {
    // Add section first
    result.push({
      type: 'section',
      data: section,
      key: `section-${section.id || sectionIndex}`,
    });

    // Add banners after this section
    const bannersForThisGap = Math.min(
      bannersPerGap,
      totalBanners - bannerIndex,
      maxBannersPerGap
    );

    for (let i = 0; i < bannersForThisGap && bannerIndex < totalBanners; i++) {
      result.push({
        type: 'banner',
        data: banners[bannerIndex],
        key: `banner-${banners[bannerIndex].id || bannerIndex}`,
      });
      bannerIndex++;
    }
  });

  // Add any remaining banners at the end
  while (bannerIndex < totalBanners) {
    result.push({
      type: 'banner',
      data: banners[bannerIndex],
      key: `banner-${banners[bannerIndex].id || bannerIndex}`,
    });
    bannerIndex++;
  }

  return result;
}

export default {
  calculateBannerPositions,
  interleaveBannersWithContent,
  getScreenBannerPositions,
  createDistributedRenderList,
  injectBannersIntoFeed,
  distributeBannersAmongSections,
};
