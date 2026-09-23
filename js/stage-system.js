'use strict';
// 스토리/스테이지 진행 관리. 사건 주제는 스테이지마다 고정되고,
// 항해 장애물과 현장 장비 미니게임 3종은 매 플레이마다 달라집니다.

const STAGES = [
  { missionId:'beacon_repair', number:1, title:'바다 위 첫 신호', subtitle:'등표의 불빛을 복구하라', icon:'🚦',
    story:'첫 임무는 가까운 해상의 등표입니다. 작은 불빛 하나가 왜 중요한지 직접 수리하며 배워 봅니다.',
    lesson:'등표는 빛과 모양으로 주변 위험과 항로 정보를 전달하며, 계속 정상 작동하도록 점검해야 합니다.' },
  { missionId:'solar_fault', number:2, title:'햇빛을 전기로', subtitle:'태양광 전원을 살려라', icon:'☀️',
    story:'등표의 배터리가 빠르게 줄어들고 있습니다. 태양광 패널과 전원 계통을 점검해 밤에도 빛이 이어지게 해 보세요.',
    lesson:'태양광 패널이 만든 전기는 배터리에 저장되고, 저장된 전기가 밤의 등명기를 켜는 데 사용될 수 있습니다.' },
  { missionId:'lens_clean', number:3, title:'흐려진 빛', subtitle:'렌즈를 깨끗하게', icon:'🔆',
    story:'불은 켜지지만 멀리서 희미하게 보이는 등표가 있습니다. 렌즈와 광학부를 점검할 차례입니다.',
    lesson:'빛이 지나가는 렌즈가 더럽거나 잘못 장착되면 빛이 약하거나 흐리게 보일 수 있어 깨끗한 상태를 유지해야 합니다.' },
  { missionId:'position_drift', number:4, title:'제자리를 찾아라', subtitle:'등표 위치를 복구하라', icon:'📍',
    story:'높은 파도 뒤에 등표가 원래 위치에서 벗어났습니다. GPS와 계류 장비로 제자리로 돌려놓아야 합니다.',
    lesson:'항로표지는 불빛뿐 아니라 설치된 위치 자체도 중요한 정보이므로 위치와 고정 상태를 함께 관리합니다.' },
  { missionId:'beacon_install', number:5, title:'새 위험을 알려라', subtitle:'새 등표를 세워라', icon:'🪨',
    story:'새롭게 확인된 위험 구역에 새 표지가 필요합니다. 필요한 장비를 싣고 안전한 위치에 등표를 설치하세요.',
    lesson:'위험물이 있는 해역에서는 알맞은 항로표지를 통해 선박이 위험을 미리 알아차리고 안전하게 항해하도록 돕습니다.' },
  { missionId:'flash_pattern', number:6, title:'빛의 약속', subtitle:'점멸 신호를 바로잡아라', icon:'✨',
    story:'불빛은 켜지지만 점멸 간격이 이상한 등표가 있습니다. 신호를 정상으로 되돌려 주세요.',
    lesson:'항로표지의 빛은 켜져 있는 것뿐 아니라 색과 점멸 특성 같은 방식으로도 정보를 전달할 수 있습니다.' },
  { missionId:'lighthouse', number:7, title:'거문도로 가는 마지막 항해', subtitle:'거문도등대의 빛을 되살려라', icon:'🗼',
    story:'마지막 임무는 거문도등대입니다. 가는 길에 고장 난 등표도 수리하고, 거문도 접안시설에 배를 댄 뒤 직접 등대로 올라가 최종 점검을 완료하세요.',
    lesson:'등대와 등표는 각자의 위치에서 선박의 안전한 항해를 돕고, 정기적인 점검과 수리를 통해 그 기능을 계속 유지합니다.' }
];

let currentStageIndex = 0;
let unlockedStageIndex = 0;
let tutorialCompleted = false;

