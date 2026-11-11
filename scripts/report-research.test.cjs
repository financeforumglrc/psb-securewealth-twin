const test=require('node:test'),assert=require('node:assert/strict');
const research=require('../js/report-research');
function fixture(){
 const record=research.empty('Sample Company');record.mandate='Assess valuation for an investment committee';record.asOf='2026-10-30';
 record.sources=[{id:'annual',title:'Annual financial statements',document:'annual-report.pdf',accessedAt:'2026-10-30'}];
 record.claims=['business','segments','industry','competition','history','forecast','valuation','capital','peers','risks'].map(category=>({id:category,category,kind:'actual',text:'Test evidence for '+category,sourceIds:['annual'],locator:'Test-only fixture / page 1'}));
 record.historical=[2023,2024,2025].map(year=>({period:'FY'+year,kind:'actual',sourceIds:['annual'],scope:'consolidated',currency:'INR',unit:'crore',revenue:100,ebitda:20,netIncome:10,operatingCashFlow:15,totalAssets:100,totalLiabilities:40,equity:60}));return record;
}
test('The long report has a 30-page editorial plan without claiming missing research is complete',()=>{const status=research.assess(research.empty('Example'));assert.equal(status.plannedPages,30);assert.equal(status.ready,false);assert.ok(status.missing.includes('history'));assert.equal(status.sections.length,9);});
test('Complete source metadata and three reconciled actual periods can pass structural checks',()=>{assert.deepEqual(research.validate(fixture()),[]);assert.equal(research.assess(fixture()).ready,true);});
test('Factual claims need source IDs and precise evidence locators',()=>{const r=fixture();r.claims[0].sourceIds=['missing'];assert.match(research.validate(r).join(' '),/missing source/);r.claims[0].sourceIds=['annual'];r.claims[0].locator='';assert.match(research.validate(r).join(' '),/locator/);});
test('Forecasts cannot be passed off as historical actuals',()=>{const r=fixture();r.historical[0].kind='forecast';assert.match(research.validate(r).join(' '),/actual/);assert.equal(research.assess(r).ready,false);});
test('Currency, scope and units cannot silently differ across periods',()=>{const r=fixture();r.historical[0].currency='USD';r.historical[1].scope='standalone';r.historical[2].unit='million';assert.equal(research.validate(r).filter(x=>x.includes('inconsistent')).length,3);});
test('Balance sheets must reconcile and historical financials must be numeric',()=>{const r=fixture();r.historical[0].equity=10;r.historical[1].revenue=null;assert.match(research.validate(r).join(' '),/does not reconcile/);assert.match(research.validate(r).join(' '),/needs revenue/);});
test('Source and claim IDs are unique and unsafe source URL protocols are rejected',()=>{const r=fixture();r.sources.push({...r.sources[0]});r.claims.push({...r.claims[0]});r.sources[0].url='javascript:alert(1)';const errors=research.validate(r).join(' ');assert.match(errors,/unique/);assert.match(errors,/invalid URL/);});
test('Assumptions require a rationale and two actual periods are insufficient',()=>{const r=fixture();r.claims[0].kind='assumption';delete r.claims[0].method;r.historical.pop();assert.match(research.validate(r).join(' '),/rationale/);assert.ok(research.assess(r).missing.includes('history'));});
