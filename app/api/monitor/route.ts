import { readMonitor } from '@/lib/store';
export async function GET() {
    const snapshot=await readMonitor();
    return Response.json(snapshot,{headers:{'Cache-Control':'private, no-store'}});
}
