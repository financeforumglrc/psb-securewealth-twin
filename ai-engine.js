// ============================================================
// AI Resume Intelligence Engine - Phase 3
// ============================================================

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

// --- AI Provider Configuration ---
const AI_PROVIDERS = {
    openrouter: {
        name: 'OpenRouter',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-pro'],
        defaultModel: 'anthropic/claude-3.5-sonnet',
        headers: (key) => ({
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin
        })
    },
    groq: {
        name: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
        defaultModel: 'llama-3.3-70b-versatile',
        headers: (key) => ({
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        })
    },
    huggingface: {
        name: 'Hugging Face',
        endpoint: 'https://api-inference.huggingface.co/models/',
        models: ['mistralai/Mistral-7B-Instruct-v0.2', 'HuggingFaceH4/zephyr-7b-beta'],
        defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
        headers: (key) => ({
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        })
    },
    anthropic: {
        name: 'Claude (Anthropic)',
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
        defaultModel: 'claude-3-5-sonnet-20241022',
        headers: (key) => ({
            'x-api-key': key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        })
    },
    google: {
        name: 'Gemini (Google)',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
        models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        defaultModel: 'gemini-1.5-flash',
        headers: () => ({ 'Content-Type': 'application/json' })
    },
    openai: {
        name: 'ChatGPT (OpenAI)',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4o-mini',
        headers: (key) => ({
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        })
    }
};

// --- AI State ---
let aiConfig = {
    activeProvider: 'groq',
    keys: {},
    models: {}
};

// Load saved AI config
function loadAIConfig() {
    const saved = localStorage.getItem('rb_ai_config');
    if (saved) {
        aiConfig = JSON.parse(saved);
    }
}

// Save AI config
function saveAIConfig() {
    localStorage.setItem('rb_ai_config', JSON.stringify(aiConfig));
}

