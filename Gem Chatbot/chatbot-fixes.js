/**
 * YINYANG CHATBOT - QUICK FIXES
 *
 * File này chứa tất cả các sửa đổi:
 * 1. Modal đăng nhập admin
 * 2. Inline forms (không popup)
 * 3. Nút "Thêm Liên Hệ Mới"
 * 4. Format text (bỏ **, thêm <br>, clickable URLs)
 * 5. UI improvements
 *
 * Cách dùng: Include file này vào HTML
 * <script src="chatbot-fixes.js"></script>
 */

// ==================== 1. MODAL ĐĂNG NHẬP ADMIN ====================

// Override ngay lập tức (không cần đợi DOMContentLoaded)
// Vì script này load SAU window.onload, nên function đã tồn tại rồi
(function() {
    console.log('🔧 Overriding openAdminPanel...');

    // Override function openAdminPanel
    window.openAdminPanel = function() {
        console.log('✅ openAdminPanel called - using NEW MODAL');

        // Tạo modal nếu chưa có
        if (!document.getElementById('adminLoginModal')) {
            createAdminLoginModal();
        }

        document.getElementById('adminLoginModal').style.display = 'flex';
        document.getElementById('adminPasswordInput').value = '';
        setTimeout(() => document.getElementById('adminPasswordInput').focus(), 100);
    };

    console.log('✅ openAdminPanel override complete');
})();

