"""
Crypto Pattern Scanner - Professional Version
Gem Holding © 2025
"""

import streamlit as st
import ccxt
import pandas as pd
from datetime import datetime
from config import TOP_COINS, TIMEFRAMES, USERS, PAGE_CONFIG, COMPANY_NAME, COMPANY_LOGO, WATERMARK_TEXT, ACTION_LABELS, SIGNAL_ICONS
from pattern_detector import PatternDetector
from chart_utils import ChartGenerator
from translations import get_pattern_name_vi, get_action_text
from admin_panel import admin_panel, load_users

# Page config
st.set_page_config(**PAGE_CONFIG)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 25px;
        border-radius: 12px;
        margin-bottom: 25px;
        text-align: center;
    }
    .metric-card {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }
    .watermark {
        position: fixed;
        bottom: 15px;
        right: 15px;
        opacity: 0.4;
        font-size: 11px;
    }
</style>
""", unsafe_allow_html=True)

def check_password():
    """Login form"""
    if 'authenticated' in st.session_state and st.session_state.authenticated:
        return True
    
    st.markdown("""
    <div class='main-header'>
        <h1 style='color: white;'>🔐 Login</h1>
        <p style='color: white;'>Crypto Pattern Scanner</p>
    </div>
    """, unsafe_allow_html=True)
    
    with st.form("login_form"):
        username = st.text_input("Username:")
        password = st.text_input("Password:", type="password")
        submit = st.form_submit_button("🚀 Login")
        
        if submit:
            users = load_users()
            if username in users and users[username]["password"] == password:
                st.session_state.authenticated = True
                st.session_state.username = username
                st.session_state.role = users[username].get("role", "user")
                st.success("✅ Success!")
                st.rerun()
            else:
                st.error("❌ Wrong!")
                return False
    
    with st.expander("🔑 Demo"):
        st.info("**demo** / **demo123**")
    
    return False

def main():
    """Main app"""
    
    if st.session_state.get('show_admin'):
        admin_panel()
        if st.button("🔙 Quay lại Scanner"):
            st.session_state.show_admin = False
            st.rerun()
        return
    
    st.markdown("""
    <div class='main-header'>
        <h1 style='color: white; font-size: 2.5em;'>💎 Gem Holding</h1>
        <p style='color: white; font-size: 1.1em;'>
            Crypto Pattern Scanner - Phát Hiện Mẫu Hình Tự Động
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("""
    <div class='watermark'>
        Gem Holding © 2025
    </div>
    """, unsafe_allow_html=True)
    
    with st.sidebar:
        st.markdown(f"""
        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 20px;'>
            <h3 style='color: white;'>🎯 Scanner</h3>
            <p style='color: white;'>👤 {st.session_state.username}</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.session_state.get('role') == 'admin':
            if st.button("👨‍💼 Admin Panel", use_container_width=True):
                st.session_state.show_admin = True
                st.rerun()
        
        if st.button("🚪 Logout", use_container_width=True):
            st.session_state.authenticated = False
            st.rerun()
        
        st.markdown("---")
        st.subheader("⚙️ Cài Đặt Scan")
        
        scan_mode = st.radio("Mode:", ["Quick (Top 10)", "Custom"])
        
        if scan_mode == "Custom":
            selected_coins = st.multiselect("Coins:", TOP_COINS, default=TOP_COINS[:5])
        else:
            selected_coins = TOP_COINS[:10]
        
        timeframe = st.selectbox("Timeframe:", list(TIMEFRAMES.keys()))
        sensitivity = st.slider("Sensitivity:", 0.01, 0.05, 0.02, 0.01)
        scan_button = st.button("🔍 SCAN", type="primary", use_container_width=True)
    
    st.markdown("### 📊 Thống Kê")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown(f"""
        <div class='metric-card'>
            <h2 style='color: #667eea;'>{len(selected_coins)}</h2>
            <p>📈 Coins</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class='metric-card'>
            <h2 style='color: #764ba2;'>⏰ TF</h2>
            <p>{timeframe}</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class='metric-card'>
            <h2 style='color: #667eea;'>7</h2>
            <p>🎯 Patterns</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    if scan_button:
        st.markdown("### 📊 Scan Results")
        col1, col2 = st.columns(2)
        with col1:
            st.info(f"🕐 {datetime.now().strftime('%H:%M:%S')}")
        with col2:
            st.success("✅ Found: 0")
        
        st.markdown("---")
        results = run_scan(selected_coins, timeframe, sensitivity)
        
        if results:
            display_results(results)
        else:
            st.warning("⚠️ No patterns found!")

def run_scan(coins, timeframe, sensitivity):
    """Run pattern scan"""
    st.subheader("🔄 Scanning...")
    progress = st.progress(0)
    status = st.empty()
    
    tf_mapping = {
        "15 phút": "15m",
        "1 giờ": "1h",
        "4 giờ": "4h",
        "1 ngày": "1d"
    }
    actual_tf = tf_mapping.get(timeframe, "15m")
    
    try:
        exchange = ccxt.okx({'enableRateLimit': True})
    except Exception as e:
        st.error(f"❌ Exchange error: {e}")
        return []
    
    detector = PatternDetector(sensitivity=sensitivity)
    results = []
    
    for idx, coin in enumerate(coins):
        try:
            status.text(f"🔍 {coin} ({idx+1}/{len(coins)})")
            ohlcv = exchange.fetch_ohlcv(coin, actual_tf, limit=200)
            
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            
            patterns = detector.detect_all_patterns(df)
            
            if patterns:
                for p in patterns:
                    results.append({
                        'coin': coin,
                        'pattern': p.get('pattern', 'Unknown'),
                        'signal': p.get('type', 'Neutral'),
                        'confidence': p.get('confidence', 0),
                        'entry': p.get('entry', 0),
                        'stop_loss': p.get('stop_loss', 0),
                        'take_profits': p.get('take_profits', []),
                        'df': df
                    })
            
            progress.progress((idx + 1) / len(coins))
            
        except Exception as e:
            st.error(f"❌ {coin}: {str(e)}")
    
    status.text(f"✅ Done! Found {len(results)} patterns")
    progress.progress(1.0)
    return results

def display_results(results):
    """Display scan results"""
    st.markdown("---")
    st.markdown("### 🎯 Pattern Details with Charts")
    
    for result in results:
        if 'type' not in result:
            result['type'] = result.get('signal', 'Neutral')
        
        pattern_name = get_pattern_name_vi(result['pattern'])
        action_text = get_action_text(result['signal'])
        action_color = '#26a69a' if result['signal'] == 'Bullish' else '#ef5350'
        
        with st.expander(f"{action_text} {result['coin']} - {pattern_name}", expanded=False):
            col1, col2 = st.columns([2, 1])
            
            with col1:
                # Chart - FIX: capture signals and pass correct dict structure
                chart_gen = ChartGenerator()
                fig, signals = chart_gen.create_pattern_chart(
                    result['df'],
                    {
                        'pattern': result['pattern'],
                        'type': result['type'],
                        'confidence': result['confidence']
                    },
                    result['coin']
                )
                st.plotly_chart(fig, use_container_width=True)

            with col2:
                st.markdown(f"""
                <div style='background: rgba(102, 126, 234, 0.15);
                            padding: 20px; border-radius: 12px;
                            border-left: 4px solid {action_color};'>
                    <h3 style='color: {action_color};'>📋 KẾ HOẠCH</h3>
                    <p><strong>Mẫu Hình:</strong> {pattern_name}</p>
                    <p><strong>Tín Hiệu:</strong> {action_text}</p>
                    <p><strong>Độ Tin Cậy:</strong> {result['confidence']:.0%}</p>
                </div>
                """, unsafe_allow_html=True)

                # FIX: Use calculated signals instead of placeholder zeros
                entry_price = signals['entry']['price']
                stop_loss = signals['stop_loss']
                take_profits = signals['take_profit']

                st.metric("🎯 Entry", f"${entry_price:,.2f}")
                st.metric("🛑 Stop Loss", f"${stop_loss:,.2f}")

                for i, tp in enumerate(take_profits[:3], 1):
                    st.metric(f"💰 TP{i}", f"${tp:,.2f}")

if __name__ == "__main__":
    if check_password():
        main()
