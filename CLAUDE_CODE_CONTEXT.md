# 🤖 CLAUDE CODE - PROJECT CONTEXT & HANDOFF

## 📋 PROJECT OVERVIEW

**Project Name:** Crypto Pattern Scanner  
**Company:** Gem Holding  
**Owner:** Jennie Chu  
**Current Status:** 90% Complete - Phase 1  
**Deployment:** Streamlit Cloud  
**URL:** https://crypto-pattern-scanner.streamlit.app/

---

## 🎯 WHAT WE'VE BUILT

### **Core Functionality:**
1. ✅ Real-time crypto pattern detection (13 patterns)
2. ✅ User authentication system
3. ✅ Interactive charts with Plotly
4. ✅ Trading plan generation (Entry/SL/TP)
5. ✅ Admin panel for user management
6. ✅ Professional UI with Gem Holding branding

### **Tech Stack:**
- **Backend:** Python 3.11+, CCXT (exchange API), Pandas, NumPy
- **Frontend:** Streamlit, Plotly, HTML/CSS
- **Deployment:** Git/GitHub → Streamlit Cloud (auto-deploy)
- **Data:** JSON files for users, real-time from OKX exchange

---

## 📁 PROJECT STRUCTURE

```
crypto-pattern-scanner/
│
├── app.py                      # Main application file
├── config.py                   # Configuration (coins, users, settings)
├── pattern_detector.py         # Pattern detection algorithms
├── chart_utils.py             # Chart generation with Plotly
├── translations.py            # Vietnamese translations
├── admin_panel.py             # Admin user management
├── requirements.txt           # Python dependencies
├── users.json                # User database (auto-generated)
├── .gitignore                # Git ignore rules
└── README.md                 # Documentation

test.py                       # Test file (header validation)
```

---

## 🔑 KEY FILES EXPLAINED

### **app.py** (Main Application)
**Purpose:** Streamlit web app - UI, routing, scan logic

**Key Functions:**
- `check_password()` - Login authentication
- `main()` - Main dashboard with header, sidebar, metrics
- `run_scan()` - Scan coins for patterns with CCXT
- `display_results()` - Show patterns with charts & trading plans

**Current Issues Fixed:**
- ✅ Header Gem Holding displaying correctly
- ✅ Timeframe mapping fixed ("15 phút" → "15m")
- ⚠️ KeyError 'type' in display_results - NEEDS FIX (see below)

### **config.py** (Configuration)
```python
TOP_COINS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', ...] # 20 coins

TIMEFRAMES = {
    "15 phút": "15m",
    "1 giờ": "1h",
    "4 giờ": "4h",
    "1 ngày": "1d"
}

USERS = {
    "admin": {"password": "admin123", "role": "admin"},
    "demo": {"password": "demo123", "role": "user"}
}

COMPANY_NAME = "Gem Holding"
COMPANY_LOGO = "💎"
WATERMARK_TEXT = "Gem Holding © 2025"
```

### **pattern_detector.py** (Pattern Detection)
**13 Patterns Supported:**
- Head & Shoulders, Inverse H&S
- Double Top/Bottom, Triple Top/Bottom
- Triangles (Ascending, Descending, Symmetrical)
- Wedges (Rising, Falling)
- Flag, Pennant

**Algorithm:**
1. Find local highs/lows
2. Compare with pattern templates
3. Calculate confidence score
4. Determine entry/SL/TP levels

### **chart_utils.py** (Chart Generation)
**Creates interactive Plotly candlestick charts with:**
- Pattern highlights
- Entry/SL/TP lines
- Volume bars
- Zoom/pan controls

**Current Issue:** 
```python
# Line 52: KeyError 'type'
symbol = 'triangle-up' if pattern['type'] == 'Bullish' else 'triangle-down'
```
**Fix:** Change to `pattern.get('signal', 'Neutral')`

### **translations.py** (Bilingual Support)
Maps English pattern names → Vietnamese:
```python
get_pattern_name_vi("Double Bottom") → "Đáy Đôi"
get_action_text("Bullish") → "🟢 MUA"
```

### **admin_panel.py** (User Management)
Admin features:
- Add new users
- Delete users
- Change passwords
- View user list

Access: Click "👨‍💼 Admin Panel" button (admin role only)

---

## 🐛 CURRENT ISSUES TO FIX

### **CRITICAL - KeyError in display_results()**

**Location:** `app.py`, function `display_results()`, line ~280

**Error:**
```python
chart_gen.create_pattern_chart(result['df'], result, result['coin'])
# Then in chart_utils.py line 52:
symbol = 'triangle-up' if pattern['type'] == 'Bullish' else 'triangle-down'
# KeyError: 'type'
```

**Root Cause:**
Pattern dict has key `'signal'` but code looks for `'type'`

**Fix Required:**
Add before calling `create_pattern_chart()`:
```python
if 'type' not in result:
    result['type'] = result.get('signal', 'Neutral')
```

---

## 🎨 UI IMPROVEMENT REQUESTS (Next Phase)

