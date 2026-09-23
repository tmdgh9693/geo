'use strict';
// 공통 DOM 참조, 전역 상태, 유틸리티, 점멸 로직
const $ = id => document.getElementById(id), canvas = $('game'), ctx = canvas.getContext('2d'), mini = $('mini'), mctx = mini.getContext('2d');
const W = 1920, H = 1080, TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, dist = (a, b, x, y) => Math.hypot(a - x, b - y);
const ui = { phaseTitle: $('phaseTitle'), missionText: $('missionText'), hudLabel: $('hudLabel'), hudMain: $('hudMain'), hudSub: $('hudSub'), camera: $('cameraPill'), inventory: $('inventory'), chips: $('chips'), weight: $('weightText'), inst: $('instruments'), nav: $('navcard'), progress: $('progress'), progressBar: $('progressBar'), engineBar: $('engineBar'), engineText: $('engineText'), rudderBar: $('rudderBar'), rudderText: $('rudderText'), safetyBar: $('safetyBar'), safetyText: $('safetyText'), toast: $('toast'), dock: $('dockPrompt'), modal: $('modal'), prep: $('prepChecklist'), prepItems: $('prepItems'), prepLoad: $('prepLoad'), hazard: $('hazardBanner'), weather: $('weatherBanner'), controls: $('controls'), mouseControls: $('mouseControls'), stageLabel: $('stageLabel'), tutorialCoach: $('tutorialCoach'), tutorialCoachTitle: $('tutorialCoachTitle'), tutorialCoachText: $('tutorialCoachText'), tutorialCoachProgress: $('tutorialCoachProgress'), tutorialStepBadge: $('tutorialStepBadge'), systemOverlay: $('systemOverlay'), systemKicker: $('systemKicker'), systemIcon: $('systemIcon'), systemTitle: $('systemTitle'), systemText: $('systemText'), systemActions: $('systemActions'), pauseBtn: $('pauseBtn') };
let phase = 'intro', keys = {}, last = performance.now(), toastTime = 0, gatherEnd = 0, cameraMode = 0, shake = 0, flash = 0, impactTimer = 0, repairTimer = null, repairState = null;
let gamePaused=false, gameOver=false, pauseStartedAt=0, pauseVisualNow=performance.now();
let seaVerifyState=null, repairedMainTarget=false, returnToOfficeActive=false, returnFinishPending=false, postRepairExitLine=null;
const WORK_SPEED_KNOTS=5, WORK_SPEED_UNITS=WORK_SPEED_KNOTS*7.6, ARRIVAL_RADIUS=420;
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r) }
function showToast(t) { ui.toast.textContent = t; ui.toast.classList.add('on'); toastTime = 2.25 }
function showModal(html) { ui.modal.innerHTML = html; ui.modal.style.display = 'flex'; requestAnimationFrame(()=>{ ui.modal.scrollTop=0; }); } function hideModal() { ui.modal.style.display = 'none' }
function hex(a, b, c, d = 1) { return `rgba(${a},${b},${c},${d})` }
function text(txt, x, y, size = 16, color = '#fff', align = 'left', weight = 700) { ctx.font = `${weight} ${size}px Trebuchet MS,Inter,system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(txt, x, y); ctx.textAlign = 'left' }
function modalIsOpen() { return getComputedStyle(ui.modal).display !== 'none' }
function keyboardConfirm() {
    if (!modalIsOpen()) return false;
    const active = document.activeElement;
    if (active && ui.modal.contains(active) && active.tagName === 'BUTTON' && !active.disabled) { active.click(); return true }
    const measure = $('measureBtn'); if (measure && !measure.disabled) { measure.click(); return true }
    const primary = ui.modal.querySelector('.btn:not([disabled])'); if (primary) { primary.click(); return true }
    return false;
}
function navLightFlash(now, seed = 0, period = 1800, on = 430) { const t = (now + seed) % period; return t < on ? 1 : .08 }
function faultyLightFlash(now, seed = 0) { const t = (now + seed) % 2700; if (t < 190) return 1; if (t > 420 && t < 520) return .55; if (t > 1100 && t < 1180) return .28; return .03 }
function targetLightFlash(now, kind) { if(repairedMainTarget) return kind === 'lighthouse' ? navLightFlash(now,0,5000,1200) : navLightFlash(now,0,3600,900); const id = currentMission && currentMission.id; if (id === 'flash_pattern') { const t = now % 2200; return (t < 160 || (t > 320 && t < 470) || (t > 720 && t < 830)) ? 1 : .03 } if (id === 'lens_clean') return navLightFlash(now, 0, 5000, 1200) * .28; if (id === 'lighthouse') return faultyLightFlash(now, 250); if (id === 'beacon_repair' || id === 'solar_fault') return faultyLightFlash(now, 700); return kind === 'lighthouse' ? navLightFlash(now, 0, 5000, 1200) : navLightFlash(now, 0, 3600, 900) }
