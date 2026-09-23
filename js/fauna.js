'use strict';
// 해양 생물/갈매기 환경 연출 + 간헐적 갈매기 소리
// 게임 규칙에는 영향을 주지 않는 순수 환경 요소입니다.

const fauna={gulls:[],turtles:[],fishSchools:[],dolphins:[]};
let nextGullCall=0;

function randomRouteWaterPoint(offsetScale=.9){
 const maxSeg=Math.max(1,route.length-1),i=Math.floor(Math.random()*maxSeg),a=route[i],b=route[Math.min(i+1,route.length-1)];
 return pointOnSegment(a,b,.12+Math.random()*.76,(Math.random()-.5)*routeHalf*2*offsetScale);
}
function wrapWorld(o,pad=220){
 if(o.x<-pad)o.x=world.w+pad;if(o.x>world.w+pad)o.x=-pad;
 if(o.y<-pad)o.y=world.h+pad;if(o.y>world.h+pad)o.y=-pad;
}
function buildFaunaForRoute(){
 fauna.gulls.length=0;fauna.turtles.length=0;fauna.fishSchools.length=0;fauna.dolphins.length=0;
 // 갈매기: 항로 중간과 섬 주변을 작은 무리로 선회
 for(let i=0;i<12;i++){
  const p=randomRouteWaterPoint(1.15),r=120+Math.random()*330,a=Math.random()*TAU;
  fauna.gulls.push({cx:p.x,cy:p.y,x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r,r,a,speed:.18+Math.random()*.28,alt:50+Math.random()*85,wing:Math.random()*TAU});
 }
 // 거북이: 느리게 수면을 따라 이동
 for(let i=0;i<5;i++){
  const p=randomRouteWaterPoint(1.05);fauna.turtles.push({x:p.x,y:p.y,heading:Math.random()*TAU,speed:8+Math.random()*12,bob:Math.random()*TAU,turn:(Math.random()-.5)*.08});
 }
 // 물고기: 여러 마리씩 무리를 이루어 이동
 for(let i=0;i<9;i++){
  const p=randomRouteWaterPoint(1.18),count=4+Math.floor(Math.random()*5),members=[];
  for(let j=0;j<count;j++)members.push({ox:(Math.random()-.5)*120,oy:(Math.random()-.5)*80,phase:Math.random()*TAU,size:.75+Math.random()*.45});
  fauna.fishSchools.push({x:p.x,y:p.y,heading:Math.random()*TAU,speed:22+Math.random()*28,wobble:Math.random()*TAU,members});
 }
 // 돌고래: 드물게 배 주변 항로를 가로지름
 for(let i=0;i<3;i++){
  const p=randomRouteWaterPoint(.95);fauna.dolphins.push({x:p.x,y:p.y,heading:Math.random()*TAU,speed:34+Math.random()*24,phase:Math.random()*TAU});
 }
 nextGullCall=performance.now()+9000+Math.random()*12000;
}

function updateFauna(dt,now){
 for(const g of fauna.gulls){g.a+=g.speed*dt;g.wing+=dt*5.3;g.x=g.cx+Math.cos(g.a)*g.r;g.y=g.cy+Math.sin(g.a)*g.r;}
 for(const t of fauna.turtles){t.bob+=dt*1.15;t.heading+=Math.sin(t.bob*.33)*t.turn*dt;t.x+=Math.cos(t.heading)*t.speed*dt;t.y+=Math.sin(t.heading)*t.speed*dt;wrapWorld(t)}
 for(const s of fauna.fishSchools){s.wobble+=dt*.7;s.heading+=Math.sin(s.wobble)*.025*dt;s.x+=Math.cos(s.heading)*s.speed*dt;s.y+=Math.sin(s.heading)*s.speed*dt;wrapWorld(s,350)}
 for(const d of fauna.dolphins){d.phase+=dt*1.9;d.heading+=Math.sin(d.phase*.21)*.012*dt;d.x+=Math.cos(d.heading)*d.speed*dt;d.y+=Math.sin(d.heading)*d.speed*dt;wrapWorld(d,300)}
 maybePlayGull(now);
}

function unlockWildlifeAudio(){if(typeof unlockGameAudio==='function')unlockGameAudio();nextGullCall=performance.now()+7000+Math.random()*10000}
function gullNearShip(){return fauna.gulls.some(g=>dist(ship.x,ship.y,g.x,g.y)<3000)}
function maybePlayGull(now){
 if(typeof gameAudioUnlocked!=='function'||!gameAudioUnlocked())return;
 if(!(phase==='sail'||phase==='dock'))return;
 if(now<nextGullCall||!gullNearShip())return;
 playGullCall();nextGullCall=now+16000+Math.random()*22000;
}
function playGullCall(){if(typeof playSeagullCall==='function')playSeagullCall()}

