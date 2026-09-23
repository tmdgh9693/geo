'use strict';
// v2.2.1: always begin with the system overlay closed; pause is user-triggered only.
gamePaused=false;
gameOver=false;
if(ui.systemOverlay){ui.systemOverlay.setAttribute('aria-hidden','true');ui.systemOverlay.style.display='none';}
function loop(now){const dt=Math.min(.035,(now-last)/1000);last=now;const frozen=gamePaused||gameOver;const renderNow=frozen?pauseVisualNow:now;if(!frozen)update(dt,now);draw(renderNow);requestAnimationFrame(loop)}
const qs=new URLSearchParams(location.search);
if(qs.has('stage')){const s=clamp(Number(qs.get('stage'))-1,0,STAGES.length-1);unlockedStageIndex=Math.max(unlockedStageIndex,s);selectStage(s,false);if(qs.get('autostart')==='sail')startSail();}
else if(qs.get('autostart')==='office'){selectStage(0,false)}
else if(qs.get('autostart')==='gather'){selectStage(0,false);startGather()}
else if(typeof showMainMenu==='function'){showMainMenu();}
if(qs.get('snapshot')==='1'){const now=performance.now();update(.016,now);draw(now)}else requestAnimationFrame(loop);

// v2.2.0: 실제 화면과 HUD/조작부의 실측 크기를 이용한 전체 반응형 레이아웃.
(function installResponsiveViewport(){
  let raf=0, timer=0;
  const root=document.getElementById('root');
  const top=document.getElementById('hudTop');
  const bottom=document.getElementById('hudBottomInfo');
  const controls=document.getElementById('mouseControls');
  function viewportSize(){
    const vv=window.visualViewport;
    return {w:Math.max(1,Math.round(vv?vv.width:window.innerWidth)),h:Math.max(1,Math.round(vv?vv.height:window.innerHeight))};
  }
  function visibleHeight(el){
    if(!el) return 0;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden') return 0;
    return Math.max(0,Math.ceil(el.getBoundingClientRect().height));
  }
  function measure(){
    const {w,h}=viewportSize();
    const orientation=w>=h?'landscape':'portrait';
    const short=Math.min(w,h);
    const density=(w<390||h<390||short<360)?'tiny':((w<760||h<560)?'compact':'normal');
    document.documentElement.style.setProperty('--app-w',w+'px');
    document.documentElement.style.setProperty('--app-h',h+'px');
    document.documentElement.style.setProperty('--app-short',short+'px');
    document.documentElement.style.setProperty('--app-long',Math.max(w,h)+'px');
    if(root){
      root.dataset.orientation=orientation;
      root.dataset.compact=density==='normal'?'false':'true';
      root.dataset.lowHeight=h<500?'true':'false';
      root.dataset.density=density;
    }
    const controlsH=visibleHeight(controls);
    document.documentElement.style.setProperty('--controls-reserve',(controlsH?controlsH+8:0)+'px');
    // Measure again after control reserve can affect bottom HUD wrapping.
    requestAnimationFrame(()=>{
      const topH=visibleHeight(top);
      const bottomH=visibleHeight(bottom);
      document.documentElement.style.setProperty('--top-reserve',topH+'px');
      document.documentElement.style.setProperty('--bottom-info-reserve',bottomH+'px');
      document.documentElement.style.setProperty('--usable-h',Math.max(1,h-topH-bottomH-controlsH)+'px');
      if(root) root.dataset.controlsVisible=controlsH>0?'true':'false';
    });
    if(canvas){canvas.width=W;canvas.height=H;}
    if(mini){mini.width=310;mini.height=220;}
  }
  function schedule(){
    cancelAnimationFrame(raf);clearTimeout(timer);
    raf=requestAnimationFrame(measure);
    timer=setTimeout(measure,120);
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',()=>{measure();setTimeout(measure,80);setTimeout(measure,260);},{passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',schedule,{passive:true});
    window.visualViewport.addEventListener('scroll',schedule,{passive:true});
  }
  [top,bottom,controls].forEach(el=>{
    if(!el) return;
    new MutationObserver(schedule).observe(el,{attributes:true,childList:true,subtree:true,attributeFilter:['style','class']});
    if('ResizeObserver' in window) new ResizeObserver(schedule).observe(el);
  });
  measure();
})();
