'use strict';
function loop(now){const dt=Math.min(.035,(now-last)/1000);last=now;const frozen=gamePaused||gameOver;const renderNow=frozen?pauseVisualNow:now;if(!frozen)update(dt,now);draw(renderNow);requestAnimationFrame(loop)}
const qs=new URLSearchParams(location.search);
if(qs.has('stage')){const s=clamp(Number(qs.get('stage'))-1,0,STAGES.length-1);unlockedStageIndex=Math.max(unlockedStageIndex,s);selectStage(s,false);if(qs.get('autostart')==='sail')startSail();}
else if(qs.get('autostart')==='office'){selectStage(0,false)}
else if(qs.get('autostart')==='gather'){selectStage(0,false);startGather()}
if(qs.get('snapshot')==='1'){const now=performance.now();update(.016,now);draw(now)}else requestAnimationFrame(loop);

// v2.1.5: 고정 화면비를 사용하지 않고 실제 사용자 viewport를 그대로 사용한다.
(function installResponsiveViewport(){
  let resizeTimer=0;
  const root=document.getElementById('root');
  const controls=document.getElementById('mouseControls');
  function viewportSize(){
    const vv=window.visualViewport;
    return {
      w:Math.max(1,Math.round(vv?vv.width:window.innerWidth)),
      h:Math.max(1,Math.round(vv?vv.height:window.innerHeight))
    };
  }
  function syncControlReserve(){
    if(!controls) return;
    const cs=getComputedStyle(controls);
    const visible=cs.display!=='none' && cs.visibility!=='hidden';
    const rect=visible?controls.getBoundingClientRect():{height:0};
    const reserve=visible?Math.ceil(rect.height+12):0;
    document.documentElement.style.setProperty('--controls-reserve',reserve+'px');
    if(root) root.dataset.controlsVisible=visible?'true':'false';
  }
  function syncLayout(){
    const {w,h}=viewportSize();
    document.documentElement.style.setProperty('--app-w',w+'px');
    document.documentElement.style.setProperty('--app-h',h+'px');
    document.documentElement.style.setProperty('--app-short',Math.min(w,h)+'px');
    document.documentElement.style.setProperty('--app-long',Math.max(w,h)+'px');
    const orientation=w>=h?'landscape':'portrait';
    if(root){
      root.dataset.orientation=orientation;
      root.dataset.compact=(w<760||h<560)?'true':'false';
      root.dataset.lowHeight=h<500?'true':'false';
    }
    // 논리 렌더링 좌표는 기존 게임 좌표계를 유지하고, CSS 표시영역만 실제 viewport를 100% 사용한다.
    if(canvas){ canvas.width=W; canvas.height=H; }
    if(mini){ mini.width=310; mini.height=220; }
    requestAnimationFrame(syncControlReserve);
  }
  function schedule(){ clearTimeout(resizeTimer); resizeTimer=setTimeout(syncLayout,16); }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',()=>{syncLayout();setTimeout(syncLayout,80);setTimeout(syncLayout,240);},{passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',schedule,{passive:true});
    window.visualViewport.addEventListener('scroll',schedule,{passive:true});
  }
  if(controls){
    new MutationObserver(()=>requestAnimationFrame(syncControlReserve)).observe(controls,{attributes:true,attributeFilter:['style','class']});
    if('ResizeObserver' in window) new ResizeObserver(()=>syncControlReserve()).observe(controls);
  }
  syncLayout();
})();
