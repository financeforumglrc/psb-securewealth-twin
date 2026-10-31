const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),core=require('../js/financial-core'),exportsAPI=require('../js/modelling-exports');
const {computeDCFFromParams}=require('../backend/services/dcf-engine');
const root=path.resolve(__dirname,'..');
function inputs(){return {...core.defaults,company:'Test Company',baseRev:100,growth1:12,growth2:8,ebitdaMargin:22,taxRate:25,wacc:11,tgr:3,netDebt:15,shares:10,price:85};}
test('Modular model matches the independent DCF engine on positive operating cash flows',()=>{
 const p=inputs(),m=core.calculate(p),ref=computeDCFFromParams({baseRevenue:100,growthRates:[.12,.12,.08,.08,.08],ebitdaMargin:.22,taxRate:.25,wacc:.11,terminalGrowth:.03,shares:10,netDebt:15});
 assert.ok(Math.abs(m.ev-ref.enterpriseValue)<1e-9);assert.ok(Math.abs(m.dcfPrice-ref.perShareValue)<1e-9);assert.equal(m.ni.length,5);assert.ok(m.ni.every(value=>value===null));
});
test('Reinvestment assumptions flow through the model, snapshot and editable workbook',async()=>{
 const p={...inputs(),daPct:4,capexPct:7,wcPct:9},m=core.calculate(p),s=exportsAPI.snapshot(m,p);assert.ok(Math.abs(exportsAPI.valueAt(p,p.wacc,p.tgr)-m.dcfPrice)<1e-9);
 const wb=await exportsAPI.workbook(s,require('exceljs'));assert.equal(wb.getWorksheet('Assumptions').getCell('B13').value,.04);assert.equal(wb.getWorksheet('Assumptions').getCell('B14').value,.07);assert.equal(wb.getWorksheet('Assumptions').getCell('B15').value,.09);assert.equal(wb.getWorksheet('Forecast').getCell('B11').value.result,m.fcf[0]);assert.equal(wb.getWorksheet('Forecast').getCell('B12').value,null);
});
test('Negative EBIT gets no invented tax benefit; zero market price is explicitly unavailable',()=>{
 const m=core.calculate({...inputs(),ebitdaMargin:-5,price:0,netDebt:-20});assert.ok(m.forecast.every(row=>row.tax===0));assert.equal(m.upside,null);assert.ok(Math.abs(m.eq-m.ev-20)<1e-9);
});
test('Invalid assumptions are rejected and zero reinvestment is preserved',()=>{
 for(const override of [{shares:0},{baseRev:0},{wacc:3,tgr:3},{growth1:-100},{capexPct:-1},{wcPct:Infinity},{taxRate:101}])assert.throws(()=>core.calculate({...inputs(),...override}));
 const m=core.calculate({...inputs(),daPct:0,capexPct:0,wcPct:0});assert.equal(m.forecast[0].da,0);assert.equal(m.forecast[0].capex,0);assert.equal(m.forecast[0].wc,0);
});
test('WACC build preserves weights and applies the debt tax shield',()=>{
 const p={riskFree:7,beta:1,equityRiskPremium:5,costOfDebt:8.5,equityWeight:80,taxRate:25};
 const c=core.costOfCapital(p);assert.equal(c.costOfEquity,12);assert.equal(c.afterTaxDebt,6.375);assert.equal(c.wacc,10.875);assert.equal(c.debtWeight,20);
 assert.equal(core.costOfCapital({...p,equityWeight:100}).wacc,12);assert.throws(()=>core.costOfCapital({...p,equityWeight:101}));assert.throws(()=>core.costOfCapital({...p,beta:NaN}));
});
async function browser(project){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'financial-modelling.html'),'utf8'),{url:'https://local.example/financial-modelling.html',runScripts:'outside-only',pretendToBeVisual:true});
 if(project)dom.window.localStorage.setItem('ds-financial-project-v2',JSON.stringify(project));
 for(const file of ['financial-core.js','report-research.js','research-report.js','modelling-exports.js','financial-workspace.js','report-research-workspace.js','company-sources.js','decision-lab.js','statement-engine.js','statement-upload.js','market-link.js'])dom.window.eval(fs.readFileSync(path.join(root,'js',file),'utf8'));
 await new Promise(resolve=>dom.window.setTimeout(resolve,10));return dom;
}
function set(dom,id,value){const el=dom.window.document.getElementById(id);el.value=value;el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));}
test('All seven views navigate, calculations populate results and changed inputs block stale exports',async()=>{
 const dom=await browser(),d=dom.window.document;
 try{
   for(const button of d.querySelectorAll('[data-view]')){button.click();assert.equal(d.querySelectorAll('[data-panel]:not([hidden])').length,1);assert.equal(d.querySelector('[data-panel]:not([hidden])').dataset.panel,button.dataset.view);}
   set(dom,'companyName','Integration Company');d.getElementById('calculateModel').click();assert.ok(dom.window.modelData);assert.equal(d.querySelectorAll('#cashFlowTable tbody tr').length,10);assert.equal(d.querySelectorAll('#scenarioTable tbody tr').length,5);assert.match(d.getElementById('workspaceModelState').textContent,/exports ready/);
   set(dom,'growth1',14);assert.match(d.getElementById('workspaceModelState').textContent,/recalculate/);d.querySelector('[data-export="xlsx"]').click();await new Promise(resolve=>dom.window.setTimeout(resolve,5));assert.match(d.getElementById('toastRegion').textContent,/Calculate the current assumptions/);
   d.getElementById('saveProject').click();const project=JSON.parse(dom.window.localStorage.getItem('ds-financial-project-v2'));assert.equal(project.inputs.growth1,14);assert.equal(project.inputs.company,'Integration Company');
 }finally{dom.window.close();}
});
test('Empty and invalid inputs leave the model uncalculated and historical actuals stay separate',async()=>{
 const dom=await browser(),d=dom.window.document;
 try{set(dom,'shares','');d.getElementById('calculateModel').click();assert.equal(dom.window.modelData,undefined);assert.match(d.getElementById('inputErrors').textContent,/finite number/);assert.match(d.getElementById('historicalTable').textContent,/No sourced historical/);assert.equal(d.querySelectorAll('#historicalTable tbody tr').length,0);assert.equal(d.querySelectorAll('.workspace-export-actions button').length,2);}finally{dom.window.close();}
});
test('Historical periods require reconciled statements and preserve the filing locator',async()=>{
 const dom=await browser(),d=dom.window.document;
 try{
  set(dom,'companyName','Filed Company');
  for(const [key,value]of Object.entries({period:'FY2026',revenue:100,ebitda:20,netIncome:10,operatingCashFlow:15,totalAssets:100,totalLiabilities:40,equity:60}))set(dom,'history_'+key,String(value));
  set(dom,'historySource','Official annual report');set(dom,'historyUrl','https://issuer.example/annual-report.pdf');set(dom,'historyLocator','Consolidated balance sheet, page 120');
  d.getElementById('historicalForm').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  let record=dom.window.getModelResearch();assert.equal(record.historical.length,1);assert.equal(record.historical[0].locator,'Consolidated balance sheet, page 120');assert.equal(record.historical[0].sourceIds[0],record.sources[0].id);assert.equal(record.historical[0].scope,'consolidated');
  d.getElementById('reportingScope').value='standalone';d.getElementById('reportingScope').dispatchEvent(new dom.window.Event('change'));assert.equal(d.getElementById('reportingScope').value,'consolidated');
  for(const [key,value]of Object.entries({period:'FY2025',revenue:90,ebitda:18,netIncome:8,operatingCashFlow:12,totalAssets:100,totalLiabilities:40,equity:10}))set(dom,'history_'+key,String(value));
  set(dom,'historySource','Official annual report');set(dom,'historyUrl','https://issuer.example/annual-report.pdf');set(dom,'historyLocator','Page 121');d.getElementById('historicalForm').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(d.getElementById('historyError').textContent,/does not reconcile/);record=dom.window.getModelResearch();assert.equal(record.historical.length,1);
 }finally{dom.window.close();}
});

