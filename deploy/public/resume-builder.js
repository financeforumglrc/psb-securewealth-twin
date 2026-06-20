/**
 * Resume Builder V2 - Core Logic
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

class ResumeBuilder {
    constructor() {
        // Core State
        this.state = {
            personal: {
                fullName: '',
                jobTitle: '',
                email: '',
                phone: '',
                location: '',
                website: '',
                photo: null
            },
            summary: '',
            experience: [],
            education: [],
            skills: '',
            projects: [],
            certifications: [],
            meta: {
                template: 'executive', // Default template
                accentColor: '#3b82f6',
                fontFamily: 'Inter',
                zoom: 100
            }
        };

        // DOM Elements
        this.previewContainer = document.getElementById('resume-preview');
        this.progressBar = document.querySelector('.rb-progress-bar .fill');
        this.scoreDisplay = document.getElementById('score-display');

        // Note: init() is called manually after assignment to ensure window.rb is available
    }

    init() {
        this.setupEventListeners();
        this.setupSortables();
        // Ensure TemplateManager is ready before rendering
        if (window.templateManager) {
            console.log("TemplateManager loaded.");
        } else {
            console.warn("TemplateManager not found via window. template fallback mode.");
        }
        this.renderTemplateGrid();
        this.renderPreview();
        this.updateProgress();
    }

    // ==========================================
    // Event Handling
    // ==========================================
    setupEventListeners() {
        // Tab Switching
        document.querySelectorAll('.rb-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs and contents
                document.querySelectorAll('.rb-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.rb-tab-content').forEach(c => c.classList.remove('active'));

                // Activate clicked tab
                e.currentTarget.classList.add('active');
                const tabId = e.currentTarget.dataset.tab;
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });

        // Accordion Toggle
        window.toggleCard = (header) => {
            header.parentElement.classList.toggle('open');
        };
    }

    setupSortables() {
        // Initialize SortableJS for dynamic lists
        ['experience-list', 'education-list', 'projects-list', 'certifications-list'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                new Sortable(el, {
                    animation: 150,
                    handle: '.item-card',
                    onEnd: () => this.updateOrder(id) // Re-sync state on drop
                });
            }
        });
    }

    // ==========================================
    // State Management
    // ==========================================
    updateState(section, field, value) {
        if (section === 'personal') {
            this.state.personal[field] = value;
        } else if (section === 'summary' || section === 'skills') {
            this.state[section] = value;
        }

        // Debounce render for performance
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.renderPreview();
            this.updateProgress();
        }, 100);
    }

    updateProgress() {
        // Simple heuristic for progress and score
        let score = 0;
        const s = this.state;

        if (s.personal.fullName) score += 10;
        if (s.personal.email) score += 10;
        if (s.summary.length > 50) score += 15;
        if (s.experience.length > 0) score += 20;
        if (s.education.length > 0) score += 15;
        if (s.skills.length > 10) score += 15;
        if (s.projects.length > 0 || s.certifications.length > 0) score += 15;

        // Cap at 100
        score = Math.min(100, score);

        this.progressBar.style.width = `${score}%`;
        this.scoreDisplay.textContent = `${score}%`;
    }

    // ==========================================
    // Dynamic List Management
    // ==========================================
    generateId() { return Math.random().toString(36).substr(2, 9); }

    addExperienceItem() {
        const id = this.generateId();
        const item = { id, title: 'Job Title', company: 'Company', date: '2023 - Present', desc: '' };
        this.state.experience.push(item);
        this.renderList('experience-list', this.state.experience, 'experience');
        this.renderPreview();
    }

    addEducationItem() {
        const id = this.generateId();
        const item = { id, degree: 'Degree', school: 'University', date: '2020 - 2024' };
        this.state.education.push(item);
        this.renderList('education-list', this.state.education, 'education');
        this.renderPreview();
    }

    renderList(containerId, data, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        data.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <div class="item-actions">
                    <button class="item-btn-delete" onclick="rb.deleteItem('${type}', ${index})"><i class="fas fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>${type === 'education' ? 'School' : 'Company'}</label>
                        <input type="text" value="${escapeHtml(item.company || item.school || '')}" oninput="rb.updateItem('${type}', ${index}, '${type === 'education' ? 'school' : 'company'}', this.value)">
                    </div>
                     <div class="form-group">
                        <label>${type === 'education' ? 'Degree' : 'Title'}</label>
                        <input type="text" value="${escapeHtml(item.title || item.degree || '')}" oninput="rb.updateItem('${type}', ${index}, '${type === 'education' ? 'degree' : 'title'}', this.value)">
                    </div>
                     <div class="form-group full-width">
                        <label>Date Range</label>
                        <input type="text" value="${escapeHtml(item.date || '')}" oninput="rb.updateItem('${type}', ${index}, 'date', this.value)">
                    </div>
                     ${type === 'experience' ? `
                    <div class="form-group full-width">
                        <label>Description</label>
                        <textarea rows="3" oninput="rb.updateItem('${type}', ${index}, 'desc', this.value)">${escapeHtml(item.desc || '')}</textarea>
                    </div>` : ''}
                </div>
            `;
            container.appendChild(div);
        });
    }

    updateItem(type, index, field, value) {
        this.state[type][index][field] = value;
        this.renderPreview();
    }

    deleteItem(type, index) {
        this.state[type].splice(index, 1);
        this.renderList(`${type}-list`, this.state[type], type);
        this.renderPreview();
    }

    // ==========================================
    // Design & Templates
    // ==========================================
    setFont(family) {
        this.state.meta.fontFamily = family;
        document.querySelectorAll('.font-btn').forEach(b => {
            b.classList.toggle('active', b.textContent.includes(family.split(' ')[0]));
        });
        this.renderPreview();
    }

    setAccent(color) {
        this.state.meta.accentColor = color;
        this.renderPreview();
    }

    setTemplate(templateId) {
        this.state.meta.template = templateId;
        this.renderTemplateGrid(); // Update active state
        this.renderPreview();
    }

    renderTemplateGrid() {
        const grid = document.getElementById('template-grid');
        let templates = [];

        // Dummy State for Thumbnails
        const dummyState = {
            personal: { fullName: 'John Doe', jobTitle: 'Expert', photo: '', email: 'j@d.com', phone: '123-456-7890', location: 'NY' },
            summary: 'Passionate professional with 5+ years of experience in high-impact projects.',
            experience: [{ title: 'Senior Dev', company: 'Tech Corp', date: '2020-Present', desc: 'Led team of 5 developers.' }],
            education: [{ degree: 'B.Sc. CS', school: 'University', date: '2016-2020' }],
            skills: 'JavaScript, React, Node.js, Design',
            meta: { accentColor: this.state.meta.accentColor, fontFamily: this.state.meta.fontFamily }
        };

        // Use TemplateManager if available
        if (window.templateManager) {
            templates = window.templateManager.getTemplateList();
        } else {
            // Fallback
            templates = [
                { id: 'executive', name: 'Executive Elite', previewColor: '#1f2937' },
                { id: 'creative', name: 'Creative Canvas', previewColor: '#8b5cf6' },
                { id: 'tech', name: 'Tech Pro', previewColor: '#10b981' }
            ];
        }

        grid.innerHTML = templates.map(t => {
            let thumbContent = '';
            try {
                if (window.templateManager && window.templateManager.renderThumbnailHTML) {
                    // Render full template scaled down
                    const fullHtml = window.templateManager.renderThumbnailHTML(t.id, dummyState);
                    if (!fullHtml) throw new Error("Empty HTML returned");
                    thumbContent = `
                        <div style="transform: scale(0.2); transform-origin: top left; width: 500%; height: 500%; overflow:hidden; pointer-events:none; background:white;">
                            ${fullHtml}
                        </div>
                    `;
                } else {
                    throw new Error("TemplateManager not ready");
                }
            } catch (err) {
                console.warn(`Failed to render thumb for ${t.id}:`, err);
                // Fallback Icon
                thumbContent = `
                    <div style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; color: ${t.previewColor};">
                        <i class="fas fa-file-alt" style="font-size: 24px; margin-bottom: 8px; opacity: 0.8;"></i>
                    </div>
                `;
            }

            return `
            <div class="template-card ${this.state.meta.template === t.id ? 'active' : ''}" onclick="window.rb.setTemplate('${t.id}')" style="overflow:hidden; position:relative;">
                <div style="height: 150px; background: #fff; overflow:hidden;">
                    ${thumbContent}
                </div>
                <div style="padding: 8px; text-align: center; font-size: 11px; font-weight: bold; background: #f9fafb; border-top: 1px solid #eee;">
                    ${t.name}
                </div>
            </div>
            `;
        }).join('');
    }

    // ==========================================
    // PREVIEW RENDERER
    // ==========================================
    renderPreview() {
        const s = this.state;
        const template = s.meta.template;

        // CSS Variables Injection for Preview
        const style = `
            --resume-accent: ${s.meta.accentColor};
            --resume-font: '${s.meta.fontFamily}', sans-serif;
            --resume-text: #1f2937;
        `;
        this.previewContainer.setAttribute('style', style);

        // Template Delegate
        if (window.templateManager) {
            this.previewContainer.innerHTML = window.templateManager.render(template, s);
        } else {
            // Fallback
            switch (template) {
                case 'creative': this.previewContainer.innerHTML = this.renderCreativeTemplate(s); break;
                case 'tech': this.previewContainer.innerHTML = this.renderTechTemplate(s); break;
                default: this.previewContainer.innerHTML = this.renderExecutiveTemplate(s); break;
            }
        }
    }

    // --- Template 1: Executive Elite ---
    renderExecutiveTemplate(s) {
        return `
            <div class="tpl-exec">
                <style>
                    .tpl-exec { padding: 40px; font-family: var(--resume-font); color: var(--resume-text); line-height: 1.6; }
                    .tpl-exec-header { border-bottom: 2px solid var(--resume-accent); padding-bottom: 20px; margin-bottom: 30px; }
                    .tpl-exec-name { font-size: 32px; font-weight: 700; color: var(--resume-accent); text-transform: uppercase; margin: 0; }
                    .tpl-exec-title { font-size: 18px; color: #666; margin-top: 5px; }
                    .tpl-exec-contact { margin-top: 15px; font-size: 14px; display: flex; gap: 15px; color: #555; }
                    .tpl-exec-section { margin-bottom: 25px; }
                    .tpl-exec-heading { font-size: 16px; font-weight: 700; text-transform: uppercase; border-left: 4px solid var(--resume-accent); padding-left: 10px; margin-bottom: 15px; letter-spacing: 1px; }
                    .tpl-exec-item { margin-bottom: 15px; }
                    .tpl-exec-item-header { display: flex; justify-content: space-between; font-weight: 600; }
                    .tpl-exec-company { font-weight: 700; }
                    .tpl-exec-date { font-size: 14px; color: #666; }
                    .tpl-exec-desc { font-size: 14px; margin-top: 5px; color: #444; white-space: pre-line; }
                </style>

                <div class="tpl-exec-header">
                    <h1 class="tpl-exec-name">${escapeHtml(s.personal.fullName) || 'YOUR NAME'}</h1>
                    <div class="tpl-exec-title">${escapeHtml(s.personal.jobTitle) || 'Professional Title'}</div>
                    <div class="tpl-exec-contact">
                        <span>${escapeHtml(s.personal.email) || 'email@example.com'}</span>
                        <span>•</span>
                        <span>${escapeHtml(s.personal.phone) || 'Phone'}</span>
                        <span>•</span>
                        <span>${escapeHtml(s.personal.location) || 'Location'}</span>
                    </div>
                </div>

                ${s.summary ? `
                <div class="tpl-exec-section">
                    <div class="tpl-exec-heading">Professional Profile</div>
                    <div style="font-size: 14px;">${escapeHtml(s.summary)}</div>
                </div>` : ''}

                ${s.experience.length ? `
                <div class="tpl-exec-section">
                    <div class="tpl-exec-heading">Experience</div>
                    ${s.experience.map(job => `
                        <div class="tpl-exec-item">
                            <div class="tpl-exec-item-header">
                                <span class="tpl-exec-company">${escapeHtml(job.company)}</span>
                                <span class="tpl-exec-date">${escapeHtml(job.date)}</span>
                            </div>
                            <div>${escapeHtml(job.title)}</div>
                            <div class="tpl-exec-desc">${escapeHtml(job.desc)}</div>
                        </div>
                    `).join('')}
                </div>` : ''}

                ${s.education.length ? `
                <div class="tpl-exec-section">
                    <div class="tpl-exec-heading">Education</div>
                    ${s.education.map(edu => `
                        <div class="tpl-exec-item">
                            <div class="tpl-exec-item-header">
                                <span class="tpl-exec-company">${escapeHtml(edu.school)}</span>
                                <span class="tpl-exec-date">${escapeHtml(edu.date)}</span>
                            </div>
                            <div>${escapeHtml(edu.degree)}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
            </div>
        `;
    }

    // --- Template 2: Creative Canvas ---
    renderCreativeTemplate(s) {
        return `
            <div class="tpl-creative">
                <style>
                    .tpl-creative { display: grid; grid-template-columns: 35% 65%; min-height: 100%; font-family: var(--resume-font); }
                    .tpl-creative-sidebar { background: var(--resume-accent); color: white; padding: 40px 20px; text-align: center; }
                    .tpl-creative-main { padding: 40px; }
                    
                    .tpl-c-photo { width: 150px; height: 150px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); margin-bottom: 20px; object-fit: cover; }
                    .tpl-c-name { font-size: 28px; font-weight: 700; line-height: 1.2; margin-bottom: 10px; }
                    .tpl-c-title { font-size: 16px; opacity: 0.9; margin-bottom: 30px; font-weight: 300; }
                    
                    .tpl-c-contact-item { font-size: 13px; margin-bottom: 10px; opacity: 0.9; }
                    .tpl-c-skills { margin-top: 40px; text-align: left; }
                    .tpl-c-skill-tag { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }

                    .tpl-c-heading { font-size: 20px; font-weight: 700; color: var(--resume-accent); border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 20px; text-transform: uppercase; }
                    .tpl-c-item { margin-bottom: 25px; position: relative; padding-left: 20px; border-left: 2px solid #eee; }
                    .tpl-c-item::before { content: ''; position: absolute; left: -6px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--resume-accent); }
                    .tpl-c-job-title { font-weight: 700; font-size: 16px; }
                    .tpl-c-company { color: #666; font-size: 14px; }
                </style>

                <div class="tpl-creative-sidebar">
                    ${s.personal.photo ? `<img src="${escapeHtml(s.personal.photo)}" class="tpl-c-photo">` : '<div class="tpl-c-photo" style="background:rgba(255,255,255,0.1); display:inline-flex; align-items:center; justify-content:center;"><i class="fas fa-user" style="font-size:40px;"></i></div>'}
                    <div class="tpl-c-name">${escapeHtml(s.personal.fullName) || 'Your Name'}</div>
                    <div class="tpl-c-title">${escapeHtml(s.personal.jobTitle) || 'Creative Professional'}</div>
                    
                    <div class="tpl-c-contact">
                        <div class="tpl-c-contact-item"><i class="fas fa-envelope"></i> ${escapeHtml(s.personal.email)}</div>
                        <div class="tpl-c-contact-item"><i class="fas fa-phone"></i> ${escapeHtml(s.personal.phone)}</div>
                        <div class="tpl-c-contact-item"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(s.personal.location)}</div>
                    </div>

                    ${s.skills ? `
                    <div class="tpl-c-skills">
                        <h4 style="border-bottom:1px solid rgba(255,255,255,0.3); padding-bottom:5px; margin-bottom:10px;">SKILLS</h4>
                        ${s.skills.split(',').map(sk => `<span class="tpl-c-skill-tag">${escapeHtml(sk.trim())}</span>`).join('')}
                    </div>` : ''}
                </div>

                <div class="tpl-creative-main">
                    ${s.summary ? `
                    <div style="margin-bottom:30px;">
                        <div class="tpl-c-heading">Profile</div>
                        <p style="color:#444; line-height:1.6;">${s.summary}</p>
                    </div>` : ''}

                     ${s.experience.length ? `
                    <div style="margin-bottom:30px;">
                        <div class="tpl-c-heading">Experience</div>
                        ${s.experience.map(job => `
                            <div class="tpl-c-item">
                                <div class="tpl-c-job-title">${job.title}</div>
                                <div class="tpl-c-company">${job.company} | ${job.date}</div>
                                <p style="font-size:14px; margin-top:5px; color:#555;">${job.desc}</p>
                            </div>
                        `).join('')}
                    </div>` : ''}
                </div>
            </div>
       `;
    }

    // --- Template 3: Tech Pro ---
    renderTechTemplate(s) {
        // Minimalist, efficient, similar to Latex/Markdown style
        return `
            <div class="tpl-tech">
                <style>
                    .tpl-tech { padding: 40px; font-family: 'Roboto Mono', monospace; color: #333; }
                    .tpl-tech-header { margin-bottom: 20px; }
                    .tpl-tech-name { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
                    .tpl-tech-meta { font-size: 12px; color: #666; margin-top: 5px; }
                    .tpl-tech-section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin: 20px 0 15px 0; }
                    .tpl-tech-item { margin-bottom: 12px; }
                    .tpl-tech-row { display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; }
                </style>

                <div class="tpl-tech-header">
                    <div class="tpl-tech-name">${escapeHtml(s.personal.fullName) || 'DEV_NAME'}</div>
                    <div class="tpl-tech-meta">
                        ${escapeHtml(s.personal.email)} // ${escapeHtml(s.personal.phone)} // ${escapeHtml(s.personal.website)} // ${escapeHtml(s.personal.location)}
                    </div>
                </div>

                 ${s.skills ? `
                <div>
                     <div class="tpl-tech-section-title">Technical Skills</div>
                     <div style="font-size:13px;">${escapeHtml(s.skills)}</div>
                </div>` : ''}

                ${s.experience.length ? `
                <div>
                     <div class="tpl-tech-section-title">Experience</div>
                     ${s.experience.map(job => `
                        <div class="tpl-tech-item">
                            <div class="tpl-tech-row">
                                <span>${escapeHtml(job.company)} - ${escapeHtml(job.title)}</span>
                                <span>${escapeHtml(job.date)}</span>
                            </div>
                            <div style="font-size:13px; margin-top:2px;">${escapeHtml(job.desc)}</div>
                        </div>
                     `).join('')}
                </div>` : ''}
            </div>
        `;
    }

    // ==========================================
    // EXPORT
    // ==========================================
    exportPDF() {
        // Use html2canvas + jsPDF
        const element = this.previewContainer;

        // Temporarily remove scale/zoom for capture
        const opt = {
            margin: 0,
            filename: `${this.state.personal.fullName || 'resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // This is a simplified call; needs the html2pdf library or manual implementation
        // Since we have window.html2pdf in the head:
        if (window.html2pdf) {
            html2pdf().set(opt).from(element).save();
        } else {
            alert('PDF Library loading...');
        }
    }
}

// Global Instance
window.rb = new ResumeBuilder();
// Initialize AFTER assignment so window.rb is available for TemplateManager
window.rb.init();

// ==========================================
// Global Wrapper Functions (for HTML click handlers)
// ==========================================
function addExperienceItem() { window.rb.addExperienceItem(); }
function addEducationItem() { window.rb.addEducationItem(); }
function setFont(f) { window.rb.setFont(f); }
function setAccent(c) { window.rb.setAccent(c); }
function exportResume() { window.rb.exportPDF(); }
function setView(v) {
    // Toggle mobile class on preview container
    const p = document.querySelector('.preview-canvas-wrapper');
    if (v === 'mobile') p.style.width = '375px';
    else p.style.width = '100%';
}
function setZoom(lvl) {
    const el = document.getElementById('resume-preview');
    el.style.transform = `scale(${lvl})`;
}

// Photo Upload Handling
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            window.rb.state.personal.photo = event.target.result;
            document.getElementById('photo-preview').innerHTML = `<img src="${escapeHtml(event.target.result)}">`;
            window.rb.renderPreview();
        }
        reader.readAsDataURL(file);
    }
}

// ==========================================
// AI Feature Implementation
// ==========================================

// Initialize AI on load
document.addEventListener('DOMContentLoaded', () => {
    if (window.loadAIConfig) window.loadAIConfig();

    // Populate Settings Modal
    if (window.aiConfig) {
        document.getElementById('aiProvider').value = window.aiConfig.activeProvider || 'groq';
        document.getElementById('aiApiKey').value = window.aiConfig.keys[window.aiConfig.activeProvider] || '';
    }
});

// Save Settings
function saveAISettings() {
    const provider = document.getElementById('aiProvider').value;
    const key = document.getElementById('aiApiKey').value;

    if (!window.aiConfig) window.aiConfig = { keys: {}, models: {} };

    window.aiConfig.activeProvider = provider;
    window.aiConfig.keys[provider] = key;

    if (window.saveAIConfig) window.saveAIConfig();

    alert(`Settings saved! Using ${provider.toUpperCase()}`);
    closeAISettings();
}

// Update settings UI when provider changes
document.getElementById('aiProvider')?.addEventListener('change', (e) => {
    const provider = e.target.value;
    if (window.aiConfig && window.aiConfig.keys) {
        document.getElementById('aiApiKey').value = window.aiConfig.keys[provider] || '';
    }
});

async function triggerAI(field) {
    const btn = event.target;
    // const originalIcon = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
    btn.disabled = true;

    try {
        let prompt = "";
        const s = window.rb.state;

        if (field === 'summary') {
            prompt = `Write a professional resume summary for a ${s.personal.jobTitle || 'Professional'} named ${s.personal.fullName}. 
            Key skills: ${s.skills}. Experience count: ${s.experience.length} jobs. 
            Tone: Professional, Impactful, Concise (max 50 words).`;
        } else if (field === 'skills') {
            prompt = `Suggest a list of comma-separated technical and soft skills for a ${s.personal.jobTitle || 'Professional'}. 
            Based on these previous roles: ${s.experience.map(e => e.title).join(', ')}. 
            Output ONLY the comma separated list.`;
        } else if (field.startsWith('exp_desc_')) {
            // Future: Enhance specific job description
            const index = parseInt(field.split('_')[2]);
            const job = s.experience[index];
            prompt = `Rewrite these bullet points for a ${job.title} role to be more results-oriented and use action verbs: 
            "${job.desc}". Keep it concise.`;
        }

        const result = await callAI(prompt);

        if (result) {
            if (field === 'summary') {
                window.rb.updateState('summary', null, result);
                document.getElementById('summary').value = result;
            } else if (field === 'skills') {
                // specific logic for skills to append or replace? Let's replace for now or append if empty
                const current = document.getElementById('skills').value;
                const final = current ? `${current}, ${result}` : result;
                window.rb.updateState('skills', null, final);
                document.getElementById('skills').value = final;
            }
        }

        btn.innerHTML = '<i class="fas fa-check"></i> Done';

    } catch (err) {
        console.error(err);
        alert("AI Error: " + err.message);
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
    }

    setTimeout(() => {
        btn.disabled = false;
        if (field === 'summary') btn.innerHTML = '<i class="fas fa-magic"></i> AI Write';
        else btn.innerHTML = '<i class="fas fa-lightbulb"></i> Suggest';
    }, 2000);
}

async function analyzeResume() {
    const btn = event.target;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    try {
        const s = window.rb.state;
        const resumeText = JSON.stringify(s); // Send structured data
        const prompt = `Analyze this resume JSON data: ${resumeText}. 
        Provide a score out of 100 and 3 specific improvements. 
        Format: "Score: XX\n1. Tip 1\n2. Tip 2\n3. Tip 3"`;

        const result = await callAI(prompt);
        alert(result); // For now, simple alert. Later, custom modal.

    } catch (err) {
        alert("AI Error: " + err.message);
    }

    btn.innerHTML = 'Get Score';
}

function matchJob() {
    // Basic JD Match prompt
    const jd = prompt("Paste the Job Description here:");
    if (!jd) return;

    // We would create a new async function or generic handler here
    // For now, reuse the pattern:
    (async () => {
        try {
            const s = window.rb.state;
            const prompt = `Compare this resume (Skills: ${s.skills}, Summary: ${s.summary}) with this Job Description: "${jd.substring(0, 1000)}...". 
            Give a Match % and missing keywords.`;
            const res = await callAI(prompt);
            alert(res);
        } catch (e) { alert(e.message); }
    })();
}

// ==========================================
// Modal Handling
// ==========================================
function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'flex';
        setTimeout(() => el.classList.add('active'), 10);
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        setTimeout(() => el.style.display = 'none', 300);
    }
}

// Global Modal Wrappers
function openDashboard() { openModal('dashboardModal'); }
function closeDashboard() { closeModal('dashboardModal'); }
function openAISettings() { openModal('aiSettingsModal'); }
function closeAISettings() { closeModal('aiSettingsModal'); }

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        setTimeout(() => event.target.style.display = 'none', 300);
    }
}
