# 🤖 CLAUDE CODE PROMPT - CRYPTO PATTERN SCANNER

## 👋 INTRODUCTION

Hi Claude Code! You're taking over the Crypto Pattern Scanner project from Claude Chat. This is a Streamlit web application that detects cryptocurrency chart patterns in real-time and generates trading plans.

**Your role:** Complete Phase 1 (bug fixes + UI polish) and prepare for Phase 2 (advanced features).

---

## 📋 CONTEXT FILES TO READ FIRST

**CRITICAL - Read these in order:**

1. **CLAUDE_CODE_CONTEXT.md** (this file) - Complete project overview
2. **PROJECT_SUMMARY.md** - High-level summary
3. **ROADMAP_AND_NEXT_STEPS.md** - Future plans
4. **FIX_HEADER_GUIDE.md** - Recent fixes applied

All files are in your project root directory.

---

## 🎯 YOUR IMMEDIATE MISSION

### **PRIORITY 1: Fix Critical Bug** ⚠️

**Bug:** KeyError 'type' in display_results()

**Location:** 
- `app.py`, function `display_results()` around line 280
- Called from `chart_utils.py` line 52

**The Issue:**
```python
# In app.py - display_results():
chart_gen.create_pattern_chart(result['df'], result, result['coin'])

# Then in chart_utils.py line 52:
symbol = 'triangle-up' if pattern['type'] == 'Bullish' else 'triangle-down'
# ❌ KeyError: 'type' - because dict has 'signal' key, not 'type'
```

**Your Task:**
1. Open `app.py`
2. Find `display_results()` function
3. Add this fix BEFORE calling `create_pattern_chart()`:

```python
def display_results(results):
    st.markdown("---")
    st.markdown("### 🎯 Pattern Details with Charts")
    
    for result in results:
        # FIX: Ensure 'type' key exists for chart_utils
        if 'type' not in result:
            result['type'] = result.get('signal', 'Neutral')
        
        # Rest of code continues...
        pattern_name = get_pattern_name_vi(result['pattern'])
        action_text = get_action_text(result['signal'])
```

4. Test locally: `streamlit run app.py`
5. Verify pattern charts display without error
6. Commit: `git commit -m "Fix: KeyError 'type' in display_results"`
7. Push: `git push origin main`

---

### **PRIORITY 2: UI Improvements** 🎨

Once bug is fixed, implement these in order:

#### **A. Replace Triangle Icons with Action Icons**

**Current:** 🔺 🔻  
**Target:** 🟢 MUA (BUY) / 🔴 BÁN (SELL)

**Implementation:**
```python
# In display_results(), before st.expander:
if result['signal'] == 'Bullish':
    action_icon = "🟢"
    action_text = "MUA"
    action_color = "#26a69a"
else:
    action_icon = "🔴"
    action_text = "BÁN"
    action_color = "#ef5350"

# Then in expander:
with st.expander(f"{action_icon} {action_text} {result['coin']} - {pattern_name}", expanded=False):
```

#### **B. Bilingual Pattern Names**

**Target Format:** "Đáy Đôi (Double Bottom)"

**Implementation:**
```python
# Update translations.py - add English names
PATTERN_NAMES_BILINGUAL = {
    "Double Bottom": "Đáy Đôi (Double Bottom)",
    "Double Top": "Đỉnh Đôi (Double Top)",
    "Head and Shoulders": "Đầu Vai (Head and Shoulders)",
    # ... add all patterns
}

# Use in display_results():
pattern_name = get_pattern_name_bilingual(result['pattern'])
```

#### **C. Vietnamese Column Headers**

**Update all labels in display_results():**
```python
st.markdown("### 🎯 Chi Tiết Patterns")  # Pattern Details

# In trading plan box:
"<p><strong>Mẫu Hình:</strong> {pattern_name}</p>"  # Pattern
"<p><strong>Tín Hiệu:</strong> {action_text}</p>"  # Signal
"<p><strong>Độ Tin Cậy:</strong> {confidence}</p>"  # Confidence

st.markdown("### 🎯 Điểm Vào")  # Entry Point
st.markdown("### 🛑 Cắt Lỗ")  # Stop Loss
st.markdown("### 💰 Chốt Lời")  # Take Profit
```

#### **D. Dashboard Styling**

