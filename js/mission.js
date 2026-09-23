'use strict';
// 스테이지별 신고, 사무실/파밍, 준비물 관리
const player = { x: 250, y: 780, speed: 300 };
let inventory = [], load = 0, maxLoad = 55, currentMission = null;
let officeMoveTarget=null, officeAutoAction=null;

function isRequired(name){return currentMission&&currentMission.required.includes(name)}
function renderPrepChecklist(){if(!currentMission)return;const picked=new Set(inventory.map(i=>i.name));ui.prepItems.innerHTML=currentMission.required.map(n=>{const it=items.find(x=>x.name===n);const done=picked.has(n);return `<div class="prepItem ${done?'done':''}"><span class="prepDot">${done?'✓':'·'}</span><span>${it?.icon||'•'} ${n}</span><span class="prepKg">${it?.kg||'?'}kg</span></div>`}).join('');ui.prepLoad.textContent=`현재 ${load}kg / 최대 ${maxLoad}kg`;}
function renderInventory(){ui.chips.innerHTML=inventory.length?inventory.map(i=>`<span class="chip">${i.icon} ${i.name} · ${i.kg}kg</span>`).join(''):'<span class="chip">비어 있음</span>';ui.weight.textContent=`${load} / ${maxLoad} kg`}
function showWeightTable(){const m=ensureMission();const rows=items.map(i=>`<div style="display:grid;grid-template-columns:36px 1fr 54px 86px;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.07);align-items:center"><span style="font-size:20px">${i.icon}</span><span>${i.name}${m.required.includes(i.name)?' <b style="color:#7be6d3">필수</b>':''}</span><b>${i.kg}kg</b><span style="color:#cde2ff;font-size:11px">${i.zone}</span></div>`).join('');const briefing=phase==='brief';showModal(`<div class="tag">장비 무게표</div><h2>${m.title}</h2><p>현재 임무 적재 한도는 <b>${m.maxLoad}kg</b>입니다. 필수 장비를 우선 챙기세요.</p><div style="max-height:430px;overflow:auto;margin-top:15px">${rows}</div><div class="actions"><button class="btn" id="closeWeight">${briefing?'이 장비로 준비 시작':'확인'}</button></div>`);setTimeout(()=>$('closeWeight').onclick=()=>briefing?startGather():hideModal(),0)}
function startMission(){postRepairExitLine=null;
  loadMissionForStage(currentStageIndex);
  if(typeof unlockGameAudio==='function')unlockGameAudio();
  if(typeof setGameAudioMode==='function')setGameAudioMode('office');
  if(typeof playPhoneRingSequence==='function')playPhoneRingSequence();
  hideModal();ui.prep.style.display='none';ui.hazard.style.display='none';if(ui.weather)ui.weather.style.display='none';ui.controls.style.display='none';
  const mouse=$('mouseControls');if(mouse)mouse.style.display='none';
  phase='office';updateStageHud();
  ui.phaseTitle.textContent=`STAGE ${stageInfo().number} · ${stageInfo().title}`;
  ui.missionText.textContent='사무실 전화기로 이동해 이번 스테이지의 신고 내용을 확인하세요.';
  showToast('전화기를 클릭하거나 직접 이동해 신고를 확인하세요.');
}
function startGather(){if(typeof stopPhoneRing==='function')stopPhoneRing();hideModal();phase='gather';if(typeof setGameAudioMode==='function')setGameAudioMode('gather');gatherEnd=performance.now()+60000;ui.prep.style.display='block';ui.controls.style.display='none';const mouse=$('mouseControls');if(mouse)mouse.style.display='none';renderPrepChecklist();ui.phaseTitle.textContent=`STAGE ${stageInfo().number} · 60초 출동 준비`;ui.missionText.textContent=`${currentMission.title}에 필요한 장비를 챙긴 뒤 오른쪽 출동 게이트로 이동하세요.`;ui.hudLabel.textContent='PREPARATION';ui.hudSub.textContent=`필수 ${currentMission.required.length}종 · 최대 적재 ${maxLoad}kg`}
function pickup(it){if(load+it.kg>maxLoad){showToast(`적재 한도 ${maxLoad}kg을 넘습니다. 무게표를 확인하세요.`);return}it.taken=true;inventory.push(it);load+=it.kg;if(typeof playPickupSound==='function')playPickupSound();renderInventory();if(!tutorialMode)renderPrepChecklist();showToast(`${it.name} ${it.kg}kg 확보${isRequired(it.name)?' · 이번 스테이지 필수':' · 선택 장비'}`);if(typeof onTutorialPickup==='function')onTutorialPickup(it)}
