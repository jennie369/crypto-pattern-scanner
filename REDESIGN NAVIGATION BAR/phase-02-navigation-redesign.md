# Phase 02: Navigation Bar Redesign

## Thông Tin Phase
- **Thời lượng ước tính**: 4-5 giờ
- **Trạng thái**: Pending
- **Tiến độ**: 0%
- **Phụ thuộc**: Phase 01 (Backup & Environment Setup)

---

## Mục Tiêu

Tổ chức lại navigation bar với cấu trúc tier-based rõ ràng, grouping các tools theo tiers, thêm badges và locked states. **PRESERVE** tất cả routes và functionality hiện có.

### Current Issues:
- Navigation cluttered với quá nhiều top-level items
- Không có tier grouping rõ ràng
- Tools không được organized logically
- Users confused về vị trí các features

### Target:
- Clean, organized structure
- Grouped by tier with badges (🔹 TIER 1, 💎 TIER 2, 👑 TIER 3)
- Locked state cho inaccessible items
- Mobile-friendly dropdowns

---

## Deliverables

- [ ] TopNavBar.jsx restructured với tier-based dropdowns
- [ ] Tools dropdown với 3 sections (TIER 1/2/3)
- [ ] Community dropdown created
- [ ] Learning dropdown created
- [ ] Account dropdown updated
- [ ] TopNavBar.css updated với new styles
- [ ] All 27 navigation links tested và working
- [ ] No broken functionality

---

## Bước 1: Update TopNavBar.jsx Structure

### Mục đích
Restructure navigation component với dropdown menus grouped by tier, trong khi **PRESERVE** tất cả existing logic và routes.

### Công việc cần làm

1. **Open file để edit**
   ```bash
   # File location:
   C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend\src\components\TopNavBar.jsx
   ```

2. **Add required imports**
   ```javascript
   // At top of file, preserve existing imports and add:
   import { useState, useEffect } from 'react';
   import { Link, useNavigate } from 'react-router-dom';
   import { useAuth } from '../contexts/AuthContext';
   import {
     Home, Search, Tool, Users, GraduationCap, User,
     ChevronDown, Lock, LogOut, Settings, DollarSign,
     BookOpen, Calculator, Percent, TrendingUp, BarChart,
     Heart, Calendar, Filter, BarChart2, Activity,
     Brain, Waves, Bell, Key, MessageSquare, Mail,
     Trophy, Bot, ShoppingCart, CreditCard
   } from 'lucide-react';
   ```

3. **Add state for dropdown management**
   ```javascript
   const TopNavBar = () => {
     const { user, signOut } = useAuth();
     const navigate = useNavigate();

     // ⚠️ NEW: Dropdown state
     const [activeDropdown, setActiveDropdown] = useState(null);
     const [unreadMessages, setUnreadMessages] = useState(0);

     // ⚠️ PRESERVE: Get user tier logic
     const userTier = user?.scanner_tier || 'FREE';

     // ⚠️ PRESERVE: Tier checking function
     const hasAccess = (requiredTier) => {
       const tierHierarchy = {
         FREE: 0,
         TIER1: 1,
         TIER2: 2,
         TIER3: 3
       };
       const currentLevel = tierHierarchy[userTier] || 0;
       const requiredLevel = tierHierarchy[requiredTier] || 0;
       return currentLevel >= requiredLevel;
     };

     // ⚠️ PRESERVE: Logout handler
     const handleLogout = async () => {
       await signOut();
       navigate('/auth');
     };

     // ⚠️ NEW: Toggle dropdown
     const toggleDropdown = (dropdown) => {
       setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
     };

     // ⚠️ NEW: Close dropdown on outside click
     useEffect(() => {
       const handleClickOutside = (e) => {
         if (!e.target.closest('.nav-dropdown')) {
           setActiveDropdown(null);
         }
       };
       document.addEventListener('click', handleClickOutside);
       return () => document.removeEventListener('click', handleClickOutside);
     }, []);

     return (
       <nav className="top-nav-bar">
         {/* Continue to next step for JSX structure */}
       </nav>
     );
   };
   ```

### Files cần tạo/sửa
- `src/components/TopNavBar.jsx` - Main navigation component

### Verification Checklist
- [ ] All imports added without errors
- [ ] State variables declared correctly
- [ ] `hasAccess()` function preserved
- [ ] `handleLogout()` function preserved
- [ ] No TypeScript/ESLint errors

---

## Bước 2: Build Navigation JSX Structure

### Mục đích
Create dropdown menus với tier-based organization. Each dropdown có sections cho different tiers.

