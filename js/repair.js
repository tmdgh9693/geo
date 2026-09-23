'use strict';
// 현장 수리: 가져온 장비 3종 → 장비별 미니게임 → 정상 작동 확인
let repairSelection=[];
let repairContext='main'; // main | midBeacon
let repairResumeSnapshot=null;

function clearRepairTimer(){
  if(typeof clearEquipmentDirectionHandler==='function')clearEquipmentDirectionHandler();
  if(repairTimer){clearInterval(repairTimer);repairTimer=null;}
}
function currentRepairName(){return repairContext==='midBeacon'?(midRouteBeacon?.name||'중간 등표'):currentMission.title}
function startRepairMiniGame(context='main'){
  clearRepairTimer();repairContext=context;
  if(context==='midBeacon')repairResumeSnapshot={x:ship.x,y:ship.y,heading:ship.heading};
  phase='repair';
  if(typeof setGameAudioMode==='function')setGameAudioMode('repair');
  ship.speed=0;ship.throttle=0;ui.controls.style.display='none';if(ui.mouseControls)ui.mouseControls.style.display='none';ui.hazard.style.display='none';if(ui.weather)ui.weather.style.display='none';ui.dock.style.display='none';
  repairSelection=pickEquipmentMiniGames(inventory,3);
  if(repairSelection.length<3){
    showModal(`<div class="tag">현장 작업 준비 부족</div><h2>사용할 장비가 부족해요</h2><p>실제로 챙겨온 수리 장비 가운데 3개를 사용합니다. 수리 가능한 장비를 3개 이상 준비해 주세요.</p><div class="actions"><button class="btn" id="returnOffice">현재 스테이지 다시 시작</button></div>`);
    setTimeout(()=>{const b=$('returnOffice');if(b)b.onclick=()=>selectStage(currentStageIndex,true)},0);return;
  }
  repairState={step:0};renderRepairStep();
}
function repairVisual(item,completed=false){
  const cfg=equipmentGameFor(item.name);
  return `<div class="repairScene equipmentRepairScene"><div class="repairBench"></div><div class="equipmentHero ${completed?'completed':''}"><span>${cfg?.icon||item.icon||'🛠️'}</span><b>${item.name}</b></div><div class="repairDevice"><div class="repairLamp ${completed?'on':''}"></div><div class="repairCable ${completed?'fixed':''}"></div></div><div class="repairSparks ${completed?'on':''}"></div><div class="repairSceneTitle">${currentRepairName()}</div></div>`;
}
function stepDots(step){return `<div class="repairProgress">${[0,1,2].map(i=>`<span class="${i<step?'done':''}"></span>`).join('')}</div>`}
function renderRepairStep(){
  clearRepairTimer();const item=repairSelection[repairState.step];if(!item){showOperationalVerification();return}
  const cfg=equipmentGameFor(item.name),pickedNames=repairSelection.map(x=>x.name).join(' · ');
  showModal(`<div class="tag">현장 작업 · 준비물 연동</div><h2>${cfg.title}</h2><div class="repairWrap">${repairVisual(item,false)}<div class="repairSide"><div class="repairStep">장비 ${repairState.step+1} / 3</div>${stepDots(repairState.step)}<div class="selectedEquipmentStrip">이번 현장 미니게임: ${pickedNames}</div><div class="repairQuestion">직접 챙겨온 <b>${item.name}</b>을 사용해 점검해보세요.</div>${equipmentMiniGameBody(item)}</div></div>`);
  bindEquipmentMiniGame(item,principle=>completeRepairStep(item,principle));
}
function completeRepairStep(item,principle){
  clearRepairTimer();if(typeof playRepairSuccessSound==='function')playRepairSuccessSound();const last=repairState.step===2;
  showModal(`<div class="tag">원리 배우기</div><h2>${item.name} 사용 성공!</h2><div class="repairWrap">${repairVisual(item,true)}<div class="repairSide"><div class="successBurst">${last?'✨🔧✨':'✅'}</div><div class="principleCard"><b>이 장비는 왜 필요할까요?</b><br>${principle}</div><div class="eduNote">※ 실제 항로표지 정비·설치는 관련 기준과 안전절차에 따라 전문 인력이 수행합니다.</div><div class="actions"><button class="btn" id="repairNext">${last?'작업 마치기':'다음 준비물 사용'}</button></div></div></div>`);
  $('repairNext').onclick=()=>{if(last)finishRepairAndResume();else{repairState.step++;renderRepairStep();}};
}
function finishRepairAndResume(){
  clearRepairTimer();hideModal();
  if(repairContext==='midBeacon'){
    if(midRouteBeacon)midRouteBeacon.status='fixed';
    if(repairResumeSnapshot){
      ship.x=repairResumeSnapshot.x;ship.y=repairResumeSnapshot.y;ship.heading=repairResumeSnapshot.heading;
    }
    ship.speed=0;ship.throttle=0;ship.rudder=0;ship.yawRate=0;cam.x=ship.x;cam.y=ship.y;cam.heading=ship.heading;
    repairResumeSnapshot=null;phase='sail';
    if(typeof setGameAudioMode==='function')setGameAudioMode('sail');
    ui.nav.style.display='block';ui.inst.style.display='block';ui.progress.style.display='block';ui.camera.style.display='block';if(ui.mouseControls)ui.mouseControls.style.display='grid';
    ui.phaseTitle.textContent='STAGE 7 · 거문도등대로 계속 항해';
    ui.missionText.textContent='등표 수리가 끝났습니다. 배의 진행 방향은 그대로입니다. 출발하면서 방금 고친 등표의 불빛이 정상적으로 깜빡이는지 자연스럽게 확인하고 거문도로 계속 이동하세요.';
    showToast('수리 완료! 그대로 출발하며 정상 점멸을 확인하세요.');
    return;
  }
  if(currentMission.id==='lighthouse'&&currentStageIndex===STAGES.length-1){
    repairedMainTarget=true;
    if(typeof startShoreReturnToBoat==='function')startShoreReturnToBoat();
    return;
  }
  // 일반 스테이지도 수리 직후 바로 끝내지 않고 정비선으로 복귀한 뒤
  // 약 2,000m 전방의 복귀 라인을 통과해야 사무실 복귀 처리됩니다.
  showPostRepairReturnBrief();
}

