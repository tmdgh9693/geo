'use strict';
// 최종 스테이지: 거문도 접안시설에서 하선해 등대까지 직접 이동하는 구간
const shorePlayer={x:310,y:870,speed:315,moving:false,facing:1,walkPhase:0};
let shoreMoveTarget=null,shoreAutoAction=false;
let shoreMode='toLighthouse'; // toLighthouse | toBoat
const shoreLighthouse={x:1510,y:235};
const shoreDock={x:285,y:895};
const shoreTrees=[
  [510,770,1.1],[610,700,.85],[720,790,1.0],[770,625,.95],[890,690,1.2],[930,535,.9],[1080,590,1.05],[1130,450,.85],[1250,500,1.1],[1310,365,.9],[1430,430,1.05],
  [460,590,.85],[570,515,1],[690,455,.9],[820,380,1.1],[980,360,.8],[1120,300,1],[1280,260,.8]
];
function startGeomundoLanding(){
  ship.speed=0;ship.throttle=0;phase='shore';shoreMode='toLighthouse';shorePlayer.x=shoreDock.x+40;shorePlayer.y=shoreDock.y-20;shoreMoveTarget=null;shoreAutoAction=false;hideModal();
  if(typeof setGameAudioMode==='function')setGameAudioMode('office');
  ui.nav.style.display='none';ui.inst.style.display='none';ui.progress.style.display='none';ui.camera.style.display='none';ui.dock.style.display='none';ui.hazard.style.display='none';if(ui.weather)ui.weather.style.display='none';if(ui.mouseControls)ui.mouseControls.style.display='none';
  ui.phaseTitle.textContent='STAGE 7 · 거문도 상륙';ui.missionText.textContent='접안시설에 배를 댔습니다. 배에서 내려 길을 따라 거문도등대까지 직접 올라가세요. 키보드 또는 바닥 클릭으로 이동할 수 있습니다.';
  ui.hudLabel.textContent='GEOMUNDO ISLAND';ui.hudMain.textContent='상륙';ui.hudSub.textContent='접안시설 → 산책로 → 거문도등대';showToast('접안 완료! 이제 등대까지 직접 걸어 올라가세요.');
}
function updateShore(dt){
  let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  const keyboard=Math.abs(dx)+Math.abs(dy)>0;if(keyboard){shoreMoveTarget=null;shoreAutoAction=false;}
  if(!keyboard&&shoreMoveTarget){const tx=shoreMoveTarget.x-shorePlayer.x,ty=shoreMoveTarget.y-shorePlayer.y,d=Math.hypot(tx,ty);if(d<10){shorePlayer.x=shoreMoveTarget.x;shorePlayer.y=shoreMoveTarget.y;shoreMoveTarget=null;const act=shoreAutoAction;shoreAutoAction=false;if(act)shoreInteract();}else{dx=tx/d;dy=ty/d}}
  const moving=Math.abs(dx)+Math.abs(dy)>.001,l=Math.hypot(dx,dy)||1;shorePlayer.x=clamp(shorePlayer.x+dx/l*shorePlayer.speed*dt,210,1650);shorePlayer.y=clamp(shorePlayer.y+dy/l*shorePlayer.speed*dt,170,930);shorePlayer.moving=moving;if(moving){if(Math.abs(dx)>.05)shorePlayer.facing=dx<0?-1:1;shorePlayer.walkPhase+=dt*9.5}else shorePlayer.walkPhase*=.88;
  const target=shoreMode==='toBoat'?shoreDock:shoreLighthouse;const d=dist(shorePlayer.x,shorePlayer.y,target.x,target.y);
  if(shoreMode==='toBoat'){ui.hudMain.textContent=d<120?'선착장 도착':'선박으로 복귀';ui.hudSub.textContent=d<120?'E 또는 선착장을 클릭해 승선':'길을 따라 선착장으로 내려가세요';}
  else{ui.hudMain.textContent=d<120?'도착':'등대로 이동';ui.hudSub.textContent=d<120?'거문도등대 작업 지점 · E 또는 등대 클릭':'길을 따라 등대까지 올라가세요';}
}
function shoreInteract(){
  if(shoreMode==='toBoat'){
    const d=dist(shorePlayer.x,shorePlayer.y,shoreDock.x,shoreDock.y);
    if(d<135){boardBoatAfterLighthouseRepair();}else showToast('선착장에 있는 정비선까지 조금 더 내려가세요.');
    return;
  }
  const d=dist(shorePlayer.x,shorePlayer.y,shoreLighthouse.x,shoreLighthouse.y);
  if(d<125){ui.phaseTitle.textContent='STAGE 7 · 거문도등대 최종 점검';ui.missionText.textContent='등대에 도착했습니다. 준비해 온 장비를 사용해 마지막 수리를 진행하세요.';startRepairMiniGame('main');}
  else showToast('등대까지 조금 더 올라가세요.');
}
function handleShoreCanvasClick(p){
  if(shoreMode==='toBoat'){
    const d=dist(p.x,p.y,shoreDock.x,shoreDock.y);
    if(d<150){shoreMoveTarget={x:shoreDock.x+40,y:shoreDock.y-20};shoreAutoAction=true;return}
  }else{
    const d=dist(p.x,p.y,shoreLighthouse.x,shoreLighthouse.y);
    if(d<110){shoreMoveTarget={x:shoreLighthouse.x-65,y:shoreLighthouse.y+80};shoreAutoAction=true;return}
  }
  shoreMoveTarget={x:clamp(p.x,210,1650),y:clamp(p.y,170,930)};shoreAutoAction=false;
}
function startShoreReturnToBoat(){
  phase='shore';shoreMode='toBoat';shoreMoveTarget=null;shoreAutoAction=false;
  if(typeof setGameAudioMode==='function')setGameAudioMode('office');
  ui.nav.style.display='none';ui.inst.style.display='none';ui.progress.style.display='none';ui.camera.style.display='none';ui.dock.style.display='none';if(ui.mouseControls)ui.mouseControls.style.display='none';
  ui.phaseTitle.textContent='STAGE 7 · 선박으로 복귀';
  ui.missionText.textContent='거문도등대 수리가 끝났습니다. 길을 따라 선착장으로 내려가 정비선에 다시 승선하세요. 등대 불빛은 이제 정상적으로 점멸합니다.';
  ui.hudLabel.textContent='RETURN TO VESSEL';ui.hudMain.textContent='선박으로 복귀';ui.hudSub.textContent='거문도등대 → 산책로 → 선착장';
  showToast('수리 완료! 선착장으로 돌아가 배에 다시 탑승하세요.');
}
function boardBoatAfterLighthouseRepair(){
  shoreMode='toLighthouse';
  // 등대 점검을 마친 뒤 선착장의 정비선으로 복귀합니다.
  // 배는 사무실 방향의 바다 쪽을 바라보게 하고, 다른 스테이지와 동일하게
  // 짧게 직진해 복귀 라인을 통과하면 최종 복귀 처리됩니다.
  ship.x=geomundoDock.x;ship.y=geomundoDock.y;
  ship.heading=geomundoDock.heading;
  ship.speed=0;ship.throttle=0;ship.rudder=0;ship.yawRate=0;
  cam.x=ship.x;cam.y=ship.y;cam.heading=ship.heading;
  hideModal();
  repairedMainTarget=true;
  returnToOfficeActive=false;returnFinishPending=false;seaVerifyState=null;
  // 선착장 재진입 판정과 겹치지 않도록 항해 HUD의 목표를 사무실 방향으로 바꿉니다.
  goal={x:1600,y:9300,name:'사무실 방향',kind:'return'};
  ui.phaseTitle.textContent='STAGE 7 · 거문도 점검 완료';
  ui.missionText.textContent='정비선에 다시 승선했습니다. 정상 점등되는 거문도등대를 뒤로하고 약 2,000m 전방의 복귀 라인까지 직진하면 사무실로 복귀합니다.';
  ui.hudLabel.textContent='FINAL RETURN';
  if(typeof showPostRepairReturnBrief==='function')showPostRepairReturnBrief();
}