function createAdminLoginModal() {
    const modalHTML = `
    <div id="adminLoginModal" class="modal-overlay" style="display: none;">
        <div class="modal-box">
            <div class="modal-header" style="background: linear-gradient(135deg, #9C0612, #7B2CBF); padding: 20px; border-radius: 15px 15px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="color: white; margin: 0; font-size: 20px;">⚙️ Quản Trị Chatbot</h2>
                <button onclick="closeAdminLoginModal()" style="background: transparent; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px;">✕</button>
            </div>
            <div style="padding: 30px;">
                <h3 style="color: #9C0612; margin-bottom: 15px; font-size: 18px;">🔐 Đăng Nhập Admin</h3>
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2D3748;">Mật khẩu:</label>
                <input
                    type="password"
                    id="adminPasswordInput"
                    placeholder="Nhập mật khẩu admin"
                    onkeypress="if(event.key==='Enter') verifyAdminPassword()"
                    style="width: 100%; padding: 12px; border: 2px solid #E2E8F0; border-radius: 8px; font-size: 14px; margin-bottom: 20px; box-sizing: border-box;"
                >
                <button
                    onclick="verifyAdminPassword()"
                    style="background: linear-gradient(135deg, #9C0612, #7B2CBF); color: white; border: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; cursor: pointer; width: 100%; font-size: 14px; transition: transform 0.2s;"
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    Đăng nhập
                </button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add CSS nếu chưa có
    if (!document.getElementById('modal-css')) {
        const style = document.createElement('style');
        style.id = 'modal-css';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }

            .modal-box {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: modalSlideIn 0.3s ease-out;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

window.closeAdminLoginModal = function() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.verifyAdminPassword = function() {
    const password = document.getElementById('adminPasswordInput').value;
    if (password === chatbotData.config.adminPassword) {
        closeAdminLoginModal();
        document.getElementById('adminPanel').style.display = 'block';
        if (typeof loadAdminData === 'function') {
            loadAdminData();
        }
    } else {
        alert('❌ Sai mật khẩu!');
        document.getElementById('adminPasswordInput').value = '';
        document.getElementById('adminPasswordInput').focus();
    }
};

// ==================== 2. SOUND EFFECT KHI BOT TRẢ LỜI ====================

// Cấu hình sound: Bật/tắt sound effect
window.chatbotSoundEnabled = true; // Đặt false để tắt sound

// Tạo sound effect "ting" nhẹ nhàng bằng Web Audio API
function playNotificationSound() {
    // Kiểm tra sound có bật không
    if (!window.chatbotSoundEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Tạo oscillator cho âm thanh "ting"
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Cấu hình âm thanh fairy/ting
        oscillator.type = 'sine'; // Âm mềm mại
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Tần số cao (ting)
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1); // Giảm dần

        // Volume fade out
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume nhẹ
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        // Play
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Sound effect not supported:', error);
    }
}

// Hàm toggle sound on/off (gọi từ console: toggleChatbotSound())
window.toggleChatbotSound = function() {
    window.chatbotSoundEnabled = !window.chatbotSoundEnabled;
    console.log('🔊 Chatbot sound:', window.chatbotSoundEnabled ? 'ON ✅' : 'OFF ❌');
};

// ==================== 3. FORMAT TEXT MESSAGES ====================

// Function format text: bỏ **, thêm <br>, clickable URLs
window.formatMessage = function(text) {
    if (!text) return '';

    // Bước 1: Escape HTML để tránh XSS
    const div = document.createElement('div');
    div.textContent = text;
    let formatted = div.innerHTML;

    // Bước 2: Chuyển **text** thành <strong>text</strong>
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Bước 3: Chuyển \n thành <br>
    formatted = formatted.replace(/\n/g, '<br>');

    // Bước 4: Chuyển URLs thành clickable links
    // Dùng màu vàng cam đậm để dễ đọc trên nền sáng
    formatted = formatted.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" style="color: #D97706; text-decoration: underline; word-break: break-all; font-weight: 700;">$1</a>'
    );

    return formatted;
};

// Override addMessage để sử dụng formatMessage + play sound
const originalAddMessage = window.addMessage;
if (originalAddMessage) {
    window.addMessage = function(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? (chatbotData?.config?.chatbotLogo || '🔮') : '👤';

        const content = document.createElement('div');
        content.className = 'message-content';

        // KIỂM TRA: Nếu là HTML của product card, KHÔNG format (để giữ nguyên HTML)
        // Nếu là text thường, MỚI format
        const isProductCard = text.includes('<div class="product-card">');
        const isImageDiv = text.includes('<div class="product-images">');

        if (isProductCard || isImageDiv) {
            // Giữ nguyên HTML cho product cards và images
            content.innerHTML = text;
        } else {
            // Format text cho messages thường
            content.innerHTML = formatMessage(text);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // PLAY SOUND KHI BOT TRẢ LỜI (không phải user)
        if (sender === 'bot') {
            playNotificationSound();
        }
    };
}

// ==================== 3. NÚT "THÊM LIÊN HỆ MỚI" ====================

// Override renderContactButtonsList
const originalRenderContactButtonsList = window.renderContactButtonsList;
window.renderContactButtonsList = function() {
    const container = document.getElementById('contactButtonsList');
    if (!container) return;

    container.innerHTML = '';

    // THÊM NÚT MỚI
    const addButton = document.createElement('button');
    addButton.className = 'btn-primary';
    addButton.style.marginBottom = '20px';
    addButton.textContent = '➕ Thêm Liên Hệ Mới';
    addButton.onclick = addNewContactButton;
    container.appendChild(addButton);

    // Hiển thị danh sách
    if (!chatbotData.contactButtons) {
        chatbotData.contactButtons = {};
    }

    Object.entries(chatbotData.contactButtons).forEach(([key, button]) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <h4>${button.icon} ${button.text}</h4>
            <div class="item-actions">
                <button class="btn-icon" onclick="editContactButton('${key}')">✏️</button>
                <button class="btn-icon" onclick="deleteContactButton('${key}')">🗑️</button>
            </div>
        `;
        container.appendChild(itemCard);

        // Inline edit
        if (window.editingItemId === `contact-${key}`) {
            const editPanel = createContactEditPanel(button, key);
            container.appendChild(editPanel);
        }
    });
};

window.addNewContactButton = function() {
    const key = prompt('Nhập key cho liên hệ mới (vd: whatsapp, email):');
    if (!key) return;

    if (!chatbotData.contactButtons) {
        chatbotData.contactButtons = {};
    }

    chatbotData.contactButtons[key] = {
        enabled: true,
        icon: '📞',
        text: 'Liên hệ mới',
        url: 'https://example.com'
    };

    window.editingItemId = `contact-${key}`;
    renderContactButtonsList();
};

window.editContactButton = function(key) {
    window.editingItemId = `contact-${key}`;
    renderContactButtonsList();
};

