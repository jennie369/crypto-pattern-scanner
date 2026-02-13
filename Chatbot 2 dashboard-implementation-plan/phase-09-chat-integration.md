# Phase 09: Chat Integration

## Thông Tin Phase
- **Thời lượng ước tính:** 3-4 ngày
- **Trạng thái:** ⏳ Pending
- **Tiến độ:** 0%
- **Phụ thuộc:** Phase 07 (Smart Detection), Phase 08 (Widget Factory)

## Mục Tiêu
Tích hợp widget detection và creation vào Chatbot, cho phép user tạo dashboard widgets ngay từ chat interface.

## Deliverables
- [ ] Update Chatbot.jsx với widget detection
- [ ] Widget creation prompt UI
- [ ] "Add to Dashboard" flow
- [ ] Success/error handling
- [ ] Tier-based widget limits enforcement

---

## Bước 1: Update Chatbot.jsx - Add Imports & State

### Mục đích
Thêm imports và state variables cần thiết cho widget system.

### Công việc cần làm

1. **Thêm imports vào Chatbot.jsx**

```javascript
// File: frontend/src/pages/Chatbot.jsx
// Add these imports

import { ResponseDetector, ResponseTypes } from '../services/responseDetector';
import { WidgetFactory, WIDGET_LIMITS } from '../services/widgetFactory';
import { Lightbulb, Plus, X } from 'lucide-react';
import '../styles/widgetPrompt.css';
```

2. **Thêm state variables**

```javascript
// Inside Chatbot component, add these states:

const [pendingWidget, setPendingWidget] = useState(null);
const [showWidgetPrompt, setShowWidgetPrompt] = useState(false);
const [widgetCount, setWidgetCount] = useState(0);
const [isCreatingWidget, setIsCreatingWidget] = useState(false);

// Initialize detector
const responseDetector = new ResponseDetector();
```

3. **Thêm useEffect để load widget count**

```javascript
useEffect(() => {
  if (user) {
    loadWidgetCount();
  }
}, [user]);

const loadWidgetCount = async () => {
  try {
    const { count, error } = await supabase
      .from('dashboard_widgets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_visible', true);

    if (!error) {
      setWidgetCount(count || 0);
    }
  } catch (error) {
    console.error('Error loading widget count:', error);
  }
};
```

### Files cần sửa
- `frontend/src/pages/Chatbot.jsx` - Add imports & state

### Verification Checklist
- [ ] Imports added successfully
- [ ] State variables declared
- [ ] loadWidgetCount() function working
- [ ] No TypeScript/import errors

---

## Bước 2: Update handleSend - Add Widget Detection

### Mục đích
Sau khi nhận AI response, detect xem có thể tạo widget không.

### Công việc cần làm

1. **Update handleSend function**

```javascript
// In handleSend function, after receiving AI response

const handleSend = async (e) => {
  e?.preventDefault();
  if (!currentInput.trim()) return;

  // ... existing code để send message ...

  // Get AI response
  const response = await chatbotService.chatWithMaster(currentInput, conversationHistory);

  // Add AI message to chat
  const aiMessage = {
    role: 'assistant',
    content: response.response,
    timestamp: new Date().toISOString()
  };

  setMessages(prev => [...prev, aiMessage]);

  // ✨ NEW: Detect if response can create widgets
  const detection = responseDetector.detect(response.response);

  console.log('🎯 Widget Detection Result:', detection);

  // If widget-worthy response (confidence >= 0.85), show prompt
  if (detection.type !== ResponseTypes.GENERAL_CHAT && detection.confidence >= 0.85) {
    setPendingWidget({
      detection: detection,
      aiResponse: response.response,
      userInput: currentInput
    });
    setShowWidgetPrompt(true);
  }

  // ... existing code ...
};
```

### Verification Checklist
- [ ] Detection runs after AI response
- [ ] detection.type correctly identified
- [ ] pendingWidget state updated
- [ ] showWidgetPrompt shows when appropriate
- [ ] Console log shows detection result

---

## Bước 3: Create Widget Prompt UI Component

### Mục đích
Hiển thị prompt hỏi user có muốn add to dashboard không.

### Công việc cần làm

1. **Add Widget Prompt JSX vào Chatbot.jsx**

```javascript
// Add this before closing </div> of chatbot-container

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
          <X size={16} /> Không, cảm ơn
        </button>
      </div>
    </div>
  </div>
)}
```

2. **Add helper functions**

```javascript
// Add these helper functions in Chatbot component

const canCreateWidget = () => {
  const userTier = user?.scanner_tier?.toUpperCase() || 'FREE';
  const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;

  if (limits.maxWidgets === -1) return true; // Unlimited

  return widgetCount < limits.maxWidgets;
};

const getCurrentLimit = () => {
  const userTier = user?.scanner_tier?.toUpperCase() || 'FREE';
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
      // Success!
      toast.success(result.message || '✨ Widget đã được tạo!');

      // Hide prompt
      setShowWidgetPrompt(false);
      setPendingWidget(null);

      // Reload widget count
      await loadWidgetCount();

      // Add system message với link to dashboard
      setMessages(prev => [...prev, {
        role: 'system',
        content: `${result.message}\n\n[📊 Xem Dashboard Ngay](/dashboard)`,
        timestamp: new Date().toISOString(),
        isButton: true
      }]);

    } else {
      toast.error(result?.error || 'Có lỗi khi tạo widget. Vui lòng thử lại!');
    }

  } catch (error) {
    console.error('Error creating widget:', error);
    toast.error('Có lỗi khi tạo widget. Vui lòng thử lại!');
  } finally {
    setIsCreatingWidget(false);
  }
};
```