### **1. Icons - Replace Triangle with Action Icons**
**Current:** 🔺 🔻 (triangles)  
**Wanted:** 🟢 MUA (BUY) / 🔴 BÁN (SELL)

**Where:** 
- Pattern expander titles
- Action boxes
- Signal indicators

**Implementation:**
```python
# In display_results()
if result['signal'] == 'Bullish':
    icon = "🟢"
    action_text = "MUA"
else:
    icon = "🔴"
    action_text = "BÁN"

with st.expander(f"{icon} {action_text} {result['coin']} - {pattern_name}")
```

### **2. Bilingual Pattern Names**
**Current:** English only in some places  
**Wanted:** Vietnamese + English

**Format:** "Đáy Đôi (Double Bottom)"

**Files to update:**
- `app.py` - display_results()
- Already have `translations.py` ✅

### **3. Column Headers in Vietnamese**
**Current:** "Pattern", "Type", "Description" (English)  
**Wanted:** All Vietnamese

**Mapping:**
```python
"Pattern" → "Mẫu Hình"
"Type" → "Loại"
"Signal" → "Tín Hiệu"
"Confidence" → "Độ Tin Cậy"
"Action" → "Hành Động"
"Entry" → "Điểm Vào"
"Stop Loss" → "Cắt Lỗ"
"Take Profit" → "Chốt Lời"
```

### **4. Dashboard Styling**
**Current:** Basic, functional  
**Wanted:** Professional, sectioned, beautiful

**Requirements:**
- Clear sections with headers
- Gradient backgrounds
- Card-based layout
- Better spacing & alignment
- Responsive design

**Example Structure:**
```
┌─────────────────────────────────┐
│  💎 Gem Holding Header          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  📊 Thống Kê Dashboard          │
│  [Coins] [Timeframe] [Patterns] │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🔍 Kết Quả Scan                │
│  [Time] [Found Count]           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🎯 Chi Tiết Patterns           │
│  [Expandable Cards]             │
└─────────────────────────────────┘
```

### **5. Chart Zoom Improvements**
**Current Issues:**
- Hard to zoom precisely
- Pan not intuitive
- Small on mobile

**Solutions:**
- Increase chart height
- Better zoom controls
- Add reset button
- Mobile-optimized touch

**In chart_utils.py:**
```python
fig.update_layout(
    height=600,  # Increase from 400
    dragmode='zoom',
    hovermode='x unified'
)
```

---

## 🚀 NEXT TASKS (Priority Order)

### **IMMEDIATE (Today):**
1. ⚠️ Fix KeyError 'type' in display_results()
2. 🎨 Add 🟢 MUA / 🔴 BÁN icons
3. 🌐 Complete Vietnamese translations
4. 📊 Improve dashboard layout

### **THIS WEEK:**
1. Chart zoom improvements
2. Mobile responsive design
3. Error handling improvements
4. Performance optimization

### **NEXT WEEK:**
1. Alert system (Telegram/Email)
2. Backtesting functionality
3. More exchanges (Binance, Bybit)
4. Historical data analysis

---

## 💻 DEVELOPMENT WORKFLOW

### **Local Development:**
```bash
# Clone repo
git clone https://github.com/[username]/crypto-pattern-scanner
cd crypto-pattern-scanner

# Install dependencies
pip install -r requirements.txt

# Run locally
streamlit run app.py

# Access at http://localhost:8501
```

### **Testing:**
```bash
# Test specific features
streamlit run test.py

# Check pattern detection
python -c "from pattern_detector import PatternDetector; print('OK')"
```

### **Deployment:**
```bash
# Commit changes
git add .
git commit -m "Descriptive message"
git push origin main

# Streamlit Cloud auto-deploys in 2-3 minutes
# Check: https://crypto-pattern-scanner.streamlit.app/
```

---

## 🔐 CREDENTIALS & ACCESS

### **Git/GitHub:**
- Username: Jennie Chu
- Repo: crypto-pattern-scanner
- Branch: main

### **Streamlit Cloud:**
- Auto-deploy on push
- Logs: Click "Manage app" bottom right
- Secrets: Configure in Streamlit dashboard

### **Demo Accounts:**
- Admin: admin / admin123
- Demo: demo / demo123

---

## 📊 CODE QUALITY NOTES

### **Good Practices Already Implemented:**
- ✅ Modular structure (separate files)
- ✅ Type hints in some functions
- ✅ Error handling with try/except
- ✅ Comments in code
- ✅ Git version control

### **Areas for Improvement:**
- ⚠️ More comprehensive error handling
- ⚠️ Add unit tests (pytest)
- ⚠️ Logging instead of st.error everywhere
- ⚠️ Database instead of JSON for users
- ⚠️ Environment variables for secrets

---

## 🐛 KNOWN BUGS & QUIRKS

### **1. Timeframe Mapping**
**Status:** FIXED ✅  
**Was:** "15 phút" caused int() conversion error  
**Fix:** Added tf_mapping dict in run_scan()

### **2. KeyError 'type'**
**Status:** NEEDS FIX ⚠️  
**Location:** display_results() → chart_utils.py  
**Fix:** See section above

