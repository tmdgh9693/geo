'use strict';
// 키보드·마우스·터치 입력. 모든 핵심 흐름은 마우스만으로도 완료할 수 있습니다.
function cycleCamera(){
  if(!(phase==='sail'||phase==='dock'||phase==='verify'||phase==='return')) return;
  cameraMode=(cameraMode+1)%3; updateCameraLabel();
  showToast(cameraMode===0?'기본 탑뷰 · 진행방향 고정':cameraMode===1?'탑뷰 · 북쪽 고정':'후방 추적 시점');
}
addEventListener('keydown',e=>{
  if(typeof unlockGameAudio==='function')unlockGameAudio(); if(typeof unlockWildlifeAudio==='function')unlockWildlifeAudio();
  const k=e.key.toLowerCase();
  if(k==='escape'){e.preventDefault();if(typeof togglePauseMenu==='function')togglePauseMenu();return}
  if(gamePaused||gameOver){e.preventDefault();return}
  if(phase==='repair'&&typeof handleEquipmentDirectionKey==='function'&&handleEquipmentDirectionKey(k)){e.preventDefault();return}
  if((k==='enter'||k===' ')&&keyboardConfirm()){e.preventDefault();return}
  keys[k]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='e')interact(); if(k==='q')showWeightTable(); if(k==='c')cycleCamera();
  if(k==='n'&&(phase==='sail'||phase==='dock'||phase==='verify'||phase==='return'))ship.throttle=0;
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function holdKeyButton(btn,key){
  let pressedAt=0,releaseTimer=null;
  const on=e=>{e.preventDefault();if(gamePaused||gameOver)return;if(typeof unlockGameAudio==='function')unlockGameAudio();if(releaseTimer){clearTimeout(releaseTimer);releaseTimer=null}pressedAt=performance.now();keys[key]=true;btn.classList.add('pressed')};
  const off=e=>{e.preventDefault();const elapsed=performance.now()-pressedAt;const release=()=>{keys[key]=false;btn.classList.remove('pressed');releaseTimer=null};if(elapsed<140)releaseTimer=setTimeout(release,140-elapsed);else release()};
  btn.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(t=>btn.addEventListener(t,off));
}
document.querySelectorAll('.touchBtn').forEach(b=>holdKeyButton(b,b.dataset.k));
document.querySelectorAll('.mouseCtrl[data-hold]').forEach(b=>holdKeyButton(b,b.dataset.hold));
const neutral=$('mouseNeutral'); if(neutral) neutral.onclick=()=>{ship.throttle=0;showToast('엔진 중립')};
const cameraBtn=$('mouseCamera'); if(cameraBtn) cameraBtn.onclick=cycleCamera;
const workBtn=$('mouseWork'); if(workBtn) workBtn.onclick=interact;

function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
canvas.addEventListener('pointerdown',e=>{
  if(gamePaused||gameOver)return;
  if(typeof unlockGameAudio==='function')unlockGameAudio(); if(typeof unlockWildlifeAudio==='function')unlockWildlifeAudio();
  const p=canvasPoint(e);
  if(phase==='shore'){if(typeof handleShoreCanvasClick==='function')handleShoreCanvasClick(p);return}
  if(!(phase==='office'||phase==='gather')) return;
  let target={x:clamp(p.x,70,1845),y:clamp(p.y,145,1015)},action=null;
  if(phase==='office'&&dist(p.x,p.y,365,295)<105){target={x:365,y:345};action='phone'}
  if(phase==='gather'){
    let best=null,bestD=90; for(const it of items){if(it.taken)continue;const d=dist(p.x,p.y,it.x,it.y);if(d<bestD){best=it;bestD=d}}
    if(best){target={x:best.x,y:best.y};action='item'}
    else if(p.x>1730&&p.y>760){target={x:1790,y:900};action='gate'}
  }
  officeMoveTarget=target; officeAutoAction=action;
});

$('startBtn').onclick=()=>startStoryExperience();
const stageBtn=$('stageBtn');if(stageBtn)stageBtn.onclick=showStageSelect;
const manualBtn=$('manualBtn');if(manualBtn)manualBtn.onclick=()=>showManual('menu');
const guideBtn=$('guideBtn');if(guideBtn)guideBtn.onclick=()=>showManual('game');
$('weightBtn').onclick=()=>showWeightTable();
addEventListener('pointerdown',()=>{if(typeof unlockGameAudio==='function')unlockGameAudio();if(typeof unlockWildlifeAudio==='function')unlockWildlifeAudio()},{passive:true});