const lab=require('../js/decision-lab');
test('Reverse DCF recovers known growth and margin and reports unavailable solutions',()=>{
 const p={...inputs(),growth1:9,growth2:9};p.price=core.calculate(p).dcfPrice;
 const g=lab.reverse(p,'growth'),m=lab.reverse(p,'margin');
 assert.equal(g.status,'solved');assert.ok(g.roots.some(x=>Math.abs(x-9)<1e-6));assert.ok(m.roots.some(x=>Math.abs(x-p.ebitdaMargin)<1e-6));
 assert.equal(lab.reverse({...p,price:0},'growth').status,'missing-price');assert.equal(lab.reverse({...p,price:1e15},'growth').status,'outside-range');
});
test('Decision weights, entry ceiling and driver ranking are consistent without invented probabilities',async()=>{
 const p=inputs(),s={weights:[0,100,0],marginOfSafety:0,thesis:'test',invalidation:'test'},a=lab.analyze(p,s);
 assert.equal(a.weightedValue,a.model.dcfPrice);assert.equal(a.entryValue,a.model.dcfPrice);assert.equal(a.flags.length,0);
 assert.ok(a.drivers.every((d,i)=>i===0||d.swing<=a.drivers[i-1].swing));
 assert.throws(()=>lab.analyze(p,{weights:[25,25,25]}),/total 100/);assert.throws(()=>lab.analyze(p,{marginOfSafety:100}));
 const wb=await exportsAPI.workbook(exportsAPI.snapshot(core.calculate(p),p),require('exceljs'));lab.appendWorkbook(wb,p,s);
 assert.equal(wb.getWorksheet('DecisionLab').getCell('B7').value,a.weightedValue);
 const restored=new (require('exceljs').Workbook)();await restored.xlsx.load(await wb.xlsx.writeBuffer());assert.equal(restored.getWorksheet('DecisionLab').getCell('B8').value,'test');
});
test('Decision lab rejects stale models, preserves zero weights and restores project notes',async()=>{
 const dom=await browser(),d=dom.window.document;
 try {
  d.getElementById('calculateModel').click();assert.equal(d.querySelectorAll('.driver-row').length,6);
  set(dom,'weightDownside',0);set(dom,'weightBase',100);set(dom,'weightUpside',0);set(dom,'safetyMargin',0);set(dom,'investmentThesis','Evidence-led thesis');
  assert.equal(d.getElementById('decisionError').textContent,'');d.getElementById('saveProject').click();
  const project=JSON.parse(dom.window.localStorage.getItem('ds-financial-project-v2'));assert.equal(project.decisionSettings.thesis,'Evidence-led thesis');assert.equal(project.decisionSettings.weights[0],0);
  set(dom,'growth1',15);assert.match(d.getElementById('decisionResults').textContent,/Calculate the current/);assert.equal(dom.window.DecisionLab.getAnalysis(),null);
  d.getElementById('calculateModel').click();assert.equal(d.querySelectorAll('.driver-row').length,6);
  set(dom,'weightBase',90);assert.match(d.getElementById('decisionError').textContent,/total 100/);assert.equal(d.querySelectorAll('.driver-row').length,0);
 }finally{dom.window.close();}
});

