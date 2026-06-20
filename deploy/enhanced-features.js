/**
 * Enhanced Features - Premium UX Components
 * Scroll Progress, Preloader, 3D Effects, AI Chat, etc.
 */

// ==================== PAGE PRELOADER ====================
const Preloader = {
    init() {
        const loader = document.createElement('div');
        loader.id = 'pagePreloader';
        loader.innerHTML = `
            <div class="preloader-content">
                <div class="preloader-logo">DS</div>
                <div class="preloader-bar"><div class="preloader-fill"></div></div>
            </div>
        `;
        document.body.prepend(loader);

        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('loaded');
                setTimeout(() => loader.remove(), 500);
            }, 500);
        });
    }
};

// ==================== SCROLL PROGRESS BAR ====================
const ScrollProgress = {
    init() {
        const bar = document.createElement('div');
        bar.id = 'scrollProgressBar';
        document.body.appendChild(bar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            bar.style.width = `${progress}%`;
        });
    }
};

// ==================== 3D TILT EFFECT ====================
const TiltEffect = {
    init() {
        document.querySelectorAll('.service-card, .why-card, .tool-card, .popular-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }
};

// ==================== TYPING ANIMATION ====================
const TypingEffect = {
    texts: [
        'Tax Planning',
        'GST Filing',
        'PDF Tools',
        'Resume Building',
        'Financial Advisory',
        'Business Growth'
    ],
    current: 0,
    charIndex: 0,
    isDeleting: false,

    init() {
        const container = document.getElementById('typingText');
        if (!container) return;
        this.type(container);
    },

    type(container) {
        const currentText = this.texts[this.current];

        if (this.isDeleting) {
            container.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            container.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let delay = this.isDeleting ? 50 : 100;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            delay = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.current = (this.current + 1) % this.texts.length;
            delay = 500;
        }

        setTimeout(() => this.type(container), delay);
    }
};

// ==================== IMAGE LAZY LOADING ====================
const LazyLoad = {
    init() {
        const images = document.querySelectorAll('img[data-src]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => observer.observe(img));
    }
};

// ==================== COPY TO CLIPBOARD ====================
const ClipboardHelper = {
    copy(text, successMsg = '✓ Copied!') {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(successMsg);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
};

// ==================== SHARE RESULTS ====================
const ShareHelper = {
    share(data) {
        if (navigator.share) {
            navigator.share({
                title: data.title || 'DS Financial Solutions',
                text: data.text || '',
                url: data.url || window.location.href
            });
        } else {
            this.showShareModal(data);
        }
    },

    showShareModal(data) {
        const modal = document.createElement('div');
        modal.className = 'share-modal-overlay';
        modal.innerHTML = `
            <div class="share-modal-content">
                <h3><i class="fas fa-share-alt"></i> Share Results</h3>
                <div class="share-buttons">
                    <button onclick="ShareHelper.whatsapp('${encodeURIComponent(data.text)}')" class="share-wa">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                    <button onclick="ShareHelper.email('${encodeURIComponent(data.title)}', '${encodeURIComponent(data.text)}')" class="share-email">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                    <button onclick="ShareHelper.twitter('${encodeURIComponent(data.text)}')" class="share-twitter">
                        <i class="fab fa-twitter"></i> Twitter
                    </button>
                    <button onclick="ClipboardHelper.copy('${data.text}')" class="share-copy">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <button onclick="this.closest('.share-modal-overlay').remove()" class="share-close">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('visible'), 10);
    },

    whatsapp(text) {
        window.open(`https://wa.me/?text=${text}`, '_blank');
    },

    email(subject, body) {
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    },

    twitter(text) {
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }
};

// ==================== USAGE ANALYTICS ====================
const UsageAnalytics = {
    storageKey: 'dsFinancialUsage',

    init() {
        this.renderWidget();
    },

    track(action, tool) {
        const data = this.getData();
        const month = new Date().toISOString().slice(0, 7);

        if (!data[month]) data[month] = {};
        if (!data[month][tool]) data[month][tool] = 0;
        data[month][tool]++;

        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.renderWidget();
    },

    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    },

    getMonthlyTotal() {
        const data = this.getData();
        const month = new Date().toISOString().slice(0, 7);
        if (!data[month]) return 0;
        return Object.values(data[month]).reduce((a, b) => a + b, 0);
    },

    renderWidget() {
        const container = document.getElementById('usageWidget');
        if (!container) return;

        const total = this.getMonthlyTotal();
        container.innerHTML = `
            <div class="usage-stat">
                <span class="usage-number">${total}</span>
                <span class="usage-label">files processed this month</span>
            </div>
        `;
    }
};

// ==================== GLOBAL DRAG & DROP ====================
const GlobalDropzone = {
    init() {
        if (!document.querySelector('.tool-modal')) return; // Only on PDF tools

        document.body.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.showOverlay();
        });

        document.body.addEventListener('dragleave', (e) => {
            if (e.target === document.body) this.hideOverlay();
        });

        document.body.addEventListener('drop', (e) => {
            e.preventDefault();
            this.hideOverlay();

            const files = e.dataTransfer.files;
            if (files.length && window.handleFiles) {
                window.handleFiles(files);
            }
        });
    },

    showOverlay() {
        let overlay = document.getElementById('globalDropOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'globalDropOverlay';
            overlay.innerHTML = `
                <div class="drop-content">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <h3>Drop files anywhere</h3>
                    <p>Release to upload</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.classList.add('visible');
    },

    hideOverlay() {
        const overlay = document.getElementById('globalDropOverlay');
        if (overlay) overlay.classList.remove('visible');
    }
};

// ==================== AI CHAT ASSISTANT ====================
const AIChat = {
    isOpen: false,

    init() {
        const widget = document.createElement('div');
        widget.id = 'aiChatWidget';
        widget.innerHTML = `
            <button class="ai-chat-toggle" onclick="AIChat.toggle()">
                <i class="fas fa-comment-dots"></i>
            </button>
            <div class="ai-chat-box">
                <div class="ai-chat-header">
                    <span><i class="fas fa-robot"></i> DS Assistant</span>
                    <button onclick="AIChat.toggle()">×</button>
                </div>
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-message bot">
                        Hi! I'm your DS Financial assistant. How can I help you today?
                    </div>
                </div>
                <div class="ai-chat-input">
                    <input type="text" placeholder="Ask me anything..." id="aiChatInput" onkeypress="if(event.key==='Enter')AIChat.send()">
                    <button onclick="AIChat.send()"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    },

    toggle() {
        this.isOpen = !this.isOpen;
        document.getElementById('aiChatWidget').classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            document.getElementById('aiChatInput').focus();
        }
    },

    async send() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        if (!message) return;

        const messages = document.getElementById('aiChatMessages');
        messages.innerHTML += `<div class="ai-message user">${message}</div>`;
        input.value = '';

        messages.innerHTML += `<div class="ai-message bot typing"><span></span><span></span><span></span></div>`;
        messages.scrollTop = messages.scrollHeight;

        try {
            const response = await this.getResponse(message);
            messages.querySelector('.typing').remove();
            messages.innerHTML += `<div class="ai-message bot">${response}</div>`;
        } catch (err) {
            messages.querySelector('.typing').remove();
            messages.innerHTML += `<div class="ai-message bot error">Sorry, I couldn't process that. Please try again.</div>`;
        }

        messages.scrollTop = messages.scrollHeight;
    },

    async getResponse(message) {
        // Quick responses for common questions
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('tax') && lowerMsg.includes('calculator')) {
            return 'You can use our <a href="tax-portal.html">Tax Calculator</a> to calculate income tax, compare regimes, and more!';
        }
        if (lowerMsg.includes('pdf') || lowerMsg.includes('merge') || lowerMsg.includes('compress')) {
            return 'Check out our <a href="pdf-tools.html">PDF Tools</a> - merge, split, compress PDFs and more!';
        }
        if (lowerMsg.includes('resume') || lowerMsg.includes('cv')) {
            return 'Create a professional resume with our <a href="resume-builder.html">Resume Builder</a> - 14+ templates available!';
        }
        if (lowerMsg.includes('contact') || lowerMsg.includes('help')) {
            return 'You can reach us via WhatsApp (click the green button) or email at contact@dsfinancial.com';
        }
        if (lowerMsg.includes('gst')) {
            return 'For GST filing and returns, visit our <a href="tax-portal.html">Tax Portal</a> - we have GST calculators and filing assistance!';
        }

        return 'Thanks for your question! For detailed assistance, please use our WhatsApp chat or contact form. I can help with: Tax calculations, PDF tools, Resume building, and general queries.';
    }
};

