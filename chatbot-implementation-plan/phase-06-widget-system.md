# Phase 06: Widget System

## Phase Information

- **Duration:** 3-4 days (10-12 hours)
- **Status:** ⏳ Pending
- **Progress:** 0%
- **Dependencies:** Phase 02 (Gemini integration), Phase 05 (favorites)
- **Priority:** 🔥 MEDIUM

---

## Objectives

Enable users to save AI insights as interactive widgets on their dashboard:
1. Detect widget-worthy content in AI responses
2. Widget preview modal with live data
3. Save widgets to Account Dashboard
4. Widget grid system (drag & drop, resize)
5. Widget types: Price Alert, Pattern Watch, Portfolio Tracker, Daily Reading

---

## Deliverables

- [ ] Widget detection service
- [ ] Widget factory (4 widget types)
- [ ] Widget preview modal
- [ ] Save widget to database
- [ ] Widget grid in Account Dashboard
- [ ] Widget settings & customization

---

## Widget Types

### 1. Price Alert Widget
```javascript
{
  type: 'price_alert',
  data: {
    coin: 'BTC',
    targetPrice: 50000,
    condition: 'above', // or 'below'
    currentPrice: 48500
  }
}
```

### 2. Pattern Watch Widget
```javascript
{
  type: 'pattern_watch',
  data: {
    coin: 'ETH',
    pattern: 'Head & Shoulders',
    timeframe: '4h',
    confidence: 85
  }
}
```

### 3. Portfolio Tracker Widget
```javascript
{
  type: 'portfolio_tracker',
  data: {
    holdings: [
      { coin: 'BTC', amount: 0.5, value: 24250 },
      { coin: 'ETH', amount: 2.3, value: 4600 }
    ],
    totalValue: 28850,
    change24h: 2.5
  }
}
```

### 4. Daily Reading Widget
```javascript
{
  type: 'daily_reading',
  data: {
    hexagram: 'Qian (The Creative)',
    interpretation: 'Strong upward momentum...',
    tradingAdvice: 'Consider long positions...',
    validUntil: '2025-01-21T00:00:00Z'
  }
}
```

---

## Step 1: Widget Detection Service

### Create Widget Detector

**File:** `frontend/src/services/widgetDetector.js` (NEW)

```javascript
class WidgetDetector {
  detectWidgets(aiResponse, conversationContext = {}) {
    const detected = []

    // Price Alert detection
    const priceMatch = aiResponse.match(/BTC.*?(\$?\d{1,3}[,.]?\d{3})/i)
    if (priceMatch) {
      detected.push({
        type: 'price_alert',
        suggestion: `Bạn có muốn theo dõi giá BTC?`,
        data: {
          coin: 'BTC',
          targetPrice: parseFloat(priceMatch[1].replace(/[,$]/g, '')),
          condition: aiResponse.toLowerCase().includes('tăng') ? 'above' : 'below'
        }
      })
    }

    // Pattern Watch detection
    const patternKeywords = ['head and shoulders', 'double top', 'double bottom', 'triangle', 'flag']
    const foundPattern = patternKeywords.find(p => aiResponse.toLowerCase().includes(p))
    if (foundPattern) {
      detected.push({
        type: 'pattern_watch',
        suggestion: `Theo dõi pattern ${foundPattern}?`,
        data: {
          coin: conversationContext.coin || 'BTC',
          pattern: foundPattern,
          timeframe: '4h',
          confidence: 75
        }
      })
    }

    // Daily Reading detection (if response contains I Ching/Tarot)
    const hexagramMatch = aiResponse.match(/Quẻ (\d+):|Hexagram (\d+):/i)
    if (hexagramMatch) {
      detected.push({
        type: 'daily_reading',
        suggestion: 'Lưu quẻ này làm daily reminder?',
        data: {
          hexagram: aiResponse.slice(0, 100),
          interpretation: aiResponse,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      })
    }

    return detected
  }

  canCreateWidget(userTier) {
    const limits = {
      FREE: 0,
      TIER1: 3,
      TIER2: 10,
      TIER3: 999
    }
    return limits[userTier] || 0
  }
}

export const widgetDetector = new WidgetDetector()
```

---

## Step 2: Widget Factory

### Create Widget Components

**File:** `frontend/src/components/Widgets/WidgetFactory.jsx` (NEW)

```jsx
import React from 'react'
import { PriceAlertWidget } from './PriceAlertWidget'
import { PatternWatchWidget } from './PatternWatchWidget'
import { PortfolioTrackerWidget } from './PortfolioTrackerWidget'
import { DailyReadingWidget } from './DailyReadingWidget'

export const WidgetFactory = ({ widget, size = 'medium' }) => {
  const components = {
    price_alert: PriceAlertWidget,
    pattern_watch: PatternWatchWidget,
    portfolio_tracker: PortfolioTrackerWidget,
    daily_reading: DailyReadingWidget
  }

  const Component = components[widget.type]

  if (!Component) {
    return <div className="widget-error">Unknown widget type</div>
  }

  return <Component data={widget.data} size={size} />
}
```