function drawFishShape(x,y,ang,size,alpha=.55){
 ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.globalAlpha=alpha;ctx.fillStyle='#2b879f';ctx.beginPath();ctx.ellipse(0,0,20*size,8*size,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(-17*size,0);ctx.lineTo(-34*size,-12*size);ctx.lineTo(-34*size,12*size);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(220,250,255,.55)';ctx.beginPath();ctx.arc(11*size,-2*size,2.4*size,0,TAU);ctx.fill();ctx.restore();ctx.globalAlpha=1;
}
function drawFaunaTopWater(now){
 // 물고기는 수면 아래처럼 반투명하게 보이도록 표현
 for(const s of fauna.fishSchools){const p=topTransform(s.x,s.y);if(p.x<-180||p.x>W+180||p.y<-180||p.y>H+180)continue;const rot=(cameraMode===0?(-Math.PI/2-cam.heading):0)+s.heading;for(const f of s.members){const wob=Math.sin(now*.004+f.phase)*5,fp=topTransform(s.x+f.ox,s.y+f.oy+wob);drawFishShape(fp.x,fp.y,rot,f.size*clamp(cam.zoom*1.58,.90,1.55),.30)}}
 for(const t of fauna.turtles){const p=topTransform(t.x,t.y);if(p.x<-100||p.x>W+100||p.y<-100||p.y>H+100)continue;const s=clamp(cam.zoom*1.2,.55,1.1),rot=(cameraMode===0?(-Math.PI/2-cam.heading):0)+t.heading,bob=Math.sin(t.bob)*2;ctx.save();ctx.translate(p.x,p.y+bob);ctx.rotate(rot);ctx.globalAlpha=.88;ctx.fillStyle='rgba(215,245,255,.25)';ctx.beginPath();ctx.arc(0,0,35*s,0,TAU);ctx.fill();ctx.fillStyle='#4f9b70';ctx.beginPath();ctx.ellipse(0,0,28*s,20*s,0,0,TAU);ctx.fill();ctx.fillStyle='#75bb7d';ctx.beginPath();ctx.ellipse(19*s,0,10*s,7*s,0,0,TAU);ctx.fill();for(const sy of [-1,1]){ctx.beginPath();ctx.ellipse(-6*s,sy*20*s,12*s,5*s,.35*sy,0,TAU);ctx.fill()}ctx.restore();ctx.globalAlpha=1}
 for(const d of fauna.dolphins){const p=topTransform(d.x,d.y);if(p.x<-120||p.x>W+120||p.y<-120||p.y>H+120)continue;const breach=(Math.sin(d.phase)+1)/2,s=clamp(cam.zoom*1.25,.55,1.15),rot=(cameraMode===0?(-Math.PI/2-cam.heading):0)+d.heading;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(rot);ctx.globalAlpha=.35+.45*breach;ctx.fillStyle='#6a9fb0';ctx.beginPath();ctx.ellipse(0,0,23*s,7*s,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(-20*s,0);ctx.lineTo(-32*s,-9*s);ctx.lineTo(-29*s,0);ctx.lineTo(-32*s,9*s);ctx.closePath();ctx.fill();if(breach>.82){ctx.globalAlpha=.25;ctx.strokeStyle='#e7fbff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,8*s,28*s,0,TAU);ctx.stroke()}ctx.restore();ctx.globalAlpha=1}
}
function drawFaunaTopSky(now){
 for(const g of fauna.gulls){const p=topTransform(g.x,g.y);if(p.x<-120||p.x>W+120||p.y<-120||p.y>H+120)continue;const s=clamp(cam.zoom*(1.15+g.alt/160),.82,1.48),flap=Math.sin(g.wing);ctx.save();ctx.translate(p.x,p.y-g.alt*cam.zoom*.28);ctx.rotate(Math.atan2(Math.cos(g.a),-Math.sin(g.a))+(cameraMode===0?(-Math.PI/2-cam.heading):0));ctx.strokeStyle='rgba(40,61,77,.32)';ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(-2*s,2*s);ctx.quadraticCurveTo(-12*s,-(7+8*flap)*s,-35*s,1*s);ctx.moveTo(2*s,2*s);ctx.quadraticCurveTo(12*s,-(7+8*flap)*s,35*s,1*s);ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=3.2*s;ctx.beginPath();ctx.moveTo(-2*s,0);ctx.quadraticCurveTo(-12*s,-(7+8*flap)*s,-35*s,0);ctx.moveTo(2*s,0);ctx.quadraticCurveTo(12*s,-(7+8*flap)*s,35*s,0);ctx.stroke();ctx.restore()}
}
function drawFaunaRearWater(now){
 for(const d of fauna.dolphins){const rel=worldRelative(d.x,d.y),p=projectRear(rel);if(!p||p.x<-100||p.x>W+100||p.y<250||p.y>H*.83)continue;const breach=(Math.sin(d.phase)+1)/2;if(breach<.55)continue;const s=clamp(p.scale*1.8,.35,1.35);ctx.save();ctx.translate(p.x,p.y-10*breach);ctx.rotate(-.18);ctx.fillStyle='rgba(88,139,157,.85)';ctx.beginPath();ctx.ellipse(0,0,25*s,7*s,0,0,TAU);ctx.fill();ctx.restore()}
 for(const t of fauna.turtles){const rel=worldRelative(t.x,t.y),p=projectRear(rel);if(!p||p.x<-80||p.x>W+80||p.y<250||p.y>H*.83)continue;const s=clamp(p.scale*1.75,.38,1.08);ctx.fillStyle='rgba(84,152,105,.8)';ctx.beginPath();ctx.ellipse(p.x,p.y,24*s,10*s,0,0,TAU);ctx.fill()}
}
function drawFaunaRearSky(now){
 for(const g of fauna.gulls){const rel=worldRelative(g.x,g.y),p=projectRear(rel);if(!p||p.x<-120||p.x>W+120)continue;const sy=clamp(p.y-g.alt*(.45+p.scale*.08),80,H*.4),s=clamp(p.scale*1.55,.55,1.35);ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5*s;ctx.beginPath();ctx.moveTo(p.x-23*s,sy);ctx.quadraticCurveTo(p.x-11*s,sy-10*s*Math.sin(g.wing),p.x,sy);ctx.quadraticCurveTo(p.x+11*s,sy-10*s*Math.sin(g.wing),p.x+23*s,sy);ctx.stroke()}
}

// 최초 로딩 및 이후 랜덤 임무 재생성 모두에서 환경 생물을 다시 배치합니다.
buildFaunaForRoute();
