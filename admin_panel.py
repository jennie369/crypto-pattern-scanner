"""
Admin Panel - Quản Lý Users
Gem Holding © 2025
"""

import streamlit as st
import json
from pathlib import Path
from datetime import datetime

USERS_FILE = "users.json"

def load_users():
    """Load users từ file"""
    if Path(USERS_FILE).exists():
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {
        "admin": {"password": "admin123", "role": "admin"},
        "demo": {"password": "demo123", "role": "user"}
    }

def save_users(users):
    """Lưu users"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def admin_panel():
    """Admin Panel UI"""
    st.title("👨‍💼 Admin Panel")
    
    users = load_users()
    
    tab1, tab2 = st.tabs(["📋 Users", "➕ Thêm User"])
    
    with tab1:
        st.subheader("Danh Sách Users")
        for username, data in users.items():
            with st.expander(f"👤 {username}"):
                st.write(f"Role: {data['role']}")
                new_pass = st.text_input("Password mới", type="password", key=username)
                if st.button("Đổi Password", key=f"ch_{username}"):
                    if new_pass:
                        users[username]["password"] = new_pass
                        save_users(users)
                        st.success("✅ Đã đổi!")
    
    with tab2:
        with st.form("add_user"):
            new_user = st.text_input("Username")
            new_pass = st.text_input("Password", type="password")
            new_role = st.selectbox("Role", ["user", "admin"])
            
            if st.form_submit_button("Thêm"):
                if new_user and new_pass:
                    users[new_user] = {"password": new_pass, "role": new_role}
                    save_users(users)
                    st.success(f"✅ Đã thêm {new_user}")