import Monitor from './monitor';
import { readMonitorPage } from '@/lib/store';
export const dynamic = 'force-dynamic';
export default async function Home() {
    const {snapshot,renderedAt}=await readMonitorPage();
    return <Monitor initial={snapshot} renderedAt={renderedAt} />;
}