test('Saved decision settings survive page reload and older projects get valid defaults',async()=>{
 const research=require('../js/report-research').empty('Test Company');
 const project={version:2,inputs:inputs(),research,listingType:'listed',scope:'consolidated',decisionSettings:{weights:[0,100,0],marginOfSafety:18,thesis:'Persisted thesis',invalidation:'Margin deterioration'}};
 const dom=await browser(project);
 try{const d=dom.window.document;assert.equal(d.getElementById('investmentThesis').value,'Persisted thesis');assert.equal(d.getElementById('weightDownside').value,'0');assert.equal(d.getElementById('safetyMargin').value,'18');d.getElementById('calculateModel').click();assert.equal(d.querySelectorAll('.driver-row').length,6);}finally{dom.window.close();}
 delete project.decisionSettings;const old=await browser(project);try{assert.equal(old.window.document.getElementById('weightBase').value,'50');}finally{old.window.close();}
});

const statements=require('../js/statement-engine');
const actual={period:'FY2026',revenue:100,ebitda:20,netIncome:10,operatingCashFlow:15,totalAssets:120,totalLiabilities:50,equity:70,cash:10,debt:30,depreciation:3,capex:5};
test('Statement reader normalises INR units and preserves missing and negative figures',()=>{
 assert.equal(statements.numeric('(1,234.50)'),-1234.5);assert.equal(statements.numeric('—'),null);assert.equal(statements.numeric('12%'),null);
 const read=statements.parse('Revenue from operations  1,000  900\nNet income  (200)  90\nTotal assets  1200  1100',['FY2026','FY2025'],'lakh','P&L');
 assert.equal(read.candidates.find(c=>c.key==='revenue'&&c.period==='FY2026').value,10);assert.equal(read.candidates.find(c=>c.key==='netIncome'&&c.period==='FY2026').value,-2);assert.match(read.candidates[0].document,/P&L/);
 assert.throws(()=>statements.parse('', ['FY2026','FY2026']));assert.throws(()=>statements.parse('', ['FY2026'],'USD'));
});
test('Reviewed statements reconcile and missing actuals are never silently filled',()=>{
 assert.deepEqual(statements.reconcile([actual]),[]);assert.ok(statements.reconcile([{...actual,equity:20}]).some(x=>x.includes('assets must equal')));assert.ok(statements.reconcile([{...actual,ebitda:null}]).some(x=>x.includes('EBITDA')));
 const previous={...core.defaults,company:'Test',shares:10},seeded=statements.seed([{...actual,period:'FY2024',revenue:80},actual],previous);
 assert.ok(Math.abs(seeded.growth-(Math.sqrt(1.25)-1)*100)<1e-8);assert.equal(seeded.inputs.netDebt,20);assert.equal(seeded.inputs.ebitdaMargin,20);assert.equal(seeded.inputs.shares,10);
});
test('Linked forecast balances all years and debt funds cash deficits with subsequent interest',()=>{
 const p={...core.defaults,baseRev:100,ebitdaMargin:5,capexPct:40,growth1:20,growth2:20};const rows=statements.linked(p,actual,10);
 assert.ok(rows.every(r=>Math.abs(r.gap)<1e-8));assert.ok(rows[0].financingCashFlow>0);assert.equal(rows[0].cash,0);assert.equal(rows[1].interest,rows[0].debt*.1);assert.equal(rows[1].openingCash,rows[0].cash);
 assert.throws(()=>statements.linked({...p,baseRev:999},actual));assert.throws(()=>statements.linked(p,actual,-1));
});
test('Upload and live-link workspace controls are reachable and private state restores',async()=>{
 const research=require('../js/report-research').empty('Test Company'),project={version:2,inputs:inputs(),research,statementState:{base:{...actual,company:'Test Company'},interest:9}};const dom=await browser(project);
 try{const d=dom.window.document;d.querySelector('[data-view="upload"]').click();assert.equal(d.querySelector('[data-panel]:not([hidden])').dataset.panel,'upload');d.getElementById('calculateModel').click();assert.match(d.getElementById('statementResults').textContent,/Linked three-statement/);d.getElementById('saveProject').click();const saved=JSON.parse(dom.window.localStorage.getItem('ds-financial-project-v2'));assert.equal(saved.statementState.interest,9);assert.equal(saved.statementState.base.revenue,100);set(dom,'companyName','Another entity');assert.match(d.getElementById('statementResults').textContent,/another company/);}finally{dom.window.close();}
});

