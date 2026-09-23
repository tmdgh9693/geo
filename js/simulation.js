'use strict';

function updateOffice(dt, now) {
    let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    let dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
    const keyboardMoving = Math.abs(dx)+Math.abs(dy)>0;
    if(keyboardMoving){ officeMoveTarget=null; officeAutoAction=null; }
    if(!keyboardMoving && officeMoveTarget){
        const tx=officeMoveTarget.x-player.x, ty=officeMoveTarget.y-player.y, d=Math.hypot(tx,ty);
        if(d<10){
            player.x=officeMoveTarget.x; player.y=officeMoveTarget.y; officeMoveTarget=null;
            const action=officeAutoAction; officeAutoAction=null;
            if(action) interact();
        }else{ dx=tx/d; dy=ty/d; }
    }
    const moving=Math.abs(dx)+Math.abs(dy)>.001;
    const l = Math.hypot(dx, dy) || 1;
    player.x = clamp(player.x + dx / l * player.speed * dt, 70, 1845);
    player.y = clamp(player.y + dy / l * player.speed * dt, 145, 1015);
    player.moving=moving;
    if(moving){ if(Math.abs(dx)>.05)player.facing=dx<0?-1:1; player.walkPhase=(player.walkPhase||0)+dt*9.5; }
    else player.walkPhase=(player.walkPhase||0)*.88;
    if (phase === 'gather') {
        if(tutorialMode){ui.hudLabel.textContent='TUTORIAL';ui.hudMain.textContent='연습';ui.hudSub.textContent='예비배터리를 챙긴 뒤 출동 게이트로 이동';}
        else {const rem = Math.max(0, gatherEnd - now);ui.hudMain.textContent = `00:${String(Math.ceil(rem / 1000)).padStart(2, '0')}`;if (rem <= 0) startSail();}
    } else {
        ui.hudLabel.textContent = `STAGE ${stageInfo().number}`;
        ui.hudMain.textContent = 'TEL';
        ui.hudSub.textContent = tutorialMode ? '직접 조작하며 배우는 연습 임무' : (currentMission ? `${currentMission.type} · ${currentMission.status}` : '항로표지 안전학교');
    }
    if(typeof updateTutorialOfficeProgress==='function') updateTutorialOfficeProgress();
}
function emitWake() { const fx = Math.cos(ship.heading), fy = Math.sin(ship.heading), rx = -fy, ry = fx, bx = ship.x - fx * 85, by = ship.y - fy * 85; for (const s of [-1, 1]) ship.wake.push({ x: bx + rx * s * 34, y: by + ry * s * 34, vx: -fx * (24 + Math.random() * 25) + rx * s * (8 + Math.random() * 12), vy: -fy * (24 + Math.random() * 25) + ry * s * (8 + Math.random() * 12), life: 1, size: 12 + Math.random() * 16 }) }
function splash(x, y, n = 24) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = 60 + Math.random() * 160; ship.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .65 + Math.random() * .65, size: 5 + Math.random() * 10 }) } }
function updateShip(dt, now) {
    activeWeather=typeof weatherAt==='function'?weatherAt(ship.x,ship.y):null;
    if(ui.weather)ui.weather.style.display='none';
    if(activeWeather&&!activeWeather.entered){activeWeather.entered=true;showToast(activeWeather.type==='fog'?'안개 구간 진입 · 속도를 줄이고 표지를 확인하세요.':activeWeather.type==='highwave'?'높은 파도 구간 · 조타가 흔들릴 수 있습니다.':'강풍·태풍 영향 구간 · 감속하고 방향을 유지하세요.');}
    const forwardHeld=!!(keys.w||keys.arrowup), reverseHeld=!!(keys.s||keys.arrowdown);
    // 전진 / 제동 / 후진을 분리해 작은 입력도 확실하게 반응하도록 합니다.
    if(forwardHeld&&!reverseHeld){
      ship.throttle=clamp(ship.throttle+dt*.95,-1,1);
    }else if(reverseHeld&&!forwardHeld){
      if(ship.speed>4){
        // 전진 중 S/↓는 먼저 확실하게 제동합니다.
        ship.throttle=lerp(ship.throttle,0,1-Math.exp(-dt*4.8));
        ship.speed=Math.max(0,ship.speed-dt*115);
      }else{
        // 거의 멈춘 뒤에는 즉시 후진 스로틀로 넘어갑니다.
        ship.throttle=clamp(ship.throttle-dt*1.65,-1,1);
      }
    }else{
      // 입력을 놓으면 스로틀만 천천히 중립으로 복귀합니다.
      ship.throttle*=Math.exp(-dt*.30);
      if(Math.abs(ship.throttle)<.004)ship.throttle=0;
    }

    const steer=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
    const rudderTarget=steer;
    ship.rudder=lerp(ship.rudder,rudderTarget,1-Math.exp(-dt*(steer?7.5:3.2)));
    if(Math.abs(ship.rudder)<.015&&!steer)ship.rudder=0;

    const target=ship.throttle>=0?ship.throttle*ship.maxFwd:ship.throttle*ship.maxRev;
    const response=(forwardHeld||reverseHeld)?1.9:.18;
    ship.speed+=(target-ship.speed)*(1-Math.exp(-dt*response));
    // 추진 입력이 없으면 관성으로 오래 미끄러지며 아주 천천히 감속합니다.
    if(!forwardHeld&&!reverseHeld){ship.speed*=Math.exp(-dt*.028);if(Math.abs(ship.speed)<.12)ship.speed=0;}
    if(activeWeather?.type==='highwave')ship.speed*=Math.exp(-dt*.012);
    if(activeWeather?.type==='storm')ship.speed*=Math.exp(-dt*.045);

    const sr=clamp(Math.abs(ship.speed)/ship.maxFwd,0,1);
    if(typeof updateSeaAudioDynamics==='function')updateSeaAudioDynamics(sr,activeWeather?.type||null);
    // 저속에서도 조타가 느껴지고, 후진 시에는 조타 방향이 자연스럽게 반전됩니다.
    const steerAuthority=.16+.46*sr;
    const targetYaw=ship.rudder*steerAuthority*(ship.speed>=0?1:-1);
    ship.yawRate=lerp(ship.yawRate,targetYaw,1-Math.exp(-dt*4.0));
    ship.heading+=ship.yawRate*dt;
    let current=Math.sin(now/7200)*1.9,weatherSide=0;
    if(activeWeather?.type==='highwave'){current+=Math.sin(now/900)*.65;weatherSide=Math.sin(now/820)*.38;shake=Math.max(shake,.008);}
    if(activeWeather?.type==='storm'){current+=Math.sin(now/820)*2.5;weatherSide=Math.cos(now/760)*1.35;ship.heading+=Math.sin(now/980)*dt*.007;shake=Math.max(shake,.028);}
    const sideX=-Math.sin(ship.heading),sideY=Math.cos(ship.heading);
    const nextX=ship.x+Math.cos(ship.heading)*ship.speed*dt+current*dt+sideX*weatherSide*dt;
    const nextY=ship.y+Math.sin(ship.heading)*ship.speed*dt+sideY*weatherSide*dt;
    if(nextX<0||nextX>world.w||nextY<0||nextY>world.h){
        if(typeof triggerGameOver==='function')triggerGameOver('map');
        return;
    }
    ship.x=nextX;ship.y=nextY;

    if(ship.collisionCd>0)ship.collisionCd-=dt;
    for(const r of rocks){
      if(dist(ship.x,ship.y,r.x,r.y)<r.r+75&&ship.collisionCd<=0){
        ship.health=clamp(ship.health-5,0,100);ship.speed*=-.10;ship.x-=Math.cos(ship.heading)*85;ship.y-=Math.sin(ship.heading)*85;ship.collisionCd=1.05;shake=1.35;flash=.8;impactTimer=.9;
        if(typeof playImpactSound==='function')playImpactSound();splash(ship.x,ship.y,70);showToast('쾅! 암초 접촉 · 속도를 줄이고 선행 주의등표를 확인하세요.');
        if(ship.health<=0&&typeof triggerGameOver==='function'){triggerGameOver('safety');return;}
      }
    }
    let activeWarn=null,bestWarn=1e9;
    for(const m of dangerMarks){const dm=dist(ship.x,ship.y,m.x,m.y),dr=dist(ship.x,ship.y,m.rockX,m.rockY);if(dm<1150&&dr<1700&&dr<bestWarn){activeWarn=m;bestWarn=dr}if(dm<900&&!m.warned){m.warned=true;showToast(`주의! 약 ${Math.max(100,Math.round(dr/100)*100)}m 전방에 암초가 있습니다. 감속 후 우회하세요.`)}}
    ui.hazard.style.display='none';
    if(Math.abs(ship.speed)>16&&Math.random()<dt*(10+30*sr))emitWake();
    for(const w of ship.wake){w.x+=w.vx*dt;w.y+=w.vy*dt;w.life-=dt*.28;w.size+=dt*8}ship.wake=ship.wake.filter(w=>w.life>0).slice(-500);
    for(const p of ship.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.22,dt);p.vy*=Math.pow(.22,dt);p.life-=dt}ship.particles=ship.particles.filter(p=>p.life>0).slice(-300);
    const fX=Math.cos(ship.heading),fY=Math.sin(ship.heading),look=460+sr*420,targetCamX=cameraMode===0?ship.x+fX*look:ship.x,targetCamY=cameraMode===0?ship.y+fY*look:ship.y;
    cam.x=lerp(cam.x,targetCamX,1-Math.exp(-dt*4));cam.y=lerp(cam.y,targetCamY,1-Math.exp(-dt*4));let dh=((ship.heading-cam.heading+Math.PI*3)%TAU)-Math.PI;cam.heading+=dh*(1-Math.exp(-dt*3));cam.zoom=lerp(cam.zoom,.56-sr*.08,1-Math.exp(-dt*2));
    const rinfo=routeInfo(ship.x,ship.y),km=(dist(ship.x,ship.y,goal.x,goal.y)/930).toFixed(1),kn=Math.round(Math.abs(ship.speed)/7.6),motion=ship.speed<-.8?'후진 ':'';
    ui.hudMain.textContent=`${motion}${kn} knot`;ui.hudSub.textContent=`스로틀 ${Math.round(ship.throttle*100)}% · ${goal.name} ${km}km · 항로 ${rinfo.d<routeHalf?'안전':'이탈'}`;
    ui.engineText.textContent=(ship.throttle<-.01?'R ':'')+Math.round(Math.abs(ship.throttle)*100)+'%';ui.engineBar.style.width=Math.abs(ship.throttle)*100+'%';
    ui.rudderText.textContent=Math.abs(ship.rudder)<.04?'중립':(ship.rudder<0?'좌 ':'우 ')+Math.round(Math.abs(ship.rudder)*35)+'°';ui.rudderBar.style.width=Math.abs(ship.rudder)*100+'%';ui.safetyText.textContent=Math.round(ship.health)+'%';ui.safetyBar.style.width=ship.health+'%';ui.progressBar.style.width=clamp(rinfo.t*100,0,100)+'%';
    if(postRepairExitLine){
      const l=postRepairExitLine;
      const rx=ship.x-l.x,ry=ship.y-l.y;
      const along=rx*l.hx+ry*l.hy;
      const lateral=Math.abs(rx*(-l.hy)+ry*l.hx);
      const remainWorld=Math.max(0,-along);
      const remainMeters=Math.max(0,Math.round((remainWorld/.93)/50)*50);
      ui.hudLabel.textContent='RETURN LINE';
      ui.hudMain.textContent=`복귀 ${remainMeters.toLocaleString()}m`;
      ui.hudSub.textContent=`수리한 불빛을 지나가며 확인 · 사무실 복귀 라인까지 약 ${remainMeters.toLocaleString()}m`;
      if(along>=0&&lateral<=l.halfWidth&&!l.crossed){
        l.crossed=true;postRepairExitLine=null;ship.speed=0;ship.throttle=0;
        showToast('복귀 라인 통과 · 사무실로 복귀합니다.');
        setTimeout(()=>finishStageClear(),450);return;
      }
    }
    const midNear=!!(midRouteBeacon&&midRouteBeacon.status==='pending'&&dist(ship.x,ship.y,midRouteBeacon.x,midRouteBeacon.y)<midRouteBeacon.arrivalRadius);
    const goalNear=dist(ship.x,ship.y,goal.x,goal.y)<ARRIVAL_RADIUS;
    if(phase==='return'){
      ui.dock.style.display='none';
      if(goalNear)ui.dock.textContent=`사무실 귀항 구간 · ${WORK_SPEED_KNOTS} knot 이하로 진입하면 복귀 완료`;
      ui.hudLabel.textContent='RETURN TO BASE';
      ui.hudSub.textContent=`사무실 귀항 부두까지 ${km}km · 앞으로 직진해 복귀하세요.`;
      if(goalNear&&Math.abs(ship.speed)<=WORK_SPEED_UNITS&&!returnFinishPending){
        returnFinishPending=true;ship.speed=0;ship.throttle=0;showToast('사무실 귀항 완료!');setTimeout(()=>finishStageClear(),500);
      }
      return;
    }
    const near=midNear||goalNear;ui.dock.style.display=near?'block':'none';
    if(midNear)ui.dock.textContent=`중간 등표 도착 구간 · ${WORK_SPEED_KNOTS} knot 이하에서 E로 수리 시작`;
    else if(goalNear)ui.dock.textContent=currentMission.id==='lighthouse'?`거문도 접안 구간 · ${WORK_SPEED_KNOTS} knot 이하에서 E로 접안`:`도착 구간 · ${WORK_SPEED_KNOTS} knot 이하에서 E로 작업 시작`;
    if(phase!=='verify')phase=near?'dock':'sail';if(typeof updateTutorialShipProgress==='function')updateTutorialShipProgress();
}
function update(dt, now) { if(gamePaused||gameOver)return; if (toastTime > 0) { toastTime -= dt; if (toastTime <= 0) ui.toast.classList.remove('on') } if (shake > 0) shake = Math.max(0, shake - dt * 2.8); if (flash > 0) flash = Math.max(0, flash - dt * 2.4); if (impactTimer > 0) impactTimer = Math.max(0, impactTimer - dt); if (phase === 'office' || phase === 'gather') updateOffice(dt, now); if (phase === 'sail' || phase === 'dock' || phase === 'verify' || phase === 'return') updateShip(dt, now); if(phase==='verify'&&typeof updateSeaVerification==='function')updateSeaVerification(dt,now); if (phase === 'shore' && typeof updateShore==='function') updateShore(dt); if ((phase === 'sail' || phase === 'dock' || phase === 'repair' || phase === 'verify' || phase === 'return' || phase === 'done') && typeof updateFauna === 'function') updateFauna(dt, now) }