function loadStageProgress(){
  try{
    unlockedStageIndex = clamp(Number(localStorage.getItem('atn_story_unlocked') || 0),0,STAGES.length-1);
    tutorialCompleted = localStorage.getItem('atn_story_tutorial') === '1';
  }catch(_){ unlockedStageIndex=0; tutorialCompleted=false; }
}
function saveStageProgress(){
  try{
    localStorage.setItem('atn_story_unlocked', String(unlockedStageIndex));
    localStorage.setItem('atn_story_tutorial', tutorialCompleted?'1':'0');
  }catch(_){}
}
function stageInfo(){ return STAGES[currentStageIndex] || STAGES[0]; }
function updateStageHud(){
  const s=stageInfo();
  const el=$('stageLabel');
  if(el) el.textContent=`STAGE ${s.number} / ${STAGES.length} · ${s.title}`;
}
function loadMissionForStage(index=currentStageIndex){
  currentStageIndex=clamp(index,0,STAGES.length-1);
  const s=stageInfo();
  const template=missionTemplates.find(m=>m.id===s.missionId) || missionTemplates[0];
  currentMission=JSON.parse(JSON.stringify(template));
  currentMission.stage={...s};
  maxLoad=currentMission.maxLoad;
  inventory=[]; load=0;
  for(const it of items) it.taken=false;
  player.x=250; player.y=780;
  officeMoveTarget=null; officeAutoAction=null;
  renderInventory();
  buildWorldForMission();
  updateStageHud();
  return currentMission;
}
function ensureMission(force=false){
  if(!currentMission || force || currentMission.stage?.number!==stageInfo().number) loadMissionForStage(currentStageIndex);
  return currentMission;
}

const STORY_PAGES=[
  {tag:'프롤로그',title:'태풍이 지나간 다음 날',icon:'🌊',text:'여수 앞바다의 항로표지 안전센터에 여러 이상 신고가 들어옵니다. 등대와 등표의 빛, 전원, 위치를 하나씩 확인해야 합니다.'},
  {tag:'나의 역할',title:'오늘부터 견습 점검원!',icon:'🦺',text:'신고를 받고 필요한 장비를 챙긴 뒤 정비선을 직접 운항합니다. 현장에 도착하면 내가 가져온 준비물을 실제 작업에 사용합니다.'},
  {tag:'목표',title:'7개의 스테이지',icon:'🗺️',text:'쉬운 등명기 점검부터 시작해 전원, 렌즈, 위치, 설치, 점멸 신호까지 단계별로 배우며 마지막 임무까지 완수해 보세요.'}
];
// 읽는 튜토리얼 대신 실제 게임 공간에서 직접 조작하며 배우는 체험형 튜토리얼
let tutorialMode=false;
let tutorialStep=0;
let tutorialStoryStart=false;
let tutorialReturnStage=0;
let tutorialReturnWasMenu=true;
const TUTORIAL_PAD={x:520,y:825};
const TUTORIAL_STEPS=[
  {title:'이동해 보기',text:'노란 연습 지점까지 이동해 보세요. 키보드로 움직여도 되고, 바닥을 마우스로 클릭해도 됩니다.'},
  {title:'전화 받기',text:'전화가 울립니다. 전화기로 이동해 E를 누르거나 전화기를 클릭해 신고를 확인해 보세요.'},
  {title:'준비물 챙기기',text:'연습용 예비배터리를 찾아 직접 챙겨 보세요. 가까이에서 E를 누르거나 배터리를 클릭하면 됩니다.'},
  {title:'출동 게이트',text:'오른쪽 끝 출동 게이트로 이동해 보세요. 필수 장비를 챙기고 출동하는 흐름을 연습합니다.'},
  {title:'배 가속하기',text:'짧은 연습 항로입니다. W/↑ 또는 화면의 ▲ 가속 버튼으로 배를 움직여 보세요.'},
  {title:'방향 바꾸기',text:'A/D 또는 좌·우회전 버튼을 사용해 한 번 조타해 보세요.'},
  {title:'작업 지점 접근',text:'노란 연습 작업 지점까지 항해한 뒤 5 knot 이하로 감속하고 E 또는 화면의 작업 버튼을 눌러 보세요.'}
];

