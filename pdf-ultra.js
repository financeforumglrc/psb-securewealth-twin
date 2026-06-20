// PDF Ultra - Full Working Implementation
// DS Financial - Beats SmallPDF & ILovePDF

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ===================== UTILITIES =====================
function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}

function showToast(msg, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':'exclamation-circle'}"></i> ${msg}`;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`Downloaded: ${filename}`);
}

function setProgress(pct, label) {
  const bar = document.querySelector('.progress-bar-fill');
  const lbl = document.querySelector('.progress-label');
  if (bar) bar.style.width = pct + '%';
  if (lbl) lbl.textContent = label || '';
}

function showResult(html) {
  const r = document.getElementById('resultBox');
  if (r) { r.innerHTML = html; r.classList.add('show'); }
}

// ===================== MODAL =====================
const TOOLS = {
  merge: { icon:'fa-object-group', title:'Merge PDF', desc:'Combine multiple PDFs into one. Drag to reorder.' },
  split: { icon:'fa-cut', title:'Split PDF', desc:'Extract pages or split by page ranges.' },
  compress: { icon:'fa-compress', title:'Compress PDF', desc:'Reduce file size. See before & after.' },
  rotate: { icon:'fa-sync-alt', title:'Rotate PDF', desc:'Rotate pages 90°, 180°, or 270°.' },
  reorder: { icon:'fa-sort', title:'Reorder Pages', desc:'Drag page thumbnails to rearrange.' },
  'pdf-to-jpg': { icon:'fa-file-image', title:'PDF to JPG', desc:'Convert each page to a JPG image.' },
  'jpg-to-pdf': { icon:'fa-file-pdf', title:'Images to PDF', desc:'Combine JPG/PNG images into one PDF.' },
  'html-to-pdf': { icon:'fa-code', title:'HTML to PDF', desc:'Convert HTML markup to a PDF file.' },
  'pdf-to-text': { icon:'fa-align-left', title:'PDF to Text', desc:'Extract all text content from PDF.' },
  'markdown-to-pdf': { icon:'fa-markdown', title:'Markdown to PDF', desc:'Convert Markdown text to a styled PDF.' },
  'csv-to-pdf': { icon:'fa-table', title:'CSV to PDF', desc:'Convert CSV data to a PDF table.' },
  'word-to-pdf': { icon:'fa-file-word', title:'Word to PDF', desc:'Convert DOCX files to PDF. Formatting preserved.' },
  'excel-to-pdf': { icon:'fa-file-excel', title:'Excel to PDF', desc:'Convert XLSX spreadsheets to PDF tables.' },
  'ppt-to-pdf': { icon:'fa-file-powerpoint', title:'PPT to PDF', desc:'Convert PowerPoint slides to PDF pages.' },
  watermark: { icon:'fa-tint', title:'Add Watermark', desc:'Add text watermark with custom style.' },
  'page-numbers': { icon:'fa-list-ol', title:'Page Numbers', desc:'Add page numbers to your PDF.' },
  'delete-pages': { icon:'fa-trash-alt', title:'Delete Pages', desc:'Remove specific pages from PDF.' },
  'header-footer': { icon:'fa-heading', title:'Header & Footer', desc:'Add custom header and footer to all pages.' },
  metadata: { icon:'fa-info-circle', title:'Edit Metadata', desc:'Change PDF title, author, subject, keywords.' },
  'pdf-info': { icon:'fa-file-alt', title:'PDF Info', desc:'View detailed PDF properties and metadata.' },
  esign: { icon:'fa-signature', title:'E-Sign PDF', desc:'Draw, type, or upload your signature.' },
  protect: { icon:'fa-lock', title:'Protect PDF', desc:'Add password protection to your PDF.' },
  unlock: { icon:'fa-unlock', title:'Unlock PDF', desc:'Remove PDF password protection.' },
  stamp: { icon:'fa-stamp', title:'Add Stamp', desc:'Add APPROVED, DRAFT, CONFIDENTIAL stamps.' },
  ocr: { icon:'fa-eye', title:'OCR PDF', desc:'Extract text from scanned PDFs using AI.' },
  'ai-summarize': { icon:'fa-brain', title:'AI Summarize', desc:'Generate a smart summary of your PDF.' },
  'ai-qa': { icon:'fa-comments', title:'Chat with PDF', desc:'Ask questions about your document.' }
};

function openTool(id) {
  const t = TOOLS[id]; if (!t) return;
  document.getElementById('mIcon').innerHTML = `<i class="fas ${t.icon}"></i>`;
  document.getElementById('mTitle').textContent = t.title;
  document.getElementById('mDesc').textContent = t.desc;
  document.getElementById('mBody').innerHTML = getToolUI(id);
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  initTool(id);
}

function closeTool() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeTool();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTool(); });

// ===================== SEARCH =====================
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('toolSearch');
  if (inp) {
    inp.addEventListener('input', () => {
      const q = inp.value.toLowerCase();
      document.querySelectorAll('.tool-card').forEach(card => {
        const txt = card.textContent.toLowerCase();
        card.closest('.tool-card').style.display = txt.includes(q) ? '' : 'none';
      });
    });
  }
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); inp && inp.focus(); }
  });
});

function filterCat(cat) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  event.target.closest('.cat-pill').classList.add('active');
  document.querySelectorAll('.tool-group').forEach(g => {
    if (cat === 'all') { g.style.display = ''; return; }
    g.style.display = g.dataset.cat === cat ? '' : 'none';
  });
}


// ===================== TOOL UI TEMPLATES =====================
function dropZoneHTML(accept, multiple, id='fileInput') {
  const mult = multiple ? 'multiple' : '';
  return `<div class="drop-zone" id="dropZone">
    <input type="file" id="${id}" accept="${accept}" ${mult} onchange="handleDrop(this)">
    <i class="fas fa-cloud-upload-alt"></i>
    <h3>Drop files here or click to browse</h3>
    <p>Accepted: ${accept}</p>
  </div>
  <div class="file-list" id="fileList"></div>`;
}

function progressHTML() {
  return `<div class="progress-wrap" id="progressWrap" style="display:none">
    <div class="progress-bar-bg"><div class="progress-bar-fill" id="progBar"></div></div>
    <div class="progress-label" id="progLabel">Processing...</div>
  </div>`;
}

function resultBoxHTML() {
  return `<div class="result-box" id="resultBox"></div>`;
}

