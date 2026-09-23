import { createRoot } from 'react-dom/client';
import '@fontsource-variable/space-grotesk';
import '@fontsource/ibm-plex-mono/400.css';
import '../app/globals.css';
import Monitor from '../app/monitor';
import initial from '../data/bootstrap.json';
import type { Snapshot } from '../lib/types';

createRoot(document.getElementById('root')!).render(<Monitor initial={initial as Snapshot} renderedAt={Date.now()} />);
