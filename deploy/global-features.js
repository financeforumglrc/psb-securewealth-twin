/**
 * Global Features - Cross-page functionality
 * Cookie Banner, Newsletter Popup, Social Proof, Testimonials, etc.
 */

// ==================== SECURITY UTILITIES ====================
function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==================== COOKIE CONSENT BANNER ====================
const CookieConsent = {
    init() {
        if (localStorage.getItem('cookieConsent')) return;

        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.innerHTML = `
            <div class="cookie-content">
                <div class="cookie-icon">🍪</div>
                <div class="cookie-text">
                    <strong>We value your privacy</strong>
                    <p>We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
                </div>
                <div class="cookie-actions">
                    <button class="cookie-btn cookie-accept" onclick="CookieConsent.accept()">Accept All</button>
                    <button class="cookie-btn cookie-decline" onclick="CookieConsent.decline()">Decline</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        setTimeout(() => banner.classList.add('visible'), 500);
    },

    accept() {
        localStorage.setItem('cookieConsent', 'accepted');
        this.hide();
    },

    decline() {
        localStorage.setItem('cookieConsent', 'declined');
        this.hide();
    },

    hide() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('visible');
            setTimeout(() => banner.remove(), 300);
        }
    }
};

// ==================== NEWSLETTER POPUP ====================
const NewsletterPopup = {
    init() {
        if (localStorage.getItem('newsletterShown')) return;

        setTimeout(() => {
            this.show();
            localStorage.setItem('newsletterShown', Date.now());
        }, 15000); // Show after 15 seconds
    },

    show() {
        const popup = document.createElement('div');
        popup.id = 'newsletterPopup';
        popup.className = 'newsletter-modal';
        popup.innerHTML = `
            <div class="newsletter-modal-content">
                <button class="newsletter-close" onclick="NewsletterPopup.hide()">×</button>
                <div class="newsletter-icon">📧</div>
                <h3>Stay Updated!</h3>
                <p>Get the latest tax updates, financial tips, and exclusive offers delivered to your inbox.</p>
                <form class="newsletter-form-popup" onsubmit="NewsletterPopup.submit(event)">
                    <input type="email" placeholder="Enter your email" required>
                    <button type="submit">Subscribe</button>
                </form>
                <div class="newsletter-trust">
                    <small>🔒 No spam, unsubscribe anytime</small>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('visible'), 10);
    },

    hide() {
        const popup = document.getElementById('newsletterPopup');
        if (popup) {
            popup.classList.remove('visible');
            setTimeout(() => popup.remove(), 300);
        }
    },

    submit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button');
        btn.innerHTML = '✓ Subscribed!';
        btn.style.background = '#10b981';
        setTimeout(() => this.hide(), 1500);
    }
};

