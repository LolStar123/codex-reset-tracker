async (page)=>{
 const checks=[];
 const now=Date.now();
 await page.clock.install({time:now});
 await page.goto('http://localhost:5173/');
 await page.waitForFunction(()=>!!document.documentElement.dataset.theme);
 const snapshot=await page.evaluate(()=>fetch('/api/monitor').then(r=>r.json()));
 const at=new Date(now).toISOString();
 const post={id:'qa-new-reset',author:'thsottiaux',at,text:'QA reset all propagated.',summary:'QA reset all propagated.',url:'https://x.com/thsottiaux',category:'confirmed',resetType:'regular',provenance:'direct'};
 const next={...snapshot,checkedAt:at,lastAttemptAt:at,error:null,posts:[post,...snapshot.posts],events:[{id:post.id,date:at.slice(0,10),type:'regular',postIds:[post.id],basis:'confirmation'},...snapshot.events]};
 let polls=0;
 await page.route('**/api/monitor',route=>{polls++;return route.fulfill({json:next});});
 await page.clock.fastForward(31000);
 await page.locator('#post-qa-new-reset').waitFor();
 if(!polls)throw Error('No automatic poll');checks.push('New source confirmation appears without clicking or reloading');
 const clock=await page.locator('.reset-clock .clock-source').getAttribute('href');
 if(clock!==post.url)throw Error('Clock did not use the new confirmation');checks.push('Last-reset clock advances to the new source');
 const date=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(at));
 if(!await page.getByRole('button',{name:`${date}: Full reset`,exact:true}).count())throw Error('Calendar did not update');
 checks.push('New confirmation lights up its calendar day');
 if(await page.locator('#post-qa-new-reset').count()!==1)throw Error('Duplicate update');
 checks.push('One shared update renders once');
 await page.unroute('**/api/monitor');await page.clock.resume();
 return {checks};
}
