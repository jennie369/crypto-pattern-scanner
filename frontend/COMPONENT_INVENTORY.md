# Component Inventory

Complete catalog of UI components in GEM Trading Academy Crypto Pattern Scanner

---

## Navigation Components

### TopNavBar
**File:** `src/components/TopNavBar.jsx` + `TopNavBar.css`

**Features:**
- Logo with gradient text effect
- Navigation links with active state
- User profile dropdown
- Mobile hamburger menu
- Tier badge display

**CSS Patterns:**
- Sticky positioning
- Glass effect background
- Gold hover states
- Smooth transitions

---

### Footer
**File:** `src/components/Footer.jsx` + `Footer.css`

**Features:**
- Multi-column layout
- Social media links
- Copyright info
- Additional links

---

## Card Components

### PortfolioStats
**File:** `src/components/Portfolio/PortfolioStats.jsx` + `PortfolioStats.css`

**Features:**
- 4-column stat grid (responsive to 2-col on mobile)
- Icon + label + value layout
- Colored left border accent
- Hover lift effect
- Percentage change indicators

**Variants:**
- Total Value (gold border)
- Total Profit/Loss (green/red border)
- ROI % (gradient border)
- Holdings count (purple border)

**CSS Pattern:**
```css
.stat-card {
  background: linear-gradient(135deg, rgba(74, 25, 66, 0.15), rgba(42, 27, 82, 0.15));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid [COLOR];
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}
```

---

### PatternCard
**File:** `src/components/AdvancedScanner/PatternCard.jsx` + `PatternCard.css`

**Features:**
- Pattern type icon
- Confidence badge
- Zone information
- Entry status indicator
- Action buttons
- Click to view details

**Variants:**
- DPD pattern (bearish)
- UPU pattern (bullish)
- Reversal patterns

---

### NewsCard
**File:** `src/components/NewsCalendar/NewsCard.jsx` + `NewsCard.css`

**Features:**
- Sentiment indicator (bullish/bearish/neutral)
- Source logo
- Title and excerpt
- Timestamp
- Read more link

---

## Table Components

### HoldingsTable
**File:** `src/components/Portfolio/HoldingsTable.jsx` + `HoldingsTable.css`

**Features:**
- Sortable columns
- Alternating row colors
- Hover highlight
- Action buttons per row
- Mobile-responsive (cards on mobile)

**CSS Pattern:**
```css
.holdings-table thead th {
  background: rgba(255, 189, 89, 0.1);
  padding: 16px;
  font-weight: 600;
  color: #FFBD59;
  text-align: left;
  cursor: pointer;
}

.holdings-table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.holdings-table tbody tr:hover {
  background: rgba(255, 189, 89, 0.05);
}
```

---

### ScanHistoryTable
**File:** `src/pages/ScanHistory.jsx` + `ScanHistory.css`

**Features:**
- Timestamp column
- Pattern type column
- Confidence badge
- Symbol and timeframe
- Actions column

---

## Modal Components

### PatternDetailsModal
**File:** `src/components/AdvancedScanner/PatternDetailsModal.jsx` + `PatternDetailsModal.css`

**Features:**
- Full-screen overlay
- Tabbed navigation (Overview, Entry, Zone, Confirmation)
- Close button
- Action buttons footer
- Scrollable content area

**CSS Pattern:**
```css
.pattern-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.pattern-modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  max-width: 1200px;
  margin: 40px auto;
}
```

---

### AddHoldingModal
**File:** `src/components/Portfolio/AddHoldingModal.jsx` + `AddHoldingModal.css`

**Features:**
- Form inputs (symbol, quantity, entry price)
- Submit and cancel buttons
- Validation states
- Loading state

---

### UpgradePrompt
**File:** `src/components/UpgradePrompt/UpgradePrompt.jsx` + `UpgradePrompt.css`

**Features:**
- Feature comparison grid
- Current tier display
- Required tier display
- CTA button to pricing page
- Feature list with checkmarks

---

## Form Components

### Input Fields
**Pattern:**
```css
.form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #FFBD59;
  box-shadow: 0 0 0 3px rgba(255, 189, 89, 0.1);
}
```

---

