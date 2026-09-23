'use strict';
// 장비별 미니게임 모음
// 현장에 도착하면 실제로 챙겨온 장비 중 플레이 가능한 장비 3개를 무작위로 선택합니다.

const equipmentGameConfigs = {
  '공구함': { icon:'🧰', title:'공구함 · 볼트 조이기', type:'bolts', principle:'볼트와 고정부가 느슨하면 장비가 흔들리거나 연결부가 불안정해질 수 있어요. 점검할 때는 고정부가 안정적인지 확인합니다.' },
  '멀티미터': { icon:'📟', title:'멀티미터 · 전압 확인', type:'timing', principle:'멀티미터는 전압 같은 전기 상태를 확인하는 데 쓰여요. 전원이 정상인지 먼저 확인하면 고장 원인을 찾는 데 도움이 됩니다.' },
  '케이블': { icon:'🔌', title:'케이블 · 단자 연결', type:'cables', principle:'전기가 필요한 장비는 케이블이 올바르게 연결되어야 해요. 연결이 끊기거나 잘못되면 등명기에 전원이 전달되지 않을 수 있습니다.' },
  '고정 볼트': { icon:'🔩', title:'고정 볼트 · 균형 체결', type:'bolts', principle:'고정 볼트는 한쪽만 지나치게 조이기보다 여러 고정부를 고르게 확인하는 것이 중요해요. 게임에서는 네 개를 모두 체결하는 방식으로 표현했습니다.' },
  '예비배터리': { icon:'🔋', title:'예비배터리 · 배터리 장착', type:'battery', principle:'배터리는 등명기와 전기장비가 사용할 전기에너지를 저장해요. 배터리를 안전하게 장착하고 단자를 올바르게 연결해야 전원이 공급됩니다.' },
  '배터리팩': { icon:'🔋', title:'배터리팩 · 전원 모듈 장착', type:'battery', principle:'배터리팩은 저장된 전기를 장비에 공급합니다. 장착 상태와 단자 연결을 함께 확인해야 안정적으로 전원을 사용할 수 있어요.' },
  '작업등': { icon:'🔦', title:'작업등 · 점등 확인', type:'switch', principle:'어두운 장소에서는 작업등이 점검 부위를 잘 볼 수 있게 도와줘요. 작업 전에 켜짐 상태와 밝기를 확인하는 습관이 중요합니다.' },
  '태양광 패널': { icon:'☀️', title:'태양광 패널 · 충전 상태 맞추기', type:'solar', principle:'태양광 패널은 빛 에너지를 전기에너지로 바꿉니다. 패널에서 만들어진 전기는 배터리에 저장되어 등명기 같은 장비에 사용될 수 있어요.' },
  '예비등명기': { icon:'💡', title:'예비등명기 · 소켓 장착', type:'lamp', principle:'등명기는 항로표지의 빛을 만들어 선박이 표지를 알아볼 수 있게 해요. 장착 후에는 실제로 점등되는지 다시 확인해야 합니다.' },
  '등명기 렌즈': { icon:'🔆', title:'등명기 렌즈 · 렌즈 정렬', type:'lens', principle:'렌즈는 빛을 원하는 방향으로 전달하는 데 중요한 역할을 해요. 오염이나 잘못된 장착은 불빛이 약하게 보이는 원인이 될 수 있습니다.' },
  '설치 브래킷': { icon:'🧱', title:'설치 브래킷 · 고정부 맞추기', type:'bolts', principle:'브래킷은 장비를 구조물에 안정적으로 고정하는 데 사용돼요. 흔들리지 않도록 고정부를 확인해야 합니다.' },
  '방수 접속함': { icon:'🧰', title:'방수 접속함 · 잠금 확인', type:'latches', principle:'바닷가 장비의 전기 연결부는 물과 습기의 영향을 받을 수 있어요. 접속함이 잘 닫히고 밀폐되는지 확인하는 것이 중요합니다.' },
  '안전모': { icon:'⛑️', title:'안전모 · 안전장비 착용', type:'safety', principle:'현장 작업에서는 장비를 고치기 전에 작업자 안전을 먼저 확인해야 해요. 안전모는 머리를 보호하는 기본 보호장비입니다.' },
  '절연장갑': { icon:'🧤', title:'절연장갑 · 전기 작업 준비', type:'safety', principle:'전기 장비를 다룰 때는 작업에 맞는 보호장비와 안전절차가 필요해요. 게임에서는 절연장갑 착용 확인으로 단순화했습니다.' },
  '구명조끼': { icon:'🦺', title:'구명조끼 · 해상 안전 확인', type:'safety', principle:'바다 위에서 작업할 때는 물에 빠질 위험에 대비하는 것이 중요해요. 구명조끼는 해상 작업의 기본적인 안전장비 중 하나입니다.' },
  '로프': { icon:'🪢', title:'로프 · 고정 순서 맞추기', type:'rope', principle:'로프는 장비나 선박을 고정하는 데 사용할 수 있어요. 목적에 맞게 단단히 고정하고 풀림이 없는지 확인해야 합니다.' },
  '표지 도면': { icon:'📋', title:'표지 도면 · 위치 확인', type:'blueprint', principle:'도면과 점검자료를 보면 어떤 장비가 어디에 있어야 하는지 확인할 수 있어요. 실제 현장에서도 기록과 제원을 확인하는 과정이 중요합니다.' },
  '점멸제어기': { icon:'🎛️', title:'점멸제어기 · 점멸 패턴 맞추기', type:'pattern', principle:'항로표지의 불빛은 색과 점멸 특성으로 서로 구분됩니다. 제어장치는 정해진 점멸이 나오도록 관리하는 역할을 합니다.' },
  '세척도구': { icon:'🧽', title:'세척도구 · 렌즈 닦기', type:'clean', principle:'렌즈 표면이 더러우면 빛이 흐려지거나 약하게 보일 수 있어요. 깨끗한 광학부는 불빛을 잘 전달하는 데 도움이 됩니다.' },
  'GPS 측위기': { icon:'📡', title:'GPS 측위기 · 위치 맞추기', type:'mapalign', principle:'항로표지는 정해진 위치에 있는 것이 중요해요. 측위 장비를 이용하면 현재 위치와 목표 위치의 차이를 확인할 수 있습니다.' },
  '계류체인': { icon:'⛓️', title:'계류체인 · 고정 상태 점검', type:'chain', principle:'떠 있는 표지는 계류장치가 위치를 유지하는 데 중요한 역할을 해요. 체인의 연결과 고정 상태를 확인해야 합니다.' }
};

