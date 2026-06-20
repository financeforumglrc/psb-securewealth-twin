/**
 * DS Financial API Client SDK
 * JavaScript SDK for Patent-Protected APIs
 * Version: 2.0.0
 */

class DSFinancialAPI {
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'http://localhost:5000/api/v1';
        this.apiKey = config.apiKey || null;
        this.token = config.token || localStorage.getItem('ds_auth_token') || null;
        this.refreshToken = config.refreshToken || localStorage.getItem('ds_refresh_token') || null;
        this.timeout = config.timeout || 30000;
        this.retries = config.retries || 3;
        this.patentsUsed = new Set();
        this.apiCalls = 0;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }

        const config = {
            method: options.method || 'GET',
            headers,
            signal: AbortSignal.timeout(this.timeout)
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        let lastError;
        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const response = await fetch(url, config);
                const data = await response.json();

                if (data.patent) this.patentsUsed.add(data.patent);
                if (data.patents) data.patents.forEach(p => this.patentsUsed.add(p));
                this.apiCalls++;

                if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
                    await this.refreshAccessToken();
                    headers['Authorization'] = `Bearer ${this.token}`;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(data.error || `HTTP ${response.status}`);
                }

                return data;
            } catch (error) {
                lastError = error;
                if (attempt < this.retries) {
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                }
            }
        }

        throw lastError;
    }

    async register(email, password, name, phone) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: { email, password, name, phone }
        });
        if (data.success && data.data.tokens) {
            this.token = data.data.tokens.accessToken;
            this.refreshToken = data.data.tokens.refreshToken;
            localStorage.setItem('ds_auth_token', this.token);
            localStorage.setItem('ds_refresh_token', this.refreshToken);
        }
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        if (data.success && data.data.tokens) {
            this.token = data.data.tokens.accessToken;
            this.refreshToken = data.data.tokens.refreshToken;
            localStorage.setItem('ds_auth_token', this.token);
            localStorage.setItem('ds_refresh_token', this.refreshToken);
        }
        return data;
    }

    async refreshAccessToken() {
        if (!this.refreshToken) return false;
        try {
            const data = await this.request('/auth/refresh', {
                method: 'POST',
                body: { refreshToken: this.refreshToken }
            });
            if (data.success) {
                this.token = data.data.accessToken;
                localStorage.setItem('ds_auth_token', this.token);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        return false;
    }

    logout() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('ds_auth_token');
        localStorage.removeItem('ds_refresh_token');
    }

    isAuthenticated() {
        return !!this.token;
    }

    // PAT-001: GSTIN Validator
    async validateGSTIN(gstin, context = {}) {
        return this.request('/gst/validate-gstin', {
            method: 'POST',
            body: { gstin, context }
        });
    }

    // PAT-002: ITC Risk Scanner
    async analyzeITCRisk(purchaseData, gstr2bData = []) {
        return this.request('/gst/analyze-itc-risk', {
            method: 'POST',
            body: { purchaseData, gstr2bData }
        });
    }

    // PAT-003: Shell Company Detector
    async detectShellCompanies(invoiceData) {
        return this.request('/gst/detect-shell-companies', {
            method: 'POST',
            body: { invoiceData }
        });
    }

    // PAT-004: Tax Optimizer
    async calculateIncomeTax(profile) {
        return this.request('/tax/calculate-income-tax', {
            method: 'POST',
            body: profile
        });
    }

    async optimizeTaxes(profile) {
        return this.request('/tax/optimize', {
            method: 'POST',
            body: profile
        });
    }

    async calculateHRA(basicSalary, hraReceived, rentPaid, cityType = 'metro') {
        return this.request('/tax/calculate-hra', {
            method: 'POST',
            body: { basicSalary, hraReceived, rentPaid, cityType }
        });
    }

    async getTaxSlabs(year = '2025-26') {
        return this.request(`/tax/slabs/${year}`);
    }

    // PAT-005: Tax Rate Verifier
    async verifyTaxRates(invoices) {
        return this.request('/gst/verify-rates', {
            method: 'POST',
            body: { invoices }
        });
    }

    // PAT-006: ITC Recovery Predictor
    async predictITCRecovery(purchaseData, gstr2bData = []) {
        return this.request('/gst/predict-itc-recovery', {
            method: 'POST',
            body: { purchaseData, gstr2bData }
        });
    }

    // Comprehensive GST Analysis
    async comprehensiveGSTAnalysis(data) {
        return this.request('/gst/comprehensive-analysis', {
            method: 'POST',
            body: data
        });
    }

    // PAT-007: AI Orchestrator
    async askAI(question, context = {}, provider = null) {
        return this.request('/ai/ask', {
            method: 'POST',
            body: { question, context, provider }
        });
    }

    async summarizeDocument(document, maxLength = 500) {
        return this.request('/ai/summarize', {
            method: 'POST',
            body: { document, maxLength }
        });
    }

    async analyzeTaxScenario(scenario, income, investments = {}, deductions = {}) {
        return this.request('/ai/analyze-tax-scenario', {
            method: 'POST',
            body: { scenario, income, investments, deductions }
        });
    }

    async getAIProviders() {
        return this.request('/ai/providers');
    }

    // Documents
    async generateInvoice(invoiceData) {
        return this.request('/documents/generate-invoice', {
            method: 'POST',
            body: invoiceData
        });
    }

    async generateReport(type, data, format = 'json') {
        return this.request('/documents/generate-report', {
            method: 'POST',
            body: { type, data, format }
        });
    }

    // Analytics
    async getUsageAnalytics(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request(`/analytics/usage?${params}`);
    }

    async getPatentAnalytics() {
        return this.request('/analytics/patents');
    }

    async getDashboard() {
        return this.request('/analytics/dashboard');
    }

    async getPatents() {
        return this.request('/patents');
    }

    getPatentsUsed() {
        return Array.from(this.patentsUsed);
    }

    getAPICallCount() {
        return this.apiCalls;
    }

    async healthCheck() {
        return this.request('/health');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DSFinancialAPI;
}
if (typeof window !== 'undefined') {
    window.DSFinancialAPI = DSFinancialAPI;
}
