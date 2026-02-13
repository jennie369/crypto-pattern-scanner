# Phase 03: UX Enhancements

## Phase Information

- **Duration:** 2-3 days (6-8 hours)
- **Status:** ⏳ Pending
- **Progress:** 0%
- **Dependencies:** None (can run parallel with Phase 02)
- **Priority:** 🔥🔥 HIGH

---

## Objectives

Polish the chatbot UX with:
1. CSKH customer support buttons (Facebook, Zalo, Telegram)
2. Sound effects with toggle control
3. NFT-style glassmorphism redesign
4. Auto-send suggestions (no extra click)
5. Clear chat history button

---

## Deliverables

- [ ] CSKH modal + buttons
- [ ] Sound toggle + notification sounds
- [ ] NFT card styling applied
- [ ] Auto-send suggestions enabled
- [ ] Clear history button functional

---

## Step 1: CSKH Customer Support Integration

### Create CSKH Buttons

**File:** `frontend/src/components/Chatbot/CSKHButtons.jsx` (NEW)

```jsx
import React from 'react'
import './CSKHButtons.css'

export const CSKHButtons = ({ placement = 'sidebar' }) => {
  const cskh = [
    {
      name: 'Facebook',
      icon: '💬',
      url: 'https://www.facebook.com/yinyangmasterscrystals/',
      color: '#1877F2'
    },
    {
      name: 'Zalo',
      icon: '📱',
      url: 'https://zalo.me/0787238002',
      color: '#0068FF'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: 'https://t.me/gemholdingchannel',
      color: '#0088CC'
    }
  ]

  return (
    <div className={`cskh-buttons ${placement}`}>
      <h4 className="cskh-title">💬 Cần hỗ trợ?</h4>
      {cskh.map(channel => (
        <a
          key={channel.name}
          href={channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="cskh-btn"
          style={{ '--cskh-color': channel.color }}
        >
          <span className="cskh-icon">{channel.icon}</span>
          <span className="cskh-text">Chat qua {channel.name}</span>
        </a>
      ))}
    </div>
  )
}
```

**Style:** `CSKHButtons.css`
```css
.cskh-buttons {
  margin: 16px 0;
}

.cskh-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.cskh-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cskh-btn:hover {
  background: var(--cskh-color);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.cskh-icon {
  font-size: 20px;
}
```

**Add to Chatbot.jsx:**
```jsx
import { CSKHButtons } from '../components/Chatbot/CSKHButtons'

// In sidebar, after usage card:
<CSKHButtons placement="sidebar" />
```

---

## Step 2: Sound Effects

### Add Sound Files

Create: `frontend/public/sounds/`
- `notification.mp3` - Soft chime when AI responds
- `send.mp3` - Click sound when user sends
- `error.mp3` - Alert sound on error

**Or use Web Audio API (no files needed):**

```javascript
// frontend/src/hooks/useChatbotSounds.js
export const useChatbotSounds = () => {
  const playNotification = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  return { playNotification }
}
```

### Add Sound Toggle

**In Chatbot.jsx:**
```jsx
const [soundEnabled, setSoundEnabled] = useState(
  localStorage.getItem('chatbot-sound') !== 'false'
)

const toggleSound = () => {
  const newValue = !soundEnabled
  setSoundEnabled(newValue)
  localStorage.setItem('chatbot-sound', newValue.toString())
}

// In header:
<button onClick={toggleSound} className="sound-toggle-btn">
  {soundEnabled ? '🔊' : '🔇'}
</button>

// When bot responds:
useEffect(() => {
  if (soundEnabled && lastMessageWasBot) {
    playNotification()
  }
}, [messages])
```

---

## Step 3: NFT-Style Redesign

### Reference Design
`C:\Users\Jennie Chu\Downloads\NFT - NFT Webflow Template - BRIX Templates.jpeg`

**Key Elements:**
- Glassmorphism cards
- Gradient borders (cyan to purple)
- 3D depth with shadows
- Hover glow effects

### Update Chatbot.css

```css
/* NFT-style glassmorphic message bubbles */
.bot-message {
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(0, 217, 255, 0.1) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, #8B5CF6, #00D9FF) 1;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
}

.bot-message:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(139, 92, 246, 0.4);
}

/* Gradient text for bot name */
.bot-name {
  background: linear-gradient(135deg, #00D9FF, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}
```

---

## Step 4: Auto-Send Suggestions

### Current Behavior
Click suggestion → fills input → user clicks send

### New Behavior
Click suggestion → auto-sends immediately

**In Chatbot.jsx:**
```jsx
// OLD:
const handleSuggestionClick = (suggestion) => {
  setInput(suggestion)
}

// NEW:
const handleSuggestionClick = (suggestion) => {
  setInput(suggestion)
  setTimeout(() => handleSend(suggestion), 100) // Auto-send
}
```

---

## Step 5: Clear Chat History

**Add button:**
```jsx
const clearHistory = async () => {
  if (!confirm('Xóa toàn bộ lịch sử chat? Không thể khôi phục.')) return

  const { error } = await supabase
    .from('chatbot_history')
    .delete()
    .eq('user_id', user.id)

  if (!error) {
    setMessages([])
    setConversationHistory([])
    toast.success('Đã xóa lịch sử chat')
  }
}

// In header:
<button onClick={clearHistory} className="clear-history-btn" title="Xóa lịch sử">
  🗑️
</button>
```

---

## Completion Criteria

- [ ] CSKH buttons work (open correct links)
- [ ] Sound toggle saves preference
- [ ] NFT styling applied
- [ ] Auto-send works smoothly
- [ ] Clear history confirms before deleting
- [ ] Commit: `feat: complete phase-03 - ux enhancements`

---

## Next Steps

Open `phase-04-product-integration.md`