---

### Example Widget: Price Alert

**File:** `frontend/src/components/Widgets/PriceAlertWidget.jsx` (NEW)

```jsx
import React, { useState, useEffect } from 'react'
import './Widget.css'

export const PriceAlertWidget = ({ data, size = 'medium' }) => {
  const [currentPrice, setCurrentPrice] = useState(data.currentPrice || 0)
  const [priceChange, setPriceChange] = useState(0)

  useEffect(() => {
    // Poll price every 10 seconds
    const interval = setInterval(async () => {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${data.coin}USDT`)
      const result = await response.json()

      const newPrice = parseFloat(result.price)
      setPriceChange(((newPrice - currentPrice) / currentPrice) * 100)
      setCurrentPrice(newPrice)

      // Check alert condition
      if (
        (data.condition === 'above' && newPrice >= data.targetPrice) ||
        (data.condition === 'below' && newPrice <= data.targetPrice)
      ) {
        // Trigger notification
        new Notification('GEM Price Alert', {
          body: `${data.coin} đã ${data.condition === 'above' ? 'vượt' : 'giảm xuống'} $${data.targetPrice}`,
          icon: '/logo.png'
        })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [data])

  return (
    <div className={`widget price-alert-widget ${size}`}>
      <div className="widget-header">
        <span className="widget-icon">💰</span>
        <h4>{data.coin} Price Alert</h4>
      </div>

      <div className="widget-body">
        <div className="current-price">
          <span className="label">Current:</span>
          <span className="value">${currentPrice.toLocaleString()}</span>
          <span className={`change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
            {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
          </span>
        </div>

        <div className="target-price">
          <span className="label">Target:</span>
          <span className="value">${data.targetPrice.toLocaleString()}</span>
          <span className="condition">{data.condition}</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${Math.min((currentPrice / data.targetPrice) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

**File:** `frontend/src/components/Widgets/Widget.css`

```css
.widget {
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(0, 217, 255, 0.1) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, #8B5CF6, #00D9FF) 1;
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s ease;
}

.widget:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(139, 92, 246, 0.3);
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.widget-icon {
  font-size: 24px;
}

.widget-header h4 {
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #00D9FF, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.current-price, .target-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}

.current-price .value {
  font-size: 24px;
  font-weight: 700;
  color: #00D9FF;
}

.change {
  font-size: 14px;
  font-weight: 600;
}

.change.positive {
  color: #00ff88;
}

.change.negative {
  color: #ff4466;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #00D9FF);
  transition: width 0.5s ease;
}

/* Widget sizes */
.widget.small {
  min-width: 200px;
  max-width: 250px;
}

.widget.medium {
  min-width: 300px;
  max-width: 350px;
}

.widget.large {
  min-width: 400px;
}
```

---

## Step 3: Widget Preview Modal

**File:** `frontend/src/components/Widgets/WidgetPreviewModal.jsx` (NEW)

```jsx
import React from 'react'
import { WidgetFactory } from './WidgetFactory'
import './WidgetPreviewModal.css'

export const WidgetPreviewModal = ({ widget, onSave, onClose }) => {
  const [widgetName, setWidgetName] = useState('')
  const [size, setSize] = useState('medium')

  const handleSave = () => {
    onSave({
      ...widget,
      name: widgetName || `${widget.type} Widget`,
      size,
      createdAt: new Date().toISOString()
    })
  }

  return (
    <div className="widget-preview-overlay">
      <div className="widget-preview-modal">
        <h2>Widget Preview</h2>
        <p className="suggestion">{widget.suggestion}</p>

        <div className="preview-area">
          <WidgetFactory widget={widget} size={size} />
        </div>

        <div className="widget-settings">
          <input
            type="text"
            placeholder="Widget name (optional)"
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
            className="widget-name-input"
          />

          <div className="size-selector">
            <label>Size:</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 4: Database Schema

**File:** `supabase/migrations/20250123_widgets_system.sql`

```sql
-- User widgets table
CREATE TABLE IF NOT EXISTS user_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  widget_name TEXT,
  widget_data JSONB NOT NULL,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  position_x INT DEFAULT 0,
  position_y INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_widgets_user ON user_widgets(user_id);
CREATE INDEX idx_user_widgets_type ON user_widgets(widget_type);

-- RLS Policies
ALTER TABLE user_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own widgets"
  ON user_widgets FOR ALL
  USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_widget_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_widgets_timestamp
  BEFORE UPDATE ON user_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_widget_timestamp();
```

---

## Step 5: Integrate into Chatbot

**Modify:** `frontend/src/pages/Chatbot.jsx`

```jsx
import { widgetDetector } from '../services/widgetDetector'
import { WidgetPreviewModal } from '../components/Widgets/WidgetPreviewModal'

const [detectedWidgets, setDetectedWidgets] = useState([])
const [showWidgetPreview, setShowWidgetPreview] = useState(null)

// After AI response:
const handleSend = async () => {
  // ... existing code ...

  const aiResponse = await chatbotService.chatWithMaster(input, conversationHistory)

  // Detect potential widgets
  const widgets = widgetDetector.detectWidgets(aiResponse, { coin: 'BTC' })
  if (widgets.length > 0) {
    setDetectedWidgets(widgets)
  }

  // ... rest of code ...
}

// Save widget to database
const saveWidget = async (widget) => {
  const { data, error } = await supabase
    .from('user_widgets')
    .insert({
      user_id: user.id,
      widget_type: widget.type,
      widget_name: widget.name,
      widget_data: widget.data,
      size: widget.size
    })

  if (!error) {
    toast.success('Widget saved to dashboard!')
    setShowWidgetPreview(null)
  }
}

// Widget suggestion badges
{detectedWidgets.length > 0 && (
  <div className="widget-suggestions">
    <p>💡 Suggestions:</p>
    {detectedWidgets.map((widget, idx) => (
      <button
        key={idx}
        onClick={() => setShowWidgetPreview(widget)}
        className="widget-suggestion-badge"
      >
        {widget.suggestion}
      </button>
    ))}
  </div>
)}

{/* Widget preview modal */}
{showWidgetPreview && (
  <WidgetPreviewModal
    widget={showWidgetPreview}
    onSave={saveWidget}
    onClose={() => setShowWidgetPreview(null)}
  />
)}
```

---

## Step 6: Widget Grid in Account Dashboard

**Modify:** `frontend/src/pages/Account/AccountDashboard.jsx`

Add a new section after existing cards:

```jsx
import { WidgetFactory } from '../../components/Widgets/WidgetFactory'
import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const [widgets, setWidgets] = useState([])

useEffect(() => {
  loadWidgets()
}, [user])

const loadWidgets = async () => {
  const { data } = await supabase
    .from('user_widgets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  setWidgets(data || [])
}

const removeWidget = async (widgetId) => {
  await supabase.from('user_widgets').delete().eq('id', widgetId)
  setWidgets(prev => prev.filter(w => w.id !== widgetId))
}

// Add to JSX:
<section className="widgets-section">
  <h2>My Widgets</h2>

  {widgets.length === 0 ? (
    <div className="empty-state">
      <p>Chưa có widget nào. Hỏi chatbot để nhận gợi ý widget!</p>
    </div>
  ) : (
    <div className="widgets-grid">
      {widgets.map(widget => (
        <div key={widget.id} className="widget-container">
          <WidgetFactory
            widget={{ type: widget.widget_type, data: widget.widget_data }}
            size={widget.size}
          />
          <button
            onClick={() => removeWidget(widget.id)}
            className="remove-widget-btn"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</section>
```

**Style:** `AccountDashboard.css`

```css
.widgets-section {
  margin-top: 24px;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.widget-container {
  position: relative;
}

.remove-widget-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.8);
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.widget-container:hover .remove-widget-btn {
  opacity: 1;
}
```

---

## Step 7: Testing

### Test Cases

1. **Widget detection:**
   - Ask: "Thông báo khi BTC lên $50,000"
   - Verify: Price alert widget suggestion appears

2. **Widget preview:**
   - Click suggestion
   - Verify: Modal opens with live preview

3. **Save widget:**
   - Customize name + size
   - Click "Save to Dashboard"
   - Navigate to /account
   - Verify: Widget appears in grid

4. **Widget updates:**
   - Price alert widget should update every 10s
   - Verify: Live data refreshes

5. **Remove widget:**
   - Click X button
   - Verify: Widget removed from dashboard

### Verification Checklist

- [ ] Widget detection works for all 4 types
- [ ] Preview modal displays correctly
- [ ] Widgets save to database
- [ ] Dashboard grid loads widgets
- [ ] Live data updates functional
- [ ] Remove widget works
- [ ] Tier limits enforced (FREE: 0, TIER1: 3, TIER2: 10, TIER3: unlimited)

---

## Completion Criteria

- [ ] Widget detection service complete
- [ ] 4 widget types implemented
- [ ] Preview modal functional
- [ ] Database schema deployed
- [ ] Account Dashboard integration complete
- [ ] All tests passing
- [ ] Commit: `feat: complete phase-06 - widget system`

---

## Next Steps

Open `phase-07-testing-launch.md`
