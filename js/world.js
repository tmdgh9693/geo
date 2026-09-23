'use strict';
// 항해 월드 / 목표 / 기상 이벤트 / 최종 거문도 항해 중간 등표
const world={w:15000,h:11000},start={x:1600,y:9300};
let goal={x:11100,y:3050,name:'제3호 등표',kind:'beacon'},route=[],rocks=[],buoys=[],dangerMarks=[];
const routeHalf=1450;
let weatherEvents=[],activeWeather=null;
let midRouteBeacon=null;
const geomundoDock={x:13400,y:1700,heading:Math.atan2(9300-1700,1600-13400),name:'거문도등대 선착장'};

function makeIslandTrees(island, islandIndex) {
  let seed = ((islandIndex + 1) * 2654435761) >>> 0;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const count = Math.round(12 + Math.min(12, (island.rx + island.ry) / 180));
  const trees = [];
  for (let i = 0; i < count; i++) {
    const angle = random() * TAU, radius = Math.sqrt(random()) * .62;
    trees.push({lx:Math.cos(angle)*island.rx*radius,ly:Math.sin(angle)*island.ry*radius,size:.78+random()*.72,shade:random()>.5?1:0});
  }
  return trees;
}
const islands=[
  {x:900,y:8600,rx:950,ry:780,a:-.14},{x:2450,y:10150,rx:1050,ry:620,a:.2},{x:4450,y:9300,rx:850,ry:580,a:-.35},
  {x:6200,y:8350,rx:980,ry:650,a:.18},{x:7800,y:7450,rx:850,ry:560,a:-.28},{x:9950,y:6200,rx:1080,ry:720,a:.12},
  {x:11800,y:4800,rx:920,ry:620,a:-.25},{x:13800,y:2700,rx:1050,ry:780,a:.18},{x:14400,y:1200,rx:780,ry:610,a:-.12}
].map((island,index)=>({...island,trees:makeIslandTrees(island,index)}));
let fog={x:8600,y:5000,r:1050};

function segInfo(px,py,a,b){const vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy,t=clamp(((px-a.x)*vx+(py-a.y)*vy)/l2,0,1),x=a.x+vx*t,y=a.y+vy*t;return{d:Math.hypot(px-x,py-y),t,x,y}}
function routeInfo(px,py){let best={d:1e9,t:0},total=0,lens=[];for(let i=0;i<route.length-1;i++){const l=dist(route[i].x,route[i].y,route[i+1].x,route[i+1].y);lens.push(l);total+=l}let before=0;for(let i=0;i<route.length-1;i++){const q=segInfo(px,py,route[i],route[i+1]);if(q.d<best.d)best={...q,t:(before+q.t*lens[i])/total};before+=lens[i]}return best}
function pointOnSegment(a,b,t,offset){const x=lerp(a.x,b.x,t),y=lerp(a.y,b.y,t),dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;return{x:x+nx*offset,y:y+ny*offset,nx,ny}}

function buildWeatherEvents(){
  weatherEvents=[];
  const types=[
    {type:'fog',label:'🌫️ 안개 구간',r:1050},
    {type:'highwave',label:'🌊 높은 파도 구간',r:1150},
    {type:'storm',label:'⛈️ 강풍·태풍 영향 구간',r:1250}
  ];
  const count=currentStageIndex===STAGES.length-1?3:2;
  const available=[...types].sort(()=>Math.random()-.5).slice(0,count);
  available.forEach((cfg,i)=>{
    const seg=Math.min(1+i*2,Math.max(1,route.length-2));
    const a=route[seg],b=route[Math.min(seg+1,route.length-1)];
    const q=pointOnSegment(a,b,.48+Math.random()*.16,(Math.random()-.5)*380);
    weatherEvents.push({...cfg,x:q.x,y:q.y,entered:false});
  });
  const fogEvent=weatherEvents.find(w=>w.type==='fog');
  fog=fogEvent?{x:fogEvent.x,y:fogEvent.y,r:fogEvent.r}:{x:9000,y:1000,r:200};
  activeWeather=null;
}
function weatherAt(x,y){let best=null,bd=Infinity;for(const w of weatherEvents){const d=dist(x,y,w.x,w.y);if(d<w.r&&d<bd){best=w;bd=d}}return best}