function showPostRepairReturnBrief(){
  repairedMainTarget=true;
  ship.speed=0;ship.throttle=0;ship.rudder=0;ship.yawRate=0;
  phase='sail';
  if(typeof setGameAudioMode==='function')setGameAudioMode('sail');
  ui.nav.style.display='block';ui.inst.style.display='block';ui.progress.style.display='block';ui.camera.style.display='block';if(ui.mouseControls)ui.mouseControls.style.display='grid';
  const label=currentMission?.id==='lighthouse'?'거문도등대 점검 완료':'현장 수리 완료';
  showModal(`<div class="tag">${label}</div><h2>정비선으로 돌아왔습니다</h2><p>수리한 항로표지는 이제 정상적으로 점멸합니다. 현재 진행 방향 그대로 약 <b>2,000m</b> 직진하면 파란색 <b>사무실 복귀 라인</b>이 나타납니다.</p><p>복귀 라인을 통과하면 자동으로 사무실로 돌아갑니다.</p><div class="actions"><button class="btn" id="departReturnLine">출발하기</button></div>`);
  setTimeout(()=>{const b=$('departReturnLine');if(b)b.onclick=()=>{hideModal();startPostRepairExitLine();}},0);
}

function startPostRepairExitLine(){
  repairedMainTarget=true;
  const METERS_TO_WORLD=.93; // 기존 게임 거리 표기: 약 930 world unit ≒ 1 km
  const returnDistanceMeters=2000;
  const distanceAhead=returnDistanceMeters*METERS_TO_WORLD;
  let hx=Math.cos(ship.heading),hy=Math.sin(ship.heading);
  // 현재 진행방향으로 2 km 앞에 선을 만들되, 맵 밖으로 나가게 되는 경우에만
  // 반대 방향으로 배를 정렬해 충분한 직선 주행거리를 확보합니다.
  const margin=220;
  let lx=ship.x+hx*distanceAhead,ly=ship.y+hy*distanceAhead;
  if(lx<margin||lx>world.w-margin||ly<margin||ly>world.h-margin){
    hx=-hx;hy=-hy;ship.heading=Math.atan2(hy,hx);cam.heading=ship.heading;
    lx=ship.x+hx*distanceAhead;ly=ship.y+hy*distanceAhead;
  }
  postRepairExitLine={
    x:clamp(lx,margin,world.w-margin),
    y:clamp(ly,margin,world.h-margin),
    hx,hy,
    halfWidth:560,
    crossed:false,
    startX:ship.x,startY:ship.y,
    distanceMeters:returnDistanceMeters
  };
  ship.speed=0;ship.throttle=0;ship.rudder=0;ship.yawRate=0;
  phase='sail';
  if(typeof setGameAudioMode==='function')setGameAudioMode('sail');
  ui.nav.style.display='block';ui.inst.style.display='block';ui.progress.style.display='block';ui.camera.style.display='block';if(ui.mouseControls)ui.mouseControls.style.display='grid';
  ui.phaseTitle.textContent=`STAGE ${stageInfo().number} · 수리 완료`;
  ui.missionText.textContent='정비선으로 복귀했습니다. 수리한 불빛을 지나가며 확인하고 현재 방향으로 약 2,000m 직진해 파란 사무실 복귀 라인을 통과하세요.';
  showToast('약 2,000m 앞 복귀 라인을 향해 직진하세요.');
}

