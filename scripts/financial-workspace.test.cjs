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
async function browser(){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'financial-modelling.html'),'utf8'),{url:'https://local.example/financial-modelling.html',runScripts:'outside-only',pretendToBeVisual:true});
 for(const file of ['financial-core.js','report-research.js','research-report.js','modelling-exports.js','financial-workspace.js','report-research-workspace.js','company-sources.js'])dom.window.eval(fs.readFileSync(path.join(root,'js',file),'utf8'));
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