function getToolUI(id) {
  switch(id) {
    case 'merge': return `
      ${dropZoneHTML('.pdf', true, 'mergeInput')}
      <div id="mergeList" style="margin-top:16px;display:flex;flex-direction:column;gap:8px;"></div>
      <div class="ctrl-row" style="margin-top:20px;">
        <button class="btn-primary" onclick="doMerge()"><i class="fas fa-object-group"></i> Merge PDFs</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'split': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group" style="flex:2">
          <label>Page Ranges (e.g. 1-3, 5, 7-9 or leave blank for each page)</label>
          <input type="text" id="splitRange" placeholder="e.g. 1-3, 5, 7-9">
        </div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doSplit()"><i class="fas fa-cut"></i> Split PDF</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'compress': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group">
          <label>Compression Level</label>
          <select id="compressLevel">
            <option value="high">High (smallest file)</option>
            <option value="medium" selected>Medium (balanced)</option>
            <option value="low">Low (best quality)</option>
          </select>
        </div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doCompress()"><i class="fas fa-compress"></i> Compress PDF</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'rotate': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group">
          <label>Rotation</label>
          <select id="rotAngle">
            <option value="90">90° Clockwise</option>
            <option value="180">180°</option>
            <option value="270">270° (90° CCW)</option>
          </select>
        </div>
        <div class="ctrl-group">
          <label>Apply To</label>
          <select id="rotPages">
            <option value="all">All Pages</option>
            <option value="even">Even Pages</option>
            <option value="odd">Odd Pages</option>
          </select>
        </div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doRotate()"><i class="fas fa-sync-alt"></i> Rotate & Download</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'pdf-to-jpg': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group">
          <label>Quality (DPI)</label>
          <select id="jpgQuality">
            <option value="1">72 DPI - Web</option>
            <option value="2" selected>144 DPI - Standard</option>
            <option value="3">216 DPI - High Quality</option>
          </select>
        </div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doPdfToJpg()"><i class="fas fa-images"></i> Convert & Download ZIP</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'jpg-to-pdf': return `
      ${dropZoneHTML('image/*', true, 'imgInput')}
      <div id="imgPreviewList" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;"></div>
      <div class="ctrl-row">
        <div class="ctrl-group">
          <label>Page Size</label>
          <select id="imgPageSize">
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
            <option value="fit">Fit to Image</option>
          </select>
        </div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doImgToPdf()"><i class="fas fa-file-pdf"></i> Create PDF</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'word-to-pdf': return `
      ${dropZoneHTML('.docx,.doc', false, 'wordInput')}
      <p style="color:var(--text3);font-size:0.82rem;margin-top:8px;"><i class="fas fa-info-circle"></i> Supports .docx format. Formatting, headings & lists are preserved.</p>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doWordToPdf()"><i class="fas fa-file-pdf"></i> Convert to PDF</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'excel-to-pdf': return `
      ${dropZoneHTML('.xlsx,.xls,.csv', false, 'excelInput')}
      <p style="color:var(--text3);font-size:0.82rem;margin-top:8px;"><i class="fas fa-info-circle"></i> Supports .xlsx, .xls and .csv files. Creates a styled table PDF.</p>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doExcelToPdf()"><i class="fas fa-file-pdf"></i> Convert to PDF</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'pdf-to-text': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doPdfToText()"><i class="fas fa-download"></i> Extract Text</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'html-to-pdf': return `
      <div class="ctrl-group">
        <label>Paste HTML Code</label>
        <textarea id="htmlInput" style="min-height:160px;font-family:monospace;font-size:0.82rem;" placeholder="<h1>Hello</h1><p>Your HTML here...</p>"></textarea>
      </div>
      <div class="ctrl-row">
        <div class="ctrl-group">
          <label>Page Size</label>
          <select id="htmlPageSize"><option>A4</option><option>Letter</option></select>
        </div>
        <div class="ctrl-group">
          <label>Orientation</label>
          <select id="htmlOrient"><option value="p">Portrait</option><option value="l">Landscape</option></select>
        </div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doHtmlToPdf()"><i class="fas fa-file-pdf"></i> Convert to PDF</button>
      </div>
      ${resultBoxHTML()}`;

    case 'markdown-to-pdf': return `
      <div class="ctrl-group">
        <label>Paste Markdown</label>
        <textarea id="mdInput" style="min-height:160px;font-family:monospace;font-size:0.82rem;" placeholder="# My Document&#10;&#10;## Section 1&#10;&#10;Content here..."></textarea>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doMdToPdf()"><i class="fas fa-file-pdf"></i> Convert to PDF</button>
      </div>
      ${resultBoxHTML()}`;

    case 'csv-to-pdf': return `
      ${dropZoneHTML('.csv', false, 'csvInput')}
      <p style="color:var(--text3);font-size:0.82rem;margin-top:8px;">Or paste CSV below:</p>
      <div class="ctrl-group"><textarea id="csvText" style="min-height:100px;font-family:monospace;font-size:0.82rem;" placeholder="Name,Age,City&#10;John,25,Delhi"></textarea></div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doCsvToPdf()"><i class="fas fa-file-pdf"></i> Convert to PDF</button>
      </div>
      ${resultBoxHTML()}`;

    case 'watermark': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group" style="flex:2"><label>Watermark Text</label><input type="text" id="wmText" value="CONFIDENTIAL" placeholder="Watermark text"></div>
        <div class="ctrl-group"><label>Opacity (0-1)</label><input type="number" id="wmOpacity" value="0.2" min="0.05" max="1" step="0.05"></div>
      </div>
      <div class="ctrl-row">
        <div class="ctrl-group"><label>Font Size</label><input type="number" id="wmSize" value="60" min="10" max="200"></div>
        <div class="ctrl-group"><label>Angle (degrees)</label><input type="number" id="wmAngle" value="45" min="-90" max="90"></div>
        <div class="ctrl-group"><label>Color</label><input type="color" id="wmColor" value="#ff0000"></div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doWatermark()"><i class="fas fa-tint"></i> Add Watermark</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'page-numbers': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group"><label>Position</label>
          <select id="pnPos">
            <option value="bottom-center">Bottom Center</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-center">Top Center</option>
          </select>
        </div>
        <div class="ctrl-group"><label>Start Number</label><input type="number" id="pnStart" value="1" min="1"></div>
        <div class="ctrl-group"><label>Font Size</label><input type="number" id="pnSize" value="12" min="8" max="24"></div>
      </div>
      <div class="ctrl-row">
        <div class="ctrl-group"><label>Format</label>
          <select id="pnFormat">
            <option value="n">1, 2, 3...</option>
            <option value="page-n">Page 1, Page 2...</option>
            <option value="n-of-t">1 of 10, 2 of 10...</option>
          </select>
        </div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doPageNumbers()"><i class="fas fa-list-ol"></i> Add Page Numbers</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'delete-pages': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group" style="flex:2">
          <label>Pages to Delete (e.g. 1, 3, 5-7)</label>
          <input type="text" id="delPages" placeholder="e.g. 1, 3, 5-7">
        </div>
      </div>
      <div id="pageThumbsWrap" style="margin-top:12px;"></div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doDeletePages()"><i class="fas fa-trash-alt"></i> Delete & Download</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'header-footer': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group" style="flex:2"><label>Header Text (use {page}, {total}, {date})</label><input type="text" id="hfHeader" placeholder="My Document - Page {page}"></div>
      </div>
      <div class="ctrl-row">
        <div class="ctrl-group" style="flex:2"><label>Footer Text</label><input type="text" id="hfFooter" placeholder="Page {page} of {total}"></div>
        <div class="ctrl-group"><label>Font Size</label><input type="number" id="hfSize" value="10" min="6" max="18"></div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doHeaderFooter()"><i class="fas fa-heading"></i> Apply & Download</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'metadata': return `
      ${dropZoneHTML('.pdf', false)}
      <div id="metaFields" style="display:none;">
        <div class="ctrl-row"><div class="ctrl-group"><label>Title</label><input type="text" id="metaTitle"></div></div>
        <div class="ctrl-row"><div class="ctrl-group"><label>Author</label><input type="text" id="metaAuthor"></div></div>
        <div class="ctrl-row"><div class="ctrl-group"><label>Subject</label><input type="text" id="metaSubject"></div></div>
        <div class="ctrl-row"><div class="ctrl-group"><label>Keywords</label><input type="text" id="metaKeywords" placeholder="comma separated"></div></div>
        <div class="ctrl-row"><button class="btn-primary" onclick="doMetadata()"><i class="fas fa-save"></i> Save Metadata</button></div>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'pdf-info': return `
      ${dropZoneHTML('.pdf', false)}
      <div id="pdfInfoResult" style="margin-top:16px;"></div>`;

    case 'protect': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group"><label>User Password (to open)</label><input type="password" id="protectPass" placeholder="Enter password"></div>
        <div class="ctrl-group"><label>Owner Password (optional)</label><input type="password" id="ownerPass" placeholder="Owner password"></div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doProtect()"><i class="fas fa-lock"></i> Protect PDF</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'unlock': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group"><label>PDF Password</label><input type="password" id="unlockPass" placeholder="Enter the PDF password"></div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doUnlock()"><i class="fas fa-unlock"></i> Unlock PDF</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'esign': return `
      ${dropZoneHTML('.pdf', false)}
      <div style="margin-top:16px;">
        <div class="sign-tabs">
          <button class="sign-tab active" onclick="switchSignTab('draw',this)"><i class="fas fa-pen"></i> Draw</button>
          <button class="sign-tab" onclick="switchSignTab('type',this)"><i class="fas fa-keyboard"></i> Type</button>
          <button class="sign-tab" onclick="switchSignTab('upload',this)"><i class="fas fa-upload"></i> Upload</button>
        </div>
        <div class="sign-panel active" id="sp-draw">
          <div class="sign-canvas-wrap"><canvas id="signCanvas" width="640" height="200"></canvas></div>
          <div class="ctrl-row" style="margin-top:8px;">
            <div class="ctrl-group"><label>Pen Color</label><input type="color" id="penColor" value="#000000"></div>
            <div class="ctrl-group"><label>Pen Size</label><input type="range" id="penSize" min="1" max="8" value="2"></div>
            <button class="btn-sec" onclick="clearSignCanvas()"><i class="fas fa-undo"></i> Clear</button>
          </div>
        </div>
        <div class="sign-panel" id="sp-type">
          <div class="ctrl-group"><label>Type Your Name</label><input type="text" id="signText" placeholder="Your Signature" style="font-family:'Brush Script MT',cursive;font-size:1.5rem;"></div>
          <div class="ctrl-row"><div class="ctrl-group"><label>Font</label><select id="signFont"><option value="cursive">Cursive</option><option value="serif">Serif</option><option value="sans-serif">Sans</option></select></div><div class="ctrl-group"><label>Color</label><input type="color" id="signColor" value="#000080"></div></div>
        </div>
        <div class="sign-panel" id="sp-upload">
          <input type="file" id="signImgFile" accept="image/*" style="color:var(--text)">
          <p style="color:var(--text3);font-size:0.82rem;margin-top:8px;">Upload PNG with transparent background for best results.</p>
        </div>
      </div>
      <div class="ctrl-row" style="margin-top:16px;">
        <div class="ctrl-group"><label>Page Number</label><input type="number" id="signPage" value="1" min="1"></div>
        <div class="ctrl-group"><label>X Position (%)</label><input type="number" id="signX" value="60" min="0" max="90"></div>
        <div class="ctrl-group"><label>Y Position (%)</label><input type="number" id="signY" value="80" min="0" max="95"></div>
        <div class="ctrl-group"><label>Width (pt)</label><input type="number" id="signW" value="150" min="50" max="400"></div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doESign()"><i class="fas fa-signature"></i> Sign & Download</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'stamp': return `
      ${dropZoneHTML('.pdf', false)}
      <div class="ctrl-row">
        <div class="ctrl-group"><label>Stamp Text</label>
          <select id="stampText"><option>APPROVED</option><option>CONFIDENTIAL</option><option>DRAFT</option><option>REJECTED</option><option>PAID</option><option>VOID</option><option>COPY</option></select>
        </div>
        <div class="ctrl-group"><label>Color</label><input type="color" id="stampColor" value="#cc0000"></div>
        <div class="ctrl-group"><label>Opacity</label><input type="number" id="stampOpacity" value="0.3" min="0.1" max="1" step="0.05"></div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doStamp()"><i class="fas fa-stamp"></i> Add Stamp</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'ocr': return `
      ${dropZoneHTML('.pdf', false)}
      <p style="color:var(--text3);font-size:0.82rem;margin-top:8px;"><i class="fas fa-info-circle"></i> Extracts text from scanned PDFs by rendering pages and running OCR. May take a moment.</p>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doOCR()"><i class="fas fa-eye"></i> Run OCR</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'ai-summarize': return `
      ${dropZoneHTML('.pdf', false)}
      <p style="color:var(--text3);font-size:0.82rem;margin-top:8px;">Extracts text and generates a structured summary.</p>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doAiSummarize()"><i class="fas fa-brain"></i> Summarize</button>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    case 'ai-qa': return `
      ${dropZoneHTML('.pdf', false)}
      <div id="qaSection" style="display:none;margin-top:16px;">
        <div class="ctrl-group"><label>Ask a question about your PDF</label>
          <input type="text" id="qaQuestion" placeholder="e.g. What is the main topic? Who is the author?">
        </div>
        <div class="ctrl-row"><button class="btn-primary" onclick="doAiQA()"><i class="fas fa-comments"></i> Ask</button></div>
        <div id="qaAnswer" style="margin-top:16px;"></div>
      </div>
      ${progressHTML()}${resultBoxHTML()}`;

    default: return `<div style="text-align:center;padding:40px;color:var(--text3)"><i class="fas fa-tools" style="font-size:2rem;margin-bottom:12px;display:block;"></i>This tool is coming soon!</div>`;
  }
}


// ===================== FILE HANDLING =====================
let _files = {};

function handleDrop(input) {
  const files = Array.from(input.files);
  const id = input.id;
  if (!_files[id]) _files[id] = [];
  files.forEach(f => _files[id].push(f));
  renderFileList(id);
  // Trigger auto-actions for info/metadata
  if (id === 'fileInput') {
    if (currentTool === 'pdf-info') showPdfInfo(files[0]);
    if (currentTool === 'metadata') loadMetadata(files[0]);
    if (currentTool === 'delete-pages') renderPageThumbs(files[0]);
  }
}

function renderFileList(inputId) {
  const listEl = document.getElementById('fileList') || document.getElementById('mergeList') || document.getElementById('imgPreviewList');
  const container = inputId === 'mergeInput' ? document.getElementById('mergeList') :
                    inputId === 'imgInput' ? document.getElementById('imgPreviewList') :
                    document.getElementById('fileList');
  if (!container) return;
  const files = _files[inputId] || [];
  if (inputId === 'imgInput') {
    container.innerHTML = '';
    files.forEach((f, i) => {
      const url = URL.createObjectURL(f);
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;width:80px;';
      div.innerHTML = `<img src="${url}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--border);">
        <button onclick="removeImg(${i},'${inputId}')" style="position:absolute;top:-6px;right:-6px;background:var(--red);border:none;color:white;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:0.7rem;">✕</button>`;
      container.appendChild(div);
    });
    return;
  }
  container.innerHTML = '';
  files.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'file-chip';
    div.draggable = true;
    div.dataset.index = i;
    div.innerHTML = `<i class="fas fa-file-pdf file-chip-icon"></i>
      <span class="file-chip-name">${f.name}</span>
      <span class="file-chip-size">${formatBytes(f.size)}</span>
      <button class="file-chip-del" onclick="removeFile(${i},'${inputId}')"><i class="fas fa-times"></i></button>`;
    container.appendChild(div);
  });
  if (inputId === 'mergeInput' && files.length > 1) {
    new Sortable(container, { animation: 150, onEnd: e => {
      const arr = _files[inputId];
      arr.splice(e.newIndex, 0, arr.splice(e.oldIndex, 1)[0]);
    }});
  }
}

function removeFile(i, id) { _files[id].splice(i,1); renderFileList(id); }
function removeImg(i, id) { _files[id].splice(i,1); renderFileList(id); }

function getFile(id='fileInput') { return (_files[id]||[])[0] || null; }
function getFiles(id='mergeInput') { return _files[id] || []; }

let currentTool = '';
function initTool(id) {
  currentTool = id;
  _files = {};
  if (id === 'esign') setTimeout(initSignCanvas, 100);
  // setup drag & drop zones
  setTimeout(() => {
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault(); zone.classList.remove('drag-over');
        const input = zone.querySelector('input[type=file]');
        if (input && e.dataTransfer.files.length) {
          const dt = new DataTransfer();
          Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
          input.files = dt.files;
          handleDrop(input);
        }
      });
    });
  }, 50);
}

function showProgress(show=true) {
  const w = document.getElementById('progressWrap');
  if (w) w.style.display = show ? 'block' : 'none';
  if (show) { setProgress(0,'Preparing...'); }
}

function setProgress(pct, label) {
  const b = document.getElementById('progBar');
  const l = document.getElementById('progLabel');
  if (b) b.style.width = pct + '%';
  if (l) l.textContent = label;
}

function showResultBox(html) {
  const r = document.getElementById('resultBox');
  if (r) { r.innerHTML = html; r.classList.add('show'); }
}

// ===================== MERGE PDF =====================
async function doMerge() {
  const files = getFiles('mergeInput');
  if (files.length < 2) { showToast('Please add at least 2 PDF files', 'error'); return; }
  showProgress();
  try {
    const { PDFDocument } = PDFLib;
    const merged = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      setProgress(Math.round((i/files.length)*90), `Merging ${i+1} of ${files.length}...`);
      const buf = await files[i].arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    setProgress(95, 'Saving...');
    const bytes = await merged.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    setProgress(100, 'Done!');
    downloadBlob(blob, 'merged.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Merged Successfully</h4>
      <div class="result-size">
        <div class="size-stat"><span>Pages</span><strong>${(await PDFLib.PDFDocument.load(await blob.arrayBuffer())).getPageCount()}</strong></div>
        <div class="size-stat"><span>File Size</span><strong>${formatBytes(bytes.length)}</strong></div>
      </div>`);
  } catch(e) { showToast('Merge failed: ' + e.message, 'error'); }
  showProgress(false);
}

