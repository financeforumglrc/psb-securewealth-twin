const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ExcelJS=require('exceljs'),{jsPDF}=require('jspdf'),{autoTable}=require('jspdf-autotable');
const exportsAPI=require('../js/modelling-exports');
const {computeDCFFromParams}=require('../backend/services/dcf-engine');
const p={company:'Example Research Ltd',baseRev:100,growth1:12,growth2:8,ebitdaMargin:22,taxRate:25,wacc:11,tgr:3,shares:10,netDebt:15,price:85};
const c=computeDCFFromParams({baseRevenue:p.baseRev,growthRates:[.12,.12,.08,.08,.08],ebitdaMargin:.22,taxRate:.25,wacc:.11,terminalGrowth:.03,shares:10,netDebt:15});
const m={company:p.company,price:p.price,shares:10,netDebt:15,wacc:11,tgr:3,rev:c.forecast.map(x=>x.revenue),ebitda:c.forecast.map(x=>x.ebitda),ebit:c.forecast.map(x=>x.ebit),ni:c.forecast.map(x=>x.nopat),fcf:c.forecast.map(x=>x.fcff),ev:c.enterpriseValue,eq:c.equityValue,dcfPrice:c.perShareValue,pvFcf:c.pvFcff,pvTv:c.pvTerminal,tv:c.terminalValue};
test('Export snapshot agrees with the independent DCF engine and rejects stale inputs',()=>{
 const s=exportsAPI.snapshot(m,p);assert.equal(s.model.dcfPrice,c.perShareValue);assert.ok(Math.abs(exportsAPI.valueAt(p,11,3)-c.perShareValue)<1e-9);
 for(const changes of [{wacc:12},{growth1:13},{shares:0},{ebitdaMargin:25},{taxRate:30}])assert.throws(()=>exportsAPI.snapshot(m,{...p,...changes}));
 assert.throws(()=>exportsAPI.snapshot({...m,rev:[1,2]},p));
});
test('Excel export retains styles, formulas, numeric caches and print settings after reopening',async()=>{
 const wb=await exportsAPI.workbook(exportsAPI.snapshot(m,p),ExcelJS),bytes=await wb.xlsx.writeBuffer(),read=new ExcelJS.Workbook();await read.xlsx.load(bytes);
 assert.deepEqual(read.worksheets.map(x=>x.name),['Overview','Assumptions','Forecast','DCF','Sensitivity','Sources','Decision Brief','Scenarios','Value Drivers','Model Checks']);
 assert.equal(read.getWorksheet('Assumptions').getCell('B9').value,.11);
 assert.equal(read.getWorksheet('Assumptions').getCell('B9').font.color.argb,'FF2563EB');
 assert.equal(read.getWorksheet('DCF').getCell('B10').value.formula,'B9/Assumptions!B12');
 assert.equal(read.getWorksheet('DCF').getCell('B10').value.result,c.perShareValue);
 assert.equal(read.getWorksheet('Forecast').getCell('F11').value.result,m.fcf[4]);
 assert.equal(read.getWorksheet('Sensitivity').getCell('D6').value.result,c.perShareValue);
 assert.equal(read.getWorksheet('Forecast').pageSetup.fitToWidth,1);
 const out=path.join(__dirname,'../tmp/export-qa');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'valuation.xlsx'),Buffer.from(bytes));
});
test('PDF export creates a eight-page decision report from the same snapshot',async()=>{
 const doc=exportsAPI.pdf(exportsAPI.snapshot(m,p),jsPDF,autoTable);
 assert.equal(doc.getNumberOfPages(),8);
 const bytes=doc.output('arraybuffer'),{PDFDocument}=require('pdf-lib'),read=await PDFDocument.load(bytes);assert.equal(read.getPageCount(),8);
 fs.writeFileSync(path.join(__dirname,'../tmp/export-qa/valuation.pdf'),Buffer.from(bytes));
});