function verificationTargetForCurrent(){
  if(repairContext==='midBeacon'&&midRouteBeacon)return {x:midRouteBeacon.x,y:midRouteBeacon.y,kind:'beacon',name:midRouteBeacon.name};
  if(currentMission.id==='lighthouse')return {x:14120,y:1180,kind:'lighthouse',name:'거문도등대'};
  return {x:goal.x,y:goal.y,kind:goal.kind==='install'?'beacon':goal.kind,name:goal.name};
}
function beginSeaVerification(){
  clearRepairTimer();hideModal();repairedMainTarget=repairContext!=='midBeacon';
  if(repairContext==='midBeacon'&&midRouteBeacon)midRouteBeacon.status='fixed';
  const target=verificationTargetForCurrent();
  // 작업을 마치고 정비선으로 복귀한 위치에서 바로 정상 점등을 확인합니다.
  if(currentMission.id==='lighthouse'&&repairContext==='main'){
    ship.x=13400;ship.y=1700;
  }else{
    let vx=ship.x-target.x,vy=ship.y-target.y,len=Math.hypot(vx,vy);
    if(len<40){vx=-1;vy=.28;len=Math.hypot(vx,vy)}
    vx/=len;vy/=len;
    ship.x=clamp(target.x+vx*620,120,world.w-120);ship.y=clamp(target.y+vy*620,120,world.h-120);
  }
  ship.heading=Math.atan2(target.y-ship.y,target.x-ship.x);ship.speed=0;ship.throttle=0;ship.rudder=0;
  cam.x=ship.x;cam.y=ship.y;cam.heading=ship.heading;
  seaVerifyState={target,hold:0,seenFlashes:0,lastOn:false,complete:false};
  phase='verify';if(typeof setGameAudioMode==='function')setGameAudioMode('sail');
  ui.nav.style.display='block';ui.inst.style.display='block';ui.progress.style.display='block';ui.camera.style.display='block';if(ui.mouseControls)ui.mouseControls.style.display='grid';
  ui.phaseTitle.textContent='수리 후 선박에서 작동 확인';
  ui.missionText.textContent=`정비선으로 돌아왔습니다. 현재 위치에서 ${target.name}의 불빛이 바다에서 정상적으로 반복 점멸하는지 직접 확인하세요.`;
  showToast('선박에서 수리한 항로표지의 정상 점멸을 확인합니다.');
}
function showOperationalVerification(){finishRepairAndResume();}
function updateSeaVerification(dt,now){
  if(!seaVerifyState||seaVerifyState.complete)return;
  const v=seaVerifyState;
  const flash=v.target.kind==='lighthouse'?navLightFlash(now,0,5000,1200):navLightFlash(now,0,3600,900);
  const on=flash>.4;if(on&&!v.lastOn)v.seenFlashes++;v.lastOn=on;
  if(Math.abs(ship.speed)<=WORK_SPEED_UNITS)v.hold+=dt;else v.hold=Math.max(0,v.hold-dt*.8);
  ui.hudLabel.textContent='SEA VISIBILITY CHECK';
  ui.hudMain.textContent='선박에서 확인 중';
  ui.hudSub.textContent=`${v.target.name} · 정상 점멸 ${Math.min(v.seenFlashes,2)}/2 · 선박에서 불빛을 확인하세요.`;
  ui.dock.style.display='block';ui.dock.textContent=`수리 후 작동 확인 · 정상 점멸 ${Math.min(v.seenFlashes,2)}/2`;
  if(v.hold>=2.4&&v.seenFlashes>=2){v.complete=true;ship.speed=0;ship.throttle=0;showToast('선박에서 정상 작동을 확인했습니다!');setTimeout(()=>finishVerifiedRepair(),450)}
}
function startReturnToOffice(){
  seaVerifyState=null;returnToOfficeActive=true;returnFinishPending=false;repairContext='main';
  const officeGoal={x:start.x,y:start.y,name:'사무실 귀항 부두',kind:'landing'};
  route=[{x:ship.x,y:ship.y},{...officeGoal}];goal=officeGoal;
  // 마지막 귀항은 복잡한 사건 없이 직선 귀항로로 구성합니다.
  rocks=[];dangerMarks=[];weatherEvents=[];activeWeather=null;midRouteBeacon=null;fog={x:9000,y:1000,r:180};
  buoys=[];for(const t of [.22,.45,.68,.86]){buoys.push({...pointOnSegment(route[0],route[1],t,-routeHalf*.72),side:'red'});buoys.push({...pointOnSegment(route[0],route[1],t,routeHalf*.72),side:'green'})}
  ship.heading=Math.atan2(goal.y-ship.y,goal.x-ship.x);ship.speed=0;ship.throttle=0;ship.rudder=0;cam.heading=ship.heading;
  phase='return';if(typeof setGameAudioMode==='function')setGameAudioMode('sail');if(typeof buildFaunaForRoute==='function')buildFaunaForRoute();
  ui.phaseTitle.textContent='최종 귀항 · 사무실로 복귀';
  ui.missionText.textContent='거문도등대의 정상 작동을 확인했습니다. 정비선의 방향을 사무실 귀항 부두에 맞춰 두었습니다. 이제 앞으로 쭉 직진해 복귀하세요.';
  ui.dock.style.display='none';if(ui.mouseControls)ui.mouseControls.style.display='grid';showToast('앞으로 직진해 사무실 귀항 부두로 돌아가세요.');
}
function finishVerifiedRepair(){
  seaVerifyState=null;
  if(repairContext==='midBeacon'){
    hideModal();phase='sail';if(typeof setGameAudioMode==='function')setGameAudioMode('sail');if(ui.mouseControls)ui.mouseControls.style.display='grid';
    ui.phaseTitle.textContent='STAGE 7 · 거문도등대로 계속 항해';ui.missionText.textContent='선박에서 중간 등표의 정상 점멸을 확인했습니다. 이제 거문도등대 접안시설까지 계속 운항하세요.';showToast('중간 등표 정상 작동 확인 완료! 거문도로 계속 이동합니다.');return;
  }
  if(currentMission.id==='lighthouse'&&currentStageIndex===STAGES.length-1){startReturnToOffice();return;}
  finishStageClear();
}
function finishStageClear(){
  clearRepairTimer();returnToOfficeActive=false;returnFinishPending=false;phase='done';if(typeof setGameAudioMode==='function')setGameAudioMode('done');ship.speed=0;ship.throttle=0;if(ui.mouseControls)ui.mouseControls.style.display='none';completeCurrentStage();
  const s=stageInfo(),used=repairSelection.map(x=>`${x.icon||''} ${x.name}`).join(' · '),finalStage=currentStageIndex===STAGES.length-1;
  showModal(`<div class="tag">STAGE ${s.number} CLEAR</div><div class="stageClearIcon">${finalStage?'🏆':'⭐'}</div><h2>${s.title} 완료!</h2><p>이번 현장에서 사용한 준비물: <b>${used}</b></p><div class="principleCard"><b>이번 스테이지에서 배운 점</b><br>${s.lesson}</div>${finalStage?'<div class="finalStory"><b>🎉 항로표지 안전학교 수료!</b><br>중간 등표부터 거문도등대까지 점검을 마쳤습니다. 수리 후 정상 작동 확인까지 해야 임무가 완성됩니다.</div>':''}<div class="actions">${!finalStage?'<button class="btn" id="nextStage">다음 스테이지</button>':'<button class="btn" id="nextStage">스테이지 선택</button>'}<button class="btn alt" id="replayStage">이 스테이지 다시</button><button class="btn alt" id="stageMap">스테이지 선택</button></div>`);
  setTimeout(()=>{$('nextStage').onclick=()=>finalStage?showStageSelect():selectStage(currentStageIndex+1,true);$('replayStage').onclick=()=>selectStage(currentStageIndex,true);$('stageMap').onclick=showStageSelect},0);
}
function finish(){finishRepairAndResume()}

