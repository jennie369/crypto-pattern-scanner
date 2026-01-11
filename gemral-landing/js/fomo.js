// ============================================
// FOMO ELEMENTS - JavaScript
// GEMRAL Landing Page
// ============================================

// ========== CONFIG ==========
const FOMO_CONFIG = {
    // Countdown - Set ngay ra mat (YYYY, MM-1, DD, HH, MM, SS)
    launchDate: new Date(2025, 1, 15, 0, 0, 0), // 15/02/2025

    // Live notifications
    notificationInterval: { min: 8000, max: 15000 }, // 8-15 giay
    notificationDuration: 5000, // Hien thi 5 giay

    // Fake data
    names: [
        'Minh Anh', 'Hoàng Nam', 'Thu Hà', 'Đức Phong', 'Lan Anh',
        'Quốc Việt', 'Mai Linh', 'Thanh Tùng', 'Ngọc Hân', 'Bảo Trâm',
        'Hữu Đạt', 'Thảo Vy', 'Công Minh', 'Phương Thảo', 'Tuấn Kiệt',
        'Hồng Nhung', 'Văn Hùng', 'Thùy Linh', 'Quang Huy', 'Mỹ Duyên',
        'Đình Khoa', 'Ngọc Trinh', 'Minh Châu', 'Hải Đăng', 'Kim Ngân',
        'Anh Tú', 'Bích Ngọc', 'Đức Anh', 'Hương Giang', 'Thành Đạt'
    ],
    cities: [
        'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
        'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Bình Dương',
        'Đồng Nai', 'Long An', 'Quảng Ninh', 'Thái Nguyên', 'Lâm Đồng',
        'Bắc Ninh', 'Nghệ An', 'Khánh Hòa', 'Đắk Lắk', 'Thanh Hóa'
    ],
    products: [
        { name: 'Waitlist VIP', icon: '🚀' },
        { name: 'TIER 1 Scanner', icon: '📊' },
        { name: 'TIER 2 Frequency', icon: '⚡' },
        { name: 'Khóa Tình Yêu 399K', icon: '💕' },
        { name: 'Khóa Triệu Phú 499K', icon: '💰' },
        { name: 'GEM Master Premium', icon: '🔮' },
        { name: 'CTV Affiliate', icon: '🤝' },
        { name: 'Khóa 7 Ngày Khai Mở', icon: '✨' }
    ],

    // Urgency numbers (will be randomized slightly)
    baseViewers: 47,
    baseSpots: 127,
    baseTodaySignups: 23
};

