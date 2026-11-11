/**
 * tab_screener.js — Screener.in Live Data (100% Client-Side)
 *
 * NO backend required. Works on Surge, GitHub Pages, or any static host.
 *
 * Flow:
 *   Search   → screener.in/api/company/search  (direct, CORS-friendly JSON)
 *   Company  → screener.in/company/{TICKER}/   via CORS proxy → HTML parsed in-browser
 *
 * CORS proxies (tried in order):
 *   1. api.allorigins.win
 *   2. corsproxy.io
 */

// ── CORS Proxy helpers ────────────────────────────────────────────────────────
const _PROXIES = [
    function(u){ return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
    function(u){ return 'https://corsproxy.io/?' + encodeURIComponent(u); }
];

async function _proxyFetch(url) {
    var lastErr = null;
    for (var pi = 0; pi < _PROXIES.length; pi++) {
        try {
            var ctrl = new AbortController();
            var tid  = setTimeout(function(){ ctrl.abort(); }, 18000);
            var r = await fetch(_PROXIES[pi](url), { signal: ctrl.signal });
            clearTimeout(tid);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return await r.text();
        } catch(e) { lastErr = e; }
    }
    throw new Error('Screener.in is unreachable. Check your internet connection.');
}

// ── Client-side cache (15 min) ────────────────────────────────────────────────
var _scCache = new Map();
var _SC_TTL  = 15 * 60 * 1000;
function _scGet(k){ var e=_scCache.get(k); return (e && Date.now()-e.ts<_SC_TTL) ? e.d : null; }
function _scSet(k,d){ _scCache.set(k,{d:d,ts:Date.now()}); }

// ── State ─────────────────────────────────────────────────────────────────────
var _scrData   = null;
var _scrCharts = {};
var _scrSelected = null;

// ── Number formatting ─────────────────────────────────────────────────────────
function sfmt(v,dec,suf){ if(v==null||isNaN(v)) return '—'; return v.toFixed(dec||1)+(suf||''); }
function scrCr(v){ if(v==null) return '—'; return '₹'+Number(v.toFixed(0)).toLocaleString('en-IN')+' Cr'; }
function scrPct(v){ return v==null ? '—' : v.toFixed(1)+'%'; }

// ── Signal badge ──────────────────────────────────────────────────────────────
function badge(val,gt,rt,hi){
    if(val==null) return '<span class="scr-badge scr-na">N/A</span>';
    hi = (hi===undefined) ? true : hi;
    var good = hi ? val>=gt : val<=gt;
    var bad  = hi ? val<=rt : val>=rt;
    var cls  = good?'scr-green':bad?'scr-red':'scr-amber';
    return '<span class="scr-badge '+cls+'">'+sfmt(val,1)+'%</span>';
}

// ── Inject CSS once ───────────────────────────────────────────────────────────
(function injectCSS(){
    if(document.getElementById('screener-css')) return;
    var s = document.createElement('style');
    s.id  = 'screener-css';
    s.textContent = `
#view-screener{background:var(--bg-primary);overflow-y:auto;}
.scr-shell{max-width:1400px;margin:0 auto;padding:24px;}
.scr-search-row{display:flex;gap:10px;margin-bottom:24px;align-items:center;}
.scr-search-wrap{position:relative;flex:1;max-width:520px;}
.scr-search-input{width:100%;padding:11px 16px 11px 42px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-primary);font-size:14px;font-family:var(--font-sans);transition:border-color .2s,box-shadow .2s;}
.scr-search-input:focus{outline:none;border-color:var(--accent-blue);box-shadow:0 0 0 3px rgba(59,130,246,.15);}
.scr-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;}
.scr-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:1000;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-md);max-height:280px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.4);}
.scr-drop-item{padding:10px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border-primary);display:flex;align-items:center;gap:10px;transition:background .15s;}
.scr-drop-item:hover{background:var(--bg-tertiary);}
.scr-drop-item .scr-tick{font-family:var(--font-mono);font-size:11px;color:var(--accent-blue);background:rgba(59,130,246,.12);padding:2px 6px;border-radius:4px;}
.scr-drop-empty{padding:14px;text-align:center;color:var(--text-muted);font-size:13px;}
.scr-fetch-btn{padding:11px 22px;background:var(--accent-blue);color:#fff;border:none;border-radius:var(--radius-md);cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:7px;transition:opacity .2s,transform .15s;}
.scr-fetch-btn:hover{opacity:.88;transform:translateY(-1px);}
.scr-fetch-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.scr-import-btn{padding:11px 22px;background:var(--accent-green);color:#fff;border:none;border-radius:var(--radius-md);cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:7px;transition:opacity .2s;display:none;}
.scr-import-btn:hover{opacity:.88;}
.scr-peer-btn{padding:11px 18px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border-primary);border-radius:var(--radius-md);cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:7px;transition:background .15s;}
.scr-peer-btn:hover{background:var(--bg-secondary);}
.scr-status{text-align:center;padding:60px 20px;color:var(--text-muted);}
.scr-status i{font-size:2.5rem;margin-bottom:12px;display:block;}
.scr-error{color:var(--accent-red);}
.scr-kpi-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px;}
.scr-kpi{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-md);padding:14px 16px;transition:border-color .2s;}
.scr-kpi:hover{border-color:var(--accent-blue);}
.scr-kpi-label{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:4px;}
.scr-kpi-value{font-size:1.35rem;font-weight:700;color:var(--text-primary);}
.scr-kpi-sub{font-size:10px;color:var(--text-muted);margin-top:2px;}
.scr-kpi-green{border-left:3px solid var(--accent-green);}
.scr-kpi-red{border-left:3px solid var(--accent-red);}
.scr-kpi-blue{border-left:3px solid var(--accent-blue);}
.scr-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
@media(max-width:900px){.scr-grid-2{grid-template-columns:1fr;}}
.scr-card{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-md);overflow:hidden;}
.scr-card-header{padding:10px 16px;border-bottom:1px solid var(--border-primary);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;display:flex;align-items:center;gap:8px;}
.scr-card-header i{color:var(--accent-blue);}
.scr-card-body{padding:16px;}
.scr-chart-wrap{height:200px;position:relative;}
.scr-table{width:100%;border-collapse:collapse;font-size:12px;}
.scr-table th{padding:7px 12px;text-align:right;color:var(--text-muted);font-weight:500;font-size:11px;background:var(--bg-tertiary);}
.scr-table th:first-child{text-align:left;}
.scr-table td{padding:7px 12px;text-align:right;border-bottom:1px solid var(--border-primary);}
.scr-table td:first-child{text-align:left;color:var(--text-muted);font-size:11px;}
.scr-table tr:hover td{background:rgba(255,255,255,.03);}
.scr-badge{padding:2px 7px;border-radius:99px;font-size:10px;font-weight:600;}
.scr-green{background:rgba(34,197,94,.15);color:var(--accent-green);}
.scr-amber{background:rgba(245,158,11,.15);color:var(--accent-amber);}
.scr-red{background:rgba(239,68,68,.15);color:var(--accent-red);}
.scr-na{background:var(--bg-tertiary);color:var(--text-muted);}
.scr-ratios-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;}
.scr-ratio-item{background:var(--bg-tertiary);border-radius:var(--radius-sm);padding:10px 12px;border:1px solid var(--border-primary);}
.scr-ratio-name{font-size:10px;color:var(--text-muted);margin-bottom:3px;}
.scr-ratio-val{font-size:1.1rem;font-weight:700;}
.scr-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;}
.scr-chip{padding:6px 14px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:99px;font-size:12px;cursor:pointer;transition:all .15s;}
.scr-chip:hover{border-color:var(--accent-blue);color:var(--accent-blue);}
.scr-proxy-note{font-size:11px;color:var(--text-muted);margin-top:8px;text-align:center;}
@keyframes scr-spin{to{transform:rotate(360deg);}}
.scr-spin{animation:scr-spin 1s linear infinite;display:inline-block;}
`;
    document.head.appendChild(s);
})();

// ── Shell HTML ────────────────────────────────────────────────────────────────
function renderScreenerShell(){
    var v = document.getElementById('view-screener');
    if(!v) return;
    v.innerHTML = `
<div class="scr-shell">
  <div class="scr-search-row">
    <div class="scr-search-wrap">
      <i class="fas fa-search scr-search-icon"></i>
      <input id="scrSearchInput" class="scr-search-input"
             placeholder="Search NSE/BSE company or ticker…"
             autocomplete="off"
             oninput="scrOnInput(this.value)"
             onkeydown="scrOnKey(event)">
      <div id="scrDropdown" class="scr-dropdown" style="display:none"></div>
    </div>
    <button class="scr-fetch-btn" id="scrFetchBtn" onclick="scrFetch()">
      <i class="fas fa-download"></i> Fetch Data
    </button>
    <button class="scr-import-btn" id="scrImportBtn" onclick="scrImportModel()">
      <i class="fas fa-file-import"></i> Import to Model
    </button>
    <button class="scr-peer-btn" onclick="scrOpenPeer()">
      <i class="fas fa-balance-scale"></i> Compare Peers
    </button>
  </div>

  <div class="scr-chips">
    <span class="scr-chip" onclick="scrQuick('TCS')">TCS</span>
    <span class="scr-chip" onclick="scrQuick('RELIANCE')">Reliance</span>
    <span class="scr-chip" onclick="scrQuick('INFY')">Infosys</span>
    <span class="scr-chip" onclick="scrQuick('HDFCBANK')">HDFC Bank</span>
    <span class="scr-chip" onclick="scrQuick('WIPRO')">Wipro</span>
    <span class="scr-chip" onclick="scrQuick('TATAMOTORS')">Tata Motors</span>
    <span class="scr-chip" onclick="scrQuick('BAJFINANCE')">Bajaj Finance</span>
    <span class="scr-chip" onclick="scrQuick('ASIANPAINT')">Asian Paints</span>
  </div>

  <div id="scrContent">
    <div class="scr-status">
      <i class="fas fa-chart-line" style="color:var(--accent-blue)"></i>
      <p style="font-size:1rem;font-weight:600;margin-bottom:6px">Screener.in Live Fundamentals</p>
      <p>Search or pick a company above to load 10-year P&L,<br>Balance Sheet, Ratios & auto-fill your DCF model.</p>
      <p class="scr-proxy-note"><i class="fas fa-shield-alt"></i> Data fetched live from Screener.in via secure proxy</p>
    </div>
  </div>
</div>`;
}

// ── Quick chip select ──────────────────────────────────────────────────────────
function scrQuick(ticker){
    var inp = document.getElementById('scrSearchInput');
    if(inp) inp.value = ticker;
    _scrSelected = { ticker: ticker, name: ticker };
    scrFetch(ticker);
}

// ── Autocomplete ───────────────────────────────────────────────────────────────
var _scrDebounce = null;
function scrOnInput(val){
    clearTimeout(_scrDebounce);
    if(!val || val.length < 2){ scrHideDrop(); return; }
    _scrDebounce = setTimeout(function(){ scrSearch(val); }, 300);
}
function scrOnKey(e){
    if(e.key==='Enter'){ scrHideDrop(); scrFetch(); }
    if(e.key==='Escape') scrHideDrop();
}

async function scrSearch(q){
    try {
        var cached = _scGet('search:'+q);
        var results;
        if(cached){
            results = cached;
        } else {
            // Screener.in search API — try direct (often works), then proxy
            var url = 'https://www.screener.in/api/company/search/?q='+encodeURIComponent(q)+'&v=3';
            var data = null;
            try {
                var r = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined });
                if(r.ok) data = await r.json();
            } catch(e1){}
            if(!data){
                var txt = await _proxyFetch(url);
                data = JSON.parse(txt);
            }
            results = Array.isArray(data) ? data : (data.results || []);
            _scSet('search:'+q, results);
        }
        scrShowDrop(results.slice(0,10));
    } catch(e){ scrHideDrop(); }
}

