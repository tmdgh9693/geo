'use strict';
// 사무실·정비창고·파밍 화면 렌더링
// OFFICE RENDER
function drawOffice() {
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9ad9ff'); sky.addColorStop(1, '#4f9ae2'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // playful blocky building shell
  ctx.fillStyle = '#9dd5f7'; rr(40, 104, 1840, 910, 28); ctx.fill(); ctx.fillStyle = '#e9f8ff'; rr(62, 126, 1796, 866, 24); ctx.fill(); ctx.fillStyle = '#d7eefc'; rr(62, 126, 1796, 70, 24); ctx.fill();
  // zones
  ctx.fillStyle = '#dff3ff'; rr(88, 220, 560, 420, 22); ctx.fill(); ctx.fillStyle = '#d8fff2'; rr(705, 220, 395, 710, 22); ctx.fill(); ctx.fillStyle = '#eef4ff'; rr(1145, 220, 690, 710, 22); ctx.fill(); ctx.strokeStyle = 'rgba(31,76,128,.10)'; ctx.lineWidth = 4; ctx.stroke();
  text('업무구역 · OPERATIONS', 106, 205, 20, '#2a4d96', 'left', 1000); text('출동 준비구역 · READY BAY', 730, 205, 20, '#218b6b', 'left', 1000); text('정비창고 · MAINTENANCE STORAGE', 1170, 205, 20, '#2a4d96', 'left', 1000);
  // window sea
  ctx.fillStyle = '#6ec9ff'; rr(118, 255, 500, 145, 18); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.36)'; ctx.fillRect(364, 255, 4, 145); ctx.fillRect(118, 326, 500, 4); ctx.fillStyle = '#4ba3de'; ctx.fillRect(118, 350, 500, 18); text('부두 전망창', 138, 388, 12, '#ffffff', 'left', 900);
  // desks and phone
  ctx.fillStyle = '#c49a63'; rr(148, 448, 408, 134, 20); ctx.fill(); ctx.fillStyle = '#273b78'; rr(206, 468, 148, 80, 14); ctx.fill(); ctx.fillStyle = '#31458b'; rr(380, 468, 126, 80, 14); ctx.fill(); ctx.fillStyle = '#ffffff'; rr(314, 276, 108, 70, 16); ctx.fill(); ctx.fillStyle = '#ffde59'; rr(332, 292, 72, 38, 12); ctx.fill(); text('☎', 368, 320, 28, '#3e3e3e', 'center', 1000); ctx.strokeStyle = 'rgba(255,207,68,.55)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(368, 310, 60, 0, TAU); ctx.stroke();
  // briefing area
  ctx.fillStyle = '#f4fbff'; rr(98, 676, 532, 266, 22); ctx.fill(); ctx.fillStyle = '#a0d8ff'; rr(122, 726, 180, 112, 16); ctx.fill(); ctx.fillStyle = '#9ebeff'; rr(332, 726, 220, 112, 16); ctx.fill(); ctx.fillStyle = '#ffe48c'; rr(122, 856, 430, 54, 14); ctx.fill(); text('브리핑 / 휴게 공간', 116, 706, 15, '#2a4d96', 'left', 900); text('현재 신고: ' + (currentMission ? currentMission.title : '신고 대기'), 132, 891, 13, '#4d5a00', 'left', 900);
  // ready bay
  ctx.fillStyle = '#b1f1da'; rr(742, 265, 322, 372, 20); ctx.fill(); ctx.strokeStyle = 'rgba(38,153,114,.35)'; ctx.lineWidth = 6; ctx.setLineDash([18, 14]); rr(742, 265, 322, 372, 20); ctx.stroke(); ctx.setLineDash([]); text('정밀 점검 장비 / 개인 안전장비', 771, 301, 16, '#1d8162', 'left', 1000); ctx.fillStyle = '#7ee2bf'; rr(752, 684, 304, 132, 18); ctx.fill(); text('출동 장비 적재대', 904, 752, 18, '#0d513d', 'center', 1000); ctx.fillStyle = '#a8f1d8'; rr(745, 842, 318, 86, 18); ctx.fill(); text('장비 최종 확인', 904, 894, 20, '#19664e', 'center', 1000);
  // warehouse blocks
  function rack(x, y, w, h, label, c1, c2) { ctx.fillStyle = c1; rr(x, y, w, h, 18); ctx.fill(); ctx.fillStyle = c2; rr(x + 12, y + 44, w - 24, h - 56, 14); ctx.fill(); ctx.fillStyle = 'rgba(35,74,146,.12)'; for (let yy = y + 74; yy < y + h - 36; yy += 96)ctx.fillRect(x + 24, yy, w - 48, 14); text(label, x + 18, y + 28, 15, '#2a4d96', 'left', 1000) }
  rack(1160, 252, 305, 296, 'A · 공구 / 전기', '#cfe8ff', '#ecf7ff'); rack(1495, 252, 325, 296, 'B · 전원 / 조명', '#d8edff', '#eef8ff'); rack(1160, 576, 305, 332, 'C · 등명기 / 설치부품', '#d3ecff', '#eef8ff'); rack(1495, 576, 270, 332, 'D · 계류 / 기타', '#dbf0ff', '#f1f9ff');
  // floor arrows
  ctx.strokeStyle = 'rgba(38,153,114,.30)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(906, 925); ctx.lineTo(1080, 925); ctx.lineTo(1080, 958); ctx.lineTo(1782, 958); ctx.stroke(); ctx.fillStyle = '#3ed58a'; ctx.beginPath(); ctx.moveTo(1803, 958); ctx.lineTo(1763, 936); ctx.lineTo(1763, 980); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#20386e'; rr(1788, 806, 58, 156, 12); ctx.fill(); ctx.fillStyle = '#77f0c3'; rr(1798, 820, 38, 128, 10); ctx.fill(); text('출동', 1817, 855, 14, '#123b31', 'center', 1000); text('GATE', 1817, 878, 10, '#123b31', 'center', 1000); text('→', 1817, 922, 28, '#123b31', 'center', 1000);
  // items with toy-like pedestals and labels
  for (const it of items) { if (it.taken) continue; ctx.save(); const req = isRequired(it.name); ctx.fillStyle = req ? 'rgba(255,243,166,.95)' : 'rgba(255,255,255,.88)'; rr(it.x - 42, it.y - 40, 84, 84, 18); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = req ? 'rgba(255,213,90,.9)' : 'rgba(73,143,225,.45)'; ctx.stroke(); ctx.shadowColor = req ? 'rgba(255,213,90,.45)' : 'rgba(99,177,255,.28)'; ctx.shadowBlur = 18; ctx.font = '38px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(it.icon, it.x, it.y + 14); ctx.shadowBlur = 0; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(31,55,114,.92)'; rr(it.x - 62, it.y + 52, 124, 24, 9); ctx.fill(); text(it.name, it.x, it.y + 69, 11, '#ffffff', 'center', 1000); ctx.fillStyle = req ? 'rgba(255,213,90,.95)' : 'rgba(116,209,255,.95)'; rr(it.x - 36, it.y + 82, 72, 20, 8); ctx.fill(); text(it.kg + ' kg', it.x, it.y + 97, 10, req ? '#644400' : '#09384d', 'center', 1000); if (req) { ctx.fillStyle = 'rgba(255,213,90,.95)'; rr(it.x - 42, it.y - 66, 84, 18, 8); ctx.fill(); text('필수', it.x, it.y - 53, 10, '#5a4300', 'center', 1000) } ctx.restore() }
  if (tutorialMode) {
    let tx = null, ty = null, label = '';
    if (tutorialStep === 0) { tx = TUTORIAL_PAD.x; ty = TUTORIAL_PAD.y; label = '여기로 이동' }
    else if (tutorialStep === 1) { tx = 368; ty = 310; label = '전화 받기' }
    else if (tutorialStep === 2) { const it = items.find(x => x.name === '예비배터리' && !x.taken); if (it) { tx = it.x; ty = it.y; label = '예비배터리' } }
    else if (tutorialStep === 3) { tx = 1817; ty = 885; label = '출동 게이트' }
    if (tx !== null) { const pulse = 1 + Math.sin(performance.now() * .006) * .12; ctx.save(); ctx.strokeStyle = '#ffcf3f'; ctx.fillStyle = 'rgba(255,226,91,.16)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(tx, ty, 54 * pulse, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#253d78'; rr(tx - 65, ty - 86, 130, 28, 10); ctx.fill(); text(label, tx, ty - 67, 12, '#fff4a4', 'center', 1000); ctx.restore() }
  }
  if (officeMoveTarget) { ctx.save(); ctx.strokeStyle = 'rgba(46,141,255,.72)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(officeMoveTarget.x, officeMoveTarget.y, 22, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(officeMoveTarget.x, officeMoveTarget.y, 8, 0, TAU); ctx.stroke(); ctx.restore() }
  // blocky player
  ctx.save(); ctx.translate(player.x, player.y); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(0, 22, 25, 10, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd35a'; rr(-14, -32, 28, 28, 8); ctx.fill(); ctx.fillStyle = '#ffffff'; rr(-18, -2, 36, 34, 8); ctx.fill(); ctx.fillStyle = '#4fa8f1'; rr(-18, 32, 36, 12, 6); ctx.fill(); ctx.restore(); text('점검원', player.x, player.y - 44, 12, '#214585', 'center', 1000);
  if (phase === 'office' && !tutorialMode) { ui.phaseTitle.textContent = `STAGE ${stageInfo().number} · ${stageInfo().title}`; ui.missionText.textContent = '전화기를 클릭하거나 직접 이동해 신고를 확인하세요. 마우스로 바닥을 클릭하면 그 위치까지 이동합니다.' }
  ui.nav.style.display = 'none'; ui.inst.style.display = 'none'; ui.progress.style.display = 'none'; ui.camera.style.display = 'none'; ui.inventory.style.display = 'block'; ui.controls.style.display = 'none'; if (ui.mouseControls) ui.mouseControls.style.display = 'none';
}