**Improve metrics cards section:**
```python
# In main(), update metrics:
st.markdown("### 📊 Bảng Điều Khiển")  # Dashboard

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown(f"""
    <div style='background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
                padding: 25px; border-radius: 12px; text-align: center;
                border: 1px solid rgba(102, 126, 234, 0.3);
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
        <h2 style='margin: 0; color: #667eea; font-size: 2.5em;'>{len(selected_coins)}</h2>
        <p style='margin: 10px 0 0 0; color: #666; font-weight: 600;'>📈 Coins</p>
    </div>
    """, unsafe_allow_html=True)

# Repeat for col2, col3 with different gradients
```

#### **E. Chart Zoom Improvements**

**In chart_utils.py, update layout:**
```python
fig.update_layout(
    height=650,  # Increase from 400
    dragmode='zoom',
    hovermode='x unified',
    xaxis=dict(
        rangeslider=dict(visible=False),
        type='date'
    ),
    yaxis=dict(
        fixedrange=False  # Allow vertical zoom
    )
)

# Add modebar buttons
config = {
    'displayModeBar': True,
    'displaylogo': False,
    'modeBarButtonsToAdd': ['drawline', 'drawopenpath', 'eraseshape'],
    'modeBarButtonsToRemove': ['lasso2d']
}

# In display_results:
st.plotly_chart(fig, use_container_width=True, config=config)
```

---

## 🔄 WORKFLOW

### **Your Standard Process:**

```bash
# 1. Start fresh
git pull origin main

# 2. Make changes to files
# Edit app.py, chart_utils.py, etc.

# 3. Test locally
streamlit run app.py
# Login with: demo / demo123
# Click SCAN
# Verify changes work

# 4. Commit with clear message
git add .
git commit -m "Feat: Add BUY/SELL icons to pattern display"

# 5. Push to deploy
git push origin main

# 6. Wait 2-3 minutes for auto-deploy

# 7. Test on cloud
# Open: https://crypto-pattern-scanner.streamlit.app/
# Verify changes deployed correctly

# 8. Move to next task
```

---

## 📝 CODE STYLE RULES

### **Python Style:**
```python
# Use 4 spaces (not tabs)
# Max line length: 100 chars
# Type hints where possible

def my_function(param: str, value: int = 0) -> dict:
    """Clear docstring explaining function."""
    result = {}
    # Implementation...
    return result
```

### **Streamlit Style:**
```python
# Group related UI elements
with st.container():
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Label", "Value")
    with col2:
        st.metric("Label", "Value")

# Use markdown for custom HTML
st.markdown("""
<div style='...'>
    Content
</div>
""", unsafe_allow_html=True)
```

### **Git Commit Messages:**
```
Fix: [description]      # Bug fixes
Feat: [description]     # New features
Docs: [description]     # Documentation
Style: [description]    # Formatting, no code change
Refactor: [description] # Code restructure
Test: [description]     # Adding tests
```

---

## ⚠️ CRITICAL RULES

### **NEVER DO:**
1. ❌ Delete `users.json` from repo (contains passwords)
2. ❌ Hardcode API keys or secrets
3. ❌ Push directly without testing locally
4. ❌ Mix tabs and spaces
5. ❌ Change file structure without updating imports

### **ALWAYS DO:**
1. ✅ Test locally before pushing
2. ✅ Check Streamlit logs after deploy
3. ✅ Use descriptive variable names
4. ✅ Add comments for complex logic
5. ✅ Handle exceptions gracefully

---

## 🐛 DEBUGGING TIPS

### **If App Won't Start:**
```bash
# Check requirements
pip install -r requirements.txt

# Check syntax
python -m py_compile app.py

# Check imports
python -c "import streamlit; import ccxt; print('OK')"
```

### **If Streamlit Cloud Deploy Fails:**
1. Click "Manage app" (bottom right of app)
2. View logs
3. Look for error messages
4. Common issues:
   - Missing package in requirements.txt
   - Syntax error in Python file
   - Import error

### **If Patterns Not Detected:**
1. Check exchange connection (OKX API)
2. Verify timeframe mapping
3. Adjust sensitivity slider
4. Try different coins

---

## 📊 TESTING CHECKLIST

Before each commit, verify:

### **Functionality:**
- [ ] App starts without errors
- [ ] Login works (demo/demo123)
- [ ] Scan button works
- [ ] Patterns are detected
- [ ] Charts display correctly
- [ ] Trading plans show proper values
- [ ] Admin panel accessible (admin/admin123)
- [ ] Logout works

### **UI/UX:**
- [ ] Header displays "💎 Gem Holding"
- [ ] Icons show correctly (🟢/🔴)
- [ ] Vietnamese text displays properly
- [ ] Charts are readable and zoomable
- [ ] Mobile view looks good (resize browser)
- [ ] No console errors (F12 developer tools)