// ==================== FAQ ACCORDION ====================
const FAQAccordion = {
    faqs: [
        { q: "What services do you offer?", a: "We offer comprehensive financial services including Tax Planning, GST Filing, ITR Filing, Audit & Compliance, Bookkeeping, and Business Advisory." },
        { q: "How accurate is the tax calculator?", a: "Our tax calculator uses the latest FY 2024-25 tax slabs and is regularly updated. It provides estimates - for exact calculations, consult a CA." },
        { q: "Are the PDF tools free?", a: "Yes! All our PDF tools (merge, split, compress, convert) are 100% free with no file limits. Processing happens in your browser for privacy." },
        { q: "How do I contact for services?", a: "You can reach us via WhatsApp (green button), contact form, or email at contact@dsfinancial.com. We respond within 24 hours." },
        { q: "Is my data safe?", a: "Absolutely! Tax calculations and PDF processing happen locally in your browser. We don't store your files or financial data on any server." }
    ],

    init() {
        const container = document.getElementById('faqContainer');
        if (!container) return;

        container.innerHTML = this.faqs.map((faq, i) => `
            <div class="faq-item">
                <button class="faq-question" onclick="FAQAccordion.toggle(${i})">
                    ${faq.q}
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="faq-answer" id="faq-${i}">${faq.a}</div>
            </div>
        `).join('');
    },

    toggle(index) {
        const answer = document.getElementById(`faq-${index}`);
        const question = answer.previousElementSibling;
        const isOpen = answer.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
        document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));

        // Open clicked
        if (!isOpen) {
            answer.classList.add('open');
            question.classList.add('active');
        }
    }
};

