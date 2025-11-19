# Phase 03: Tool Pages Layout Standardization

## Thông Tin Phase
- **Thời lượng ước tính**: 5-6 giờ
- **Trạng thái**: Pending
- **Tiến độ**: 0%
- **Phụ thuộc**: Phase 02 (Navigation Bar Redesign)

---

## Mục Tiêu

Chuẩn hóa layout structure cho tất cả tool pages (Scanner, Journal, Portfolio, Risk Calculator, etc.) với consistent header, filters, và content sections. **PRESERVE** tất cả logic, calculations, và data fetching.

### Current Issues:
- Each tool page có different header structure
- Inconsistent spacing và padding
- No standard template
- Tier badges displayed differently

### Target:
- Standardized page header template
- Consistent filters section
- Uniform card containers
- Professional, cohesive appearance

---

## Deliverables

- [ ] Standard tool page template defined
- [ ] Scanner.jsx updated với standard layout
- [ ] TradingJournal.jsx updated
- [ ] RiskCalculator.jsx updated
- [ ] PositionSize.jsx updated
- [ ] Portfolio.jsx updated
- [ ] All tool pages tested for functionality
- [ ] No broken features

---

## Standard Tool Page Structure

### Layout Template:
```
┌─────────────────────────────────────────────┐
│ Page Header                                 │
│ ├─ Title + Tier Badge                       │
│ ├─ Description                              │
│ └─ Primary Action Button                    │
├─────────────────────────────────────────────┤
│ Filters/Controls Section (if applicable)    │
│ └─ Inline filters, dropdowns, toggles       │
├─────────────────────────────────────────────┤
│ Main Content Area                           │
│ ├─ Tool-specific content                    │
│ └─ Charts/Results/Tables                    │
└─────────────────────────────────────────────┘
```

---

## Bước 1: Define Standard Page Header Component

### Mục đích
Create reusable JSX structure for tool page headers với consistent styling.

### Standard Header Template

```javascript
{/* STANDARDIZED PAGE HEADER */}
<div className="tool-page-header">
  <div className="header-left">
    <div className="header-title-row">
      <h1 className="page-title">[Tool Name]</h1>
      {tierRequired && tierRequired !== 'FREE' && (
        <span className={`tier-badge tier-${tierRequired.toLowerCase()}`}>
          {tierRequired === 'TIER1' && '🔹 TIER 1'}
          {tierRequired === 'TIER2' && '💎 TIER 2'}
          {tierRequired === 'TIER3' && '👑 TIER 3'}
        </span>
      )}
    </div>
    <p className="page-description">
      [Tool description - what it does and how it helps]
    </p>
  </div>

  {/* Primary Action Button (if applicable) */}
  {hasPrimaryAction && (
    <div className="header-actions">
      <button className="btn-primary" onClick={handlePrimaryAction}>
        <ActionIcon size={20} />
        <span>[Action Label]</span>
      </button>
    </div>
  )}
</div>
```

### Standard Header CSS

```css
/* Tool Page Header Styles */
.tool-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  flex: 1;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
}

.page-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  max-width: 700px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #9C0612 0%, #6B0F1A 100%);
  border: 2px solid #FFBD59;
  border-radius: 12px;
  padding: 12px 24px;
  color: #FFFFFF;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(156, 6, 18, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .tool-page-header {
    flex-direction: column;
    gap: 20px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .page-title {
    font-size: 24px;
  }
}
```

### Verification Checklist
- [ ] Template structure defined
- [ ] CSS styles created
- [ ] Responsive breakpoints tested
- [ ] Tier badges display correctly

---

## Bước 2: Apply Template to Scanner Page

### Mục đích
Update Scanner.jsx to use standard header template while preserving all scanning logic.

### Công việc cần làm

1. **Open Scanner.jsx**
   ```bash
   # File location:
   C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend\src\pages\Dashboard\Scanner\Scanner.jsx
   ```

2. **Update header section**
   ```javascript
   // ⚠️ PRESERVE: All existing imports, state, and logic

   return (
     <div className="scanner-page tool-page">

       {/* UPDATED: Standardized Header */}
       <div className="tool-page-header">
         <div className="header-left">
           <div className="header-title-row">
             <h1 className="page-title">Pattern Scanner</h1>
             {/* FREE tier - no badge */}
           </div>
           <p className="page-description">
             Scan cryptocurrency markets for technical patterns across multiple pairs and timeframes.
             Detect Head & Shoulders, Triangles, Flags, and more.
           </p>
         </div>

         <div className="header-actions">
           <button className="btn-primary" onClick={handleScan}>
             <Search size={20} />
             <span>Start Scan</span>
           </button>
         </div>
       </div>

       {/* ⚠️ PRESERVE: Rest of Scanner component - filters, results, etc. */}

     </div>
   );
   ```

3. **Update Scanner.css**
   - Add `.tool-page-header` styles
   - Ensure existing styles don't conflict
   - Test responsive layout