### **3. MATIC/USDT Missing**
**Status:** Known issue ℹ️  
**Cause:** OKX doesn't have MATIC/USDT pair  
**Solution:** Remove from TOP_COINS or switch exchange

### **4. Pattern Accuracy**
**Status:** Improving 📈  
**Current:** ~70-75% accuracy  
**Target:** 85%+  
**Solution:** ML model training (future)

---

## 📈 PERFORMANCE METRICS

### **Current:**
- Scan speed: 2-3 seconds per coin
- API rate limit: 100 requests/minute (OKX)
- Memory usage: ~200MB
- Load time: 3-5 seconds

### **Targets:**
- Scan speed: <1 second per coin
- Zero rate limit errors
- Memory: <150MB
- Load time: <2 seconds

---

## 🎓 LEARNING RESOURCES

### **Pattern Trading:**
- [Investopedia - Chart Patterns](https://www.investopedia.com/terms/c/chartpattern.asp)
- [Bulkowski's Pattern Site](http://thepatternsite.com/)

### **Technical:**
- [Streamlit Docs](https://docs.streamlit.io/)
- [CCXT Manual](https://docs.ccxt.com/)
- [Plotly Python](https://plotly.com/python/)

---

## 💡 DESIGN PHILOSOPHY

### **User Experience:**
1. **Simple First:** Easy to scan with 1 click
2. **Progressive Disclosure:** Details in expandable sections
3. **Visual Clarity:** Colors, icons, clear labels
4. **Actionable:** Clear trading plans, not just data

### **Code Philosophy:**
1. **Readable:** Code is read more than written
2. **Modular:** Separate concerns into files
3. **Fail-Safe:** Handle errors gracefully
4. **Fast:** Optimize for performance

---

## 🔧 ENVIRONMENT SETUP

### **Required Python Version:**
```bash
Python 3.11+
```

### **Key Dependencies:**
```txt
streamlit>=1.28.0
ccxt>=4.0.0
pandas>=2.0.0
plotly>=5.17.0
numpy>=1.24.0
```

### **Optional (for development):**
```txt
pytest>=7.4.0
black>=23.0.0
pylint>=2.17.0
```

---

## 🎯 SUCCESS CRITERIA

### **Phase 1 Complete When:**
- [x] Pattern detection working
- [x] User authentication
- [x] Charts rendering
- [x] Deployed on cloud
- [ ] All bugs fixed
- [ ] Professional UI
- [ ] Mobile responsive

### **Ready for Marketing When:**
- [ ] 85%+ pattern accuracy
- [ ] Zero critical bugs
- [ ] Fast performance
- [ ] Documentation complete
- [ ] Video demo ready

---

## 📝 IMPORTANT NOTES FOR CLAUDE CODE

### **When Making Changes:**
1. **Always test locally first** before pushing
2. **Use descriptive commit messages**
3. **Update this context file** if architecture changes
4. **Check Streamlit Cloud logs** after deploy
5. **Keep users.json in .gitignore** (don't commit passwords)

### **Code Style:**
- 4 spaces for indentation (NO TABS)
- Max line length: 100 characters
- Use type hints where possible
- Comment complex logic

### **Git Workflow:**
```bash
# Before starting work
git pull origin main

# Make changes
# ...

# Test locally
streamlit run app.py

# Commit
git add .
git commit -m "Fix: [description]"  # or "Feat:", "Docs:", etc.
git push origin main

# Wait for auto-deploy (2-3 min)
# Test on cloud
```

---

## 🚨 CRITICAL FILES - DO NOT DELETE

- `app.py` - Main application
- `config.py` - Core settings
- `pattern_detector.py` - Pattern algorithms
- `requirements.txt` - Dependencies
- `.gitignore` - Git configuration

---

## 📞 GETTING HELP

### **If Stuck:**
1. Check Streamlit Cloud logs (bottom right "Manage app")
2. Google error messages
3. Check CCXT documentation for API issues
4. Review this context file

### **Common Issues:**
- **App won't load:** Check requirements.txt, look at logs
- **Patterns not found:** Adjust sensitivity, try different timeframe
- **Chart errors:** Check data format, verify pattern dict keys
- **API errors:** Rate limiting, check internet, verify exchange

---

## 🎯 IMMEDIATE NEXT STEPS FOR CLAUDE CODE

1. **Read this entire context file** ✅
2. **Clone the repo locally**
3. **Fix the KeyError 'type' bug** (highest priority)
4. **Test the fix locally**
5. **Push to GitHub**
6. **Verify on cloud**
7. **Move to UI improvements**

---

**Last Updated:** October 23, 2025  
**Status:** Ready for Claude Code handoff  
**Phase:** 1 (90% complete)  
**Next Phase:** UI Polish & Bug Fixes

---

## ✅ HANDOFF CHECKLIST

- [x] Project context documented
- [x] Known issues listed
- [x] Next tasks prioritized
- [x] Code structure explained
- [x] Git workflow defined
- [x] Success criteria clear
- [ ] Claude Code has cloned repo
- [ ] Claude Code has fixed critical bug
- [ ] Claude Code has made first commit

**Ready to code! 🚀**
