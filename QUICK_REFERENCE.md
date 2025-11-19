# ⚡ QUICK REFERENCE - CRYPTO PATTERN SCANNER

## 🎯 IMMEDIATE ACTION ITEMS

```bash
# 1. Clone repo
git clone https://github.com/[username]/crypto-pattern-scanner
cd crypto-pattern-scanner

# 2. Install
pip install -r requirements.txt

# 3. Run
streamlit run app.py

# 4. Test
# Login: demo / demo123
# Click SCAN button
# Note KeyError

# 5. Fix bug in app.py display_results():
# Add: if 'type' not in result: result['type'] = result['signal']

# 6. Test again
streamlit run app.py

# 7. Deploy
git add .
git commit -m "Fix: KeyError 'type' in display_results"
git push origin main
```

---

## 📁 FILE MAP

```
app.py              # Main app - FIX HERE ⚠️
├── check_password()      # Login
├── main()                # Dashboard
├── run_scan()            # Scan logic (FIXED ✅)
└── display_results()     # Display - NEEDS FIX ⚠️

config.py           # Settings - OK ✅
pattern_detector.py # Algorithms - OK ✅
chart_utils.py      # Charts - Will work after fix ✅
translations.py     # Vietnamese - OK ✅
admin_panel.py      # Admin - OK ✅
```

---

## 🐛 THE BUG

**Location:** `app.py`, `display_results()`, line ~280

**Error:**
```python
chart_gen.create_pattern_chart(result['df'], result, result['coin'])
# Then chart_utils.py uses: pattern['type']
# But result dict has: 'signal' key, not 'type'
# KeyError!
```

**Fix:**
```python
def display_results(results):
    for result in results:
        # ADD THIS LINE:
        if 'type' not in result:
            result['type'] = result['signal']
        
        # Rest of code...
```

---

## 🎨 UI TASKS (After Bug Fix)

### 1. Icons 🟢🔴
```python
# In display_results():
icon = "🟢" if result['signal'] == 'Bullish' else "🔴"
action = "MUA" if result['signal'] == 'Bullish' else "BÁN"
```

### 2. Bilingual Names
```python
# Format: "Đáy Đôi (Double Bottom)"
pattern_name = f"{vietnamese_name} ({english_name})"
```

### 3. Vietnamese Headers
```python
"Pattern" → "Mẫu Hình"
"Signal" → "Tín Hiệu"
"Entry" → "Điểm Vào"
"Stop Loss" → "Cắt Lỗ"
```

### 4. Chart Zoom
```python
# In chart_utils.py:
fig.update_layout(height=650, dragmode='zoom')
```

---

## 🔄 GIT WORKFLOW

```bash
# Pull latest
git pull origin main

# Make changes
# ...

# Test
streamlit run app.py

# Commit
git add .
git commit -m "Fix: descriptive message"

# Push (auto-deploys)
git push origin main

# Wait 2-3 min, test on cloud
```

---

## 🧪 TEST COMMANDS

```bash
# Run app
streamlit run app.py

# Test pattern detector
python -c "from pattern_detector import PatternDetector; print('OK')"

# Check imports
python -c "import streamlit; import ccxt; import plotly; print('OK')"

# Check syntax
python -m py_compile app.py
```

---

## 🔐 CREDENTIALS

```
Demo User: demo / demo123
Admin: admin / admin123
URL: https://crypto-pattern-scanner.streamlit.app/
```

---

## 🎯 PRIORITY ORDER

1. ⚠️ Fix KeyError 'type' (CRITICAL)
2. 🟢 Add BUY/SELL icons
3. 🌐 Vietnamese labels
4. 🎨 Dashboard styling
5. 📊 Chart zoom

---

## 📊 SUCCESS CHECKLIST

- [ ] App runs no errors
- [ ] Patterns display with charts
- [ ] Icons show correctly
- [ ] Text in Vietnamese
- [ ] Charts zoomable
- [ ] Mobile works
- [ ] Fast (<3s scan)

---

## 🆘 IF STUCK

```bash
# Check logs
# Streamlit Cloud → "Manage app" → View logs

# Common issues:
# - Missing package → Update requirements.txt
# - Syntax error → python -m py_compile file.py
# - Import error → Check file names
```

---

## 💡 KEY FILES TO EDIT

1. **app.py** (main work here)
   - Fix display_results()
   - Update icons
   - Add Vietnamese labels

2. **translations.py** (add bilingual)
   - Add get_pattern_name_bilingual()

3. **chart_utils.py** (zoom)
   - Update fig.layout height=650

4. **config.py** (if needed)
   - Already good ✅

---

## 🚀 DEPLOY CHECKLIST

Before pushing:
- [ ] Tested locally
- [ ] No errors
- [ ] Features work
- [ ] Code formatted
- [ ] Commit message clear

After pushing:
- [ ] Wait 2-3 minutes
- [ ] Check Streamlit Cloud
- [ ] Test on live URL
- [ ] Verify changes deployed

---

## 📝 COMMIT MESSAGE FORMAT

```
Fix: [bug description]
Feat: [new feature]
Style: [UI improvement]
Docs: [documentation]
Refactor: [code restructure]
```

---

## ⚡ SPEED RUN (30 MIN)

```bash
# Minute 0-5: Setup
git clone [repo]
pip install -r requirements.txt

# Minute 5-10: Understand bug
streamlit run app.py
# Click SCAN, see error

# Minute 10-15: Fix
# Edit app.py display_results()
# Add: if 'type' not in result: result['type'] = result['signal']

# Minute 15-20: Test
streamlit run app.py
# Verify charts show

# Minute 20-25: Commit
git add app.py
git commit -m "Fix: KeyError 'type' in display_results"
git push

# Minute 25-30: Verify deploy
# Open cloud URL
# Test SCAN
# DONE! ✅
```

---

## 🎓 LEARN AS YOU GO

**Streamlit:**
- `st.session_state` → Store data across reruns
- `st.expander` → Collapsible sections
- `st.markdown(unsafe_allow_html=True)` → Custom HTML

**CCXT:**
- `exchange.fetch_ohlcv()` → Get price data
- Returns: `[[timestamp, O, H, L, C, V], ...]`

**Plotly:**
- `fig = go.Figure()` → Create chart
- `fig.add_trace()` → Add data
- `fig.update_layout()` → Style it

---

**READY? GO! 🚀**

**Expected time: 30 min to fix bug, 2-3 hours for UI polish.**

**You've got all the info you need. Trust the context files!**
