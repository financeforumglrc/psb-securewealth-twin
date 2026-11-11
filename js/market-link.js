(function(){
 'use strict';let quote=null;
 document.addEventListener('DOMContentLoaded',()=>{
  const $=id=>document.getElementById(id);if(!$('refreshLinkedPrice'))return;
  $('refreshLinkedPrice').onclick=async()=>{
   quote=null;$('useLinkedPrice').disabled=true;$('linkedEntityConfirmed').checked=false;$('refreshLinkedPrice').disabled=true;$('linkedPriceStatus').textContent='Fetching a dated market reference…';
   try{if($('listingType').value!=='listed')throw Error('Unlisted companies have no exchange quote. Use a documented transaction or valuation reference.');
    const symbol=$('linkedTicker').value.trim();if(!symbol)throw Error('Enter the exact exchange ticker.');
    const r=await fetch(window.DS_API_BASE_URL+'/research/company/'+encodeURIComponent(symbol),{signal:AbortSignal.timeout(35000)}),json=await r.json();if(!r.ok||!json.success)throw Error(json.error||'Market lookup failed.');const d=json.data;
    if(d.needsEntitySelection)throw Error(d.message+' Enter TMCV or TMPV explicitly.');
    if(!d.quote||!Number.isFinite(d.quote.price)||d.quote.price<=0)throw Error('Quote unavailable. The current model price has not been changed.');
    if(d.quote.currency!=='INR')throw Error('This model uses INR. Currency conversion is required before linking another currency.');
    quote={...d.quote,entity:d.entity.name,modelCompany:$('companyName').value.trim(),retrievedAt:d.accessedAt};
    $('linkedPriceStatus').textContent=`${quote.entity} · ${quote.ticker} · INR ${quote.price} · market time ${quote.market_time||'not supplied'} · fetched ${quote.retrievedAt}. May be delayed/cached. Confirm this is the same legal entity as the statements.`;$('useLinkedPrice').disabled=false;
   }catch(e){$('linkedPriceStatus').textContent=e.message;}finally{$('refreshLinkedPrice').disabled=false;}
  };
  $('useLinkedPrice').onclick=()=>{try{if(!quote||!$('linkedEntityConfirmed').checked)throw Error('Confirm the quote and statements represent the same legal entity.');if(quote.modelCompany!==$('companyName').value.trim())throw Error('Company changed. Fetch and confirm the correct ticker again.');
   const record=window.getModelResearch();record.marketReference={ticker:quote.ticker,price:quote.price,currency:quote.currency,marketTime:quote.market_time||null,retrievedAt:quote.retrievedAt,sourceUrl:quote.sourceUrl,independentlyVerified:false};localStorage.setItem('ds-research-v1:'+record.company.toLowerCase(),JSON.stringify(record));$('price').value=quote.price;$('price').dispatchEvent(new Event('input',{bubbles:true}));window.runAnalysis();$('linkedPriceStatus').textContent='Dated market reference linked; valuation and Decision Lab recalculated. Share count remains your reviewed input.';
  }catch(e){$('linkedPriceStatus').textContent=e.message;}};
 });
})();
