'use strict';
// Esc 설정 / 일시정지 / 게임오버 관리
function clearHeldInputs(){for(const k of Object.keys(keys))keys[k]=false;document.querySelectorAll('.pressed').forEach(el=>el.classList.remove('pressed'))}
function audioSuspend(){const ac=typeof getGameAudioContext==='function'?getGameAudioContext():null;if(ac&&ac.state==='running')ac.suspend().catch(()=>{})}
function audioResume(){const ac=typeof getGameAudioContext==='function'?getGameAudioContext():null;if(ac&&ac.state==='suspended')ac.resume().catch(()=>{})}
function showSystemOverlay(kind,title,text,actions,icon='⏸️'){
  if(!ui.systemOverlay)return;ui.systemKicker.textContent=kind;ui.systemIcon.textContent=icon;ui.systemTitle.textContent=title;ui.systemText.textContent=text;
  ui.systemActions.innerHTML=actions.map(a=>`<button class="${a.alt?'systemBtn alt':'systemBtn'}" data-system-action="${a.id}">${a.label}</button>`).join('');
  ui.systemOverlay.style.display='grid';ui.systemOverlay.setAttribute('aria-hidden','false');
  actions.forEach(a=>{const b=ui.systemActions.querySelector(`[data-system-action="${a.id}"]`);if(b)b.onclick=a.onClick});
}
function hideSystemOverlay(){if(!ui.systemOverlay)return;ui.systemOverlay.style.display='none';ui.systemOverlay.setAttribute('aria-hidden','true')}
function canPauseGame(){return !gameOver && phase!=='intro'}
function openPauseMenu(){
  if(!canPauseGame())return;
  if(gamePaused)return;
  gamePaused=true;pauseStartedAt=performance.now();pauseVisualNow=pauseStartedAt;clearHeldInputs();audioSuspend();
  showSystemOverlay('GAME PAUSED','일시정지','잠시 멈췄어요. 이어서 하거나 현재 스테이지를 다시 시작할 수 있습니다.',[
    {id:'resume',label:'▶ 이어서 하기',onClick:resumeGame},
    {id:'restart',label:'↻ 현재 스테이지 다시 시작',alt:true,onClick:restartCurrentActivity},
    {id:'home',label:'⌂ 홈으로 돌아가기',alt:true,onClick:returnHomeFromSystem}
  ],'⏸️');
}
function resumeGame(){
  if(!gamePaused||gameOver)return;
  const pausedFor=performance.now()-pauseStartedAt;if(phase==='gather'&&!tutorialMode)gatherEnd+=pausedFor;
  gamePaused=false;hideSystemOverlay();last=performance.now();audioResume();
}
function togglePauseMenu(){if(gameOver)return;if(gamePaused)resumeGame();else openPauseMenu()}
function restartCurrentActivity(){
  gamePaused=false;gameOver=false;hideSystemOverlay();clearHeldInputs();clearRepairTimer();audioResume();last=performance.now();
  if(tutorialMode){beginInteractiveTutorial(false);return}
  selectStage(currentStageIndex,true);
}
function resetUiForHome(){
  ui.prep.style.display='none';ui.hazard.style.display='none';if(ui.weather)ui.weather.style.display='none';ui.inventory.style.display='none';ui.inst.style.display='none';ui.nav.style.display='none';ui.progress.style.display='none';ui.camera.style.display='none';ui.dock.style.display='none';ui.controls.style.display='none';if(ui.mouseControls)ui.mouseControls.style.display='none';if(ui.tutorialCoach)ui.tutorialCoach.style.display='none';
}
function returnHomeFromSystem(){
  gamePaused=false;gameOver=false;tutorialMode=false;hideSystemOverlay();clearHeldInputs();clearRepairTimer();audioResume();resetUiForHome();if(typeof setGameAudioMode==='function')setGameAudioMode('office');showMainMenu();last=performance.now();
}
function triggerGameOver(reason='map'){
  if(gameOver)return;gameOver=true;gamePaused=false;pauseVisualNow=performance.now();clearHeldInputs();ship.speed=0;ship.throttle=0;if(typeof audioSuspend==='function')audioSuspend();
  const mapOut=reason==='map';
  showSystemOverlay('GAME OVER',mapOut?'운항 해역을 이탈했어요':'안전도가 0이 되었어요',mapOut?'정해진 게임 해역 밖으로 나가면 구조 안전을 위해 임무가 종료됩니다. 항로와 미니맵을 확인하며 다시 운항해 보세요.':'암초 충돌이 너무 많이 발생했습니다. 속도를 줄이고 주의표지를 확인해 다시 도전해 보세요.',[
    {id:'retry',label:'↻ 현재 스테이지 다시 시작',onClick:restartCurrentActivity},
    {id:'home',label:'⌂ 홈으로 돌아가기',alt:true,onClick:returnHomeFromSystem}
  ],mapOut?'🗺️':'⚠️');
}
const pauseButton=$('pauseBtn');if(pauseButton)pauseButton.onclick=()=>{if(phase==='intro')showToast('스테이지를 시작하면 Esc 또는 설정 버튼으로 일시정지할 수 있어요.');else togglePauseMenu()};