function drawTreeShore(x,y,s=1){ctx.fillStyle='#6a4a2b';ctx.fillRect(x-6*s,y,12*s,30*s);ctx.fillStyle='#3c9d55';ctx.beginPath();ctx.arc(x,y-7*s,25*s,0,TAU);ctx.fill();ctx.fillStyle='#65bd5f';ctx.beginPath();ctx.arc(x-12*s,y-15*s,16*s,0,TAU);ctx.fill();}
function drawShore(){
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#73ccff');sky.addColorStop(1,'#2f97d8');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#2196c8';ctx.fillRect(0,820,W,260);
  ctx.fillStyle='#e4d291';ctx.beginPath();ctx.moveTo(150,920);ctx.quadraticCurveTo(250,560,510,350);ctx.quadraticCurveTo(930,90,1710,120);ctx.lineTo(1780,820);ctx.quadraticCurveTo(930,920,150,920);ctx.fill();
  ctx.fillStyle='#73b95c';ctx.beginPath();ctx.moveTo(250,835);ctx.quadraticCurveTo(420,500,650,330);ctx.quadraticCurveTo(1040,115,1650,165);ctx.lineTo(1660,760);ctx.quadraticCurveTo(980,800,250,835);ctx.fill();
  // path
  ctx.strokeStyle='#e6c783';ctx.lineWidth=70;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(330,860);ctx.bezierCurveTo(560,730,620,600,820,560);ctx.bezierCurveTo(1040,510,1190,350,1450,300);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=4;ctx.setLineDash([15,18]);ctx.beginPath();ctx.moveTo(330,860);ctx.bezierCurveTo(560,730,620,600,820,560);ctx.bezierCurveTo(1040,510,1190,350,1450,300);ctx.stroke();ctx.setLineDash([]);
  shoreTrees.forEach(t=>drawTreeShore(t[0],t[1],t[2]));
  // dock
  ctx.fillStyle='#6f5038';ctx.fillRect(145,852,300,58);for(let i=0;i<7;i++){ctx.fillStyle=i%2?'#aa7e55':'#855f42';ctx.fillRect(160+i*40,858,32,44)}
  ctx.fillStyle='#f4f7f8';rr(210,815,155,34,10);ctx.fill();text('정비선 정박 위치',287,838,13,'#23436f','center',1000);
  ctx.strokeStyle=shoreMode==='toBoat'?'#fff06e':'rgba(255,255,255,.45)';ctx.lineWidth=5;ctx.setLineDash([12,9]);ctx.beginPath();ctx.arc(shoreDock.x,shoreDock.y,95,0,TAU);ctx.stroke();ctx.setLineDash([]);
  text('거문도등대 선착장',290,955,19,'#fff','center',1000);
  // lighthouse
  ctx.save();ctx.translate(shoreLighthouse.x,shoreLighthouse.y);ctx.fillStyle='#fff';rr(-34,-82,68,145,16);ctx.fill();ctx.fillStyle='#e95358';rr(-44,-96,88,24,10);ctx.fill();ctx.fillStyle='#243b63';ctx.fillRect(-24,-45,48,24);ctx.fillStyle='#fff3a0';ctx.beginPath();ctx.arc(0,-72,13,0,TAU);ctx.fill();ctx.shadowColor='#fff3a0';ctx.shadowBlur=34;ctx.beginPath();ctx.arc(0,-72,9,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.restore();
  ctx.strokeStyle='rgba(255,227,100,.72)';ctx.lineWidth=5;ctx.setLineDash([12,10]);ctx.beginPath();ctx.arc(shoreLighthouse.x,shoreLighthouse.y,105,0,TAU);ctx.stroke();ctx.setLineDash([]);text('거문도등대 · 최종 작업 지점',shoreLighthouse.x,shoreLighthouse.y+110,18,'#fff','center',1000);
  // player
  {const wp=shorePlayer.walkPhase||0,bob=shorePlayer.moving?Math.sin(wp*2)*2:0,step=shorePlayer.moving?Math.sin(wp)*8:0;ctx.save();ctx.translate(shorePlayer.x,shorePlayer.y+bob);ctx.scale(shorePlayer.facing||1,1);ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,30,24,9,0,0,TAU);ctx.fill();ctx.strokeStyle='#263442';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,23);ctx.lineTo(-10+step*.35,42);ctx.moveTo(8,23);ctx.lineTo(10-step*.35,42);ctx.stroke();ctx.fillStyle='#eef3f4';rr(-17,-5,34,31,7);ctx.fill();ctx.fillStyle='#f0b33c';rr(-17,-8,34,8,4);ctx.fill();ctx.fillStyle='#1f475a';rr(-14,5,28,11,3);ctx.fill();ctx.fillStyle='#d7a57b';ctx.beginPath();ctx.arc(0,-20,12,0,TAU);ctx.fill();ctx.fillStyle='#f2c94c';ctx.beginPath();ctx.arc(0,-24,14,Math.PI,TAU);ctx.fill();ctx.strokeStyle='#eef3f4';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-14,2);ctx.lineTo(-24-step*.22,13);ctx.moveTo(14,2);ctx.lineTo(24+step*.22,13);ctx.stroke();ctx.restore();text('점검원',shorePlayer.x,shorePlayer.y-47+bob,11,'#173b4c','center',800)}
  text(shoreMode==='toBoat'?'수리가 끝났습니다 · 선착장으로 돌아가 정비선에 승선하세요':'배에서 내려 등대까지 직접 올라가세요',W*.5,80,27,'#fff','center',1000);
}