// --- Unified AI Call Function ---
async function callAI(prompt, options = {}) {
    const provider = options.provider || aiConfig.activeProvider;
    const config = AI_PROVIDERS[provider];
    const apiKey = aiConfig.keys[provider];

    if (!apiKey) {
        throw new Error(`No API key configured for ${config.name}. Please add your key in AI Settings.`);
    }

    const model = options.model || aiConfig.models[provider] || config.defaultModel;

    try {
        let response;

        if (provider === 'google') {
            // Gemini has different API structure
            response = await fetch(`${config.endpoint}${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: config.headers(),
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        } else if (provider === 'anthropic') {
            // Claude has different structure
            response = await fetch(config.endpoint, {
                method: 'POST',
                headers: config.headers(apiKey),
                body: JSON.stringify({
                    model: model,
                    max_tokens: 1024,
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.content?.[0]?.text || '';

        } else if (provider === 'huggingface') {
            // Hugging Face inference API
            response = await fetch(config.endpoint + model, {
                method: 'POST',
                headers: config.headers(apiKey),
                body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 512 } })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';

        } else {
            // OpenAI-compatible APIs (OpenRouter, Groq, OpenAI)
            response = await fetch(config.endpoint, {
                method: 'POST',
                headers: config.headers(apiKey),
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message || data.error);
            return data.choices?.[0]?.message?.content || '';
        }

    } catch (error) {
        console.error(`AI Error (${provider}):`, error);
        throw error;
    }
}

// --- Resume Scoring Engine ---

// Scoring weights
const SCORING_WEIGHTS = {
    atsCompatibility: 20,
    keywordQuality: 20,
    quantification: 20,
    readability: 15,
    completeness: 15,
    roleAlignment: 10
};

// Action verbs for resume
const ACTION_VERBS = [
    'achieved', 'implemented', 'developed', 'managed', 'led', 'created', 'designed',
    'increased', 'decreased', 'reduced', 'improved', 'delivered', 'executed', 'launched',
    'built', 'established', 'generated', 'negotiated', 'streamlined', 'optimized',
    'spearheaded', 'orchestrated', 'transformed', 'pioneered', 'accelerated', 'drove'
];

// Weak verbs to flag
const WEAK_VERBS = [
    'worked', 'helped', 'assisted', 'was responsible', 'handled', 'did', 'made',
    'tried', 'participated', 'contributed', 'supported', 'involved'
];

// Calculate Resume Score
function calculateResumeScore(data, jdKeywords = []) {
    const scores = {
        atsCompatibility: calculateATSScore(data),
        keywordQuality: calculateKeywordScore(data),
        quantification: calculateQuantificationScore(data),
        readability: calculateReadabilityScore(data),
        completeness: calculateCompletenessScore(data),
        roleAlignment: jdKeywords.length ? calculateRoleAlignmentScore(data, jdKeywords) : 10
    };

    // Calculate weighted total
    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(SCORING_WEIGHTS)) {
        totalScore += (scores[key] / 100) * weight;
        totalWeight += weight;
    }

    const overallScore = Math.round((totalScore / totalWeight) * 100);

    return {
        overall: overallScore,
        breakdown: scores,
        insights: generateInsights(scores, data),
        improvements: generateImprovements(scores, data)
    };
}

// ATS Compatibility Score
function calculateATSScore(data) {
    let score = 100;
    const issues = [];

    // Check for standard section headings
    const hasExperience = data.experience && data.experience.length > 0;
    const hasEducation = data.education && data.education.length > 0;
    const hasSkills = data.skills && data.skills.trim().length > 0;
    const hasSummary = data.summary && data.summary.trim().length > 0;

    if (!hasExperience) { score -= 25; issues.push('Missing experience section'); }
    if (!hasEducation) { score -= 15; issues.push('Missing education section'); }
    if (!hasSkills) { score -= 15; issues.push('Missing skills section'); }
    if (!hasSummary) { score -= 10; issues.push('Missing professional summary'); }

    // Check contact info
    if (!data.email) { score -= 10; issues.push('Missing email'); }
    if (!data.phone) { score -= 5; issues.push('Missing phone number'); }

    // Check for special characters that break ATS
    const allText = JSON.stringify(data);
    if (/[★☆●◆▪▸►]/.test(allText)) { score -= 5; issues.push('Special characters may not parse correctly'); }

    return Math.max(0, score);
}

// Keyword Quality Score
function calculateKeywordScore(data) {
    let score = 50; // Base score
    const allText = (data.summary || '') + ' ' +
        data.experience.map(e => e.description || '').join(' ') +
        (data.skills || '');

    const textLower = allText.toLowerCase();

    // Count action verbs
    let actionVerbCount = 0;
    let weakVerbCount = 0;

    ACTION_VERBS.forEach(verb => {
        const regex = new RegExp('\\b' + verb + '\\w*\\b', 'gi');
        const matches = textLower.match(regex);
        if (matches) actionVerbCount += matches.length;
    });

    WEAK_VERBS.forEach(verb => {
        const regex = new RegExp('\\b' + verb + '\\w*\\b', 'gi');
        const matches = textLower.match(regex);
        if (matches) weakVerbCount += matches.length;
    });

    // Boost for action verbs
    score += Math.min(30, actionVerbCount * 3);

    // Penalty for weak verbs
    score -= Math.min(20, weakVerbCount * 5);

    // Bonus for industry keywords (if skills are varied)
    const skillsArray = (data.skills || '').split(/[,;]/).filter(s => s.trim());
    if (skillsArray.length >= 5) score += 10;
    if (skillsArray.length >= 10) score += 10;

    return Math.max(0, Math.min(100, score));
}

// Quantification Score
function calculateQuantificationScore(data) {
    let score = 0;
    let totalBullets = 0;
    let quantifiedBullets = 0;

    // Check experience descriptions
    data.experience.forEach(exp => {
        const desc = exp.description || '';
        const bullets = desc.split(/[\n•\-]/).filter(b => b.trim().length > 10);
        totalBullets += bullets.length;

        bullets.forEach(bullet => {
            // Check for numbers, percentages, currency
            if (/\d+%|\$[\d,]+|₹[\d,]+|\d{2,}|\d+\s*(million|billion|k|lakh|crore)/i.test(bullet)) {
                quantifiedBullets++;
            }
        });
    });

    if (totalBullets === 0) return 50; // No bullets to analyze

    const ratio = quantifiedBullets / totalBullets;
    score = Math.round(ratio * 100);

    // Bonus thresholds
    if (ratio >= 0.5) score = Math.min(100, score + 10);
    if (ratio >= 0.7) score = Math.min(100, score + 10);

    return score;
}

// Readability Score
function calculateReadabilityScore(data) {
    let score = 100;

    // Check summary length
    const summaryLength = (data.summary || '').length;
    if (summaryLength < 50) score -= 15;
    else if (summaryLength > 500) score -= 10;

    // Check experience bullets
    data.experience.forEach(exp => {
        const desc = exp.description || '';
        const bullets = desc.split(/[\n•\-]/).filter(b => b.trim().length > 0);

        bullets.forEach(bullet => {
            const wordCount = bullet.trim().split(/\s+/).length;
            if (wordCount > 30) score -= 3; // Too long
            if (wordCount < 5) score -= 2; // Too short
        });
    });

    // Check for wall of text (no line breaks)
    data.experience.forEach(exp => {
        const desc = exp.description || '';
        if (desc.length > 200 && !desc.includes('\n')) {
            score -= 10;
        }
    });

    return Math.max(0, score);
}

// Completeness Score
function calculateCompletenessScore(data) {
    let score = 0;
    const checks = {
        fullName: data.fullName && data.fullName.trim().length > 0,
        jobTitle: data.jobTitle && data.jobTitle.trim().length > 0,
        email: data.email && data.email.includes('@'),
        phone: data.phone && data.phone.length >= 10,
        summary: data.summary && data.summary.length >= 50,
        experience: data.experience && data.experience.length > 0,
        education: data.education && data.education.length > 0,
        skills: data.skills && data.skills.trim().length > 0
    };

    const weights = {
        fullName: 15, jobTitle: 10, email: 10, phone: 5,
        summary: 15, experience: 25, education: 10, skills: 10
    };

    for (const [key, passed] of Object.entries(checks)) {
        if (passed) score += weights[key];
    }

    return score;
}

// Role Alignment Score (when JD is provided)
function calculateRoleAlignmentScore(data, jdKeywords) {
    if (!jdKeywords || jdKeywords.length === 0) return 50;

    const resumeText = (
        (data.summary || '') + ' ' +
        (data.skills || '') + ' ' +
        data.experience.map(e => e.title + ' ' + e.description).join(' ')
    ).toLowerCase();

    let matchCount = 0;
    jdKeywords.forEach(keyword => {
        if (resumeText.includes(keyword.toLowerCase())) {
            matchCount++;
        }
    });

    const matchRatio = matchCount / jdKeywords.length;
    return Math.round(matchRatio * 100);
}

// Generate Insights
function generateInsights(scores, data) {
    const insights = [];

    if (scores.atsCompatibility < 70) {
        insights.push({ type: 'warning', text: 'ATS compatibility could be improved. Ensure all standard sections are present.' });
    }

    if (scores.keywordQuality < 60) {
        insights.push({ type: 'error', text: 'Use more action verbs like "achieved", "implemented", "delivered".' });
    }

    if (scores.quantification < 50) {
        insights.push({ type: 'warning', text: 'Add numbers and metrics to your experience bullets for greater impact.' });
    }

    if (scores.readability < 70) {
        insights.push({ type: 'info', text: 'Consider breaking long paragraphs into bullet points.' });
    }

    if (scores.completeness === 100) {
        insights.push({ type: 'success', text: 'All essential sections are complete!' });
    }

    return insights;
}

// Generate Improvement Suggestions
function generateImprovements(scores, data) {
    const improvements = [];

    // Find weakest area
    const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    const weakest = sortedScores[0];

    const improvementMap = {
        atsCompatibility: 'Add missing sections: Summary, Experience, Education, Skills',
        keywordQuality: 'Replace weak verbs and add industry-specific keywords',
        quantification: 'Add metrics: percentages, dollar amounts, or counts to 50%+ of bullets',
        readability: 'Keep bullets under 25 words. Break up long paragraphs.',
        completeness: 'Fill in all contact information and sections',
        roleAlignment: 'Include more keywords from the job description'
    };

    improvements.push({
        priority: 'high',
        area: weakest[0],
        suggestion: improvementMap[weakest[0]],
        currentScore: weakest[1]
    });

    // Add more if needed
    if (sortedScores[1][1] < 70) {
        improvements.push({
            priority: 'medium',
            area: sortedScores[1][0],
            suggestion: improvementMap[sortedScores[1][0]],
            currentScore: sortedScores[1][1]
        });
    }

    return improvements;
}

// --- JD Keyword Extraction (Browser-based) ---
function extractJDKeywords(jdText) {
    const text = jdText.toLowerCase();
    const keywords = new Set();

    // Common tech skills
    const techSkills = [
        'python', 'java', 'javascript', 'react', 'node', 'sql', 'excel', 'tableau',
        'power bi', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'jira',
        'salesforce', 'sap', 'oracle', 'mongodb', 'postgresql', 'mysql', 'redis',
        'tensorflow', 'pytorch', 'machine learning', 'data science', 'analytics',
        'agile', 'scrum', 'devops', 'ci/cd', 'api', 'rest', 'graphql'
    ];

    // Business skills
    const businessSkills = [
        'financial modeling', 'valuation', 'due diligence', 'audit', 'compliance',
        'budgeting', 'forecasting', 'strategy', 'consulting', 'stakeholder',
        'project management', 'leadership', 'communication', 'presentation',
        'negotiation', 'problem solving', 'critical thinking', 'team management'
    ];

    const allSkills = [...techSkills, ...businessSkills];

    allSkills.forEach(skill => {
        if (text.includes(skill)) {
            keywords.add(skill);
        }
    });

    // Extract years of experience requirements
    const yearMatch = text.match(/(\d+)\+?\s*years?/gi);
    if (yearMatch) {
        keywords.add(yearMatch[0]);
    }

    // Extract degree requirements
    if (text.includes('mba')) keywords.add('MBA');
    if (text.includes('bachelor')) keywords.add("Bachelor's Degree");
    if (text.includes('master')) keywords.add("Master's Degree");
    if (text.includes('cpa')) keywords.add('CPA');
    if (text.includes('cfa')) keywords.add('CFA');

    return Array.from(keywords);
}

// --- UI Functions ---

function ensureModal(id, html) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.innerHTML = html;
        document.body.appendChild(el);
    }
    return el;
}

function createAISettingsModal() {
    const html = `
        <div id="aiSettingsModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:10002;">
            <div style="background:var(--bg-card,#fff);border-radius:16px;padding:2rem;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;">
                <h3 style="margin-bottom:1rem;">AI Settings</h3>
                <label>Provider</label>
                <select id="aiProviderSelect" style="width:100%;padding:0.75rem;margin-bottom:1rem;border:1px solid var(--rb-border);border-radius:8px;"></select>
                <label>API Key</label>
                <input id="aiApiKeyInput" type="password" style="width:100%;padding:0.75rem;margin-bottom:1rem;border:1px solid var(--rb-border);border-radius:8px;" />
                <label>Model</label>
                <select id="aiModelSelect" style="width:100%;padding:0.75rem;margin-bottom:1.5rem;border:1px solid var(--rb-border);border-radius:8px;"></select>
                <div style="display:flex;gap:1rem;justify-content:flex-end;">
                    <button onclick="closeAISettings()" style="padding:0.75rem 1.5rem;border-radius:8px;border:1px solid var(--rb-border);background:transparent;cursor:pointer;">Cancel</button>
                    <button onclick="saveAISettings()" style="padding:0.75rem 1.5rem;border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;cursor:pointer;">Save</button>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

function ensureScoreModal() {
    return ensureModal('aiScoreModal', `
        <div id="aiScoreModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:10002;">
            <div style="background:var(--bg-card,#fff);border-radius:16px;padding:2rem;max-width:800px;width:95%;max-height:90vh;overflow-y:auto;position:relative;">
                <button onclick="closeAIScoreDashboard()" style="position:absolute;top:1rem;right:1rem;width:36px;height:36px;border:none;border-radius:50%;background:var(--bg-secondary);cursor:pointer;font-size:1.2rem;">&times;</button>
                <div id="aiScoreContent"></div>
            </div>
        </div>`);
}

// Open AI Settings Modal
function openAISettings() {
    loadAIConfig();

    let modal = document.getElementById('aiSettingsModal');
    if (!modal) {
        createAISettingsModal();
        modal = document.getElementById('aiSettingsModal');
    }

    // Populate current values
    document.getElementById('aiProviderSelect').value = aiConfig.activeProvider;
    updateProviderUI();

    if (modal) modal.style.display = 'flex';
}

function closeAISettings() {
    const modal = document.getElementById('aiSettingsModal');
    if (modal) modal.style.display = 'none';
}

function updateProviderUI() {
    const provider = document.getElementById('aiProviderSelect').value;
    const config = AI_PROVIDERS[provider];

    // Update API key input
    const keyInput = document.getElementById('aiApiKeyInput');
    keyInput.value = aiConfig.keys[provider] || '';
    keyInput.placeholder = `Enter your ${config.name} API Key`;

    // Update model select
    const modelSelect = document.getElementById('aiModelSelect');
    modelSelect.innerHTML = config.models.map(m =>
        `<option value="${m}" ${m === (aiConfig.models[provider] || config.defaultModel) ? 'selected' : ''}>${m}</option>`
    ).join('');
}

function saveAISettings() {
    const provider = document.getElementById('aiProviderSelect').value;
    const apiKey = document.getElementById('aiApiKeyInput').value.trim();
    const model = document.getElementById('aiModelSelect').value;

    aiConfig.activeProvider = provider;
    if (apiKey) {
        aiConfig.keys[provider] = apiKey;
    }
    aiConfig.models[provider] = model;

    saveAIConfig();
    showToast('AI Settings Saved!');
    closeAISettings();
}

// Open AI Score Dashboard
function openAIScoreDashboard() {
    const data = collectData();
    const jdText = document.getElementById('jdInputText')?.value || '';
    const jdKeywords = jdText ? extractJDKeywords(jdText) : [];

    const scoreResult = calculateResumeScore(data, jdKeywords);

    renderScoreDashboard(scoreResult, jdKeywords);
    const modal = ensureScoreModal();
    modal.style.display = 'flex';
}

function closeAIScoreDashboard() {
    const modal = document.getElementById('aiScoreModal');
    if (modal) modal.style.display = 'none';
}

function renderScoreDashboard(result, jdKeywords) {
    const container = document.getElementById('aiScoreContent');

    const getScoreColor = (score) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Needs Work';
        return 'Poor';
    };

    container.innerHTML = `
        <div class="ai-score-header">
            <div class="ai-score-circle" style="--score-color: ${getScoreColor(result.overall)}">
                <svg viewBox="0 0 36 36" class="circular-chart">
                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="circle" stroke="${getScoreColor(result.overall)}" stroke-dasharray="${result.overall}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div class="score-text">
                    <span class="score-number">${result.overall}</span>
                    <span class="score-label">${getScoreLabel(result.overall)}</span>
                </div>
            </div>
            <div class="ai-score-summary">
                <h3>Resume Score</h3>
                <p>Your resume is ${result.overall >= 70 ? 'ready for applications' : 'not yet optimized'}.</p>
            </div>
        </div>
        
        <div class="ai-score-breakdown">
            <h4><i class="fas fa-chart-bar"></i> Section Scores</h4>
            ${Object.entries(result.breakdown).map(([key, score]) => `
                <div class="score-row">
                    <span class="score-label">${formatScoreLabel(key)}</span>
                    <div class="score-bar-container">
                        <div class="score-bar" style="width: ${score}%; background: ${getScoreColor(score)}"></div>
                    </div>
                    <span class="score-value" style="color: ${getScoreColor(score)}">${score}%</span>
                </div>
            `).join('')}
        </div>
        
        <div class="ai-insights">
            <h4><i class="fas fa-lightbulb"></i> Insights</h4>
            ${result.insights.map(insight => `
                <div class="insight-item insight-${insight.type}">
                    <i class="fas fa-${insight.type === 'success' ? 'check-circle' : insight.type === 'warning' ? 'exclamation-triangle' : insight.type === 'error' ? 'times-circle' : 'info-circle'}"></i>
                    <span>${insight.text}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="ai-improvements">
            <h4><i class="fas fa-rocket"></i> Top Improvements</h4>
            ${result.improvements.map(imp => `
                <div class="improvement-item priority-${imp.priority}">
                    <div class="imp-header">
                        <span class="imp-badge">${imp.priority.toUpperCase()}</span>
                        <span class="imp-area">${formatScoreLabel(imp.area)}</span>
                        <span class="imp-score">${imp.currentScore}%</span>
                    </div>
                    <p class="imp-suggestion">${imp.suggestion}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="ai-jd-section">
            <h4><i class="fas fa-crosshairs"></i> Job Description Match</h4>
            <textarea id="jdInputText" placeholder="Paste a job description to analyze keyword match...">${jdKeywords.length ? escapeHtml(document.getElementById('jdInputText')?.value || '') : ''}</textarea>
            <button class="btn btn-secondary" onclick="analyzeJDMatch()">
                <i class="fas fa-search"></i> Analyze Match
            </button>
            ${jdKeywords.length ? `
                <div class="jd-keywords">
                    <p><strong>Detected Keywords:</strong></p>
                    <div class="keyword-chips">
                        ${jdKeywords.map(kw => `<span class="keyword-chip">${escapeHtml(kw)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function formatScoreLabel(key) {
    const labels = {
        atsCompatibility: 'ATS Compatibility',
        keywordQuality: 'Keyword Quality',
        quantification: 'Quantification',
        readability: 'Readability',
        completeness: 'Completeness',
        roleAlignment: 'Role Alignment'
    };
    return labels[key] || key;
}

function analyzeJDMatch() {
    openAIScoreDashboard(); // Re-run with JD input
}

// ============================================================
// PHASE 3.2: ENHANCED ATS KEYWORD INTELLIGENCE
// ============================================================

// Extended skill categories for better extraction
const SKILL_CATEGORIES = {
    programming: ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab'],
    frontend: ['react', 'angular', 'vue', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery', 'next.js', 'nuxt', 'svelte'],
    backend: ['node', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'fastapi', '.net', 'asp.net'],
    database: ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'oracle', 'sqlite'],
    cloud: ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean', 'cloudflare'],
    devops: ['docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd', 'gitlab', 'github actions', 'circleci'],
    data: ['tableau', 'power bi', 'excel', 'looker', 'data studio', 'alteryx', 'sas', 'spss'],
    ml_ai: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'nlp', 'computer vision', 'ai'],
    finance: ['financial modeling', 'valuation', 'dcf', 'lbo', 'm&a', 'due diligence', 'audit', 'tax', 'accounting', 'gaap', 'ifrs', 'bloomberg', 'capital iq'],
    consulting: ['strategy', 'implementation', 'stakeholder management', 'change management', 'process improvement', 'lean', 'six sigma'],
    softSkills: ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'presentation', 'negotiation', 'time management', 'adaptability']
};

// Enhanced JD Analysis
function analyzeJobDescription(jdText) {
    const text = jdText.toLowerCase();
    const analysis = {
        hardSkills: [],
        softSkills: [],
        tools: [],
        requirements: [],
        experience: null,
        education: [],
        keywords: new Set()
    };

    // Extract all skills by category
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
        skills.forEach(skill => {
            if (text.includes(skill)) {
                if (category === 'softSkills') {
                    analysis.softSkills.push(skill);
                } else {
                    analysis.hardSkills.push(skill);
                }
                analysis.keywords.add(skill);
            }
        });
    }

    // Extract experience requirements
    const expMatch = text.match(/(\d+)\+?\s*(?:to\s*(\d+))?\s*years?\s*(?:of\s*)?(?:experience|exp)/i);
    if (expMatch) {
        analysis.experience = expMatch[1] + (expMatch[2] ? `-${expMatch[2]}` : '+') + ' years';
        analysis.requirements.push(`${analysis.experience} experience required`);
    }

    // Extract education requirements
    const eduPatterns = [
        { pattern: /mba/i, value: 'MBA' },
        { pattern: /bachelor'?s?\s*(?:degree)?/i, value: "Bachelor's Degree" },
        { pattern: /master'?s?\s*(?:degree)?/i, value: "Master's Degree" },
        { pattern: /phd|doctorate/i, value: 'PhD' },
        { pattern: /\bcpa\b/i, value: 'CPA' },
        { pattern: /\bcfa\b/i, value: 'CFA' },
        { pattern: /\bca\b/i, value: 'CA' },
        { pattern: /\bpmp\b/i, value: 'PMP' }
    ];

    eduPatterns.forEach(({ pattern, value }) => {
        if (pattern.test(text)) {
            analysis.education.push(value);
            analysis.keywords.add(value);
        }
    });

    // Extract action-oriented requirements
    const actionPhrases = text.match(/(?:must|should|required|preferred|ability to|experience (?:in|with))[^.;]+/gi);
    if (actionPhrases) {
        analysis.requirements.push(...actionPhrases.slice(0, 5).map(p => p.trim()));
    }

    return {
        ...analysis,
        keywords: Array.from(analysis.keywords)
    };
}

// Compare Resume to JD and find gaps
function compareResumeToJD(resumeData, jdAnalysis) {
    const resumeText = (
        (resumeData.summary || '') + ' ' +
        (resumeData.skills || '') + ' ' +
        resumeData.experience.map(e => `${e.title} ${e.company} ${e.description}`).join(' ') +
        resumeData.education.map(e => `${e.degree} ${e.institution}`).join(' ')
    ).toLowerCase();

    const comparison = {
        matched: [],
        missing: [],
        matchPercentage: 0,
        suggestions: []
    };

    // Check each keyword
    jdAnalysis.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (resumeText.includes(keywordLower)) {
            comparison.matched.push(keyword);
        } else {
            comparison.missing.push(keyword);
        }
    });

    // Calculate match percentage
    const total = jdAnalysis.keywords.length;
    comparison.matchPercentage = total > 0 ? Math.round((comparison.matched.length / total) * 100) : 0;

    // Generate placement suggestions for missing keywords
    comparison.missing.forEach(keyword => {
        const suggestion = suggestKeywordPlacement(keyword, resumeData);
        if (suggestion) {
            comparison.suggestions.push(suggestion);
        }
    });

    return comparison;
}

// Suggest where to place missing keywords
function suggestKeywordPlacement(keyword, resumeData) {
    const keywordLower = keyword.toLowerCase();

    // Check if it's a hard skill
    const isHardSkill = Object.entries(SKILL_CATEGORIES)
        .filter(([cat]) => cat !== 'softSkills')
        .some(([, skills]) => skills.includes(keywordLower));

    if (isHardSkill) {
        return {
            keyword,
            placement: 'Skills Section',
            action: `Add "${keyword}" to your Skills section`,
            priority: 'high'
        };
    }

    // Soft skills go in summary or experience
    const isSoftSkill = SKILL_CATEGORIES.softSkills.includes(keywordLower);
    if (isSoftSkill) {
        return {
            keyword,
            placement: 'Summary or Experience',
            action: `Demonstrate "${keyword}" through achievements in your Experience section`,
            priority: 'medium'
        };
    }

    // Education/certifications
    if (['mba', 'cpa', 'cfa', 'pmp', 'ca'].some(cert => keywordLower.includes(cert))) {
        return {
            keyword,
            placement: 'Education/Certifications',
            action: `Add "${keyword}" to Certifications if applicable`,
            priority: 'high'
        };
    }

    return {
        keyword,
        placement: 'Experience Bullets',
        action: `Incorporate "${keyword}" naturally into relevant experience descriptions`,
        priority: 'medium'
    };
}

// ============================================================
// PHASE 3.3: AI BULLET REWRITING ENGINE
// ============================================================

// Bullet improvement prompts
const REWRITE_PROMPTS = {
    impact: `Rewrite this resume bullet point to be more impactful. Use the format: [Action Verb] + [Task] + [Result with metrics].
Original: "{bullet}"
Requirements:
- Start with a strong action verb
- Include quantified results (%, $, numbers) if possible
- Keep under 25 words
- Make it achievement-focused, not duty-focused
Rewritten:`,

    star: `Rewrite this resume bullet point using the STAR method (Situation, Task, Action, Result).
Original: "{bullet}"
Requirements:
- Be concise (under 30 words)
- Include measurable outcome
- Use professional language
Rewritten:`,

    conservative: `Rewrite this resume bullet point for a conservative industry (Finance/Consulting).
Original: "{bullet}"
Requirements:
- Professional, formal tone
- Focus on business impact
- Use industry-standard terminology
- Include metrics where possible
Rewritten:`,

    startup: `Rewrite this resume bullet point for a startup/tech environment.
Original: "{bullet}"
Requirements:
- Dynamic, energetic language
- Emphasize innovation and speed
- Show hands-on impact
- Keep it concise
Rewritten:`
};

// Rewrite a single bullet point using AI
async function rewriteBullet(bullet, style = 'impact') {
    const prompt = REWRITE_PROMPTS[style].replace('{bullet}', bullet);

    try {
        const result = await callAI(prompt);
        return result.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
    } catch (error) {
        console.error('AI Rewrite Error:', error);
        throw error;
    }
}

// Analyze a bullet and suggest improvements
function analyzeBullet(bullet) {
    const analysis = {
        hasActionVerb: false,
        hasMetrics: false,
        isQuantified: false,
        wordCount: 0,
        weakVerbs: [],
        suggestions: []
    };

    const words = bullet.trim().split(/\s+/);
    analysis.wordCount = words.length;

    // Check for action verb at start
    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, '');
    analysis.hasActionVerb = ACTION_VERBS.some(v => firstWord.startsWith(v));

    // Check for metrics
    analysis.hasMetrics = /\d+%|\$[\d,]+|₹[\d,]+|\d{2,}|million|billion|thousand/i.test(bullet);
    analysis.isQuantified = analysis.hasMetrics;

    // Find weak verbs
    WEAK_VERBS.forEach(verb => {
        if (bullet.toLowerCase().includes(verb)) {
            analysis.weakVerbs.push(verb);
        }
    });

    // Generate suggestions
    if (!analysis.hasActionVerb) {
        analysis.suggestions.push('Start with a strong action verb (e.g., "Developed", "Implemented", "Led")');
    }
    if (!analysis.hasMetrics) {
        analysis.suggestions.push('Add quantified results (%, $, numbers)');
    }
    if (analysis.weakVerbs.length > 0) {
        analysis.suggestions.push(`Replace weak verbs: "${analysis.weakVerbs.join('", "')}"`);
    }
    if (analysis.wordCount > 30) {
        analysis.suggestions.push('Consider shortening to under 25 words');
    }
    if (analysis.wordCount < 10) {
        analysis.suggestions.push('Add more detail about impact and results');
    }

    return analysis;
}

// ============================================================
// PHASE 3.4: QUANTIFICATION SUGGESTIONS
// ============================================================

// Suggest realistic metrics for unquantified bullets
const METRIC_TEMPLATES = {
    sales: ['increased sales by X%', 'generated $X in revenue', 'closed X deals', 'grew customer base by X%'],
    management: ['managed team of X members', 'oversaw $X budget', 'led X projects', 'reduced turnover by X%'],
    efficiency: ['reduced costs by X%', 'saved X hours weekly', 'improved efficiency by X%', 'automated X processes'],
    growth: ['grew user base by X%', 'increased engagement by X%', 'achieved X% growth', 'expanded to X markets'],
    quality: ['maintained X% accuracy', 'reduced errors by X%', 'achieved X% customer satisfaction', 'improved quality by X%'],
    general: ['completed X projects', 'trained X employees', 'processed X items daily', 'served X clients']
};

function suggestMetrics(bullet) {
    const bulletLower = bullet.toLowerCase();
    const suggestions = [];

    // Detect context and suggest appropriate metrics
    if (/sales|revenue|deal|client|customer/i.test(bulletLower)) {
        suggestions.push(...METRIC_TEMPLATES.sales);
    }
    if (/manage|lead|team|supervise|coordinate/i.test(bulletLower)) {
        suggestions.push(...METRIC_TEMPLATES.management);
    }
    if (/reduce|save|improve|optimize|streamline/i.test(bulletLower)) {
        suggestions.push(...METRIC_TEMPLATES.efficiency);
    }
    if (/grow|increase|expand|scale/i.test(bulletLower)) {
        suggestions.push(...METRIC_TEMPLATES.growth);
    }

    // If no specific match, use general suggestions
    if (suggestions.length === 0) {
        suggestions.push(...METRIC_TEMPLATES.general);
    }

    return suggestions.slice(0, 4); // Return top 4 suggestions
}

// ============================================================
// UI: ENHANCED JD ANALYSIS MODAL
// ============================================================

function openJDAnalyzer() {
    const modal = document.getElementById('jdAnalyzerModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeJDAnalyzer() {
    document.getElementById('jdAnalyzerModal').style.display = 'none';
}

function runJDAnalysis() {
    const jdText = document.getElementById('jdAnalyzerInput').value.trim();
    if (!jdText) {
        showToast('Please paste a job description first');
        return;
    }

    const analysis = analyzeJobDescription(jdText);
    const resumeData = collectData();
    const comparison = compareResumeToJD(resumeData, analysis);

    renderJDAnalysisResults(analysis, comparison);
}

function renderJDAnalysisResults(analysis, comparison) {
    const container = document.getElementById('jdAnalysisResults');

    const getMatchColor = (pct) => {
        if (pct >= 70) return '#10B981';
        if (pct >= 50) return '#F59E0B';
        return '#EF4444';
    };

    container.innerHTML = `
        <div class="jd-match-header" style="background: linear-gradient(135deg, ${getMatchColor(comparison.matchPercentage)}, ${getMatchColor(comparison.matchPercentage)}dd); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                <div style="font-size: 3rem; font-weight: 700;">${comparison.matchPercentage}%</div>
                <div>
                    <h3 style="margin: 0;">Job Match Score</h3>
                    <p style="margin: 0.5rem 0 0; opacity: 0.9;">${comparison.matched.length} of ${analysis.keywords.length} keywords found</p>
                </div>
            </div>
        </div>
        
        <div class="jd-skills-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="jd-skill-box" style="background: #ECFDF5; border-radius: 10px; padding: 1rem;">
                <h4 style="color: #065F46; margin: 0 0 0.75rem;"><i class="fas fa-check-circle"></i> Matched Keywords (${comparison.matched.length})</h4>
                <div class="keyword-chips">
                    ${comparison.matched.map(kw => `<span class="keyword-chip" style="background: #10B981;">${escapeHtml(kw)}</span>`).join('')}
                </div>
            </div>
            <div class="jd-skill-box" style="background: #FEF2F2; border-radius: 10px; padding: 1rem;">
                <h4 style="color: #991B1B; margin: 0 0 0.75rem;"><i class="fas fa-times-circle"></i> Missing Keywords (${comparison.missing.length})</h4>
                <div class="keyword-chips">
                    ${comparison.missing.map(kw => `<span class="keyword-chip" style="background: #EF4444;">${escapeHtml(kw)}</span>`).join('')}
                </div>
            </div>
        </div>
        
        ${comparison.suggestions.length > 0 ? `
            <div class="jd-suggestions" style="background: var(--rb-bg); border-radius: 10px; padding: 1rem; margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 1rem;"><i class="fas fa-magic"></i> Keyword Placement Suggestions</h4>
                ${comparison.suggestions.slice(0, 5).map(s => `
                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--rb-border);">
                        <span class="keyword-chip" style="background: ${s.priority === 'high' ? '#EF4444' : '#F59E0B'};">${escapeHtml(s.keyword)}</span>
                        <span style="color: var(--rb-text-light); font-size: 0.85rem;">→ ${escapeHtml(s.action)}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${analysis.requirements.length > 0 ? `
            <div class="jd-requirements" style="background: var(--rb-bg); border-radius: 10px; padding: 1rem;">
                <h4 style="margin: 0 0 1rem;"><i class="fas fa-clipboard-list"></i> Key Requirements Detected</h4>
                <ul style="margin: 0; padding-left: 1.5rem; color: var(--rb-text-light);">
                    ${analysis.requirements.slice(0, 5).map(r => `<li style="margin-bottom: 0.5rem;">${r}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;

    container.style.display = 'block';
}

// Show toast notification
function showToast(message) {
    // Check if toast container exists
    let toast = document.getElementById('aiToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'aiToast';
        toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #1F2937; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; opacity: 0; transition: opacity 0.3s;';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// ============================================================
// PHASE 3.5: RESUME HEATMAP (Recruiter Eye-Tracking Simulation)
// ============================================================

// Eye-tracking zones based on research (F-pattern reading)
const HEATMAP_ZONES = {
    name: { weight: 95, description: 'Name - First thing recruiters look at' },
    title: { weight: 90, description: 'Job Title - Immediate relevance check' },
    contact: { weight: 70, description: 'Contact Info - Quick scan' },
    summary: { weight: 85, description: 'Summary - 2-3 second read' },
    recentJob: { weight: 95, description: 'Most Recent Job - Key focus area' },
    recentJobTitle: { weight: 90, description: 'Recent Job Title - Role verification' },
    recentJobCompany: { weight: 85, description: 'Company Name - Credibility check' },
    recentJobBullets: { weight: 80, description: 'Job Bullets - Skill/impact scan' },
    olderJobs: { weight: 50, description: 'Older Experience - Quick glance' },
    skills: { weight: 75, description: 'Skills Section - Keyword matching' },
    education: { weight: 60, description: 'Education - Qualification check' },
    certifications: { weight: 55, description: 'Certifications - Bonus scan' },
    projects: { weight: 45, description: 'Projects - If time permits' }
};

// Generate heatmap analysis
function generateHeatmapAnalysis(resumeData) {
    const analysis = [];

    // Check each zone
    if (resumeData.fullName) {
        analysis.push({ zone: 'name', content: resumeData.fullName, ...HEATMAP_ZONES.name });
    } else {
        analysis.push({ zone: 'name', content: '(Missing)', weight: 0, description: 'Name is CRITICAL - add immediately!' });
    }

    if (resumeData.jobTitle) {
        analysis.push({ zone: 'title', content: resumeData.jobTitle, ...HEATMAP_ZONES.title });
    }

    if (resumeData.email || resumeData.phone) {
        analysis.push({ zone: 'contact', content: `${resumeData.email || ''} ${resumeData.phone || ''}`, ...HEATMAP_ZONES.contact });
    }

    if (resumeData.summary && resumeData.summary.length > 50) {
        analysis.push({ zone: 'summary', content: resumeData.summary.substring(0, 100) + '...', ...HEATMAP_ZONES.summary });
    }

    // Recent job gets most attention
    if (resumeData.experience && resumeData.experience.length > 0) {
        const recent = resumeData.experience[0];
        analysis.push({ zone: 'recentJob', content: recent.title, ...HEATMAP_ZONES.recentJob });
        analysis.push({ zone: 'recentJobCompany', content: recent.company, ...HEATMAP_ZONES.recentJobCompany });
        if (recent.description) {
            const firstBullet = recent.description.split('\n')[0]?.substring(0, 80);
            analysis.push({ zone: 'recentJobBullets', content: firstBullet + '...', ...HEATMAP_ZONES.recentJobBullets });
        }
    }

    // Skills
    if (resumeData.skills) {
        analysis.push({ zone: 'skills', content: resumeData.skills.substring(0, 100) + '...', ...HEATMAP_ZONES.skills });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
        analysis.push({ zone: 'education', content: resumeData.education[0].degree, ...HEATMAP_ZONES.education });
    }

    return analysis.sort((a, b) => b.weight - a.weight);
}

// Render heatmap visualization
function renderHeatmap(analysis) {
    const getHeatColor = (weight) => {
        if (weight >= 80) return 'rgba(239, 68, 68, 0.8)'; // Hot red
        if (weight >= 60) return 'rgba(249, 115, 22, 0.7)'; // Orange
        if (weight >= 40) return 'rgba(234, 179, 8, 0.6)'; // Yellow
        return 'rgba(34, 197, 94, 0.5)'; // Cool green
    };

    return `
        <div class="heatmap-container">
            <div class="heatmap-header">
                <h4 style="margin: 0;"><i class="fas fa-fire"></i> Recruiter Attention Heatmap</h4>
                <p style="margin: 0.5rem 0 0; color: var(--rb-text-light); font-size: 0.85rem;">
                    Based on eye-tracking research: recruiters spend ~7 seconds on initial scan
                </p>
            </div>
            <div class="heatmap-legend" style="display: flex; gap: 1rem; margin: 1rem 0; font-size: 0.8rem;">
                <span><span style="display: inline-block; width: 12px; height: 12px; background: rgba(239, 68, 68, 0.8); border-radius: 2px;"></span> High Focus</span>
                <span><span style="display: inline-block; width: 12px; height: 12px; background: rgba(249, 115, 22, 0.7); border-radius: 2px;"></span> Medium</span>
                <span><span style="display: inline-block; width: 12px; height: 12px; background: rgba(234, 179, 8, 0.6); border-radius: 2px;"></span> Glance</span>
                <span><span style="display: inline-block; width: 12px; height: 12px; background: rgba(34, 197, 94, 0.5); border-radius: 2px;"></span> Low</span>
            </div>
            <div class="heatmap-zones">
                ${analysis.map(item => `
                    <div class="heatmap-zone" style="
                        background: ${getHeatColor(item.weight)};
                        padding: 0.75rem 1rem;
                        margin-bottom: 0.5rem;
                        border-radius: 8px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <div>
                            <strong style="text-transform: capitalize;">${escapeHtml(item.zone).replace(/([A-Z])/g, ' $1')}</strong>
                            <div style="font-size: 0.8rem; opacity: 0.9; margin-top: 0.25rem;">${escapeHtml(item.content || '')}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; font-size: 1.1rem;">${item.weight}%</div>
                            <div style="font-size: 0.7rem; opacity: 0.8;">attention</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="heatmap-tips" style="background: var(--rb-bg); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <h5 style="margin: 0 0 0.5rem;"><i class="fas fa-lightbulb"></i> Optimization Tips</h5>
                <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem; color: var(--rb-text-light);">
                    <li>Your name and current title are scanned first - make them impactful</li>
                    <li>First bullet of recent job gets 4x more attention than last bullet</li>
                    <li>Recruiters read in F-pattern: top-left gets most focus</li>
                    <li>Skills section is keyword-scanned, not read - use exact JD terms</li>
                </ul>
            </div>
        </div>
    `;
}

// Open heatmap modal
function openHeatmapView() {
    const data = collectData();
    const analysis = generateHeatmapAnalysis(data);

    const container = document.getElementById('aiScoreContent');
    container.innerHTML = renderHeatmap(analysis);
    const modal = ensureScoreModal();
    modal.style.display = 'flex';
}

// ============================================================
// PHASE 3.6: AI WRITING ASSISTANT
// ============================================================

// Writing Assistant prompts for different sections
const WRITING_PROMPTS = {
    summary: {
        generate: `Write a professional resume summary for a {jobTitle} with experience in {skills}. 
Requirements:
- 2-3 sentences maximum
- Start with years of experience or key strength
- Include 2-3 key skills
- End with value proposition
- No first person pronouns (I, me, my)
Format: Just the summary text, no quotes.`,

        improve: `Improve this professional summary to be more impactful:
"{text}"
Requirements:
- Make it more concise and punchy
- Add specificity and metrics if missing
- Remove generic phrases
- Keep under 3 sentences
Improved version:`
    },

    bullet: {
        generate: `Generate 3 impactful resume bullet points for a {jobTitle} at {company}.
Requirements:
- Start each with strong action verb
- Include quantified results (%, $, numbers)
- Focus on achievements, not duties
- Keep each under 25 words
Format: One bullet per line, starting with •`,

        improve: `Improve this resume bullet point:
"{text}"
Requirements:
- Start with action verb
- Add metrics/quantification
- Make achievement-focused
- Keep under 25 words
Improved version:`
    },

    skills: {
        generate: `List 10-15 relevant skills for a {jobTitle} role.
Requirements:
- Mix of technical and soft skills
- Industry-standard terminology
- Comma-separated list
Format: skill1, skill2, skill3, ...`,

        optimize: `Optimize this skills list to match modern ATS systems:
"{text}"
Requirements:
- Remove duplicates
- Use standard terminology
- Group by category if appropriate
- Add any obvious missing skills for the role
Optimized list:`
    }
};

// Generate content using AI
async function aiGenerate(type, context = {}) {
    const promptTemplate = WRITING_PROMPTS[type]?.generate;
    if (!promptTemplate) {
        throw new Error(`Unknown generation type: ${type}`);
    }

    let prompt = promptTemplate;
    for (const [key, value] of Object.entries(context)) {
        prompt = prompt.replace(`{${key}}`, value || '');
    }

    try {
        showToast('Generating with AI...');
        const result = await callAI(prompt);
        showToast('Generated successfully!');
        return result.trim();
    } catch (error) {
        showToast('AI Error: ' + error.message);
        throw error;
    }
}

// Improve existing content using AI
async function aiImprove(type, text) {
    const promptTemplate = WRITING_PROMPTS[type]?.improve || WRITING_PROMPTS[type]?.optimize;
    if (!promptTemplate) {
        throw new Error(`Unknown improvement type: ${type}`);
    }

    const prompt = promptTemplate.replace('{text}', text);

    try {
        showToast('Improving with AI...');
        const result = await callAI(prompt);
        showToast('Improved successfully!');
        return result.trim();
    } catch (error) {
        showToast('AI Error: ' + error.message);
        throw error;
    }
}

// AI Summary Generator UI
async function generateAISummary() {
    const data = collectData();
    const jobTitle = data.jobTitle || 'Professional';
    const skills = data.skills || 'various skills';

    try {
        const summary = await aiGenerate('summary', { jobTitle, skills: skills.substring(0, 100) });
        const summaryField = document.getElementById('summaryText');
        if (summaryField) {
            summaryField.value = summary;
            updatePreview();
        }
    } catch (error) {
        console.error('Summary generation failed:', error);
    }
}

// AI Bullet Generator for Experience
async function generateAIBullets(expIndex) {
    const data = collectData();
    const exp = data.experience[expIndex];

    if (!exp) {
        showToast('Please fill in job title and company first');
        return;
    }

    try {
        const bullets = await aiGenerate('bullet', {
            jobTitle: exp.title || 'Professional',
            company: exp.company || 'Company'
        });

        // Find the textarea for this experience
        const entries = document.querySelectorAll('#experienceList .rb-entry');
        const entry = entries[expIndex];
        if (entry) {
            const textarea = entry.querySelector('textarea');
            if (textarea) {
                textarea.value = bullets.replace(/^• /gm, '• ');
                updatePreview();
            }
        }
    } catch (error) {
        console.error('Bullet generation failed:', error);
    }
}

// Improve current summary with AI
async function improveAISummary() {
    const summaryField = document.getElementById('summaryText');
    const currentText = summaryField?.value;

    if (!currentText || currentText.length < 20) {
        showToast('Please write a summary first (at least 20 characters)');
        return;
    }

    try {
        const improved = await aiImprove('summary', currentText);
        summaryField.value = improved;
        updatePreview();
    } catch (error) {
        console.error('Summary improvement failed:', error);
    }
}

// Quick AI Actions Panel
function renderAIActionsPanel() {
    return `
        <div class="ai-actions-panel" style="background: linear-gradient(135deg, #1E3A8A, #4338CA); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
            <h4 style="color: white; margin: 0 0 0.75rem;"><i class="fas fa-magic"></i> AI Quick Actions</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                <button onclick="generateAISummary()" class="ai-action-btn" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-pen"></i> Generate Summary
                </button>
                <button onclick="improveAISummary()" class="ai-action-btn" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-level-up-alt"></i> Improve Summary
                </button>
                <button onclick="generateAIBullets(0)" class="ai-action-btn" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-list"></i> Generate Bullets
                </button>
                <button onclick="openHeatmapView()" class="ai-action-btn" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-fire"></i> View Heatmap
                </button>
            </div>
        </div>
    `;
}

// ============================================================
// PHASE 3.7: RESUME COMPARISON
// ============================================================

// Compare two resume versions
function compareResumes(resumeA, resumeB) {
    const comparison = {
        overall: { a: 0, b: 0, winner: null },
        sections: {},
        improvements: [],
        regressions: []
    };

    // Calculate scores for both
    const scoreA = calculateResumeScore(resumeA);
    const scoreB = calculateResumeScore(resumeB);

    comparison.overall.a = scoreA.overall;
    comparison.overall.b = scoreB.overall;
    comparison.overall.winner = scoreA.overall > scoreB.overall ? 'A' :
        scoreB.overall > scoreA.overall ? 'B' : 'Tie';
    comparison.overall.difference = Math.abs(scoreA.overall - scoreB.overall);

    // Compare each section
    for (const [key, scoreAValue] of Object.entries(scoreA.breakdown)) {
        const scoreBValue = scoreB.breakdown[key];
        const diff = scoreBValue - scoreAValue;

        comparison.sections[key] = {
            a: scoreAValue,
            b: scoreBValue,
            diff: diff,
            improved: diff > 0
        };

        if (diff > 5) {
            comparison.improvements.push({
                section: key,
                change: `+${diff}%`,
                message: `${formatScoreLabel(key)} improved from ${scoreAValue}% to ${scoreBValue}%`
            });
        } else if (diff < -5) {
            comparison.regressions.push({
                section: key,
                change: `${diff}%`,
                message: `${formatScoreLabel(key)} dropped from ${scoreAValue}% to ${scoreBValue}%`
            });
        }
    }

    // Content changes
    comparison.contentChanges = {
        summaryChanged: resumeA.summary !== resumeB.summary,
        skillsChanged: resumeA.skills !== resumeB.skills,
        experienceCountChange: (resumeB.experience?.length || 0) - (resumeA.experience?.length || 0),
        educationCountChange: (resumeB.education?.length || 0) - (resumeA.education?.length || 0)
    };

    return comparison;
}

// Render comparison UI
function renderComparisonView(comparison) {
    const getChangeColor = (diff) => diff > 0 ? '#10B981' : diff < 0 ? '#EF4444' : '#6B7280';
    const getChangeIcon = (diff) => diff > 0 ? '↑' : diff < 0 ? '↓' : '–';

    return `
        <div class="comparison-container">
            <div class="comparison-header" style="text-align: center; margin-bottom: 1.5rem;">
                <h4 style="margin: 0;"><i class="fas fa-columns"></i> Resume Version Comparison</h4>
                <p style="color: var(--rb-text-light); font-size: 0.85rem; margin: 0.5rem 0 0;">Before vs After Analysis</p>
            </div>

            <div class="comparison-overall" style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1.5rem;">
                <div style="text-align: center; padding: 1rem; background: ${comparison.overall.winner === 'A' ? '#ECFDF5' : 'var(--rb-bg)'}; border-radius: 10px; min-width: 100px;">
                    <div style="font-size: 0.8rem; color: var(--rb-text-light); margin-bottom: 0.5rem;">Version A</div>
                    <div style="font-size: 2rem; font-weight: 700; color: ${comparison.overall.winner === 'A' ? '#10B981' : 'var(--rb-text)'};">${comparison.overall.a}</div>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 1.5rem; color: var(--rb-text-light);">vs</div>
                    ${comparison.overall.difference > 0 ? `
                        <div style="font-size: 0.8rem; color: ${comparison.overall.winner === 'B' ? '#10B981' : '#EF4444'}; font-weight: 600;">
                            ${comparison.overall.winner === 'B' ? '+' : '-'}${comparison.overall.difference} pts
                        </div>
                    ` : ''}
                </div>
                <div style="text-align: center; padding: 1rem; background: ${comparison.overall.winner === 'B' ? '#ECFDF5' : 'var(--rb-bg)'}; border-radius: 10px; min-width: 100px;">
                    <div style="font-size: 0.8rem; color: var(--rb-text-light); margin-bottom: 0.5rem;">Version B</div>
                    <div style="font-size: 2rem; font-weight: 700; color: ${comparison.overall.winner === 'B' ? '#10B981' : 'var(--rb-text)'};">${comparison.overall.b}</div>
                </div>
            </div>

            <div class="comparison-breakdown" style="margin-bottom: 1.5rem;">
                <h5 style="margin: 0 0 0.75rem;"><i class="fas fa-chart-bar"></i> Section Breakdown</h5>
                ${Object.entries(comparison.sections).map(([key, data]) => `
                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--rb-border);">
                        <span style="width: 140px; font-size: 0.85rem;">${formatScoreLabel(key)}</span>
                        <span style="width: 50px; text-align: right; font-size: 0.85rem; color: var(--rb-text-light);">${data.a}%</span>
                        <span style="flex: 1; text-align: center;">→</span>
                        <span style="width: 50px; text-align: left; font-size: 0.85rem; color: var(--rb-text-light);">${data.b}%</span>
                        <span style="width: 60px; text-align: right; font-weight: 600; color: ${getChangeColor(data.diff)};">
                            ${getChangeIcon(data.diff)} ${Math.abs(data.diff)}%
                        </span>
                    </div>
                `).join('')}
            </div>

            ${comparison.improvements.length > 0 ? `
                <div class="comparison-improvements" style="background: #ECFDF5; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h5 style="margin: 0 0 0.5rem; color: #065F46;"><i class="fas fa-arrow-up"></i> Improvements</h5>
                    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem; color: #047857;">
                        ${comparison.improvements.map(i => `<li>${i.message}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${comparison.regressions.length > 0 ? `
                <div class="comparison-regressions" style="background: #FEF2F2; padding: 1rem; border-radius: 8px;">
                    <h5 style="margin: 0 0 0.5rem; color: #991B1B;"><i class="fas fa-arrow-down"></i> Regressions</h5>
                    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem; color: #B91C1C;">
                        ${comparison.regressions.map(r => `<li>${r.message}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================================
// PHASE 3.8: INDUSTRY TARGETING
// ============================================================

// Industry-specific optimization profiles
const INDUSTRY_PROFILES = {
    tech: {
        name: 'Technology / Software',
        icon: '💻',
        keywords: ['agile', 'scrum', 'api', 'cloud', 'saas', 'devops', 'ci/cd', 'microservices'],
        preferredVerbs: ['developed', 'engineered', 'automated', 'scaled', 'optimized', 'deployed'],
        summaryStyle: 'technical',
        tips: [
            'Include GitHub/portfolio links prominently',
            'List technologies with version numbers where relevant',
            'Quantify impact with performance metrics (latency, uptime, scale)',
            'Emphasize open source contributions if any'
        ]
    },
    finance: {
        name: 'Finance / Banking',
        icon: '💰',
        keywords: ['financial modeling', 'valuation', 'dcf', 'lbo', 'm&a', 'due diligence', 'bloomberg', 'excel'],
        preferredVerbs: ['analyzed', 'modeled', 'structured', 'advised', 'executed', 'managed'],
        summaryStyle: 'conservative',
        tips: [
            'Lead with deal experience and transaction values',
            'Education section should be prominent (MBA, CFA, CPA)',
            'Use conservative formatting - serif fonts acceptable',
            'Quantify with $ amounts, % returns, deal sizes'
        ]
    },
    consulting: {
        name: 'Consulting',
        icon: '📊',
        keywords: ['strategy', 'stakeholder', 'implementation', 'change management', 'process improvement'],
        preferredVerbs: ['led', 'advised', 'transformed', 'delivered', 'drove', 'facilitated'],
        summaryStyle: 'impact',
        tips: [
            'Structure bullets as: Action → Result → Impact',
            'Include client industries served (without naming clients)',
            'Emphasize team size led and project values',
            'Highlight cross-functional collaboration'
        ]
    },
    healthcare: {
        name: 'Healthcare',
        icon: '🏥',
        keywords: ['patient care', 'hipaa', 'clinical', 'ehr', 'compliance', 'regulatory'],
        preferredVerbs: ['coordinated', 'administered', 'treated', 'diagnosed', 'implemented', 'trained'],
        summaryStyle: 'professional',
        tips: [
            'Include all relevant certifications prominently',
            'Emphasize patient outcomes and satisfaction scores',
            'Highlight compliance and safety achievements',
            'Include EMR/EHR system experience'
        ]
    },
    sales: {
        name: 'Sales / Business Development',
        icon: '📈',
        keywords: ['quota', 'revenue', 'pipeline', 'prospecting', 'negotiation', 'closing'],
        preferredVerbs: ['generated', 'exceeded', 'closed', 'expanded', 'negotiated', 'grew'],
        summaryStyle: 'impact',
        tips: [
            'Lead with quota achievement percentages',
            'Include total revenue generated',
            'Highlight deal sizes and client logos if permitted',
            'Show progression in territory/account size'
        ]
    },
    marketing: {
        name: 'Marketing / Creative',
        icon: '🎨',
        keywords: ['brand', 'campaign', 'roi', 'engagement', 'conversion', 'content', 'social media'],
        preferredVerbs: ['launched', 'created', 'grew', 'increased', 'designed', 'executed'],
        summaryStyle: 'creative',
        tips: [
            'Include portfolio link or QR code',
            'Quantify campaign performance (impressions, conversions, ROI)',
            'Mention tools and platforms used',
            'Design can be more creative but still professional'
        ]
    }
};

// Analyze resume against industry profile
function analyzeIndustryFit(resumeData, industryKey) {
    const profile = INDUSTRY_PROFILES[industryKey];
    if (!profile) return null;

    const resumeText = (
        (resumeData.summary || '') + ' ' +
        (resumeData.skills || '') + ' ' +
        resumeData.experience.map(e => e.description || '').join(' ')
    ).toLowerCase();

    const analysis = {
        industry: profile.name,
        icon: profile.icon,
        keywordMatch: { found: [], missing: [] },
        verbMatch: { found: [], weak: [] },
        score: 0,
        tips: profile.tips,
        recommendations: []
    };

    // Check keywords
    profile.keywords.forEach(kw => {
        if (resumeText.includes(kw.toLowerCase())) {
            analysis.keywordMatch.found.push(kw);
        } else {
            analysis.keywordMatch.missing.push(kw);
        }
    });

    // Check verbs
    profile.preferredVerbs.forEach(verb => {
        const regex = new RegExp('\\b' + verb + '\\w*\\b', 'gi');
        if (regex.test(resumeText)) {
            analysis.verbMatch.found.push(verb);
        }
    });

    // Find weak verbs
    WEAK_VERBS.forEach(verb => {
        if (resumeText.includes(verb)) {
            analysis.verbMatch.weak.push(verb);
        }
    });

    // Calculate industry fit score
    const keywordScore = (analysis.keywordMatch.found.length / profile.keywords.length) * 40;
    const verbScore = (analysis.verbMatch.found.length / profile.preferredVerbs.length) * 30;
    const weakVerbPenalty = Math.min(20, analysis.verbMatch.weak.length * 5);

    analysis.score = Math.round(Math.max(0, keywordScore + verbScore + 30 - weakVerbPenalty));

    // Generate recommendations
    if (analysis.keywordMatch.missing.length > 0) {
        analysis.recommendations.push({
            priority: 'high',
            text: `Add industry keywords: ${analysis.keywordMatch.missing.slice(0, 3).join(', ')}`
        });
    }

    if (analysis.verbMatch.weak.length > 0) {
        analysis.recommendations.push({
            priority: 'medium',
            text: `Replace weak verbs like "${analysis.verbMatch.weak[0]}" with stronger alternatives`
        });
    }

    if (analysis.verbMatch.found.length < 3) {
        analysis.recommendations.push({
            priority: 'medium',
            text: `Use more industry-preferred verbs: ${profile.preferredVerbs.slice(0, 3).join(', ')}`
        });
    }

    return analysis;
}

// Render industry targeting UI
function renderIndustryTargeting(analysis) {
    const getScoreColor = (score) => {
        if (score >= 70) return '#10B981';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
    };

    return `
        <div class="industry-targeting">
            <div class="industry-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="font-size: 2.5rem;">${analysis.icon}</div>
                <div>
                    <h4 style="margin: 0;">${analysis.industry} Fit Analysis</h4>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                        <div style="width: 100px; height: 8px; background: #E5E7EB; border-radius: 4px;">
                            <div style="width: ${analysis.score}%; height: 100%; background: ${getScoreColor(analysis.score)}; border-radius: 4px;"></div>
                        </div>
                        <span style="font-weight: 600; color: ${getScoreColor(analysis.score)};">${analysis.score}%</span>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: #ECFDF5; padding: 1rem; border-radius: 8px;">
                    <h5 style="margin: 0 0 0.5rem; color: #065F46;"><i class="fas fa-check"></i> Keywords Found (${analysis.keywordMatch.found.length})</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                        ${analysis.keywordMatch.found.map(kw => `<span style="background: #10B981; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${kw}</span>`).join('')}
                    </div>
                </div>
                <div style="background: #FEF2F2; padding: 1rem; border-radius: 8px;">
                    <h5 style="margin: 0 0 0.5rem; color: #991B1B;"><i class="fas fa-times"></i> Missing Keywords (${analysis.keywordMatch.missing.length})</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                        ${analysis.keywordMatch.missing.map(kw => `<span style="background: #EF4444; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${kw}</span>`).join('')}
                    </div>
                </div>
            </div>

            ${analysis.recommendations.length > 0 ? `
                <div style="background: var(--rb-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <h5 style="margin: 0 0 0.75rem;"><i class="fas fa-bullseye"></i> Recommendations</h5>
                    ${analysis.recommendations.map(r => `
                        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid var(--rb-border);">
                            <span style="background: ${r.priority === 'high' ? '#EF4444' : '#F59E0B'}; color: white; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase;">${r.priority}</span>
                            <span style="font-size: 0.85rem;">${r.text}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div style="background: linear-gradient(135deg, var(--rb-primary), #4338CA); color: white; padding: 1rem; border-radius: 8px;">
                <h5 style="margin: 0 0 0.75rem;"><i class="fas fa-lightbulb"></i> Industry Tips</h5>
                <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem; opacity: 0.95;">
                    ${analysis.tips.map(tip => `<li style="margin-bottom: 0.5rem;">${tip}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

// Open industry targeting modal
function openIndustryTargeting(industryKey = 'tech') {
    const data = collectData();
    const analysis = analyzeIndustryFit(data, industryKey);

    if (!analysis) {
        showToast('Invalid industry selected');
        return;
    }

    const container = document.getElementById('aiScoreContent');
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Select Target Industry</label>
            <select id="industrySelect" onchange="openIndustryTargeting(this.value)" style="width: 100%; padding: 0.75rem; border: 1px solid var(--rb-border); border-radius: 8px; font-size: 0.9rem; background: var(--rb-card); color: var(--rb-text);">
                ${Object.entries(INDUSTRY_PROFILES).map(([key, profile]) =>
        `<option value="${escapeHtml(key)}" ${key === industryKey ? 'selected' : ''}>${profile.icon} ${escapeHtml(profile.name)}</option>`
    ).join('')}
            </select>
        </div>
        ${renderIndustryTargeting(analysis)}
    `;
    const modal = ensureScoreModal();
    modal.style.display = 'flex';
}

// Initialize AI on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAIConfig();
});
