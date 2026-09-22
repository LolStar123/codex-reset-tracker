// This Worker has no public route. A Cloudflare cron runs it independently of viewers.
export async function collect(env, request=fetch) {
    if(!env.MONITOR_ACCESS)throw Error('Collector credential is missing');
    const url=new URL('/api/collect',env.MONITOR_URL);
    if(url.protocol!=='https:')throw Error('Collector requires HTTPS');
    const response=await request(url,{
        method:'POST',redirect:'error',
        headers:{'OAI-Sites-Authorization':`Bearer ${env.MONITOR_ACCESS}`,Accept:'application/json'},
        signal:AbortSignal.timeout(110000),
    });
    if(!response.ok)throw Error(`Collector returned HTTP ${response.status}`);
    const receipt=await response.json();
    if(!receipt.checkedAt||!Number.isFinite(Date.parse(receipt.checkedAt))||Date.now()-Date.parse(receipt.checkedAt)>10*60000)
        throw Error('Collector has no recent successful source check');
    if(receipt.status==='failed')throw Error('Source collection failed');
    // Only health metadata reaches Cloudflare logs. Never log credentials or post bodies.
    return {status:receipt.status,checkedAt:receipt.checkedAt,latestPostAt:receipt.latestPostAt,postCount:receipt.postCount,resetCount:receipt.resetCount};
}
export default {
    async scheduled(_controller,env) {
        const receipt=await collect(env);
        console.log(JSON.stringify(receipt));
    },
};