### Công việc cần làm

1. **Main Navigation Container**
   ```javascript
   return (
     <nav className="top-nav-bar">
       <div className="nav-container">

         {/* Logo - ⚠️ PRESERVE */}
         <Link to="/" className="nav-logo">
           <img src="/logo.png" alt="Gemral" />
           <span>Gemral</span>
         </Link>

         {/* Main Navigation */}
         <div className="nav-main">

           {/* Dashboard - Always visible */}
           <Link to="/" className="nav-item">
             <Home size={20} />
             <span>Dashboard</span>
           </Link>

           {/* Scanner - Always visible */}
           <Link to="/scanner" className="nav-item">
             <Search size={20} />
             <span>Scanner</span>
           </Link>

           {/* Continue to next section for dropdowns */}
         </div>

         {/* User Account Section - Right Side */}
         <div className="nav-account">
           {/* Account dropdown - see next step */}
         </div>

       </div>
     </nav>
   );
   ```

2. **Tools Dropdown với Tier Sections**
   ```javascript
   {/* TOOLS DROPDOWN */}
   <div className="nav-dropdown">
     <button
       className={`nav-item dropdown-trigger ${activeDropdown === 'tools' ? 'active' : ''}`}
       onClick={() => toggleDropdown('tools')}
     >
       <Tool size={20} />
       <span>Tools</span>
       <ChevronDown size={16} className={activeDropdown === 'tools' ? 'rotated' : ''} />
     </button>

     {activeDropdown === 'tools' && (
       <div className="dropdown-menu tools-menu">

         {/* TIER 1 Section */}
         <div className="dropdown-section">
           <div className="section-header">
             <span className="section-title">TIER 1 TOOLS</span>
             <span className="tier-badge tier-1">🔹 PRO</span>
           </div>

           <Link
             to="/journal"
             className={`dropdown-item ${!hasAccess('TIER1') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <BookOpen size={18} />
             <span>Trading Journal</span>
             {!hasAccess('TIER1') && <Lock size={14} />}
           </Link>

           <Link
             to="/risk-calculator"
             className={`dropdown-item ${!hasAccess('TIER1') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Calculator size={18} />
             <span>Risk Calculator</span>
             {!hasAccess('TIER1') && <Lock size={14} />}
           </Link>

           <Link
             to="/position-size"
             className={`dropdown-item ${!hasAccess('TIER1') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Percent size={18} />
             <span>Position Size</span>
             {!hasAccess('TIER1') && <Lock size={14} />}
           </Link>
         </div>

         {/* TIER 2 Section */}
         <div className="dropdown-section">
           <div className="section-header">
             <span className="section-title">TIER 2 TOOLS</span>
             <span className="tier-badge tier-2">💎 PREMIUM</span>
           </div>

           <Link
             to="/portfolio"
             className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <TrendingUp size={18} />
             <span>Portfolio Tracker</span>
             {!hasAccess('TIER2') && <Lock size={14} />}
           </Link>

           <Link
             to="/mtf-analysis"
             className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <BarChart size={18} />
             <span>Multi-Timeframe</span>
             {!hasAccess('TIER2') && <Lock size={14} />}
           </Link>

           <Link
             to="/sentiment"
             className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Heart size={18} />
             <span>Sentiment Analyzer</span>
             {!hasAccess('TIER2') && <Lock size={14} />}
           </Link>

           <Link
             to="/news-calendar"
             className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Calendar size={18} />
             <span>News Calendar</span>
             {!hasAccess('TIER2') && <Lock size={14} />}
           </Link>

           <Link
             to="/screener"
             className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Filter size={18} />
             <span>Market Screener</span>
             {!hasAccess('TIER2') && <Lock size={14} />}
           </Link>

           <Link
             to="/sr-levels"
             className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <TrendingUp size={18} />
             <span>S/R Levels</span>
             {!hasAccess('TIER2') && <Lock size={14} />}
           </Link>

           <Link
             to="/volume"
             className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <BarChart2 size={18} />
             <span>Volume Analysis</span>
             {!hasAccess('TIER2') && <Lock size={14} />}
           </Link>
         </div>

         {/* TIER 3 Section */}
         <div className="dropdown-section">
           <div className="section-header">
             <span className="section-title">TIER 3 ELITE</span>
             <span className="tier-badge tier-3">👑 VIP</span>
           </div>

           <Link
             to="/backtesting"
             className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Activity size={18} />
             <span>Backtesting</span>
             {!hasAccess('TIER3') && <Lock size={14} />}
           </Link>

           <Link
             to="/ai-prediction"
             className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Brain size={18} />
             <span>AI Prediction</span>
             {!hasAccess('TIER3') && <Lock size={14} />}
           </Link>

           <Link
             to="/whale-tracker"
             className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Waves size={18} />
             <span>Whale Tracker</span>
             {!hasAccess('TIER3') && <Lock size={14} />}
           </Link>

           <Link
             to="/alerts"
             className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Bell size={18} />
             <span>Alerts Manager</span>
             {!hasAccess('TIER3') && <Lock size={14} />}
           </Link>

           <Link
             to="/api-keys"
             className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
             onClick={() => setActiveDropdown(null)}
           >
             <Key size={18} />
             <span>API Keys</span>
             {!hasAccess('TIER3') && <Lock size={14} />}
           </Link>
         </div>

       </div>
     )}
   </div>
   ```

3. **Community, Learning, and Account Dropdowns**
   ```javascript
   {/* COMMUNITY DROPDOWN */}
   <div className="nav-dropdown">
     <button
       className={`nav-item dropdown-trigger ${activeDropdown === 'community' ? 'active' : ''}`}
       onClick={() => toggleDropdown('community')}
     >
       <Users size={20} />
       <span>Cộng Đồng</span>
       <ChevronDown size={16} />
     </button>

     {activeDropdown === 'community' && (
       <div className="dropdown-menu">
         <Link to="/forum" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <MessageSquare size={18} />
           <span>Forum</span>
         </Link>

         <Link to="/messages" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <Mail size={18} />
           <span>Messages</span>
           {unreadMessages > 0 && (
             <span className="badge">{unreadMessages}</span>
           )}
         </Link>

         <Link to="/events" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <Calendar size={18} />
           <span>Events</span>
         </Link>

         <Link to="/leaderboard" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <Trophy size={18} />
           <span>Leaderboard</span>
         </Link>

         <Link to="/chatbot" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <Bot size={18} />
           <span>GEM Chatbot</span>
         </Link>
       </div>
     )}
   </div>

   {/* LEARNING DROPDOWN */}
   <div className="nav-dropdown">
     <button
       className={`nav-item dropdown-trigger ${activeDropdown === 'learning' ? 'active' : ''}`}
       onClick={() => toggleDropdown('learning')}
     >
       <GraduationCap size={20} />
       <span>Học Tập</span>
       <ChevronDown size={16} />
     </button>

     {activeDropdown === 'learning' && (
       <div className="dropdown-menu">
         <Link to="/courses" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <BookOpen size={18} />
           <span>Courses</span>
         </Link>

         <Link to="/shop" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <ShoppingCart size={18} />
           <span>Shop</span>
         </Link>
       </div>
     )}
   </div>

   {/* ACCOUNT DROPDOWN - In nav-account section */}
   <div className="nav-dropdown">
     <button
       className={`nav-item dropdown-trigger user-menu ${activeDropdown === 'account' ? 'active' : ''}`}
       onClick={() => toggleDropdown('account')}
     >
       {user?.avatar_url ? (
         <img src={user.avatar_url} alt="Avatar" className="user-avatar" />
       ) : (
         <User size={20} />
       )}
       <span className="user-name">{profile?.full_name || user?.email}</span>
       <ChevronDown size={16} />
     </button>

     {activeDropdown === 'account' && (
       <div className="dropdown-menu account-menu">
         <div className="account-info">
           <p className="user-email">{user?.email}</p>
           <span className={`tier-badge tier-${userTier.toLowerCase()}`}>
             {userTier}
           </span>
         </div>

         <div className="dropdown-divider"></div>

         <Link to="/account" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <User size={18} />
           <span>Account Dashboard</span>
         </Link>

         <Link to="/settings" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <Settings size={18} />
           <span>Settings</span>
         </Link>

         <Link to="/affiliate" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <DollarSign size={18} />
           <span>Affiliate</span>
         </Link>

         <Link to="/pricing" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
           <CreditCard size={18} />
           <span>Pricing</span>
         </Link>

         <div className="dropdown-divider"></div>

         <button className="dropdown-item danger" onClick={handleLogout}>
           <LogOut size={18} />
           <span>Logout</span>
         </button>
       </div>
     )}
   </div>
   ```

### Files cần tạo/sửa
- `src/components/TopNavBar.jsx` - Complete JSX structure

### Verification Checklist
- [ ] All dropdowns render correctly
- [ ] ChevronDown icons rotate when active
- [ ] Locked state shows for inaccessible items
- [ ] All routes preserved (no changes to paths)
- [ ] onClick handlers close dropdowns

---

## Bước 3: Update TopNavBar.css Styles

### Mục đích
Style the new dropdown menus với GEM brand colors và ensure smooth animations.

### Công việc cần làm

See complete CSS in original plan (lines 525-809). Key sections:

1. **Base Navigation Styles**
2. **Dropdown Styles**
3. **Tier Badges**
4. **Locked State**
5. **Account Menu**
6. **Mobile Responsive**

Complete CSS available in `PHASE3_NAVIGATION_LAYOUT_REFINEMENT (1).md` lines 525-809.

### Files cần tạo/sửa
- `src/components/TopNavBar.css` - Complete styling

### Verification Checklist
- [ ] Dropdowns animate smoothly (slideDown)
- [ ] Tier badges show correct colors
- [ ] Locked items greyed out và not clickable
- [ ] Account dropdown positioned right
- [ ] Mobile responsive (@media 1024px)

---

## Bước 4: Test All Navigation Links

### Mục đích
Verify tất cả 27 features vẫn accessible và working correctly sau navigation redesign.

### Manual Testing Checklist

**Dashboard & Scanner:**
- [ ] Dashboard (/) loads
- [ ] Scanner (/scanner) loads

**TIER 1 Tools:**
- [ ] Trading Journal (/journal)
- [ ] Risk Calculator (/risk-calculator)
- [ ] Position Size (/position-size)

**TIER 2 Tools:**
- [ ] Portfolio Tracker (/portfolio)
- [ ] Multi-Timeframe (/mtf-analysis)
- [ ] Sentiment Analyzer (/sentiment)
- [ ] News Calendar (/news-calendar)
- [ ] Market Screener (/screener)
- [ ] S/R Levels (/sr-levels)
- [ ] Volume Analysis (/volume)

**TIER 3 Tools:**
- [ ] Backtesting (/backtesting)
- [ ] AI Prediction (/ai-prediction)
- [ ] Whale Tracker (/whale-tracker)
- [ ] Alerts Manager (/alerts)
- [ ] API Keys (/api-keys)

**Community:**
- [ ] Forum (/forum)
- [ ] Messages (/messages)
- [ ] Events (/events)
- [ ] Leaderboard (/leaderboard)
- [ ] GEM Chatbot (/chatbot)

**Learning:**
- [ ] Courses (/courses)
- [ ] Shop (/shop)

**Account:**
- [ ] Account Dashboard (/account)
- [ ] Settings (/settings)
- [ ] Affiliate (/affiliate)
- [ ] Pricing (/pricing)
- [ ] Logout works

### Verification Checklist
- [ ] All 27 links navigate correctly
- [ ] No 404 errors
- [ ] Locked items show lock icon
- [ ] FREE user sees locks on TIER1+ items
- [ ] TIER3 user sees NO locks

---

## Edge Cases & Error Handling

### Edge Cases

1. **User clicks locked item**
   - Hiện tượng: Should not navigate
   - Giải pháp: Add `pointer-events: none` to `.dropdown-item.locked`

2. **Multiple dropdowns open**
   - Hiện tượng: Only one should be open at a time
   - Giải pháp: `toggleDropdown()` already closes others

3. **Dropdown stays open on navigation**
   - Hiện tượng: Dropdown doesn't close after clicking link
   - Giải pháp: Each Link has `onClick={() => setActiveDropdown(null)}`

---

## Dependencies & Prerequisites

### Required from Phase 01:
- [ ] Git branch created
- [ ] Backup files exist
- [ ] Dev server running

### No new packages needed
All icons come from existing `lucide-react` package.

---

## Completion Criteria

Phase 02 được coi là hoàn thành khi:

- [ ] TopNavBar.jsx restructured with dropdowns
- [ ] TopNavBar.css updated with new styles
- [ ] All 27 navigation links tested và working
- [ ] Tier badges display correctly
- [ ] Locked state working for inaccessible items
- [ ] Dropdowns close on outside click
- [ ] No console errors
- [ ] Mobile responsive (test at 1024px)
- [ ] **ZERO broken functionality**

---

## Next Steps

1. Update `plan.md` status to ✅ Completed
2. Commit:
   ```bash
   git add .
   git commit -m "refactor: Complete Phase 02 - Navigation Bar Redesign with tier-based dropdowns"
   ```
3. Proceed to **phase-03-tools-standardization.md**

---

**Phase 02 Status:** ⏳ Pending → Ready to start after Phase 01