function buildWorldForMission(){
  const m=currentMission||missionTemplates[0]; goal={...m.goal}; midRouteBeacon=null; seaVerifyState=null; repairedMainTarget=false;
  if(m.id==='lighthouse'){
    goal={x:geomundoDock.x,y:geomundoDock.y,name:geomundoDock.name,kind:'landing'};
    route=[start,{x:3300,y:8500},{x:5200,y:7300},{x:7200,y:6000},{x:9200,y:4550},{x:11100,y:3050},goal];
    const q=pointOnSegment(route[3],route[4],.58,-210);
    midRouteBeacon={x:q.x,y:q.y,name:'거문도 항로 중간 등표',kind:'beacon',status:'pending',arrivalRadius:390};
  } else if(m.id==='beacon_repair'||m.id==='flash_pattern'||m.id==='solar_fault'||m.id==='lens_clean'){
    route=[start,{x:3300,y:8450},{x:5200,y:7350},{x:7100,y:6100},{x:8900,y:4550},goal];
  } else {
    route=[start,{x:3200,y:8500},{x:5000,y:7450},{x:6850,y:6250},{x:8300,y:5200},goal];
  }
  buoys=[];
  for(let i=0;i<route.length-1;i++)for(const t of [.30,.67]){
    buoys.push({...pointOnSegment(route[i],route[i+1],t,-routeHalf*.79),side:'red'});
    buoys.push({...pointOnSegment(route[i],route[i+1],t, routeHalf*.79),side:'green'});
  }
  const hazardCount=Math.min(route.length-2,route.length>5?4:3),offsetPool=[0,-430,410,-300,320],specs=[];
  for(let i=0;i<hazardCount;i++){
    const seg=Math.min(i+1,route.length-2),t=.38+Math.random()*.28,off=i===0?0:offsetPool[1+Math.floor(Math.random()*(offsetPool.length-1))];
    specs.push({seg,t,off,r:140+Math.round(Math.random()*45)});
  }
  rocks=[];dangerMarks=[];
  for(const sp of specs){
    const a=route[Math.min(sp.seg,route.length-2)],b=route[Math.min(sp.seg+1,route.length-1)],p=pointOnSegment(a,b,sp.t,sp.off),dx=b.x-a.x,dy=b.y-a.y,ll=Math.hypot(dx,dy),tx=dx/ll,ty=dy/ll,advance=720+Math.round(Math.random()*180),side=(sp.off>=0?-1:1)*routeHalf*(.38+Math.random()*.14);
    rocks.push({x:p.x,y:p.y,r:sp.r,central:Math.abs(sp.off)<80});
    dangerMarks.push({x:p.x-tx*advance+p.nx*side,y:p.y-ty*advance+p.ny*side,label:'선행 암초 주의등표',rockX:p.x,rockY:p.y,advance,warned:false});
  }
  rocks.push({x:4300+Math.random()*700,y:9400+Math.random()*500,r:150+Math.random()*40},{x:7600+Math.random()*900,y:7000+Math.random()*650,r:155+Math.random()*45},{x:11600+Math.random()*950,y:4500+Math.random()*700,r:150+Math.random()*45});
  buildWeatherEvents();
  if(typeof buildFaunaForRoute==='function')buildFaunaForRoute();
}
buildWorldForMission();

const ship={x:start.x,y:start.y,heading:Math.atan2(route[1].y-start.y,route[1].x-start.x),speed:0,throttle:0,rudder:0,yawRate:0,maxFwd:285,maxRev:105,health:100,wake:[],particles:[],collisionCd:0};
const cam={x:ship.x,y:ship.y,heading:ship.heading,zoom:.54};
function resetShip(){Object.assign(ship,{x:start.x,y:start.y,heading:Math.atan2(route[1].y-start.y,route[1].x-start.x),speed:0,throttle:0,rudder:0,yawRate:0,health:100,collisionCd:0});ship.wake.length=0;ship.particles.length=0;cam.x=ship.x;cam.y=ship.y;cam.heading=ship.heading;cam.zoom=.54}
function startSail(){
  ensureMission();if(typeof stopPhoneRing==='function')stopPhoneRing();if(typeof unlockGameAudio==='function')unlockGameAudio();if(typeof setGameAudioMode==='function')setGameAudioMode('sail');
  buildWorldForMission();hideModal();ui.prep.style.display='none';ui.controls.style.display='none';if(ui.mouseControls)ui.mouseControls.style.display='grid';if(ui.weather)ui.weather.style.display='none';
  phase='sail';resetShip();cameraMode=0;ui.inventory.style.display='none';ui.inst.style.display='block';ui.nav.style.display='block';ui.progress.style.display='block';ui.camera.style.display='block';updateStageHud();
  ui.phaseTitle.textContent=`STAGE ${stageInfo().number} · ${currentMission.title}`;
  ui.missionText.textContent=currentMission.id==='lighthouse'?'거문도로 가는 마지막 항해입니다. 중간 고장 등표를 수리한 뒤 접안시설까지 계속 운항하세요.':'현장으로 이동 중입니다. 암초와 기상 변화를 확인하며 안전하게 운항하세요.';
  ui.hudLabel.textContent='VESSEL TELEMETRY';updateCameraLabel();showToast('도착 구간 안에서 5 knot 이하로 감속하면 작업할 수 있습니다.');
}
function updateCameraLabel(){ui.camera.textContent=cameraMode===0?'기본 시점 · 탑뷰(진행방향) · C · 장난감 항구 스타일':cameraMode===1?'시점 · 탑뷰(북쪽 고정) · C':'시점 · 후방 추적 · C'}