window.deleteContactButton = function(key) {
    if (confirm(`Xóa liên hệ "${chatbotData.contactButtons[key].text}"?`)) {
        delete chatbotData.contactButtons[key];
        if (typeof saveData === 'function') {
            saveData();
        }
        renderContactButtonsList();
    }
};

function createContactEditPanel(button, key) {
    const panel = document.createElement('div');
    panel.className = 'edit-panel';
    panel.innerHTML = `
        <div class="form-group">
            <label>Icon:</label>
            <input type="text" value="${button.icon}" id="contact-icon-${key}">
        </div>
        <div class="form-group">
            <label>Text hiển thị:</label>
            <input type="text" value="${button.text}" id="contact-text-${key}">
        </div>
        <div class="form-group">
            <label>URL:</label>
            <input type="text" value="${button.url}" id="contact-url-${key}">
            <div id="url-preview-contact-${key}" style="margin-top: 10px;"></div>
        </div>
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" ${button.enabled ? 'checked' : ''} id="contact-enabled-${key}">
                Bật liên hệ này
            </label>
        </div>
        <button class="btn-primary" onclick="saveContactButton('${key}')">💾 Lưu</button>
        <button class="btn-secondary" onclick="cancelEdit()">❌ Hủy</button>
    `;

    // Update URL preview
    setTimeout(() => {
        const urlInput = document.getElementById(`contact-url-${key}`);
        const previewDiv = document.getElementById(`url-preview-contact-${key}`);
        if (urlInput && previewDiv) {
            urlInput.oninput = () => {
                const url = urlInput.value;
                if (url && url.startsWith('http')) {
                    previewDiv.innerHTML = `
                        <a href="${url}" target="_blank" style="color: #D97706; text-decoration: underline; font-weight: 700;">
                            🔗 ${url}
                        </a>
                    `;
                } else {
                    previewDiv.innerHTML = '';
                }
            };
            urlInput.oninput();
        }
    }, 100);

    return panel;
}

window.saveContactButton = function(key) {
    chatbotData.contactButtons[key] = {
        enabled: document.getElementById(`contact-enabled-${key}`).checked,
        icon: document.getElementById(`contact-icon-${key}`).value,
        text: document.getElementById(`contact-text-${key}`).value,
        url: document.getElementById(`contact-url-${key}`).value
    };

    if (typeof saveData === 'function') {
        saveData();
    }

    window.editingItemId = null;
    renderContactButtonsList();
    // Đã loại bỏ alert - save im lặng
};

// ==================== 4. URL PREVIEW CHO TẤT CẢ FORMS ====================

// Auto-attach URL previews
document.addEventListener('DOMContentLoaded', function() {
    // Tìm tất cả input có id chứa "-url-"
    const urlInputs = document.querySelectorAll('input[id*="-url-"]');
    urlInputs.forEach(input => {
        const key = input.id.split('-url-')[1];
        const previewId = `url-preview-${key}`;

        // Tạo preview div nếu chưa có
        if (!document.getElementById(previewId)) {
            const previewDiv = document.createElement('div');
            previewDiv.id = previewId;
            previewDiv.style.marginTop = '10px';
            input.parentElement.appendChild(previewDiv);
        }

        // Add event listener
        input.addEventListener('input', function() {
            const url = this.value;
            const preview = document.getElementById(previewId);
            if (preview) {
                if (url && url.startsWith('http')) {
                    preview.innerHTML = `
                        <a href="${url}" target="_blank" style="color: #D97706; text-decoration: underline; word-break: break-all; font-weight: 700;">
                            🔗 ${url}
                        </a>
                    `;
                } else {
                    preview.innerHTML = '';
                }
            }
        });
    });
});

// ==================== 5. FIX SUGGESTION ANSWERS FORMAT ====================

