'use strict';
// 게임 전체 오디오: 사무실 분위기, 전화벨, 60초 긴박음, 바다/파도, 갈매기 효과음
// 외부 음원 파일 없이 Web Audio API로 생성합니다.
const gameAudio={ctx:null,master:null,mode:null,modeNodes:[],timers:[],intervals:[],phoneTimers:[],unlocked:false,noiseBuffer:null};

function getGameAudioContext(){return gameAudio.ctx}
function gameAudioUnlocked(){return !!(gameAudio.unlocked&&gameAudio.ctx&&gameAudio.ctx.state==='running')}
function unlockGameAudio(){
 if(gameAudio.unlocked&&gameAudio.ctx){if(gameAudio.ctx.state==='suspended')gameAudio.ctx.resume();return}
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 try{
  const ac=new AC(),master=ac.createGain();master.gain.value=.32;master.connect(ac.destination);
  gameAudio.ctx=ac;gameAudio.master=master;gameAudio.unlocked=true;gameAudio.noiseBuffer=createNoiseBuffer(ac,2.4);
  if(ac.state==='suspended')ac.resume();
  const desired=phase==='gather'?'gather':(phase==='sail'||phase==='dock'||phase==='verify'||phase==='return')?'sail':phase==='repair'?'repair':phase==='office'||phase==='brief'?'office':null;
  if(desired)setGameAudioMode(desired,true);
 }catch(_){gameAudio.unlocked=false}
}
function createNoiseBuffer(ac,seconds){const len=Math.max(1,Math.floor(ac.sampleRate*seconds)),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<len;i++){const white=Math.random()*2-1;last=last*.84+white*.16;d[i]=last*.9}return buf}
function rememberNode(...nodes){gameAudio.modeNodes.push(...nodes);return nodes[0]}
function clearModeAudio(){
 for(const id of gameAudio.intervals)clearInterval(id);gameAudio.intervals.length=0;
 for(const id of gameAudio.timers)clearTimeout(id);gameAudio.timers.length=0;
 for(const n of gameAudio.modeNodes){try{if(n.stop)n.stop()}catch(_){}try{n.disconnect()}catch(_){}}gameAudio.modeNodes.length=0;
 gameAudio.mode=null;
}
function clearPhoneTimers(){for(const id of gameAudio.phoneTimers)clearTimeout(id);gameAudio.phoneTimers.length=0}
function startLoopNoise({gain=.04,lowpass=900,highpass=0,rate=1,lfoHz=0,lfoDepth=0}={}){
 const ac=gameAudio.ctx;if(!ac||!gameAudio.noiseBuffer)return null;
 const src=ac.createBufferSource();src.buffer=gameAudio.noiseBuffer;src.loop=true;src.playbackRate.value=rate;
 const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lowpass;let tail=lp;
 let hp=null;if(highpass>0){hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=highpass;lp.connect(hp);tail=hp}
 const g=ac.createGain();g.gain.value=gain;src.connect(lp);tail.connect(g);g.connect(gameAudio.master);
 rememberNode(src,lp,g);if(hp)rememberNode(hp);
 if(lfoHz>0&&lfoDepth>0){const lfo=ac.createOscillator(),lg=ac.createGain();lfo.type='sine';lfo.frequency.value=lfoHz;lg.gain.value=lfoDepth;lfo.connect(lg);lg.connect(g.gain);rememberNode(lfo,lg);lfo.start()}
 src.start();return src
}
function softTone(freq,dur=.6,vol=.025,delay=0,type='sine'){
 const ac=gameAudio.ctx;if(!gameAudioUnlocked())return;const t=ac.currentTime+delay,osc=ac.createOscillator(),g=ac.createGain();osc.type=type;osc.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+dur);osc.connect(g);g.connect(gameAudio.master);osc.start(t);osc.stop(t+dur+.03)
}
function startOfficeAmbience(){
 startLoopNoise({gain:.012,lowpass:420,highpass:55,rate:.72,lfoHz:.055,lfoDepth:.004});
 const schedule=()=>{if(gameAudio.mode!=='office'||!gameAudioUnlocked())return;softTone(261.63,1.4,.010,0,'sine');softTone(329.63,1.6,.007,.08,'sine');const id=setTimeout(schedule,7500+Math.random()*5500);gameAudio.timers.push(id)};schedule();
}
function startGatherMusic(){
 startLoopNoise({gain:.010,lowpass:500,highpass:80,rate:1.08,lfoHz:.35,lfoDepth:.003});
 let beat=0;const pulse=()=>{if(gameAudio.mode!=='gather'||!gameAudioUnlocked())return;const rem=Math.max(0,gatherEnd-performance.now()),urgent=rem<10000;softTone(beat%2?164.81:130.81,urgent?.13:.22,urgent?.038:.024,0,'square');if(urgent)softTone(659.25,.055,.020,.12,'triangle');beat++};pulse();const id=setInterval(pulse,420);gameAudio.intervals.push(id)
}
function startSeaAmbience(level=1){
 // 파도: 저역 노이즈 + 느린 음량 파동. 바람: 고역 노이즈를 아주 작게 겹침.
 startLoopNoise({gain:.105*level,lowpass:780,highpass:45,rate:.82,lfoHz:.085,lfoDepth:.045*level});
 startLoopNoise({gain:.018*level,lowpass:2600,highpass:650,rate:1.12,lfoHz:.13,lfoDepth:.006*level});
}
function startRepairAmbience(){startSeaAmbience(.42);startLoopNoise({gain:.008,lowpass:380,highpass:70,rate:.7,lfoHz:.08,lfoDepth:.002})}
function setGameAudioMode(mode,force=false){
 if(!gameAudioUnlocked())return;if(!force&&gameAudio.mode===mode)return;clearModeAudio();gameAudio.mode=mode;
 if(mode==='office')startOfficeAmbience();else if(mode==='gather')startGatherMusic();else if(mode==='sail')startSeaAmbience(1);else if(mode==='repair')startRepairAmbience();else if(mode==='done')startSeaAmbience(.32)
}
function playPhoneBellOnce(delay=0){
 const ac=gameAudio.ctx;if(!gameAudioUnlocked())return;const start=ac.currentTime+delay;
 for(const f of [620,780]){const osc=ac.createOscillator(),g=ac.createGain();osc.type='sine';osc.frequency.setValueAtTime(f,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(.075,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+.20);osc.connect(g);g.connect(gameAudio.master);osc.start(start);osc.stop(start+.23)}
}
function playPhoneRingSequence(){
 if(!gameAudioUnlocked())return;clearPhoneTimers();playPhoneBellOnce(0);playPhoneBellOnce(.28);
 const id1=setTimeout(()=>{if(phase==='office'){playPhoneBellOnce(0);playPhoneBellOnce(.28)}},1250);gameAudio.phoneTimers.push(id1);
 const id2=setTimeout(()=>{if(phase==='office'){playPhoneBellOnce(0);playPhoneBellOnce(.28)}},2850);gameAudio.phoneTimers.push(id2)
}
function stopPhoneRing(){clearPhoneTimers()}
function playPickupSound(){if(!gameAudioUnlocked())return;softTone(520,.08,.025,0,'triangle');softTone(760,.11,.018,.08,'triangle')}
function playImpactSound(){if(!gameAudioUnlocked())return;const ac=gameAudio.ctx,t=ac.currentTime,osc=ac.createOscillator(),g=ac.createGain();osc.type='sawtooth';osc.frequency.setValueAtTime(120,t);osc.frequency.exponentialRampToValueAtTime(48,t+.22);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.0001,t+.28);osc.connect(g);g.connect(gameAudio.master);osc.start(t);osc.stop(t+.3)}
function playRepairSuccessSound(){if(!gameAudioUnlocked())return;softTone(523.25,.24,.032,0,'triangle');softTone(659.25,.28,.030,.12,'triangle');softTone(783.99,.38,.028,.25,'triangle')}
function playSeagullCall(){
 if(!gameAudioUnlocked())return;const ac=gameAudio.ctx,t0=ac.currentTime+.02;
 const call=(start,dur,f1,f2,vol)=>{const osc=ac.createOscillator(),gain=ac.createGain(),filter=ac.createBiquadFilter();osc.type='triangle';osc.frequency.setValueAtTime(f1,start);osc.frequency.exponentialRampToValueAtTime(f2,start+dur*.75);filter.type='bandpass';filter.frequency.value=1100;filter.Q.value=.8;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(vol,start+.045);gain.gain.exponentialRampToValueAtTime(.0001,start+dur);osc.connect(filter);filter.connect(gain);gain.connect(gameAudio.master);osc.start(start);osc.stop(start+dur+.02)};
 call(t0,.30,1550,760,.045);call(t0+.36,.34,1340,650,.040)
}
