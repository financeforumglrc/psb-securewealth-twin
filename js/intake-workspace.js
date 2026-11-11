(function(){
 const $=id=>document.getElementById(id);let pack=null,bookPromise=null;
 function status(message){$('intakeStatus').textContent=message;}
 async function excel(){if(window.ExcelJS)return window.ExcelJS;if(!bookPromise)bookPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='vendor/exceljs.min.js';s.onload=()=>resolve(window.ExcelJS);s.onerror=()=>{bookPromise=null;reject(Error('Spreadsheet reader could not load. Retry.'));};document.head.append(s);});return bookPromise;}
 async function download(wb,name){const data=await wb.xlsx.writeBuffer(),url=URL.createObjectURL(new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function years(){return $('statementYears').value.split(',').map(s=>'FY'+s.trim().replace(/^FY/i,''));}
 function researchCompany(){const name=$('intakeCompany').value.trim();if(!name||name==='Untitled company')throw Error('Enter the company / legal entity first.');$('companyName').value=name;$('companyName').dispatchEvent(new Event('input',{bubbles:true}));return name;}
 async function getPack(ticker){
  pack=null;$('useCompanyPack').disabled=true;$('downloadCompanyPack').disabled=true;$('companyPackChoices').replaceChildren();status('Fetching available financial tables and dated quote…');
  try{
   const r=await fetch(window.DS_API_BASE_URL+'/research/company/'+encodeURIComponent(ticker)+'?fundamentals=true',{signal:AbortSignal.timeout(40000)}),json=await r.json();if(!r.ok||!json.success)throw Error(json.error||'Company data fetch failed.');const data=json.data;
   if(data.needsEntitySelection){status(data.message);for(const c of data.candidates){const b=document.createElement('button');b.type='button';b.className='button quiet';b.textContent=c.name;b.onclick=()=>getPack(c.ticker);$('companyPackChoices').append(b);}return;}
   if(!$('intakeCompany').value.trim()||$('intakeCompany').value==='Untitled company'){$('intakeCompany').value=data.entity.name;$('intakeCompany').dispatchEvent(new Event('input',{bubbles:true}));}pack=FinancialIntake.companyPack(data);await download(FinancialIntake.packWorkbook(await excel(),pack),data.entity.ticker+'_available-data.xlsx');
   $('useCompanyPack').disabled=!pack.rows.length;status(`${data.entity.name}: available data pack created. ${pack.rows.length} annual periods; ${pack.missing.length} missing fields. Financial scope: ${data.fundamentals?.scope||'unavailable'}. Secondary data is not independently verified. Downloads contain available tables and filing links, not guaranteed copies of every annual-report PDF.`);
   $('intakeMissing').textContent=pack.missing.join(' · ');
  }catch(e){status(e.message);}finally{$('downloadCompanyPack').disabled=false;}
 }
 document.addEventListener('DOMContentLoaded',()=>{
  if(!$('intakeCompany'))return;$('intakeCompany').value=$('companyName').value==='Untitled company'?'':$('companyName').value;
  $('intakeCompany').oninput=()=>{$('companyName').value=$('intakeCompany').value;$('companyName').dispatchEvent(new Event('input',{bubbles:true}));};
  $('companyName').addEventListener('input',()=>{$('intakeCompany').value=$('companyName').value;});
  $('manualStatements').onclick=()=>{try{researchCompany();const title=$('manualSource').value.trim();if(!title)throw Error('Describe the source of your manually entered figures.');const rows=FinancialIntake.blank(years()),id='manual-'+crypto.randomUUID();StatementUploads.loadDraft(rows,[{id,title,document:title,accessedAt:new Date().toISOString(),verificationStatus:'manually entered; review required'}],$('reportingScope').value);status('Manual grid opened below. Enter actuals in INR crore; blank means unavailable. Confirm and forecast after reconciliation.');$('statementReview').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){status(e.message);}};
  $('downloadStatementTemplate').onclick=async()=>{try{await download(FinancialIntake.template(await excel(),{company:researchCompany(),scope:$('reportingScope').value,years:years(),unit:'crore'}),'DS_Financial_statement_template.xlsx');status('Excel template created. Fill Setup and Statements, then upload it below. Original files remain on your device.');}catch(e){status(e.message);}};
  $('downloadCompanyPack').onclick=()=>{const ticker=$('intakeTicker').value.trim();if(!ticker){status('Enter an Indian listed-company ticker.');return;}getPack(ticker);};
  $('useCompanyPack').onclick=()=>{try{if(!pack?.rows.length)throw Error('Fetch a company pack with financial tables first.');const name=researchCompany();if(name!==pack.data.entity.name)throw Error('Set Company / legal entity to '+pack.data.entity.name+' before using this company pack.');
   const f=pack.data.fundamentals;StatementUploads.loadDraft(pack.rows,[{id:'secondary-'+pack.data.entity.ticker+'-'+Date.now(),title:'Screener annual tables / '+pack.data.entity.name,url:f.sourceUrl,accessedAt:f.fetchedAt||pack.data.accessedAt,verificationStatus:'secondary; not independently verified'}],f.scope);status('Available annual figures are in the review grid. Match reporting scope in Company & sources, reconcile the EBITDA proxy, and supply missing cash/capex before forecasting.');$('statementReview').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){status(e.message);}};
 });
})();
