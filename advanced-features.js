/**
 * ADVANCED FEATURES - DS SMART TAX OPTIMIZER™
 * Copyright © 2026 DS Financial Solutions
 * AI Chatbot, Voice Commands, Document Upload, Goals, Multi-year Projection, and more
 */

// Security utility: escape HTML to prevent XSS
function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============= AI CHATBOT =============
let chatbotOpen = false;

function toggleChatbot() {
    const window = document.getElementById('chatbotWindow');
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        window.classList.add('open');
    } else {
        window.classList.remove('open');
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = getAIResponse(message);
        addChatMessage(response, 'bot');
    }, 800);
}

function addChatMessage(text, type) {
    const messagesDiv = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${type}`;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function getAIResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    // Tax saving questions
    if (lowerMsg.includes('80c') || lowerMsg.includes('deduction')) {
        return 'Section 80C allows deductions up to ₹1.5 lakh for investments in PPF, ELSS, NPS, life insurance, etc. You can save up to ₹46,800 in taxes (30% bracket)!';
    }
    if (lowerMsg.includes('hra') || lowerMsg.includes('rent')) {
        return 'HRA exemption is the minimum of: (1) Actual HRA received, (2) Rent paid minus 10% of salary, or (3) 50% of salary for metro cities (40% for non-metro).';
    }
    if (lowerMsg.includes('nps')) {
        return 'NPS offers two tax benefits: Up to ₹1.5L under 80C + additional ₹50K under 80CCD(1B). Total potential saving: ₹62,400 in 30% tax bracket!';
    }
    if (lowerMsg.includes('health') || lowerMsg.includes('insurance') || lowerMsg.includes('80d')) {
        return 'Section 80D allows ₹25,000 deduction for health insurance (₹50,000 for senior citizens). Add ₹5,000 for preventive health checkups!';
    }
    if (lowerMsg.includes('home loan') || lowerMsg.includes('housing')) {
        return 'Home loan benefits: Up to ₹2 lakh interest deduction under Section 24. Plus ₹1.5L principal under 80C. First-time buyers get additional ₹50K under 80EEA!';
    }
    if (lowerMsg.includes('elss')) {
        return 'ELSS funds have the shortest lock-in (3 years) among 80C investments. Historical returns: 12-15% annually. Best for tax saving + wealth creation!';
    }
    if (lowerMsg.includes('ppf')) {
        return 'PPF offers 7.1% tax-free returns. Benefits: EEE status (tax-free at all stages), government-backed security, 15-year tenure. Ideal for long-term goals!';
    }
    
    // Tax regime questions
    if (lowerMsg.includes('old regime') || lowerMsg.includes('new regime') || lowerMsg.includes('which regime')) {
        return 'Old regime benefits those with high deductions (80C, HRA, home loan). New regime has lower rates but no deductions. Our calculator shows which is better for you!';
    }
    
    // Deadline questions
    if (lowerMsg.includes('deadline') || lowerMsg.includes('last date') || lowerMsg.includes('when')) {
        return 'Key dates: March 31 - Last date for tax-saving investments. July 31 - ITR filing deadline. Advance tax due: June 15, Sept 15, Dec 15, March 15.';
    }
    
    // How to save questions
    if (lowerMsg.includes('how to save') || lowerMsg.includes('reduce tax') || lowerMsg.includes('save tax')) {
        return 'Top strategies: 1) Max out 80C (₹1.5L), 2) Add NPS 80CCD1B (₹50K), 3) Get health insurance (₹25K), 4) Claim HRA, 5) Home loan interest (₹2L). Use our optimizer for personalized plan!';
    }
    
    // Investment advice
    if (lowerMsg.includes('invest') || lowerMsg.includes('where to invest')) {
        return 'For tax saving: ELSS (high returns), PPF (safe), NPS (retirement). Risk profile: Conservative→PPF/NSC, Moderate→Balanced funds, Aggressive→ELSS. Diversify across categories!';
    }
    
    // Specific amounts
    if (lowerMsg.includes('how much') || lowerMsg.includes('save')) {
        return 'In 30% tax bracket: 80C saves ₹46,800, NPS additional ₹15,000, health insurance ₹7,500, home loan ₹60,000. Total potential: ₹1.29 lakh+ annually!';
    }
    
    // Default responses
    const defaultResponses = [
        'I can help you with tax deductions, investment options, and optimization strategies. Try asking about "80C", "HRA", "NPS", or "home loan benefits"!',
        'Want to know the best tax-saving investments? Ask me about ELSS, PPF, NPS, or health insurance!',
        'Need help with deadlines? Ask me about "last date for tax saving" or "ITR filing deadline"!',
        'I can compare old vs new tax regime for you! Just ask "which regime is better?"'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// ============= VOICE CONTROL =============
let voiceListening = false;
let recognition = null;

function toggleVoiceControl() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
    }
    
    const button = document.getElementById('voiceButton');
    
    if (!voiceListening) {
        startVoiceRecognition();
        button.classList.add('listening');
        voiceListening = true;
    } else {
        stopVoiceRecognition();
        button.classList.remove('listening');
        voiceListening = false;
    }
}

function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
    };
    
    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
        stopVoiceRecognition();
        document.getElementById('voiceButton').classList.remove('listening');
        voiceListening = false;
    };
    
    recognition.onend = function() {
        if (voiceListening) {
            recognition.start(); // Restart for continuous listening
        }
    };
    
    recognition.start();
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

function handleVoiceCommand(command) {
    const lower = command.toLowerCase();
    
    console.log('Voice command:', command);
    
    // Open chatbot
    if (lower.includes('open chat') || lower.includes('help')) {
        toggleChatbot();
        speak('Opening AI assistant');
    }
    // Calculate tax
    else if (lower.includes('calculate tax') || lower.includes('optimize')) {
        document.getElementById('optimizeBtn').click();
        speak('Calculating your tax optimization');
    }
    // Switch tabs
    else if (lower.includes('show scenario') || lower.includes('scenarios')) {
        switchFeatureTab('scenarios');
        speak('Showing scenarios');
    }
    else if (lower.includes('show portfolio') || lower.includes('investment')) {
        switchFeatureTab('portfolio');
        speak('Showing portfolio builder');
    }
    else if (lower.includes('show calendar')) {
        switchFeatureTab('calendar');
        speak('Showing tax calendar');
    }
    else if (lower.includes('show chart') || lower.includes('analytics')) {
        switchFeatureTab('charts');
        speak('Showing analytics');
    }
    // General info
    else {
        speak('Command not recognized. Try saying "calculate tax" or "open chat"');
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

// ============= THEME SWITCHER =============
function switchTheme(theme) {
    const body = document.body;
    
    // Remove active class from all
    document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
    
    // Add active to selected
    document.querySelector(`.theme-option.${theme}`).classList.add('active');
    
    // Apply theme
    switch(theme) {
        case 'dark':
            body.style.background = 'linear-gradient(135deg, #0A1628 0%, #1A2F4A 100%)';
            document.documentElement.style.setProperty('--primary', '#0A1628');
            break;
        case 'blue':
            body.style.background = 'linear-gradient(135deg, #1E3A8A 0%, #0C4A6E 100%)';
            document.documentElement.style.setProperty('--primary', '#1E3A8A');
            break;
        case 'purple':
            body.style.background = 'linear-gradient(135deg, #6B21A8 0%, #4C1D95 100%)';
            document.documentElement.style.setProperty('--primary', '#6B21A8');
            break;
        case 'green':
            body.style.background = 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)';
            document.documentElement.style.setProperty('--primary', '#065F46');
            break;
    }
}

// ============= ENHANCED TAB GENERATION =============
// Add to existing smart-tax-optimizer.js functions

// Generate Goals Tracker Tab
window.generateGoalsTab = function(results) {
    const goals = [
        { 
            title: 'Maximize 80C Deductions', 
            target: 150000, 
            current: currentProfile.currentInvestments,
            icon: 'fa-bullseye'
        },
        { 
            title: 'NPS Additional Contribution', 
            target: 50000, 
            current: 0,
            icon: 'fa-umbrella'
        },
        { 
            title: 'Health Insurance Coverage', 
            target: 25000, 
            current: 0,
            icon: 'fa-heartbeat'
        },
        { 
            title: 'Total Tax Savings Goal', 
            target: results.savings * 1.2, 
            current: results.savings,
            icon: 'fa-trophy'
        }
    ];
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-target" style="color: var(--optimizer-secondary);"></i>
            Your Tax Saving Goals
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Track your progress towards maximum tax optimization
        </p>
        
        <div class="goals-grid">
            ${goals.map(goal => {
                const percentage = Math.min(100, (goal.current / goal.target * 100));
                return `
                    <div class="goal-card">
                        <div class="goal-header">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fas ${goal.icon}" style="font-size: 1.5rem; color: var(--optimizer-secondary);"></i>
                                <div class="goal-title">${goal.title}</div>
                            </div>
                            <div class="goal-amount">₹${formatCurrency(goal.target)}</div>
                        </div>
                        <div class="goal-progress">
                            <div class="goal-progress-bar">
                                <div class="goal-progress-fill" style="width: ${percentage}%"></div>
                            </div>
                            <div class="goal-stats">
                                <span>₹${formatCurrency(goal.current)} achieved</span>
                                <span>${percentage.toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-rocket" style="color: var(--optimizer-success);"></i>
                Quick Actions to Reach Your Goals
            </h4>
            <div style="display: grid; gap: 0.75rem;">
                <button onclick="openFeatureTab('portfolio')" style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; cursor: pointer; text-align: left; transition: all 0.3s;">
                    <i class="fas fa-chart-pie" style="color: var(--optimizer-secondary); margin-right: 0.5rem;"></i>
                    Build Investment Portfolio
                </button>
                <button onclick="openFeatureTab('scenarios')" style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; cursor: pointer; text-align: left; transition: all 0.3s;">
                    <i class="fas fa-project-diagram" style="color: var(--optimizer-primary); margin-right: 0.5rem;"></i>
                    Explore What-If Scenarios
                </button>
                <button onclick="bookConsultation()" style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; cursor: pointer; text-align: left; transition: all 0.3s;">
                    <i class="fas fa-user-tie" style="color: var(--optimizer-warning); margin-right: 0.5rem;"></i>
                    Consult Tax Expert
                </button>
            </div>
        </div>
    `;
};

// Generate Document Upload Tab
window.generateDocumentTab = function() {
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-cloud-upload-alt" style="color: var(--optimizer-secondary);"></i>
            Upload Tax Documents
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Upload Form 16, investment proofs, or bank statements for automatic analysis
        </p>
        
        <div class="upload-zone" onclick="document.getElementById('fileInput').click()">
            <input type="file" id="fileInput" multiple style="display: none;" onchange="handleFileUpload(event)">
            <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
            <h4 style="color: white; margin-bottom: 0.5rem;">Drag & Drop Files Here</h4>
            <p style="color: rgba(255, 255, 255, 0.6);">or click to browse</p>
            <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.875rem; margin-top: 1rem;">
                Supported: PDF, JPG, PNG, Excel (Max 10MB)
            </p>
        </div>
        
        <div class="uploaded-files" id="uploadedFiles"></div>
        
        <div style="margin-top: 2rem; padding: 1rem; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 12px;">
            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.9375rem; margin: 0;">
                <i class="fas fa-shield-alt" style="color: var(--optimizer-secondary); margin-right: 8px;"></i>
                Your documents are processed locally and never stored on our servers.
            </p>
        </div>
    `;
};

function handleFileUpload(event) {
    const files = event.target.files;
    const container = document.getElementById('uploadedFiles');
    
    Array.from(files).forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'uploaded-file';
        fileDiv.innerHTML = `
            <div class="icon"><i class="fas fa-file-pdf"></i></div>
            <div class="info">
                <div class="name">${escapeHtml(file.name)}</div>
                <div class="size">${(file.size / 1024).toFixed(2)} KB</div>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: var(--optimizer-danger); cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(fileDiv);
    });
}

// Generate Tax News Feed Tab
window.generateNewsTab = function() {
    const news = [
        { date: 'Jan 25, 2026', title: 'Budget 2026: New Tax Slabs Announced', excerpt: 'Finance Minister proposes revised tax slabs with increased rebate limit to ₹7 lakh...', urgent: true },
        { date: 'Jan 20, 2026', title: 'Section 80C Limit May Increase to ₹2 Lakh', excerpt: 'Government considering raising the 80C deduction limit in upcoming budget...', urgent: false },
        { date: 'Jan 15, 2026', title: 'NPS Contribution Deadline Extended', excerpt: 'PFRDA extends last date for NPS contributions to April 15 for FY 2025-26...', urgent: false },
        { date: 'Jan 10, 2026', title: 'New ITR Forms Released for AY 2026-27', excerpt: 'Income Tax Department releases updated forms with simplified reporting...', urgent: false },
        { date: 'Jan 5, 2026', title: 'TDS Rates Reduced on Fixed Deposits', excerpt: 'New circular reduces TDS on FD interest from 10% to 7.5% for senior citizens...', urgent: false }
    ];
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-newspaper" style="color: var(--optimizer-secondary);"></i>
            Latest Tax News & Updates
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Stay updated with latest tax changes and regulations
        </p>
        
        <div class="news-feed">
            ${news.map(item => `
                <div class="news-item ${item.urgent ? 'urgent' : ''}">
                    <div style="flex: 1;">
                        <div class="news-date">${item.date}</div>
                        <div class="news-title">${item.title}</div>
                        <div class="news-excerpt">${item.excerpt}</div>
                    </div>
                    <button style="background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); padding: 0.5rem 1rem; border-radius: 8px; color: var(--optimizer-secondary); cursor: pointer;">
                        Read More
                    </button>
                </div>
            `).join('')}
        </div>
    `;
};

// Generate Multi-year Projection Tab
window.generateProjectionTab = function(results) {
    const years = [];
    const currentYear = new Date().getFullYear();
    const income = currentProfile.income;
    const tax = results.optimal.totalTax;
    
    for (let i = 0; i < 5; i++) {
        const yearIncome = income * Math.pow(1.08, i); // 8% annual growth
        const yearTax = tax * Math.pow(1.06, i); // 6% tax growth
        const yearSavings = results.savings * Math.pow(1.10, i); // 10% savings growth
        
        years.push({
            year: currentYear + i,
            income: yearIncome,
            tax: yearTax,
            savings: yearSavings,
            takeHome: yearIncome - yearTax
        });
    }
    
    return `
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">
            <i class="fas fa-chart-line" style="color: var(--optimizer-secondary);"></i>
            5-Year Tax Projection
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
            Projected income, tax, and savings assuming 8% income growth
        </p>
        
        <table class="projection-table">
            <thead>
                <tr>
                    <th>Year</th>
                    <th>Income</th>
                    <th>Tax Payable</th>
                    <th>Tax Saved</th>
                    <th>Take Home</th>
                </tr>
            </thead>
            <tbody>
                ${years.map(year => `
                    <tr>
                        <td>${year.year}</td>
                        <td>₹${formatCurrency(year.income)}</td>
                        <td style="color: var(--optimizer-danger);">₹${formatCurrency(year.tax)}</td>
                        <td style="color: var(--optimizer-success);">₹${formatCurrency(year.savings)}</td>
                        <td style="color: white; font-weight: 700;">₹${formatCurrency(year.takeHome)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px;">
            <h4 style="color: white; margin-bottom: 1rem;">5-Year Summary</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                <div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Total Income</div>
                    <div style="color: white; font-size: 1.5rem; font-weight: 800;">₹${formatCurrency(years.reduce((sum, y) => sum + y.income, 0))}</div>
                </div>
                <div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Total Tax</div>
                    <div style="color: var(--optimizer-danger); font-size: 1.5rem; font-weight: 800;">₹${formatCurrency(years.reduce((sum, y) => sum + y.tax, 0))}</div>
                </div>
                <div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Total Savings</div>
                    <div style="color: var(--optimizer-success); font-size: 1.5rem; font-weight: 800;">₹${formatCurrency(years.reduce((sum, y) => sum + y.savings, 0))}</div>
                </div>
            </div>
        </div>
    `;
};

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
    console.log('Advanced features loaded successfully!');
    
    // Add drag and drop support for file upload if document tab exists
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
        const uploadZone = document.querySelector('.upload-zone');
        if (uploadZone) uploadZone.classList.add('dragover');
    });
    
    document.addEventListener('drop', function(e) {
        e.preventDefault();
        const uploadZone = document.querySelector('.upload-zone');
        if (uploadZone) {
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload({ target: { files: e.dataTransfer.files } });
            }
        }
    });
});

console.log('%c🚀 ADVANCED FEATURES LOADED', 'color: #00D9FF; font-size: 16px; font-weight: bold;');
console.log('%c✨ AI Chatbot | Voice Control | Theme Switcher | Goals Tracker', 'color: #10B981; font-size: 12px;');