function showTutorialCoach(){
  if(!ui.tutorialCoach) return;
  if(!tutorialMode){ui.tutorialCoach.style.display='none';return}
  const step=TUTORIAL_STEPS[tutorialStep]||TUTORIAL_STEPS[0];
  ui.tutorialCoach.style.display='block';
  ui.tutorialStepBadge.textContent=`실전 튜토리얼 ${tutorialStep+1} / ${TUTORIAL_STEPS.length}`;
  ui.tutorialCoachTitle.textContent=step.title;
  ui.tutorialCoachText.textContent=step.text;
  ui.tutorialCoachProgress.innerHTML=TUTORIAL_STEPS.map((_,i)=>`<span class="${i<tutorialStep?'done':i===tutorialStep?'active':''}"></span>`).join('');
}
function setTutorialStep(step){
  tutorialStep=clamp(step,0,TUTORIAL_STEPS.length-1);
  showTutorialCoach();
  if(tutorialStep===1 && typeof playPhoneRingSequence==='function') playPhoneRingSequence();
  if(tutorialStep===2){
    phase='gather';
    ui.prep.style.display='block';
    const battery=items.find(x=>x.name==='예비배터리');
    ui.prepItems.innerHTML=`<div class="prepItem"><span class="prepDot">·</span><span>${battery?.icon||'🔋'} 예비배터리</span><span class="prepKg">${battery?.kg||9}kg</span></div>`;
    ui.prepLoad.textContent='연습용 준비물';
  }
}

function showPagedGuide(pages,index=0,onDone=()=>{},label='안내'){
  const i=clamp(index,0,pages.length-1),page=pages[i];
  showModal(`<div class="tag">${label} ${i+1} / ${pages.length}</div><div class="stageIntroIcon">${page.icon||'📘'}</div><h2>${page.title}</h2><p>${page.text}</p><div class="actions"><button class="btn" id="guideNext">${i===pages.length-1?'튜토리얼 시작':'다음'}</button>${i>0?'<button class="btn alt" id="guidePrev">이전</button>':''}</div>`);
  setTimeout(()=>{
    const next=$('guideNext'); if(next)next.onclick=()=>i===pages.length-1?onDone():showPagedGuide(pages,i+1,onDone,label);
    const prev=$('guidePrev'); if(prev)prev.onclick=()=>showPagedGuide(pages,i-1,onDone,label);
  },0);
}

function startStoryExperience(){
  if(typeof unlockGameAudio==='function') unlockGameAudio();
  phase='intro';
  showPagedGuide(STORY_PAGES,0,()=>beginInteractiveTutorial(true),'스토리');
}
function showTutorial(startStageAfter=false){ beginInteractiveTutorial(startStageAfter); }