### **Performance:**
- [ ] Scan completes in <30 seconds
- [ ] No memory leaks (refresh works)
- [ ] Charts render smoothly
- [ ] No 429 rate limit errors

---

## 🎯 SUCCESS METRICS

### **You'll Know You're Done When:**

**Phase 1 Complete:**
- [ ] Zero errors in logs
- [ ] All patterns display with charts
- [ ] UI looks professional
- [ ] Vietnamese translations complete
- [ ] Mobile responsive
- [ ] Fast performance (<3s scans)

**Ready for Phase 2:**
- [ ] User feedback is positive
- [ ] Pattern accuracy >75%
- [ ] Deployment is stable
- [ ] Documentation updated

---

## 📚 HELPFUL RESOURCES

### **Streamlit:**
- Docs: https://docs.streamlit.io/
- API Reference: https://docs.streamlit.io/library/api-reference
- Gallery: https://streamlit.io/gallery

### **Plotly:**
- Python Docs: https://plotly.com/python/
- Candlestick Charts: https://plotly.com/python/candlestick-charts/
- Layout: https://plotly.com/python/reference/layout/

### **CCXT:**
- Docs: https://docs.ccxt.com/
- OKX API: https://www.okx.com/docs-v5/en/

---

## 💬 COMMUNICATION

### **Commit Messages - Be Descriptive:**

❌ Bad:
```
git commit -m "fix"
git commit -m "update app"
```

✅ Good:
```
git commit -m "Fix: KeyError 'type' in display_results when showing charts"
git commit -m "Feat: Add BUY/SELL icons to replace triangle symbols"
git commit -m "Style: Improve dashboard card gradients and spacing"
```

---

## 🚀 YOUR FIRST TASKS

### **Right Now (Next 30 Minutes):**

1. **Read this prompt** ✅
2. **Read CLAUDE_CODE_CONTEXT.md** 
3. **Clone the repo:**
   ```bash
   git clone https://github.com/[username]/crypto-pattern-scanner
   cd crypto-pattern-scanner
   ```
4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
5. **Run locally:**
   ```bash
   streamlit run app.py
   ```
6. **Test current state:**
   - Login: demo/demo123
   - Click SCAN
   - Note the KeyError
7. **Fix the bug** (see Priority 1 above)
8. **Test fix locally**
9. **Commit and push**
10. **Verify on cloud**

### **Today (Next 2-3 Hours):**

1. ✅ Critical bug fixed
2. 🟢 BUY/SELL icons added
3. 🌐 Vietnamese headers updated
4. 🎨 Dashboard styling improved
5. 📊 Chart zoom enhanced

### **This Week:**

- All Priority 2 tasks complete
- Mobile responsive
- Performance optimized
- Documentation updated
- Ready for user testing

---

## 🎓 LEARNING NOTES

### **Key Concepts:**

**Streamlit Session State:**
```python
# Stores data across reruns
st.session_state.username = "admin"
st.session_state.authenticated = True

# Access anywhere
if st.session_state.authenticated:
    # Show app
```

**CCXT Exchange:**
```python
# Fetch OHLCV data
exchange = ccxt.okx()
ohlcv = exchange.fetch_ohlcv('BTC/USDT', '15m', limit=200)
# Returns: [[timestamp, open, high, low, close, volume], ...]
```

**Pattern Detection:**
```python
# Finds local highs/lows
# Compares to pattern templates
# Returns: [{'pattern': 'Double Bottom', 'type': 'Bullish', ...}]
```

---

## ✅ FINAL CHECKLIST

Before considering Phase 1 complete:

- [ ] All files in repo
- [ ] No errors in Streamlit logs
- [ ] All features working
- [ ] UI polished and professional
- [ ] Vietnamese translations complete
- [ ] Mobile responsive
- [ ] Fast performance
- [ ] Documentation updated
- [ ] Git history clean
- [ ] Ready to show users

---

## 🎯 YOUR MISSION SUMMARY

**Fix the KeyError bug, polish the UI, make it production-ready.**

**Expected Time:** 3-4 hours  
**Difficulty:** Medium  
**Impact:** High (blocks user testing)

**You've got this! 🚀**

---

**Questions to ask yourself:**
1. Does the app run without errors? ✅
2. Do patterns display with charts? ✅
3. Is the UI professional and clean? ✅
4. Are all texts in Vietnamese? ✅
5. Is it fast and responsive? ✅

If all ✅, you're done with Phase 1!

---

**Last Updated:** October 23, 2025  
**Status:** Ready for Claude Code  
**Next:** Fix bug → Polish UI → Test → Deploy  

**Good luck! 💎**