### Files cần tạo/sửa
- `src/pages/Dashboard/Scanner/Scanner.jsx` - Header update
- `src/pages/Dashboard/Scanner/Scanner.css` - Add standard styles

### Verification Checklist
- [ ] Header displays correctly
- [ ] "Start Scan" button works
- [ ] All scanning functionality preserved
- [ ] Filters still work
- [ ] Results display correctly
- [ ] No console errors

---

## Bước 3: Apply Template to Trading Journal

### Mục đích
Update TradingJournal.jsx với standard header, preserve all journal entry logic.

### Công việc cần làm

```javascript
// File: src/pages/Dashboard/TradingJournal/TradingJournal.jsx

return (
  <div className="trading-journal-page tool-page">

    {/* UPDATED: Standardized Header */}
    <div className="tool-page-header">
      <div className="header-left">
        <div className="header-title-row">
          <h1 className="page-title">Trading Journal</h1>
          <span className="tier-badge tier-tier1">🔹 TIER 1</span>
        </div>
        <p className="page-description">
          Track your trades, analyze performance, and improve your trading strategy with detailed journaling.
        </p>
      </div>

      <div className="header-actions">
        <button className="btn-primary" onClick={handleAddTrade}>
          <Plus size={20} />
          <span>Add Trade</span>
        </button>
      </div>
    </div>

    {/* ⚠️ PRESERVE: Filters section */}
    {/* ⚠️ PRESERVE: Trade entries list */}
    {/* ⚠️ PRESERVE: Statistics section */}

  </div>
);
```

### Files cần tạo/sửa
- `src/pages/Dashboard/TradingJournal/TradingJournal.jsx`
- `src/pages/Dashboard/TradingJournal/TradingJournal.css`

### Verification Checklist
- [ ] TIER 1 badge shows correctly
- [ ] "Add Trade" button works
- [ ] All journal entries display
- [ ] Edit/Delete functionality preserved
- [ ] Statistics still calculate

---

## Bước 4: Apply Template to Risk Calculator

### Mục đích
Update RiskCalculator.jsx với standard header.

### Công việc cần làm

```javascript
// File: src/pages/Dashboard/RiskCalculator/RiskCalculator.jsx

return (
  <div className="risk-calculator-page tool-page">

    <div className="tool-page-header">
      <div className="header-left">
        <div className="header-title-row">
          <h1 className="page-title">Risk Calculator</h1>
          <span className="tier-badge tier-tier1">🔹 TIER 1</span>
        </div>
        <p className="page-description">
          Calculate optimal position sizes and risk-reward ratios based on your account size and risk tolerance.
        </p>
      </div>

      <div className="header-actions">
        <button className="btn-primary" onClick={handleCalculate}>
          <Calculator size={20} />
          <span>Calculate</span>
        </button>
      </div>
    </div>

    {/* ⚠️ PRESERVE: Input form */}
    {/* ⚠️ PRESERVE: Results display */}

  </div>
);
```

### Verification Checklist
- [ ] Header displays
- [ ] Calculator inputs work
- [ ] Calculations still accurate
- [ ] Results display correctly

---

## Bước 5: Apply Template to Position Size Calculator

### Công việc cần làm

```javascript
// File: src/pages/Dashboard/PositionSize/PositionSize.jsx

return (
  <div className="position-size-page tool-page">

    <div className="tool-page-header">
      <div className="header-left">
        <div className="header-title-row">
          <h1 className="page-title">Position Size Calculator</h1>
          <span className="tier-badge tier-tier1">🔹 TIER 1</span>
        </div>
        <p className="page-description">
          Determine the exact position size for your trades based on account balance, risk percentage, and stop loss.
        </p>
      </div>
    </div>

    {/* ⚠️ PRESERVE: All calculator logic */}

  </div>
);
```

### Verification Checklist
- [ ] Position size calculations work
- [ ] All formulas preserved

---

## Bước 6: Apply Template to Portfolio Tracker

### Công việc cần làm

```javascript
// File: src/pages/Dashboard/Portfolio/Portfolio.jsx

return (
  <div className="portfolio-page tool-page">

    <div className="tool-page-header">
      <div className="header-left">
        <div className="header-title-row">
          <h1 className="page-title">Portfolio Tracker</h1>
          <span className="tier-badge tier-tier2">💎 TIER 2</span>
        </div>
        <p className="page-description">
          Track your cryptocurrency holdings, monitor P&L, and analyze portfolio performance in real-time.
        </p>
      </div>

      <div className="header-actions">
        <button className="btn-primary" onClick={handleAddHolding}>
          <Plus size={20} />
          <span>Add Holding</span>
        </button>
      </div>
    </div>

    {/* ⚠️ PRESERVE: Portfolio stats */}
    {/* ⚠️ PRESERVE: Holdings table */}
    {/* ⚠️ PRESERVE: Charts */}

  </div>
);
```

