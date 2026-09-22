async (page) => {
    await page.goto('http://localhost:5173/');
    await page.locator('.post-row').first().waitFor();
    const originalCount = await page.locator('.post-row').count();
    const snapshot = await page.evaluate(async () => (await fetch('/api/monitor')).json());
    await page.route('**/api/monitor', route => route.fulfill({status:503,body:'Unavailable'}));
    await page.locator('.refresh-button').click();
    await page.getByText('Updates delayed',{exact:true}).waitFor();
    if(await page.locator('.post-row').count()!==originalCount)throw Error('Failure erased existing data');
    await page.unroute('**/api/monitor');
    await page.route('**/api/monitor', route => route.fulfill({json:{...snapshot,posts:[],events:[],error:null,checkedAt:new Date().toISOString()}}));
    await page.locator('.refresh-button').click();
    await page.getByText('No updates here yet.',{exact:true}).waitFor();
    if(await page.locator('.rare-cell').count()<365)throw Error('Empty data broke the calendar');
    await page.unroute('**/api/monitor');
    await page.locator('.refresh-button').click();
    await page.locator('.post-row').first().waitFor();
    await page.getByText('Monitoring',{exact:true}).waitFor();
    return {checks:['Failed refresh preserves data','Empty feed remains usable','Successful refresh restores monitoring']};
}
