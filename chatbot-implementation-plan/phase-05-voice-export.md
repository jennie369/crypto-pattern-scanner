# Phase 05: Voice & Export Features

## Phase Information

- **Duration:** 2-3 days (6-8 hours)
- **Status:** ⏳ Pending
- **Progress:** 0%
- **Dependencies:** Phase 02 (Gemini integration)
- **Priority:** 🔥 MEDIUM (TIER3 exclusive)

---

## Objectives

Add premium features for TIER3 users:
1. Voice input using Web Speech API (Vietnamese + English)
2. PDF export of chat sessions with branding
3. Social media sharing (Web Share API)
4. Save favorite readings to profile

---

## Deliverables

- [ ] Voice input component with recording UI
- [ ] PDF export service (jspdf + html2canvas)
- [ ] Social share functionality
- [ ] Favorite readings system
- [ ] Tier access gates for features

---

## Step 1: Voice Input Component

### Create Voice Service

**File:** `frontend/src/services/voiceInput.js` (NEW)

```javascript
class VoiceInputService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.initRecognition()
  }

  initRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    // Settings
    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1

    // Support Vietnamese + English
    this.recognition.lang = 'vi-VN'
  }

  setLanguage(lang) {
    if (this.recognition) {
      this.recognition.lang = lang
    }
  }

  start(onResult, onEnd, onError) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported')
      return
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      const isFinal = event.results[0].isFinal
      onResult?.(transcript, isFinal)
    }

    this.recognition.onend = () => {
      this.isListening = false
      onEnd?.()
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      onError?.(event.error)
    }

    this.recognition.start()
    this.isListening = true
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  isSupported() {
    return this.recognition !== null
  }
}

export const voiceInputService = new VoiceInputService()
```

---

### Voice Input Button Component

**File:** `frontend/src/components/Chatbot/VoiceInputButton.jsx` (NEW)

```jsx
import React, { useState, useEffect } from 'react'
import './VoiceInputButton.css'
import { voiceInputService } from '../../services/voiceInput'

export const VoiceInputButton = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [language, setLanguage] = useState('vi-VN')

  const toggleListening = () => {
    if (isListening) {
      voiceInputService.stop()
      setIsListening(false)
    } else {
      voiceInputService.setLanguage(language)
      voiceInputService.start(
        (transcript, isFinal) => {
          if (isFinal) {
            onTranscript(transcript)
            setInterimText('')
          } else {
            setInterimText(transcript)
          }
        },
        () => setIsListening(false),
        (error) => {
          console.error('Voice input error:', error)
          setIsListening(false)
        }
      )
      setIsListening(true)
    }
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'vi-VN' ? 'en-US' : 'vi-VN')
  }

  if (!voiceInputService.isSupported()) {
    return null
  }

  return (
    <div className="voice-input-container">
      <button
        onClick={toggleListening}
        disabled={disabled}
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        title={isListening ? 'Nhấn để dừng' : 'Nhấn để nói'}
      >
        {isListening ? '🎙️' : '🎤'}
      </button>

      <button
        onClick={toggleLanguage}
        className="lang-toggle"
        title="Đổi ngôn ngữ"
      >
        {language === 'vi-VN' ? '🇻🇳' : '🇺🇸'}
      </button>

      {interimText && (
        <div className="interim-text">
          {interimText}
        </div>
      )}
    </div>
  )
}
```

**Style:** `VoiceInputButton.css`

```css
.voice-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.voice-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.voice-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.voice-btn.listening {
  background: linear-gradient(135deg, #ff006e, #ff5400);
  border-color: #ff006e;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.lang-toggle {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.interim-text {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  color: #00D9FF;
  font-size: 14px;
  white-space: nowrap;
}
```

---

### Integrate into Chatbot

**Modify:** `frontend/src/pages/Chatbot.jsx`

```jsx
import { VoiceInputButton } from '../components/Chatbot/VoiceInputButton'

// In input area (TIER3 only):
{user?.tier === 'TIER3' && (
  <VoiceInputButton
    onTranscript={(text) => {
      setInput(text)
      setTimeout(() => handleSend(text), 500)
    }}
    disabled={isLoading}
  />
)}
```

---

## Step 2: PDF Export

### Install Dependencies

```bash
npm install jspdf html2canvas
```

---

### Create PDF Export Service

**File:** `frontend/src/services/pdfExport.js` (NEW)

```javascript
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

class PDFExportService {
  async exportChatSession(messages, metadata = {}) {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    let yPosition = 20

    // Header
    pdf.setFontSize(20)
    pdf.setTextColor(139, 92, 246)
    pdf.text('GEM Chatbot - Chat Session', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 10
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Exported: ${new Date().toLocaleString('vi-VN')}`, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 15

    // Messages
    for (const msg of messages) {
      // Check if need new page
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 20
      }

      // User or Bot label
      pdf.setFontSize(12)
      pdf.setTextColor(msg.role === 'user' ? 100 : 139, msg.role === 'user' ? 100 : 92, msg.role === 'user' ? 100 : 246)
      pdf.text(msg.role === 'user' ? 'You:' : 'Master Jennie:', 15, yPosition)

      yPosition += 7

      // Message content
      pdf.setFontSize(10)
      pdf.setTextColor(50, 50, 50)

      // Word wrap
      const lines = pdf.splitTextToSize(msg.content, pageWidth - 30)
      pdf.text(lines, 15, yPosition)

      yPosition += (lines.length * 5) + 10
    }

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text('Generated by GEM Trading Academy', pageWidth / 2, pageHeight - 10, { align: 'center' })
    pdf.text('https://gem.trading', pageWidth / 2, pageHeight - 5, { align: 'center' })

    // Save
    const filename = `GEM-Chat-${Date.now()}.pdf`
    pdf.save(filename)
  }

  async exportAsImage(elementId) {
    const element = document.getElementById(elementId)
    if (!element) return

    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0a0f',
      scale: 2
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')

    const imgWidth = pdf.internal.pageSize.getWidth()
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`GEM-Reading-${Date.now()}.pdf`)
  }
}