// ==================== SOCIAL PROOF NOTIFICATIONS ====================
const SocialProof = {
    notifications: [
        { name: 'Rahul', city: 'Mumbai', action: 'just calculated their taxes' },
        { name: 'Priya', city: 'Delhi', action: 'saved ₹45,000 on taxes' },
        { name: 'Amit', city: 'Bangalore', action: 'merged 5 PDF files' },
        { name: 'Sneha', city: 'Chennai', action: 'created a professional resume' },
        { name: 'Vikram', city: 'Hyderabad', action: 'filed GST returns' },
        { name: 'Ananya', city: 'Pune', action: 'downloaded income tax report' },
        { name: 'Karthik', city: 'Kolkata', action: 'compared tax regimes' },
        { name: 'Meera', city: 'Ahmedabad', action: 'compressed a 50MB PDF' }
    ],

    init() {
        if (localStorage.getItem('socialProofDisabled')) return;

        setTimeout(() => {
            this.show();
            setInterval(() => this.show(), 30000); // Every 30 seconds
        }, 8000); // First one after 8 seconds
    },

    show() {
        const existing = document.getElementById('socialProofNotif');
        if (existing) existing.remove();

        const random = this.notifications[Math.floor(Math.random() * this.notifications.length)];
        const timeAgo = Math.floor(Math.random() * 5) + 1;

        const notif = document.createElement('div');
        notif.id = 'socialProofNotif';
        notif.innerHTML = `
            <div class="sp-avatar">${random.name.charAt(0)}</div>
            <div class="sp-content">
                <strong>${random.name} from ${random.city}</strong>
                <span>${random.action}</span>
                <small>${timeAgo} minute${timeAgo > 1 ? 's' : ''} ago</small>
            </div>
            <button class="sp-close" onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(notif);

        setTimeout(() => notif.classList.add('visible'), 10);
        setTimeout(() => {
            notif.classList.remove('visible');
            setTimeout(() => notif.remove(), 300);
        }, 6000);
    }
};

// ==================== TESTIMONIALS CAROUSEL ====================
const TestimonialsCarousel = {
    testimonials: [
        { text: "DS Financial helped me save over ₹2 lakhs in taxes! Their expertise is unmatched.", author: "Rajesh Kumar", role: "Business Owner", rating: 5 },
        { text: "The PDF tools are incredibly fast and easy to use. I use them daily for my work.", author: "Anita Sharma", role: "CA Professional", rating: 5 },
        { text: "Best tax portal I've ever used. The old vs new regime comparison saved me hours!", author: "Vikram Singh", role: "IT Manager", rating: 5 },
        { text: "Their customer support is excellent. Got my queries resolved within minutes.", author: "Priya Patel", role: "Entrepreneur", rating: 4 },
        { text: "The resume builder helped me land my dream job. Highly professional templates!", author: "Arjun Reddy", role: "Software Developer", rating: 5 }
    ],
    current: 0,

    init() {
        const container = document.getElementById('testimonialsCarousel');
        if (!container) return;

        this.render(container);
        setInterval(() => this.next(), 5000);
    },

    render(container) {
        const t = this.testimonials[this.current];
        const stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);

        container.innerHTML = `
            <div class="testimonial-slide">
                <div class="testimonial-stars">${stars}</div>
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">${t.author.charAt(0)}</div>
                    <div>
                        <strong>${t.author}</strong>
                        <span>${t.role}</span>
                    </div>
                </div>
            </div>
            <div class="testimonial-dots">
                ${this.testimonials.map((_, i) => `<span class="dot ${i === this.current ? 'active' : ''}" onclick="TestimonialsCarousel.goTo(${i})"></span>`).join('')}
            </div>
        `;
    },

    next() {
        this.current = (this.current + 1) % this.testimonials.length;
        const container = document.getElementById('testimonialsCarousel');
        if (container) this.render(container);
    },

    goTo(index) {
        this.current = index;
        this.next();
    }
};

// ==================== QUICK ACTIONS MENU (FAB) ====================
const QuickActions = {
    init() {
        const fab = document.createElement('div');
        fab.id = 'quickActionsFab';
        fab.innerHTML = `
            <button class="fab-main" onclick="QuickActions.toggle()">
                <i class="fas fa-bolt"></i>
            </button>
            <div class="fab-menu">
                <a href="pdf-tools.html" class="fab-item" title="PDF Tools"><i class="fas fa-file-pdf"></i></a>
                <a href="tax-portal.html" class="fab-item" title="Tax Calculator"><i class="fas fa-calculator"></i></a>
                <a href="resume-builder.html" class="fab-item" title="Resume Builder"><i class="fas fa-file-alt"></i></a>
                <a href="#contact" class="fab-item" title="Contact Us"><i class="fas fa-envelope"></i></a>
            </div>
        `;
        document.body.appendChild(fab);
    },

    toggle() {
        document.getElementById('quickActionsFab').classList.toggle('open');
    }
};

// ==================== SCROLL REVEAL ANIMATIONS ====================
// Disabled - all elements visible immediately
const ScrollReveal = {
    init() {
        // Disabled scroll animations
        return;
    }
};

// ==================== FORM VALIDATION ANIMATIONS ====================
const FormValidation = {
    init() {
        document.querySelectorAll('form').forEach(form => {
            form.querySelectorAll('input, select, textarea').forEach(input => {
                input.addEventListener('invalid', (e) => {
                    e.preventDefault();
                    this.shake(input);
                    this.showError(input);
                });

                input.addEventListener('input', () => {
                    input.classList.remove('shake', 'error');
                    const errorMsg = input.parentElement.querySelector('.error-msg');
                    if (errorMsg) errorMsg.remove();
                });
            });
        });
    },

    shake(element) {
        element.classList.add('shake', 'error');
        setTimeout(() => element.classList.remove('shake'), 500);
    },

    showError(input) {
        const existing = input.parentElement.querySelector('.error-msg');
        if (existing) existing.remove();

        const msg = document.createElement('span');
        msg.className = 'error-msg';
        msg.textContent = input.validationMessage || 'This field is required';
        input.parentElement.appendChild(msg);
    }
};

// ==================== PROGRESS INDICATOR ====================
const ProgressIndicator = {
    show(steps, currentStep) {
        let indicator = document.getElementById('progressIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'progressIndicator';
            document.body.appendChild(indicator);
        }

        const progress = (currentStep / steps) * 100;
        indicator.innerHTML = `
            <div class="progress-bar-global">
                <div class="progress-fill-global" style="width: ${progress}%"></div>
            </div>
            <span>Step ${currentStep} of ${steps}</span>
        `;
        indicator.classList.add('visible');
    },

    hide() {
        const indicator = document.getElementById('progressIndicator');
        if (indicator) {
            indicator.classList.remove('visible');
        }
    }
};

// ==================== CONFETTI CELEBRATION ====================
const Confetti = {
    fire() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
        const container = document.createElement('div');
        container.id = 'confettiContainer';
        document.body.appendChild(container);

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
                left: ${Math.random() * 100}%;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-delay: ${Math.random() * 2}s;
                animation-duration: ${2 + Math.random() * 2}s;
            `;
            container.appendChild(confetti);
        }

        setTimeout(() => container.remove(), 5000);
    }
};