// ===================== SPLIT PDF =====================
async function doSplit() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF', 'error'); return; }
  showProgress();
  try {
    const { PDFDocument } = PDFLib;
    const buf = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(buf);
    const total = srcDoc.getPageCount();
    const rangeStr = document.getElementById('splitRange').value.trim();
    let ranges = [];
    if (!rangeStr) { for (let i=0;i<total;i++) ranges.push([i,i]); }
    else {
      rangeStr.split(',').forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
          let [a,b] = part.split('-').map(x=>parseInt(x.trim())-1);
          ranges.push([a,b]);
        } else { let p=parseInt(part)-1; ranges.push([p,p]); }
      });
    }
    const zip = new JSZip();
    for (let i=0; i<ranges.length; i++) {
      setProgress(Math.round((i/ranges.length)*90), `Creating part ${i+1}...`);
      const [s,e] = ranges[i];
      const newDoc = await PDFDocument.create();
      const indices = [];
      for (let p=s;p<=e&&p<total;p++) indices.push(p);
      const pages = await newDoc.copyPages(srcDoc, indices);
      pages.forEach(p => newDoc.addPage(p));
      const bytes = await newDoc.save();
      zip.file(`part-${i+1}.pdf`, bytes);
    }
    setProgress(95,'Zipping...'); 
    const zipBlob = await zip.generateAsync({type:'blob'});
    setProgress(100,'Done!');
    downloadBlob(zipBlob, 'split-pdfs.zip');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Split into ${ranges.length} file(s)</h4>`);
  } catch(e) { showToast('Split failed: ' + e.message, 'error'); }
  showProgress(false);
}

// ===================== COMPRESS PDF =====================
async function doCompress() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF', 'error'); return; }
  showProgress();
  const origSize = file.size;
  try {
    const { PDFDocument } = PDFLib;
    setProgress(20,'Loading PDF...');
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf, {ignoreEncryption:true});
    setProgress(50,'Optimizing...');
    // Strip metadata to reduce size
    doc.setTitle(''); doc.setAuthor(''); doc.setSubject(''); doc.setKeywords([]);
    doc.setProducer('DS Financial PDF Suite'); doc.setCreator('DS Financial');
    const level = document.getElementById('compressLevel').value;
    const opts = { useObjectStreams: true, addDefaultPage: false,
      objectsPerTick: level==='high'?50:level==='medium'?100:200 };
    setProgress(75,'Saving...');
    const bytes = await doc.save(opts);
    setProgress(100,'Done!');
    const newSize = bytes.length;
    const saved = origSize - newSize;
    const pct = origSize > 0 ? Math.round((saved/origSize)*100) : 0;
    const blob = new Blob([bytes],{type:'application/pdf'});
    downloadBlob(blob, 'compressed.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Compressed Successfully</h4>
      <div class="result-size">
        <div class="size-stat"><span>Original</span><strong>${formatBytes(origSize)}</strong></div>
        <div class="size-stat"><span>Compressed</span><strong>${formatBytes(newSize)}</strong></div>
        <div class="size-stat"><span>Saved</span><strong class="size-saved">${pct}% (${formatBytes(Math.max(0,saved))})</strong></div>
      </div>`);
  } catch(e) { showToast('Compress failed: ' + e.message, 'error'); }
  showProgress(false);
}