### Select Dropdown
**Pattern:**
```css
.form-select {
  appearance: none;
  background: rgba(255, 255, 255, 0.05);
  background-image: url("data:image/svg+xml,..."); /* Custom arrow */
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding: 12px 40px 12px 16px;
}
```

---

### Checkbox
**Pattern:**
```css
.checkbox-input {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
}

.checkbox-input:checked {
  background: #FFBD59;
  border-color: #FFBD59;
}

.checkbox-input:checked::after {
  content: '✓';
  position: absolute;
  color: #112250;
}
```

---

## Button Components

### Primary Button
**CSS:**
```css
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}
```

---

### Secondary Button
**CSS:**
```css
.btn-secondary {
  background: transparent;
  color: #FFBD59;
  border: 1px solid #FFBD59;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 189, 89, 0.1);
  transform: translateY(-2px);
}
```

---

### Danger Button
**CSS:**
```css
.btn-danger {
  background: linear-gradient(135deg, #F6465D 0%, #D63447 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
```

---

### Success Button
**CSS:**
```css
.btn-success {
  background: linear-gradient(135deg, #0ECB81 0%, #0BA468 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
```

---

### Icon Button
**CSS:**
```css
.btn-icon {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(255, 189, 89, 0.1);
  border-color: #FFBD59;
}
```

---

## Badge Components

### Status Badge
**File:** Used throughout app

**Variants:**
- Success (green)
- Danger (red)
- Warning (yellow)
- Info (blue)
- Neutral (gray)

**CSS:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-success {
  background: rgba(14, 203, 129, 0.15);
  color: #0ECB81;
  border: 1px solid rgba(14, 203, 129, 0.3);
}
```

---

### Tier Badge
**File:** `src/components/TopNavBar.jsx`

**Variants:**
- Free (gray)
- Pro (blue) - TIER 1
- Premium (gold) - TIER 2
- VIP (purple) - TIER 3

---

### Confidence Badge
**File:** Used in pattern displays

**Variants:**
- High (80%+) - green
- Medium (60-79%) - yellow
- Low (<60%) - red

---

## Chart Components

### TradingView Chart
**File:** `src/components/TradingViewWidget.jsx`

**Features:**
- Embedded TradingView chart
- Symbol selection
- Timeframe controls
- Technical indicators
- Drawing tools

---

### Portfolio Pie Chart
**File:** `src/components/Portfolio/PortfolioPieChart.jsx`

**Features:**
- Holdings distribution
- Color-coded segments
- Interactive legend
- Percentage labels

---

### Performance Line Chart
**File:** `src/components/Portfolio/PerformanceChart.jsx`

**Features:**
- Time series data
- Multiple data series
- Gradient fill
- Tooltips on hover

---

## Indicator Components

### EntryStatusDisplay
**File:** `src/components/AdvancedScanner/EntryStatusDisplay.jsx` + `EntryStatusDisplay.css`

**Features:**
- 6-step workflow visualization
- Current step highlight
- Step icons and descriptions
- Progress bar

**Steps:**
1. PATTERN_DETECTED
2. ZONE_CREATED
3. APPROACHING_ZONE
4. IN_ZONE
5. CONFIRMATION
6. ZONE_BROKEN

---

### ZoneRetestTracker
**File:** `src/components/AdvancedScanner/ZoneRetestTracker.jsx` + `ZoneRetestTracker.css`

**Features:**
- Zone type indicator (HFZ/LFZ)
- Retest count
- Zone age
- Quality metrics
- Star rating

---

### ConfirmationIndicator
**File:** `src/components/AdvancedScanner/ConfirmationIndicator.jsx` + `ConfirmationIndicator.css`

**Features:**
- Confirmation checklist
- Candle analysis
- Entry permission indicator
- Visual checkmarks

---

### QuotaDisplay
**File:** `src/components/QuotaDisplay/QuotaDisplay.jsx` + `QuotaDisplay.css`

**Features:**
- Current scan count
- Max scan limit
- Progress bar
- Upgrade prompt
- Reset timer

---

## Loading States

### Loading Spinner
**CSS:**
```css
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### Skeleton Loader
**CSS:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}
```

---

## Empty State Components

### Empty State Card
**CSS:**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state-icon {
  font-size: 64px;
  opacity: 0.5;
  margin-bottom: 20px;
}

.empty-state-message {
  color: #aaaaaa;
  font-size: 18px;
  margin-bottom: 24px;
}
```