// ==================== LOADING SKELETONS ====================
const Skeleton = {
    show(container, count = 3) {
        container.innerHTML = Array(count).fill(`
            <div class="skeleton-card">
                <div class="skeleton-header"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
            </div>
        `).join('');
    },

    hide(container) {
        container.querySelectorAll('.skeleton-card').forEach(s => s.remove());
    }
};

// ==================== KEYBOARD NAVIGATION ====================
const KeyboardNav = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                NewsletterPopup.hide();
                document.querySelectorAll('.modal.visible').forEach(m => m.classList.remove('visible'));
            }

            // Ctrl+/ for keyboard shortcuts help
            if (e.ctrlKey && e.key === '/') {
                this.showHelp();
            }
        });
    },

    showHelp() {
        alert('Keyboard Shortcuts:\n• Ctrl+K - Search\n• Escape - Close modals\n• Enter - Submit forms\n• Tab - Navigate fields');
    }
};

// ==================== INITIALIZE ALL FEATURES ====================
document.addEventListener('DOMContentLoaded', () => {
    CookieConsent.init();
    NewsletterPopup.init();
    SocialProof.init();
    TestimonialsCarousel.init();
    QuickActions.init();
    ScrollReveal.init();
    FormValidation.init();
    KeyboardNav.init();
    LanguageManager.init();
    UserAuth.init();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('SW registration failed:', err));
    }
});

// ==================== MULTI-LANGUAGE SUPPORT ====================
const LanguageManager = {
    lang: 'en',

    translations: {
        en: {
            'home': 'Home',
            'tax': 'Tax Portal',
            'pdf': 'PDF Tools',
            'resume': 'Resume',
            'invest': 'Investments',
            'invoice': 'Invoice',
            'contact': 'Contact'
        },
        hi: {
            'home': 'मुखपृष्ठ',
            'tax': 'टैक्स पोर्टल',
            'pdf': 'पीडीएफ टूल्स',
            'resume': 'बायोडेटा',
            'invest': 'निवेश',
            'invoice': 'चालान',
            'contact': 'संपर्क करें'
        }
    },

    init() {
        const saved = localStorage.getItem('dsLang') || 'en';
        this.setLanguage(saved);
        this.renderToggle();
    },

    renderToggle() {
        if (document.getElementById('langToggle')) return;

        const navRight = document.querySelector('.nav-right');
        if (navRight) {
            const btn = document.createElement('button');
            btn.id = 'langToggle';
            btn.className = 'btn-ghost';
            btn.style.marginRight = '10px';
            btn.innerHTML = `<i class="fas fa-language"></i> ${this.lang.toUpperCase()}`;
            btn.onclick = () => this.toggle();
            navRight.insertBefore(btn, navRight.firstChild);
        }
    },

    toggle() {
        const newLang = this.lang === 'en' ? 'hi' : 'en';
        this.setLanguage(newLang);
    },

    setLanguage(lang) {
        this.lang = lang;
        localStorage.setItem('dsLang', lang);

        // Update Toggle Text
        const btn = document.getElementById('langToggle');
        if (btn) btn.innerHTML = `<i class="fas fa-language"></i> ${lang.toUpperCase()}`;

        // Translate Nav Items (Example)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[lang][key]) {
                el.innerText = this.translations[lang][key];
            }
        });
    }
};

// ==================== USER AUTHENTICATION (SIMULATED) ====================
const UserAuth = {
    user: null,

    init() {
        const savedUser = localStorage.getItem('dsUser');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.renderUserUI();
        } else {
            this.renderLoginBtn();
        }
    },

    login() {
        // Simulating Google Login
        const mockUser = {
            name: 'Aashna Joshi',
            email: 'aashna@example.com',
            photo: 'https://ui-avatars.com/api/?name=Aashna+Joshi&background=FFB300&color=fff'
        };

        this.user = mockUser;
        localStorage.setItem('dsUser', JSON.stringify(mockUser));
        this.renderUserUI();
        showToast(`Welcome back, ${mockUser.name}!`);
    },

    logout() {
        this.user = null;
        localStorage.removeItem('dsUser');
        window.location.reload();
    },

    renderLoginBtn() {
        const container = document.querySelector('.nav-right');
        if (!container || document.getElementById('authBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'authBtn';
        btn.className = 'btn-ghost';
        btn.innerHTML = '<i class="fas fa-user-circle"></i> Login';
        btn.onclick = () => this.login();
        container.insertBefore(btn, container.lastElementChild);
    },

    renderUserUI() {
        const btn = document.getElementById('authBtn');
        if (btn) {
            btn.innerHTML = `<img src="${escapeHtml(this.user.photo)}" style="width:24px;border-radius:50%;vertical-align:middle;margin-right:5px;"> ${escapeHtml(this.user.name.split(' ')[0])}`;
            btn.onclick = () => {
                if (confirm('Do you want to logout?')) this.logout();
            };
        } else {
            // If already logged in on load
            this.renderLoginBtn();
            this.renderUserUI(); // Recursive fix to update the just-created button
        }
    }
};


// Expose for external use
window.Confetti = Confetti;
window.ProgressIndicator = ProgressIndicator;
window.Skeleton = Skeleton;

