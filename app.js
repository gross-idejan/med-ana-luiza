/* Cuidar · uma aplicação estática, sem bibliotecas e sem envio de registros à rede.
   Fonte da rotina: horários fornecidos pela família. Confirme-os com a prescrição clínica. */
(() => {
  'use strict';
  const STORAGE_KEY = 'cuidar_ana_local_v1';
  const DAYS = 5;
  const $ = selector => document.querySelector(selector);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const pad = n => String(n).padStart(2, '0');
  const nowTime = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const localDate = date => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const parseDate = value => { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || ''); if (!match) return null; const d = new Date(+match[1], +match[2]-1, +match[3], 12); return d.getFullYear() === +match[1] && d.getMonth() === +match[2]-1 && d.getDate() === +match[3] ? d : null; };
  const datePlus = (value, offset) => { const d = parseDate(value); if (!d) return ''; d.setDate(d.getDate()+offset); return localDate(d); };
  const dateLong = date => { const d = parseDate(date); return d ? new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(d) : '—'; };
  const dateShort = date => { const d = parseDate(date); return d ? new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(d).replace('.','') : '—'; };
  const dateWeek = date => { const d = parseDate(date); return d ? new Intl.DateTimeFormat('pt-BR',{weekday:'long'}).format(d) : ''; };
  const timeOf = time => (time.match(/\d\d:\d\d/) || [])[0] || '00:00';
  const mkItem = (id, name, detail='', kind='medicine', optional=false) => ({id, name, detail, kind, optional});
  const mkSlot = (id, time, title, description, items, choice=false) => ({id,time,title,description,items,choice});

  // Mantém exatamente as informações fornecidas: sem completar doses não informadas.
  // O Dia 5 repete o Dia 4, retirando fexofenadina/cetoprofeno e tornando dipirona SOS.
  function scheduleFor(day) {
    if (day === 1) return [
      mkSlot('chemo','08:00–15:00','Sessão de quimioterapia','Atendimento na clínica, das 08h às 15h.',[
        mkItem('quimio','Sessão de quimioterapia','Registrar a realização da sessão.','session')]),
      mkSlot('17','17:00','Fim da tarde','',[
        mkItem('ond-17','Ondansetrona')]),
      mkSlot('19','19:00','Início da noite','',[
        mkItem('dramin-19','Dramin B6')]),
      mkSlot('21','21:00','Antes de dormir','',[
        mkItem('olanz-21','Olanzapina','2 comprimidos')])
    ];
    if (day === 2) return [
      mkSlot('0730','07:30','Antes do café da manhã','',[
        mkItem('panto-0730','Pantoprazol')]),
      mkSlot('08','08:00','Café da manhã e medicamentos','Comer e tomar os medicamentos listados conforme a prescrição.',[
        mkItem('comer-08','Comer','Refeição antes/junto do horário indicado.','food'),
        mkItem('venla-08','Venlafaxina'),
        mkItem('etna-08','Etna'),
        mkItem('ond-08','Ondansetrona'),
        mkItem('dexa-08','Dexametasona')]),
      mkSlot('10','10:00','Meio da manhã','',[
        mkItem('dramin-10','Dramin B6')]),
      mkSlot('12','12:00','Meio-dia','',[
        mkItem('plasil-12','Plasil')]),
      mkSlot('14','14:00','Início da tarde','',[
        mkItem('ond-14','Ondansetrona'),
        mkItem('dexa-14','Dexametasona')]),
      mkSlot('16','16:00','Meio da tarde','',[
        mkItem('dramin-16','Dramin B6')]),
      mkSlot('18','18:00','Fim da tarde','',[
        mkItem('plasil-18','Plasil')]),
      mkSlot('20','20:00','Medicações da noite','O último item deste horário tem duas alternativas conforme orientação recebida.',[
        mkItem('dip-20','Dipirona','1 g'),
        mkItem('fexo-20','Fexofenadina')],true),
      mkSlot('22','22:00','Antes de dormir','Olanzapina somente se as duas unidades não foram tomadas às 20h.',[
        mkItem('olanz-22','Olanzapina','2 comprimidos; apenas caso ainda não tenha tomado às 20h')])
    ];
    const is5 = day === 5;
    return [
      mkSlot('07','07:00','Antes do café da manhã','',[
        mkItem('panto-07','Pantoprazol')]),
      mkSlot('0730','07:30','Alimentação da manhã',is5?'Cetoprofeno retirado no Dia 5.':'Comer e tomar o anti-inflamatório conforme a prescrição.',[
        mkItem('comer-0730','Comer','Fazer a refeição.','food'),
        ...(!is5 ? [mkItem('ceto-0730','Cetoprofeno','Anti-inflamatório; junto à alimentação.')] : [])]),
      mkSlot('08','08:00','Medicamentos da manhã','',[
        mkItem('venla-08','Venlafaxina'),
        mkItem('etna-08','Etna'),
        mkItem('ond-08','Ondansetrona'),
        mkItem('dexa-08','Dexametasona')]),
      mkSlot('10','10:00','Meio da manhã',is5?'Dipirona apenas se houver dor.':'',[
        mkItem('dramin-10','Dramin B6'),
        mkItem('dip-10','Dipirona','1 g'+(is5?' · somente se houver dor':''),'medicine',is5)]),
      mkSlot('12','12:00','Meio-dia','',[
        mkItem('plasil-12','Plasil')]),
      mkSlot('14','14:00','Início da tarde',is5?'Dipirona apenas se houver dor.':'',[
        mkItem('ond-14','Ondansetrona'),
        mkItem('dexa-14','Dexametasona'),
        mkItem('dip-14','Dipirona','500 mg'+(is5?' · somente se houver dor':''),'medicine',is5)]),
      mkSlot('16','16:00','Meio da tarde','',[
        mkItem('dramin-16','Dramin B6')]),
      mkSlot('18','18:00','Fim da tarde','',[
        mkItem('plasil-18','Plasil')]),
      mkSlot('20','20:00','Medicações da noite',is5?'Sem fexofenadina. Dipirona apenas se houver dor.':'O último item deste horário tem duas alternativas conforme orientação recebida.',[
        mkItem('dip-20','Dipirona','1 g'+(is5?' · somente se houver dor':''),'medicine',is5),
        ...(!is5 ? [mkItem('fexo-20','Fexofenadina')] : [])],true),
      mkSlot('22','22:00','Antes de dormir','Olanzapina somente se as duas unidades não foram tomadas às 20h.',[
        mkItem('olanz-22','Olanzapina','2 comprimidos; apenas caso ainda não tenha tomado às 20h')])
    ];
  }

  function emptyState() { return {schema:1,caregiver:'',cycles:[],activeCycleId:null}; }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!raw || raw.schema !== 1 || !Array.isArray(raw.cycles)) return emptyState();
      raw.cycles = raw.cycles.filter(c => c && typeof c.id === 'string' && parseDate(c.startDate) && c.records && typeof c.records === 'object').slice(0,100);
      raw.caregiver = typeof raw.caregiver === 'string' ? raw.caregiver.slice(0,60) : '';
      if (!raw.cycles.some(c => c.id === raw.activeCycleId)) raw.activeCycleId = raw.cycles.at(-1)?.id || null;
      return raw;
    } catch(error) { console.warn('Não foi possível ler os registros locais:',error); return emptyState(); }
  }
  let state = load();
  let selectedDay = 1;
  let toastTimer;
  const active = () => state.cycles.find(c => c.id === state.activeCycleId) || null;
  const recordKey = (day, id) => `${day}:${id}`;
  const getRecord = (cycle, day, id) => cycle.records[recordKey(day,id)] || null;
  const choice20 = (cycle,day) => getRecord(cycle,day,'choice-20');
  const olanzAt20 = (cycle,day) => day > 1 && choice20(cycle,day)?.status === 'done' && choice20(cycle,day)?.choice === 'olanzapina';
  const isDone = record => record && (record.status === 'done' || record.status === 'skipped');

  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3300);
  }
  function save(message=false) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); if (message) toast('Registro salvo neste aparelho.'); return true; }
    catch(error) { alert('Não foi possível salvar os dados neste navegador. Verifique o espaço disponível e faça um backup.'); console.error(error); return false; }
  }
  function newCycle(date) {
    if (!parseDate(date)) return false;
    const id = `ciclo-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    state.cycles.push({id,startDate:date,createdAt:new Date().toISOString(),records:{},notes:{}});
    state.activeCycleId = id;
    selectedDay = dateToDay(date);
    save(); render(); return true;
  }
  function dateToDay(startDate) {
    const today = localDate(new Date());
    for(let d=1;d<=DAYS;d++) if(datePlus(startDate,d-1)===today) return d;
    return (parseDate(today) < parseDate(startDate)) ? 1 : DAYS;
  }
  function dayStats(cycle,day) {
    let total=0, recorded=0, done=0, skipped=0;
    for(const slot of scheduleFor(day)) {
      for(const item of slot.items) {
        if (item.optional || (item.id === 'olanz-22' && olanzAt20(cycle,day))) continue;
        total++;
        const r = getRecord(cycle,day,item.id);
        if (isDone(r)) { recorded++; if(r.status==='done') done++; else skipped++; }
      }
      if(slot.choice) {
        total++;
        const r = choice20(cycle,day);
        if(isDone(r)) { recorded++; if(r.status==='done') done++; else skipped++; }
      }
    }
    return {total,recorded,done,skipped,percent:total?Math.round(100*recorded/total):0};
  }
  function findNext(cycle,day) {
    const today = localDate(new Date());
    if(datePlus(cycle.startDate,day-1)!==today) return null;
    const clock = nowTime();
    for(const slot of scheduleFor(day)) {
      if(timeOf(slot.time) < clock) continue;
      const pending = slot.items.some(i => !i.optional && !(i.id==='olanz-22'&&olanzAt20(cycle,day)) && !isDone(getRecord(cycle,day,i.id)));
      const pendingChoice = slot.choice && !isDone(choice20(cycle,day));
      if(pending || pendingChoice) return {time:timeOf(slot.time),title:slot.title};
    }
    return null;
  }
  function render() {
    const cycle = active();
    $('#setupSection').hidden = !!cycle;
    $('#dashboard').hidden = !cycle;
    if (!cycle) { $('#setupDate').value = localDate(new Date()); return; }
    if(selectedDay<1||selectedDay>DAYS) selectedDay=dateToDay(cycle.startDate);
    renderTabs(cycle); renderSummary(); renderTimeline(cycle); renderSidebar(cycle);
  }
  function renderTabs(cycle) {
    $('#cyclePeriod').textContent = `${dateShort(cycle.startDate)} – ${dateShort(datePlus(cycle.startDate,4))}`;
    const today = localDate(new Date());
    $('#dayTabs').innerHTML = Array.from({length:DAYS},(_,i)=> {
      const d=i+1, date=datePlus(cycle.startDate,i), s=dayStats(cycle,d), isToday=date===today;
      return `<button type="button" role="tab" class="day-tab" data-day="${d}" aria-selected="${d===selectedDay}" aria-label="Dia ${d}, ${safe(dateLong(date))}, ${s.recorded} de ${s.total} registros">
        <span class="day-label">Dia ${d} ${isToday?'<span class="day-current">• Hoje</span>':''}</span>
        <span class="day-date">${safe(dateShort(date))} · ${safe(dateWeek(date))}</span>
        <span class="day-track" aria-hidden="true"><span style="width:${s.percent}%"></span></span>
      </button>`;
    }).join('');
  }
  function renderSummary() {
    const cycle=active(); if(!cycle) return;
    const stats=dayStats(cycle,selectedDay);
    const date = datePlus(cycle.startDate,selectedDay-1);
    $('#summaryDay').textContent=`Dia ${selectedDay}`;
    $('#summaryDate').textContent=dateLong(date);
    $('#summaryCount').innerHTML=`${stats.recorded} <small>/ ${stats.total}</small>`;
    $('#summaryStatus').textContent=stats.recorded===0?'Aguardando registros':stats.recorded===stats.total?(stats.skipped?'Todos os itens registrados':'Registros completos'):`${stats.total-stats.recorded} itens ainda sem registro`;
    $('#summaryProgress').style.setProperty('--progress',`${stats.percent}%`);
    $('#progressPercent').textContent=`${stats.percent}%`;
    const next=findNext(cycle,selectedDay);
    $('#summaryNext').textContent=next?.time || '—';
    $('#summaryNextLabel').textContent=next?.title || (date===localDate(new Date())?'Nenhum próximo horário previsto':'Consulte a agenda do dia');
    $('#dayFinished').hidden = stats.recorded !== stats.total;
  }
  const getTimeLabel = record => record?.takenTime ? `Horário informado: ${record.takenTime}` : '';
  function statusLabel(slot,cycle,day) {
    let total=0,registered=0, skipped=0;
    for(const i of slot.items) {
      if(i.optional || (i.id==='olanz-22'&&olanzAt20(cycle,day))) continue;
      total++;
      const r=getRecord(cycle,day,i.id);
      if(isDone(r)){ registered++; if(r.status==='skipped') skipped++; }
    }
    if(slot.choice){total++;const r=choice20(cycle,day);if(isDone(r)){registered++;if(r.status==='skipped')skipped++;}}
    if(!total) return {text:'Condicional',style:'state-complete'};
    if(registered===total) return {text:skipped?'Registrado':'Concluído',style:'state-complete'};
    if(registered) return {text:`${registered}/${total} registrados`,style:'state-partial'};
    return {text:'Pendente',style:''};
  }
  function renderItem(cycle,day,item) {
    const r=getRecord(cycle,day,item.id);
    const blocked = item.id==='olanz-22' && olanzAt20(cycle,day);
    if(blocked) return `<div class="action-row"><span class="action-icon">♡</span><div class="action-info"><div class="action-name">${safe(item.name)} · ${safe(item.detail)}</div><div class="blocked-note">Já consta o registro das <strong>2 olanzapinas às 20h</strong>. Esta opção fica bloqueada para evitar registro duplicado. Para corrigir, desfaça antes a seleção das 20h.</div></div></div>`;
    const icon=item.kind==='food'?'☕':item.kind==='session'?'✚':'✦';
    const iconClass=item.kind==='food'?'icon-food':item.kind==='session'?'icon-session':'';
    const done=r?.status==='done',skipped=r?.status==='skipped';
    const statusText=done?'✓ Registrado':skipped?(item.optional?'Não necessário':'Não administrado'):'✓ Registrar';
    const how = done?`<div class="record-info">${safe(getTimeLabel(r))}${r.by?' · '+safe(r.by):''}</div>`:skipped?`<div class="action-detail">Marcado como não administrado${r.by?' por '+safe(r.by):''}.</div>`:'';
    return `<div class="action-row ${item.optional?'is-optional':''}">
      <span class="action-icon ${iconClass}" aria-hidden="true">${icon}</span>
      <div class="action-info"><div class="action-name">${safe(item.name)} ${item.optional?'<span class="optional-tag">· se houver dor</span>':''}</div>${item.detail?`<div class="action-detail">${safe(item.detail)}</div>`:''}${how}</div>
      <div class="row-actions"><button type="button" class="mark-button ${done?'done':skipped?'skipped':''}" data-action="mark" data-id="${safe(item.id)}" aria-label="${done?'Desfazer registro de':'Registrar'} ${safe(item.name)}">${statusText}</button>
      <button type="button" class="more-button" data-action="${done?'time':skipped?'clear':'skip'}" data-id="${safe(item.id)}">${done?'Editar hora':skipped?'Desfazer':'Não dado'}</button></div>
    </div>`;
  }
  function renderChoice(cycle,day) {
    const record=choice20(cycle,day);
    const chosen=record?.status==='done'?record.choice:null;
    const olanz22=getRecord(cycle,day,'olanz-22')?.status==='done';
    return `<div class="choice-block"><p class="choice-title">Uma das duas alternativas das 20h</p>
      <p class="choice-desc">Registrar <strong>ondansetrona OU 2 comprimidos de olanzapina</strong> conforme o que foi efetivamente administrado e orientado. Não registrar as duas alternativas neste mesmo horário.</p>
      <div class="choice-options">
        <button type="button" data-action="choice" data-value="ondansetrona" class="choice-option ${chosen==='ondansetrona'?'is-chosen':''}">◉ Ondansetrona<small>${chosen==='ondansetrona'?'✓ Alternativa registrada':'Registrar esta opção'}</small></button>
        <button type="button" data-action="choice" data-value="olanzapina" class="choice-option ${chosen==='olanzapina'?'is-chosen':''}" ${olanz22?'disabled title="Olanzapina já registrada às 22h"':''}>◉ Olanzapina<small>2 comprimidos ${chosen==='olanzapina'?'· ✓ registrada':'· alternativa para dormir'}</small></button>
      </div>${chosen||record?.status==='skipped'?`<div class="choice-meta"><span>${chosen?`✓ ${safe(chosen==='olanzapina'?'Olanzapina (2 comp.)':'Ondansetrona')}${record.takenTime?' · '+safe(record.takenTime):''}`:'Sem alternativa administrada'}</span><span><button class="choice-clear" type="button" data-action="${chosen?'choice-time':'choice-clear'}">${chosen?'Editar hora':'Desfazer'}</button> · <button class="choice-clear" type="button" data-action="choice-clear">Limpar</button></span></div>`:`<div class="choice-meta"><span>Escolha somente após a administração.</span><button class="choice-clear" type="button" data-action="choice-skip">Nenhuma administrada</button></div>`}
      ${olanz22?'<p class="action-detail">A olanzapina já foi registrada às 22h. Para corrigir esse registro, desfaça-o antes.</p>':''}
    </div>`;
  }
  function renderTimeline(cycle) {
    const day=selectedDay, date=datePlus(cycle.startDate,day-1), weekday=dateWeek(date);
    $('#daySubheading').textContent=`${weekday.toUpperCase()} · ${dateLong(date).toUpperCase()}`;
    $('#scheduleTitle').textContent=day===1?'Dia 1 · Quimioterapia':`Dia ${day} · Cuidados em casa`;
    $('#dayIntro').textContent=day===1?'Sessão e cuidados previstos para o primeiro dia.':day===5?'Dia 5: sem fexofenadina e cetoprofeno; dipirona apenas se houver dor.':'Registre cada medicamento separadamente, mesmo quando vários estiverem no mesmo horário.';
    const currentDay=date===localDate(new Date()), clock=nowTime();
    $('#timeline').innerHTML=scheduleFor(day).map(slot=>{
      const progress=statusLabel(slot,cycle,day);
      const inPast=currentDay&&timeOf(slot.time)<clock;
      return `<div class="time-block ${inPast?'in-past':''}"><div class="time-column"><span class="time-bubble">${safe(slot.time)}</span></div>
      <article class="time-card"><header class="time-card-head"><div><h3 class="time-card-title">${safe(slot.title)}</h3>${slot.description?`<p class="time-card-desc">${safe(slot.description)}</p>`:''}</div><span class="time-state ${progress.style}">${safe(progress.text)}</span></header>
      ${slot.items.map(i=>renderItem(cycle,day,i)).join('')}
      ${slot.choice?renderChoice(cycle,day):''}</article></div>`;
    }).join('');
  }
  function renderSidebar(cycle) {
    $('#dayNotes').value=typeof cycle.notes?.[selectedDay]==='string'?cycle.notes[selectedDay]:'';
    const history=[];
    for(let day=1;day<=DAYS;day++) {
      for(const slot of scheduleFor(day)) {
        for(const item of slot.items) {
          const r=getRecord(cycle,day,item.id);
          if(isDone(r)) history.push({day,label:item.name+(item.detail&&item.name==='Dipirona'?' ('+item.detail.split(' ·')[0]+')':''),record:r});
        }
        if(slot.choice) {
          const r=choice20(cycle,day);
          if(isDone(r)) history.push({day,label:r.status==='done'?(r.choice==='olanzapina'?'Olanzapina (2 comp.)':'Ondansetrona'):'Alternativas das 20h',record:r});
        }
      }
    }
    history.sort((a,b)=>new Date(b.record.recordedAt||0)-new Date(a.record.recordedAt||0));
    $('#recentHistory').innerHTML=history.length?history.slice(0,7).map(h=>{
      const date=h.record.recordedAt?new Date(h.record.recordedAt):null;
      const regTime=date&&!isNaN(date.getTime())?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(date):'—';
      return `<div class="history-item ${h.record.status==='skipped'?'skipped':''}"><span class="history-bullet"></span><div><div class="history-title">${safe(h.label)} · Dia ${h.day}</div><div class="history-sub">${h.record.status==='done'?'Registrado':'Não administrado'} · ${safe(regTime)}${h.record.by?' · '+safe(h.record.by):''}</div></div></div>`;
    }).join(''):'<p class="recent-empty">Os primeiros registros aparecerão aqui, com data e responsável.</p>';
  }
  function refresh() { save(); render(); }
  function putRecord(id, status, extras={}) {
    const c=active(); if(!c) return;
    const key=recordKey(selectedDay,id);
    c.records[key]={status,recordedAt:new Date().toISOString(),by:state.caregiver.trim()||'Cuidador(a)',...(status==='done'?{takenTime:nowTime()}:{}),...extras};
    refresh();
  }
  function clearRecord(id) { const c=active();if(!c)return;delete c.records[recordKey(selectedDay,id)];refresh(); }
  function editTime(id) {
    const c=active(),r=getRecord(c,selectedDay,id);if(!r||r.status!=='done')return;
    const response=prompt('Informe o horário real da administração, no formato HH:MM. O registro é do dia selecionado.',r.takenTime||nowTime());
    if(response===null)return;
    const value=response.trim();
    if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)){alert('Horário inválido. Use HH:MM, por exemplo 08:35.');return;}
    r.takenTime=value;r.recordedAt=new Date().toISOString();r.by=state.caregiver.trim()||r.by||'Cuidador(a)';refresh();
    toast('Horário real atualizado.');
  }
  function handleMark(id) {
    const c=active();if(!c)return;
    if(id==='olanz-22'&&olanzAt20(c,selectedDay)){alert('As duas olanzapinas já estão registradas às 20h. Corrija o registro das 20h antes de adicionar outro.');return;}
    const r=getRecord(c,selectedDay,id);
    if(r?.status==='done') {
      if(confirm('Deseja desfazer este registro de administração?')) clearRecord(id);
      return;
    }
    if(r?.status==='skipped'&&!confirm('Alterar de “não administrado” para “administrado”?'))return;
    putRecord(id,'done');toast('Registro realizado. Se necessário, ajuste a hora real em “Editar hora”.');
  }
  function handleSkip(id) {
    const c=active();const r=getRecord(c,selectedDay,id);
    if(r?.status==='done'&&!confirm('Este item já está registrado como administrado. Substituir por “não administrado”?'))return;
    putRecord(id,'skipped');toast('Registrado como não administrado.');
  }
  function handleChoice(value) {
    const c=active(),r=choice20(c,selectedDay);
    if(value==='olanzapina'&&getRecord(c,selectedDay,'olanz-22')?.status==='done') { alert('Já existe registro de olanzapina às 22h. Desfaça esse registro antes de escolher olanzapina às 20h.');return; }
    if(r?.status==='done'&&r.choice===value){toast('Essa alternativa já está registrada. Para alterar, use “Editar hora” ou “Limpar”.');return;}
    if(r?.status==='done'&&!confirm('Substituir o registro anterior da alternativa das 20h?'))return;
    const label=value==='olanzapina'?'2 comprimidos de olanzapina':'ondansetrona';
    if(!confirm(`Confirmar: ${label} foi realmente administrada às 20h (ou em outro horário, que pode ser ajustado depois)?`))return;
    putRecord('choice-20','done',{choice:value});
    toast('Alternativa registrada. Confira o horário real da administração.');
  }
  $('#timeline').addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');if(!button)return;
    const action=button.dataset.action,id=button.dataset.id;
    if(action==='mark')handleMark(id);
    else if(action==='skip')handleSkip(id);
    else if(action==='time')editTime(id);
    else if(action==='clear')clearRecord(id);
    else if(action==='choice')handleChoice(button.dataset.value);
    else if(action==='choice-time')editTime('choice-20');
    else if(action==='choice-clear'){if(confirm('Limpar o registro da alternativa das 20h?'))clearRecord('choice-20');}
    else if(action==='choice-skip')putRecord('choice-20','skipped');
  });
  $('#dayTabs').addEventListener('click',event=>{
    const btn=event.target.closest('[data-day]');if(!btn)return;
    selectedDay=Number(btn.dataset.day);render();
    $('#dayTabs').querySelector(`[data-day="${selectedDay}"]`)?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
  });
  $('#todayButton').addEventListener('click',()=>{
    const c=active();if(!c)return;
    const today=localDate(new Date());
    for(let day=1;day<=DAYS;day++) if(datePlus(c.startDate,day-1)===today){selectedDay=day;render();return;}
    toast('A data de hoje está fora dos cinco dias deste ciclo. Para iniciar outro, use Configurações.');
  });
  $('#dayNotes').addEventListener('input',event=>{
    const c=active();if(!c)return;
    if(!c.notes)c.notes={};c.notes[selectedDay]=event.target.value;
    save();
  });
  $('#setupForm').addEventListener('submit',event=>{
    event.preventDefault();
    const date=$('#setupDate').value;
    if(!parseDate(date)){alert('Escolha uma data válida para o Dia 1.');return;}
    state.caregiver=$('#setupCaregiver').value.trim().slice(0,60);newCycle(date);
    toast('Acompanhamento iniciado. Os dados serão salvos neste aparelho.');
  });
  $('#settingsButton').addEventListener('click',()=>{
    const c=active();
    $('#caregiverName').value=state.caregiver;
    $('#cycleStartDate').value=c?.startDate||localDate(new Date());
    $('#newCycleDate').value=localDate(new Date());
    $('#cyclePicker').innerHTML=state.cycles.length?state.cycles.map((cycle,i)=>`<option value="${safe(cycle.id)}" ${cycle.id===state.activeCycleId?'selected':''}>Ciclo ${i+1} · ${safe(dateLong(cycle.startDate))}</option>`).join(''):'<option value="">Sem ciclo iniciado</option>';
    $('#settingsDialog').showModal();
  });
  $('#saveSettings').addEventListener('click',()=>{
    const date=$('#cycleStartDate').value,c=active();
    if(c&&!parseDate(date)){alert('Escolha uma data inicial válida.');return;}
    state.caregiver=$('#caregiverName').value.trim().slice(0,60);
    if(c)c.startDate=date;
    save();render();$('#settingsDialog').close();toast('Configurações salvas.');
  });
  $('#cyclePicker').addEventListener('change',event=>{
    if(!state.cycles.some(c=>c.id===event.target.value))return;
    state.activeCycleId=event.target.value;
    selectedDay=dateToDay(active().startDate);save();render();
    $('#cycleStartDate').value=active().startDate;
    toast('Ciclo selecionado.');
  });
  $('#newCycleButton').addEventListener('click',()=>{
    const date=$('#newCycleDate').value;if(!parseDate(date)){alert('Escolha uma data válida.');return;}
    const same=state.cycles.find(c=>c.startDate===date);
    if(same){if(confirm('Já existe um ciclo iniciado nessa data. Deseja abri-lo?')){state.activeCycleId=same.id;selectedDay=dateToDay(date);save();render();$('#settingsDialog').close();}return;}
    if(!confirm('Iniciar um novo ciclo com data de início '+dateLong(date)+'? Os registros dos ciclos anteriores serão preservados.'))return;
    newCycle(date);$('#settingsDialog').close();toast('Novo ciclo criado, sem apagar os anteriores.');
  });
  $('#printButton').addEventListener('click',()=>window.print());
  function exportBackup() {
    if(!state.cycles.length){toast('Inicie um acompanhamento antes de exportar.');return;}
    const data={...state,exportedAt:new Date().toISOString(),type:'cuidar-ana-backup'};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`backup-cuidados-ana-${localDate(new Date())}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('Backup baixado. Guarde o arquivo em local privado.');
  }
  $('#exportQuick').addEventListener('click',exportBackup);
  $('#downloadBackup').addEventListener('click',exportBackup);
  $('#importBackup').addEventListener('click',()=>$('#backupFileInput').click());
  $('#backupFileInput').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    if(file.size>2_000_000){alert('Arquivo muito grande para um backup do Cuidar.');return;}
    try{
      const parsed=JSON.parse(await file.text());
      if(parsed.type!=='cuidar-ana-backup'||parsed.schema!==1||!Array.isArray(parsed.cycles)||parsed.cycles.length>100||!parsed.cycles.every(c=>c&&typeof c.id==='string'&&parseDate(c.startDate)&&c.records&&typeof c.records==='object'))throw new Error('Formato inválido');
      if(!confirm('Restaurar este backup? Isso SUBSTITUIRÁ todos os ciclos e registros que estão neste aparelho. Considere baixar o backup atual antes de continuar.'))return;
      state={schema:1,caregiver:String(parsed.caregiver||'').slice(0,60),cycles:parsed.cycles.map(c=>({id:c.id,startDate:c.startDate,createdAt:c.createdAt||'',records:c.records,notes:c.notes&&typeof c.notes==='object'?c.notes:{}})),activeCycleId:parsed.activeCycleId};
      if(!state.cycles.some(c=>c.id===state.activeCycleId))state.activeCycleId=state.cycles.at(-1)?.id||null;
      selectedDay=active()?dateToDay(active().startDate):1;
      save();render();$('#settingsDialog').close();toast('Backup restaurado. Confira os dados na agenda.');
    }catch(error){alert('Não foi possível restaurar. Selecione um arquivo JSON de backup gerado pelo Cuidar.');console.warn(error);}
  });
  const photo=$('#portraitImage');
  photo.addEventListener('load',()=>{photo.hidden=false;$('#portraitFallback').hidden=true;});
  photo.addEventListener('error',()=>{photo.hidden=true;$('#portraitFallback').hidden=false;});
  if(photo.complete&&photo.naturalWidth){photo.hidden=false;$('#portraitFallback').hidden=true;}
  render();
  setInterval(()=>{if(active())renderSummary();},60_000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&active())renderSummary();});
  if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Offline não disponível:',error)));
})();