// Override displaySuggestionAnswer để format text VÀ giữ chức năng product cards
const originalDisplaySuggestionAnswer = window.displaySuggestionAnswer;
if (originalDisplaySuggestionAnswer) {
    window.displaySuggestionAnswer = function(suggestion) {
        if (suggestion.answer) {
            addMessage(suggestion.answer, 'bot');
        }

        // Hiển thị images nếu có
        if (suggestion.images && suggestion.images.length > 0) {
            suggestion.images.filter(img => img).forEach(imageUrl => {
                const lastMessage = document.querySelector('.message.bot:last-child .message-content');
                if (lastMessage) {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.className = 'product-image';
                    img.style.maxWidth = '200px';
                    img.style.marginTop = '10px';
                    img.style.borderRadius = '10px';
                    img.onclick = () => openImageModal(imageUrl, suggestion.url);
                    lastMessage.appendChild(img);
                }
            });
        }

        // Hiển thị recommended products - FIX: Dùng displayProduct (không phải displayProductCard!)
        if (suggestion.recommendedProducts && suggestion.recommendedProducts.length > 0) {
            setTimeout(() => {
                suggestion.recommendedProducts.forEach(productKey => {
                    const product = chatbotData.products[productKey];
                    if (product) {
                        // GỌI displayProduct (tên đúng trong HTML gốc)
                        if (typeof displayProduct === 'function') {
                            displayProduct(product);
                        }
                    }
                });
            }, 500);
        }

        // Hiển thị contact buttons
        if (typeof renderContactButtons === 'function') {
            renderContactButtons();
        }
    };
}

// ==================== 6. LOẠI BỎ ALERT "ĐÃ LƯU" ====================

// Override tất cả các hàm save để loại bỏ alert
const originalAlert = window.alert;
window.alert = function(message) {
    // Nếu là thông báo "Đã lưu", BỎ QUA (không hiện)
    if (message && (
        message.includes('✅ Đã lưu') ||
        message.includes('✅ Đã xóa') ||
        message.includes('✅ Đã tải xuống') ||
        message.includes('✅ Đã nhập dữ liệu') ||
        message.includes('✅ Đã đồng bộ')
    )) {
        console.log('Silent save:', message);
        return; // Không hiện popup
    }

    // Các alert khác (như sai mật khẩu) vẫn hiện bình thường
    originalAlert.call(window, message);
};

// ==================== 7. NÚT "THOÁT ADMIN" + PERSIST LOGIN ====================

// Override verifyAdminPassword để lưu trạng thái vào localStorage
const originalVerifyAdminPassword = window.verifyAdminPassword;
window.verifyAdminPassword = function() {
    const password = document.getElementById('adminPasswordInput').value;
    if (password === chatbotData.config.adminPassword) {
        // LƯU TRẠNG THÁI VÀO LOCALSTORAGE
        localStorage.setItem('yinyang_admin_logged_in', 'true');

        closeAdminLoginModal();
        document.getElementById('adminPanel').style.display = 'block';
        if (typeof loadAdminData === 'function') {
            loadAdminData();
        }

        // Thêm nút "Thoát Admin" sau khi panel hiển thị
        setTimeout(addLogoutButton, 100);
    } else {
        alert('❌ Sai mật khẩu!');
        document.getElementById('adminPasswordInput').value = '';
        document.getElementById('adminPasswordInput').focus();
    }
};

// Override openAdminPanel để KIỂM TRA localStorage trước
const originalOpenAdminPanel = window.openAdminPanel;
window.openAdminPanel = function() {
    // Kiểm tra đã đăng nhập chưa
    const isLoggedIn = localStorage.getItem('yinyang_admin_logged_in') === 'true';

    if (isLoggedIn) {
        // ĐÃ ĐĂNG NHẬP → Mở panel luôn, không cần password
        document.getElementById('adminPanel').style.display = 'block';
        if (typeof loadAdminData === 'function') {
            loadAdminData();
        }
        setTimeout(addLogoutButton, 100);
        console.log('✅ Đã mở Admin Panel (đã đăng nhập)');
    } else {
        // CHƯA ĐĂNG NHẬP → Hiện modal login
        if (!document.getElementById('adminLoginModal')) {
            createAdminLoginModal();
        }
        document.getElementById('adminLoginModal').style.display = 'flex';
        document.getElementById('adminPasswordInput').value = '';
        setTimeout(() => document.getElementById('adminPasswordInput').focus(), 100);
    }
};

