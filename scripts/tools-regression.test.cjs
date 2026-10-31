const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const PDFLib = require('pdf-lib');
const tax = require('../backend/algorithms/incomeTax');
const optimizer = require('../backend/algorithms/taxOptimizer');
const root = path.resolve(__dirname, '..');

function pdfContext() {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { id, value:'', style:{}, classList:{add(){},remove(){}}, appendChild(){}, innerHTML:'' });
    return elements.get(id);
  };
  const context = { console, Blob, File, URL, Uint8Array, ArrayBuffer, PDFLib, setTimeout:()=>0, clearTimeout(){},
    document: {addEventListener(){},getElementById:element,createElement:()=>({style:{},dataset:{},classList:{add(){},remove(){}},appendChild(){},innerHTML:''}),querySelector(){return null;},querySelectorAll(){return [];},body:{style:{}}} };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('pdf-lib/dist/pdf-lib.js'),'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root,'pdf-ultra.js'),'utf8'), context);
  context.downloads=[]; context.messages=[];
  context.downloadBlob=(blob,name)=>context.downloads.push({blob,name});
  context.showToast=(message,type)=>context.messages.push({message,type});
  return { context, element };
}
async function samplePDF(pages=3) {
  const doc=await PDFLib.PDFDocument.create();
  for(let i=0;i<pages;i++)doc.addPage().drawText('Page '+(i+1));
  return new File([await doc.save()],'sample.pdf',{type:'application/pdf'});
}

test('FY 2025-26: new slabs, rebate, marginal relief and standard deduction', () => {
  assert.equal(tax.calculate(1200000).totalTax,0);
  assert.equal(tax.calculate(1210000).totalTax,10400);
  assert.equal(tax.calculate(1600000).totalTax,124800);
  assert.equal(tax.calculate(2400000).totalTax,312000);
  assert.equal(tax.calculate(500000,{regime:'old'}).totalTax,0);
  assert.equal(tax.calculate(50000000).surcharge, tax.calculate(50000000).tax*.25);
  assert.equal(optimizer.calculateNewRegimeTax({income:1275000,employmentType:'salaried'}).totalTax,0);
  assert.equal(optimizer.calculateNewRegimeTax({income:0}).effectiveRate,'0.00');
  assert.throws(()=>tax.calculate(Infinity));
  assert.throws(()=>tax.calculate(-1));
});

test('PDF uploads replace a single file and reset between tools', async () => {
  const {context}=pdfContext(), file=await samplePDF();
  context.initTool('split');
  context.handleDrop({id:'fileInput',files:[file],multiple:false,accept:'.pdf',value:'sample.pdf'});
  context.handleDrop({id:'fileInput',files:[file],multiple:false,accept:'.pdf',value:'sample.pdf'});
  assert.equal(context.getFiles('fileInput').length,1);
  context.initTool('rotate');
  assert.equal(context.getFiles('fileInput').length,0);
  context.handleDrop({id:'fileInput',files:[new File(['bad'],'bad.exe')],multiple:false,accept:'.pdf'});
  assert.equal(context.getFiles('fileInput').length,0);
  assert.equal(context.messages.at(-1).type,'error');
});

test('PDF merge and reorder produce valid files; invalid ranges are rejected', async () => {
  const {context,element}=pdfContext(), file=await samplePDF();
  context.initTool('merge');
  context.handleDrop({id:'mergeInput',files:[file,file],multiple:true,accept:'.pdf'});
  await context.doMerge();
  assert.equal((await PDFLib.PDFDocument.load(await context.downloads[0].blob.arrayBuffer())).getPageCount(),6);
  context.initTool('reorder');
  // Assign the selected file directly; thumbnail rendering is a separate browser concern.
  vm.runInContext('_files.fileInput = []',context);
  context.getFiles('fileInput').push(file);
  element('pageOrder').value='3, 1, 2';
  await context.doReorder();
  assert.ok(context.downloads[1], JSON.stringify(context.messages));
  assert.equal((await PDFLib.PDFDocument.load(await context.downloads[1].blob.arrayBuffer())).getPageCount(),3);
  for(const range of ['0','4','3-1','no','1-999999999'])assert.throws(()=>context.parsePageRanges(range,3));
  const before=context.downloads.length;
  element('pageOrder').value='1, 1, 2'; await context.doReorder();
  assert.equal(context.downloads.length,before);
  assert.equal(context.messages.at(-1).type,'error');
});

