/* =========================================================
   UI 패널 최소화 / 모바일 레이아웃
   - 정보 패널마다 최소화 버튼 자동 생성
   - 모바일에서는 일부 패널을 처음부터 접어 화면 가림 최소화
   ========================================================= */
(()=>{
'use strict';

const PANEL_CONFIG = [
  ['mission','임무'],
  ['prepChecklist','준비물'],
  ['telemetry','상태'],
  ['inventory','장비'],
  ['instruments','계기'],
  ['navcard','미니맵'],
  ['tutorialCoach','튜토리얼']
];

function panelTitle(panel, fallback){
  return panel.dataset.panelTitle || fallback;
}

function setMinimized(panel, minimized){
  panel.classList.toggle('panelMinimized', minimized);
  const btn = panel.querySelector(':scope > .panelMinBtn');
  if(btn){
    btn.textContent = minimized ? '+' : '−';
    btn.setAttribute('aria-label', `${panelTitle(panel, panel.id)} ${minimized?'펼치기':'최소화'}`);
    btn.title = minimized ? '펼치기' : '최소화';
  }
  panel.setAttribute('aria-expanded', minimized ? 'false' : 'true');
}

function attachPanel(id, title){
  const panel=document.getElementById(id);
  if(!panel || panel.querySelector(':scope > .panelMinBtn')) return;
  panel.classList.add('minimizablePanel');
  panel.dataset.panelTitle=title;
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='panelMinBtn';
  btn.textContent='−';
  btn.title='최소화';
  btn.setAttribute('aria-label',`${title} 최소화`);
  btn.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    setMinimized(panel,!panel.classList.contains('panelMinimized'));
  });
  panel.appendChild(btn);
}

function applyMobileDefaults(){
  if(!matchMedia('(max-width: 760px)').matches) return;
  // 게임 화면을 최대한 비우기 위해 보조 정보 패널은 기본 접기.
  ['prepChecklist','telemetry','inventory','instruments','navcard'].forEach(id=>{
    const panel=document.getElementById(id);
    if(panel) setMinimized(panel,true);
  });
}

function install(){
  PANEL_CONFIG.forEach(([id,title])=>attachPanel(id,title));
  applyMobileDefaults();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
