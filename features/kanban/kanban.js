let cols = [{ id: 1, name: 'To Do' }, { id: 2, name: 'In Progress' }, { id: 3, name: 'Done' }];
let tasks = [
    { id: 1, col: 1, title: 'Read chapter 4', desc: 'Highlight key definitions', pri: 'Medium', due: '' },
    { id: 2, col: 2, title: 'Draft lab report', desc: 'Methods and results sections', pri: 'High', due: '' },
    { id: 3, col: 3, title: 'Email supervisor', desc: '', pri: 'Low', due: '' }];
let nid = 100, dragId = null;
const $ = s => document.querySelector(s), board = $('#board');
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function render() {
    board.innerHTML = '';
    cols.forEach(col => {
        const items = tasks.filter(t => t.col === col.id);
        const el = document.createElement('div'); el.className = 'col';
        el.innerHTML = `<div class="col-h"><input value="${esc(col.name)}" aria-label="Column name"><span class="count">${items.length}</span><button class="ghost" title="Delete column" style="margin-left:auto">✕</button></div>`;
        el.querySelector('input').onchange = e => { col.name = e.target.value.trim() || col.name; render(); };
        el.querySelector('button').onclick = () => { if (cols.length < 2) return; const to = cols.find(c => c !== col).id; tasks.forEach(t => { if (t.col === col.id) t.col = to }); cols = cols.filter(c => c !== col); render(); };
        el.ondragover = e => { e.preventDefault(); el.classList.add('over') };
        el.ondragleave = () => el.classList.remove('over'); 
        el.ondrop = e => { e.preventDefault(); const t = tasks.find(t => t.id === dragId); if (t) { t.col = col.id; render(); } };
        items.forEach(t => {
            const od = t.due && t.due < new Date().toISOString().slice(0, 10) && col.name !== 'Done';
            const c = document.createElement('div'); c.className = 'card ' + t.pri; c.draggable = true;
            c.innerHTML = `<button class="ghost del" title="Delete task">✕</button><h3>${esc(t.title)}</h3>${t.desc ? `<p>${esc(t.desc)}</p>` : ''}
   <div class="meta"><span>${t.pri} priority</span><span class="${od ? 'overdue' : ''}">${t.due ? 'Due ' + t.due : 'No due date'}</span></div>
   <select aria-label="Move task"><option value="">Move to…</option>${cols.filter(x => x.id !== col.id).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select>`;
            c.ondragstart = () => { dragId = t.id; setTimeout(() => c.classList.add('dragging')) };
            c.ondragend = () => c.classList.remove('dragging');
            c.querySelector('select').onchange = e => { t.col = +e.target.value; render(); };
            c.querySelector('.del').onclick = () => { tasks = tasks.filter(x => x !== t); render(); };
            el.appendChild(c);
        });
        board.appendChild(el);
    });
}
$('#addCol').onclick = () => { cols.push({ id: ++nid, name: 'New column' }); render(); };
$('#addTask').onclick = () => { $('#form').reset(); $('#c').innerHTML = cols.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join(''); $('#dlg').showModal(); };
$('#cancel').onclick = () => $('#dlg').close();
$('#form').onsubmit = () => { tasks.push({ id: ++nid, col: +$('#c').value, title: $('#t').value, desc: $('#d').value, pri: $('#p').value, due: $('#due').value }); render(); };
render();