let activeEquipmentDirectionHandler=null;
function clearEquipmentDirectionHandler(){activeEquipmentDirectionHandler=null}
function handleEquipmentDirectionKey(key){if(!activeEquipmentDirectionHandler)return false;const map={arrowup:'up',arrowdown:'down',arrowleft:'left',arrowright:'right'};const move=map[key];if(!move)return false;activeEquipmentDirectionHandler(move);return true}

function equipmentGameFor(name) {
  return equipmentGameConfigs[name] || null;
}

function pickEquipmentMiniGames(inventoryItems, count = 3) {
  const pool = inventoryItems.filter(item => equipmentGameFor(item.name));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

function equipmentMiniGameBody(item) {
  const cfg = equipmentGameFor(item.name);
  if (!cfg) return '<div class="principleCard">이 장비의 점검 게임을 준비하지 못했습니다.</div>';
  if (cfg.type === 'battery') return `<div class="batteryGame"><div class="batterySlot" id="batterySlot">장착 홈</div><button class="batteryPackMini" id="batteryPackMini">${cfg.icon}<span>${item.name}</span></button><div class="terminalRow"><button id="terminalPlus" disabled>＋ 단자 연결</button><button id="terminalMinus" disabled>－ 단자 연결</button></div><div class="gameStatus" id="equipmentStatus">배터리를 눌러 들어 올려보세요.</div></div>`;
  if (cfg.type === 'bolts') return `<div class="boltBoard">${[0,1,2,3].map(i=>`<button class="boltMini" data-bolt="${i}" aria-label="${i+1}번 볼트">🔩<span>0/2</span></button>`).join('')}</div><div class="gameStatus" id="equipmentStatus">네 개의 볼트를 각각 두 번씩 조여주세요.</div>`;
  if (cfg.type === 'cables') return `<div class="cableGame"><div class="cableSide">${['빨강','파랑','노랑'].map((c,i)=>`<button class="cableEnd c${i}" data-cable="${i}">${c} 케이블</button>`).join('')}</div><div class="cableArrow">→</div><div class="cableSide">${[2,0,1].map((n,i)=>`<button class="cableSocket c${n}" data-socket="${n}">${['빨강','파랑','노랑'][n]} 단자</button>`).join('')}</div></div><div class="gameStatus" id="equipmentStatus">같은 색의 케이블과 단자를 연결하세요.</div>`;
  if (cfg.type === 'timing') return `<div class="gauge"><div class="gaugeGood"></div><div class="gaugeNeedle" id="equipGaugeNeedle"></div></div><button class="repairOption" id="equipMeasureBtn">지금 측정!</button><div class="gameStatus" id="equipmentStatus">바늘이 초록 구간에 들어왔을 때 측정하세요.</div>`;
  if (cfg.type === 'switch') return `<div class="switchGame"><div class="workLampMini" id="workLampMini">🔦</div><button class="bigSwitch" id="bigSwitch">전원 OFF</button><div class="lightTarget" id="lightTarget">점검 부위</div></div><div class="gameStatus" id="equipmentStatus">작업등을 켜고 점검 부위를 밝혀주세요.</div>`;
  if (cfg.type === 'solar') return `<div class="solarBox"><div class="solarMeter"><div class="solarPointer" id="equipSolarPointer"></div></div><input class="solarRange" id="equipSolarRange" type="range" min="0" max="100" value="15"><div class="solarReadout" id="equipSolarReadout">충전 상태 15%</div><button class="btn" id="equipSolarCheck" style="margin-top:10px">충전 상태 확인</button></div><div class="gameStatus" id="equipmentStatus">초록 범위에 맞춘 뒤 확인하세요.</div>`;
  if (cfg.type === 'lamp') return `<div class="lampInstall"><div class="lampSocketMini" id="lampSocketMini">소켓</div><button class="lampMini" id="lampMini">💡<span>예비등명기</span></button><button class="repairOption" id="lampTwist" disabled>시계방향으로 고정 0/3</button></div><div class="gameStatus" id="equipmentStatus">등명기를 소켓에 넣은 뒤 단단히 고정하세요.</div>`;
  if (cfg.type === 'lens') return `<div class="lensAlign"><div class="lensAxis"></div><div class="lensTargetRing"><div class="lensSweetSpot">OK</div></div><div class="lensDisc" id="lensDisc">🔆</div></div><div class="lensScale"><span>왼쪽</span><div class="lensScaleTrack"><div class="lensGoodZone"></div><div class="lensScaleNeedle" id="lensScaleNeedle"></div></div><span>오른쪽</span></div><input class="solarRange lensRange" id="lensRange" type="range" min="0" max="100" value="18"><div class="lensReadout" id="lensReadout">정렬 정확도 36%</div><button class="btn" id="lensCheck">이 위치로 고정</button><div class="gameStatus" id="equipmentStatus">렌즈가 초록색 중심 범위에 들어오면 고정하세요.</div>`;
  if (cfg.type === 'latches') return `<div class="latchBoxMini"><div class="junctionBoxMini">방수 접속함</div>${[0,1,2,3].map(i=>`<button class="latchMini l${i}" data-latch="${i}">OPEN</button>`).join('')}</div><div class="gameStatus" id="equipmentStatus">네 모서리 잠금장치를 모두 닫아주세요.</div>`;
  if (cfg.type === 'safety') return `<div class="safetyGame"><div class="workerMini">🧑‍🔧</div><div class="safetySteps">${['장비 상태 확인','보호장비 착용','작업 구역 확인'].map((t,i)=>`<button data-safety="${i}">${i+1}. ${t}</button>`).join('')}</div></div><div class="gameStatus" id="equipmentStatus">안전 준비를 순서대로 진행하세요.</div>`;
  if (cfg.type === 'rope') return `<div class="ropeGame"><div class="cleatMini">⚓</div><div class="ropeLineMini" id="ropeLineMini"></div></div><div class="sequenceBtns">${['고정점 통과','한 바퀴 감기','마지막 고정'].map((t,i)=>`<button data-rope="${i}">${i+1}. ${t}</button>`).join('')}</div><div class="gameStatus" id="equipmentStatus">로프 고정 순서를 맞춰주세요.</div>`;
  if (cfg.type === 'blueprint') return `<div class="blueprintGame"><div class="blueprintPaper"><div class="bpTarget">등명기</div><div class="bpTarget">전원함</div><div class="bpTarget">고정부</div></div><div class="bpChoices">${['등명기 → 전원함 → 고정부','전원함 → 등명기 → 고정부','고정부 → 등명기 → 전원함'].map((t,i)=>`<button data-blueprint="${i}">${t}</button>`).join('')}</div></div><div class="gameStatus" id="equipmentStatus">도면에서 연결 구조에 맞는 순서를 골라보세요.</div>`;
  if (cfg.type === 'pattern') return `<div class="patternDemo"><div class="patternHint">예시: 짧게 두 번 깜빡인 뒤 잠시 쉬는 패턴</div><div class="patternRow">${['A','B','C'].map((n,i)=>`<button class="patternChoice" data-equip-pattern="${i}"><div class="patternLamp ${i===0?'a':i===1?'b':'c'}"></div>${n} 패턴</button>`).join('')}</div></div><div class="gameStatus" id="equipmentStatus">예시와 같은 점멸을 찾아보세요.</div>`;
  if (cfg.type === 'clean') return `<div class="cleanLens" id="equipCleanLens">${[0,1,2,3,4].map((_,i)=>{const pos=[[28,22],[58,18],[22,55],[58,58],[43,40]][i]; return `<button class="dirtSpot" data-equip-dirt style="left:${pos[0]}%;top:${pos[1]}%;transform:rotate(${[-14,18,26,-18,32][i]}deg)"></button>`}).join('')}</div><div class="cleanCount" id="equipCleanCount">남은 오염 5개</div>`;
  if (cfg.type === 'mapalign') return `<div class="mapControlHint"><b>이동 방법</b> · 키보드 방향키로 움직이거나 화면의 ▲ ▼ ◀ ▶ 버튼을 직접 클릭하세요.</div><div class="mapAlign"><div class="mapGrid"></div><div class="targetRingMini"></div><div class="mapMarkerMini" id="equipMapMarker"></div></div><div class="movePad"><button class="up" data-equip-move="up">▲</button><button class="left" data-equip-move="left">◀</button><button class="down" data-equip-move="down">▼</button><button class="right" data-equip-move="right">▶</button></div><button class="btn" id="equipMapCheck">위치 확인</button><div class="gameStatus" id="equipmentStatus">노란 목표 원 안으로 이동하세요.</div>`;
  if (cfg.type === 'chain') return `<div class="chainGame">${[0,1,2,3].map(i=>`<button class="chainLinkMini" data-chain="${i}">⛓️<span>${i+1}</span></button>`).join('')}</div><div class="gameStatus" id="equipmentStatus">느슨한 연결고리를 찾아 순서대로 점검하세요.</div>`;
  return '<div class="principleCard">지원되지 않는 미니게임입니다.</div>';
}

function bindEquipmentMiniGame(item, onSuccess) {
  const cfg = equipmentGameFor(item.name);
  const status = () => document.getElementById('equipmentStatus');
  clearEquipmentDirectionHandler();
  const done = () => {clearEquipmentDirectionHandler();setTimeout(() => onSuccess(cfg.principle), 220)};
  if (!cfg) return;

  if (cfg.type === 'battery') {
    let lifted = false, inserted = false, plus = false, minus = false;
    const pack = $('batteryPackMini'), slot = $('batterySlot'), p = $('terminalPlus'), m = $('terminalMinus');
    pack.onclick = () => { lifted = true; pack.classList.add('lifted'); if(status())status().textContent='배터리를 장착 홈에 넣어주세요.' };
    slot.onclick = () => { if(!lifted){ if(status())status().textContent='먼저 배터리를 눌러 들어 올려주세요.'; return } inserted=true; slot.classList.add('filled'); pack.classList.add('installed'); p.disabled=false; m.disabled=false; if(status())status().textContent='＋와 － 단자를 모두 연결하세요.' };
    p.onclick=()=>{if(!inserted)return;plus=true;p.classList.add('ok');p.disabled=true;if(plus&&minus)done()};
    m.onclick=()=>{if(!inserted)return;minus=true;m.classList.add('ok');m.disabled=true;if(plus&&minus)done()};
  } else if (cfg.type === 'bolts') {
    const counts=[0,0,0,0]; document.querySelectorAll('[data-bolt]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.bolt);if(counts[i]>=2)return;counts[i]++;b.querySelector('span').textContent=`${counts[i]}/2`;b.classList.toggle('ok',counts[i]>=2);if(counts.every(v=>v>=2))done()});
  } else if (cfg.type === 'cables') {
    let selected=null, matched=0; document.querySelectorAll('[data-cable]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.cable);document.querySelectorAll('[data-cable]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')}); document.querySelectorAll('[data-socket]').forEach(b=>b.onclick=()=>{if(selected===null){if(status())status().textContent='먼저 왼쪽 케이블 하나를 선택하세요.';return}const n=Number(b.dataset.socket);if(n===selected&&!b.classList.contains('ok')){b.classList.add('ok');const c=document.querySelector(`[data-cable="${selected}"]`);c.classList.add('ok');c.disabled=true;b.disabled=true;matched++;selected=null;if(status())status().textContent=`연결 완료 ${matched}/3`;if(matched===3)done()}else if(status())status().textContent='색이 맞지 않아요. 같은 색 단자를 찾아보세요.'})
  } else if (cfg.type === 'timing') {
    let gauge=8,dir=1; clearRepairTimer(); repairTimer=setInterval(()=>{if(gamePaused||gameOver)return;gauge+=dir*2.7;if(gauge>94){gauge=94;dir=-1}if(gauge<4){gauge=4;dir=1}const n=$('equipGaugeNeedle');if(n)n.style.left=gauge+'%'},35); $('equipMeasureBtn').onclick=()=>{if(gauge>=35&&gauge<=70){clearRepairTimer();done()}else if(status())status().textContent='조금만 다시! 바늘이 초록 범위일 때 눌러보세요.'};
  } else if (cfg.type === 'switch') {
    let on=false; $('bigSwitch').onclick=()=>{on=!on;$('bigSwitch').textContent=on?'전원 ON':'전원 OFF';$('workLampMini').classList.toggle('on',on);$('lightTarget').classList.toggle('lit',on);if(on)done()};
  } else if (cfg.type === 'solar') {
    const range=$('equipSolarRange'),pointer=$('equipSolarPointer'),readout=$('equipSolarReadout');const update=()=>{pointer.style.left=range.value+'%';readout.textContent=`충전 상태 ${range.value}%`};range.oninput=update;update();$('equipSolarCheck').onclick=()=>{const v=Number(range.value);if(v>=35&&v<=65)done();else if(status())status().textContent='초록 범위에 들어오도록 다시 조절해보세요.'};
  } else if (cfg.type === 'lamp') {
    let installed=false,turns=0; $('lampMini').onclick=()=>{installed=true;$('lampMini').classList.add('installed');$('lampSocketMini').classList.add('filled');$('lampTwist').disabled=false;if(status())status().textContent='이제 등명기를 세 번 돌려 고정하세요.'};$('lampTwist').onclick=()=>{if(!installed)return;turns++;$('lampTwist').textContent=`시계방향으로 고정 ${turns}/3`;if(turns>=3)done()};
  } else if (cfg.type === 'lens') {
    const range=$('lensRange'),disc=$('lensDisc'),needle=$('lensScaleNeedle'),readout=$('lensReadout'),check=$('lensCheck');
    const successMin=44,successMax=56;
    const update=()=>{
      const v=Number(range.value),accuracy=Math.max(0,Math.round(100-Math.abs(v-50)*2));
      disc.style.left=(12+v*.76)+'%'; needle.style.left=v+'%'; readout.textContent=`정렬 정확도 ${accuracy}%`;
      const aligned=v>=successMin&&v<=successMax;disc.classList.toggle('aligned',aligned);readout.classList.toggle('good',aligned);check.classList.toggle('ready',aligned);
      if(status())status().textContent=aligned?'초록색 성공 범위입니다. 이 위치로 고정하세요.':'렌즈를 초록색 중심 범위까지 이동하세요.';
    };
    range.oninput=update;update();
    check.onclick=()=>{const v=Number(range.value);if(v>=successMin&&v<=successMax)done();else{if(status())status().textContent='아직 성공 범위 밖입니다. 아래 눈금의 초록 구간에 바늘을 넣어주세요.';readout.classList.add('miss');setTimeout(()=>readout&&readout.classList.remove('miss'),280)}};
  } else if (cfg.type === 'latches') {
    let closed=0;document.querySelectorAll('[data-latch]').forEach(b=>b.onclick=()=>{if(b.classList.contains('ok'))return;b.classList.add('ok');b.textContent='LOCK';closed++;if(status())status().textContent=`잠금 완료 ${closed}/4`;if(closed===4)done()});
  } else if (cfg.type === 'safety') {
    let step=0;document.querySelectorAll('[data-safety]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.safety);if(i===step){b.classList.add('ok');step++;if(step===3)done()}else{step=0;document.querySelectorAll('[data-safety]').forEach(x=>x.classList.remove('ok'));if(status())status().textContent='안전 확인은 첫 단계부터 순서대로 진행해보세요.'}});
  } else if (cfg.type === 'rope') {
    let step=0;document.querySelectorAll('[data-rope]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.rope);if(i===step){b.classList.add('ok');step++;$('ropeLineMini').style.width=(step*30+10)+'%';if(step===3)done()}else{step=0;document.querySelectorAll('[data-rope]').forEach(x=>x.classList.remove('ok'));if(status())status().textContent='고정 순서를 처음부터 다시 맞춰보세요.'}});
  } else if (cfg.type === 'blueprint') {
    document.querySelectorAll('[data-blueprint]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.blueprint)===1){b.classList.add('ok');done()}else if(status())status().textContent='도면의 전원함에서 등명기로 이어지는 구조를 다시 살펴보세요.'});
  } else if (cfg.type === 'pattern') {
    document.querySelectorAll('[data-equip-pattern]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-equip-pattern]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');if(Number(b.dataset.equipPattern)===1)done();else if(status())status().textContent='짧게 두 번 깜빡인 뒤 쉬는 패턴을 다시 찾아보세요.'});
  } else if (cfg.type === 'clean') {
    const spots=[...document.querySelectorAll('[data-equip-dirt]')];let left=spots.length;spots.forEach(b=>b.onclick=()=>{if(b.classList.contains('cleaned'))return;b.classList.add('cleaned');left--;const c=$('equipCleanCount');if(c)c.textContent=`남은 오염 ${left}개`;if(left===0)done()});
  } else if (cfg.type === 'mapalign') {
    let x=20,y=70;const marker=$('equipMapMarker');
    const paint=()=>{if(marker){marker.style.left=x+'%';marker.style.top=y+'%'}};
    const move=mv=>{if(gamePaused||gameOver)return;if(mv==='left')x=Math.max(6,x-8);if(mv==='right')x=Math.min(94,x+8);if(mv==='up')y=Math.max(8,y-8);if(mv==='down')y=Math.min(92,y+8);paint();if(status())status().textContent='키보드 방향키 또는 화면 버튼으로 노란 목표 원 안까지 이동하세요.'};
    activeEquipmentDirectionHandler=move;paint();
    document.querySelectorAll('[data-equip-move]').forEach(b=>b.onclick=()=>move(b.dataset.equipMove));
    $('equipMapCheck').onclick=()=>{if(Math.hypot(x-70,y-30)<13)done();else if(status())status().textContent='아직 목표 위치가 아니에요. 방향키 또는 화면의 화살표 버튼으로 더 가까이 이동하세요.'};
  } else if (cfg.type === 'chain') {
    let expected=0;document.querySelectorAll('[data-chain]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.chain);if(i===expected){b.classList.add('ok');expected++;if(status())status().textContent=`체인 점검 ${expected}/4`;if(expected===4)done()}else{expected=0;document.querySelectorAll('[data-chain]').forEach(x=>x.classList.remove('ok'));if(status())status().textContent='표시된 순서대로 연결고리를 확인해보세요.'}});
  }
}
