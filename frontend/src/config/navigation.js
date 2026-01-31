/**
 * Navigation Configuration
 * Synced with Mobile 5-Tab Structure
 */

export const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Cộng Đồng',
    icon: 'Home',
    path: '/forum',
    mobileTab: 'Home',
    children: [
      { label: 'Bảng Tin', path: '/forum', icon: 'Newspaper' },
      { label: 'Đang Theo Dõi', path: '/forum?tab=following', icon: 'Users' },
      { label: 'Xu Hướng', path: '/forum?tab=trending', icon: 'TrendingUp' },
      { label: 'Tạo Bài Viết', path: '/forum/new', icon: 'PlusCircle', requiresAuth: true },
    ],
  },
  {
    id: 'shop',
    label: 'Cửa Hàng',
    icon: 'ShoppingBag',
    path: '/shop',
    mobileTab: 'Shop',
    children: [
      { label: 'Tất Cả Sản Phẩm', path: '/shop', icon: 'Grid' },
      { label: 'Đá Quý & Pha Lê', path: '/shop/crystals', icon: 'Gem' },
      { label: 'Khóa Học', path: '/courses', icon: 'GraduationCap' },
      { label: 'Giỏ Hàng', path: '/cart', icon: 'ShoppingCart' },
      { label: 'Đơn Hàng', path: '/orders', icon: 'Package', requiresAuth: true },
    ],
  },
  {
    id: 'scanner',
    label: 'GEM Scanner',
    icon: 'LineChart',
    path: '/scanner-v2',
    mobileTab: 'Trading',
    children: [
      { label: 'Biểu Đồ', path: '/scanner-v2', icon: 'LineChart' },
      { label: 'Portfolio', path: '/portfolio', icon: 'Briefcase', requiresAuth: true },
      { label: 'MTF Analysis', path: '/mtf-analysis', icon: 'BarChart', requiresAuth: true },
      { label: 'Sentiment', path: '/sentiment', icon: 'Heart', requiresAuth: true },
      { label: 'Backtesting', path: '/tier3/backtesting', icon: 'Activity', requiresAuth: true },
      { label: 'AI Prediction', path: '/tier3/ai-prediction', icon: 'Brain', requiresAuth: true },
    ],
  },
  {
    id: 'gemmaster',
    label: 'GEM Master',
    icon: 'Bot',
    path: '/chatbot',
    mobileTab: 'GemMaster',
    children: [
      { label: 'Trò Chuyện', path: '/chatbot', icon: 'MessageCircle' },
      { label: 'I Ching', path: '/chatbot?mode=iching', icon: 'Hexagon' },
      { label: 'Tarot', path: '/chatbot?mode=tarot', icon: 'Sparkles' },
      { label: 'Crystal Guide', path: '/chatbot?mode=crystal', icon: 'Gem' },
      { label: 'Trading AI', path: '/chatbot?mode=trading', icon: 'TrendingUp' },
      { label: 'Vision Board', path: '/vision-board', icon: 'Target', requiresAuth: true },
      { label: 'Rituals', path: '/rituals', icon: 'Moon', requiresAuth: true },
      { label: 'Tin Nhắn', path: '/messages', icon: 'Mail', requiresAuth: true },
    ],
  },
  // Account nav item removed - using user dropdown in TopNavBar instead
];

export const AUTH_ITEMS = [
  { label: 'Đăng Nhập', path: '/login', icon: 'LogIn' },
  { label: 'Đăng Ký', path: '/signup', icon: 'UserPlus' },
];

// Helper function to get all routes from navigation
export const getAllRoutes = () => {
  const routes = [];
  NAV_ITEMS.forEach(item => {
    routes.push({ path: item.path, requiresAuth: item.requiresAuth || false });
    if (item.children) {
      item.children.forEach(child => {
        routes.push({
          path: child.path,
          requiresAuth: child.requiresAuth || item.requiresAuth || false
        });
      });
    }
  });
  return routes;
};

// Helper function to check if a path is active
export const isPathActive = (currentPath, targetPath) => {
  if (targetPath === '/') return currentPath === '/';
  // Handle query params - extract base path
  const basePath = targetPath.split('?')[0];
  return currentPath === basePath || currentPath.startsWith(basePath + '/');
};

// Get navigation item by path
export const getNavItemByPath = (path) => {
  for (const item of NAV_ITEMS) {
    if (item.path === path) return item;
    if (item.children) {
      const child = item.children.find(c => c.path === path || c.path.split('?')[0] === path);
      if (child) return { ...child, parent: item };
    }
  }
  return null;
};