function interact(){
  if(typeof tutorialInteract==='function'&&tutorialInteract())return;
  if(phase==='shore'){if(typeof shoreInteract==='function')shoreInteract();return}
  if(phase==='office'){
    if(dist(player.x,player.y,365,295)<95){
      if(typeof stopPhoneRing==='function')stopPhoneRing();ensureMission();phase='brief';const req=currentMission.required.map(name=>{const item=items.find(x=>x.name===name);return `${item?.icon||'•'} ${name} ${item?.kg||'?'}kg`}).join(' · '),s=stageInfo();
      showModal(`<div class="tag">STAGE ${s.number} · ${currentMission.type}</div><h2>${currentMission.title}</h2><p>${s.story}</p><p>${currentMission.brief}</p><p><b>필수 준비물:</b><br>${req}</p><p>적재 한도 ${currentMission.maxLoad}kg · 현장에서는 실제로 챙긴 수리 장비 중 3개가 무작위 미니게임으로 선택됩니다.</p><div class="actions"><button class="btn" id="prep">60초 출동 준비</button><button class="btn alt" id="briefWeight">장비 무게표</button></div>`);
      setTimeout(()=>{$('prep').onclick=startGather;$('briefWeight').onclick=showWeightTable},0);
    }else showToast('업무구역의 전화기로 이동하세요.');
  }else if(phase==='gather'){
    for(const item of items){if(!item.taken&&dist(player.x,player.y,item.x,item.y)<76){pickup(item);return}}
    if(player.x>1760&&player.y>800){const missing=currentMission.required.filter(name=>!inventory.some(item=>item.name===name));if(missing.length===0)startSail();else showToast('필수 장비 부족 · '+missing.join(', '));}
  }else if(phase==='sail'||phase==='dock'){
    const midPending=midRouteBeacon&&midRouteBeacon.status==='pending',midNear=midPending&&dist(ship.x,ship.y,midRouteBeacon.x,midRouteBeacon.y)<midRouteBeacon.arrivalRadius;
    if(midNear){if(Math.abs(ship.speed)<=WORK_SPEED_UNITS)startRepairMiniGame('midBeacon');else showToast(`중간 등표 도착 구간입니다. ${WORK_SPEED_KNOTS} knot 이하로 감속하세요.`);return}
    const near=dist(ship.x,ship.y,goal.x,goal.y)<ARRIVAL_RADIUS;
    if(near){
      if(Math.abs(ship.speed)>WORK_SPEED_UNITS){showToast(`도착 구간에서는 ${WORK_SPEED_KNOTS} knot 이하로 감속하세요.`);return}
      if(currentMission.id==='lighthouse'){if(midRouteBeacon&&midRouteBeacon.status!=='fixed'){showToast('거문도에 가기 전에 중간 고장 등표를 먼저 수리해야 합니다.');return}if(typeof startGeomundoLanding==='function')startGeomundoLanding();}
      else startRepairMiniGame('main');
    }
  }
}
