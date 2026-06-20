/**
 * Contact Form Backend
 * Handles submission to Google Sheets
 */

const ContactBackend = {
    // REPLACE THIS URL WITH YOUR DEPLOYED GOOGLE APPS SCRIPT URL
    scriptURL: 'https://script.google.com/macros/s/AKfycbx_PLACEHOLDER_YOUR_ID_HERE/exec',

    init() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', (e) => this.submit(e));
        }
    },

    async submit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        // Visual Feedback
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Gather Data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Save locally for "social proof" or admin dashboard
        this.saveLocally(data);

        try {
            // Check if script URL is set
            if (this.scriptURL.includes('PLACEHOLDER')) {
                // Simulate success if no URL configured yet
                await new Promise(r => setTimeout(r, 1500));
                console.warn('Google Script URL not verified. Data saved locally only.');
            } else {
                // Send to Google Sheets
                await fetch(this.scriptURL, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    mode: 'no-cors', // Important for Google Apps Script
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Success UI
            showToast('✅ Message sent successfully!');
            form.reset();
            btn.innerHTML = '<i class="fas fa-check"></i> Sent';
            btn.style.background = '#10b981';

            // Trigger Confetti
            if (window.Confetti) window.Confetti.fire();

            // Reset button after delay
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 3000);

        } catch (error) {
            console.error('Submission Error:', error);
            showToast('❌ Error sending message. Please try again.');
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    saveLocally(data) {
        // Save to localStorage for Admin Dashboard
        const leads = JSON.parse(localStorage.getItem('dsLeads') || '[]');
        leads.unshift({
            ...data,
            timestamp: new Date().toISOString(),
            status: 'New'
        });
        localStorage.setItem('dsLeads', JSON.stringify(leads));
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    ContactBackend.init();
});
