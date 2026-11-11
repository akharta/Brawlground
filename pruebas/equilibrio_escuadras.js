const {chromium}=require('playwright'); const fs=require('fs');
const cost=JSON.parse(fs.readFileSync(__dirname+'/costes.json'));
const HER=['aldric','lyra','gull']; const T=Object.keys(cost).filter(k=>!HER.includes(k));
const only=process.argv[2]?process.argv[2].split(','):null;
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
 let errs=0;p.on('pageerror',e=>{errs++;console.error('ERR',e.message)});
 await p.route(/cdnjs\.cloudflare\.com.*phaser/, r=>r.fulfill({path:process.env.PHASER||__dirname+'/phaser.min.js',contentType:'application/javascript'}));
 await p.route(/fonts\.(googleapis|gstatic)/, r=>r.abort());
 await p.goto('http://localhost:8790/docs/index.html');await p.waitForSelector('#tap:not([hidden])',{timeout:30000});
 await p.click('#tap',{force:true});await p.waitForTimeout(500);
 await p.evaluate(()=>window.__startBattle(['legionario','arquera','tercio','lobo','valkiria','ninja','samurai','fraile'])); await p.waitForTimeout(800);
 const BUD=12, n=k=>Math.max(1,Math.round(BUD/cost[k]));
 const res=[]; const t0=Date.now();
 const A=only||T;
 for(const a of A) for(const c of T){ if(a===c) continue; if(!only && T.indexOf(c)<T.indexOf(a)) continue;
   for(const [x,y] of [[a,c],[c,a]]){
     const r=await p.evaluate(([x,nx,y,ny])=>{try{return window.__simSquad(x,nx,y,ny,150)}catch(e){return {err:e.message}}},[x,n(x),y,n(y)]);
     if(r.err){console.error('E',x,y,r.err);continue;} res.push(r);
   }}
 fs.writeFileSync(__dirname+'/bal_res.json',JSON.stringify(res));
 console.log('sims',res.length,'s',(Date.now()-t0)/1000,'errs',errs); await b.close();})();
