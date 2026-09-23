// Replaced at build time for GitHub Pages; the original server build keeps its API.
declare const __MONITOR_BASE__: string | undefined;
declare const __MONITOR_ENDPOINT__: string | undefined;
export const assetBase = typeof __MONITOR_BASE__ === 'undefined' ? '/' : __MONITOR_BASE__;
export function assetUrl(path: string) { return assetBase + path.replace(/^\//, ''); }
export function monitorUrl() {
    const endpoint = typeof __MONITOR_ENDPOINT__ === 'undefined' ? '/api/monitor' : __MONITOR_ENDPOINT__;
    // Raw GitHub caches responses. A shared 30-second bucket avoids stale browser/CDN entries.
    return endpoint + (endpoint.includes('?') ? '&' : '?') + 'v=' + Math.floor(Date.now() / 30000);
}