### Files cần sửa
- `frontend/src/pages/Chatbot.jsx` - Add widget prompt UI & handlers

### Verification Checklist
- [ ] Widget prompt appears after eligible AI response
- [ ] Prompt shows correct message based on detection type
- [ ] Tier limit warning shows when applicable
- [ ] "Thêm vào Dashboard" button works
- [ ] "Không, cảm ơn" button closes prompt
- [ ] Loading state shows during creation

---

## Bước 4: Create Widget Prompt Styles

### Mục đích
Style cho widget prompt với glassmorphism design.

### Công việc cần làm

1. **Tạo file widgetPrompt.css**

```css
/* File: frontend/src/styles/widgetPrompt.css */

.widget-prompt {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.widget-prompt-content {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15) 0%,
    rgba(0, 217, 255, 0.15) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
}

.widget-prompt-icon {
  font-size: 2.5em;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.widget-prompt-text {
  flex: 1;
}

.widget-prompt-text h4 {
  color: #fff;
  margin-bottom: 8px;
  font-size: 1.1em;
  font-weight: 600;
}

.widget-prompt-text p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
  margin: 0;
}

.tier-warning {
  color: #FFD700 !important;
  font-weight: 600;
  margin-top: 8px !important;
}

.tier-warning a {
  color: #00D9FF;
  text-decoration: underline;
  margin-left: 4px;
}

.widget-prompt-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.widget-prompt-actions button {
  white-space: nowrap;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.widget-prompt-actions .btn-primary {
  background: linear-gradient(135deg, #8B5CF6, #00D9FF);
  color: white;
  border: none;
}

.widget-prompt-actions .btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.widget-prompt-actions .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.widget-prompt-actions .btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.widget-prompt-actions .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .widget-prompt {
    bottom: 80px;
    width: 95%;
  }

  .widget-prompt-content {
    flex-direction: column;
    text-align: center;
  }

  .widget-prompt-actions {
    width: 100%;
  }

  .widget-prompt-actions button {
    width: 100%;
  }
}
```

### Files cần tạo
- `frontend/src/styles/widgetPrompt.css` - Widget prompt styles

### Verification Checklist
- [ ] File CSS tạo thành công
- [ ] Prompt appears with slide-up animation
- [ ] Glassmorphism effect visible
- [ ] Icon has pulse animation
- [ ] Buttons have hover effects
- [ ] Mobile responsive works

---

## Bước 5: Test Full Chat → Widget Flow

### Manual Testing Checklist
- [ ] Chat với AI về manifestation goal
- [ ] Widget prompt appears
- [ ] Click "Thêm vào Dashboard" → widget created
- [ ] Success toast appears
- [ ] Widget count updates
- [ ] Dashboard link appears in chat
- [ ] Test với FREE user (limit 3 widgets)
- [ ] Test tier limit warning
- [ ] Test "Không, cảm ơn" button
- [ ] Test multiple widget creations in one session

---

## Edge Cases & Error Handling

### Edge Cases

1. **AI response không đúng format**
   - Hiện tượng: Detection confidence < 0.85
   - Giải pháp: Không show prompt, log warning

2. **User spam "Thêm vào Dashboard"**
   - Hiện tượng: Click nhiều lần
   - Giải pháp: Disable button khi isCreatingWidget = true

3. **Database insert fails**
   - Hiện tượng: Supabase error
   - Giải pháp: Show error toast, keep prompt open để retry

### Error Handling

```javascript
// In handleAddToDashboard
try {
  // ... existing code ...
} catch (error) {
  console.error('Error creating widget:', error);

  // Specific error messages
  if (error.message.includes('unique constraint')) {
    toast.error('Widget này đã tồn tại!');
  } else if (error.message.includes('foreign key')) {
    toast.error('Lỗi liên kết dữ liệu. Vui lòng thử lại!');
  } else {
    toast.error('Có lỗi khi tạo widget. Vui lòng thử lại!');
  }

  // Don't hide prompt on error, allow retry
}
```

---

## Completion Criteria

Phase 09 hoàn thành khi:
- [ ] Chatbot.jsx updated với widget detection
- [ ] Widget prompt UI hoạt động
- [ ] Create widget flow works end-to-end
- [ ] Tier limits được enforce
- [ ] Error handling robust
- [ ] Mobile responsive
- [ ] Tests pass

---

## Next Steps

1. Update `plan.md`: Mark Phase 09 = ✅
2. Commit: `feat: complete phase-09 - chat integration`
3. Review với user
4. Sang `phase-10-widget-preview.md`