function beginInteractiveTutorial(startStageAfter=false){
  tutorialStoryStart=!!startStageAfter;
  tutorialReturnStage=currentStageIndex;
  tutorialReturnWasMenu=phase==='intro';
  tutorialMode=true;
  tutorialStep=0;
  currentStageIndex=0;
  loadMissionForStage(0);
  inventory=[];load=0;maxLoad=currentMission.maxLoad;for(const it of items)it.taken=false;renderInventory();
  player.x=250;player.y=780;officeMoveTarget=null;officeAutoAction=null;
  hideModal();
  if(typeof setGameAudioMode==='function') setGameAudioMode('office');
  if(typeof stopPhoneRing==='function') stopPhoneRing();
  ui.prep.style.display='none';ui.hazard.style.display='none';ui.controls.style.display='none';if(ui.mouseControls)ui.mouseControls.style.display='none';
  phase='office';
  ui.phaseTitle.textContent='실전 튜토리얼 · 연습 임무';
  ui.missionText.textContent='화면의 안내를 따라 직접 움직이고, 신고를 받고, 장비를 챙기고, 정비선을 운항해 보세요.';
  showTutorialCoach();
  showToast('먼저 노란 연습 지점까지 직접 이동해 보세요.');
}
function updateTutorialOfficeProgress(){
  if(!tutorialMode) return;
  if(tutorialStep===0 && dist(player.x,player.y,TUTORIAL_PAD.x,TUTORIAL_PAD.y)<70){
    setTutorialStep(1);showToast('좋아요! 이제 울리는 전화기를 받아 보세요.');
  }
}
function onTutorialPickup(item){
  if(!tutorialMode || tutorialStep!==2) return;
  if(item.name==='예비배터리'){
    const row=ui.prepItems.querySelector('.prepItem');if(row){row.classList.add('done');const dot=row.querySelector('.prepDot');if(dot)dot.textContent='✓'}
    setTutorialStep(3);showToast('배터리를 챙겼어요. 이제 오른쪽 출동 게이트로 이동하세요.');
  }
}
function tutorialInteract(){
  if(!tutorialMode) return false;
  if(phase==='office'){
    if(tutorialStep===1 && dist(player.x,player.y,365,295)<100){
      if(typeof stopPhoneRing==='function')stopPhoneRing();
      setTutorialStep(2);showToast('연습 신고 확인 완료! 예비배터리를 찾아 챙겨 보세요.');
      return true;
    }
    if(tutorialStep===0){showToast('먼저 노란 연습 지점까지 이동해 보세요.');return true}
    showToast('전화기로 이동해 신고를 확인해 보세요.');return true;
  }
  if(phase==='gather'){
    for(const item of items){
      if(!item.taken && dist(player.x,player.y,item.x,item.y)<76){pickup(item);return true}
    }
    if(player.x>1760 && player.y>800){
      if(tutorialStep===3){startTutorialSail();return true}
      showToast('먼저 연습용 예비배터리를 챙겨 보세요.');return true;
    }
    return true;
  }
  if((phase==='sail'||phase==='dock') && tutorialStep===6){
    const near=dist(ship.x,ship.y,goal.x,goal.y)<310;
    if(!near){showToast('노란 연습 작업 지점까지 조금 더 가까이 이동하세요.');return true}
    if(Math.abs(ship.speed)>WORK_SPEED_UNITS){showToast(`작업 전에 ${WORK_SPEED_KNOTS} knot 이하로 감속하세요.`);return true}
    finishInteractiveTutorial();return true;
  }
  return false;
}
function buildTutorialWorld(){
  goal={x:4050,y:8050,name:'연습 작업 지점',kind:'beacon'};
  route=[start,{x:2550,y:8900},{x:3300,y:8500},goal];
  buoys=[];
  for(let i=0;i<route.length-1;i++)for(const t of [.36,.72]){buoys.push({...pointOnSegment(route[i],route[i+1],t,-routeHalf*.72),side:'red'});buoys.push({...pointOnSegment(route[i],route[i+1],t,routeHalf*.72),side:'green'})}
  rocks=[];dangerMarks=[];weatherEvents=[];activeWeather=null;midRouteBeacon=null;fog={x:9000,y:1000,r:300};
  if(typeof buildFaunaForRoute==='function')buildFaunaForRoute();
}
function startTutorialSail(){
  if(typeof stopPhoneRing==='function')stopPhoneRing();
  if(typeof setGameAudioMode==='function')setGameAudioMode('sail');
  buildTutorialWorld();resetShip();cameraMode=0;
  ui.prep.style.display='none';ui.inventory.style.display='none';ui.inst.style.display='block';ui.nav.style.display='block';ui.progress.style.display='block';ui.camera.style.display='block';ui.controls.style.display='none';if(ui.mouseControls)ui.mouseControls.style.display='grid';
  phase='sail';
  ui.phaseTitle.textContent='실전 튜토리얼 · 정비선 운항';ui.missionText.textContent='짧은 연습 항로에서 가속, 조타, 감속, 작업 시작을 직접 익혀 봅니다.';
  setTutorialStep(4);updateCameraLabel();
}
function updateTutorialShipProgress(){
  if(!tutorialMode) return;
  if(tutorialStep===4 && Math.abs(ship.speed)>28){setTutorialStep(5);showToast('배가 움직입니다! 이제 좌우로 한 번 방향을 바꿔 보세요.');return}
  if(tutorialStep===5 && Math.abs(ship.rudder)>.28){setTutorialStep(6);showToast('조타 성공! 연습 작업 지점까지 이동해 감속한 뒤 작업을 시작하세요.');return}
}
function finishInteractiveTutorial(){
  tutorialCompleted=true;saveStageProgress();tutorialMode=false;if(ui.tutorialCoach)ui.tutorialCoach.style.display='none';
  ship.speed=0;ship.throttle=0;phase='intro';if(ui.mouseControls)ui.mouseControls.style.display='none';if(typeof setGameAudioMode==='function')setGameAudioMode('office');
  const primary=tutorialStoryStart?'STAGE 1 시작':(tutorialReturnWasMenu?'메인 메뉴로':'원래 스테이지로 돌아가기');
  showModal(`<div class="tag">실전 튜토리얼 완료</div><div class="guideHero">🎓</div><h2>조작 연습 완료!</h2><p>직접 이동하고, 전화 신고를 받고, 준비물을 챙기고, 정비선을 운항해서 작업 지점까지 도착했습니다.</p><div class="manualCard"><b>이제 기억할 흐름</b><p>신고 확인 → 준비물 확보 → 출동 → 안전 운항 → 현장 작업 → 원리 확인</p></div><div class="actions"><button class="btn" id="tutorialFinishAction">${primary}</button><button class="btn alt" id="tutorialHelp">조작 / 도움말 보기</button></div>`);
  setTimeout(()=>{
    $('tutorialFinishAction').onclick=()=>{if(tutorialStoryStart)selectStage(0,true);else if(tutorialReturnWasMenu)showMainMenu();else selectStage(tutorialReturnStage,true)};
    $('tutorialHelp').onclick=()=>showManual('tutorial-end');
  },0);
}
function showManual(source='auto'){
  const returnToGame=source==='game' || (source==='auto' && phase!=='intro');
  showModal(`<div class="tag">조작 / 도움말</div><h2>게임에 필요한 내용을 한곳에서 확인해요</h2>
    <div class="manualGrid helpManualGrid">
      <div class="manualCard"><b>🎯 게임 목표</b><p>스테이지마다 항로표지 이상 신고를 해결합니다. 신고 확인 → 준비 → 항해 → 현장 작업 순서로 진행합니다.</p></div>
      <div class="manualCard"><b>🏢 사무실 / 창고</b><p>WASD·방향키 또는 바닥 클릭으로 이동합니다. 전화기와 장비도 직접 클릭할 수 있습니다.</p></div>
      <div class="manualCard"><b>🎒 60초 준비</b><p>화면의 필수 준비물을 먼저 챙기세요. 실제로 가져온 수리 장비 가운데 3개가 현장 미니게임으로 나옵니다.</p></div>
      <div class="manualCard"><b>🚤 정비선 운항</b><p>W/↑ 가속, S/↓ 감속·후진, A/D 또는 ←/→ 조타입니다. 가속·감속 키를 놓으면 물의 저항으로 속도가 자연스럽게 줄어듭니다. 화면 아래 마우스 버튼으로도 동일하게 조작할 수 있습니다.</p></div>
      <div class="manualCard"><b>⚠️ 항해 안전</b><p>암초 앞의 주의 표시를 먼저 확인하고 감속해 우회합니다. 작업/접안 구간에서는 5 knot 이하로 줄여야 작업을 시작할 수 있습니다.</p></div>
      <div class="manualCard"><b>🛠️ 현장 미니게임</b><p>배터리 장착, 케이블 연결, 렌즈 정렬, GPS 위치 맞추기 등이 나옵니다. GPS는 키보드 방향키 또는 화면의 ▲▼◀▶ 버튼을 직접 클릭해 이동할 수 있습니다.</p></div>
      <div class="manualCard"><b>⌨️ 키보드</b><p>Enter/Space는 확인·다음, Q는 장비 무게표, Esc는 설정/일시정지입니다. 사무실에서는 E로 상호작용할 수 있습니다.</p></div>
      <div class="manualCard"><b>🖱️ 마우스</b><p>사무실은 목적지를 클릭해 이동하고, 항해는 화면 아래 버튼을 누른 채 조작합니다. 미니게임도 클릭·슬라이더·선택 방식으로 진행합니다.</p></div>
    </div><div class="actions"><button class="btn" id="manualClose">게임으로 돌아가기</button><button class="btn alt" id="manualTutorial">실전 튜토리얼 다시 하기</button></div>`);
  setTimeout(()=>{
    $('manualClose').onclick=()=>returnToGame?hideModal():showMainMenu();
    $('manualTutorial').onclick=()=>beginInteractiveTutorial(false);
  },0);
}
function showMainMenu(){
  phase='intro';
  showModal(`<div class="tag">항로표지 안전학교 · STORY MODE</div><h1>바다의 빛을<br>지켜라!</h1><p>견습 점검원이 되어 7개의 스테이지를 차례로 해결하세요. 스테이지의 사건은 고정이지만 항해 상황과 가져온 장비 미니게임은 매번 달라집니다.</p><div class="actions"><button class="btn" id="menuContinue">${unlockedStageIndex>0?'계속하기':'스토리 시작'}</button><button class="btn alt" id="menuStages">스테이지 선택</button><button class="btn alt" id="menuManual">게임 설명서</button></div>`);
  setTimeout(()=>{
    $('menuContinue').onclick=()=> tutorialCompleted ? selectStage(unlockedStageIndex,true) : startStoryExperience();
    $('menuStages').onclick=showStageSelect;
    $('menuManual').onclick=showManual;
  },0);
}
function showStageSelect(){
  const cards=STAGES.map((s,i)=>{const locked=i>unlockedStageIndex;return `<button class="stageCard ${locked?'locked':''}" data-stage="${i}" ${locked?'disabled':''}><span class="stageNo">STAGE ${s.number}</span><span class="stageIcon">${locked?'🔒':s.icon}</span><b>${s.title}</b><small>${s.subtitle}</small></button>`}).join('');
  showModal(`<div class="tag">스테이지 선택</div><h2>항로표지 점검 기록</h2><p>완료한 스테이지는 다시 플레이할 수 있습니다.</p><div class="stageGrid">${cards}</div><div class="actions"><button class="btn alt" id="stageBack">돌아가기</button></div>`);
  setTimeout(()=>{
    ui.modal.querySelectorAll('.stageCard:not(.locked)').forEach(btn=>btn.onclick=()=>selectStage(Number(btn.dataset.stage),true));
    $('stageBack').onclick=showMainMenu;
  },0);
}
function selectStage(index,showIntro=true){
  if(index>unlockedStageIndex) return;
  currentStageIndex=clamp(index,0,STAGES.length-1);
  loadMissionForStage(currentStageIndex);
  if(showIntro) showStageIntro(); else startMission();
}
function showStageIntro(){
  const s=stageInfo();
  showModal(`<div class="tag">STAGE ${s.number} / ${STAGES.length}</div><div class="stageIntroIcon">${s.icon}</div><h2>${s.title}</h2><p class="stageSubtitle">${s.subtitle}</p><p>${s.story}</p><div class="principleCard"><b>이번 스테이지에서 알아볼 것</b><br>${s.lesson}</div><div class="actions"><button class="btn" id="stageStart">스테이지 시작</button><button class="btn alt" id="stageSelectBack">스테이지 선택</button></div>`);
  setTimeout(()=>{ $('stageStart').onclick=()=>startMission(); $('stageSelectBack').onclick=showStageSelect; },0);
}
function completeCurrentStage(){
  const justCompleted=currentStageIndex;
  if(justCompleted<STAGES.length-1) unlockedStageIndex=Math.max(unlockedStageIndex,justCompleted+1);
  saveStageProgress();
}

loadStageProgress();