// Function thêm nút "Thoát Admin"
function addLogoutButton() {
    // Kiểm tra nút đã tồn tại chưa
    if (document.getElementById('adminLogoutBtn')) {
        console.log('Nút logout đã tồn tại');
        return;
    }

    const adminHeader = document.querySelector('#adminPanel .admin-header');
    if (!adminHeader) {
        console.error('Không tìm thấy .admin-header');
        return;
    }

    // Tạo nút Thoát
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'adminLogoutBtn';
    logoutBtn.innerHTML = '🚪 Thoát Admin';
    logoutBtn.style.cssText = `
        margin-left: 15px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #DC2626, #991B1B);
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
    `;

    logoutBtn.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
    };

    logoutBtn.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    };

    logoutBtn.onclick = signOutAdmin;

    // Thêm vào header (bên cạnh h2)
    const h2 = adminHeader.querySelector('h2');
    if (h2) {
        h2.insertAdjacentElement('afterend', logoutBtn);
        console.log('✅ Đã thêm nút Thoát Admin');
    } else {
        adminHeader.appendChild(logoutBtn);
    }
}

// Function sign out admin
window.signOutAdmin = function() {
    if (confirm('🚪 Bạn có chắc muốn thoát tài khoản Admin?')) {
        // XÓA TRẠNG THÁI TỪ LOCALSTORAGE
        localStorage.removeItem('yinyang_admin_logged_in');

        document.getElementById('adminPanel').style.display = 'none';

        // Xóa nút logout
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.remove();
        }

        console.log('✅ Đã đăng xuất Admin');
    }
};

// Override closeAdminPanel để KHÔNG sign out
const originalCloseAdminPanel = window.closeAdminPanel;
window.closeAdminPanel = function() {
    // Chỉ ẨN panel, KHÔNG đăng xuất
    document.getElementById('adminPanel').style.display = 'none';
    if (typeof window.editingItemId !== 'undefined') {
        window.editingItemId = null;
    }

    // KHÔNG xóa localStorage → Vẫn giữ trạng thái đăng nhập
    console.log('Admin Panel đã đóng (vẫn đăng nhập)');
};

// ==================== 8. AUTO-FIX JSON URL ====================

// Override saveConfig để tự động fix URL format
const originalSaveConfig = window.saveConfig;
if (typeof originalSaveConfig === 'function') {
    window.saveConfig = function() {
        // Lấy URL từ input
        let jsonURL = document.getElementById('dataSourceURL')?.value || '';

        // Tự động thêm https:// nếu thiếu
        if (jsonURL && !jsonURL.startsWith('http://') && !jsonURL.startsWith('https://')) {
            jsonURL = 'https://' + jsonURL;
            document.getElementById('dataSourceURL').value = jsonURL;
            console.log('✅ Đã tự động thêm https:// vào URL');
        }

        // Gọi function gốc
        originalSaveConfig.call(this);
    };
}

// ==================== 9. CONSOLE LOG ====================

console.log('✅ YinYang Chatbot Fixes loaded successfully! (v1.8 - Fixed timing issues)');
console.log('Fixes applied:');
console.log('  1. ✅ Modal đăng nhập admin');
console.log('  2. ✅ Format text (bỏ **, thêm <br>, clickable URLs)');
console.log('  3. ✅ Nút "Thêm Liên Hệ Mới"');
console.log('  4. ✅ URL previews');
console.log('  5. ✅ UI improvements');
console.log('  6. ✅ Product cards display correctly');
console.log('  7. ✅ Silent saves (không popup)');
console.log('  8. ✅ Persistent login (localStorage)');
console.log('  9. ✅ Nút "🚪 Thoát Admin" (đóng panel = vẫn login)');
console.log(' 10. ✅ Link colors đổi sang vàng cam (#D97706) - dễ đọc trên nền sáng');
console.log(' 11. ✅ Sound effect "ting" khi bot trả lời');
console.log(' 12. ✅ Auto-add https:// nếu JSON URL thiếu');
console.log('');
console.log('💡 Tip: Gõ toggleChatbotSound() để bật/tắt sound effect');

// Kiểm tra trạng thái login hiện tại
const currentLoginStatus = localStorage.getItem('yinyang_admin_logged_in');
console.log('Current admin login status:', currentLoginStatus === 'true' ? 'LOGGED IN' : 'NOT LOGGED IN');
console.log('Sound effect status:', window.chatbotSoundEnabled ? '🔊 ON' : '🔇 OFF');
