const modes = { work: 'Work', short: 'Short break', long: 'Long break' };
let mode = 'work', total = 1500, left = 1500, timer = null, done = 0;
const $ = s => document.querySelector(s), C = 2 * Math.PI * 118;
$('#fg').style.strokeDasharray = C;
$('#modes').innerHTML = Object.entries(modes).map(([k, v]) => `<button data-m="${k}">${v}</button>`).join('');
const mins = m => Math.max(1, +$('#s-' + m).value || 1) * 60;
function draw() {
    const m = String(Math.floor(left / 60)).padStart(2, '0'), s = String(left % 60).padStart(2, '0');
    $('#clock').textContent = `${m}:${s}`; $('#label').textContent = modes[mode]; document.title = `${m}:${s} · ${modes[mode]}`;
    $('#fg').style.strokeDashoffset = C * (1 - (total - left) / total);
    document.body.classList.toggle('brk', mode !== 'work');
    document.querySelectorAll('#modes button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
}
function setMode(m) { stop(); mode = m; total = left = mins(m); draw(); }
function stop() { clearInterval(timer); timer = null; }
function popup() {
    if (!$('#chime').checked) return;
    $('#alert-title').textContent = modes[mode] + ' finished';
    $('#alert-text').textContent = mode === 'work' ? 'Great work! Time to take a break.' : 'Break is over. Ready to focus?';
    $('#alert').showModal();
}
function finish() {
    stop(); popup();
    if (mode === 'work') { done++; $('#count').textContent = done; setMode(done % 4 === 0 ? 'long' : 'short'); }
    else setMode('work');
}
$('#start').onclick = () => {
    if (timer) return;
    timer = setInterval(() => { left--; draw(); if (left <= 0) finish(); }, 1000);
};
$('#pause').onclick = stop;
$('#alert-ok').onclick = () => $('#alert').close();
$('#reset').onclick = () => setMode(mode);
$('#modes').onclick = e => { if (e.target.dataset.m) setMode(e.target.dataset.m); };
['work', 'short', 'long'].forEach(m => $('#s-' + m).onchange = () => { if (!timer && mode === m) setMode(m); });
draw();