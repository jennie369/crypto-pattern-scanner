// ============================================
// MAIN JavaScript
// GEMRAL Landing Page
// ============================================

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const stickyBarHeight = 50; // Account for sticky bar
                const offsetTop = targetElement.offsetTop - stickyBarHeight;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========== FORM VALIDATION ==========
function initFormValidation() {
    const forms = document.querySelectorAll('.waitlist-form');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = form.querySelector('input[name="name"]');
            const phoneInput = form.querySelector('input[name="phone"]');
            const submitBtn = form.querySelector('button[type="submit"]');

            let isValid = true;
            let errors = [];

            // Validate name
            if (nameInput) {
                const name = nameInput.value.trim();
                if (name.length < 2) {
                    isValid = false;
                    errors.push('Vui lòng nhập họ tên (ít nhất 2 ký tự)');
                    nameInput.classList.add('error');
                } else {
                    nameInput.classList.remove('error');
                }
            }

            // Validate phone
            if (phoneInput) {
                const phone = phoneInput.value.trim();
                const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
                if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                    isValid = false;
                    errors.push('Vui lòng nhập số điện thoại hợp lệ');
                    phoneInput.classList.add('error');
                } else {
                    phoneInput.classList.remove('error');
                }
            }

            if (isValid) {
                // Show loading state
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Đang gửi...';
                submitBtn.disabled = true;

                // Simulate form submission
                setTimeout(() => {
                    // Show success message
                    showSuccessMessage(form);

                    // Reset form
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;

                    // Update signup count
                    const signupCountElements = document.querySelectorAll('.today-signups-count');
                    signupCountElements.forEach(el => {
                        const current = parseInt(el.textContent) || 0;
                        el.textContent = current + 1;
                    });

                    // Decrease spots
                    const spotsElements = document.querySelectorAll('.spots-count');
                    spotsElements.forEach(el => {
                        const current = parseInt(el.textContent) || 0;
                        if (current > 50) {
                            el.textContent = current - 1;
                        }
                    });
                }, 1500);
            } else {
                // Show error messages
                showErrorMessage(form, errors);
            }
        });
    });

    // Add input styling for error states
    const style = document.createElement('style');
    style.textContent = `
        input.error {
            border-color: #FF6B9D !important;
            animation: shake-input 0.3s ease;
        }
        @keyframes shake-input {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .form-success {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10B981;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 16px;
        }
        .form-success h4 {
            color: #10B981;
            margin-bottom: 10px;
        }
        .form-error {
            background: rgba(255, 107, 157, 0.2);
            border: 1px solid #FF6B9D;
            border-radius: 10px;
            padding: 15px;
            margin: 16px;
        }
        .form-error p {
            color: #FF6B9D;
            margin: 5px 0;
            font-size: 13px;
            padding: 0;
        }
    `;
    document.head.appendChild(style);
}

function showSuccessMessage(form) {
    const existingSuccess = form.querySelector('.form-success');
    if (existingSuccess) existingSuccess.remove();

    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.innerHTML = `
        <h4>🎉 Đăng ký thành công!</h4>
        <p>Cảm ơn bạn đã đăng ký waitlist. Chúng tôi sẽ liên hệ sớm nhất!</p>
    `;
    form.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showErrorMessage(form, errors) {
    const existingError = form.querySelector('.form-error');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = errors.map(err => `<p>⚠️ ${err}</p>`).join('');
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 4000);
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger animation for child cards
                const cards = entry.target.querySelectorAll('.feature-card, .stat-card, .pattern-card, .partnership-card, .pricing-card, .persona-card, .testimonial-card');
                cards.forEach((card, index) => {
                    card.style.transitionDelay = `${index * 0.1}s`;
                    card.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll, .reveal').forEach(el => {
        observer.observe(el);
    });

    // Also observe sections for reveal animations
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// ========== CARD HOVER EFFECTS ==========
function initCardHoverEffects() {
    // Add 3D tilt effect on hover for feature cards
    const cards = document.querySelectorAll('.feature-card, .partnership-card, .pricing-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ========== COUNTER ANIMATION ==========
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number, .hero-stat-number');

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target')) || parseInt(el.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const startTime = performance.now();
        const startValue = 0;

        const suffix = el.textContent.replace(/[\d,]/g, '');

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(startValue + (target - startValue) * easeOutQuart);

            el.textContent = current.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counter.setAttribute('data-target', counter.textContent.replace(/[^\d]/g, ''));
        observer.observe(counter);
    });
}

// ========== ACTIVE SECTION TRACKING ==========
function initSectionTracking() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ========== LAZY LOADING IMAGES ==========
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ========== MOBILE MENU TOGGLE ==========
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                menuToggle.classList.remove('active');
            });
        });
    }
}

// ========== PHONE NUMBER FORMATTING ==========
function initPhoneFormatting() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');

            // Limit to 11 digits (including country code)
            if (value.length > 11) {
                value = value.slice(0, 11);
            }

            e.target.value = value;
        });
    });
}

// ========== PARALLAX EFFECT ==========
function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');

    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.5;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ========== COPY TO CLIPBOARD ==========
function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.copy;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = btn.textContent;
                btn.textContent = 'Đã copy!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        });
    });
}

// ========== INITIALIZE ALL ==========
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initFormValidation();
    initScrollAnimations();
    initSectionTracking();
    initLazyLoading();
    initMobileMenu();
    initPhoneFormatting();
    initParallax();
    initCopyButtons();
    initCardHoverEffects();
    initCounterAnimation();

    // Add reveal class to cards for animation
    document.querySelectorAll('.feature-card, .stat-card, .pattern-card, .partnership-card, .pricing-card, .persona-card, .testimonial-card').forEach(card => {
        card.classList.add('reveal');
    });

    console.log('✅ Main JS initialized!');
});

// ========== UTILITY FUNCTIONS ==========
window.gemral = {
    // Scroll to section
    scrollTo: function(sectionId) {
        const element = document.querySelector(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // Track event (placeholder for analytics)
    trackEvent: function(category, action, label) {
        console.log('Event:', category, action, label);
        // Add your analytics tracking here
        // gtag('event', action, { event_category: category, event_label: label });
    }
};
