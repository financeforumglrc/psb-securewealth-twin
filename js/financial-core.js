(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FinancialCore=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const defaults={company:'Untitled company',price:0,shares:10,baseRev:100,growth1:10,growth2:6,ebitdaMargin:20,taxRate:25,wacc:11,tgr:3,netDebt:0,daPct:3,capexPct:5,wcPct:3};
  function validate(p){
    const errors=[];for(const key of Object.keys(defaults).filter(key=>key!=='company'))if(!Number.isFinite(p[key]))errors.push(key+' must be a finite number.');
    if(!String(p.company||'').trim())errors.push('Enter a company name.');
    if(p.baseRev<=0)errors.push('Base-year revenue must be positive.');if(p.shares<=0)errors.push('Shares outstanding must be positive.');if(p.price<0)errors.push('Market reference cannot be negative.');
    if(p.growth1<=-100||p.growth2<=-100)errors.push('Growth must exceed -100%.');if(p.ebitdaMargin>100||p.ebitdaMargin< -100)errors.push('EBITDA margin must be between -100% and 100%.');
    if(p.taxRate<0||p.taxRate>100)errors.push('Tax rate must be between 0% and 100%.');if(p.wacc<=0||p.wacc<=p.tgr)errors.push('WACC must be positive and exceed terminal growth.');if(p.tgr<=-100)errors.push('Terminal growth must exceed -100%.');
    for(const key of ['daPct','capexPct','wcPct'])if(p[key]<0||p[key]>100)errors.push(key+' must be between 0% and 100%.');return errors;
  }
  function calculate(inputs){
    const p={...defaults,...inputs},errors=validate(p);if(errors.length)throw new Error(errors.join(' '));
    let previous=p.baseRev,pvFcf=0;
    const forecast=Array.from({length:5},(_,i)=>{
      const revenue=previous*(1+(i<2?p.growth1:p.growth2)/100),ebitda=revenue*p.ebitdaMargin/100,da=revenue*p.daPct/100,ebit=ebitda-da,tax=Math.max(0,ebit)*p.taxRate/100,nopat=ebit-tax,capex=revenue*p.capexPct/100,wc=(revenue-previous)*p.wcPct/100,fcf=nopat+da-capex-wc,pv=fcf/(1+p.wacc/100)**(i+1);previous=revenue;pvFcf+=pv;
      return {year:i+1,revenue,ebitda,da,ebit,tax,nopat,capex,wc,fcf,pv};
    });
    const tv=forecast[4].fcf*(1+p.tgr/100)/((p.wacc-p.tgr)/100),pvTv=tv/(1+p.wacc/100)**5,ev=pvFcf+pvTv,eq=ev-p.netDebt,dcfPrice=eq/p.shares;
    if(![tv,pvTv,ev,eq,dcfPrice].every(Number.isFinite))throw new Error('Assumptions produce values outside the supported numerical range.');
    return {company:p.company,price:p.price,shares:p.shares,baseRev:p.baseRev,netDebt:p.netDebt,wacc:p.wacc,tgr:p.tgr,daPct:p.daPct,capexPct:p.capexPct,wcPct:p.wcPct,rev:forecast.map(x=>x.revenue),ebitda:forecast.map(x=>x.ebitda),ebit:forecast.map(x=>x.ebit),ni:forecast.map(()=>null),fcf:forecast.map(x=>x.fcf),forecast,pvFcf,tv,pvTv,ev,eq,dcfPrice,upside:p.price>0?(dcfPrice/p.price-1)*100:null,cagr:Math.pow(forecast[4].revenue/p.baseRev,.2)-1,calculatedAt:new Date().toISOString(),assumptions:{...p},source:'User-entered assumptions; company figures require source verification',netIncomeStatus:'Not forecast: financing costs and other below-EBIT items are not modelled.'};
  }
  function scenarios(p){return [{name:'Downside',growth:-3,margin:-2,discount:1},{name:'Base',growth:0,margin:0,discount:0},{name:'Upside',growth:3,margin:2,discount:-1}].map(c=>{const inputs={...p,growth1:Math.max(-99,p.growth1+c.growth),growth2:Math.max(-99,p.growth2+c.growth),ebitdaMargin:Math.max(-100,Math.min(100,p.ebitdaMargin+c.margin)),wacc:Math.max(p.tgr+.1,p.wacc+c.discount)};return {...c,inputs,model:calculate(inputs)};});}
  function costOfCapital({riskFree,beta,equityRiskPremium,costOfDebt,equityWeight,taxRate}){
    if(![riskFree,beta,equityRiskPremium,costOfDebt,equityWeight,taxRate].every(Number.isFinite))throw new Error('Complete all cost-of-capital inputs.');
    if(beta<0||beta>5||[riskFree,equityRiskPremium,costOfDebt,equityWeight,taxRate].some(value=>value<0||value>100))throw new Error('Use beta from 0 to 5 and rates / weights from 0% to 100%.');
    const costOfEquity=riskFree+beta*equityRiskPremium,afterTaxDebt=costOfDebt*(1-taxRate/100),debtWeight=100-equityWeight,wacc=costOfEquity*equityWeight/100+afterTaxDebt*debtWeight/100;
    return {costOfEquity,afterTaxDebt,equityWeight,debtWeight,wacc};
  }
  return {defaults,validate,calculate,scenarios,costOfCapital};
});