test('QPDF worker encrypts with AES-256 and rejects wrong passwords', async () => {
  const createModule=require('@neslinesli93/qpdf-wasm');
  const workerSource=fs.readFileSync(path.join(root,'js/pdf-worker.js'),'utf8');
  const run=async data=>{
    let result;
    const self={location:{href:'http://localhost/js/pdf-worker.js'},postMessage:value=>{result=value;}};
    const ctx={self,importScripts(){},Module:()=>createModule({print(){},printErr(){}}),URL,Uint8Array};
    vm.runInNewContext(workerSource,ctx);
    await self.onmessage({data}); return result;
  };
  const source=await samplePDF(1);
  const encrypted=await run({action:'encrypt',bytes:await source.arrayBuffer(),password:'test-open-123',ownerPassword:'test-owner-456'});
  assert.ok(encrypted.bytes,encrypted.error);
  assert.match(Buffer.from(encrypted.bytes).toString('latin1'),/\/AESV3/);
  assert.match(Buffer.from(encrypted.bytes).toString('latin1'),/\/R 6/);
  const wrong=await run({action:'decrypt',bytes:encrypted.bytes,password:'wrong'});
  assert.ok(wrong.error);
  // QPDF sets process.exitCode on an expected failed invocation in Node.
  process.exitCode=0;
  const decrypted=await run({action:'decrypt',bytes:encrypted.bytes,password:'test-open-123'});
  assert.ok(decrypted.bytes,decrypted.error);
  assert.equal((await PDFLib.PDFDocument.load(decrypted.bytes)).getPageCount(),1);
});

test('Investment tools calculate zero-return SIP and zero-interest EMI without chart dependencies', () => {
  const {load}=require('cheerio');
  const $=load(fs.readFileSync(path.join(root,'investment-tools.html'),'utf8'));
  const elements=new Map();
  $('[id]').each((_,node)=>elements.set(node.attribs.id,{value:node.attribs.value||'',innerText:'',innerHTML:'',style:{}}));
  const context={console,Intl,document:{addEventListener(){},querySelectorAll(){return [];},getElementById:id=>elements.get(id)}};
  context.window=context; vm.createContext(context);
  $('script:not([src])').each((_,node)=>vm.runInContext($(node).html(),context));
  elements.get('sipAmount').value='5000';elements.get('sipRate').value='0';elements.get('sipYears').value='10';
  context.updateSIP();
  assert.equal(elements.get('sipTotal').innerText,'₹6,00,000');
  elements.get('emiAmount').value='120000';elements.get('emiRate').value='0';elements.get('emiYears').value='1';
  context.updateEMI();
  assert.equal(elements.get('emiMonthly').innerText,'₹10,000');
});

test('Three-way matching flags missing, mismatched and duplicate references', () => {
  const context={document:{addEventListener(){}},location:{pathname:'/gst-black-mirror.html'}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'js/tool-repairs.js'),'utf8'),context);
  const row=(id,amount)=>({'Invoice No':id,Amount:amount});
  const result=context.matchInvoiceRows([[row('A',100),row('B',200),row('C',300)],[row('A',100),row('B',201)],[row('A',100),row('B',200),row('C',300)]]);
  assert.equal(result.find(row=>row.Reference==='a').Status,'Matched');
  assert.equal(result.find(row=>row.Reference==='b').Status,'Review');
  assert.equal(result.find(row=>row.Reference==='c').Status,'Unmatched');
  assert.equal(context.matchInvoiceRows([[row('A',100),row('A',100)],[row('A',100)],[row('A',100)]])[0].Status,'Review');
  assert.throws(()=>context.matchInvoiceRows([[{Unknown:1}],[],[]]));
});

test('API configuration never directs a public visitor to localhost', () => {
  for(const hostname of ['dsfinancial.in','dsfinancial-47556.surge.sh','user.github.io','example.com']) {
    const window={}; vm.runInNewContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),{window,location:{hostname}});
    assert.ok(window.DS_API_BASE_URL.startsWith('https://'));
    assert.ok(!window.DS_API_BASE_URL.includes('localhost'));
  }
  const window={DS_API_BASE_URL:'https://custom.example/api/v1'};
  vm.runInNewContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),{window,location:{hostname:'dsfinancial.in'}});
  assert.equal(window.DS_API_BASE_URL,'https://custom.example/api/v1');
});
