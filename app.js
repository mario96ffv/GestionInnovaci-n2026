(function(){
'use strict';

/* ============================================================
   SUPABASE CONFIG
   ============================================================ */
const SUPABASE_URL = 'https://esehsrguiinyeqydwnbd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hgn6sbfaY3bcrNxr7migew_7wIOwiGm';
const TABLE = 'plan_items';
const CACHE_KEY = 'giro_plan_cache_v2';
const IDENTITY_KEY = 'giro_plan_identity_v1';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   CONSTANTS
   ============================================================ */
const SECTIONS = {
  ideas2025: { label:'Ideas 2025', color:'#3B5B7A' },
  ideas2026: { label:'Ideas 2026', color:'#3E7A72' },
  gobierno:  { label:'Gobierno y medición', color:'#C4482B' },
  programas: { label:'Programas', color:'#C99A52' },
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

/* ============================================================
   MIGRATION DATA — tu tablero real tal como estaba en GitHub
   Solo se usa una vez, si la tabla en Supabase llega vacía.
   ============================================================ */
function migrationItems(){
  return [
    { id:'seed-0', section:'ideas2025', title:'Coordinar con Arquitectura de Datos el contexto del "cerebro MCP" para Cristian Seguro (IA mundo Siste)', detail:'', owner:'mario', priority:'alta', status:'doing', dueDate:'2026-08-26', order:10, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-1', section:'ideas2025', title:'Activar Discovery de Sistecrédito Smart con tribu Fénix y alinear sinergia con hiperpersonalización', detail:'', owner:'laura', priority:'alta', status:'todo', dueDate:'', order:50, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-2', section:'ideas2025', title:'Buscar sinergia entre Red de aliados (Eddy) e hiperpersonalización', detail:'', owner:'laura', priority:'alta', status:'todo', dueDate:'', order:60, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-3', section:'ideas2025', title:'Activar Discovery de Gamificación (Caro Munera) con tribu Fénix', detail:'', owner:'laura', priority:'alta', status:'todo', dueDate:'', order:70, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-4', section:'ideas2025', title:'Validar continuidad de IA vinculación (Lucas) y promover su finalización', detail:'', owner:'mario', priority:'alta', status:'todo', dueDate:'', order:80, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-5', section:'ideas2025', title:'Activar Discovery de +Valor al día (Jahna) con tribu Fénix', detail:'', owner:'laura', priority:'alta', status:'todo', dueDate:'', order:90, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-6', section:'ideas2025', title:'Organizar y entregar las 20 ideas fuera del podio a los responsables ya identificados', detail:'', owner:'ambos', priority:'media', status:'todo', dueDate:'', order:100, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-7', section:'ideas2025', title:'Dar contexto a Sandra Nanclares sobre el proyecto Embajador / Sisteviajes (aliados en flotas de transporte terrestre)', detail:'', owner:'mario', priority:'media', status:'todo', dueDate:'', order:110, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-8', section:'ideas2026', title:'Formalizar con Disruplab su rol de comité asesor para calificar ideas (app portafolio + semana de innovación + For+)', detail:'', owner:'mario', priority:'alta', status:'todo', dueDate:'', order:0, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-10', section:'ideas2026', title:'Preparar y llevar el top de ideas 2026 a Presidencia', detail:'', owner:'mario', priority:'alta', status:'todo', dueDate:'', order:120, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-11', section:'gobierno', title:'Diseñar el modelo de gobierno transversal de innovación, en paralelo a la ejecución', detail:'', owner:'mario', priority:'alta', status:'todo', dueDate:'', order:130, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-12', section:'gobierno', title:'Preparar el comparativo de avance agosto → diciembre para la medición del equipo', detail:'', owner:'ambos', priority:'alta', status:'todo', dueDate:'', order:140, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-13', section:'programas', title:'Realizar convocatoria personal a cada embajador', detail:'', owner:'ambos', priority:'alta', status:'doing', dueDate:'2026-08-28', order:50, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-14', section:'programas', title:'Confirmar la no participación en el ranking ANDI este ciclo', detail:'', owner:'mario', priority:'baja', status:'done', dueDate:'', order:0, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'seed-20', section:'mas', title:'Recopilar casos de éxito ya implementados: ejemplo caso Natalia Betancur + People Ops + Idea Innovadora', detail:'1. Entender el caso de uso de Natalia, el alcance de la solución y el valor que genera\n\n2. Mapear por los menos 2 casos de People Ops para iniciar comunicando los de nuestra dirección.\n\n3. Al menos un caso implementado de idea innovadora', owner:'laura', priority:'media', status:'todo', dueDate:'', order:10, createdAt:'2026-08-14T16:07:51.754Z' },
    { id:'7ed8503c-f62e-48a6-b252-0422fa665aba', section:'programas', title:'Realizar contexto: reto edu financiera', detail:'- Presentar la metodología y ajustar para iniciar el plan de trabajo', owner:'mario', priority:'media', status:'todo', dueDate:'2026-08-24', order:150, createdAt:'2026-08-14T16:17:27.425Z' },
    { id:'de95f443-d712-40a1-ab2a-60aac8d1dd70', section:'mas', title:'Video casos de éxito: implementado ya el área', detail:'Esta comunicación debe construirse con los siguientes aspectos:\n\n1. Video donde se muestre como se hacía antes y como se hace ahora con la implementación \n2. Propuesta de guion: intro, explicación de cada uno de los casos + idea innovadora, llamado a la acción.', owner:'laura', priority:'media', status:'todo', dueDate:'', order:40, createdAt:'2026-08-14T16:23:34.415Z' },
    { id:'120b1109-9bd7-493f-9a83-2a22e5e3d5e3', section:'mas', title:'Piezas de Comunicación: general y personalizada de ideas innovadoras paso a la acción', detail:'Incluir el llamado a la acción: como estamos en la implementación de las ideas, una manera rápida de hacerlo es hacer uso de los recursos que tienen algunas áreas mediante inteligencia artificial y si no se puede escalar a equipos que lo hacen posible pero teniendo en cuenta los tiempos de espera en la priorización y backlogs de trabajo.', owner:'laura', priority:'alta', status:'doing', dueDate:'2026-08-28', order:60, createdAt:'2026-08-14T16:28:04.138Z' },
    { id:'2fe40332-3112-4bb9-af04-3e6c7adb7f49', section:'programas', title:'Preparación Taller GIRO: ¿Cómo innovar y hacerlo posible desde mi área mediante la IA?', detail:'Taller donde se formarán los participantes en el uso de sus herramientas disponibles para solucionar problemas de su área, la idea es que sepan que esto también es innovación y pueden despertar la creatividad a servicio de Sistecrédito.', owner:'laura', priority:'alta', status:'doing', dueDate:'2026-08-28', order:30, createdAt:'2026-08-18T13:27:52.899Z' },
    { id:'c7ea67a5-ffa2-455e-8d82-dc1f1f042f75', section:'programas', title:'Sesión reconocimientos Foco Reto Producto', detail:'Entrega reconocimiento: Premio + diploma + Refri\nAvances Gestión de la Innovación con Foco Producto', owner:'laura', priority:'alta', status:'doing', dueDate:'2026-08-25', order:20, createdAt:'2026-08-18T13:33:59.634Z' },
    { id:'61b4ec23-91fb-464d-bbcb-c5656ecab7f3', section:'programas', title:'Reto Cultura: Embajadores', detail:'Desarrollar con los embajadores una sesión de reto para dar solución a un reto estratégico', owner:'laura', priority:'media', status:'todo', dueDate:'2026-09-11', order:170, createdAt:'2026-08-18T13:38:31.676Z' },
    { id:'02ae9fb2-c9e5-447a-922a-c42d41d87cc3', section:'programas', title:'Primera sesión formación: embajadores', detail:'', owner:'laura', priority:'media', status:'todo', dueDate:'2026-09-29', order:180, createdAt:'2026-08-18T13:39:40.815Z' },
    { id:'1a31b743-2628-4177-8cac-60dd058fabf9', section:'ideas2025', title:'Activarnos con Edwin Tribu Fenix', detail:'- Conexión y entrega de las ideas Podio 2025 que ingresarían a discovery', owner:'ambos', priority:'alta', status:'doing', dueDate:'2026-08-24', order:0, createdAt:'2026-08-18T13:42:46.032Z' },
    { id:'55842dc9-b760-4af6-8c6f-aab9f3b44625', section:'mas', title:'Entrega a Ana Montoya del Reconocimiento 2025', detail:'', owner:'laura', priority:'media', status:'done', dueDate:'2026-08-18', order:20, createdAt:'2026-08-18T13:45:01.670Z' },
    { id:'6f13c374-1390-49e8-a22c-86b65959bd1e', section:'ideas2026', title:'Revisión por parte de GIRO: ideas semana de la innovación', detail:'- Validación inicial de las primeras 5 ideas', owner:'ambos', priority:'alta', status:'doing', dueDate:'2026-08-25', order:40, createdAt:'2026-08-18T13:46:45.182Z' },
    { id:'ed36177b-f67b-4479-bda6-e62d6cfae3f9', section:'mas', title:'Gestión de reconocimientos: Embajadoras Geranios', detail:'', owner:'mario', priority:'alta', status:'doing', dueDate:'2026-08-25', order:70, createdAt:'2026-08-19T13:15:39.188Z' },
    { id:'3d3e791e-448f-426c-b34d-d1891c59cc37', section:'mas', title:'Gestión de Reconocimientos: Retos Johanna y Daniel', detail:'', owner:'mario', priority:'media', status:'doing', dueDate:'2026-08-25', order:80, createdAt:'2026-08-19T13:16:15.669Z' },
    { id:'4d5c2c78-b967-4965-bc04-8c216fa61b06', section:'mas', title:'Gestión de Reconocimiento: Victor Manuel', detail:'Solicitud de formación realizada y colaborador informado por correo', owner:'mario', priority:'alta', status:'done', dueDate:'2026-08-20', order:10, createdAt:'2026-08-19T13:16:41.490Z' }
  ];
}

/* ============================================================
   STATE
   ============================================================ */
let state = {
  items: [],
  online: false,
  lastSyncedAt: null,
  activeFilters: new Set(Object.keys(SECTIONS)),
  editingId: null
};

/* ============================================================
   UTILS
   ============================================================ */
function uid(){
  if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-'+Date.now()+'-'+Math.random().toString(16).slice(2);
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
function el(tag, cls, text){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(text!=null) e.textContent = text;
  return e;
}
function loadIdentity(){ return localStorage.getItem(IDENTITY_KEY) || ''; }
function saveIdentity(v){ try{ localStorage.setItem(IDENTITY_KEY, v); }catch(e){} }
function canEdit(){ const id = loadIdentity(); return id === 'Mario' || id === 'Laura'; }
function updateEditModeUI(){ document.body.classList.toggle('read-only', !canEdit()); }

/* ============================================================
   ROW <-> ITEM MAPPING (Supabase usa snake_case)
   ============================================================ */
function rowToItem(row){
  return {
    id: row.id,
    title: row.title,
    detail: row.detail || '',
    section: row.section,
    owner: row.owner,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date || '',
    order: row.sort_order != null ? Number(row.sort_order) : 0,
    createdAt: row.created_at || new Date().toISOString()
  };
}
function itemToRow(item){
  return {
    id: item.id,
    title: item.title,
    detail: item.detail || '',
    section: item.section,
    owner: item.owner,
    priority: item.priority,
    status: item.status,
    due_date: item.dueDate || '',
    sort_order: item.order,
    created_at: item.createdAt
  };
}

/* ============================================================
   LOCAL CACHE (respaldo offline, no reemplaza a Supabase)
   ============================================================ */
function cacheLocal(){
  try{ localStorage.setItem(CACHE_KEY, JSON.stringify(state.items)); }catch(e){}
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

/* ============================================================
   REMOTE: CARGA INICIAL + SEED ÚNICO
   ============================================================ */
async function loadAll(){
  try{
    const { data, error } = await supabase.from(TABLE).select('*').order('sort_order', {ascending:true});
    if(error){
      state.online = false;
      showBanner('No se pudo conectar con la base de datos: ' + error.message + '. Mostrando la última copia guardada en este navegador.');
      state.items = loadCache() || [];
      return;
    }
    state.online = true;
    state.items = (data || []).map(rowToItem);
    cacheLocal();
  }catch(e){
    state.online = false;
    showBanner('Sin conexión con la base de datos. Mostrando la última copia guardada en este navegador.');
    state.items = loadCache() || [];
  }
}

async function ensureSeeded(){
  if(state.items.length > 0 || !state.online) return;
  const seed = migrationItems();
  const { error } = await supabase.from(TABLE).insert(seed.map(itemToRow));
  if(error){
    showBanner('No se pudo inicializar la base de datos con las tarjetas migradas: ' + error.message);
    return;
  }
  state.items = seed;
  cacheLocal();
}

/* ============================================================
   CRUD (cada acción escribe directo en Supabase)
   ============================================================ */
function refreshViews(){ renderBoard(); renderStats(); }

async function addItem(data){
  const maxOrder = state.items.filter(i=>i.status===data.status).reduce((m,i)=>Math.max(m,i.order),-10);
  const newItem = Object.assign({
    id: uid(), detail:'', dueDate:'', order: maxOrder+10, createdAt: new Date().toISOString()
  }, data);
  state.items.push(newItem);
  refreshViews();
  const { error } = await supabase.from(TABLE).insert([itemToRow(newItem)]);
  if(error) showBanner('No se pudo guardar el nuevo accionable: ' + error.message);
  else { state.lastSyncedAt = new Date(); hideBanner(); }
  cacheLocal();
  renderSyncStatus();
}

async function updateItem(id, data){
  const item = state.items.find(i=>i.id===id);
  if(!item) return;
  Object.assign(item, data);
  refreshViews();
  const { error } = await supabase.from(TABLE).update(itemToRow(item)).eq('id', id);
  if(error) showBanner('No se pudo guardar el cambio: ' + error.message);
  else { state.lastSyncedAt = new Date(); hideBanner(); }
  cacheLocal();
  renderSyncStatus();
}

async function deleteItem(id){
  state.items = state.items.filter(i=>i.id!==id);
  refreshViews();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if(error) showBanner('No se pudo borrar en la base de datos: ' + error.message);
  else { state.lastSyncedAt = new Date(); hideBanner(); }
  cacheLocal();
  renderSyncStatus();
}

async function moveItem(id, newStatus, newIndexInColumn){
  const item = state.items.find(i=>i.id===id);
  if(!item) return;
  item.status = newStatus;
  const colItems = state.items.filter(i=>i.status===newStatus && i.id!==id).sort((a,b)=>a.order-b.order);
  colItems.splice(newIndexInColumn, 0, item);
  colItems.forEach((it,idx)=>{ it.order = idx*10; });
  refreshViews();
  const { error } = await supabase.from(TABLE).upsert(colItems.map(itemToRow));
  if(error) showBanner('No se pudo guardar el nuevo orden: ' + error.message);
  else { state.lastSyncedAt = new Date(); hideBanner(); }
  cacheLocal();
  renderSyncStatus();
}

async function nudgeItem(id, dir){
  const item = state.items.find(i=>i.id===id);
  if(!item) return;
  const col = state.items.filter(i=>i.status===item.status).sort((a,b)=>a.order-b.order);
  const idx = col.findIndex(i=>i.id===id);
  const swapIdx = idx+dir;
  if(swapIdx<0 || swapIdx>=col.length) return;
  const tmp = col[idx].order;
  col[idx].order = col[swapIdx].order;
  col[swapIdx].order = tmp;
  refreshViews();
  const { error } = await supabase.from(TABLE).upsert([col[idx], col[swapIdx]].map(itemToRow));
  if(error) showBanner('No se pudo guardar el nuevo orden: ' + error.message);
  else { state.lastSyncedAt = new Date(); hideBanner(); }
  cacheLocal();
  renderSyncStatus();
}

/* ============================================================
   REALTIME — así se ven los cambios de Laura/Mario en vivo
   ============================================================ */
function subscribeRealtime(){
  supabase
    .channel('plan_items_changes')
    .on('postgres_changes', { event:'*', schema:'public', table: TABLE }, (payload)=>{
      if(payload.eventType === 'INSERT' || payload.eventType === 'UPDATE'){
        const incoming = rowToItem(payload.new);
        const idx = state.items.findIndex(i=>i.id===incoming.id);
        if(idx>=0) state.items[idx] = incoming; else state.items.push(incoming);
      } else if(payload.eventType === 'DELETE'){
        state.items = state.items.filter(i=>i.id !== payload.old.id);
      }
      cacheLocal();
      refreshViews();
      state.lastSyncedAt = new Date();
      renderSyncStatus();
    })
    .subscribe((status)=>{
      if(status === 'SUBSCRIBED'){ state.online = true; }
      else if(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED'){ state.online = false; }
      renderSyncStatus();
    });
}

/* ============================================================
   RENDER: TOPBAR / SYNC / HERO
   ============================================================ */
function renderSyncStatus(){
  const pill = document.getElementById('syncPill');
  const text = document.getElementById('syncPillText');
  const footer = document.getElementById('lastSyncedFooter');
  pill.dataset.state = state.online ? 'synced' : 'offline';
  text.textContent = state.online ? 'conectado en vivo' : 'sin conexión';
  if(state.lastSyncedAt){
    footer.textContent = 'Última actualización: ' + state.lastSyncedAt.toLocaleString('es-CO');
  } else {
    footer.textContent = 'Conectando…';
  }
}

function renderMonths(){
  const row = document.getElementById('monthsRow');
  row.innerHTML = '';
  const names = ['Ago','Sep','Oct','Nov','Dic'];
  const monthIdx = [7,8,9,10,11];
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
  const editable = canEdit();
  const card = el('li','card');
  card.draggable = editable;
  card.dataset.id = item.id;
  card.style.borderLeftColor = 'var(--' + (item.priority||'media') + ')';

  const top = el('div','card-top');
  const title = el('div','card-title', item.title);
  top.appendChild(title);
  if(editable){
    const actions = el('div','card-actions');
    const editBtn = el('button','mini-btn'); editBtn.innerHTML = '✎'; editBtn.title='Editar'; editBtn.type='button';
    editBtn.addEventListener('click', (e)=>{ e.stopPropagation(); openCardModal(item); });
    const delBtn = el('button','mini-btn'); delBtn.innerHTML = '✕'; delBtn.title='Eliminar'; delBtn.type='button';
    delBtn.addEventListener('click', (e)=>{ e.stopPropagation(); if(confirm('¿Eliminar "'+item.title+'"?')) deleteItem(item.id); });
    actions.appendChild(editBtn); actions.appendChild(delBtn);
    top.appendChild(actions);
  }
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

  if(editable){
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

    card.addEventListener('dragstart', ()=>{
      card.classList.add('dragging');
      dragState.id = item.id;
    });
    card.addEventListener('dragend', ()=>{
      card.classList.remove('dragging');
      dragState.id = null;
      document.querySelectorAll('.column-list').forEach(c=>c.classList.remove('drag-over'));
    });
  }

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
function populateSelect(sel, dict){
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

  const identitySelect = document.getElementById('identitySelect');
  identitySelect.value = loadIdentity();
  identitySelect.addEventListener('change', ()=>{
    saveIdentity(identitySelect.value);
    updateEditModeUI();
    renderBoard();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ closeCardModal(); }
  });
}

/* ============================================================
   RENDER ALL / INIT
   ============================================================ */
function renderAll(){
  updateEditModeUI();
  renderFilters();
  renderStats();
  renderBoard();
  renderMonths();
  renderSyncStatus();
}

async function init(){
  bindStaticUI();
  await loadAll();
  await ensureSeeded();
  renderAll();
  subscribeRealtime();
}

init();

})();