export const pdfExportService = new PDFExportService()
```

---

### Export Button Component

**Add to Chatbot.jsx:**

```jsx
import { pdfExportService } from '../services/pdfExport'

const handleExportPDF = async () => {
  if (user?.tier !== 'TIER3') {
    toast.error('Tính năng này chỉ dành cho TIER3')
    return
  }

  await pdfExportService.exportChatSession(messages, {
    userName: user.name,
    tier: user.tier,
    sessionDate: new Date().toISOString()
  })

  toast.success('Đã xuất PDF thành công!')
}

// In sidebar header:
{user?.tier === 'TIER3' && (
  <button onClick={handleExportPDF} className="export-btn" title="Xuất PDF">
    📄
  </button>
)}
```

---

## Step 3: Social Share

### Create Share Service

**File:** `frontend/src/services/shareService.js` (NEW)

```javascript
class ShareService {
  async shareReading(reading, method = 'native') {
    const shareData = {
      title: 'GEM Chatbot - My Reading',
      text: `${reading.title}\n\n${reading.content.slice(0, 200)}...`,
      url: window.location.href
    }

    if (method === 'native' && navigator.share) {
      try {
        await navigator.share(shareData)
        return { success: true, method: 'native' }
      } catch (error) {
        console.error('Share failed:', error)
        return { success: false, error }
      }
    }

    // Fallback to social media URLs
    return this.shareFallback(shareData)
  }

  shareFallback(data) {
    const encodedText = encodeURIComponent(data.text)
    const encodedUrl = encodeURIComponent(data.url)

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      copy: 'copy'
    }

    return urls
  }

  copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text)
    }

    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

export const shareService = new ShareService()
```

---

### Share Button

**Add to reading cards:**

```jsx
import { shareService } from '../services/shareService'

const handleShare = async () => {
  const reading = {
    title: currentReading.name,
    content: currentReading.interpretation
  }

  const result = await shareService.shareReading(reading)

  if (result.success) {
    toast.success('Đã chia sẻ!')
  } else {
    // Show social options
    setShowShareModal(true)
  }
}

// Share button
<button onClick={handleShare} className="share-btn">
  🔗 Chia sẻ
</button>
```

---

## Step 4: Save Favorites

### Database Migration

**File:** `supabase/migrations/20250122_favorite_readings.sql`

```sql
CREATE TABLE IF NOT EXISTS favorite_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('iching', 'tarot', 'chat')),
  reading_data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_favorites_user ON favorite_readings(user_id);
CREATE INDEX idx_favorites_type ON favorite_readings(reading_type);

-- RLS
ALTER TABLE favorite_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
  ON favorite_readings FOR ALL
  USING (auth.uid() = user_id);
```

---

### Save/Unsave Functionality

**Add to Chatbot.jsx:**

```jsx
const [favorites, setFavorites] = useState([])

const saveFavorite = async (reading) => {
  const { data, error } = await supabase
    .from('favorite_readings')
    .insert({
      user_id: user.id,
      reading_type: currentMode,
      reading_data: reading,
      notes: ''
    })
    .select()
    .single()

  if (!error) {
    setFavorites(prev => [...prev, data])
    toast.success('Đã lưu vào yêu thích!')
  }
}

const removeFavorite = async (favoriteId) => {
  await supabase
    .from('favorite_readings')
    .delete()
    .eq('id', favoriteId)

  setFavorites(prev => prev.filter(f => f.id !== favoriteId))
  toast.success('Đã xóa khỏi yêu thích')
}

// Favorite button
<button onClick={() => saveFavorite(currentReading)} className="favorite-btn">
  ⭐ Lưu
</button>
```

---

## Step 5: Testing

### Test Cases

1. **Voice input:**
   - Click mic button
   - Speak Vietnamese: "BTC có nên mua không?"
   - Verify: Text appears in input, auto-sends

2. **Language switching:**
   - Toggle to English (🇺🇸)
   - Speak: "Should I buy Bitcoin?"
   - Verify: English recognized correctly

3. **PDF export:**
   - Chat with bot (5+ messages)
   - Click export button
   - Verify: PDF downloads with correct content

4. **Social share:**
   - Click share button
   - Verify: Native share dialog or fallback options

5. **Favorites:**
   - Save I Ching reading
   - Reload page
   - Verify: Reading still in favorites

### Verification Checklist

- [ ] Voice input works (Vietnamese + English)
- [ ] PDF export includes all messages
- [ ] Share functionality triggers correctly
- [ ] Favorites persist across sessions
- [ ] Features gated to TIER3 users only
- [ ] Mobile compatibility verified

---

## Completion Criteria

- [ ] Voice input functional with both languages
- [ ] PDF export service working
- [ ] Social share implemented
- [ ] Favorite readings system complete
- [ ] All features TIER3-gated
- [ ] No console errors
- [ ] Commit: `feat: complete phase-05 - voice & export features`

---

## Next Steps

Open `phase-06-widget-system.md`
