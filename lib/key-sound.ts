// Recorded switch travel, self-hosted. Audio starts only inside a user gesture.
type Stroke = 'press' | 'release';
let context: AudioContext | null = null;
const files: Partial<Record<Stroke, Promise<ArrayBuffer>>> = {};
const decoded: Partial<Record<Stroke, Promise<AudioBuffer>>> = {};

function load(stroke: Stroke) {
    return files[stroke] ??= fetch(`/audio/cream-${stroke}.mp3`).then(response => {
        if (!response.ok) throw Error('Key sample unavailable');
        return response.arrayBuffer();
    }).catch(error => { delete files[stroke]; throw error; });
}
export function preloadKeySound() {
    for (const stroke of ['press', 'release'] as const) void load(stroke).catch(() => {});
}
export function playKeyThock(stroke: Stroke = 'press') {
    try {
        context ??= new AudioContext();
        const audio = context;
        const started = performance.now();
        const ready = audio.state === 'suspended' ? audio.resume() : Promise.resolve();
        const sample = decoded[stroke] ??= load(stroke).then(bytes => audio.decodeAudioData(bytes.slice(0)))
            .catch(error => { delete decoded[stroke]; throw error; });
        void Promise.all([ready, sample]).then(([, buffer]) => {
            // Never play a late click after a slow load or a blocked audio context.
            if (performance.now() - started > 180 || audio.state !== 'running') return;
            const source = audio.createBufferSource();
            const gain = audio.createGain();
            source.buffer = buffer;
            gain.gain.value = stroke === 'press' ? .65 : .3;
            source.connect(gain); gain.connect(audio.destination);
            source.onended = () => { source.disconnect(); gain.disconnect(); };
            source.start();
        }).catch(() => {});
    } catch { /* Sound is optional; checking the feed must still work. */ }
}