### Verification Checklist
- [ ] TIER 2 badge shows
- [ ] Portfolio stats calculate correctly
- [ ] Add/Edit holdings works
- [ ] Charts render properly

---

## Bước 7: Apply to Remaining Tool Pages

### Pages to Update:

**TIER 2:**
- [ ] MTFAnalysis.jsx (Multi-Timeframe)
- [ ] Sentiment.jsx (Sentiment Analyzer)
- [ ] NewsCalendar.jsx
- [ ] Screener.jsx (Market Screener)
- [ ] SRLevels.jsx (Support/Resistance)
- [ ] VolumeAnalysis.jsx

**TIER 3:**
- [ ] Backtesting.jsx
- [ ] AIPrediction.jsx
- [ ] WhaleTracker.jsx
- [ ] AlertsManager.jsx
- [ ] APIKeys.jsx

### For each page:
1. Add standardized header
2. Add correct tier badge
3. Preserve all existing functionality
4. Test thoroughly

---

## Bước 8: Create Shared Tool Page Styles

### Mục đích
Create một file CSS chung cho tất cả tool pages để maintain consistency.

### Công việc cần làm

1. **Create shared styles file**
   ```bash
   # File location:
   C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend\src\styles\tool-pages.css
   ```

2. **Add shared styles**
   ```css
   /* ============================================
      SHARED TOOL PAGE STYLES
      ============================================ */

   .tool-page {
     padding: 24px;
     max-width: 1400px;
     margin: 0 auto;
   }

   /* Tool Page Header - Already defined above */
   .tool-page-header { /* ... */ }
   .header-left { /* ... */ }
   .header-title-row { /* ... */ }
   .page-title { /* ... */ }
   .page-description { /* ... */ }
   .header-actions { /* ... */ }

   /* Filters Section */
   .filters-section {
     background: rgba(30, 42, 94, 0.4);
     backdrop-filter: blur(20px);
     border: 1px solid rgba(255, 255, 255, 0.12);
     border-radius: 16px;
     padding: 20px;
     margin-bottom: 24px;
   }

   .filters-container {
     display: flex;
     gap: 16px;
     flex-wrap: wrap;
     align-items: center;
   }

   /* Content Section */
   .content-section {
     background: rgba(30, 42, 94, 0.4);
     backdrop-filter: blur(20px);
     border: 1px solid rgba(255, 255, 255, 0.12);
     border-radius: 20px;
     padding: 24px;
   }

   /* Tier Badges */
   .tier-badge {
     font-size: 12px;
     font-weight: 700;
     padding: 6px 12px;
     border-radius: 20px;
     display: inline-flex;
     align-items: center;
     gap: 4px;
   }

   .tier-badge.tier-tier1 {
     background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
     color: white;
   }

   .tier-badge.tier-tier2 {
     background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
     color: white;
   }

   .tier-badge.tier-tier3 {
     background: linear-gradient(135deg, #FFBD59 0%, #9C0612 100%);
     color: white;
   }

   /* Responsive */
   @media (max-width: 768px) {
     .tool-page {
       padding: 16px 12px;
     }

     .filters-container {
       flex-direction: column;
       gap: 12px;
     }

     .content-section {
       padding: 16px;
     }
   }
   ```

3. **Import in each tool page**
   ```javascript
   // At top of each tool page component
   import '../../../styles/tool-pages.css';
   ```

### Verification Checklist
- [ ] Shared styles file created
- [ ] All tool pages import the file
- [ ] No style conflicts
- [ ] Responsive design works

---

## Edge Cases & Error Handling

### Edge Cases

1. **Tool page has no primary action**
   - Giải pháp: Make `header-actions` conditional

2. **Very long tool descriptions**
   - Giải pháp: Add `max-width` and truncate if needed

3. **Mobile header overflow**
   - Giải pháp: Stack header elements vertically on mobile

---

## Dependencies & Prerequisites

### Required from Phase 02:
- [ ] Navigation redesign completed
- [ ] Tier system working

### No new packages needed

---

## Completion Criteria

Phase 03 được coi là hoàn thành khi:

- [ ] Standard template defined và documented
- [ ] Scanner, Journal, Portfolio pages updated
- [ ] Risk Calculator, Position Size pages updated
- [ ] All TIER 2 tool pages updated
- [ ] All TIER 3 tool pages updated
- [ ] Shared styles file created
- [ ] All tool pages tested for functionality
- [ ] Responsive design verified
- [ ] No broken features
- [ ] Tier badges consistent across all pages

---

## Next Steps

1. Update `plan.md` status to ✅ Completed
2. Commit:
   ```bash
   git add .
   git commit -m "refactor: Complete Phase 03 - Tool Pages Layout Standardization"
   ```
3. Proceed to **phase-04-consistency-check.md**

---

**Phase 03 Status:** ⏳ Pending → Ready after Phase 02