// ==================== CLIENT LOGOS CAROUSEL ====================
const LogoCarousel = {
    init() {
        const container = document.getElementById('clientLogos');
        if (!container) return;

        // Duplicate for infinite scroll
        const logos = container.innerHTML;
        container.innerHTML = logos + logos;
    }
};

// ==================== PRICING TABLE ====================
const PricingTable = {
    init() {
        const container = document.getElementById('pricingContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="pricing-grid">
                <div class="pricing-card">
                    <div class="pricing-header">
                        <h3>Starter</h3>
                        <div class="pricing-price">₹999<span>/month</span></div>
                    </div>
                    <ul class="pricing-features">
                        <li><i class="fas fa-check"></i> Basic Bookkeeping</li>
                        <li><i class="fas fa-check"></i> GST Filing (Quarterly)</li>
                        <li><i class="fas fa-check"></i> ITR Filing</li>
                        <li><i class="fas fa-check"></i> WhatsApp Support</li>
                    </ul>
                    <button class="pricing-btn">Get Started</button>
                </div>
                
                <div class="pricing-card featured">
                    <div class="pricing-badge">Most Popular</div>
                    <div class="pricing-header">
                        <h3>Professional</h3>
                        <div class="pricing-price">₹2,499<span>/month</span></div>
                    </div>
                    <ul class="pricing-features">
                        <li><i class="fas fa-check"></i> Complete Accounting</li>
                        <li><i class="fas fa-check"></i> GST Filing (Monthly)</li>
                        <li><i class="fas fa-check"></i> ITR + Tax Planning</li>
                        <li><i class="fas fa-check"></i> TDS Returns</li>
                        <li><i class="fas fa-check"></i> Priority Support</li>
                    </ul>
                    <button class="pricing-btn">Get Started</button>
                </div>
                
                <div class="pricing-card">
                    <div class="pricing-header">
                        <h3>Enterprise</h3>
                        <div class="pricing-price">Custom</div>
                    </div>
                    <ul class="pricing-features">
                        <li><i class="fas fa-check"></i> Everything in Pro</li>
                        <li><i class="fas fa-check"></i> Audit & Compliance</li>
                        <li><i class="fas fa-check"></i> CFO Advisory</li>
                        <li><i class="fas fa-check"></i> Dedicated Manager</li>
                        <li><i class="fas fa-check"></i> On-site Visits</li>
                    </ul>
                    <button class="pricing-btn">Contact Us</button>
                </div>
            </div>
        `;
    }
};

// ==================== ANIMATED BACKGROUND ====================
const AnimatedBG = {
    init() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Add gradient animation class
        hero.classList.add('animated-gradient');
    }
};

// ==================== INITIALIZE ALL ENHANCED FEATURES ====================
document.addEventListener('DOMContentLoaded', () => {
    // Core enhancements
    Preloader.init();
    ScrollProgress.init();
    TiltEffect.init();
    TypingEffect.init();
    LazyLoad.init();
    AnimatedBG.init();

    // Interactive features
    AIChat.init();
    FAQAccordion.init();

    // Business features
    PricingTable.init();
    LogoCarousel.init();

    // PDF Tools specific
    GlobalDropzone.init();
    UsageAnalytics.init();
});

// Expose for external use
window.ClipboardHelper = ClipboardHelper;
window.ShareHelper = ShareHelper;
window.UsageAnalytics = UsageAnalytics;