test('Local CSV upload maps all statements, imports reviewed evidence and forecasts without a server upload',async()=>{
 const dom=await browser(),d=dom.window.document;
 try{dom.window.TextDecoder=TextDecoder;Object.defineProperty(dom.window.crypto,'subtle',{value:require('crypto').webcrypto.subtle});set(dom,'companyName','Uploaded Company');d.getElementById('statementUnit').value='crore';
 const text="Revenue from operations,100,95,80\nEBITDA,20,18,15\nNet income,10,9,8\nNet cash from operating activities,15,14,13\nTotal assets,120,110,100\nTotal liabilities,50,45,40\nTotal equity,70,65,60\nCash and cash equivalents,10,9,8\nTotal debt,30,28,25\nDepreciation,3,3,3\nCapital expenditure,5,4,4",bytes=new TextEncoder().encode(text);Object.defineProperty(d.getElementById('statementFiles'),'files',{value:[{name:'statements.csv',size:bytes.length,arrayBuffer:async()=>bytes.buffer}]});
 await d.getElementById('readStatements').onclick();assert.equal(d.querySelectorAll('#statementReview input').length,33,d.getElementById('statementStatus').textContent);assert.match(d.getElementById('statementStatus').textContent,/33 candidate/);
 d.getElementById('statementConfirmed').checked=true;d.getElementById('applyStatements').click();assert.match(d.getElementById('statementStatus').textContent,/Reviewed periods imported/);assert.equal(dom.window.modelData.baseRev,100);assert.equal(dom.window.modelData.netDebt,20);assert.match(d.getElementById('statementResults').textContent,/Linked three-statement/);
 const record=dom.window.getModelResearch();assert.equal(record.historical.length,3);assert.ok(record.sources[0].sha256);assert.equal(record.historical[0].evidence.revenue[0].document,'statements.csv');
 }finally{dom.window.close();}
});
test('Dated quote links only after entity confirmation and never replaces the reviewed share count',async()=>{
 const dom=await browser(),d=dom.window.document;
 try{set(dom,'companyName','Selected Entity');d.getElementById('linkedTicker').value='TCS';dom.window.fetch=async()=>({ok:true,json:async()=>({success:true,data:{entity:{name:'Test Listed Entity'},accessedAt:'2026-10-31T00:00:00Z',quote:{price:123,currency:'INR',ticker:'TCS.NS',sourceUrl:'https://finance.yahoo.com/quote/TCS.NS',market_time:'2026-10-30T10:00:00Z'}}})});
 await d.getElementById('refreshLinkedPrice').onclick();d.getElementById('useLinkedPrice').click();assert.match(d.getElementById('linkedPriceStatus').textContent,/Confirm/);assert.equal(d.getElementById('price').value,'0');d.getElementById('linkedEntityConfirmed').checked=true;d.getElementById('useLinkedPrice').click();assert.equal(dom.window.modelData.price,123);assert.equal(dom.window.modelData.shares,10);assert.equal(dom.window.getModelResearch().marketReference.ticker,'TCS.NS');
 }finally{dom.window.close();}
});
