import streamlit as st
import ccxt
import pandas as pd
from datetime import datetime
import time
from pattern_detector import PatternDetector
from config import *

st.set_page_config(**PAGE_CONFIG)

def check_password():
    if 'authenticated' in st.session_state and st.session_state.authenticated:
        return True
    st.markdown("## 🔐 Login")
    with st.form("login_form"):
        username = st.text_input("Username:")
        password = st.text_input("Password:", type="password")
        submit = st.form_submit_button("🚀 Login")
        if submit:
            if username in USERS and USERS[username] == password:
                st.session_state.authenticated = True
                st.session_state.username = username
                st.success("✅ Success!")
                time.sleep(0.5)
                st.rerun()
            else:
                st.error("❌ Wrong!")
                return False
    with st.expander("🔑 Demo"):
        st.info("**demo** / **demo123**")
    return False

def main():
    with st.sidebar:
        st.title("🎯 Scanner")
        if 'username' in st.session_state:
            st.success(f"👤 {st.session_state.username}")
            if st.button("Logout"):
                st.session_state.authenticated = False
                st.rerun()
        st.markdown("---")
        scan_mode = st.radio("Mode:", ["Quick (Top 10)", "Custom"])
        if scan_mode == "Custom":
            selected_coins = st.multiselect("Coins:", TOP_COINS, default=TOP_COINS[:5])
        else:
            selected_coins = TOP_COINS[:10]
        timeframe = st.selectbox("Timeframe:", list(TIMEFRAMES.keys()))
        sensitivity = st.slider("Sensitivity:", 0.01, 0.05, 0.02, 0.01)
        scan_button = st.button("🔍 SCAN", type="primary")
    
    st.title("🚀 Pattern Scanner")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("📊 Coins", len(selected_coins))
    with col2:
        st.metric("⏰ TF", timeframe)
    with col3:
        st.metric("🎯 Patterns", "7")
    st.markdown("---")
    
    if scan_button:
        run_scan(selected_coins, TIMEFRAMES[timeframe], sensitivity)
    if 'scan_results' in st.session_state:
        display_results(st.session_state.scan_results)

def run_scan(coins, timeframe, sensitivity):
    st.subheader("🔄 Scanning...")
    progress = st.progress(0)
    status = st.empty()
    exchange = ccxt.binance({'enableRateLimit': True})
    detector = PatternDetector(sensitivity=sensitivity)
    results = []
    
    for idx, coin in enumerate(coins):
        try:
            status.text(f"📡 {coin} ({idx+1}/{len(coins)})")
            ohlcv = exchange.fetch_ohlcv(coin, timeframe, limit=200)
            df = pd.DataFrame(ohlcv, columns=['timestamp','open','high','low','close','volume'])
            patterns = detector.detect_all_patterns(df)
            
            if patterns:
                for p in patterns:
                    results.append({'Coin': coin, 'Pattern': p['pattern'], 'Type': p['type'], 'Confidence': f"{p['confidence']}%", 'Description': p['description'], 'Price': f"${df['close'].iloc[-1]:,.2f}"})
            progress.progress((idx+1)/len(coins))
            time.sleep(0.1)
        except Exception as e:
            st.warning(f"⚠️ {coin}: {str(e)}")
    
    status.text("✅ Done!")
    st.session_state.scan_results = {'data': results, 'timestamp': datetime.now().strftime('%H:%M:%S'), 'total': len(coins), 'found': len(results)}
    time.sleep(0.5)
    st.rerun()

def display_results(res):
    st.subheader("📊 Scan Results")
    col1, col2 = st.columns(2)
    with col1:
        st.info(f"⏰ {res['timestamp']}")
    with col2:
        st.success(f"✅ Found: {res['found']}")
    
    st.markdown("---")
    
    if res['data']:
        st.markdown("### 🎯 Pattern Details with Charts")
        
        # Import chart generator
        try:
            from chart_utils import ChartGenerator
            chart_gen = ChartGenerator()
            
            # Show first 5 patterns with charts
            import ccxt
            exchange = ccxt.binance({'enableRateLimit': True})
            
            shown = 0
            for result in res['data']:
                if shown >= 5:
                    break
                    
                try:
                    with st.expander(f"🎯 {result['Coin']} - {result['Pattern']}", expanded=(shown==0)):
                        col1, col2 = st.columns([2, 1])
                        
                        with col1:
                            # Fetch data
                            ohlcv = exchange.fetch_ohlcv(result['Coin'], '15m', limit=100)
                            df = pd.DataFrame(ohlcv, columns=['timestamp','open','high','low','close','volume'])
                            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
                            df['sma_20'] = df['close'].rolling(20).mean()
                            
                            pattern_info = {
                                'pattern': result['Pattern'],
                                'type': result['Type'],
                                'confidence': result['Confidence'].replace('%', '')
                            }
                            
                            # Create chart
                            fig, signals = chart_gen.create_pattern_chart(df, pattern_info, result['Coin'])
                            st.plotly_chart(fig, use_container_width=True)
                        
                        with col2:
                            # Trading card
                            card = chart_gen.create_trading_card(signals, pattern_info)
                            st.markdown(card)
                    
                    shown += 1
                    
                except Exception as e:
                    st.warning(f"Cannot load chart for {result['Coin']}: {str(e)}")
                    continue
        
        except Exception as e:
            st.error(f"Chart error: {str(e)}")
        
        # Full table
        st.markdown("---")
        st.markdown("### 📋 All Results")
        df_results = pd.DataFrame(res['data'])
        st.dataframe(df_results, use_container_width=True)
        
        csv = df_results.to_csv(index=False)
        st.download_button("📥 Download CSV", csv, "patterns.csv", "text/csv")
    else:
        st.warning("No patterns found!")
    
    if st.button("Clear"):
        del st.session_state.scan_results
        st.rerun()
if __name__ == "__main__":
    if check_password():
        main()
