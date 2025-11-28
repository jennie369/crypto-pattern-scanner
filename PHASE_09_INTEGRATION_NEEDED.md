# Phase 09: Chatbot Integration - Remaining Work

## STATUS: Partially Complete

### ✅ Completed:
1. Added imports (ResponseDetector, WidgetFactory, WIDGET_LIMITS)
2. Added state variables (pendingWidget, showWidgetPrompt, isCreatingWidget)
3. Added loadWidgetCount function
4. Created widgetPrompt.css with glassmorphism styles
5. Imported widgetPrompt.css in Chatbot.jsx

### ⏳ Remaining Work:

## 1. Add Helper Functions to Chatbot.jsx

Add these functions before the return statement in Chatbot component:

```javascript
// Widget helper functions
const canCreateWidget = () => {
  const userTier = profile?.scanner_tier?.toUpperCase() || 'FREE';
  const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;

  if (limits.maxWidgets === -1) return true; // Unlimited

  return widgetCount < limits.maxWidgets;
};

const getCurrentLimit = () => {
  const userTier = profile?.scanner_tier?.toUpperCase() || 'FREE';
  const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;
  return limits.maxWidgets;
};

const handleAddToDashboard = async () => {
  if (!pendingWidget || !canCreateWidget()) return;

  setIsCreatingWidget(true);

  try {
    const result = await WidgetFactory.createFromAIResponse(
      user.id,
      pendingWidget.aiResponse,
      pendingWidget.detection
    );

    if (result && result.success) {
      // Success toast
      alert('✨ ' + (result.message || 'Widget đã được tạo!'));

      // Hide prompt
      setShowWidgetPrompt(false);
      setPendingWidget(null);

      // Reload widget count
      await loadWidgetCount();

      // Add system message with link to dashboard
      setMessages(prev => [...prev, {
        id: Date.now() + 100,
        type: 'system',
        content: `${result.message}\n\n👉 [Xem Dashboard Ngay](/dashboard)`,
        timestamp: new Date().toISOString()
      }]);

    } else {
      alert('❌ ' + (result?.error || 'Có lỗi khi tạo widget. Vui lòng thử lại!'));
    }

  } catch (error) {
    console.error('Error creating widget:', error);
    alert('❌ Có lỗi khi tạo widget. Vui lòng thử lại!');
  } finally {
    setIsCreatingWidget(false);
  }
};
```

## 2. Update handleSend Function

Find the existing widget detection code (around line 315):

```javascript
// OLD CODE TO REPLACE:
// Detect widgets in bot response
const widgets = widgetDetector.detectWidgets(botMessage.content, {
  coin: extractCoin(action),
  userInput: action
});
if (widgets.length > 0) {
  console.log('🎯 Detected widgets:', widgets);
  setDetectedWidgets(widgets);
}
```

**REPLACE WITH:**

```javascript
// ✨ NEW: Detect if response can create widgets using ResponseDetector
const detection = responseDetector.detect(botMessage.content);

console.log('🎯 Widget Detection Result:', detection);

// If widget-worthy response (confidence >= 0.85), show prompt
if (detection.type !== ResponseTypes.GENERAL_CHAT && detection.confidence >= 0.85) {
  setPendingWidget({
    detection: detection,
    aiResponse: botMessage.content,
    userInput: currentInput
  });
  setShowWidgetPrompt(true);
}

// Keep old widget detector for backwards compatibility
const widgets = widgetDetector.detectWidgets(botMessage.content, {
  coin: extractCoin(currentInput),
  userInput: currentInput
});
if (widgets.length > 0) {
  console.log('🎯 Old detector - Detected widgets:', widgets);
  setDetectedWidgets(widgets);
}
```

## 3. Add Widget Prompt UI

Find the return statement and add this BEFORE the closing `</div>` of the main container (near the end of JSX):

```jsx
{/* Widget Creation Prompt */}
{showWidgetPrompt && pendingWidget && (
  <div className="widget-prompt">
    <div className="widget-prompt-content">
      <div className="widget-prompt-icon">
        <Lightbulb size={32} color="#FFD700" />
      </div>

      <div className="widget-prompt-text">
        <h4>✨ Gemral có thể tạo dashboard cho bạn!</h4>
        <p>
          {pendingWidget.detection.type === ResponseTypes.MANIFESTATION_GOAL &&
            'Tự động track progress, nhắc nhở hàng ngày, và nhiều hơn nữa.'}
          {pendingWidget.detection.type === ResponseTypes.CRYSTAL_RECOMMENDATION &&
            'Lưu crystal recommendations và usage guide.'}
          {pendingWidget.detection.type === ResponseTypes.AFFIRMATIONS_ONLY &&
            'Tạo affirmation widget với daily reminders.'}
          {pendingWidget.detection.type === ResponseTypes.TRADING_ANALYSIS &&
            'Lưu trading analysis và spiritual insights.'}
        </p>

        {/* Show tier limit warning if needed */}
        {!canCreateWidget() && (
          <p className="tier-warning">
            ⚠️ Bạn đã đạt giới hạn {getCurrentLimit()} widgets.
            <a href="/pricing">Upgrade để tạo thêm</a>
          </p>
        )}
      </div>

      <div className="widget-prompt-actions">
        <button
          className="btn-primary"
          onClick={handleAddToDashboard}
          disabled={!canCreateWidget() || isCreatingWidget}
        >
          {isCreatingWidget ? '⏳ Đang tạo...' : '✅ Thêm vào Dashboard'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            setShowWidgetPrompt(false);
            setPendingWidget(null);
          }}
        >
          Không, cảm ơn
        </button>
      </div>
    </div>
  </div>
)}
```

## 4. Import Plus and X icons

Add to the Lucide imports (line 2):

```javascript
import { MessageCircle, Sparkles, Eye, CreditCard, Lock, Unlock, ScrollText, Send, Lightbulb, Trash2, Volume2, VolumeX, Download, Share2, Printer, FileText, BarChart3, Settings as SettingsIcon, Moon, Sun, Globe, Plus, X } from 'lucide-react';
```

---

## TESTING CHECKLIST

After implementing:

- [ ] Chat about manifestation goal → widget prompt appears
- [ ] Click "Thêm vào Dashboard" → widget created in database
- [ ] Widget count updates
- [ ] Dashboard link appears in chat
- [ ] Tier limit warning shows for FREE users (>3 widgets)
- [ ] "Không, cảm ơn" closes prompt
- [ ] Try with crystal recommendation
- [ ] Try with affirmations
- [ ] Check console for detection logs

---

**Next:** After manual testing, update plan.md and commit Phase 09.