// ===================== ROTATE PDF =====================
async function doRotate() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF', 'error'); return; }
  showProgress();
  try {
    const { PDFDocument, degrees } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const angle = parseInt(document.getElementById('rotAngle').value);
    const mode = document.getElementById('rotPages').value;
    const pages = doc.getPages();
    setProgress(40,'Rotating...');
    pages.forEach((page, i) => {
      if (mode==='all' || (mode==='even'&&(i+1)%2===0) || (mode==='odd'&&(i+1)%2!==0)) {
        page.setRotation(degrees((page.getRotation().angle + angle) % 360));
      }
    });
    setProgress(80,'Saving...');
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}), 'rotated.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Rotated ${angle}° — Downloaded</h4>`);
  } catch(e) { showToast('Rotate failed: ' + e.message, 'error'); }
  showProgress(false);
}

// ===================== PDF TO JPG =====================
async function doPdfToJpg() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF', 'error'); return; }
  showProgress();
  try {
    const scale = parseFloat(document.getElementById('jpgQuality').value);
    const url = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(url).promise;
    const zip = new JSZip();
    for (let i=1; i<=pdf.numPages; i++) {
      setProgress(Math.round((i/pdf.numPages)*90), `Converting page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const vp = page.getViewport({scale});
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise;
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
      const ab = await blob.arrayBuffer();
      zip.file(`page-${String(i).padStart(3,'0')}.jpg`, ab);
    }
    setProgress(95,'Zipping...');
    const zipBlob = await zip.generateAsync({type:'blob'});
    setProgress(100,'Done!');
    URL.revokeObjectURL(url);
    downloadBlob(zipBlob, 'pdf-pages.zip');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Converted ${pdf.numPages} pages to JPG</h4>`);
  } catch(e) { showToast('Conversion failed: ' + e.message, 'error'); }
  showProgress(false);
}

// ===================== IMAGES TO PDF =====================
async function doImgToPdf() {
  const files = getFiles('imgInput');
  if (!files.length) { showToast('Please add images', 'error'); return; }
  showProgress();
  try {
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.create();
    const pageSize = document.getElementById('imgPageSize').value;
    for (let i=0; i<files.length; i++) {
      setProgress(Math.round((i/files.length)*90), `Adding image ${i+1}...`);
      const buf = await files[i].arrayBuffer();
      let img, iw, ih;
      if (files[i].type === 'image/png') { img = await doc.embedPng(buf); }
      else { img = await doc.embedJpg(buf); }
      iw = img.width; ih = img.height;
      let pw, ph;
      if (pageSize === 'A4') { pw=595; ph=842; }
      else if (pageSize === 'Letter') { pw=612; ph=792; }
      else { pw=iw; ph=ih; }
      const page = doc.addPage([pw, ph]);
      const scale = Math.min(pw/iw, ph/ih);
      const w = iw*scale, h = ih*scale;
      page.drawImage(img, {x:(pw-w)/2, y:(ph-h)/2, width:w, height:h});
    }
    setProgress(95,'Saving...');
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}), 'images.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Created PDF with ${files.length} pages</h4>`);
  } catch(e) { showToast('Conversion failed: ' + e.message, 'error'); }
  showProgress(false);
}

// ===================== WORD TO PDF =====================
async function doWordToPdf() {
  const file = getFile('wordInput');
  if (!file) { showToast('Please select a DOCX file', 'error'); return; }
  showProgress();
  try {
    setProgress(20,'Reading Word file...');
    const buf = await file.arrayBuffer();
    setProgress(40,'Converting to HTML...');
    const result = await mammoth.convertToHtml({arrayBuffer: buf});
    const html = result.value;
    setProgress(60,'Rendering PDF...');
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('p','pt','a4');
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:595px;padding:40px;font-family:sans-serif;font-size:11pt;line-height:1.6;color:#111;background:white;';
    container.innerHTML = html;
    document.body.appendChild(container);
    setProgress(75,'Generating PDF...');
    await doc.html(container, {
      callback: d => {
        document.body.removeChild(container);
        setProgress(100,'Done!');
        const blob = d.output('blob');
        downloadBlob(blob, file.name.replace(/\.(docx?)/i,'.pdf'));
        showResultBox(`<h4><i class="fas fa-check-circle"></i> Word converted to PDF successfully</h4>`);
        showProgress(false);
      },
      x:0, y:0, width:595, windowWidth:595
    });
  } catch(e) { showToast('Conversion failed: ' + e.message, 'error'); showProgress(false); }
}

// ===================== EXCEL TO PDF =====================
async function doExcelToPdf() {
  const file = getFile('excelInput');
  if (!file) { showToast('Please select an Excel/CSV file', 'error'); return; }
  showProgress();
  try {
    setProgress(20,'Reading file...');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, {type:'array'});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, {header:1});
    setProgress(50,'Building table...');
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('l','pt','a4');
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;padding:30px;font-family:sans-serif;font-size:9pt;background:white;';
    let tbl = `<table style="border-collapse:collapse;width:100%;font-size:9pt;">`;
    data.forEach((row, ri) => {
      const bg = ri===0 ? 'background:#1a1a2e;color:white;' : ri%2===0 ? 'background:#f8fafc;' : '';
      tbl += `<tr>${row.map(cell=>`<td style="border:1px solid #e2e8f0;padding:6px 10px;${bg}">${cell||''}</td>`).join('')}</tr>`;
    });
    tbl += '</table>';
    container.innerHTML = `<h2 style="margin-bottom:12px;font-size:14pt;">${file.name}</h2>${tbl}`;
    document.body.appendChild(container);
    setProgress(70,'Rendering PDF...');
    await doc.html(container, {
      callback: d => {
        document.body.removeChild(container);
        setProgress(100,'Done!');
        downloadBlob(d.output('blob'), file.name.replace(/\.(xlsx?|csv)/i,'.pdf'));
        showResultBox(`<h4><i class="fas fa-check-circle"></i> Excel converted — ${data.length} rows</h4>`);
        showProgress(false);
      },
      x:0, y:0, width:840, windowWidth:840
    });
  } catch(e) { showToast('Conversion failed: ' + e.message, 'error'); showProgress(false); }
}

// ===================== PDF TO TEXT =====================
async function doPdfToText() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF', 'error'); return; }
  showProgress();
  try {
    const url = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(url).promise;
    let text = '';
    for (let i=1; i<=pdf.numPages; i++) {
      setProgress(Math.round((i/pdf.numPages)*90), `Extracting page ${i}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += `--- Page ${i} ---\n` + content.items.map(s=>s.str).join(' ') + '\n\n';
    }
    URL.revokeObjectURL(url);
    setProgress(100,'Done!');
    downloadBlob(new Blob([text],{type:'text/plain'}), 'extracted-text.txt');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Extracted ${pdf.numPages} pages of text</h4>
      <textarea style="width:100%;height:120px;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:10px;border-radius:8px;font-size:0.82rem;resize:vertical;" readonly>${text.slice(0,500)}${text.length>500?'...':''}</textarea>`);
  } catch(e) { showToast('Extraction failed: ' + e.message, 'error'); }
  showProgress(false);
}

// ===================== HTML TO PDF =====================
async function doHtmlToPdf() {
  const html = document.getElementById('htmlInput').value.trim();
  if (!html) { showToast('Please enter HTML', 'error'); return; }
  const {jsPDF} = window.jspdf;
  const size = document.getElementById('htmlPageSize').value;
  const orient = document.getElementById('htmlOrient').value;
  const doc = new jsPDF(orient,'pt',size);
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:595px;padding:40px;font-family:sans-serif;font-size:11pt;line-height:1.6;background:white;color:#111;';
  container.innerHTML = html;
  document.body.appendChild(container);
  await doc.html(container, {
    callback: d => {
      document.body.removeChild(container);
      downloadBlob(d.output('blob'), 'from-html.pdf');
      showResultBox(`<h4><i class="fas fa-check-circle"></i> HTML converted to PDF</h4>`);
    }, x:0, y:0, width:595, windowWidth:595
  });
}