// ========== COUNTDOWN TIMER ==========
function initCountdown() {
    const countdownElements = document.querySelectorAll('.countdown-container');
    if (countdownElements.length === 0) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = FOMO_CONFIG.launchDate - now;

        if (distance < 0) {
            // Da qua ngay ra mat
            countdownElements.forEach(el => {
                el.innerHTML = '<p style="color: #10B981; font-size: 18px; font-weight: 600;">🎉 ĐÃ RA MẮT!</p>';
            });
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElements.forEach(el => {
            el.innerHTML = `
                <div class="countdown-box">
                    <span class="countdown-number">${String(days).padStart(2, '0')}</span>
                    <span class="countdown-label">Ngày</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-number">${String(hours).padStart(2, '0')}</span>
                    <span class="countdown-label">Giờ</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-number">${String(minutes).padStart(2, '0')}</span>
                    <span class="countdown-label">Phút</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-number">${String(seconds).padStart(2, '0')}</span>
                    <span class="countdown-label">Giây</span>
                </div>
            `;
        });

        // Update sticky bar countdown
        const stickyDays = document.querySelector('.countdown-days');
        const stickyHours = document.querySelector('.countdown-hours');
        const stickyMins = document.querySelector('.countdown-mins');

        if (stickyDays) stickyDays.textContent = String(days).padStart(2, '0');
        if (stickyHours) stickyHours.textContent = String(hours).padStart(2, '0');
        if (stickyMins) stickyMins.textContent = String(minutes).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ========== LIVE PURCHASE NOTIFICATIONS ==========
function initLiveNotifications() {
    // Create notification container if not exists
    let container = document.querySelector('.live-notification');
    if (!container) {
        container = document.createElement('div');
        container.className = 'live-notification';
        container.innerHTML = `
            <button class="live-notification-close" onclick="this.parentElement.classList.remove('show')">×</button>
            <div class="live-notification-header">
                <span class="live-notification-dot"></span>
                <span class="live-notification-badge">Vừa xong</span>
            </div>
            <div class="live-notification-content"></div>
            <div class="live-notification-time"></div>
        `;
        document.body.appendChild(container);
    }

    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomTime() {
        const times = ['vài giây', '1 phút', '2 phút', '3 phút', '5 phút', '8 phút'];
        return getRandomItem(times);
    }

    function showNotification() {
        const name = getRandomItem(FOMO_CONFIG.names);
        const city = getRandomItem(FOMO_CONFIG.cities);
        const product = getRandomItem(FOMO_CONFIG.products);

        const content = container.querySelector('.live-notification-content');
        const time = container.querySelector('.live-notification-time');

        content.innerHTML = `${product.icon} <strong>${name}</strong> từ ${city} vừa đăng ký <strong>${product.name}</strong>`;
        time.textContent = getRandomTime() + ' trước';

        // Show notification
        container.classList.add('show');

        // Hide after duration
        setTimeout(() => {
            container.classList.remove('show');
        }, FOMO_CONFIG.notificationDuration);
    }

    function scheduleNextNotification() {
        const { min, max } = FOMO_CONFIG.notificationInterval;
        const delay = Math.random() * (max - min) + min;

        setTimeout(() => {
            showNotification();
            scheduleNextNotification();
        }, delay);
    }

    // Start after 3 seconds
    setTimeout(() => {
        showNotification();
        scheduleNextNotification();
    }, 3000);
}

// ========== LIVE VIEWERS COUNTER ==========
function initLiveViewers() {
    const viewerElements = document.querySelectorAll('.live-viewers-count');
    if (viewerElements.length === 0) return;

    function updateViewers() {
        // Random fluctuation ±5
        const viewers = FOMO_CONFIG.baseViewers + Math.floor(Math.random() * 11) - 5;
        viewerElements.forEach(el => {
            el.textContent = viewers;
        });
    }

    updateViewers();
    setInterval(updateViewers, 5000); // Update every 5 seconds
}

// ========== SPOTS REMAINING ==========
function initSpotsRemaining() {
    const spotsElements = document.querySelectorAll('.spots-count');
    if (spotsElements.length === 0) return;

    let spots = FOMO_CONFIG.baseSpots;

    function decreaseSpots() {
        // Occasionally decrease by 1
        if (Math.random() > 0.7 && spots > 50) {
            spots--;
            spotsElements.forEach(el => {
                el.textContent = spots;
                el.classList.add('updated');
                setTimeout(() => el.classList.remove('updated'), 500);
            });
        }
    }

    spotsElements.forEach(el => el.textContent = spots);
    setInterval(decreaseSpots, 30000); // Check every 30 seconds
}

// ========== TODAY SIGNUPS ==========
function initTodaySignups() {
    const signupElements = document.querySelectorAll('.today-signups-count');
    if (signupElements.length === 0) return;

    let signups = FOMO_CONFIG.baseTodaySignups;

    function increaseSignups() {
        // Occasionally increase by 1
        if (Math.random() > 0.6) {
            signups++;
            signupElements.forEach(el => {
                el.textContent = signups;
            });
        }
    }

    signupElements.forEach(el => el.textContent = signups);
    setInterval(increaseSignups, 45000); // Check every 45 seconds
}

// ========== STICKY URGENCY BAR ==========
function initStickyBar() {
    const stickyBar = document.querySelector('.sticky-urgency-bar');
    if (!stickyBar) return;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Show after scrolling down 500px
        if (currentScrollY > 500) {
            stickyBar.classList.add('show');
        } else {
            stickyBar.classList.remove('show');
        }
    });
}

