/* Shared repairs for controls on the existing tool pages. */
function togglePropertyFields() {
    document.querySelectorAll('.property-fields').forEach(el => { el.style.display = document.getElementById('hasProperty').value === 'no' ? 'none' : ''; });
}
function toggleBusinessFields() {
    document.querySelectorAll('.business-fields').forEach(el => { el.style.display = document.getElementById('businessType').value === 'none' ? 'none' : ''; });
}
function toggleDepDisabilityFields() {
    document.querySelectorAll('.dep-disability-fields').forEach(el => { el.style.display = document.getElementById('hasDepDisability').value === 'yes' ? '' : 'none'; });
}

function exportFinancialReport(format) {
    if (typeof modelData === 'undefined' || !modelData) return showToast('Run analysis first');
    if (format === 'xlsx') return exportProfessionalExcel();
    let text, mime;
    if (format === 'json') { text = JSON.stringify(modelData, null, 2); mime = 'application/json'; }
    else {
        const columns = ['Year', 'Revenue', 'EBITDA', 'EBIT', 'Net Income', 'Free Cash Flow'];
        const rows = (modelData.rev || []).map((revenue, index) => [index + 1, revenue, modelData.ebitda?.[index], modelData.ebit?.[index], modelData.ni?.[index], modelData.fcf?.[index]]);
        text = [columns, ...rows].map(row => row.map(cell => '"' + String(cell ?? '').replaceAll('"', '""') + '"').join(',')).join('\r\n');
        mime = 'text/csv';
    }
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const link = document.createElement('a'); link.href = url; link.download = 'financial-model.' + format; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function validateSingleGstin() { return checkSingleGstin(); }
function askChatbot(question) { return askChatQuestion(question); }
function analyzeSuggestion(type) { location.href = type === 'composition' ? 'gst-tools.html#composition' : 'gst-tools.html#itc-calc'; }
function implementSuggestion() { showSection('recovery'); showNotification('Review the supporting invoices before claiming any credit.', 'info'); }
function runTaxOptimization() {
    if (typeof analysisResults === 'undefined' || !analysisResults) return showNotification('Upload and analyze your purchase register first.', 'warning');
    const total = Math.max(0, Number(analysisResults.potentialSavings) || 0);
    const target = document.querySelector('.bm-optimizer-amount');
    if (target) target.textContent = '₹' + total.toLocaleString('en-IN');
    showNotification('Potential recovery from your uploaded analysis: ₹' + total.toLocaleString('en-IN') + '. Review invoice eligibility before claiming.', 'info');
}
function resolveVariance(id) {
    const note = prompt('Add a review note for variance ' + id + ':');
    if (!note?.trim()) return;
    const reviews = JSON.parse(localStorage.getItem('ds-variance-reviews') || '{}');
    reviews[id] = { note: note.trim(), reviewedAt: new Date().toISOString() };
    localStorage.setItem('ds-variance-reviews', JSON.stringify(reviews));
    showNotification('Review note saved for variance ' + id + '.', 'success');
}
function addNewEntity() {
    const name = prompt('Entity name:'); if (!name?.trim()) return;
    const gstin = prompt('Entity GSTIN:')?.trim().toUpperCase(); if (!gstin) return;
    const validation = typeof GSTINValidatorPro !== 'undefined' ? GSTINValidatorPro.validateComprehensive(gstin) : validateGSTIN(gstin);
    if (!(validation.valid ?? validation.isValid)) return showNotification('Enter a valid GSTIN including its check digit.', 'error');
    const entities = JSON.parse(localStorage.getItem('ds-gst-entities') || '[]');
    if (entities.some(entity => entity.gstin === gstin)) return showNotification('This entity already exists.', 'warning');
    entities.push({ name: name.trim(), gstin }); localStorage.setItem('ds-gst-entities', JSON.stringify(entities));
    renderSavedEntities();
    showNotification('Entity saved on this device.', 'success');
}
function renderSavedEntities() {
    const grid = document.querySelector('.bm-entity-grid'); if (!grid) return;
    grid.querySelectorAll('[data-saved-entity]').forEach(card => card.remove());
    for (const entity of JSON.parse(localStorage.getItem('ds-gst-entities') || '[]')) {
        const card = document.createElement('div'); card.className = 'bm-entity-card'; card.dataset.savedEntity = entity.gstin;
        const heading = document.createElement('h4'), detail = document.createElement('p');
        heading.textContent = entity.name; detail.textContent = entity.gstin;
        card.append(heading, detail); grid.appendChild(card);
    }
}

// Compare actual uploaded rows, never demonstration figures. Ambiguous
// duplicate references are flagged for review instead of silently overwritten.
function matchInvoiceRows(registers) {
    const normalize = value => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const indexes = registers.map(rows => {
        const map = new Map();
        for (const row of rows) {
            const entries = Object.entries(row).map(([key, value]) => [normalize(key), value]);
            const pick = names => entries.find(([key]) => names.includes(key))?.[1];
            const reference = normalize(pick(['invoiceno','invoicenumber','invoice','referenceno','reference','ponumber','pono','orderno']));
            if (!reference) throw new Error('Each row needs an Invoice No or Reference column shared by all three files.');
            const raw = pick(['totalamount','invoicevalue','amount','total','taxablevalue']);
            const amount = raw == null ? NaN : Number(String(raw).replace(/[₹,\s]/g, ''));
            if (!map.has(reference)) map.set(reference, []);
            map.get(reference).push({ reference, amount });
        }
        return map;
    });
    return Array.from(new Set(indexes.flatMap(map => Array.from(map.keys())))).map(reference => {
        const matches = indexes.map(map => map.get(reference) || []);
        const amounts = matches.map(rows => rows[0]?.amount);
        const status = matches.some(rows => !rows.length) ? 'Unmatched' : matches.some(rows => rows.length !== 1) || amounts.some(value => !Number.isFinite(value)) || Math.max(...amounts) - Math.min(...amounts) > .01 ? 'Review' : 'Matched';
        return { Reference: reference, Status: status, 'PO amount': amounts[0] ?? '', 'GRN amount': amounts[1] ?? '', 'Invoice amount': amounts[2] ?? '' };
    });
}
function runAutoMatching() {
    if (typeof XLSX === 'undefined') return showNotification('Spreadsheet reader could not load. Refresh and try again.', 'error');
    const dialog = document.createElement('dialog');
    dialog.style.cssText = 'width:min(560px,90vw);padding:24px;border-radius:16px;background:#182337;color:white;border:1px solid #526079';
    const title = document.createElement('h2'); title.textContent = 'Match purchase orders, receipts and invoices'; dialog.appendChild(title);
    const help = document.createElement('p'); help.textContent = 'Use a shared Invoice No or Reference column and an Amount column in each file. Duplicate references require review.'; dialog.appendChild(help);
    const inputs = ['Purchase orders', 'Goods receipts', 'Supplier invoices'].map(label => {
        const field = document.createElement('label'); field.textContent = label; field.style.display = 'block';
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv,.xlsx,.xls'; field.appendChild(input); dialog.appendChild(field); return input;
    });
    const status = document.createElement('p'), run = document.createElement('button'), close = document.createElement('button');
    run.textContent = 'Match and download report'; close.textContent = 'Close';
    run.className = close.className = 'bm-btn bm-btn-primary';
    close.onclick = () => dialog.close(); dialog.addEventListener('close', () => dialog.remove());
    run.onclick = async () => {
        if (inputs.some(input => !input.files.length)) { status.textContent = 'Select all three files.'; return; }
        run.disabled = true;
        try {
            const registers = await Promise.all(inputs.map(async input => {
                const book = XLSX.read(await input.files[0].arrayBuffer(), {type:'array'});
                return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], {defval:''});
            }));
            if (registers.some(rows => !rows.length)) throw new Error('Each file must contain at least one data row.');
            const results = matchInvoiceRows(registers);
            const counts = {matched:results.filter(row => row.Status === 'Matched').length,partial:results.filter(row => row.Status === 'Review').length,unmatched:results.filter(row => row.Status === 'Unmatched').length};
            updateMatchingResults(counts);
            const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(results), 'Matching'); XLSX.writeFile(book, 'invoice-matching.xlsx');
            status.textContent = `${counts.matched} matched, ${counts.partial} need review, ${counts.unmatched} unmatched. Report downloaded.`;
        } catch (error) { status.textContent = error.message; } finally { run.disabled = false; }
    };
    dialog.append(status, run, close); document.body.appendChild(dialog); dialog.showModal();
}
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.bm-entity-grid')) renderSavedEntities();
});

if (location.pathname.includes('financial-modelling')) window.exportReport = exportFinancialReport;