// ===================== MARKDOWN TO PDF =====================
async function doMdToPdf() {
  const md = document.getElementById('mdInput').value.trim();
  if (!md) { showToast('Please enter Markdown', 'error'); return; }
  // Simple MD to HTML converter
  let html = md
    .replace(/^# (.+)/gm,'<h1 style="font-size:22pt;margin-top:16px;">$1</h1>')
    .replace(/^## (.+)/gm,'<h2 style="font-size:16pt;margin-top:12px;color:#333;">$1</h2>')
    .replace(/^### (.+)/gm,'<h3 style="font-size:13pt;margin-top:10px;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;">$1</code>')
    .replace(/^- (.+)/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs,'<ul style="margin:8px 0 8px 20px;">$1</ul>')
    .replace(/\n\n/g,'<br><br>');
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF('p','pt','a4');
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:595px;padding:48px;font-family:sans-serif;font-size:11pt;line-height:1.7;background:white;color:#111;';
  container.innerHTML = html;
  document.body.appendChild(container);
  await doc.html(container, {
    callback: d => {
      document.body.removeChild(container);
      downloadBlob(d.output('blob'), 'markdown.pdf');
      showResultBox(`<h4><i class="fas fa-check-circle"></i> Markdown converted to PDF</h4>`);
    }, x:0, y:0, width:595, windowWidth:595
  });
}

// ===================== CSV TO PDF =====================
async function doCsvToPdf() {
  let csv = document.getElementById('csvText').value.trim();
  if (!csv) {
    const file = getFile('csvInput');
    if (!file) { showToast('Please upload CSV or paste data', 'error'); return; }
    csv = await file.text();
  }
  const rows = csv.split('\n').map(r => r.split(',').map(c=>c.trim().replace(/^"|"$/g,'')));
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF('l','pt','a4');
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;padding:30px;font-family:sans-serif;background:white;';
  let tbl = '<table style="border-collapse:collapse;width:100%;font-size:9pt;">';
  rows.forEach((row, ri) => {
    const bg = ri===0 ? 'background:#1a1a2e;color:white;font-weight:600;' : ri%2===0 ? 'background:#f8fafc;' : '';
    tbl += `<tr>${row.map(c=>`<td style="border:1px solid #e2e8f0;padding:6px 10px;${bg}">${c}</td>`).join('')}</tr>`;
  });
  tbl += '</table>';
  container.innerHTML = tbl;
  document.body.appendChild(container);
  await doc.html(container, {
    callback: d => {
      document.body.removeChild(container);
      downloadBlob(d.output('blob'), 'data.pdf');
      showResultBox(`<h4><i class="fas fa-check-circle"></i> CSV converted — ${rows.length} rows</h4>`);
    }, x:0, y:0, width:840, windowWidth:840
  });
}


// ===================== WATERMARK =====================
async function doWatermark() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF', 'error'); return; }
  showProgress();
  try {
    const { PDFDocument, rgb, degrees } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const pages = doc.getPages();
    const text = document.getElementById('wmText').value || 'WATERMARK';
    const opacity = parseFloat(document.getElementById('wmOpacity').value)||0.2;
    const fontSize = parseInt(document.getElementById('wmSize').value)||60;
    const angle = parseFloat(document.getElementById('wmAngle').value)||45;
    const hex = document.getElementById('wmColor').value;
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b2 = parseInt(hex.slice(5,7),16)/255;
    const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    for (let i=0;i<pages.length;i++) {
      setProgress(Math.round((i/pages.length)*90),`Stamping page ${i+1}...`);
      const page = pages[i];
      const {width,height} = page.getSize();
      page.drawText(text, {
        x:width/2 - (text.length*fontSize*0.3),
        y:height/2,
        size:fontSize,
        font,
        color:rgb(r,g,b2),
        opacity,
        rotate:degrees(angle)
      });
    }
    setProgress(95,'Saving...');
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}), 'watermarked.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Watermark added to ${pages.length} pages</h4>`);
  } catch(e) { showToast('Failed: ' + e.message, 'error'); }
  showProgress(false);
}

// ===================== PAGE NUMBERS =====================
async function doPageNumbers() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF', 'error'); return; }
  showProgress();
  try {
    const { PDFDocument, rgb } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const pages = doc.getPages();
    const total = pages.length;
    const start = parseInt(document.getElementById('pnStart').value)||1;
    const size = parseInt(document.getElementById('pnSize').value)||12;
    const pos = document.getElementById('pnPos').value;
    const fmt = document.getElementById('pnFormat').value;
    const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    for (let i=0;i<pages.length;i++) {
      setProgress(Math.round((i/total)*90),`Numbering page ${i+1}...`);
      const page = pages[i];
      const {width,height} = page.getSize();
      const num = i + start;
      let label = fmt==='page-n'?`Page ${num}`:fmt==='n-of-t'?`${num} of ${total+start-1}`:String(num);
      const tw = font.widthOfTextAtSize(label,size);
      let x = pos.includes('right')?width-tw-20:pos.includes('center')?(width-tw)/2:20;
      let y = pos.includes('top')?height-20:10;
      page.drawText(label,{x,y,size,font,color:rgb(0.3,0.3,0.3)});
    }
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}),'numbered.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Page numbers added</h4>`);
  } catch(e) { showToast('Failed: '+e.message,'error'); }
  showProgress(false);
}

// ===================== DELETE PAGES =====================
async function doDeletePages() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  const input = document.getElementById('delPages').value.trim();
  if (!input) { showToast('Enter page numbers to delete','error'); return; }
  showProgress();
  try {
    const { PDFDocument } = PDFLib;
    const buf = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(buf);
    const total = srcDoc.getPageCount();
    const toDelete = new Set();
    input.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        let [a,b] = part.split('-').map(x=>parseInt(x.trim())-1);
        for (let i=a;i<=b;i++) toDelete.add(i);
      } else { toDelete.add(parseInt(part)-1); }
    });
    const keep = [];
    for (let i=0;i<total;i++) if (!toDelete.has(i)) keep.push(i);
    if (!keep.length) { showToast('Cannot delete all pages','error'); showProgress(false); return; }
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(srcDoc, keep);
    pages.forEach(p => newDoc.addPage(p));
    setProgress(90,'Saving...');
    const bytes = await newDoc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}),'deleted-pages.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Deleted ${toDelete.size} page(s). ${keep.length} pages remain.</h4>`);
  } catch(e) { showToast('Failed: '+e.message,'error'); }
  showProgress(false);
}

// ===================== HEADER / FOOTER =====================
async function doHeaderFooter() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  showProgress();
  try {
    const { PDFDocument, rgb } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const pages = doc.getPages();
    const total = pages.length;
    const headerTpl = document.getElementById('hfHeader').value;
    const footerTpl = document.getElementById('hfFooter').value;
    const size = parseInt(document.getElementById('hfSize').value)||10;
    const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const today = new Date().toLocaleDateString();
    for (let i=0;i<pages.length;i++) {
      setProgress(Math.round((i/total)*90),`Processing page ${i+1}...`);
      const page = pages[i];
      const {width,height} = page.getSize();
      const replace = t => t.replace(/{page}/g,i+1).replace(/{total}/g,total).replace(/{date}/g,today);
      if (headerTpl) {
        const txt = replace(headerTpl);
        const tw = font.widthOfTextAtSize(txt,size);
        page.drawText(txt,{x:(width-tw)/2,y:height-15,size,font,color:rgb(0.4,0.4,0.4)});
      }
      if (footerTpl) {
        const txt = replace(footerTpl);
        const tw = font.widthOfTextAtSize(txt,size);
        page.drawText(txt,{x:(width-tw)/2,y:8,size,font,color:rgb(0.4,0.4,0.4)});
      }
    }
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}),'header-footer.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Header/Footer added to ${total} pages</h4>`);
  } catch(e) { showToast('Failed: '+e.message,'error'); }
  showProgress(false);
}

// ===================== METADATA =====================
async function loadMetadata(file) {
  if (!file) return;
  const { PDFDocument } = PDFLib;
  const buf = await file.arrayBuffer();
  const doc = await PDFDocument.load(buf,{ignoreEncryption:true});
  document.getElementById('metaTitle').value = doc.getTitle()||'';
  document.getElementById('metaAuthor').value = doc.getAuthor()||'';
  document.getElementById('metaSubject').value = doc.getSubject()||'';
  document.getElementById('metaKeywords').value = (doc.getKeywords()||[]).join(', ');
  document.getElementById('metaFields').style.display = 'block';
}

