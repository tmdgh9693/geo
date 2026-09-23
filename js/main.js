'use strict';
function loop(now) {
    const dt = Math.min(.035, (now - last) / 1000);
    last = now; const frozen = gamePaused || gameOver;
    const renderNow = frozen ? pauseVisualNow : now;
    if (!frozen) update(dt, now); draw(renderNow);
    requestAnimationFrame(loop)
}

const qs = new URLSearchParams(location.search);
if (qs.has('stage')) {
    const s = clamp(Number(qs.get('stage')) - 1, 0, STAGES.length - 1);
    unlockedStageIndex = Math.max(unlockedStageIndex, s);
    selectStage(s, false); if (qs.get('autostart') === 'sail') startSail();
}

else if (qs.get('autostart') === 'office') { selectStage(0, false) }
else if (qs.get('autostart') === 'gather') { selectStage(0, false); startGather() }
if (qs.get('snapshot') === '1') {
    const now = performance.now(); update(.016, now); draw(now)
} else requestAnimationFrame(loop);
