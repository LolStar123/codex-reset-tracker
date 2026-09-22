// A local, gesture-only key sound. No remote audio, recording or permissions.
let context:AudioContext|null=null;
export function playKeyThock() {
    try {
        context??=new AudioContext();
        if(context.state==='suspended')void context.resume().catch(()=>{});
        const t=context.currentTime;
        const master=context.createGain();master.gain.value=.32;master.connect(context.destination);
        const body=context.createOscillator();body.type='sine';
        body.frequency.setValueAtTime(210,t);body.frequency.exponentialRampToValueAtTime(72,t+.085);
        const bodyGain=context.createGain();bodyGain.gain.setValueAtTime(0,t);bodyGain.gain.linearRampToValueAtTime(.6,t+.004);bodyGain.gain.exponentialRampToValueAtTime(.001,t+.135);
        body.connect(bodyGain);bodyGain.connect(master);body.start(t);body.stop(t+.15);
        const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.095),context.sampleRate);
        const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/(context.sampleRate*.018));
        const contact=context.createBufferSource();contact.buffer=buffer;
        const lowpass=context.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=1250;lowpass.Q.value=.65;
        const contactGain=context.createGain();contactGain.gain.value=.23;
        contact.connect(lowpass);lowpass.connect(contactGain);contactGain.connect(master);contact.start(t);
        body.onended=()=>{body.disconnect();bodyGain.disconnect();contact.disconnect();lowpass.disconnect();contactGain.disconnect();master.disconnect();};
    } catch { /* Sound is optional; checking the feed must still work. */ }
}