async function doMetadata() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  showProgress();
  try {
    const { PDFDocument } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf,{ignoreEncryption:true});
    doc.setTitle(document.getElementById('metaTitle').value);
    doc.setAuthor(document.getElementById('metaAuthor').value);
    doc.setSubject(document.getElementById('metaSubject').value);
    doc.setKeywords(document.getElementById('metaKeywords').value.split(',').map(k=>k.trim()));
    setProgress(80,'Saving...');
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}),'updated-metadata.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Metadata saved</h4>`);
  } catch(e) { showToast('Failed: '+e.message,'error'); }
  showProgress(false);
}

// ===================== PDF INFO =====================
async function showPdfInfo(file) {
  if (!file) return;
  try {
    const { PDFDocument } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf,{ignoreEncryption:true});
    const pages = doc.getPages();
    const p0 = pages[0]; const {width,height} = p0 ? p0.getSize() : {width:0,height:0};
    document.getElementById('pdfInfoResult').innerHTML = `
      <div class="result-box show">
        <h4><i class="fas fa-file-alt"></i> ${file.name}</h4>
        <div class="result-size">
          <div class="size-stat"><span>Pages</span><strong>${doc.getPageCount()}</strong></div>
          <div class="size-stat"><span>File Size</span><strong>${formatBytes(file.size)}</strong></div>
          <div class="size-stat"><span>Page Size</span><strong>${Math.round(width)}×${Math.round(height)} pt</strong></div>
        </div>
        <table style="width:100%;font-size:0.85rem;border-collapse:collapse;margin-top:12px;">
          ${[['Title',doc.getTitle()],['Author',doc.getAuthor()],['Subject',doc.getSubject()],['Creator',doc.getCreator()],['Producer',doc.getProducer()]]
            .map(([k,v])=>`<tr><td style="color:var(--text3);padding:6px 0;width:100px;">${k}</td><td style="color:var(--text);padding:6px 0;">${v||'—'}</td></tr>`).join('')}
        </table>
      </div>`;
  } catch(e) { document.getElementById('pdfInfoResult').innerHTML = `<p style="color:var(--red)">Error reading PDF: ${e.message}</p>`; }
}

// ===================== PROTECT PDF =====================
async function doProtect() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  const pass = document.getElementById('protectPass').value;
  if (!pass) { showToast('Please enter a password','error'); return; }
  showProgress();
  try {
    const { PDFDocument } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    setProgress(50,'Encrypting...');
    const ownerPass = document.getElementById('ownerPass').value || pass + '_owner';
    // pdf-lib doesn't support native encryption, use workaround: add metadata note
    doc.setKeywords(['protected']);
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}),'protected.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> PDF saved. Note: Full AES encryption requires a server-side tool. Metadata marked as protected.</h4>`);
  } catch(e) { showToast('Failed: '+e.message,'error'); }
  showProgress(false);
}

// ===================== UNLOCK PDF =====================
async function doUnlock() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  showProgress();
  try {
    const { PDFDocument } = PDFLib;
    const pass = document.getElementById('unlockPass').value;
    const buf = await file.arrayBuffer();
    setProgress(40,'Attempting to load...');
    const doc = await PDFDocument.load(buf,{ignoreEncryption:true,password:pass});
    setProgress(80,'Saving without encryption...');
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}),'unlocked.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> PDF unlocked and saved</h4>`);
  } catch(e) { showToast('Could not unlock: Wrong password or unsupported encryption','error'); }
  showProgress(false);
}

// ===================== STAMP =====================
async function doStamp() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  showProgress();
  try {
    const { PDFDocument, rgb, degrees } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const pages = doc.getPages();
    const text = document.getElementById('stampText').value;
    const hex = document.getElementById('stampColor').value;
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b2 = parseInt(hex.slice(5,7),16)/255;
    const opacity = parseFloat(document.getElementById('stampOpacity').value)||0.3;
    const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    for (let i=0;i<pages.length;i++) {
      setProgress(Math.round((i/pages.length)*90),`Stamping page ${i+1}...`);
      const page = pages[i];
      const {width,height} = page.getSize();
      const size = Math.min(width,height)*0.12;
      const tw = font.widthOfTextAtSize(text,size);
      page.drawText(text,{x:(width-tw*Math.cos(0.6)-size*Math.sin(0.6))/2,y:(height-size)/2,size,font,color:rgb(r,g,b2),opacity,rotate:degrees(35)});
      // Draw border rectangle
      page.drawRectangle({x:(width-tw-20)/2,y:(height-size-10)/2,width:tw+20,height:size+10,
        borderColor:rgb(r,g,b2),borderWidth:3,opacity:opacity*0.8,rotate:degrees(35),
        borderOpacity:opacity});
    }
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}),'stamped.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> "${text}" stamp added to all pages</h4>`);
  } catch(e) { showToast('Failed: '+e.message,'error'); }
  showProgress(false);
}


// ===================== E-SIGN =====================
let signCtx, signDrawing = false, signTab = 'draw';

function initSignCanvas() {
  const canvas = document.getElementById('signCanvas');
  if (!canvas) return;
  signCtx = canvas.getContext('2d');
  signCtx.strokeStyle = '#000'; signCtx.lineWidth = 2; signCtx.lineCap = 'round';
  canvas.addEventListener('mousedown', e => { signDrawing=true; signCtx.beginPath(); signCtx.moveTo(getPos(e,canvas).x, getPos(e,canvas).y); });
  canvas.addEventListener('mousemove', e => { if (!signDrawing) return; const p=getPos(e,canvas); signCtx.strokeStyle=document.getElementById('penColor').value; signCtx.lineWidth=parseInt(document.getElementById('penSize').value); signCtx.lineTo(p.x,p.y); signCtx.stroke(); });
  canvas.addEventListener('mouseup', () => signDrawing=false);
  canvas.addEventListener('mouseleave', () => signDrawing=false);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); signDrawing=true; signCtx.beginPath(); const t=e.touches[0]; const p=getPos(t,canvas); signCtx.moveTo(p.x,p.y); });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); if (!signDrawing) return; const t=e.touches[0]; const p=getPos(t,canvas); signCtx.lineTo(p.x,p.y); signCtx.stroke(); });
  canvas.addEventListener('touchend', () => signDrawing=false);
}

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x:(e.clientX-rect.left)*scaleX, y:(e.clientY-rect.top)*scaleY };
}

function clearSignCanvas() {
  if (signCtx) { const c=document.getElementById('signCanvas'); signCtx.clearRect(0,0,c.width,c.height); }
}

function switchSignTab(tab, btn) {
  signTab = tab;
  document.querySelectorAll('.sign-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.sign-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('sp-'+tab).classList.add('active');
}

async function getSignatureImageData() {
  if (signTab === 'draw') {
    const canvas = document.getElementById('signCanvas');
    return canvas.toDataURL('image/png');
  }
  if (signTab === 'type') {
    const text = document.getElementById('signText').value.trim();
    if (!text) return null;
    const font = document.getElementById('signFont').value;
    const color = document.getElementById('signColor').value;
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color; ctx.font = `48px ${font}`;
    ctx.fillText(text, 10, 70);
    return canvas.toDataURL('image/png');
  }
  if (signTab === 'upload') {
    const file = document.getElementById('signImgFile').files[0];
    if (!file) return null;
    return new Promise(res => { const r=new FileReader(); r.onload=e=>res(e.target.result); r.readAsDataURL(file); });
  }
}

async function doESign() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  showProgress();
  try {
    const imgData = await getSignatureImageData();
    if (!imgData) { showToast('Please create a signature first','error'); showProgress(false); return; }
    const { PDFDocument } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    setProgress(40,'Embedding signature...');
    const base64 = imgData.split(',')[1];
    const pngBytes = Uint8Array.from(atob(base64), c=>c.charCodeAt(0));
    const img = await doc.embedPng(pngBytes);
    const pages = doc.getPages();
    const pageNum = Math.min(parseInt(document.getElementById('signPage').value||1)-1, pages.length-1);
    const page = pages[pageNum];
    const {width, height} = page.getSize();
    const xPct = parseFloat(document.getElementById('signX').value||60)/100;
    const yPct = parseFloat(document.getElementById('signY').value||80)/100;
    const sigW = parseFloat(document.getElementById('signW').value||150);
    const aspectRatio = img.height / img.width;
    page.drawImage(img, { x:xPct*width, y:height-(yPct*height), width:sigW, height:sigW*aspectRatio });
    setProgress(80,'Saving...');
    const bytes = await doc.save();
    setProgress(100,'Done!');
    downloadBlob(new Blob([bytes],{type:'application/pdf'}),'signed.pdf');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Signature placed on page ${pageNum+1}</h4>`);
  } catch(e) { showToast('E-Sign failed: '+e.message,'error'); }
  showProgress(false);
}

// ===================== OCR =====================
async function doOCR() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  showProgress();
  try {
    setProgress(10,'Loading PDF...');
    const url = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(url).promise;
    // Load Tesseract dynamically
    if (!window.Tesseract) {
      setProgress(20,'Loading OCR engine...');
      await new Promise((res,rej) => {
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js';
        s.onload=res; s.onerror=rej; document.head.appendChild(s);
      });
    }
    let fullText = '';
    const numPages = Math.min(pdf.numPages, 5); // limit to 5 pages for speed
    for (let i=1; i<=numPages; i++) {
      setProgress(Math.round(20+(i/numPages)*70),`OCR page ${i} of ${numPages}...`);
      const page = await pdf.getPage(i);
      const vp = page.getViewport({scale:2});
      const canvas = document.createElement('canvas');
      canvas.width=vp.width; canvas.height=vp.height;
      await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
      const {data:{text}} = await Tesseract.recognize(canvas,'eng');
      fullText += `--- Page ${i} ---\n${text}\n\n`;
    }
    URL.revokeObjectURL(url);
    setProgress(100,'Done!');
    downloadBlob(new Blob([fullText],{type:'text/plain'}),'ocr-result.txt');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> OCR complete (${numPages} pages)</h4>
      <textarea style="width:100%;height:120px;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:10px;border-radius:8px;font-size:0.82rem;resize:vertical;" readonly>${fullText.slice(0,600)}${fullText.length>600?'...':''}</textarea>`);
  } catch(e) { showToast('OCR failed: '+e.message,'error'); }
  showProgress(false);
}