function scrShowDrop(results){
    var drop = document.getElementById('scrDropdown');
    if(!drop) return;
    if(!results.length){
        drop.innerHTML='<div class="scr-drop-empty"><i class="fas fa-search"></i> No matches</div>';
        drop.style.display='block';
        return;
    }
    drop.innerHTML = results.map(function(r){
        // Extract ticker: /company/RELIANCE/consolidated/ → take first segment only → RELIANCE
        var urlPath = (r.url||'').replace(/.*\/company\//i,'');
        var ticker  = urlPath.split('/')[0] || r.short_name || '';
        ticker = ticker.toUpperCase();
        var name = r.name || ticker;
        return '<div class="scr-drop-item" onclick="scrSelectItem(\''+ticker+'\',\''+name.replace(/'/g,"\\'")+'\')">'
              +'<span class="scr-tick">'+ticker+'</span>'
              +'<span>'+name+'</span>'
              +'</div>';
    }).join('');
    drop.style.display='block';
}
function scrHideDrop(){ var d=document.getElementById('scrDropdown'); if(d) d.style.display='none'; }
function scrSelectItem(ticker,name){
    _scrSelected = {ticker:ticker, name:name};
    var inp = document.getElementById('scrSearchInput');
    if(inp) inp.value = ticker + '  —  ' + name;
    scrHideDrop();
}

// ══════════════════════════════════════════════════════════════════════════════
// ── HTML PARSING (ported from screener-service.js) ────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function _parseNum(str){
    if(!str||str==='--'||str===''||/^n\/a$/i.test(str)) return null;
    var cleaned = str.replace(/,/g,'').replace(/[₹$%]/g,'').replace(/\s+/g,'').replace(/Cr/gi,'').trim();
    var n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
}

function _stripTags(s){ return s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/&#\d+;/g,'').replace(/\s+/g,' ').trim(); }

function _parseTable(html, tableId){
    var sectionStart = html.indexOf('id="'+tableId+'"');
    if(sectionStart===-1) return null;
    var tblStart = html.indexOf('<table', sectionStart);
    if(tblStart===-1) return null;
    var tblEnd   = html.indexOf('</table>', tblStart) + 8;
    var tblHtml  = html.slice(tblStart, tblEnd);
    var rows=[], trRegex=/<tr[^>]*>([\s\S]*?)<\/tr>/gi, trMatch;
    while((trMatch=trRegex.exec(tblHtml))!==null){
        var cells=[], tdRegex=/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, tdMatch;
        while((tdMatch=tdRegex.exec(trMatch[1]))!==null) cells.push(_stripTags(tdMatch[1]));
        if(cells.length>0) rows.push(cells);
    }
    return rows;
}

function _tableToObj(rawRows){
    if(!rawRows||rawRows.length<2) return null;
    return { header: rawRows[0], rows: rawRows.slice(1) };
}

function _extractRows(tblObj, labels){
    if(!tblObj) return {};
    var result={};
    for(var ri=0;ri<tblObj.rows.length;ri++){
        var row   = tblObj.rows[ri];
        var label = row[0]||'';
        var keys  = Object.keys(labels);
        for(var ki=0;ki<keys.length;ki++){
            var key      = keys[ki];
            var patterns = labels[key];
            var matched  = false;
            for(var pi=0;pi<patterns.length;pi++){
                if(label.toLowerCase().indexOf(patterns[pi].toLowerCase())!==-1){ matched=true; break; }
            }
            if(matched) result[key] = row.slice(1).map(_parseNum);
        }
    }
    return result;
}

function _extractKeyMetrics(html){
    var metrics = {};
    var start = html.indexOf('id="top-ratios"');
    if(start===-1) start = html.indexOf('class="company-ratios"');
    if(start===-1) return metrics;
    var block = html.slice(start, start+5000);
    // Each ratio is: <li><span class="name">X</span> <span class="value">Y</span></li>
    var liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi, liM;
    while((liM=liRe.exec(block))!==null){
        var inner = liM[1];
        var nameM  = inner.match(/<span[^>]*class="[^"]*name[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
        var valueM = inner.match(/<span[^>]*(?:class="[^"]*(?:value|number)[^"]*"|id="[^"]*")[^>]*>([\s\S]*?)<\/span>/i);
        if(nameM && valueM){
            var n = _stripTags(nameM[1]);
            var v = _stripTags(valueM[1]);
            if(n && v) metrics[n] = v;
        }
    }
    return metrics;
}

function _extractCompanyInfo(html){
    var info = {};
    var h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if(h1M) info.name = _stripTags(h1M[1]);
    var cmpM = html.match(/<span[^>]*id="current-price"[^>]*>([\s\S]*?)<\/span>/i);
    if(!cmpM) cmpM = html.match(/Current Price[\s\S]*?<span[^>]*>([\d,\.]+)<\/span>/i);
    if(cmpM) info.price = _parseNum(cmpM[1]);
    var isinM = html.match(/ISIN[^:]*:[\s]*[^<]*<[^>]+>([A-Z]{2}[A-Z0-9]{10})/i);
    if(!isinM) isinM = html.match(/([A-Z]{2}[A-Z0-9]{10})/);
    if(isinM) info.isin = isinM[1];
    // sector from breadcrumb
    var secM = html.match(/class="[^"]*breadcrumb[^"]*"[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
    if(secM) info.sector = secM[1].trim();
    return info;
}

function parseScreenerHTML(html, ticker){
    var info       = _extractCompanyInfo(html);
    info.ticker    = ticker;
    info.screenerUrl = 'https://www.screener.in/company/'+ticker+'/';

    var keyMetrics = _extractKeyMetrics(html);

    var plRaw  = _parseTable(html,'profit-loss');
    var plTbl  = _tableToObj(plRaw);
    var plYears = (plTbl && plTbl.header) ? plTbl.header.slice(1) : [];
    var pl = _extractRows(plTbl,{
        revenue:      ['Sales','Revenue from Operations'],
        expenses:     ['Expenses'],
        ebitda:       ['Operating Profit','EBITDA'],
        ebitdaMargin: ['OPM %','EBITDA Margin'],
        otherIncome:  ['Other Income'],
        depreciation: ['Depreciation'],
        interest:     ['Interest'],
        pbt:          ['Profit before tax','PBT'],
        tax:          ['Tax %'],
        netProfit:    ['Net Profit','PAT'],
        eps:          ['EPS in Rs'],
        dividend:     ['Dividend Payout']
    });

    var bsRaw = _parseTable(html,'balance-sheet');
    var bsTbl = _tableToObj(bsRaw);
    var bs = _extractRows(bsTbl,{
        equity:       ['Equity Capital','Share Capital'],
        reserves:     ['Reserves'],
        longTermDebt: ['Borrowings','Long Term Borrowings'],
        totalAssets:  ['Total Assets'],
        cash:         ['Cash']
    });

    var cfRaw = _parseTable(html,'cash-flow');
    var cfTbl = _tableToObj(cfRaw);
    var cf = _extractRows(cfTbl,{
        cfo: ['Operating Activity','Cash from Operating'],
        cfi: ['Investing Activity'],
        cff: ['Financing Activity'],
        netCash: ['Net Cash Flow']
    });

    var ratRaw  = _parseTable(html,'ratios');
    var ratTbl  = _tableToObj(ratRaw);
    var ratYears = (ratTbl && ratTbl.header) ? ratTbl.header.slice(1) : [];
    var ratios = _extractRows(ratTbl,{
        debtEquity:   ['Debt / Equity'],
        currentRatio: ['Current Ratio'],
        roe:          ['Return on Equity','ROE'],
        roce:         ['ROCE'],
        roa:          ['Return on Assets'],
        interestCover:['Interest Coverage'],
        peRatio:      ['Price to Earning','P/E'],
        pbRatio:      ['Price to Book','P/B']
    });

    var shRaw  = _parseTable(html,'shareholding');
    var shTbl  = _tableToObj(shRaw);
    var sh = _extractRows(shTbl,{
        promoters: ['Promoters','Promoter'],
        fii:       ['FII','Foreign'],
        dii:       ['DII','Domestic'],
        public:    ['Public']
    });

    // Derived metrics
    function last(arr){ return (arr&&arr.length) ? arr[arr.length-1] : null; }
    function growth(arr){
        if(!arr||arr.length<2) return null;
        var l=last(arr), p=arr[arr.length-2];
        if(!l||!p||p===0) return null;
        return ((l-p)/Math.abs(p))*100;
    }
    function cagr(arr,yrs){
        if(!arr||arr.length<2) return null;
        var f=arr[0], l=last(arr);
        if(!f||!l||f<=0) return null;
        return (Math.pow(l/f,1/yrs)-1)*100;
    }
    var n = plYears.length||1;
    var derived = {
        revenueCagr:       cagr(pl.revenue,  n-1),
        profitCagr:        cagr(pl.netProfit, n-1),
        ebitdaCagr:        cagr(pl.ebitda,    n-1),
        revenueGrowthYoy:  growth(pl.revenue),
        profitGrowthYoy:   growth(pl.netProfit),
        latestRevenue:     last(pl.revenue),
        latestEbitda:      last(pl.ebitda),
        latestEbitdaMargin:last(pl.ebitdaMargin),
        latestNetProfit:   last(pl.netProfit),
        latestEps:         last(pl.eps),
        latestCfo:         last(cf.cfo),
        latestNetDebt:     (last(bs.longTermDebt)||0)-(last(bs.cash)||0),
        latestRoe:         last(ratios.roe),
        latestRoce:        last(ratios.roce),
        latestDebtEquity:  last(ratios.debtEquity),
        latestCurrentRatio:last(ratios.currentRatio),
        promoterHolding:   last(sh.promoters)
    };

    // Build DCF inputs
    var revs = (pl.revenue||[]).slice(-5);
    var avgRevGrowth = (function(){
        if(revs.length<2) return 12;
        var tot=0,cnt=0;
        for(var i=1;i<revs.length;i++){
            if(revs[i-1]&&revs[i]){ tot+=((revs[i]-revs[i-1])/Math.abs(revs[i-1]))*100; cnt++; }
        }
        return cnt>0 ? tot/cnt : 12;
    })();
    var taxArr = (pl.tax||[]).filter(function(x){ return x!=null; }).slice(-3);
    var taxRate = taxArr.length ? taxArr.reduce(function(a,b){return a+b;},0)/taxArr.length : 25.17;

    var inputs = {
        company:      info.name || ticker,
        ticker:       ticker,
        price:        info.price,
        baseRev:      derived.latestRevenue,
        ebitdaMargin: derived.latestEbitdaMargin,
        netProfit:    derived.latestNetProfit,
        eps:          derived.latestEps,
        netDebt:      Math.max(0, derived.latestNetDebt||0),
        taxRate:      Math.max(15, Math.min(40, taxRate||25.17)),
        growth1:      Math.max(2, Math.min(50, parseFloat(avgRevGrowth.toFixed(1)))),
        growth2:      Math.max(2, Math.min(30, parseFloat((avgRevGrowth*0.7).toFixed(1)))),
        wacc:         10.5,
        tgr:          3.0,
        shares:       null
    };

    return {
        info:       info,
        keyMetrics: keyMetrics,
        years:      { pl: plYears, ratios: ratYears },
        pl:  pl,  bs: bs,  cf: cf,  ratios: ratios,  sh: sh,
        derived:    derived,
        inputs:     inputs,
        meta: {
            name:      info.name || ticker,
            ticker:    ticker,
            sector:    info.sector,
            price:     info.price,
            isin:      info.isin,
            fetchedAt: new Date().toISOString(),
            cached:    false
        },
        plYears:   plYears,
        revenue:   pl.revenue   || [],
        ebitda:    pl.ebitda    || [],
        netProfit: pl.netProfit || [],
        eps:       pl.eps       || [],
        cfo:       cf.cfo       || [],
        roe:       ratios.roe   || [],
        roce:      ratios.roce  || [],
        topRatios: keyMetrics,
        fetchedAt: new Date().toISOString()
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Main Fetch ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

async function scrFetch(tickerArg){
    var t = tickerArg
         || (_scrSelected && _scrSelected.ticker)
         || ((document.getElementById('scrSearchInput')||{}).value||'').split(/\s*—\s*/)[0].trim().toUpperCase();

    if(!t){ scrShowError('Enter a company name or ticker above.'); return; }
    t = t.replace(/\.NS$/i,'').replace(/\.BO$/i,'').toUpperCase().trim();

    var cKey   = 'company:'+t;
    var cached = _scGet(cKey);
    if(cached){ _scrData = cached; scrRender(cached); return; }

    scrShowLoading(t);
    var btn = document.getElementById('scrFetchBtn');
    if(btn){ btn.disabled=true; btn.innerHTML='<i class="fas fa-circle-notch scr-spin"></i> Fetching…'; }

    try {
        // Try consolidated first, then standalone
        var html = null;
        var urls = [
            'https://www.screener.in/company/'+t+'/consolidated/',
            'https://www.screener.in/company/'+t+'/'
        ];
        for(var ui=0;ui<urls.length;ui++){
            try {
                var fetched = await _proxyFetch(urls[ui]);
                if(fetched && fetched.indexOf('profit-loss')!==-1){ html = fetched; break; }
            } catch(e2){}
        }
        if(!html) throw new Error('Company "'+t+'" not found on Screener.in. Check the ticker symbol.');

        var data = parseScreenerHTML(html, t);
        _scSet(cKey, data);
        _scrData = data;
        scrRender(data);
    } catch(err){
        scrShowError(err.message);
    } finally {
        if(btn){ btn.disabled=false; btn.innerHTML='<i class="fas fa-download"></i> Fetch Data'; }
    }
}

function scrShowLoading(t){
    var c=document.getElementById('scrContent');
    if(c) c.innerHTML=`<div class="scr-status">
        <i class="fas fa-circle-notch scr-spin" style="color:var(--accent-blue)"></i>
        <p>Fetching <strong>${t}</strong> from Screener.in…</p>
        <p style="font-size:11px;color:var(--text-muted);margin-top:6px">Parsing 10-year fundamentals · 5–12 sec</p>
    </div>`;
}
function scrShowError(msg){
    var c=document.getElementById('scrContent');
    if(c) c.innerHTML=`<div class="scr-status scr-error">
        <i class="fas fa-exclamation-circle"></i>
        <p>${msg}</p>
        <p style="font-size:12px;color:var(--text-muted);margin-top:8px">Try a different ticker (e.g. TCS, INFY, RELIANCE)</p>
    </div>`;
}

// ── Render full dashboard ─────────────────────────────────────────────────────
function scrRender(d){
    var c = document.getElementById('scrContent');
    if(!c) return;

    var inputs   = d.inputs    || {};
    var meta     = d.meta      || {};
    var derived  = d.derived   || {};
    var topRatios= d.topRatios || {};
    var yrs      = (d.plYears  || []).slice(-10);
    var revD     = (d.revenue  || []).slice(-10);
    var ebiD     = (d.ebitda   || []).slice(-10);
    var nipD     = (d.netProfit|| []).slice(-10);
    var epsD     = (d.eps      || []).slice(-10);
    var cfoD     = (d.cfo      || []).slice(-10);
    var roeD     = (d.roe      || []).slice(-10);
    var rocD     = (d.roce     || []).slice(-10);

    var impBtn = document.getElementById('scrImportBtn');
    if(impBtn) impBtn.style.display='flex';

    function cd(val,g,r,hi){
        if(val==null) return '';
        hi = (hi===undefined)?true:hi;
        if(hi) return val>=g?'scr-kpi-green':val<=r?'scr-kpi-red':'';
        return val<=g?'scr-kpi-green':val>=r?'scr-kpi-red':'';
    }

    var fetchTime = meta.fetchedAt ? new Date(meta.fetchedAt).toLocaleTimeString() : '';

    c.innerHTML = `
<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
  <div>
    <div style="font-size:1.4rem;font-weight:700">${meta.name||inputs.company||'—'}</div>
    <div style="display:flex;gap:10px;margin-top:4px;flex-wrap:wrap">
      <span style="font-size:12px;background:rgba(59,130,246,.12);color:var(--accent-blue);padding:3px 9px;border-radius:99px">${meta.ticker||inputs.ticker||'—'}</span>
      ${meta.sector?`<span style="font-size:12px;background:rgba(168,85,247,.12);color:var(--accent-purple,#a855f7);padding:3px 9px;border-radius:99px">${meta.sector}</span>`:''}
      ${meta.isin?`<span style="font-size:12px;color:var(--text-muted)">${meta.isin}</span>`:''}
    </div>
    <div style="font-size:11px;color:var(--text-muted);margin-top:4px">
      <i class="fas fa-clock"></i> ${fetchTime}
      · <a href="https://www.screener.in/company/${meta.ticker||inputs.ticker}/" target="_blank" style="color:var(--accent-blue);text-decoration:none">View on Screener.in ↗</a>
    </div>
  </div>
  <div style="text-align:right">
    <div style="font-size:2rem;font-weight:800;color:var(--accent-green)">₹${inputs.price?inputs.price.toLocaleString('en-IN'):'—'}</div>
    <div style="font-size:11px;color:var(--text-muted)">Current Market Price</div>
  </div>
</div>

<div class="scr-kpi-strip">
  <div class="scr-kpi ${cd(derived.revenueCagr,12,5)}">
    <div class="scr-kpi-label">Revenue CAGR</div>
    <div class="scr-kpi-value">${derived.revenueCagr!=null?sfmt(derived.revenueCagr,1,'%'):'—'}</div>
    <div class="scr-kpi-sub">${yrs.length>1?(yrs.length-1)+'-yr':''}</div>
  </div>
  <div class="scr-kpi ${cd(derived.profitCagr,15,5)}">
    <div class="scr-kpi-label">PAT CAGR</div>
    <div class="scr-kpi-value">${derived.profitCagr!=null?sfmt(derived.profitCagr,1,'%'):'—'}</div>
    <div class="scr-kpi-sub">Net Profit</div>
  </div>
  <div class="scr-kpi ${cd(inputs.ebitdaMargin,20,10)}">
    <div class="scr-kpi-label">EBITDA Margin</div>
    <div class="scr-kpi-value">${scrPct(inputs.ebitdaMargin)}</div>
    <div class="scr-kpi-sub">Latest year</div>
  </div>
  <div class="scr-kpi ${cd(derived.latestRoe,15,8)}">
    <div class="scr-kpi-label">ROE</div>
    <div class="scr-kpi-value">${scrPct(derived.latestRoe)}</div>
    <div class="scr-kpi-sub">Return on Equity</div>
  </div>
  <div class="scr-kpi ${cd(derived.latestRoce,15,8)}">
    <div class="scr-kpi-label">ROCE</div>
    <div class="scr-kpi-value">${scrPct(derived.latestRoce)}</div>
    <div class="scr-kpi-sub">Return on Capital</div>
  </div>
  <div class="scr-kpi ${cd(derived.latestDebtEquity,0.5,2,false)}">
    <div class="scr-kpi-label">Debt / Equity</div>
    <div class="scr-kpi-value">${derived.latestDebtEquity!=null?sfmt(derived.latestDebtEquity,2,'x'):'—'}</div>
    <div class="scr-kpi-sub">Leverage</div>
  </div>
  <div class="scr-kpi ${cd(derived.promoterHolding,55,40)}">
    <div class="scr-kpi-label">Promoter</div>
    <div class="scr-kpi-value">${scrPct(derived.promoterHolding)}</div>
    <div class="scr-kpi-sub">Holding</div>
  </div>
  <div class="scr-kpi scr-kpi-blue">
    <div class="scr-kpi-label">Revenue (Latest)</div>
    <div class="scr-kpi-value" style="font-size:1rem">${scrCr(inputs.baseRev)}</div>
    <div class="scr-kpi-sub">${yrs[yrs.length-1]||''}</div>
  </div>
</div>

<div class="scr-grid-2">
  <div class="scr-card">
    <div class="scr-card-header"><i class="fas fa-chart-bar"></i> Revenue &amp; EBITDA (₹ Cr)</div>
    <div class="scr-card-body"><div class="scr-chart-wrap"><canvas id="scrRevChart"></canvas></div></div>
  </div>
  <div class="scr-card">
    <div class="scr-card-header"><i class="fas fa-rupee-sign"></i> Net Profit &amp; EPS</div>
    <div class="scr-card-body"><div class="scr-chart-wrap"><canvas id="scrProfChart"></canvas></div></div>
  </div>
</div>

<div class="scr-grid-2">
  <div class="scr-card">
    <div class="scr-card-header"><i class="fas fa-percentage"></i> ROE vs ROCE (%)</div>
    <div class="scr-card-body"><div class="scr-chart-wrap"><canvas id="scrRoeChart"></canvas></div></div>
  </div>
  <div class="scr-card">
    <div class="scr-card-header"><i class="fas fa-water"></i> Cash from Operations (₹ Cr)</div>
    <div class="scr-card-body"><div class="scr-chart-wrap"><canvas id="scrCfoChart"></canvas></div></div>
  </div>
</div>

<div class="scr-grid-2" style="margin-top:0">
  <div class="scr-card">
    <div class="scr-card-header"><i class="fas fa-list-ul"></i> Key Ratios (Screener.in)</div>
    <div class="scr-card-body"><div class="scr-ratios-grid" id="scrRatiosGrid"></div></div>
  </div>
  <div class="scr-card">
    <div class="scr-card-header"><i class="fas fa-calculator"></i> DCF Model Inputs</div>
    <div class="scr-card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" id="scrDcfGrid"></div>
      <button class="scr-fetch-btn" style="width:100%;margin-top:14px;justify-content:center" onclick="scrImportModel()">
        <i class="fas fa-file-import"></i> Import to DCF Model &amp; Run Analysis
      </button>
    </div>
  </div>
</div>
`;

    // ── Charts ────────────────────────────────────────────────────────────────
    scrDestroyCharts();
    var chartDef = {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{color:'#9ca3af',font:{size:11},boxWidth:12} }, tooltip:{backgroundColor:'#1e2433',titleColor:'#e5e7eb',bodyColor:'#9ca3af',borderColor:'#374151',borderWidth:1} },
        scales:{ x:{ticks:{color:'#6b7280',font:{size:10}},grid:{color:'rgba(255,255,255,.04)'}}, y:{ticks:{color:'#6b7280',font:{size:10}},grid:{color:'rgba(255,255,255,.06)'}} }
    };

    if(typeof Chart !== 'undefined'){
        _scrCharts.rev = new Chart(document.getElementById('scrRevChart'),{
            type:'bar', data:{ labels:yrs, datasets:[
                {label:'Revenue',data:revD,backgroundColor:'rgba(59,130,246,.7)',borderRadius:4},
                {label:'EBITDA', data:ebiD,backgroundColor:'rgba(34,197,94,.6)', borderRadius:4}
            ]}, options: Object.assign({},chartDef)
        });
        _scrCharts.prof = new Chart(document.getElementById('scrProfChart'),{
            type:'bar', data:{ labels:yrs, datasets:[
                {label:'Net Profit',data:nipD,backgroundColor:'rgba(168,85,247,.7)',borderRadius:4,yAxisID:'y'},
                {label:'EPS (₹)',   data:epsD,type:'line',borderColor:'#f59e0b',backgroundColor:'transparent',pointRadius:3,yAxisID:'y1'}
            ]}, options: Object.assign({},chartDef,{scales:{
                x:{ticks:{color:'#6b7280',font:{size:10}},grid:{color:'rgba(255,255,255,.04)'}},
                y:{position:'left', ticks:{color:'#6b7280',font:{size:10}},grid:{color:'rgba(255,255,255,.06)'}},
                y1:{position:'right',ticks:{color:'#f59e0b',font:{size:10}},grid:{drawOnChartArea:false}}
            }})
        });
        _scrCharts.roe = new Chart(document.getElementById('scrRoeChart'),{
            type:'line', data:{ labels:yrs.slice(-Math.max(roeD.length,rocD.length)), datasets:[
                {label:'ROE %', data:roeD,borderColor:'#22c55e',backgroundColor:'rgba(34,197,94,.1)', tension:.35,fill:true,pointRadius:3},
                {label:'ROCE %',data:rocD,borderColor:'#60a5fa',backgroundColor:'rgba(96,165,250,.1)',tension:.35,fill:true,pointRadius:3}
            ]}, options: Object.assign({},chartDef)
        });
        _scrCharts.cfo = new Chart(document.getElementById('scrCfoChart'),{
            type:'bar', data:{ labels:yrs, datasets:[{
                label:'CFO', data:cfoD,
                backgroundColor:cfoD.map(function(v){return v>=0?'rgba(34,197,94,.65)':'rgba(239,68,68,.65)';}),
                borderRadius:4
            }]}, options: Object.assign({},chartDef)
        });
    }

    // ── Ratios grid ───────────────────────────────────────────────────────────
    var grid = document.getElementById('scrRatiosGrid');
    if(grid){
        var entries = Object.entries(topRatios).slice(0,16);
        if(entries.length){
            grid.innerHTML = entries.map(function(kv){
                return '<div class="scr-ratio-item"><div class="scr-ratio-name">'+kv[0]+'</div><div class="scr-ratio-val">'+(kv[1]||'—')+'</div></div>';
            }).join('');
        } else {
            grid.innerHTML = '<p style="color:var(--text-muted);font-size:12px">Ratios not parsed — view on Screener.in</p>';
        }
    }

    // ── DCF inputs preview ────────────────────────────────────────────────────
    var dcfGrid = document.getElementById('scrDcfGrid');
    if(dcfGrid && inputs){
        var fields = [
            ['Company',       inputs.company],
            ['Ticker',        inputs.ticker],
            ['CMP (₹)',       inputs.price?'₹'+inputs.price.toLocaleString('en-IN'):'—'],
            ['Base Revenue',  inputs.baseRev?'₹'+Number(inputs.baseRev.toFixed(0)).toLocaleString('en-IN')+' Cr':'—'],
            ['EBITDA Margin', inputs.ebitdaMargin!=null?inputs.ebitdaMargin.toFixed(1)+'%':'—'],
            ['Net Debt',      inputs.netDebt!=null?'₹'+Number(inputs.netDebt.toFixed(0)).toLocaleString('en-IN')+' Cr':'—'],
            ['Tax Rate',      inputs.taxRate!=null?inputs.taxRate.toFixed(2)+'%':'—'],
            ['Growth Ph.1',   inputs.growth1!=null?inputs.growth1.toFixed(1)+'%':'—'],
            ['Growth Ph.2',   inputs.growth2!=null?inputs.growth2.toFixed(1)+'%':'—'],
            ['WACC',          inputs.wacc+'%'],
            ['Terminal GR',   inputs.tgr+'%'],
            ['EPS',           inputs.eps?'₹'+inputs.eps.toFixed(2):'—']
        ];
        dcfGrid.innerHTML = fields.map(function(f){
            return '<div style="background:var(--bg-tertiary);border-radius:var(--radius-sm,6px);padding:9px 12px;border:1px solid var(--border-primary)">'
                  +'<div style="font-size:10px;color:var(--text-muted);margin-bottom:2px">'+f[0]+'</div>'
                  +'<div style="font-size:13px;font-weight:600">'+f[1]+'</div></div>';
        }).join('');
    }
}

// ── Destroy charts ────────────────────────────────────────────────────────────
function scrDestroyCharts(){
    Object.keys(_scrCharts).forEach(function(k){ try{ _scrCharts[k] && _scrCharts[k].destroy(); }catch(e){} });
    _scrCharts = {};
}

// ── Import to DCF model ───────────────────────────────────────────────────────
function scrImportModel(){
    if(!_scrData || !_scrData.inputs){
        if(typeof showToast==='function') showToast('Fetch company data first','warning');
        return;
    }
    var inp = _scrData.inputs;
    function setVal(id,val){
        var el = document.getElementById(id);
        if(el && val!=null){ el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); }
    }
    setVal('company',     inp.company);
    setVal('price',       inp.price);
    setVal('baseRevenue', inp.baseRev);
    setVal('ebitdaMargin',inp.ebitdaMargin);
    setVal('netDebt',     inp.netDebt);
    setVal('taxRate',     inp.taxRate);
    setVal('growth1',     inp.growth1);
    setVal('growth2',     inp.growth2);
    setVal('wacc',        inp.wacc);
    setVal('tgr',         inp.tgr);
    setVal('eps',         inp.eps);
    if(!window.__model) window.__model={};
    Object.assign(window.__model,{ company:{name:inp.company,ticker:inp.ticker}, price:inp.price });
    if(typeof showToast==='function') showToast('✓ '+inp.company+' imported! Running analysis…','success');
    setTimeout(function(){
        if(typeof switchView==='function') switchView('dcf');
        if(typeof runAnalysis==='function') runAnalysis();
    },350);
}

// ── Peer comparison ───────────────────────────────────────────────────────────
function scrOpenPeer(){
    var cur = (_scrData && (_scrData.meta||{}).ticker) || '';
    var raw = prompt('Enter 2–6 NSE tickers (comma-separated):\n\nExample: TCS, INFY, WIPRO', cur?cur+', TCS, INFY':'TCS, INFY, WIPRO');
    if(!raw) return;
    var tickers = raw.split(',').map(function(t){return t.trim().toUpperCase();}).filter(Boolean);
    if(tickers.length<2){ alert('Enter at least 2 tickers'); return; }
    scrFetchPeers(tickers);
}

async function scrFetchPeers(tickers){
    var c = document.getElementById('scrContent');
    if(!c) return;
    c.innerHTML = '<div class="scr-status"><i class="fas fa-circle-notch scr-spin" style="color:var(--accent-blue)"></i><p>Comparing '+tickers.join(', ')+'…<br><span style="font-size:11px;color:var(--text-muted)">Fetching each company (~10s each)</span></p></div>';
    scrDestroyCharts();
    var results = await Promise.allSettled(tickers.map(function(t){ return scrFetchCompanyData(t); }));
    var companies=[], failed=[];
    results.forEach(function(r,i){
        if(r.status==='fulfilled') companies.push(r.value);
        else failed.push({ticker:tickers[i], error:(r.reason||{}).message||'Failed'});
    });
    scrRenderPeers(companies, failed);
}

async function scrFetchCompanyData(ticker){
    ticker = ticker.replace(/\.NS$/i,'').replace(/\.BO$/i,'').toUpperCase();
    var cKey = 'company:'+ticker;
    var cached = _scGet(cKey);
    if(cached) return cached;
    var html = null;
    var urls = [
        'https://www.screener.in/company/'+ticker+'/consolidated/',
        'https://www.screener.in/company/'+ticker+'/'
    ];
    for(var i=0;i<urls.length;i++){
        try { var f=await _proxyFetch(urls[i]); if(f&&f.indexOf('profit-loss')!==-1){html=f;break;} }catch(e){}
    }
    if(!html) throw new Error(ticker+' not found');
    var data = parseScreenerHTML(html, ticker);
    _scSet(cKey, data);
    return data;
}

function scrRenderPeers(companies, failed){
    var c = document.getElementById('scrContent');
    if(!c) return;
    var rows = companies.map(function(d){
        var inp = d.inputs||{}, der = d.derived||{};
        return '<tr>'
          +'<td style="text-align:left;font-weight:600">'+(d.meta&&d.meta.name||inp.company||'—')+'<br><span style="font-size:10px;color:var(--text-muted)">'+(inp.ticker||'')+'</span></td>'
          +'<td>'+scrCr(inp.baseRev)+'</td>'
          +'<td>'+scrPct(inp.ebitdaMargin)+'</td>'
          +'<td>'+scrCr(inp.netProfit)+'</td>'
          +'<td>'+scrPct(der.latestRoe)+'</td>'
          +'<td>'+scrPct(der.latestRoce)+'</td>'
          +'<td>'+(der.latestDebtEquity!=null?der.latestDebtEquity.toFixed(2):'—')+'</td>'
          +'<td>'+scrPct(der.revenueCagr)+'</td>'
          +'<td>'+scrPct(der.promoterHolding)+'</td>'
          +'<td>'+(inp.price?'₹'+inp.price.toLocaleString('en-IN'):'—')+'</td>'
          +'</tr>';
    }).join('');
    c.innerHTML = `
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
  <h3 style="font-size:1rem;font-weight:600">Peer Comparison</h3>
  <button class="scr-peer-btn" onclick="renderScreenerShell();_screenerShellRendered=false;initScreenerTab()">← Back</button>
</div>
<div class="scr-card" style="overflow-x:auto">
  <table class="scr-table">
    <thead><tr><th>Company</th><th>Revenue</th><th>EBITDA%</th><th>PAT</th><th>ROE%</th><th>ROCE%</th><th>D/E</th><th>Rev CAGR</th><th>Promoter%</th><th>CMP</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>
${failed.length?'<p style="margin-top:10px;font-size:12px;color:var(--accent-red)">Failed: '+failed.map(function(f){return f.ticker+' ('+f.error+')';}).join('; ')+'</p>':''}`;
}

// ── Init (called once when tab first activated) ───────────────────────────────
var _screenerShellRendered = false;
function initScreenerTab(){
    if(!_screenerShellRendered){
        renderScreenerShell();
        _screenerShellRendered = true;
        document.addEventListener('click', function(e){
            if(!e.target.closest('.scr-search-wrap')) scrHideDrop();
        });
    }
}

// ── Hook into VIEW_INIT_MAP ───────────────────────────────────────────────────
if(typeof VIEW_INIT_MAP !== 'undefined'){
    VIEW_INIT_MAP['screener'] = initScreenerTab;
} else {
    document.addEventListener('DOMContentLoaded', function(){
        if(typeof VIEW_INIT_MAP !== 'undefined') VIEW_INIT_MAP['screener'] = initScreenerTab;
    });
}
