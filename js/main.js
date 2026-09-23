'use strict';
function loop(now){const dt=Math.min(.035,(now-last)/1000);last=now;const frozen=gamePaused||gameOver;const renderNow=frozen?pauseVisualNow:now;if(!frozen)update(dt,now);draw(renderNow);requestAnimationFrame(loop)}
const qs=new URLSearchParams(location.search);
if(qs.has('stage')){const s=clamp(Number(qs.get('stage'))-1,0,STAGES.length-1);unlockedStageIndex=Math.max(unlockedStageIndex,s);selectStage(s,false);if(qs.get('autostart')==='sail')startSail();}
else if(qs.get('autostart')==='office'){selectStage(0,false)}
else if(qs.get('autostart')==='gather'){selectStage(0,false);startGather()}
if(qs.get('snapshot')==='1'){const now=performance.now();update(.016,now);draw(now)}else requestAnimationFrame(loop);


// v2.1.2: CSS 화면 크기에 맞춰 Canvas 내부 해상도도 동기화한다.
(function installResponsiveCanvas(){
  let resizeTimer=0;
  function syncCanvasResolution(){
    if(!canvas) return;
    const rect=canvas.getBoundingClientRect();
    if(!rect.width||!rect.height) return;
    // 게임 좌표계는 1920x1080으로 유지하되 CSS가 사용자 화면에 맞춰 표시한다.
    // 고DPI 모바일에서 지나친 메모리 사용을 피하기 위해 DPR은 2까지만 사용한다.
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.style.width=rect.width+'px';
    canvas.style.height=rect.height+'px';
    if(mini){
      const mr=mini.getBoundingClientRect();
      if(mr.width&&mr.height){mini.style.width=mr.width+'px';mini.style.height=mr.height+'px'}
    }
  }
  function schedule(){clearTimeout(resizeTimer);resizeTimer=setTimeout(syncCanvasResolution,40)}
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  syncCanvasResolution();
})();
