/**
 * ============================================
 * WAITLIST FORM HANDLER
 * GEMRAL Landing Page
 * ============================================
 *
 * Works with both:
 * - index.html form (id="waitlist-form")
 * - section-13 form (id="waitlistForm")
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        // Supabase Edge Function URL
        EDGE_FUNCTION_URL: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/waitlist-submit',

        // Supabase Anon Key (public, safe to expose)
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc',

        // Phone regex for Vietnamese numbers
        PHONE_REGEX: /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/,

        // Min fill time to prevent spam (ms)
        MIN_FILL_TIME: 2000,
    };

    // Form load timestamp
    let formLoadTime = Date.now();

    // Current referral code (for sharing after success)
    let currentReferralCode = '';

    // ============================================
    // REFERRAL CODE CAPTURE
    // ============================================

    // Get referral code from URL (?ref=, ?referral=, ?r=)
    function getReferralCodeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref') ||
               urlParams.get('referral') ||
               urlParams.get('r') ||
               urlParams.get('code') ||
               '';
    }

    // Get stored referral code from sessionStorage
    function getStoredReferralCode() {
        try {
            return sessionStorage.getItem('gemral_referral') || '';
        } catch (e) {
            return '';
        }
    }

    // Store referral code in sessionStorage
    function storeReferralCode(code) {
        if (!code) return;
        try {
            sessionStorage.setItem('gemral_referral', code.toUpperCase());
        } catch (e) {
            // sessionStorage not available
        }
    }

    // Get final referral code (URL > stored > empty)
    const urlReferralCode = getReferralCodeFromUrl();
    const storedReferralCode = getStoredReferralCode();
    const REFERRAL_CODE = urlReferralCode || storedReferralCode || '';

    // Store if we got it from URL
    if (urlReferralCode) {
        storeReferralCode(urlReferralCode);
        console.log('[GEMRAL] Referral code captured:', urlReferralCode);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param) || '';
    }

    function sanitize(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.trim();
    }

    function normalizePhone(phone) {
        let normalized = phone.replace(/\D/g, '');
        if (normalized.startsWith('84')) {
            normalized = '0' + normalized.slice(2);
        }
        return normalized;
    }

    // ============================================
    // MODAL FUNCTIONS
    // ============================================

    function showSuccessModal(data) {
        const modal = document.getElementById('successModal');
        const queueEl = document.getElementById('queueNumber');
        const referralEl = document.getElementById('referralCode');

        if (queueEl && data.queue_number) {
            queueEl.textContent = '#' + data.queue_number;
        }
        if (referralEl && data.referral_code) {
            referralEl.textContent = data.referral_code;
            // Store for share functions
            currentReferralCode = data.referral_code;
        }
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // ============================================
    // SHARE FUNCTIONS
    // ============================================

    // Get shareable link with referral code
    function getShareLink() {
        if (!currentReferralCode) return 'https://gemral.com/';
        return 'https://gemral.com/?ref=' + currentReferralCode;
    }

    // Copy referral code to clipboard
    window.copyReferralCode = function() {
        const code = currentReferralCode || document.getElementById('referralCode')?.textContent || '';
        if (!code) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                alert('Da copy ma: ' + code);
            }).catch(() => {
                fallbackCopy(code);
            });
        } else {
            fallbackCopy(code);
        }
    };

    // Copy share link to clipboard
    window.copyShareLink = function() {
        const link = getShareLink();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(() => {
                alert('Da copy link: ' + link);
            }).catch(() => {
                fallbackCopy(link);
            });
        } else {
            fallbackCopy(link);
        }
    };

    // Fallback copy method
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('Da copy: ' + text);
        } catch (err) {
            prompt('Copy ma nay:', text);
        }
        document.body.removeChild(textarea);
    }

    // Share to Zalo
    window.shareToZalo = function() {
        const link = getShareLink();
        const text = 'Dang ky GEMRAL ngay de nhan uu dai Early Bird!';
        const zaloUrl = 'https://zalo.me/share?url=' + encodeURIComponent(link) + '&title=' + encodeURIComponent(text);
        window.open(zaloUrl, '_blank');
    };

    // Share to Facebook
    window.shareToFacebook = function() {
        const link = getShareLink();
        const fbUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link);
        window.open(fbUrl, '_blank');
    };

    // Native share (mobile)
    window.nativeShare = function() {
        const link = getShareLink();
        if (navigator.share) {
            navigator.share({
                title: 'GEMRAL - Uu dai Early Bird',
                text: 'Dang ky GEMRAL ngay de nhan uu dai dac biet!',
                url: link
            }).catch(() => {
                copyShareLink();
            });
        } else {
            copyShareLink();
        }
    };

    function showErrorModal(message) {
        const modal = document.getElementById('errorModal');
        const messageEl = document.getElementById('errorMessage');

        if (messageEl) {
            messageEl.textContent = message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        }
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Global close function
    window.closeWaitlistModal = function() {
        const successModal = document.getElementById('successModal');
        const errorModal = document.getElementById('errorModal');
        if (successModal) successModal.style.display = 'none';
        if (errorModal) errorModal.style.display = 'none';
    };

    // Close on background click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('waitlist-modal')) {
            closeWaitlistModal();
        }
    });

    // ============================================
    // FORM SUBMISSION
    // ============================================

    async function handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

        // Anti-spam check
        const fillTime = Date.now() - formLoadTime;
        if (fillTime < CONFIG.MIN_FILL_TIME) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.MIN_FILL_TIME - fillTime));
        }

        // Get form data - support both form structures
        const nameInput = form.querySelector('#name, #full_name, input[name="name"], input[name="full_name"]');
        const phoneInput = form.querySelector('#phone, input[name="phone"]');
        const emailInput = form.querySelector('#email, input[name="email"]');
        const honeypotInput = form.querySelector('input[name="website"]');

        // Honeypot check
        if (honeypotInput && honeypotInput.value) {
            console.log('[GEMRAL] Bot detected');
            showSuccessModal({ queue_number: 999, referral_code: 'GEMXXXXX' });
            return;
        }

        const name = nameInput ? sanitize(nameInput.value.trim()) : '';
        const phone = phoneInput ? normalizePhone(phoneInput.value) : '';
        const email = emailInput ? sanitize(emailInput.value.trim().toLowerCase()) : '';

        // Validation
        if (!name || name.length < 2) {
            showErrorModal('Vui lòng nhập họ tên (ít nhất 2 ký tự)');
            if (nameInput) nameInput.focus();
            return;
        }

        if (!phone || !CONFIG.PHONE_REGEX.test(phone)) {
            showErrorModal('Số điện thoại không hợp lệ (VD: 0912345678)');
            if (phoneInput) phoneInput.focus();
            return;
        }

        // Get interests - support different checkbox structures
        const interestCheckboxes = form.querySelectorAll('input[name="interest"]:checked');
        const interests = Array.from(interestCheckboxes).map(cb => {
            // Map old values to new values
            const valueMap = {
                'scanner': 'trading',
                'master': 'spiritual',
                'courses': 'courses',
                'partnership': 'affiliate',
                'trading': 'trading',
                'spiritual': 'spiritual',
                'affiliate': 'affiliate'
            };
            return valueMap[cb.value] || cb.value;
        });

        // Build request data
        const requestData = {
            full_name: name,
            phone: phone,
            email: email || null,
            interested_products: interests,
            marketing_consent: true,
            referral_code: REFERRAL_CODE || null, // Referral code from URL or stored
            utm_source: getUrlParam('utm_source') || null,
            utm_medium: getUrlParam('utm_medium') || null,
            utm_campaign: getUrlParam('utm_campaign') || null,
            utm_content: getUrlParam('utm_content') || null,
            referrer_url: document.referrer || null,
        };

        // Show loading state
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = 'Đang gửi...';
            submitBtn.disabled = true;
        }

        try {
            console.log('[GEMRAL] Submitting to:', CONFIG.EDGE_FUNCTION_URL);
            console.log('[GEMRAL] Data:', requestData);

            const response = await fetch(CONFIG.EDGE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
                    'apikey': CONFIG.SUPABASE_ANON_KEY,
                },
                body: JSON.stringify(requestData)
            });

            console.log('[GEMRAL] Response status:', response.status);

            const result = await response.json();
            console.log('[GEMRAL] Response data:', result);

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Đã có lỗi xảy ra');
            }

            if (result.success) {
                // Show success
                showSuccessModal(result.data || {});

                // Reset form
                form.reset();

                // Update counters on page
                updatePageCounters(result.data?.queue_number);

                // Track analytics
                if (typeof gtag === 'function') {
                    gtag('event', 'waitlist_signup', {
                        queue_number: result.data?.queue_number,
                        interests: interests.join(','),
                    });
                }
                if (typeof fbq === 'function') {
                    fbq('track', 'Lead', { content_name: 'Waitlist Signup' });
                }
            } else {
                throw new Error(result.message || 'Đăng ký không thành công');
            }

        } catch (error) {
            console.error('[GEMRAL] Error:', error);

            let userMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            if (error.message.includes('rate limit') || error.message.includes('quá nhiều')) {
                userMessage = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
            } else if (error.message.includes('phone') || error.message.includes('điện thoại')) {
                userMessage = 'Số điện thoại không hợp lệ hoặc đã được đăng ký.';
            } else if (error.name === 'TypeError' || error.message.includes('fetch')) {
                userMessage = 'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.';
            } else if (error.message) {
                userMessage = error.message;
            }

            showErrorModal(userMessage);

        } finally {
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    }

    function updatePageCounters(queueNumber) {
        // Update signup count
        document.querySelectorAll('.today-signups-count').forEach(el => {
            const current = parseInt(el.textContent) || 0;
            el.textContent = current + 1;
        });

        // Update spots
        document.querySelectorAll('.spots-count').forEach(el => {
            const current = parseInt(el.textContent) || 100;
            if (current > 0) el.textContent = current - 1;
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        // Find all waitlist forms
        const forms = document.querySelectorAll('#waitlist-form, #waitlistForm, .waitlist-form');

        if (forms.length === 0) {
            console.log('[GEMRAL] No waitlist form found');
            return;
        }

        forms.forEach(form => {
            // Remove existing handlers from main.js
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            // Add new handler
            newForm.addEventListener('submit', handleFormSubmit);
            console.log('[GEMRAL] Form handler attached to:', newForm.id || newForm.className);
        });

        // Record load time
        formLoadTime = Date.now();

        console.log('[GEMRAL] Waitlist form initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
