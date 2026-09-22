async(page)=>{
 const checks=[],errors=[];
 const check=(name,ok)=>{if(!ok)throw Error(name);checks.push(name);};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1050});
 await page.goto('http://localhost:5173/');
 await page.waitForFunction(()=>!!document.documentElement.dataset.theme);
 const expected=await page.locator('.reset-brief .sr-only').textContent();
 check('Outlook begins by typing',await page.locator('.reset-brief p>span[aria-hidden=true]').innerText().then(t=>t.length<expected.length+1));
 await page.waitForFunction(text=>document.querySelector('.reset-brief p>span[aria-hidden=true]').textContent===text+'_',expected);
 check('Outlook finishes with a cursor',true);
 check('One last-reset clock',await page.locator('[role=timer]').count()===1);
 check('Three notes by default',await page.locator('.post-row').count()===3);
 const body=await page.locator('body').innerText();
 check('Taglines and monitoring badge removed',!['Every reset. Even','tuned in to','Monitoring','since source confirmation','straight from his keyboard','Last full reset','Last banked reset'].some(t=>body.includes(t)));
 check('Header names the tracker',await page.locator('.wordmark').innerText().then(t=>t.replace(/\s+/g,' ').trim()==='codex reset tracker'));
 await page.waitForFunction(()=>document.querySelector('.tibo-key-buddy').complete&&document.querySelector('.tibo-key-buddy').naturalWidth>0);
 await page.screenshot({path:'output/playwright/minimal-desktop.png',fullPage:true});
 await page.setViewportSize({width:320,height:800});
 check('No overflow at 320px',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'output/playwright/minimal-mobile.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
 await page.waitForFunction(()=>document.querySelector('.reset-brief p>span[aria-hidden=true]')?.textContent===document.querySelector('.reset-brief .sr-only')?.textContent+'_');
 check('Reduced motion immediately reveals the brief',await page.locator('.brief-cursor').evaluate(el=>getComputedStyle(el).animationName==='none'));
 check('No hydration or runtime errors',errors.length===0);
 return {checks,errors};
}
