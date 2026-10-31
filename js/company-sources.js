(function(){
  function el(tag,text){const node=document.createElement(tag);if(text)node.textContent=text;return node;}
  function open(){
    const dialog=el('dialog');dialog.className='model-research-editor';
    dialog.append(el('h2','Company data & primary sources'),el('p','Look up a listed Indian ticker. Select the legal entity and reporting scope before importing a market reference. Financial statements still require reconciliation against the primary filing.'));
    const form=el('form'),input=el('input');input.placeholder='Ticker: TMCV, TMPV, TCS, RELIANCE…';input.setAttribute('aria-label','Listed company ticker');input.required=true;
    const secondary=el('input');secondary.type='checkbox';const label=el('label',' Include Screener secondary financial tables');label.prepend(secondary);
    const submit=el('button','Find sources');submit.type='submit';form.append(input,label,submit);dialog.appendChild(form);
    const status=el('p');status.setAttribute('role','status');const output=el('div');output.className='company-source-results';dialog.append(status,output);
    const privateNote=el('p','Unlisted or private company: use published issuer filings or financial statements supplied by the company. MCA document access may require an account or fees; complete free coverage is not available. Add these documents through Research brief.');dialog.appendChild(privateNote);
    const close=el('button','Close');close.type='button';close.onclick=()=>dialog.close();dialog.appendChild(close);
    async function lookup(ticker){
      submit.disabled=true;status.textContent='Checking sources…';output.replaceChildren();
      try{
        const response=await fetch(window.DS_API_BASE_URL+'/research/company/'+encodeURIComponent(ticker)+'?fundamentals='+secondary.checked,{signal:AbortSignal.timeout(35000)});
        const payload=await response.json();if(!response.ok||!payload.success)throw new Error(payload.error||'Source lookup failed.');
        const data=payload.data;
        if(data.needsEntitySelection){status.textContent=data.message;for(const entity of data.candidates){const button=el('button',entity.name+' ('+entity.ticker+')');button.type='button';button.onclick=()=>lookup(entity.ticker);output.appendChild(button);}return;}
        status.textContent=data.entity.name+' / '+data.entity.scope;
        for(const warning of data.warnings)output.appendChild(el('p',warning));
        const quote=data.quote;
        if(quote){output.append(el('h3','Market reference'),el('p',quote.currency+' '+quote.price+' · '+quote.ticker+' · market time: '+(quote.market_time||'not supplied')+' · fetched: '+data.accessedAt));
          const use=el('button','Use this INR market reference');use.type='button';use.disabled=quote.currency!=='INR';use.onclick=()=>{document.getElementById('companyName').value=data.entity.name;const price=document.getElementById('price');price.value=quote.price;
            try{const record=typeof getModelResearch==='function'?getModelResearch():ReportResearch.empty(data.entity.name);record.marketReference={ticker:quote.ticker,price:quote.price,currency:quote.currency,marketTime:quote.market_time||null,retrievedAt:data.accessedAt,sourceUrl:quote.sourceUrl,independentlyVerified:false};localStorage.setItem('ds-research-v1:'+data.entity.name.toLowerCase(),JSON.stringify(record));}catch{status.textContent='Price updated, but its source metadata could not be saved.';return;}
            price.dispatchEvent(new Event('input',{bubbles:true}));status.textContent='Company, dated market reference and source metadata saved. Reconcile financial statements before valuation.';};output.appendChild(use);
        }else output.appendChild(el('p','Market quote unavailable. No replacement price has been invented.'));
        output.appendChild(el('h3','Primary documents'));
        for(const source of data.primarySources){const item=el('p'),link=el('a',source.title);link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';item.appendChild(link);output.appendChild(item);}
        if(!data.primarySources.length)output.appendChild(el('p','No curated company filings are attached to this ticker yet. Add official filings in Research brief.'));
        output.appendChild(el('p','Primary financial extraction: pending. A document link does not mean its numbers have been extracted or verified.'));
        if(data.fundamentals)output.appendChild(el('p','Screener tables retrieved as secondary data. Reconcile reporting period, scope and units before importing.'));
        if(data.primarySources.length){const add=el('button','Save document references to research brief');add.type='button';add.onclick=()=>{
          const company=document.getElementById('companyName').value.trim();if(company!==data.entity.name){status.textContent='Use the selected company market reference first so research is attached to the correct entity.';return;}
          let research=typeof getModelResearch==='function'?getModelResearch():ReportResearch.empty(company);
          const sources=new Map(research.sources.map(source=>[source.id,source]));for(const source of data.primarySources)sources.set(source.id,{...source,verificationStatus:'reference-only',contentReviewed:false});research={...research,sources:[...sources.values()]};
          try{localStorage.setItem('ds-research-v1:'+company.toLowerCase(),JSON.stringify(research));status.textContent='References saved. No historical figures or research claims were marked verified.';}catch{status.textContent='Could not save references on this device.';}
        };output.appendChild(add);}
      }catch(error){status.textContent=error.name==='TimeoutError'?'Source lookup timed out. Retry or use the official filing links.':error.message;}
      finally{submit.disabled=false;}
    }
    form.onsubmit=event=>{event.preventDefault();lookup(input.value.trim());};
    dialog.addEventListener('close',()=>dialog.remove());document.body.appendChild(dialog);dialog.showModal();
  }
  document.addEventListener('DOMContentLoaded',()=>{const actions=document.querySelector('.workspace-export-actions');if(!actions)return;const button=el('button','Company sources');button.type='button';button.addEventListener('click',open);actions.appendChild(button);});
})();
