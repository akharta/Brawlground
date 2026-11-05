const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(e.stack));
 if(process.env.PHASER) await p.route(/cdnjs\.cloudflare\.com.*phaser/, r=>r.fulfill({path:process.env.PHASER,contentType:'application/javascript'}));
 await p.route(/fonts\.(googleapis|gstatic)/, r=>r.abort());
 await p.goto(''+(process.env.URL||'http://localhost:8789/index.html')+'');await p.waitForTimeout(1500);
 const data=await p.evaluate(()=>JSON.parse(JSON.stringify(window.__data())));
 const keys=Object.keys(data.NAMES);
 const dps={};
 for(const k of keys){const rs=[];for(let i=0;i<3;i++)rs.push(await p.evaluate(a=>window.__dps(a),k));dps[k]={dps:+(rs.reduce((s,r)=>s+r.dps,0)/3).toFixed(1),firstHit:rs[0].firstHit};}
 const duels=[];
 for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
   for(let r=0;r<6;r++){const [a,c]=r%2?[keys[j],keys[i]]:[keys[i],keys[j]];duels.push(await p.evaluate(([a,c])=>window.__sim(a,c),[a,c]));}
 }
 require('fs').writeFileSync(__dirname+'/datos.json',JSON.stringify({data,dps,duels}));
 console.log('duels',duels.length,'errors',errs.length, errs.slice(0,2));await b.close();
})();