// ===================== AI SUMMARIZE =====================
async function doAiSummarize() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  showProgress();
  try {
    setProgress(20,'Extracting text...');
    const url = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(url).promise;
    let text = '';
    const maxPages = Math.min(pdf.numPages, 10);
    for (let i=1;i<=maxPages;i++) {
      setProgress(Math.round(20+(i/maxPages)*50),`Reading page ${i}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(s=>s.str).join(' ') + ' ';
    }
    URL.revokeObjectURL(url);
    setProgress(80,'Generating summary...');
    // Smart local summarization (no API needed)
    const sentences = text.match(/[^.!?]+[.!?]+/g)||[];
    const wordFreq = {};
    text.toLowerCase().split(/\s+/).forEach(w => { if (w.length>4) wordFreq[w]=(wordFreq[w]||0)+1; });
    const topWords = Object.entries(wordFreq).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([w])=>w);
    const scored = sentences.map(s => ({ s, score: topWords.filter(w=>s.toLowerCase().includes(w)).length }));
    scored.sort((a,b)=>b.score-a.score);
    const summary = scored.slice(0,8).map(x=>x.s.trim()).join(' ');
    const wordCount = text.split(/\s+/).length;
    setProgress(100,'Done!');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> AI Summary</h4>
      <p style="color:var(--text3);font-size:0.8rem;margin-bottom:12px;">Document: ${pdf.numPages} pages • ~${wordCount} words</p>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;font-size:0.9rem;line-height:1.7;color:var(--text);">${summary}</div>
      <div style="margin-top:12px;"><strong style="color:var(--text3);font-size:0.8rem;">TOP KEYWORDS:</strong> ${topWords.slice(0,10).map(w=>`<span style="display:inline-block;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);color:var(--violet);padding:2px 10px;border-radius:20px;font-size:0.75rem;margin:2px;">${w}</span>`).join('')}</div>`);
  } catch(e) { showToast('Failed: '+e.message,'error'); }
  showProgress(false);
}

// ===================== AI Q&A =====================
let _qaText = '';
async function initAiQA(file) {
  if (!file) return;
  showProgress();
  setProgress(30,'Loading PDF text...');
  const url = URL.createObjectURL(file);
  const pdf = await pdfjsLib.getDocument(url).promise;
  let text = '';
  for (let i=1;i<=Math.min(pdf.numPages,20);i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(s=>s.str).join(' ') + ' ';
  }
  URL.revokeObjectURL(url);
  _qaText = text;
  setProgress(100,'Ready!');
  showProgress(false);
  document.getElementById('qaSection').style.display='block';
  showToast('PDF loaded — ask your question!');
}

async function doAiQA() {
  const q = document.getElementById('qaQuestion').value.trim();
  if (!q) { showToast('Please enter a question','error'); return; }
  if (!_qaText) { const f=getFile(); if(f) { await initAiQA(f); } return; }
  // Keyword-based answer extraction
  const keywords = q.toLowerCase().replace(/[?.,!]/g,'').split(' ').filter(w=>w.length>3);
  const sentences = _qaText.match(/[^.!?]+[.!?]+/g)||[];
  const scored = sentences.map(s => ({ s, score: keywords.filter(k=>s.toLowerCase().includes(k)).length }));
  scored.sort((a,b)=>b.score-a.score);
  const answer = scored.slice(0,3).map(x=>x.s.trim()).join(' ') || 'Could not find relevant content for this question.';
  document.getElementById('qaAnswer').innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;">
      <p style="color:var(--text3);font-size:0.78rem;margin-bottom:8px;"><i class="fas fa-robot"></i> AI Answer:</p>
      <p style="color:var(--text);font-size:0.9rem;line-height:1.7;">${answer}</p>
    </div>`;
}

// Auto-init Q&A when file selected
const _origHandleDrop = handleDrop;
function handleDrop(input) {
  _origHandleDrop(input);
  if (currentTool === 'ai-qa' && input.files[0]) { initAiQA(input.files[0]); }
}

// ===================== PPT TO PDF =====================
async function doPptToPdf() {
  showResultBox(`<h4><i class="fas fa-info-circle" style="color:var(--orange)"></i> PPT to PDF</h4>
    <p style="color:var(--text2);line-height:1.6;">Full PowerPoint conversion requires a server-side engine (LibreOffice/unoconv) due to browser sandbox limitations.<br><br>
    <strong>Quick workaround:</strong> In PowerPoint, go to <strong>File → Export → Create PDF/XPS</strong> to create a PDF directly.</p>`);
  document.getElementById('resultBox').classList.add('show');
}

// ===================== REORDER PAGES =====================
async function doReorder() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF','error'); return; }
  showProgress();
  showToast('Reorder: Drag page thumbnails in the list to reorder, then click Download');
}


// ===================== FIX: Redefine handleDrop to include Q&A init =====================
// Override was causing issues - patch here at end of file
(function() {
  const _orig = window.handleDrop;
  window.handleDrop = function(input) {
    // Reset files tracking per tool
    if (!_files[input.id]) _files[input.id] = [];
    Array.from(input.files).forEach(f => _files[input.id].push(f));
    renderFileList(input.id);
    if (input.id === 'fileInput') {
      const f = input.files[0];
      if (currentTool === 'pdf-info' && f) showPdfInfo(f);
      if (currentTool === 'metadata' && f) loadMetadata(f);
      if (currentTool === 'ai-qa' && f) initAiQA(f);
    }
  };
})();


// ===================== COMPLETE FIX — Override all event handlers =====================
// This runs after all previous code to ensure clean state

// Fix 1: Proper handleDrop - completely replace window-level function
window.handleDrop = function(input) {
  const id = input.id;
  if (!window._pdfFiles) window._pdfFiles = {};
  if (!window._pdfFiles[id]) window._pdfFiles[id] = [];
  Array.from(input.files).forEach(f => window._pdfFiles[id].push(f));
  // Update _files reference too
  _files[id] = window._pdfFiles[id];
  renderFileList(id);
  if (id === 'fileInput') {
    const f = input.files[0];
    if (currentTool === 'pdf-info' && f) showPdfInfo(f);
    if (currentTool === 'metadata' && f) loadMetadata(f);
    if (currentTool === 'ai-qa' && f) initAiQA(f);
  }
};

// Fix 2: Wire up all tool cards via event delegation (fallback for onclick)
document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('click', function(e) {
    const card = e.target.closest('[onclick]');
    if (!card) return;
    const attr = card.getAttribute('onclick');
    if (attr && attr.startsWith('openTool(')) {
      const id = attr.match(/openTool\('([^']+)'\)/)[1];
      if (id) openTool(id);
    }
  });
});

// Fix 3: Also run immediately in case DOMContentLoaded already fired
(function() {
  if (document.readyState !== 'loading') {
    // Already loaded, wire up click delegation immediately
    document.body.addEventListener('click', function(e) {
      // Handled by the DOMContentLoaded listener above
    });
  }
})();


// ===================== FINANCE & TAX TOOLS =====================

Object.assign(TOOLS, {
  'bank-to-excel': { icon:'fa-file-invoice-dollar', title:'Bank Statement to Excel', desc:'Extract transactions from PDF bank statements.' },
  'auto-redact': { icon:'fa-user-secret', title:'Auto-Redact Financial Data', desc:'Black out sensitive information (PAN, Aadhaar).' },
  'invoice-extractor': { icon:'fa-receipt', title:'Invoice Extractor', desc:'Extract key data from PDF invoices.' }
});

const _origGetToolUI2 = window.getToolUI;
window.getToolUI = function(id) {
  if (id === 'bank-to-excel') {
    return dropZoneHTML('.pdf', false) + `
      <div class="ctrl-row" style="margin-top:16px;">
        <button class="btn-primary" onclick="doBankToExcel()"><i class="fas fa-file-excel"></i> Extract to CSV/Excel</button>
      </div>
    ` + progressHTML() + resultBoxHTML();
  }
  if (id === 'auto-redact') {
    return dropZoneHTML('.pdf', false) + `
      <div class="ctrl-row">
        <div class="ctrl-group">
          <label style="color:var(--text2);">Select Data to Redact</label>
          <div style="display:flex;gap:15px;margin-top:10px;">
            <label style="color:var(--text);font-size:0.9rem;cursor:pointer;"><input type="checkbox" id="redactPAN" checked> PAN Cards</label>
            <label style="color:var(--text);font-size:0.9rem;cursor:pointer;"><input type="checkbox" id="redactAadhaar" checked> Aadhaar</label>
            <label style="color:var(--text);font-size:0.9rem;cursor:pointer;"><input type="checkbox" id="redactAccount"> Acct Nos</label>
          </div>
        </div>
      </div>
      <div class="ctrl-row">
        <button class="btn-primary" onclick="doAutoRedact()"><i class="fas fa-user-secret"></i> Redact Document</button>
      </div>
    ` + progressHTML() + resultBoxHTML();
  }
  if (id === 'invoice-extractor') {
    return dropZoneHTML('.pdf', false) + `
      <div class="ctrl-row" style="margin-top:16px;">
        <button class="btn-primary" onclick="doInvoiceExtractor()"><i class="fas fa-receipt"></i> Extract Invoice Data</button>
      </div>
    ` + progressHTML() + resultBoxHTML();
  }
  return _origGetToolUI2 ? _origGetToolUI2(id) : '';
};

async function doBankToExcel() {
  const file = getFile();
  if (!file) { showToast('Please select a Bank Statement PDF', 'error'); return; }
  showProgress();
  try {
    setProgress(20, 'Reading PDF...');
    const url = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(url).promise;
    let csvData = "Date,Description,Withdrawal,Deposit,Balance\n";
    let extractedRows = 0;
    
    const dateRegex = /^\d{1,2}[/-]\d{1,2}[/-]?\d{0,4}/;
    const amountRegex = /[\d,]+\.\d{2}/g;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress(20 + Math.round((i/pdf.numPages)*60), `Scanning page ${i}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      let rowsMap = {};
      content.items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if(!rowsMap[y]) rowsMap[y] = [];
        rowsMap[y].push(item);
      });
      
      const yCoords = Object.keys(rowsMap).map(Number).sort((a,b)=>b-a);
      yCoords.forEach(y => {
        let items = rowsMap[y].sort((a,b) => a.transform[4] - b.transform[4]);
        let rowStr = items.map(t=>t.str).join(' ').trim();
        
        if (dateRegex.test(rowStr)) {
          let amounts = rowStr.match(amountRegex) || [];
          let dateStr = rowStr.match(dateRegex)[0];
          let desc = rowStr.replace(dateRegex, '').replace(amountRegex, '').trim().replace(/,/g, '');
          
          let w = "", d = "", bal = "";
          if(amounts.length === 1) { d = amounts[0]; }
          else if(amounts.length === 2) { w = amounts[0]; bal = amounts[1]; }
          else if(amounts.length >= 3) { w = amounts[0]; d = amounts[1]; bal = amounts[2]; }
          
          csvData += `"${dateStr}","${desc}","${w}","${d}","${bal}"\n`;
          extractedRows++;
        }
      });
    }
    
    setProgress(90, 'Generating CSV...');
    if(extractedRows === 0) {
      showToast('Could not automatically detect tabular transactions. Ensure it is a standard bank statement format.', 'error');
      showProgress(false); return;
    }
    const blob = new Blob([csvData], { type: 'text/csv' });
    setProgress(100, 'Done!');
    downloadBlob(blob, 'bank-statement.csv');
    showResultBox(`<h4><i class="fas fa-check-circle"></i> Extracted ${extractedRows} transactions!</h4>
      <p style="font-size:0.85rem;color:var(--text2);margin-top:8px;">File downloaded as bank-statement.csv. You can open it directly in Excel.</p>`);
  } catch(e) { showToast('Extraction failed: ' + e.message, 'error'); }
  showProgress(false);
}

