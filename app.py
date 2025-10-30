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
    /* Main header styling */
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 25px;
        border-radius: 12px;
        margin-bottom: 25px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    /* Metric cards */
    .metric-card {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        padding: 20px;
        border-radius: 10px;
        border: 1px solid rgba(102, 126, 234, 0.3);
        text-align: center;
    }
    
    /* Button styling */
    .stButton > button {
        width: 100%;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }
    
    /* Expander header */
    .streamlit-expanderHeader {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-weight: 600;
        padding: 12px;
    }
    
    /* Trading plan box */
    .trading-plan {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
        padding: 20px;
        border-radius: 12px;
        border-left: 4px solid #667eea;
        margin: 15px 0;
    }
    
    /* Action box */
    .action-box {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 10px;
        border-left: 4px solid;
        margin: 10px 0;
    }
    
    .action-buy {
        border-left-color: #26a69a;
    }
    
    .action-sell {
        border-left-color: #ef5350;
    }
    
    /* Watermark */
    .watermark {
        position: fixed;
        bottom: 15px;
        right: 15px;
        opacity: 0.4;
        font-size: 11px;
        color: #888;
        background: rgba(0,0,0,0.5);
        padding: 5px 10px;
        border-radius: 5px;
    }
    
    /* Section divider */
    .section-divider {
        margin: 30px 0;
        border-top: 2px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Sidebar styling */
    .css-1d391kg {
        background: linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }
</style>
""", unsafe_allow_html=True)

def check_password():
    """Login form"""
    if 'authenticated' in st.session_state and st.session_state.authenticated:
        return True
    
    st.markdown("""
    <div class='main-header'>
        <h1 style='color: white; margin: 0;'>🔐 Login</h1>
        <p style='color: white; margin: 0; opacity: 0.9;'>Crypto Pattern Scanner</p>
    </div>
    """, unsafe_allow_html=True)
    
    with st.form("login_form"):
        username = st.text_input("Username:")
        password = st.text_input("Password:", type="password")
        submit = st.form_submit_button("🚀 Login")
        
        if submit:
            # Load users from file or use default
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
    st.markdown("""
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;'>
        <h1 style='color: white; margin: 0; font-size: 2.5em;'>💎 Gem Holding</h1>
        <p style='color: white; margin: 5px 0 0 0; font-size: 1.1em;'>
            Crypto Pattern Scanner - Phát Hiện Mẫu Hình Tự Động
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("""
    <div style='position: fixed; bottom: 15px; right: 15px; opacity: 0.4; 
                font-size: 11px; background: rgba(0,0,0,0.5); 
                padding: 5px 10px; border-radius: 5px;'>
        Gem Holding © 2025
    </div>
    """, unsafe_allow_html=True)
    
    # Code cũ tiếp tục...
    """Main app"""
    
    # Check for admin panel
    if st.session_state.get('show_admin'):
        admin_panel()
        if st.button("🔙 Quay lại Scanner"):
            st.session_state.show_admin = False
            st.rerun()
        return
    
    # Header với branding
    st.markdown(f"""
    <div class='main-header'>
        <h1 style='color: white; margin: 0; font-size: 2.5em;'>{COMPANY_LOGO} {COMPANY_NAME}</h1>
        <p style='color: white; margin: 5px 0 0 0; font-size: 1.1em; opacity: 0.95;'>
            Crypto Pattern Scanner - Phát hiện mẫu hình tự động
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Watermark
    st.markdown(f"""
    <div class='watermark'>
        {WATERMARK_TEXT}
    </div>
    """, unsafe_allow_html=True)
    
    # Sidebar
    with st.sidebar:
        st.markdown(f"""
        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 20px;'>
            <h3 style='color: white; margin: 0;'>🎯 Scanner</h3>
            <p style='color: white; margin: 5px 0 0 0; opacity: 0.9;'>👤 {st.session_state.username}</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Admin Panel button
        if st.session_state.get('role') == 'admin':
            if st.button("👨‍💼 Admin Panel", use_container_width=True):
                st.session_state.show_admin = True
                st.rerun()
        
        if st.button("🚪 Logout", use_container_width=True):
            st.session_state.authenticated = False
            st.rerun()
        
        st.markdown("---")
        
        # Scan settings
        st.subheader("⚙️ Cài Đặt Scan")
        
        scan_mode = st.radio("Mode:", ["Quick (Top 10)", "Custom"])
        
        if scan_mode == "Custom":
            selected_coins = st.multiselect("Coins:", TOP_COINS, default=TOP_COINS[:5])
        else:
            selected_coins = TOP_COINS[:10]
        
        timeframe = st.selectbox("Timeframe:", list(TIMEFRAMES.keys()))
        sensitivity = st.slider("Sensitivity:", 0.01, 0.05, 0.02, 0.01)
        
        scan_button = st.button("🔍 SCAN", type="primary", use_container_width=True)
    
    # Main content
    st.markdown("### 📊 Thống Kê")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown(f"""
        <div class='metric-card'>
            <h2 style='margin: 0; color: #667eea;'>{len(selected_coins)}</h2>
            <p style='margin: 5px 0 0 0;'>📈 Coins</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class='metric-card'>
            <h2 style='margin: 0; color: #764ba2;'>⏰ TF</h2>
            <p style='margin: 5px 0 0 0;'>{timeframe}</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class='metric-card'>
            <h2 style='margin: 0; color: #667eea;'>7</h2>
            <p style='margin: 5px 0 0 0;'>🎯 Patterns</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)
    
    # Scan results
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
            st.info("💡 Tip: Thử tăng sensitivity hoặc đổi timeframe")

def run_scan(coins, timeframe, sensitivity):
    """Run pattern scan with proper timeframe mapping"""
    st.subheader("🔄 Scanning...")
    progress = st.progress(0)
    status = st.empty()
    
    # TIMEFRAME MAPPING
    tf_mapping = {
        "15 phút": "15m",
        "1 giờ": "1h",
        "4 giờ": "4h",
        "1 ngày": "1d"
    }
    
    # Convert to actual timeframe
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
            
            # Use actual_tf instead of timeframe
            ohlcv = exchange.fetch_ohlcv(coin, actual_tf, limit=200)
            st.info(f"✅ {coin}: Fetched {len(ohlcv)} candles")
            
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            
            patterns = detector.detect_all_patterns(df)
            
            if patterns:
                for p in patterns:
                    results.append({
                        'coin': coin,
                        'pattern': p['pattern'],
                        'signal': p['type'],
                        'confidence': p['confidence'],
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
    """Display scan results với UI đẹp"""
    
    st.markdown("---")
    st.markdown("### 🎯 Pattern Details with Charts")
    
    for result in results:
        # Get Vietnamese names
        pattern_name = get_pattern_name_vi(result['pattern'])
        action_text = get_action_text(result['signal'])
        
        # Icon based on signal
        if result['signal'] == 'Bullish':
            action_class = 'action-buy'
            action_color = '#26a69a'
        else:
            action_class = 'action-sell'
            action_color = '#ef5350'
        
        with st.expander(f"{action_text} {result['coin']} - {pattern_name}", expanded=False):
            col1, col2 = st.columns([2, 1])
            
            with col1:
                # Chart
                chart_gen = ChartGenerator()
                fig = chart_gen.create_pattern_chart(
                    result['df'],
                    {
                        'pattern': result['pattern'],
                        'entry': result['entry'],
                        'stop_loss': result['stop_loss'],
                        'take_profits': result['take_profits']
                    },
                    result['coin']
                )
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                # Trading Plan
                st.markdown(f"""
                <div class='trading-plan'>
                    <h3 style='margin: 0 0 15px 0; color: {action_color};'>📋 TRADING PLAN</h3>
                    <p><strong>Mẫu Hình:</strong> {pattern_name}</p>
                    <p><strong>Xu Hướng:</strong> {get_action_text(result['signal'])}</p>
                    <p><strong>Độ Tin Cậy:</strong> {result['confidence']:.0%}</p>
                </div>
                """, unsafe_allow_html=True)
                
                st.markdown(f"### 🎯 Entry")
                st.metric("Vào Lệnh", f"${result['entry']:,.2f}")
                
                st.markdown(f"### 🛑 Stop Loss")
                st.metric("Cắt Lỗ", f"${result['stop_loss']:,.2f}", 
                         delta=f"-${abs(result['entry'] - result['stop_loss']):,.2f}")
                
                risk_percent = abs((result['entry'] - result['stop_loss']) / result['entry'] * 100)
                st.metric("Rủi Ro", f"{risk_percent:.2f}%")
                
                st.markdown("### 💰 Take Profit")
                for i, tp in enumerate(result.get('take_profits', [])[:3], 1):
                    st.metric(f"TP{i}", f"${tp:,.2f}", 
                             delta=f"+${abs(tp - result['entry']):,.2f}")
                
                # R/R ratio
                if result.get('take_profits'):
                    avg_tp = sum(result['take_profits'][:3]) / len(result['take_profits'][:3])
                    reward = abs(avg_tp - result['entry'])
                    risk = abs(result['entry'] - result['stop_loss'])
                    rr_ratio = reward / risk if risk > 0 else 0
                    st.metric("R/R Ratio", f"1:{rr_ratio:.1f}")
                
                # Action
                st.markdown(f"""
                <div class='action-box {action_class}'>
                    <h3 style='margin: 0; color: {action_color};'>📢 ACTION</h3>
                    <h2 style='margin: 10px 0;'>{action_text}</h2>
                    <ol style='margin: 10px 0; padding-left: 20px;'>
                        <li>Entry at ${result['entry']:,.2f}</li>
                        <li>Set SL at ${result['stop_loss']:,.2f}</li>
                        <li>Close 50% at TP1</li>
                        <li>Trail remaining</li>
                    </ol>
                </div>
                """, unsafe_allow_html=True)

# Main execution
if __name__ == "__main__":
    if check_password():
        main()