---

## Error State Components

### Error Card
**CSS:**
```css
.error-card {
  background: rgba(246, 70, 93, 0.1);
  border: 1px solid rgba(246, 70, 93, 0.3);
  border-left: 4px solid #F6465D;
  border-radius: 16px;
  padding: 24px;
}

.error-icon {
  color: #F6465D;
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  color: #F6465D;
  font-size: 16px;
}
```

---

## Layout Components

### Page Container
**CSS:**
```css
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 140px);
}
```

---

### Section Container
**CSS:**
```css
.section-container {
  margin-bottom: 32px;
}

.section-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}
```

---

### Grid Container
**CSS:**
```css
.grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.grid-4col {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Auto-fit responsive grid */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
```

---

## Tab Components

### Tab Navigation
**File:** `src/components/Portfolio/PortfolioTabs.jsx`

**CSS:**
```css
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  color: #aaaaaa;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.tab.active {
  color: #FFBD59;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #FFBD59;
}

.tab:hover:not(.active) {
  color: #ffffff;
}
```

---

## Protection Components

### TierGuard
**File:** `src/components/TierGuard/TierGuard.jsx` + `TierGuard.css`

**Features:**
- Access control wrapper
- Loading state
- Error state with retry
- Upgrade prompt integration

---

### ProtectedRoute
**File:** `src/components/ProtectedRoute.jsx`

**Features:**
- Authentication check
- Redirect to login
- Loading state

---

### ProtectedAdminRoute
**File:** `src/components/ProtectedAdminRoute.jsx`

**Features:**
- Admin role check
- Redirect to unauthorized page

---

## Key CSS Files to Reference

### Tier 1 Priority (Must Review)
1. `src/index.css` - Global styles, CSS variables, base typography
2. `src/App.css` - App layout, page wrappers, utility classes
3. `src/components/TopNavBar.css` - Navigation patterns
4. `src/components/Portfolio/PortfolioStats.css` - Card component patterns
5. `src/pages/Scanner.css` - Button and control patterns
6. `src/components/AdvancedScanner/PatternDetailsModal.css` - Modal patterns

### Tier 2 Priority (Important)
7. `src/pages/Portfolio.css` - Page layout, grid patterns
8. `src/components/Portfolio/HoldingsTable.css` - Table patterns
9. `src/pages/MTFAnalysis.css` - Multi-column layouts
10. `src/pages/Sentiment.css` - Card grid patterns
11. `src/pages/NewsCalendar.css` - List and card hybrid patterns

---

## Component Usage Patterns

### Typical Page Structure
```jsx
<div className="page-container">
  <div className="page-header">
    <h1 className="page-title">Page Title</h1>
    <div className="page-actions">
      <button className="btn-primary">Action</button>
    </div>
  </div>

  <div className="section-container">
    <h2 className="section-title">Section Title</h2>
    <div className="grid-4col">
      {/* Stat cards */}
    </div>
  </div>

  <div className="section-container">
    <div className="section-header">
      <h3 className="section-title">Data Section</h3>
      <button className="btn-secondary">Filter</button>
    </div>
    <div className="card">
      {/* Table or content */}
    </div>
  </div>
</div>
```

---

## Mobile Responsive Patterns

### Card Grid Breakpoints
```css
/* 4 columns on desktop */
@media (max-width: 1200px) {
  /* 3 columns on small desktop */
}

@media (max-width: 968px) {
  /* 2 columns on tablet */
}

@media (max-width: 768px) {
  /* 1 column on mobile */
}
```

### Table to Cards on Mobile
```css
@media (max-width: 768px) {
  .data-table {
    display: none;
  }

  .mobile-card-view {
    display: block;
  }
}
```

---

## Animation Patterns Used

1. **Fade In**: Page and card entries
2. **Slide In**: Modal appearances
3. **Hover Lift**: Cards and buttons
4. **Shimmer**: Loading skeletons
5. **Spin**: Loading spinners
6. **Scale**: Button presses
7. **Glow Pulse**: Important notifications