// ========== PROGRESS BAR ==========
function initProgressBar() {
    const progressBars = document.querySelectorAll('.progress-bar-fill');
    if (progressBars.length === 0) return;

    progressBars.forEach(bar => {
        const targetWidth = bar.dataset.progress || '85';
        setTimeout(() => {
            bar.style.width = targetWidth + '%';
        }, 500);
    });
}

// ========== FOMO WIDGET STICKY ==========
function initFomoWidget() {
    const widget = document.querySelector('.fomo-widget-sticky');
    if (!widget) return;

    // Update mini countdown in widget
    function updateWidgetCountdown() {
        const countdownEl = widget.querySelector('.fomo-countdown');
        if (!countdownEl) return;

        const now = new Date().getTime();
        const distance = FOMO_CONFIG.launchDate - now;

        if (distance < 0) {
            countdownEl.innerHTML = '<p style="font-size: 10px; color: #10B981;">ĐÃ RA MẮT!</p>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        countdownEl.innerHTML = `
            <div class="countdown-mini">
                <div class="countdown-mini-item">
                    <span class="countdown-mini-number">${String(days).padStart(2, '0')}</span>
                    <span class="countdown-mini-label">ngày</span>
                </div>
                <div class="countdown-mini-item">
                    <span class="countdown-mini-number">${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}</span>
                    <span class="countdown-mini-label">giờ</span>
                </div>
            </div>
        `;
    }

    // Initial update
    updateWidgetCountdown();
    setInterval(updateWidgetCountdown, 60000); // Update every minute

    // Click handler for button
    const btn = widget.querySelector('.btn-fomo');
    if (btn) {
        btn.addEventListener('click', () => {
            const waitlistSection = document.querySelector('#waitlist');
            if (waitlistSection) {
                waitlistSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Show/hide based on scroll position
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Hide when near top
        if (currentScrollY < 300) {
            widget.style.opacity = '0';
            widget.style.pointerEvents = 'none';
        } else {
            widget.style.opacity = '1';
            widget.style.pointerEvents = 'auto';
        }

        lastScrollY = currentScrollY;
    });

    // Initial state
    if (window.scrollY < 300) {
        widget.style.opacity = '0';
        widget.style.pointerEvents = 'none';
    }
}

// ========== MOBILE FOMO BANNER ==========
function initMobileFomoBanner() {
    // Create mobile banner if it doesn't exist
    let banner = document.querySelector('.fomo-banner-mobile');
    if (!banner) {
        banner = document.createElement('div');
        banner.className = 'fomo-banner-mobile';
        banner.innerHTML = `
            <div class="fomo-banner-content">
                <div class="fomo-info">
                    <span class="icon">🔥</span>
                    <div class="fomo-text">
                        Còn <strong class="spots-count">127</strong> chỗ VIP
                    </div>
                </div>
                <a href="#waitlist" class="btn-fomo-mobile">ĐĂNG KÝ</a>
            </div>
        `;
        document.body.appendChild(banner);
    }

    // Smooth scroll handler
    const bannerBtn = banner.querySelector('.btn-fomo-mobile');
    if (bannerBtn) {
        bannerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const waitlistSection = document.querySelector('#waitlist');
            if (waitlistSection) {
                waitlistSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Show/hide based on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            banner.style.transform = 'translateY(0)';
        } else {
            banner.style.transform = 'translateY(100%)';
        }
    });

    // Initial state
    banner.style.transform = 'translateY(100%)';
    banner.style.transition = 'transform 0.3s ease';
}

// ========== ENHANCED COUNTDOWN WITH ANIMATION ==========
function animateNumber(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    if (currentValue === newValue) return;

    element.classList.add('updated');
    element.textContent = newValue;

    setTimeout(() => {
        element.classList.remove('updated');
    }, 300);
}

// ========== INITIALIZE ALL ==========
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initLiveNotifications();
    initLiveViewers();
    initSpotsRemaining();
    initTodaySignups();
    initStickyBar();
    initProgressBar();
    initFomoWidget();
    initMobileFomoBanner();

    console.log('🔥 FOMO elements initialized!');
});
