(function(){
'use strict';

/* ============================================================
   CONFIG / CONSTANTS
   ============================================================ */
const CONFIG_KEY = 'giro_plan_gh_config_v1';
const CACHE_KEY  = 'giro_plan_cache_v1';
const IDENTITY_KEY = 'giro_plan_identity_v1';
const API_BASE = 'https://api.github.com';

const SECTIONS = {
  ideas2025: { label:'Ideas 2025', color:'#3B5B7A' },
  ideas2026: { label:'Ideas 2026', color:'#3E7A72' },
  gobierno:  { label:'Gobierno y medición', color:'#C4482B' },
  programas: { label:'Programas y renuncias', color:'#C99A52' },
  mas:       { label:'Más allá de innovación', color:'#5E8368' }
};

const OWNERS = {
  mario: { label:'Mario', initial:'M', color:'var(--owner-mario)' },
  laura: { label:'Laura', initial:'L', color:'var(--owner-laura)' },
  ambos: { label:'Ambos', initial:'A', color:'var(--owner-ambos)' }
};

const PRIORITIES = {
  alta:  { label:'Alta',  color:'var(--alta)' },
  media: { label:'Media', color:'var(--media)' },
  baja:  { label:'Baja',  color:'var(--baja)' }
};

const STATUSES = [
  { key:'todo',  label:'Por hacer' },
  { key:'doing', label:'En curso' },
  { key:'done',  label:'Hecho' }
];

function seedItems(){
  const rows = [
    ['ideas2025','Coordinar con Arquitectura de Datos el contexto del "cerebro MCP" para Cristian Seguro (IA mundo Siste)','mario','alta','todo'],
    ['ideas2025','Activar Discovery de Sistecrédito Smart con tribu Fénix y alinear sinergia con hiperpersonalización','ambos','alta','todo'],
    ['ideas2025','Buscar sinergia entre Red de aliados (Eddy) e hiperpersonalización','laura','media','todo'],
    ['ideas2025','Activar Discovery de Gamificación (Caro Munera) con tribu Fénix','ambos','alta','todo'],
    ['ideas2025','Validar continuidad de IA vinculación (Lucas) y promover su finalización','mario','alta','todo'],
    ['ideas2025','Activar Discovery de +Valor al día (Jahna) con tribu Fénix','ambos','alta','todo'],
    ['ideas2025','Organizar y entregar las 20 ideas fuera del podio a los responsables ya identificados','ambos','media','todo'],
    ['ideas2025','Dar contexto a Sandra Nanclares sobre el proyecto Embajador / Sisteviajes (aliados en flotas de transporte terrestre)','laura','media','todo'],
    ['ideas2026','Formalizar con Disruplab su rol de comité asesor para calificar ideas (app portafolio + semana de innovación + For+)','mario','alta','todo'],
    ['ideas2026','Optimizar los tiempos de reunión del comité de calificación','ambos','media','todo'],
    ['ideas2026','Preparar y llevar el top de ideas 2026 a Presidencia','mario','alta','todo'],
    ['gobierno','Diseñar el modelo de gobierno transversal de innovación, en paralelo a la ejecución','mario','alta','todo'],
    ['gobierno','Preparar el comparativo de avance agosto → diciembre para la medición del equipo','ambos','alta','todo'],
    ['programas','Relanzar embajadores GIRO alrededor de "¿cómo mejoro mi área?", con recursos internos','laura','media','todo'],
    ['programas','Confirmar la no participación en el ranking ANDI este ciclo','mario','baja','todo'],
    ['programas','Agendar y preparar la sesión de calificación de ideas en Disruplab (rol de ideadores)','ambos','media','todo'],
    ['programas','Cerrar el chat "Foco innovación y Sostenibilidad"','laura','baja','todo'],
    ['mas','Mantener el foco en la implementación de ideas activas','ambos','media','todo'],
    ['mas','Diseñar el mensaje para visibilizar que cualquiera puede resolver con GPT/Claude antes de pasar a backlog','mario','alta','todo'],
    ['mas','Definir cómo los Retos van a documentar los casos de uso GPT/Claude ya implementados en las áreas','ambos','alta','todo'],
    ['mas','Recopilar y comunicar casos de éxito ya implementados (ej. app de Natalia Betancur en Licenciamientos)','laura','media','todo']
  ];
  const now = new Date().toISOString();
  return rows.map((r,i)=>({
    id: 'seed-'+i,
    section:r[0], title:r[1], detail:'', owner:r[2], priority:r[3], status:r[4],
    dueDate:'', order:i*10, createdAt:now
  }));
}

/* ============================================================
   STATE
   ============================================================ */
let state = {
  items: [],
  sha: null,
  syncing: false,
  online: false,
  configured: false,
  lastSyncedAt: null,
  activeFilters: new Set(Object.keys(SECTIONS)),
  editingId: null,
  pendingStatus: 'todo'
};

let config = { token:'', owner:'', repo:'', branch:'main', path:'data/plan.json' };

/* ============================================================
   UTILS
   ============================================================ */
function uid(){
  if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-'+Date.now()+'-'+Math.random().toString(16).slice(2);
}
function debounce(fn, ms){
  let t;
  return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(null,args), ms); };
}
function fmtDate(d){
  if(!d) return '';
  const dt = new Date(d+'T00:00:00');
  if(isNaN(dt)) return '';
  return dt.toLocaleDateString('es-CO', {day:'2-digit', month:'short'});
}
function daysUntil(d){
  if(!d) return null;
  const dt = new Date(d+'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((dt-today)/86400000);
}
function utf8ToB64(str){
  const bytes = new TextEncoder().encode(str);
  let bin='';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}
function b64ToUtf8(b64){
  const bin = atob(b64.replace(/\n/g,''));
  const bytes = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function el(tag, cls, text){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(text!=null) e.textContent = text;
  return e;
}

/* ============================================================
   CONFIG / IDENTITY
   ============================================================ */
function loadConfig(){
  try{
    const raw = localStorage.getItem(CONFIG_KEY);
    if(raw) config = Object.assign(config, JSON.parse(raw));
  }catch(e){}
  const params = new URLSearchParams(location.search);
  ['owner','repo','branch','path'].forEach(k=>{
    const v = params.get(k);
    if(v) config[k] = v;
  });
  persistConfig();
}
function persistConfig(){
  try{ localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }catch(e){}
}
function isConfigured(){ return !!(config.owner && config.repo && config.token); }

function loadIdentity(){ return localStorage.getItem(IDENTITY_KEY) || ''; }
function saveIdentity(v){ try{ localStorage.setItem(IDENTITY_KEY, v); }catch(e){} }

/* ============================================================
   REMOTE SYNC (GitHub Contents API)
   ============================================================ */
function ghHeaders(json){
  const h = {
    'Authorization': 'Bearer ' + config.token,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if(json) h['Content-Type'] = 'application/json';
  return h;
}
function contentsUrl(withRef){
  const base = `${API_BASE}/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${config.path.split('/').map(encodeURIComponent).join('/')}`;
  return withRef ? base + '?ref=' + encodeURIComponent(config.branch) : base;
}

async function fetchRemote(){
  if(!isConfigured()) return {ok:false, reason:'no-config'};
  try{
    const res = await fetch(contentsUrl(true), { headers: ghHeaders(false) });
    if(res.status === 200){
      const data = await res.json();
      const json = JSON.parse(b64ToUtf8(data.content));
      state.items = Array.isArray(json.items) ? json.items : [];
      state.sha = data.sha;
      state.online = true;
      cacheLocal();
      return {ok:true};
    } else if(res.status === 404){
      state.sha = null;
      state.online = true;
      return {ok:true, notFound:true};
    } else if(res.status === 401 || res.status === 403){
      state.online = false;
      return {ok:false, reason:'auth'};
    } else {
      state.online = false;
      return {ok:false, reason:'error', status:res.status};
    }
  }catch(e){
    state.online = false;
    return {ok:false, reason:'network'};
  }
}

async function saveRemote(retry){
  if(retry === undefined) retry = true;
  if(!isConfigured()){ cacheLocal(); renderSyncStatus(); return; }
  state.syncing = true; renderSyncStatus();
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: loadIdentity() || 'desconocido',
    items: state.items
  };
  const body = {
    message: 'chore: actualizar plan de trabajo (' + new Date().toLocaleString('es-CO') + ')',
    content: utf8ToB64(JSON.stringify(payload, null, 2)),
    branch: config.branch
  };
  if(state.sha) body.sha = state.sha;
  try{
    const res = await fetch(contentsUrl(false), { method:'PUT', headers: ghHeaders(true), body: JSON.stringify(body) });
    if(res.status === 200 || res.status === 201){
      const data = await res.json();
      state.sha = data.content.sha;
      state.online = true;
      state.lastSyncedAt = new Date();
      cacheLocal();
      hideBanner();
    } else if(res.status === 409 && retry){
      const r = await fetchRemote();
      if(r.ok){ state.syncing = false; await saveRemote(false); return; }
    } else if(res.status === 401 || res.status === 403){
      state.online = false;
      showBanner('El token no es válido o no tiene permiso de escritura sobre el repositorio. Tus cambios quedaron guardados solo en este navegador.');
    } else if(res.status === 404){
      state.online = false;
      showBanner('No se encontró el repositorio o la ruta configurada. Revisa la configuración de sincronización.');
    } else {
      state.online = false;
      showBanner('No se pudo guardar en GitHub (código ' + res.status + '). Tus cambios quedaron guardados solo en este navegador.');
    }
  }catch(e){
    state.online = false;
    showBanner('Sin conexión con GitHub. Tus cambios quedaron guardados solo en este navegador y se reintentará más adelante.');
  }
  state.syncing = false;
  cacheLocal();
  renderSyncStatus();
}
const scheduleSave = debounce(()=>saveRemote(true), 1100);

function cacheLocal(){
  try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ sha: state.sha, items: state.items })); }catch(e){}
}
function loadCache(){
  try{
    const raw = localStorage.getItem(CACHE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return null;
}

/* ============================================================
   BANNER
   ============================================================ */
function showBanner(msg){
  const b = document.getElementById('banner');
  b.textContent = msg;
  b.classList.add('show');
}
function hideBanner(){
  document.getElementById('banner').classList.remove('show');
}
function bannerForFetchFailure(r){
  if(!r || r.ok) return;
  if(r.reason==='auth') showBanner('El token no es válido o no tiene permiso de lectura sobre el repositorio. Mostrando la última copia guardada en este navegador.');
  else if(r.reason==='network') showBanner('Sin conexión con GitHub. Mostrando la última copia guardada en este navegador.');
  else if(r.reason==='error') showBanner('No se pudo leer el archivo en GitHub (código ' + r.status + '). Mostrando la última copia guardada en este navegador.');
}

/* ============================================================
   CRUD
   ============================================================ */
function addItem(data){
  const maxOrder = state.items.filter(i=>i.status===data.status).reduce((m,i)=>Math.max(m,i.order),-10);
  state.items.push(Object.assign({
    id: uid(),
    detail:'', dueDate:'', order: maxOrder+10, createdAt: new Date().toISOString()
  }, data));
  afterMutate();
}
function updateItem(id, data){
  const item = state.items.find(i=>i.id===id);
  if(!item) return;
  Object.assign(item, data);
  afterMutate();
}
function deleteItem(id){
  state.items = state.items.filter(i=>i.id!==id);
  afterMutate();
}
function moveItem(id, newStatus, newIndexInColumn){
  const item = state.items.find(i=>i.id===id);
  if(!item) return;
  item.status = newStatus;
  const colItems = state.items.filter(i=>i.status===newStatus && i.id!==id)
    .sort((a,b)=>a.order-b.order);
  colItems.splice(newIndexInColumn, 0, item);
  colItems.forEach((it,idx)=>{ it.order = idx*10; });
  afterMutate();
}
function nudgeItem(id, dir){
  const item = state.items.find(i=>i.id===id);
  if(!item) return;
  const col = state.items.filter(i=>i.status===item.status).sort((a,b)=>a.order-b.order);
  const idx = col.findIndex(i=>i.id===id);
  const swapIdx = idx+dir;
  if(swapIdx<0 || swapIdx>=col.length) return;
  const tmp = col[idx].order;
  col[idx].order = col[swapIdx].order;
  col[swapIdx].order = tmp;
  afterMutate();
}
function afterMutate(){
  cacheLocal();
  renderBoard();
  renderStats();
  scheduleSave();
}

/* ============================================================
   RENDER: TOPBAR / SYNC / HERO
   ============================================================ */
function renderSyncStatus(){
  const pill = document.getElementById('syncPill');
  const text = document.getElementById('syncPillText');
  const markSmall = document.querySelector('#syncPill .sync-dot');
  const footer = document.getElementById('lastSyncedFooter');
  let stateAttr = 'offline', label = 'sin configurar';
  if(state.syncing){
    stateAttr = 'saving'; label = 'guardando…';
  } else if(!isConfigured()){
    stateAttr = 'offline'; label = 'sin configurar';
  } else if(state.online){
    stateAttr = 'synced'; label = 'sincronizado';
  } else {
    stateAttr = 'offline'; label = 'sin conexión';
  }
  pill.dataset.state = stateAttr;
  text.textContent = label;
  if(state.lastSyncedAt){
    footer.textContent = 'Última sincronización: ' + state.lastSyncedAt.toLocaleString('es-CO');
  } else {
    footer.textContent = isConfigured() ? 'Aún sin sincronizar' : 'Sincronización no configurada — usa el ícono de ajustes';
  }
}

function renderMonths(){
  const row = document.getElementById('monthsRow');
  row.innerHTML = '';
  const names = ['Ago','Sep','Oct','Nov','Dic'];
  const monthIdx = [7,8,9,10,11]; // 0-indexed, Aug=7
  const now = new Date();
  const curMonth = now.getFullYear()===2026 ? now.getMonth() : -1;
  names.forEach((n,i)=>{
    const chip = el('span','month-chip', n+' 2026');
    if(curMonth === monthIdx[i]) chip.classList.add('is-now');
    row.appendChild(chip);
  });
}

function renderRing(){
  const total = state.items.length;
  const done = state.items.filter(i=>i.status==='done').length;
  const pct = total ? Math.round((done/total)*100) : 0;
  const circumference = 150.8;
  const offset = circumference - (pct/100)*circumference;
  document.getElementById('ringFill').style.strokeDashoffset = offset;
  document.getElementById('ringPct').textContent = pct + '%';
}

/* ============================================================
   RENDER: STATS + FILTERS
   ============================================================ */
function renderStats(){
  const row = document.getElementById('statsRow');
  row.innerHTML = '';
  const total = state.items.length;
  const byStatus = {};
  STATUSES.forEach(s=> byStatus[s.key] = state.items.filter(i=>i.status===s.key).length);
  const overdue = state.items.filter(i=>i.status!=='done' && i.dueDate && daysUntil(i.dueDate)<0).length;
  const soon = state.items.filter(i=>i.status!=='done' && i.dueDate && daysUntil(i.dueDate)>=0 && daysUntil(i.dueDate)<=7).length;

  const chips = [
    ['Total', total],
    ['Por hacer', byStatus.todo||0],
    ['En curso', byStatus.doing||0],
    ['Hecho', byStatus.done||0],
    ['Próximas 7 días', soon],
    ['Vencidas', overdue]
  ];
  chips.forEach(([label,val])=>{
    const chip = el('div','stat-chip');
    const b = el('b', null, String(val));
    chip.appendChild(b);
    chip.appendChild(document.createTextNode(label));
    row.appendChild(chip);
  });
  renderRing();
}

function renderFilters(){
  const wrap = document.getElementById('filters');
  wrap.innerHTML = '';
  Object.entries(SECTIONS).forEach(([key,def])=>{
    const chip = el('button','chip');
    chip.type = 'button';
    chip.setAttribute('aria-pressed', state.activeFilters.has(key) ? 'true':'false');
    const sw = el('span','sw'); sw.style.background = def.color;
    chip.appendChild(sw);
    chip.appendChild(document.createTextNode(def.label));
    chip.addEventListener('click', ()=>{
      if(state.activeFilters.has(key)) state.activeFilters.delete(key);
      else state.activeFilters.add(key);
      renderFilters();
      renderBoard();
    });
    wrap.appendChild(chip);
  });
}

/* ============================================================
   RENDER: BOARD
   ============================================================ */
function makeCard(item){
  const card = el('li','card');
  card.draggable = true;
  card.dataset.id = item.id;
  card.style.borderLeftColor = 'var(--' + (item.priority||'media') + ')';

  const top = el('div','card-top');
  const title = el('div','card-title', item.title);
  const actions = el('div','card-actions');
  const editBtn = el('button','mini-btn'); editBtn.innerHTML = '✎'; editBtn.title='Editar'; editBtn.type='button';
  editBtn.addEventListener('click', (e)=>{ e.stopPropagation(); openCardModal(item); });
  const delBtn = el('button','mini-btn'); delBtn.innerHTML = '✕'; delBtn.title='Eliminar'; delBtn.type='button';
  delBtn.addEventListener('click', (e)=>{ e.stopPropagation(); if(confirm('¿Eliminar "'+item.title+'"?')) deleteItem(item.id); });
  actions.appendChild(editBtn); actions.appendChild(delBtn);
  top.appendChild(title); top.appendChild(actions);
  card.appendChild(top);

  if(item.detail){
    card.appendChild(el('div','card-detail', item.detail));
  }

  const tags = el('div','card-tags');
  const secDef = SECTIONS[item.section] || {label:item.section, color:'#8A8375'};
  const secTag = el('span','tag tag-section');
  const secDot = el('span'); secDot.style.cssText='width:6px;height:6px;border-radius:50%;display:inline-block;background:'+secDef.color;
  secTag.appendChild(secDot);
  secTag.appendChild(document.createTextNode(secDef.label));
  tags.appendChild(secTag);

  const ownDef = OWNERS[item.owner] || OWNERS.ambos;
  const ownTag = el('span','tag tag-owner', ownDef.initial + ' · ' + ownDef.label);
  ownTag.style.background = ownDef.color;
  tags.appendChild(ownTag);

  const prDef = PRIORITIES[item.priority] || PRIORITIES.media;
  const prTag = el('span','tag', prDef.label);
  prTag.style.cssText = 'background:var(--'+item.priority+'-soft, var(--paper-2)); color:'+prDef.color+';';
  tags.appendChild(prTag);

  if(item.dueDate){
    const d = daysUntil(item.dueDate);
    const dueTag = el('span','tag tag-due', fmtDate(item.dueDate));
    if(item.status!=='done' && d<0) dueTag.classList.add('overdue');
    else if(item.status!=='done' && d<=7) dueTag.classList.add('soon');
    tags.appendChild(dueTag);
  }
  card.appendChild(tags);

  const footRow = el('div','card-footer-row');
  const moveBtns = el('div','move-btns');
  const up = el('button','mini-btn'); up.innerHTML='↑'; up.type='button'; up.title='Subir prioridad';
  up.addEventListener('click', (e)=>{ e.stopPropagation(); nudgeItem(item.id,-1); });
  const down = el('button','mini-btn'); down.innerHTML='↓'; down.type='button'; down.title='Bajar prioridad';
  down.addEventListener('click', (e)=>{ e.stopPropagation(); nudgeItem(item.id,1); });
  moveBtns.appendChild(up); moveBtns.appendChild(down);

  const statusSel = el('select','status-select');
  STATUSES.forEach(s=>{
    const opt = document.createElement('option');
    opt.value = s.key; opt.textContent = s.label;
    if(s.key===item.status) opt.selected = true;
    statusSel.appendChild(opt);
  });
  statusSel.addEventListener('click', e=>e.stopPropagation());
  statusSel.addEventListener('change', ()=>{
    const targetCount = state.items.filter(i=>i.status===statusSel.value).length;
    moveItem(item.id, statusSel.value, targetCount);
  });

  footRow.appendChild(moveBtns);
  footRow.appendChild(statusSel);
  card.appendChild(footRow);

  card.addEventListener('click', ()=> openCardModal(item));

  // Drag events
  card.addEventListener('dragstart', ()=>{
    card.classList.add('dragging');
    dragState.id = item.id;
  });
  card.addEventListener('dragend', ()=>{
    card.classList.remove('dragging');
    dragState.id = null;
    document.querySelectorAll('.column-list').forEach(c=>c.classList.remove('drag-over'));
  });

  return card;
}

const dragState = { id: null };

function renderBoard(){
  const board = document.getElementById('board-columns');
  board.innerHTML = '';
  const filtered = state.items.filter(i=> state.activeFilters.has(i.section));

  STATUSES.forEach(statusDef=>{
    const col = el('div','column');
    col.dataset.status = statusDef.key;

    const head = el('div','column-head');
    const titleWrap = el('div','column-title');
    titleWrap.appendChild(document.createTextNode(statusDef.label));
    const count = filtered.filter(i=>i.status===statusDef.key).length;
    const countEl = el('span','column-count', String(count));
    titleWrap.appendChild(countEl);
    const addBtn = el('button','column-add','+');
    addBtn.type='button'; addBtn.title='Agregar en '+statusDef.label;
    addBtn.addEventListener('click', ()=> openCardModal(null, statusDef.key));
    head.appendChild(titleWrap);
    head.appendChild(addBtn);
    col.appendChild(head);

    const list = el('ul','column-list');
    list.dataset.status = statusDef.key;

    const items = filtered.filter(i=>i.status===statusDef.key).sort((a,b)=>a.order-b.order);
    if(items.length===0){
      const hint = el('li');
      hint.style.listStyle='none';
      const hintInner = el('div','empty-hint', 'Sin tarjetas aquí todavía');
      hint.appendChild(hintInner);
      list.appendChild(hint);
    } else {
      items.forEach(item => list.appendChild(makeCard(item)));
    }

    list.addEventListener('dragover', (e)=>{
      e.preventDefault();
      list.classList.add('drag-over');
      const dragging = document.querySelector('.card.dragging');
      if(!dragging) return;
      const after = getDragAfterElement(list, e.clientY);
      if(after == null){ list.appendChild(dragging); }
      else { list.insertBefore(dragging, after); }
    });
    list.addEventListener('dragleave', (e)=>{
      if(e.target === list) list.classList.remove('drag-over');
    });
    list.addEventListener('drop', (e)=>{
      e.preventDefault();
      list.classList.remove('drag-over');
      const id = dragState.id;
      if(!id) return;
      const cards = [...list.querySelectorAll('.card')];
      const newIndex = cards.findIndex(c=>c.dataset.id===id);
      moveItem(id, statusDef.key, newIndex<0?cards.length:newIndex);
    });

    col.appendChild(list);
    board.appendChild(col);
  });
}

function getDragAfterElement(container, y){
  const cards = [...container.querySelectorAll('.card:not(.dragging)')];
  return cards.reduce((closest, child)=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if(offset < 0 && offset > closest.offset){
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: -Infinity }).element;
}

/* ============================================================
   MODAL: ADD/EDIT CARD
   ============================================================ */
function populateSelect(sel, dict, includeAll){
  sel.innerHTML = '';
  Object.entries(dict).forEach(([key,def])=>{
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = def.label;
    sel.appendChild(opt);
  });
}

function openCardModal(item, presetStatus){
  state.editingId = item ? item.id : null;
  document.getElementById('cardModalTitle').textContent = item ? 'Editar accionable' : 'Nuevo accionable';
  document.getElementById('f-title').value = item ? item.title : '';
  document.getElementById('f-detail').value = item ? item.detail : '';
  document.getElementById('f-due').value = item ? item.dueDate : '';
  const secSel = document.getElementById('f-section');
  const ownSel = document.getElementById('f-owner');
  const priSel = document.getElementById('f-priority');
  const staSel = document.getElementById('f-status');
  populateSelect(secSel, SECTIONS);
  populateSelect(ownSel, OWNERS);
  populateSelect(priSel, PRIORITIES);
  staSel.innerHTML='';
  STATUSES.forEach(s=>{
    const opt = document.createElement('option');
    opt.value=s.key; opt.textContent=s.label;
    staSel.appendChild(opt);
  });

  secSel.value = item ? item.section : 'ideas2025';
  const identity = loadIdentity();
  ownSel.value = item ? item.owner : (identity==='Mario' ? 'mario' : identity==='Laura' ? 'laura' : 'ambos');
  priSel.value = item ? item.priority : 'media';
  staSel.value = item ? item.status : (presetStatus || 'todo');

  document.getElementById('deleteCardBtn').style.display = item ? 'inline-flex' : 'none';
  document.getElementById('cardOverlay').classList.add('open');
  document.getElementById('f-title').focus();
}
function closeCardModal(){
  document.getElementById('cardOverlay').classList.remove('open');
  state.editingId = null;
}

/* ============================================================
   MODAL: SETTINGS
   ============================================================ */
function openSettingsModal(){
  document.getElementById('g-owner').value = config.owner || '';
  document.getElementById('g-repo').value = config.repo || '';
  document.getElementById('g-branch').value = config.branch || 'main';
  document.getElementById('g-path').value = config.path || 'data/plan.json';
  document.getElementById('g-token').value = config.token || '';
  document.getElementById('connStatus').textContent = '';
  document.getElementById('connStatus').className = 'conn-status';
  document.getElementById('settingsOverlay').classList.add('open');
}
function closeSettingsModal(){
  document.getElementById('settingsOverlay').classList.remove('open');
}

async function testConnection(){
  const statusEl = document.getElementById('connStatus');
  statusEl.className = 'conn-status';
  statusEl.textContent = 'Probando…';
  const owner = document.getElementById('g-owner').value.trim();
  const repo = document.getElementById('g-repo').value.trim();
  const token = document.getElementById('g-token').value.trim();
  if(!owner || !repo || !token){
    statusEl.textContent = 'Completa usuario, repositorio y token.';
    statusEl.classList.add('bad');
    return;
  }
  try{
    const res = await fetch(`${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      headers: { 'Authorization':'Bearer '+token, 'Accept':'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28' }
    });
    if(res.status===200){
      const data = await res.json();
      statusEl.textContent = '✓ Conectado a ' + data.full_name + (data.private ? ' (privado)' : ' (público)');
      statusEl.classList.add('ok');
    } else if(res.status===404){
      statusEl.textContent = 'No se encontró ese repositorio con este token.';
      statusEl.classList.add('bad');
    } else if(res.status===401){
      statusEl.textContent = 'Token inválido.';
      statusEl.classList.add('bad');
    } else {
      statusEl.textContent = 'Error inesperado (código ' + res.status + ').';
      statusEl.classList.add('bad');
    }
  }catch(e){
    statusEl.textContent = 'No se pudo conectar (revisa tu internet).';
    statusEl.classList.add('bad');
  }
}

/* ============================================================
   EVENT BINDING
   ============================================================ */
function bindStaticUI(){
  document.getElementById('addCardBtn').addEventListener('click', ()=> openCardModal(null,'todo'));
  document.getElementById('cancelCardBtn').addEventListener('click', closeCardModal);
  document.getElementById('cardOverlay').addEventListener('click', (e)=>{ if(e.target.id==='cardOverlay') closeCardModal(); });
  document.getElementById('deleteCardBtn').addEventListener('click', ()=>{
    if(state.editingId && confirm('¿Eliminar este accionable?')){
      deleteItem(state.editingId);
      closeCardModal();
    }
  });
  document.getElementById('cardForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = {
      title: document.getElementById('f-title').value.trim(),
      detail: document.getElementById('f-detail').value.trim(),
      section: document.getElementById('f-section').value,
      owner: document.getElementById('f-owner').value,
      priority: document.getElementById('f-priority').value,
      status: document.getElementById('f-status').value,
      dueDate: document.getElementById('f-due').value
    };
    if(!data.title) return;
    if(state.editingId) updateItem(state.editingId, data);
    else addItem(data);
    closeCardModal();
  });

  document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
  document.getElementById('closeSettingsBtn').addEventListener('click', closeSettingsModal);
  document.getElementById('settingsOverlay').addEventListener('click', (e)=>{ if(e.target.id==='settingsOverlay') closeSettingsModal(); });
  document.getElementById('testConnBtn').addEventListener('click', testConnection);
  document.getElementById('settingsForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    config.owner = document.getElementById('g-owner').value.trim();
    config.repo = document.getElementById('g-repo').value.trim();
    config.branch = document.getElementById('g-branch').value.trim() || 'main';
    config.path = document.getElementById('g-path').value.trim() || 'data/plan.json';
    config.token = document.getElementById('g-token').value.trim();
    persistConfig();
    closeSettingsModal();
    renderSyncStatus();
    if(isConfigured()){
      const r = await fetchRemote();
      if(r.ok && !r.notFound){ renderAll(); }
      else if(r.ok && r.notFound){ await saveRemote(true); renderAll(); }
      else { bannerForFetchFailure(r); renderSyncStatus(); }
    }
  });

  const identitySelect = document.getElementById('identitySelect');
  identitySelect.value = loadIdentity();
  identitySelect.addEventListener('change', ()=> saveIdentity(identitySelect.value));

  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ closeCardModal(); closeSettingsModal(); }
  });
}

/* ============================================================
   RENDER ALL / INIT
   ============================================================ */
function renderAll(){
  renderFilters();
  renderStats();
  renderBoard();
  renderMonths();
  renderSyncStatus();
}

async function init(){
  loadConfig();
  bindStaticUI();

  if(isConfigured()){
    const r = await fetchRemote();
    if(r.ok && !r.notFound){
      // items already set from remote
    } else if(r.ok && r.notFound){
      state.items = seedItems();
    } else {
      bannerForFetchFailure(r);
      const cache = loadCache();
      state.items = cache ? cache.items : seedItems();
      if(cache) state.sha = cache.sha;
    }
  } else {
    const cache = loadCache();
    state.items = cache ? cache.items : seedItems();
    if(cache) state.sha = cache.sha;
  }
  renderAll();
}

init();

})();
