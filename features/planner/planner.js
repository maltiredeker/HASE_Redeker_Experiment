const days=['Mon','Tue','Wed','Thu','Fri'],ROWS=24;
const fixed=[{name:'Lunch',s:8,l:2},{name:'Dinner',s:20,l:2}]; // slot 0 = 08:00, each slot = 30 min
let courses=[{id:1,name:'Algorithms',room:'Hall B2',color:'#2b78b8',len:3},{id:2,name:'Statistics',room:'Room 204',color:'#6558c9',len:2},{id:3,name:'Chemistry Lab',room:'Lab 3',color:'#c0503a',len:4}];
let placed=[{cid:1,d:0,s:2},{cid:2,d:2,s:4}],nid=10,dragCid=null;
const $=s=>document.querySelector(s),esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tm=s=>{const m=480+s*30;return String(Math.floor(m/60)).padStart(2,'0')+':'+(m%60?'30':'00');};
const len=p=>courses.find(c=>c.id===p.cid).len;
function msg(t){$('#msg').textContent=t;setTimeout(()=>$('#msg').textContent='',3000);}
function place(cid,d,s){
 const c=courses.find(c=>c.id===cid),e=s+c.len;
 if(e>ROWS){msg(`${c.name} would run past ${tm(ROWS)}.`);return;}
 const hit=[...placed.filter(p=>p.d===d).map(p=>({s:p.s,e:p.s+len(p),k:'p',p})),...fixed.map(f=>({s:f.s,e:f.s+f.l,k:'f',n:f.name}))].find(x=>s<x.e&&e>x.s);
 if(hit){msg(hit.k==='p'?`Conflict: overlaps ${courses.find(c=>c.id===hit.p.cid).name} on ${days[d]}.`:`Conflict: overlaps ${hit.n} on ${days[d]}.`);
  const el=document.querySelector(hit.k==='p'?`[data-p="${placed.indexOf(hit.p)}"]`:`[data-f="${d}-${hit.n}"]`);
  if(el){el.classList.add('bad');setTimeout(()=>el.classList.remove('bad'),700);}return;}
 placed.push({cid,d,s});render();
}
function render(){
 $('#list').innerHTML='';
 courses.forEach(c=>{const el=document.createElement('div');el.className='course';el.style.background=c.color;el.draggable=true;
  el.innerHTML=`<div>${esc(c.name)}<small>${esc(c.room||'No location')} · ${c.len*30} min</small></div><button class="x" title="Delete course">✕</button>`;
  el.ondragstart=()=>dragCid=c.id;
  el.querySelector('.x').onclick=()=>{courses=courses.filter(x=>x!==c);placed=placed.filter(p=>p.cid!==c.id);render();};
  $('#list').appendChild(el);});
 const g=$('#grid');g.innerHTML='<div class="dh" style="grid-row:1;grid-column:1"></div>';
 days.forEach((d,i)=>g.insertAdjacentHTML('beforeend',`<div class="dh" style="grid-row:1;grid-column:${i+2}">${d}</div>`));
 for(let s=0;s<ROWS;s++){
  g.insertAdjacentHTML('beforeend',`<div class="tl${s%2?' half':''}" style="grid-row:${s+2};grid-column:1">${tm(s)}</div>`);
  days.forEach((_,d)=>{const c=document.createElement('div');c.className='cell'+(s%2?'':' h')+(d%2?' alt':'');c.style.gridArea=`${s+2}/${d+2}`;
   c.ondragover=e=>{e.preventDefault();c.classList.add('over')};c.ondragleave=()=>c.classList.remove('over');
   c.ondrop=e=>{e.preventDefault();c.classList.remove('over');if(dragCid)place(dragCid,d,s);dragCid=null;};
   c.onclick=()=>openPick(d,s);g.appendChild(c);});
 }
 days.forEach((_,d)=>fixed.forEach(f=>g.insertAdjacentHTML('beforeend',`<div class="blk fixed" data-f="${d}-${f.name}" style="grid-area:${f.s+2}/${d+2}/span ${f.l}/${d+2}">${f.name}</div>`)));
 placed.forEach((p,i)=>{const c=courses.find(c=>c.id===p.cid),el=document.createElement('div');
  el.className='blk'+(c.len===1?' one':'');el.dataset.p=i;el.style.cssText=`background:${c.color};grid-area:${p.s+2}/${p.d+2}/span ${c.len}/${p.d+2}`;
  el.innerHTML=c.len===1?`<b>${esc(c.name)}</b> ${esc(c.room)}`:`<b>${esc(c.name)}</b><br>${esc(c.room)}<br>${tm(p.s)}–${tm(p.s+c.len)}`;el.title='Click to remove';
  el.onclick=()=>{placed.splice(i,1);render();};g.appendChild(el);});
}
function openPick(d,s){
 $('#pick').innerHTML=`<p style="margin:0 0 8px;color:var(--muted)">${days[d]} at ${tm(s)}</p>`+(courses.length?'':'<p>Add a course first.</p>');
 courses.forEach(c=>{const b=document.createElement('div');b.className='course';b.style.background=c.color;b.style.cursor='pointer';b.textContent=c.name;
  b.onclick=()=>{$('#dlg').close();place(c.id,d,s);};$('#pick').appendChild(b);});
 $('#dlg').showModal();
}
$('#cancel').onclick=()=>$('#dlg').close();
$('#cf').onsubmit=e=>{e.preventDefault();courses.push({id:++nid,name:$('#n').value,room:$('#r').value,color:$('#col').value,len:+$('#len').value});e.target.reset();$('#col').value='#2b78b8';render();};
render();