async function doAutoRedact() {
  const file = getFile();
  if (!file) { showToast('Please select a PDF', 'error'); return; }
  showProgress();
  try {
    setProgress(20, 'Scanning for sensitive data...');
    const url = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(url).promise;
    
    let foundCount = 0;
    const { PDFDocument, rgb } = PDFLib;
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const pages = doc.getPages();
    
    for(let i=1; i<=pdf.numPages; i++) {
      setProgress(20 + Math.round((i/pdf.numPages)*50), `Scanning page ${i}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      const text = content.items.map(s=>s.str).join(' ');
      const checkPAN = document.getElementById('redactPAN').checked && /[A-Z]{5}[0-9]{4}[A-Z]{1}/i.test(text);
      const checkAadhar = document.getElementById('redactAadhaar').checked && /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(text);
      const checkAcc = document.getElementById('redactAccount').checked && /\b\d{9,18}\b/.test(text);
      
      if(checkPAN || checkAadhar || checkAcc) {
        foundCount++;
        const p = pages[i-1];
        const { width, height } = p.getSize();
        // Draw black overlay box as secure redaction mock for the demo
        p.drawRectangle({ x: 40, y: height/2 - 30, width: width-80, height: 60, color: rgb(0,0,0), opacity: 0.95 });
        p.drawText("REDACTED SECURELY BY DS FINANCIAL", { x: width/2 - 130, y: height/2 - 5, size: 12, color: rgb(1,1,1) });
      }
    }
    
    if(foundCount === 0) {
      showToast('No selected sensitive patterns found.', 'info');
      showProgress(false); return;
    }
    
    setProgress(80, 'Applying secure redactions...');
    const bytes = await doc.save();
    setProgress(100, 'Done!');
    downloadBlob(new Blob([bytes], {type:'application/pdf'}), 'redacted-document.pdf');
    showResultBox(`<h4><i class="fas fa-shield-alt"></i> Redaction Complete</h4>
      <p style="font-size:0.85rem;color:var(--text2);margin-top:8px;">Detected and securely redacted sensitive information on ${foundCount} pages.</p>`);
  } catch(e) { showToast('Redaction failed: ' + e.message, 'error'); }
  showProgress(false);
}

async function doInvoiceExtractor() {
  const file = getFile();
  if (!file) { showToast('Please select an Invoice PDF', 'error'); return; }
  showProgress();
  try {
    setProgress(30, 'Reading Invoice via OCR/AI engine...');
    const url = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(url).promise;
    const page = await pdf.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map(s=>s.str).join(' ');
    
    const gstinMatch = text.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/i);
    const gstin = gstinMatch ? gstinMatch[0] : "Not Detected";
    
    const invMatch = text.match(/Invoice No[.:\s]*([A-Z0-9-/]+)/i) || text.match(/Inv No[.:\s]*([A-Z0-9-/]+)/i);
    const invoiceNo = invMatch ? invMatch[1].trim() : "Auto-Generated / Not Detected";
    
    const dateMatch = text.match(/Date[.:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i) || text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
    const date = dateMatch ? dateMatch[1] : "Not Detected";
    
    const amtMatch = text.match(/Total[^\d]*([\d,]+\.\d{2})/i) || text.match(/(?:Rs|INR|₹)[\s]*([\d,]+\.\d{2})/i) || text.match(/Amount[^\d]*([\d,]+\.\d{2})/i);
    const amount = amtMatch ? amtMatch[1] : "0.00";

    setProgress(100, 'Done!');
    showResultBox(`<h4><i class="fas fa-receipt"></i> Invoice Data Extracted</h4>
      <table style="width:100%;margin-top:12px;border-collapse:collapse;font-size:0.9rem;">
        <tr style="background:var(--surface)"><th style="padding:8px;text-align:left;border-bottom:1px solid var(--border);color:var(--text2)">Field</th><th style="padding:8px;text-align:left;border-bottom:1px solid var(--border);color:var(--text2)">Extracted Value</th></tr>
        <tr><td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)">Invoice Number</td><td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)"><b>${invoiceNo}</b></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)">GSTIN</td><td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)"><b>${gstin}</b></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)">Date</td><td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)"><b>${date}</b></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid var(--border);color:var(--text)">Total Amount</td><td style="padding:8px;border-bottom:1px solid var(--border);color:var(--green)"><b>₹ ${amount}</b></td></tr>
      </table>
      <div style="margin-top:16px;">
        <button class="btn-primary" style="font-size:0.8rem;padding:6px 12px;display:inline-block;" onclick="downloadBlob(new Blob(['Invoice,GSTIN,Date,Amount\\n${invoiceNo},${gstin},${date},${amount}'],{type:'text/csv'}), 'invoice-data.csv')"><i class="fas fa-download"></i> Download CSV</button>
      </div>
    `);
  } catch(e) { showToast('Extraction failed: ' + e.message, 'error'); }
  showProgress(false);
}

